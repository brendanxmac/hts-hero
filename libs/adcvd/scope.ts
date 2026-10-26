import type { SupabaseClient } from "@supabase/supabase-js"
import { checkCases } from "./checks"
import { checkScopeCodes, readCaseHistory } from "./claude"
import { caseDocuments, FederalRegisterOutOfTime, FederalRegisterUnavailable, noticeText, type CaseDocument } from "./fr"
import { scopeOf, storedScope, type Scope } from "./parse"
import type { CaseRow } from "./types"
import type { Budget } from "./usage"

type Db = SupabaseClient

// Each case's scope codes, found automatically. Each step runs only for cases still without:
//   1. the newest notice in the case's Federal Register history whose scope lists HTS codes
//      (regex; Sonnet then checks the sort when the scope has "may also enter" or excluded codes)
//   2. a sibling case (filed and ordered together) that has them
//   3. Opus reading the case's notices
//   4. none found: the case shows as news but flags no imports, and is tried again next month

// Cases tried without success are tried again after this long
export const RETRY_DAYS = 25
// Notices opened per case in step 1, most likely to carry a scope first
const NOTICES_TRIED = 8
// Notices (and characters of each) Opus reads in step 3
const HISTORY_NOTICES = 6
const HISTORY_CHARS = 15_000

// Notices that restate the scope in full, best first
const SCOPE_TITLES = [/\bOrders?\b(?!.*Review)/i, /Continuation/i, /Final (?:Affirmative|Negative)?\s*(?:Determination|Countervailing|Antidumping)/i, /Initiation of (?:Less-Than-Fair-Value|Countervailing|Antidumping)/i, /Sunset|Five-Year/i, /Preliminary (?:Affirmative|Negative)?\s*(?:Determination|Countervailing|Antidumping)/i]
const scopeRank = (title: string) => {
  const i = SCOPE_TITLES.findIndex((re) => re.test(title))
  return i < 0 ? SCOPE_TITLES.length : i
}

const needsCheck = (c: Pick<CaseRow, "scope_method" | "fr_also" | "fr_excluded">) => c.scope_method === "regex" && ((c.fr_also ?? []).length > 0 || (c.fr_excluded ?? []).length > 0)

