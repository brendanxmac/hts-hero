import type { SupabaseClient } from "@supabase/supabase-js"
import { getHtsElementsServer } from "../hts-server"
import successorsFile from "../../tariffs/hts-concordance/successors.json"
import { LIVE_STATUSES, type CaseRow } from "./types"

// Renumbered HTS codes → the current codes that replaced them (tariffs/hts-concordance)
const SUCCESSORS = (successorsFile as { successors: Record<string, string[]> }).successors

// Automatic checks on cases, shown on /adcvd's Problems tab. None needs action: each says what
// the pipeline does about it. Scope codes no longer in the current HTS (renumbered since the order)
// go in hts_outdated, which the import flags only match at six digits, as "possible".

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
export const reconciledStatus = (c: CaseRow, hasReviews: boolean, today = new Date()): CaseRow["status"] => {
  if (c.status !== "order" || c.order_on || c.last_continued_on || hasReviews || !c.initiated_on) return c.status
  const days = (today.getTime() - new Date(c.initiated_on).getTime()) / 86_400_000
  return days <= 548 ? "investigation" : c.status
}

export const checkCase = (c: CaseRow, hts: Set<string>, today = new Date()): Pick<CaseRow, "problems" | "hts_outdated" | "hts_successors"> => {
  const problems: string[] = []
  if (!c.country) problems.push(`Commerce country code ${c.commerce_country} isn't in the country list yet: the case can't flag imports until it's added to libs/adcvd/countries.ts.`)
  const codes = [...c.hts_main, ...c.hts_also]
  const outdated = hts.size ? codes.filter((code) => !hts.has(code.slice(0, Math.min(code.length, 10)))) : []
  const successors = Object.fromEntries(outdated.filter((code) => SUCCESSORS[code]).map((code) => [code, SUCCESSORS[code]]))
  const unmapped = outdated.filter((code) => !SUCCESSORS[code])
  if (outdated.length)
    problems.push(
      `${outdated.length} scope code${outdated.length === 1 ? " isn't" : "s aren't"} in the current HTS (renumbered since the scope was written).` +
        (Object.keys(successors).length ? ` ${Object.keys(successors).length} map to the codes that replaced them.` : "") +
        (unmapped.length ? ` ${unmapped.length} match imports on the same 8-digit line, as possible.` : "")
    )
  if (!c.hts_main.length && c.hts_also.length && c.status === "investigation" && !c.scope_doc) problems.push("Codes from the ITC's petition notice until Commerce publishes the scope: imports match as possible.")
  if (!codes.length && c.scope_method === "none") problems.push("No HTS codes found in any notice yet. Shown as news only; tried again next month.")
  if (!codes.length && !c.scope_method) problems.push("Scope not read yet.")
  if (LIVE_STATUSES.includes(c.status) && c.last_activity_on) {
    const days = (today.getTime() - new Date(c.last_activity_on).getTime()) / 86_400_000
    if (days > STALE_DAYS) problems.push(`No notice since ${c.last_activity_on}: the status may be out of date (an older month not processed yet, or a revocation we haven't read).`)
  }
  if (c.status === "unknown") problems.push("Status unknown until a notice says what stage the case is at.")
  return { problems, hts_outdated: outdated, hts_successors: successors }
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
      if (!c.hts_main.length && !c.hts_also.length && status === "investigation") {
        const { data: itc } = await db.from("adcvd_events").select("hts_codes").eq("case_number", c.case_number).eq("agency", "itc")
        const petitionCodes = Array.from(new Set((itc ?? []).flatMap((e) => e.hts_codes as string[])))
        if (petitionCodes.length) {
          await db.from("adcvd_cases").update({ hts_also: petitionCodes }).eq("case_number", c.case_number)
          c.hts_also = petitionCodes
        }
      }
      const result: Pick<CaseRow, "problems" | "hts_outdated" | "hts_successors"> & { status?: CaseRow["status"] } = checkCase({ ...c, status }, hts)
      if (status !== c.status) result.status = status
      // Siblings ordered together should list the same codes
      if (c.siblings.length && c.hts_main.length) {
        const { data: sibs } = await db.from("adcvd_cases").select("case_number, hts_main, scope_doc").in("case_number", c.siblings)
        const differ = (sibs ?? []).filter((s) => s.hts_main.length && s.scope_doc === c.scope_doc && s.hts_main.join() !== c.hts_main.join())
        if (differ.length) result.problems.push(`Lists different codes from ${differ.map((s) => s.case_number).join(", ")} for the same scope notice.`)
      }
      if (result.problems.length) withProblems++
      await db.from("adcvd_cases").update(result).eq("case_number", c.case_number)
    }
  }
  return { checked: caseNumbers.length, withProblems }
}
