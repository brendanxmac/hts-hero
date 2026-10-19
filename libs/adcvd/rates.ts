import type { SupabaseClient } from "@supabase/supabase-js"
import { summarizeNotice } from "./claude"
import { saveCompanyRates } from "./companies"
import { caseDocuments, noticeText } from "./fr"
import { ratesSet, type CaseRow, type Rates } from "./types"
import type { Budget } from "./usage"

// Rates for an order whose latest rate-setting notice is older than the months we've processed:
// its newest notices that set rates (final review results first, then an amended final, the order,
// the final determination), read by Haiku until one gives this case rates above zero.

type Db = SupabaseClient

// Notices that set company rates, best first
const RATE_TITLES = [
  /Final Results of (?:the )?(?:Antidumping|Countervailing) Duty Administrative Review|Final Results of Administrative Review|Final Results and .*Administrative Review/i,
  /Amended Final|Notice of Amended/i,
  /(?:Antidumping|Countervailing) Duty Orders?\b/i,
  /Final (?:Affirmative|Negative)?\s*(?:Determination|Countervailing|Antidumping)|Final Determination of Sales at Less/i,
]
const rank = (title: string) => {
  const i = RATE_TITLES.findIndex((re) => re.test(title) && !/Sunset|Continuation|Revocation|Court|Circumvention|Scope|Postponement|Correction/i.test(title))
  return i < 0 ? RATE_TITLES.length : i
}
// Notices read per case before giving up
const TRIES = 3

export const fillRates = async (db: Db, c: CaseRow, budget: Budget): Promise<Rates | null> => {
  const docs = (await caseDocuments(c.case_number))
    .filter((d) => rank(d.title) < RATE_TITLES.length)
    // Newest first: today's rates come from the latest notice that set them
    .sort((a, b) => b.publication_date.localeCompare(a.publication_date))
  for (const d of docs.slice(0, TRIES)) {
    if (budget.reached) return null
    const text = await noticeText(d.raw_text_url)
    if (!text) continue
    const result = await summarizeNotice({ title: d.title, event: "Notice that may set rates", cases: [c.case_number], text })
    await budget.record(result.usage, "rates", c.case_number)
    await saveCompanyRates(db, { documentNumber: d.document_number, publishedOn: d.publication_date, title: d.title, cases: [c.case_number], companies: result.companies ?? [] })
    const r = result.rates.find((x) => x.case_number === c.case_number) ?? (result.rates.length === 1 ? result.rates[0] : null)
    if (r && ratesSet(r)) {
      const rates: Rates = { low: r.low, high: r.high, all_others: r.all_others, basis: r.basis, as_of: d.publication_date, doc: d.document_number }
      await db.from("adcvd_cases").update({ rates, updated_at: new Date().toISOString() }).eq("case_number", c.case_number)
      return rates
    }
  }
  return null
}
