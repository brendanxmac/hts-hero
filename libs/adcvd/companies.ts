import type { SupabaseClient } from "@supabase/supabase-js"
import type { SummaryResult } from "./claude"

// Each producer's or exporter's latest rate on a case (adcvd_company_rates), from the notices that
// set them. Notices are read out of order (months newest first), so a notice only replaces a
// company's rate if it's at least as new as the one stored.

type Db = SupabaseClient

const clean = (name: string) => name.replace(/\s+/g, " ").replace(/[.\s]+$/, "").trim()

// Only an order or a final determination excludes a company from an order; a review's rescission
// for a company never does
export const canExclude = (title: string) =>
  /(?:Antidumping|Countervailing) (?:Duty )?Orders?\b|Final (?:Affirmative |Negative )?(?:Determination|Countervailing|Antidumping)|Amended Final/i.test(title) &&
  !/Review|Rescission|Recission/i.test(title)

export const saveCompanyRates = async (
  db: Db,
  {
    documentNumber,
    publishedOn,
    title,
    cases,
    companies,
  }: { documentNumber: string; publishedOn: string; title: string; cases: string[]; companies: SummaryResult["companies"] }
) => {
  const exclusions = canExclude(title)
  // Only the notice's own cases (one case: its rows whatever case number Claude wrote)
  const rows = companies
    .map((c) => ({ ...c, case_number: cases.includes(c.case_number) ? c.case_number : cases.length === 1 ? cases[0] : null, company: clean(c.company) }))
    .map((c) => ({ ...c, excluded: c.excluded && exclusions }))
    .filter((c): c is typeof c & { case_number: string } => !!c.case_number && c.company.length > 1 && (c.excluded || c.rate !== null))
  if (!rows.length) return 0
  const { data: stored } = await db.from("adcvd_company_rates").select("case_number, company, as_of").in("case_number", Array.from(new Set(rows.map((r) => r.case_number))))
  const newer = new Map((stored ?? []).map((r) => [`${r.case_number}|${r.company}`, r.as_of as string]))
  const keep = new Map<string, Record<string, unknown>>()
  for (const r of rows) {
    const key = `${r.case_number}|${r.company}`
    if ((newer.get(key) ?? "") > publishedOn) continue
    keep.set(key, { case_number: r.case_number, company: r.company, rate: r.excluded ? null : r.rate, basis: r.basis, excluded: r.excluded, as_of: publishedOn, doc: documentNumber })
  }
  if (!keep.size) return 0
  const { error } = await db.from("adcvd_company_rates").upsert(Array.from(keep.values()), { onConflict: "case_number,company" })
  if (error) throw new Error(`Saving company rates: ${error.message}`)
  return keep.size
}