const save = (db: Db, caseNumber: string, fields: Partial<CaseRow>) =>
  db
    .from("adcvd_cases")
    .update({ ...fields, scope_checked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("case_number", caseNumber)

// A notice's text, or null when it can't be had; out of time stops the case (not marked as tried)
const textOrNull = (url: string | null) =>
  noticeText(url).catch((e): string | null => {
    if (e instanceof FederalRegisterOutOfTime) throw e
    return null
  })

// Sonnet's check of a regex sort
const checkSort = async (db: Db, c: CaseRow, budget: Budget): Promise<void> => {
  if (!c.scope_text || budget.reached) return
  const { scope, usage } = await checkScopeCodes({
    caseNumber: c.case_number,
    scopeText: c.scope_text,
    regex: { main: c.fr_main ?? [], also: c.fr_also ?? [], excluded: c.fr_excluded ?? [] },
  })
  await budget.record(usage, "scope_check", c.case_number)
  // Sonnet found nothing to correct: the regex sort stands, marked checked so it isn't asked again
  if (!scope.main.length && !scope.also.length) {
    await save(db, c.case_number, { scope_method: "sonnet" })
    return
  }
  await save(db, c.case_number, { fr_main: scope.main, fr_also: scope.also, fr_excluded: scope.excluded, scope_method: "sonnet" })
  // Siblings sharing this scope text get the same sort
  if (c.siblings.length) {
    await db
      .from("adcvd_cases")
      .update({ fr_main: scope.main, fr_also: scope.also, fr_excluded: scope.excluded, scope_method: "sonnet", scope_checked_at: new Date().toISOString() })
      .in("case_number", c.siblings)
      .eq("scope_doc", c.scope_doc ?? "")
  }
}

const fromHistory = async (c: CaseRow): Promise<{ scope: Scope | null; doc: CaseDocument | null; docs: CaseDocument[] }> => {
  const docs = (await caseDocuments(c.case_number)).sort((a, b) => scopeRank(a.title) - scopeRank(b.title) || b.publication_date.localeCompare(a.publication_date))
  for (const doc of docs.slice(0, NOTICES_TRIED)) {
    const text = await textOrNull(doc.raw_text_url)
    const scope = text ? scopeOf(text) : null
    if (scope) return { scope, doc, docs }
  }
  return { scope: null, doc: null, docs }
}

const fromSibling = async (db: Db, c: CaseRow) => {
  if (!c.siblings.length) return null
  const { data } = await db.from("adcvd_cases").select("*").in("case_number", c.siblings)
  return ((data ?? []) as CaseRow[]).find((s) => s.fr_main?.length || s.fr_also?.length) ?? null
}

export const findScope = async (db: Db, c: CaseRow, budget: Budget): Promise<CaseRow["scope_method"]> => {
  if (needsCheck(c)) {
    // Over budget: the regex sort stands until the check can run
    if (budget.reached) return c.scope_method
    await checkSort(db, c, budget)
    return "sonnet"
  }
  // 1. The case's own notices
  const { scope, doc, docs } = await fromHistory(c)
  if (scope && doc) {
    const updated: CaseRow = {
      ...c,
      fr_main: scope.main,
      fr_also: scope.also,
      fr_excluded: scope.excluded,
      scope_text: storedScope(scope.text),
      scope_doc: doc.document_number,
      scope_published_on: doc.publication_date,
      scope_method: "regex",
    }
    await save(db, c.case_number, updated)
    if (needsCheck(updated)) await checkSort(db, updated, budget)
    return "regex"
  }
  // 2. A sibling's
  const sibling = await fromSibling(db, c)
  if (sibling) {
    await save(db, c.case_number, {
      fr_main: sibling.fr_main,
      fr_also: sibling.fr_also,
      fr_excluded: sibling.fr_excluded,
      scope_text: sibling.scope_text,
      scope_doc: sibling.scope_doc,
      scope_published_on: sibling.scope_published_on,
      scope_method: "sibling",
    })
    return "sibling"
  }
  // 3. Opus reads the history
  if (docs.length && !budget.reached) {
    const picked = docs.slice(0, HISTORY_NOTICES)
    const texts = await Promise.all(picked.map((d) => textOrNull(d.raw_text_url)))
    const notices = picked
      .map((d, i) => ({ document_number: d.document_number, title: d.title, date: d.publication_date, text: (texts[i] ?? "").slice(0, HISTORY_CHARS) }))
      .filter((n) => n.text)
    if (notices.length) {
      const { scope: read, usage } = await readCaseHistory({ caseNumber: c.case_number, notices })
      await budget.record(usage, "history", c.case_number)
      if (read.main.length || read.also.length) {
        const source = picked.find((d) => d.document_number === read.document_number)
        await save(db, c.case_number, {
          fr_main: read.main,
          fr_also: read.also,
          fr_excluded: read.excluded,
          scope_text: read.scope_text,
          scope_doc: read.document_number,
          scope_published_on: source?.publication_date ?? null,
          scope_method: "opus",
        })
        return "opus"
      }
    }
  }
  // 4. None found (yet)
  await save(db, c.case_number, { scope_method: "none" })
  return "none"
}

// The cases that need a scope step: no codes yet (and not tried lately), or a regex sort to check
export const casesNeedingScope = async (
  db: Db,
  { caseNumbers, limit, triedBefore }: { caseNumbers?: string[]; limit: number; triedBefore?: string }
) => {
  // Cases without codes tried before this (RETRY_DAYS ago unless given: a backfill passes its own
  // start, to try every case once more but never the same one twice)
  const retryBefore = triedBefore ?? new Date(Date.now() - RETRY_DAYS * 86_400_000).toISOString()
  let query = db
    .from("adcvd_cases")
    .select("*")
    .or(`and(hts_main.eq.{},hts_also.eq.{},or(scope_checked_at.is.null,scope_checked_at.lt.${retryBefore})),and(scope_method.eq.regex,or(fr_also.neq.{},fr_excluded.neq.{}))`)
    .order("last_activity_on", { ascending: false, nullsFirst: false })
    .limit(limit)
  if (caseNumbers) query = query.in("case_number", caseNumbers)
  const { data, error } = await query
  if (error) throw new Error(`Loading cases: ${error.message}`)
  return (data ?? []) as CaseRow[]
}

export const scopeCases = async (
  db: Db,
  { caseNumbers, deadline, budget, limit = 200, triedBefore }: { caseNumbers?: string[]; deadline: number; budget: Budget; limit?: number; triedBefore?: string }
) => {
  const cases = await casesNeedingScope(db, { caseNumbers, limit, triedBefore })
  const found: Record<string, number> = {}
  const errors: string[] = []
  for (const c of cases) {
    if (Date.now() > deadline) return { found, errors, remaining: true, unavailable: false }
    try {
      const method = await findScope(db, c, budget)
      found[method ?? "none"] = (found[method ?? "none"] ?? 0) + 1
    } catch (e) {
      errors.push(`${c.case_number}: ${e instanceof Error ? e.message : String(e)}`)
      // Not marked as tried when the Federal Register couldn't be reached: it's tried again. Stop
      // the run rather than fail the rest the same way.
      if (e instanceof FederalRegisterUnavailable) return { found, errors, remaining: true, unavailable: true }
      await save(db, c.case_number, {})
    }
  }
  // The new codes merged into what imports match on (codes.ts)
  await checkCases(db, cases.map((c) => c.case_number))
  return { found, errors, remaining: cases.length === limit, unavailable: false }
}
