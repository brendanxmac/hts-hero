import type { SupabaseClient } from "@supabase/supabase-js"
import { countryOfCase } from "./countries"
import { fillHistory } from "./history"
import { CBP_MESSAGES_URL, type CaseRow, type EventRow } from "./types"

// CBP's public AD/CVD messages: the instructions CBP sends ports on each case (cash deposits,
// liquidation, court decisions). Read every cron run, no AI. They add three things:
//  - a "CBP instructions" event on the case's timeline
//  - third-country case numbers ("Third Country Case Number: A-301-040"): goods from that country
//    CBP treats as covered by the order, so imports from it are flagged as possible
//  - a check that we know the case: one CBP acts on that isn't in the registry is added, and its
//    status worked out from its Federal Register history
// The feed holds only the latest messages (a few days), so it's read often and builds up over time.

type Db = SupabaseClient

const FEED = "https://trade.cbp.dhs.gov/ace/adcvd/service-messages/messages/public/getLatestMessages"
// New cases looked up per run (one Federal Register request each)
const NEW_CASES_PER_RUN = 5

interface CbpMessage {
  caseNumber: string
  messageNumber: string
  messageTitle: string
  messageDate: string
  shortCaseName: string | null
  type: string | null
  status: string | null
}

// "A570040" → "A-570-040"
const caseNumberOf = (raw: string) => raw.replace(/^([AC])-?(\d{3})-?(\d{3})$/, "$1-$2-$3")
// "10/16/2026" → "2026-10-16"
const isoDate = (us: string) => {
  const m = us.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return m ? `${m[3]}-${m[1]}-${m[2]}` : null
}
const typeLabel = (type: string | null) => (type ?? "").replace(/^[A-Z]+-/, "").toLowerCase() || "instructions"

export const readCbpMessages = async (db: Db) => {
  const response = await fetch(FEED, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`CBP's AD/CVD messages answered ${response.status}`)
  const messages = (((await response.json()) as { resultData?: CbpMessage[] }).resultData ?? []).filter((m) => /^[AC]-?\d{3}-?\d{3}$/.test(m.caseNumber))
  if (!messages.length) return { messages: 0, added: 0, newCases: 0, thirdCountries: 0 }

  const numbers = Array.from(new Set(messages.map((m) => caseNumberOf(m.caseNumber))))
  const { data } = await db.from("adcvd_cases").select("*").in("case_number", numbers)
  const known = new Map(((data ?? []) as CaseRow[]).map((c) => [c.case_number, c]))

  // Cases CBP acts on that we don't have yet
  let newCases = 0
  for (const number of numbers.filter((n) => !known.has(n)).slice(0, NEW_CASES_PER_RUN)) {
    const m = messages.find((x) => caseNumberOf(x.caseNumber) === number)!
    const row = {
      case_number: number,
      kind: number.startsWith("C") ? "CVD" : "AD",
      commerce_country: number.slice(2, 5),
      country: countryOfCase(number),
      product: m.shortCaseName,
      status: "unknown",
    }
    const { data: created } = await db.from("adcvd_cases").insert(row).select("*").single()
    if (created) {
      await fillHistory(db, created as CaseRow).catch((): null => null)
      known.set(number, created as CaseRow)
      newCases++
    }
  }

  // Third-country case numbers in the titles: the order reaches goods from that country
  let thirdCountries = 0
  for (const m of messages) {
    const main = known.get(caseNumberOf(m.caseNumber))
    if (!main) continue
    const thirds = Array.from(m.messageTitle.matchAll(/Third Country Case Number:?\s*([AC]-\d{3}-\d{3})/gi), (x) => countryOfCase(x[1])).filter(
      (c): c is string => !!c && c !== main.country
    )
    const added = thirds.filter((c) => !main.third_countries.includes(c))
    if (added.length) {
      main.third_countries = [...main.third_countries, ...added]
      await db.from("adcvd_cases").update({ third_countries: main.third_countries, updated_at: new Date().toISOString() }).eq("case_number", main.case_number)
      thirdCountries += added.length
    }
  }

  // One event per message, not read before
  const docs = messages.map((m) => `CBP-${m.messageNumber}`)
  const { data: seen } = await db.from("adcvd_events").select("document_number").in("document_number", docs)
  const seenDocs = new Set((seen ?? []).map((e) => e.document_number))
  const events: EventRow[] = messages
    .filter((m) => known.has(caseNumberOf(m.caseNumber)) && !seenDocs.has(`CBP-${m.messageNumber}`) && isoDate(m.messageDate))
    .map((m): EventRow => ({
      case_number: caseNumberOf(m.caseNumber),
      item_id: null,
      document_number: `CBP-${m.messageNumber}`,
      published_on: isoDate(m.messageDate)!,
      agency: "cbp",
      event: "cbp_message",
      title: m.messageTitle.replace(/\s+/g, " ").trim(),
      url: CBP_MESSAGES_URL,
      summary: `CBP sent ports ${typeLabel(m.type)} instructions (message ${m.messageNumber}).`,
      rates: null,
      significant: false,
      itc_numbers: [],
      countries: [],
      hts_codes: [],
      product: m.shortCaseName,
      summarized_at: new Date().toISOString(),
    }))
  if (events.length) {
    const { error } = await db.from("adcvd_events").insert(events)
    if (error) throw new Error(`Saving CBP messages: ${error.message}`)
  }
  return { messages: messages.length, added: events.length, newCases, thirdCountries }
}
