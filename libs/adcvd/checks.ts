import type { SupabaseClient } from "@supabase/supabase-js"
import { getHtsElementsServer } from "../hts-server"
import { mapLimit } from "../tariff-sources/text"
import { mergeCodes, type MergeNotes, type MergedCodes } from "./codes"
import { LIVE_STATUSES, type CaseRow } from "./types"

// Automatic checks on cases, shown on /adcvd's Problems tab. None needs action: each says what
// the pipeline does about it. First every source's scope codes are merged into what imports match
// on (codes.ts): ITA's case page with the Federal Register's, and codes the HTS has dropped mapped
// to the ones that replaced them.

type Db = SupabaseClient

// A live case with no notice this long may have ended without us seeing it
const STALE_DAYS = 548

let htsPrefixes: Promise<Set<string>> | null = null
// Every 4, 6, 8 and 10-digit prefix of the current HTS's codes
const currentHts = () =>
  (htsPrefixes ??= getHtsElementsServer().then((elements) => {
    const set = new Set<string>()
    for (const e of elements) {
      const digits = e.htsno.replace(/\D/g, "")
      for (const n of [4, 6, 8, 10]) if (digits.length >= n) set.add(digits.slice(0, n))
    }
    return set
  }))

// A case called an order with no sign of one (no order or continuation date, no annual review),
// opened in the past 18 months, is still an investigation: some notices on a new petition (a
// deadline extended, an ITC schedule) don't say what stage it's at
// An investigation still open two years after it started, with no order, has ended: they take
// about a year, and a "no" vote or a final determination nothing followed may be worded in a way
// we don't read (A-583-839, cold-rolled steel from Taiwan, opened 2001)
export const reconciledStatus = (c: CaseRow, hasReviews: boolean, today = new Date()): CaseRow["status"] => {
  const days = c.initiated_on ? (today.getTime() - new Date(c.initiated_on).getTime()) / 86_400_000 : 0
  if (c.status === "investigation" && !c.order_on && !hasReviews && days > 730) return "terminated"
  if (c.status !== "order" || c.order_on || c.last_continued_on || hasReviews || !c.initiated_on) return c.status
  return days <= 548 ? "investigation" : c.status
}

export const checkCase = (c: CaseRow, notes: MergeNotes | null, today = new Date()): Pick<CaseRow, "problems"> => {
  const problems: string[] = []
  if (!c.country) problems.push(`Commerce country code ${c.commerce_country} isn't in the country list yet: the case can't flag imports until it's added to libs/adcvd/countries.ts.`)
  const codes = [...c.hts_main, ...c.hts_also]
  const outdated = c.hts_outdated
  if (outdated.length && notes)
    problems.push(
      `${outdated.length} scope code${outdated.length === 1 ? " isn't" : "s aren't"} in the current HTS (renumbered since the scope was written).` +
        (notes.renumbered ? ` ${notes.renumbered} map to the one code that replaced ${notes.renumbered === 1 ? "it" : "them"}.` : "") +
        (notes.split ? ` ${notes.split} split into several codes, matched as possible.` : "") +
        (notes.unmapped ? ` ${notes.unmapped} with no replacement found match imports on the same 8-digit line, as possible.` : "")
    )
  if (notes?.itaAdded.length) {
    const n = notes.itaAdded.length
    problems.push(
      `ITA's case page lists ${n} current code${n === 1 ? "" : "s"} the Federal Register scope doesn't (${notes.itaAdded.slice(0, 4).join(", ")}${n > 4 ? ", …" : ""}): imports under ${n === 1 ? "it" : "them"} are flagged too.`
    )
  }
  if (!c.hts_main.length && c.hts_also.length && c.status === "investigation" && !c.scope_doc) problems.push("Codes from the ITC's petition notice until Commerce publishes the scope: imports match as possible.")
  if (!codes.length && c.scope_method === "none") problems.push("No HTS codes found in any notice yet. Shown as news only; tried again next month.")
  if (!codes.length && !c.scope_method) problems.push("Scope not read yet.")
  if (LIVE_STATUSES.includes(c.status) && c.last_activity_on) {
    const days = (today.getTime() - new Date(c.last_activity_on).getTime()) / 86_400_000
    if (days > STALE_DAYS) problems.push(`No notice since ${c.last_activity_on}: the status may be out of date (an older month not processed yet, or a revocation we haven't read).`)
  }
  if (c.status === "unknown") problems.push("Status unknown until a notice says what stage the case is at.")
  if (c.ita_found === false && LIVE_STATUSES.includes(c.status))
    problems.push("ITA has no case page for this number: it may be a Federal Register typo for another case (its notices' docket tags can be wrong too).")
  return { problems }
}

// Rows matching a filter on a list of case numbers, in slices (long lists don't fit in a URL) and
// pages (PostgREST returns at most 1,000 rows a request)
const PAGE = 1000
const byCases = async <T>(caseNumbers: string[], query: (slice: string[], from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>) => {
  const rows: T[] = []
  for (let i = 0; i < caseNumbers.length; i += 150) {
    const slice = caseNumbers.slice(i, i + 150)
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await query(slice, from, from + PAGE - 1)
      if (error) throw new Error(error.message)
      rows.push(...((data ?? []) as T[]))
      if ((data ?? []).length < PAGE) break
    }
  }
  return rows
}

