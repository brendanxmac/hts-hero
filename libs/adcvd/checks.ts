import type { SupabaseClient } from "@supabase/supabase-js"
import { getHtsElementsServer } from "../hts-server"
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

export const checkCases = async (db: Db, caseNumbers: string[]) => {
  if (!caseNumbers.length) return { checked: 0, withProblems: 0 }
  const hts = await currentHts().catch(() => new Set<string>())
  let withProblems = 0
  for (let i = 0; i < caseNumbers.length; i += 200) {
    const { data, error } = await db.from("adcvd_cases").select("*").in("case_number", caseNumbers.slice(i, i + 200))
    if (error) throw new Error(`Loading cases: ${error.message}`)
    for (const c of (data ?? []) as CaseRow[]) {
      const { count: reviews } = await db
        .from("adcvd_events")
        .select("id", { count: "exact", head: true })
        .eq("case_number", c.case_number)
        .in("event", ["review_init", "review_prelim", "review_final", "review_other", "sunset_init", "sunset_result", "continuation", "new_shipper"])
      const status = reconciledStatus(c, (reviews ?? 0) > 0)
      // An investigation Commerce hasn't published a scope for yet: the codes its ITC petition
      // notice names, as "may also enter" (possible) matches until the scope arrives
      if (!c.fr_main?.length && !c.fr_also?.length && status === "investigation") {
        const { data: itc } = await db.from("adcvd_events").select("hts_codes").eq("case_number", c.case_number).eq("agency", "itc")
        const petitionCodes = Array.from(new Set((itc ?? []).flatMap((e) => e.hts_codes as string[])))
        if (petitionCodes.length) {
          await db.from("adcvd_cases").update({ fr_also: petitionCodes }).eq("case_number", c.case_number)
          c.fr_also = petitionCodes
        }
      }
      // Every source's codes, merged into what imports match on (codes.ts). Without the source
      // columns (the 2026-10-23 migration not applied yet), the codes stay as they are.
      if (c.fr_main === undefined) throw new Error("adcvd_cases has no fr_main column: run the 2026-10-23 section of supabase/migrations/adcvd.sql")
      const { itaAdded, renumbered, split, unmapped, ...merged } = mergeCodes(c, hts)
      const result: Pick<CaseRow, "problems"> & MergedCodes & { status?: CaseRow["status"] } = {
        ...merged,
        ...checkCase({ ...c, ...merged, status }, { itaAdded, renumbered, split, unmapped }),
      }
      if (status !== c.status) result.status = status
      // Siblings ordered together should list the same codes
      if (c.siblings.length && c.fr_main?.length) {
        const { data: sibs } = await db.from("adcvd_cases").select("case_number, fr_main, scope_doc").in("case_number", c.siblings)
        const differ = (sibs ?? []).filter((s) => s.fr_main.length && s.scope_doc === c.scope_doc && s.fr_main.join() !== c.fr_main!.join())
        if (differ.length) result.problems.push(`Lists different codes from ${differ.map((s) => s.case_number).join(", ")} for the same scope notice.`)
      }
      if (result.problems.length) withProblems++
      await db.from("adcvd_cases").update(result).eq("case_number", c.case_number)
    }
  }
  return { checked: caseNumbers.length, withProblems }
}
