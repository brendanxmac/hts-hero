import type { SupabaseClient } from "@supabase/supabase-js"
import { checkCases } from "./checks"
import { checkScopeCodes } from "./claude"
import { FederalRegisterOutOfTime } from "./fr"
import { htsCodes, scopeOf } from "./parse"
import type { CaseRow } from "./types"
import type { Budget } from "./usage"

// ITA's public case pages (beta.trade.gov/adcvd?adcvdcase=A-570-137): each case's HTS list and its
// current scope text, a second source of scope codes beside the Federal Register. It catches what
// the notices get wrong or leave stale: R-125's order printed 2903.49.1010, a code that never
// existed (ITA has 2903.44.10.10), and orders older than an HS revision keep their old codes in
// every notice while ITA's scope text has the new ones (HFC blends: 3824.78 → 3827.6x). ITA's own
// list can be stale too, so the codes are merged and checked against the current HTS in codes.ts.
// No AI to read the page. Its scope is sorted like a Federal Register one: regex, then Sonnet when
// it names "may also" or excluded codes (a regex alone excludes a whole paragraph's codes when the
// paragraph mentions an exclusion: R-32's own code). One request at a time, a second apart.

type Db = SupabaseClient

export const itaUrl = (caseNumber: string) => `https://beta.trade.gov/adcvd?adcvdcase=${caseNumber}`
const USER_AGENT = "Mozilla/5.0 (compatible; HTSHeroTariffUpdates/1.0; +https://htshero.com/tariff-updates)"
const MIN_GAP_MS = 1_000
// A case's page is read again after this long
export const ITA_STALE_DAYS = 30

let last = 0
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const decode = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")

export interface ItaPage {
  found: boolean
  hts: string[]
  scope: string | null
}

// A missing case still gets a page, with an empty "Case #"
export const parseItaPage = (html: string): ItaPage => {
  if (!/Case #\s*[AC]-\d{3}-\d{3}/.test(decode(html))) return { found: false, hts: [], scope: null }
  const grid = html.match(/id="hts"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)?.[0] ?? ""
  const hts = Array.from(new Set(Array.from(grid.matchAll(/hts-item">\s*([\d.]+)\s*</g), (m) => m[1].replace(/\D/g, "")).filter((c) => c.length >= 4)))
  const scope = html.match(/scope-text">([\s\S]*?)<\/div>/)?.[1]
  const text = scope ? decode(scope).replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*/g, "\n\n").trim() : ""
  return { found: true, hts, scope: text || null }
}

export const fetchItaPage = async (caseNumber: string): Promise<ItaPage> => {
  const gap = last + MIN_GAP_MS - Date.now()
  if (gap > 0) await wait(gap)
  last = Date.now()
  const response = await fetch(itaUrl(caseNumber), { headers: { "User-Agent": USER_AGENT }, cache: "no-store", signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`ITA answered ${response.status} for ${caseNumber}`)
  return parseItaPage(await response.text())
}

type Sorted = Pick<CaseRow, "ita_main" | "ita_also" | "ita_excluded" | "ita_method">

// The scope's codes sorted: ITA's text has no "Scope of the Order" heading of its own
const sortScope = async (caseNumber: string, scope: string | null, budget: Budget): Promise<Sorted> => {
  const text = scope && htsCodes(scope).length ? `Scope of the Order\n\n${scope}` : null
  const regex = text ? scopeOf(text) : null
  if (!text || !regex) return { ita_main: [], ita_also: [], ita_excluded: [], ita_method: null }
  const sorted = { ita_main: regex.main, ita_also: regex.also, ita_excluded: regex.excluded, ita_method: "regex" as const }
  // Only covered codes: nothing for Sonnet to sort. Over budget: the regex sort until the next read.
  if ((!regex.also.length && !regex.excluded.length) || budget.reached) return sorted
  const { scope: checked, usage } = await checkScopeCodes({ caseNumber, scopeText: text, regex })
  await budget.record(usage, "ita_scope", caseNumber)
  if (!checked.main.length && !checked.also.length) return { ...sorted, ita_method: "sonnet" }
  return { ita_main: checked.main, ita_also: checked.also, ita_excluded: checked.excluded, ita_method: "sonnet" }
}

// Reads the pages of live cases never read or read over ITA_STALE_DAYS ago (or the cases given),
// stores them, and merges the codes into each case (checks.ts) so imports match on them.
export const refreshItaPages = async (
  db: Db,
  { deadline, budget, limit = 30, caseNumbers }: { deadline: number; budget: Budget; limit?: number; caseNumbers?: string[] }
) => {
  let query = db.from("adcvd_cases").select("*").order("ita_fetched_at", { ascending: true, nullsFirst: true }).limit(limit)
  if (caseNumbers) query = query.in("case_number", caseNumbers)
  else {
    const staleBefore = new Date(Date.now() - ITA_STALE_DAYS * 86_400_000).toISOString()
    query = query.not("status", "in", "(revoked,terminated)").or(`ita_fetched_at.is.null,ita_fetched_at.lt.${staleBefore}`)
  }
  const { data, error } = await query
  if (error) throw new Error(`Loading cases: ${error.message}`)
  const cases = (data ?? []) as CaseRow[]
  const read: string[] = []
  const errors: string[] = []
  let sorted = 0
  for (const c of cases) {
    if (Date.now() > deadline) break
    try {
      const page = await fetchItaPage(c.case_number)
      // The scope is sorted again only when its text changed, or a regex sort is still to be checked
      const sameScope = page.scope === (c.ita_scope ?? null) && (c.ita_method === "sonnet" || (!c.ita_also?.length && !c.ita_excluded?.length))
      const codes: Sorted = sameScope
        ? { ita_main: c.ita_main ?? [], ita_also: c.ita_also ?? [], ita_excluded: c.ita_excluded ?? [], ita_method: c.ita_method ?? null }
        : await sortScope(c.case_number, page.scope, budget)
      if (!sameScope) sorted++
      const { error: saveError } = await db
        .from("adcvd_cases")
        .update({ ita_found: page.found, ita_hts: page.hts, ita_scope: page.scope, ...codes, ita_fetched_at: new Date().toISOString() })
        .eq("case_number", c.case_number)
      if (saveError) throw new Error(saveError.message)
      read.push(c.case_number)
    } catch (e) {
      // Out of time: this case and the rest are read by the next run
      if (e instanceof FederalRegisterOutOfTime) break
      errors.push(`${c.case_number}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  // Merged into the codes imports match on, with the case's other checks
  if (read.length) await checkCases(db, read)
  return { read: read.length, sorted, errors, remaining: cases.length === limit }
}