const REVIEW_EVENTS = ["review_init", "review_prelim", "review_final", "review_other", "sunset_init", "sunset_result", "continuation", "new_shipper"]
// Case rows saved at once
const SAVE_LIMIT = 8

// Checks the cases given, in batches of reads (a handful of requests however many cases) and a
// few saves at a time. Stops at the deadline with `remaining` (each case is checked whole or not
// at all, so the next run can just check again).
export const checkCases = async (db: Db, caseNumbers: string[], { deadline = Infinity }: { deadline?: number } = {}) => {
  if (!caseNumbers.length) return { checked: 0, withProblems: 0, remaining: false }
  const hts = await currentHts().catch(() => new Set<string>())
  const cases = await byCases<CaseRow>(caseNumbers, (slice, from, to) => db.from("adcvd_cases").select("*").in("case_number", slice).order("case_number").range(from, to)).catch((e) => {
    throw new Error(`Loading cases: ${e.message}`)
  })
  const numbers = cases.map((c) => c.case_number)
  // Cases with an annual review, sunset review or the like (a sign of an order)
  const reviewed = new Set(
    (
      await byCases<{ case_number: string }>(numbers, (slice, from, to) =>
        db.from("adcvd_events").select("case_number").in("case_number", slice).in("event", REVIEW_EVENTS).order("id").range(from, to)
      )
    ).map((r) => r.case_number)
  )
  // An investigation Commerce hasn't published a scope for yet: the codes its ITC petition
  // notice names, as "may also enter" (possible) matches until the scope arrives
  const statusOf = new Map(cases.map((c) => [c.case_number, reconciledStatus(c, reviewed.has(c.case_number))]))
  const waiting = cases.filter((c) => !c.fr_main?.length && !c.fr_also?.length && statusOf.get(c.case_number) === "investigation").map((c) => c.case_number)
  const petitionCodes = new Map<string, Set<string>>()
  for (const e of await byCases<{ case_number: string; hts_codes: string[] }>(waiting, (slice, from, to) =>
    db.from("adcvd_events").select("case_number, hts_codes").in("case_number", slice).eq("agency", "itc").order("id").range(from, to)
  )) {
    const set = petitionCodes.get(e.case_number) ?? new Set<string>()
    for (const code of e.hts_codes ?? []) set.add(code)
    petitionCodes.set(e.case_number, set)
  }
  // Siblings ordered together should list the same codes
  const siblingNumbers = Array.from(new Set(cases.filter((c) => c.siblings.length && c.fr_main?.length).flatMap((c) => c.siblings)))
  const siblings = new Map(
    (
      await byCases<Pick<CaseRow, "case_number" | "fr_main" | "scope_doc">>(siblingNumbers, (slice, from, to) =>
        db.from("adcvd_cases").select("case_number, fr_main, scope_doc").in("case_number", slice).order("case_number").range(from, to)
      )
    ).map((s) => [s.case_number, s])
  )

  let checked = 0
  let withProblems = 0
  let remaining = false
  await mapLimit(cases, SAVE_LIMIT, async (c) => {
    if (Date.now() > deadline) {
      remaining = true
      return
    }
    const status = statusOf.get(c.case_number)!
    const fromPetition = petitionCodes.get(c.case_number)
    const petition = fromPetition?.size ? { fr_also: Array.from(fromPetition) } : {}
    Object.assign(c, petition)
    // Every source's codes, merged into what imports match on (codes.ts). Without the source
    // columns (the 2026-10-23 migration not applied yet), the codes stay as they are.
    if (c.fr_main === undefined) throw new Error("adcvd_cases has no fr_main column: run the 2026-10-23 section of supabase/migrations/adcvd.sql")
    const { itaAdded, renumbered, split, unmapped, ...merged } = mergeCodes(c, hts)
    const result: Pick<CaseRow, "problems"> & MergedCodes & { status?: CaseRow["status"]; fr_also?: string[] } = {
      ...petition,
      ...merged,
      ...checkCase({ ...c, ...merged, status }, { itaAdded, renumbered, split, unmapped }),
    }
    if (status !== c.status) result.status = status
    if (c.siblings.length && c.fr_main?.length) {
      const differ = c.siblings
        .map((n) => siblings.get(n))
        .filter((s): s is NonNullable<typeof s> => !!s && !!s.fr_main?.length && s.scope_doc === c.scope_doc && s.fr_main.join() !== c.fr_main!.join())
      if (differ.length) result.problems.push(`Lists different codes from ${differ.map((s) => s.case_number).join(", ")} for the same scope notice.`)
    }
    if (result.problems.length) withProblems++
    await db.from("adcvd_cases").update(result).eq("case_number", c.case_number)
    checked++
  })
  return { checked, withProblems, remaining }
}
