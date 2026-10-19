import type { SupabaseClient } from "@supabase/supabase-js"
import { countryFromName, countryOfCase } from "./countries"
import { noticeText } from "./fr"
import {
  caseNumbers,
  circumventionCountries,
  eventOf,
  headerLine,
  isNegative,
  itcCodes,
  itcNumbers,
  listGap,
  listRows,
  revokedCountries,
  scopeOf,
  storedScope,
  titleParts,
  type ListRow,
  type Scope,
} from "./parse"
import { SIGNIFICANT_EVENTS, type CaseRow, type CaseStatus, type EventRow, type EventType } from "./types"

// Reading one month's Commerce and ITC notices into cases and events, without AI. Each notice is
// read from the Federal Register's text: its own case numbers (or ITC investigation numbers),
// what kind of notice it is, the product and countries, and the scope's HTS codes when it lists
// them. Cases are created or updated, and each notice becomes an event on each of its cases.

type Db = SupabaseClient

export const AGENCY_NAMES = { commerce: "International Trade Administration", itc: "International Trade Commission" }
export const AGENCY_SLUGS = ["international-trade-administration", "international-trade-commission"]

export interface NoticeItem {
  id: string
  title: string
  url: string
  published_at: string
  agencies: string[]
  document_number: string | null
  external_id: string
  raw: { raw_text_url?: string | null; docket_ids?: string[] | null }
}

export const monthRange = (month: string) => {
  const start = new Date(`${month}-01T00:00:00Z`)
  const end = new Date(start)
  end.setUTCMonth(end.getUTCMonth() + 1)
  end.setUTCMilliseconds(-1)
  return { start, end }
}

// The month's notices from Commerce (ITA) and the ITC not read yet
export const unreadNotices = async (db: Db, month: string, limit: number) => {
  const { start, end } = monthRange(month)
  const { data, error } = await db
    .from("tariff_source_items")
    .select("id, title, url, published_at, agencies, document_number, external_id, raw")
    .eq("source", "federal_register")
    .overlaps("agencies", Object.values(AGENCY_NAMES))
    .is("adcvd_at", null)
    .gte("published_at", start.toISOString())
    .lte("published_at", end.toISOString())
    .order("published_at", { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Loading notices: ${error.message}`)
  return (data ?? []) as NoticeItem[]
}

const day = (iso: string) => iso.slice(0, 10)
const union = (a: string[] | null | undefined, b: string[]) => Array.from(new Set([...(a ?? []), ...b]))
const minDate = (a: string | null | undefined, b: string | null) => (!a ? b : !b ? a : a < b ? a : b)
const maxDate = (a: string | null | undefined, b: string | null) => (!a ? b : !b ? a : a > b ? a : b)

const blankCase = (caseNumber: string): CaseRow => ({
  case_number: caseNumber,
  kind: caseNumber.startsWith("C") ? "CVD" : "AD",
  commerce_country: caseNumber.slice(2, 5),
  country: countryOfCase(caseNumber),
  product: null,
  status: "unknown",
  initiated_on: null,
  order_on: null,
  last_continued_on: null,
  ended_on: null,
  itc_numbers: [],
  siblings: [],
  third_countries: [],
  hts_main: [],
  hts_also: [],
  hts_excluded: [],
  hts_outdated: [],
  scope_text: null,
  scope_doc: null,
  scope_published_on: null,
  scope_method: null,
  scope_checked_at: null,
  rates: null,
  problems: [],
  first_seen_on: null,
  last_activity_on: null,
})

const daysBetween = (from: string, to: string) => (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000
// Review activity this long after an apparent end means the order is live after all
const LIVE_AFTER_DAYS = 548

// The latest date that set the case's status: the order, its last continuation, or its end
const statusDate = (c: CaseRow) => [c.ended_on, c.last_continued_on, c.order_on, c.initiated_on].filter(Boolean).sort().pop() ?? ""

// A case's status after a notice, given the notice's date. Notices arrive out of order (months
// are processed newest first), so a notice only moves the status if it's newer than whatever set
// it; dates fill in either way.
export const applyEvent = (c: CaseRow, event: EventType, date: string, title: string): CaseRow => {
  const next = { ...c }
  const newer = date >= statusDate(c)
  switch (event) {
    case "initiation":
    case "itc_institution":
      next.initiated_on = minDate(c.initiated_on, date)
      if (c.status === "unknown") next.status = "investigation"
      break
    case "prelim":
    case "final":
    case "itc_prelim":
    case "itc_final":
      if (c.status === "unknown" && !c.order_on) next.status = "investigation"
      // A negative final determination (Commerce or the ITC) ends an investigation
      if ((event === "final" || event === "itc_final" || event === "itc_prelim") && isNegative(title) && !c.order_on && newer) {
        next.status = "terminated"
        next.ended_on = date
      }
      break
    case "order":
      next.order_on = minDate(c.order_on, date)
      if (newer || c.status === "unknown" || c.status === "investigation") next.status = "order"
      break
    case "suspension":
      if (newer || c.status === "unknown") next.status = "suspended"
      break
    case "continuation":
      next.last_continued_on = maxDate(c.last_continued_on, date)
      if (newer || c.status === "unknown") next.status = "order"
      break
    case "revocation": {
      // A notice that continues some countries' orders and revokes others': only the countries the
      // revocation names are revoked
      const named = /Continuation/i.test(title) ? revokedCountries(title).map(countryFromName) : []
      if (named.length && c.country && !named.includes(c.country)) {
        next.last_continued_on = maxDate(c.last_continued_on, date)
        if (newer || c.status === "unknown") next.status = "order"
      } else if (newer) {
        next.status = "revoked"
        next.ended_on = maxDate(c.ended_on, date)
      }
      break
    }
    case "termination":
      if (newer && !c.order_on) {
        next.status = "terminated"
        next.ended_on = maxDate(c.ended_on, date)
      }
      break
    default:
      // A review, scope ruling or circumvention inquiry means there's an order (or agreement)
      if (c.status === "unknown" && !["other", "correction", "court"].includes(event)) next.status = "order"
  }
  // Signs an order thought ended is still live: listed for annual review after it "ended", or
  // reviewed long after (a final review result can come months after a real revocation)
  if ((next.status === "revoked" || next.status === "terminated") && next.ended_on && date > next.ended_on) {
    const listed = event === "review_opportunity" || event === "review_init" || event === "sunset_init"
    const longAfter = /^review_|^new_shipper|^scope_ruling|^circumvention|^changed_circumstances/.test(event) && daysBetween(next.ended_on, date) > LIVE_AFTER_DAYS
    if (listed || longAfter) {
      next.status = "order"
      next.ended_on = null
    }
  }
  next.first_seen_on = minDate(c.first_seen_on, date)
  next.last_activity_on = maxDate(c.last_activity_on, date)
  return next
}

// A list notice names the case as an order in effect on its date
const applyListRow = (c: CaseRow, row: ListRow, date: string): CaseRow => {
  const next = { ...c }
  if (!next.country && row.country_name) next.country = countryFromName(row.country_name)
  if (!next.product && row.product) next.product = row.product
  if (row.itc_number) next.itc_numbers = union(c.itc_numbers, [row.itc_number])
  const live = row.suspended ? "suspended" : "order"
  if (c.status === "unknown" || ((c.status === "revoked" || c.status === "terminated") && date > (c.ended_on ?? ""))) next.status = live as CaseStatus
  next.first_seen_on = minDate(c.first_seen_on, date)
  next.last_activity_on = maxDate(c.last_activity_on, date)
  return next
}

// A newer notice's scope replaces the case's; an older one only fills in a case with none
const applyScope = (c: CaseRow, scope: Scope, documentNumber: string, date: string): CaseRow => {
  if (c.scope_published_on && date < c.scope_published_on && (c.hts_main.length || c.hts_also.length)) return c
  // The same notice read again: its text is refreshed, the codes (perhaps checked by Sonnet) stay
  if (c.scope_doc === documentNumber && (c.hts_main.length || c.hts_also.length)) return { ...c, scope_text: storedScope(scope.text) }
  return {
    ...c,
    hts_main: scope.main,
    hts_also: scope.also,
    hts_excluded: scope.excluded,
    scope_text: storedScope(scope.text),
    scope_doc: documentNumber,
    scope_published_on: date,
    scope_method: "regex",
    scope_checked_at: new Date().toISOString(),
  }
}

// Fixed sentences for list notices (no AI): what the notice means for each case it names
const LIST_EVENTS: Partial<Record<EventType, { event: EventType; summary: string }>> = {
  list_opportunity: { event: "review_opportunity", summary: "The order's anniversary month: anyone with an interest could ask Commerce for an annual review of its rates." },
  list_review_init: { event: "review_init", summary: "Commerce started an annual administrative review, which resets company deposit rates for the period reviewed." },
  list_sunset_init: { event: "sunset_init", summary: "Commerce and the ITC started a five-year (sunset) review to decide whether the order continues." },
  list_scope_rulings: { event: "scope_ruling", summary: "Commerce listed scope rulings or scope ruling applications on this case." },
}

export interface ReadResult {
  read: number
  linked: number
  skipped: number
  newCases: number
  errors: string[]
}

const loadCases = async (db: Db, caseNumbers: string[]) => {
  if (!caseNumbers.length) return new Map<string, CaseRow>()
  const { data, error } = await db.from("adcvd_cases").select("*").in("case_number", caseNumbers)
  if (error) throw new Error(`Loading cases: ${error.message}`)
  return new Map((data as CaseRow[]).map((c) => [c.case_number, c]))
}

const saveCases = async (db: Db, cases: CaseRow[]) => {
  if (!cases.length) return
  // created_at is left to its default: in a batch mixing new and stored cases, a column some rows
  // lack would be written as null for them
  const rows = cases.map(({ created_at: _created, ...c }: CaseRow & { created_at?: string }) => ({ ...c, updated_at: new Date().toISOString() }))
  const { error } = await db.from("adcvd_cases").upsert(rows, { onConflict: "case_number" })
  if (error) throw new Error(`Saving cases: ${error.message}`)
}

const saveEvents = async (db: Db, events: EventRow[]) => {
  if (!events.length) return
  // One row per notice and case: a notice read again replaces its rows, keeping the summary and
  // rates already written for them (so reading a month again costs no AI)
  const docs = Array.from(new Set(events.map((e) => e.document_number)))
  const { data: before } = await db.from("adcvd_events").select("document_number, case_number, summary, rates, summarized_at").in("document_number", docs)
  const kept = new Map((before ?? []).map((e) => [`${e.document_number}|${e.case_number ?? ""}`, e]))
  const { error: deleteError } = await db.from("adcvd_events").delete().in("document_number", docs)
  if (deleteError) throw new Error(`Replacing events: ${deleteError.message}`)
  const rows = events.map((e) => {
    const old = kept.get(`${e.document_number}|${e.case_number ?? ""}`)
    return old?.summarized_at && !e.summarized_at ? { ...e, summary: old.summary, rates: old.rates, summarized_at: old.summarized_at } : e
  })
  const { error } = await db.from("adcvd_events").insert(rows)
  if (error) throw new Error(`Saving events: ${error.message}`)
}

// Reads one notice into cases and events. Returns whether it was about any case.
export const readNotice = async (db: Db, item: NoticeItem, text: string | null): Promise<{ linked: boolean; newCases: number; note?: string }> => {
  const agency = item.agencies.includes(AGENCY_NAMES.itc) ? "itc" : "commerce"
  const date = day(item.published_at)
  const documentNumber = item.document_number ?? item.external_id
  const event = eventOf(item.title, agency)
  const body = text ?? ""
  const header = headerLine(body) ?? ""
  const { product, countries: titleCountries } = titleParts(item.title)
  const base: Pick<EventRow, "item_id" | "document_number" | "published_on" | "agency" | "title" | "url" | "rates" | "product"> = {
    item_id: item.id,
    document_number: documentNumber,
    published_on: date,
    agency,
    title: item.title.replace(/\s+/g, " ").trim(),
    url: item.url,
    rates: null,
    product,
  }

  // ---- ITC notices: linked by investigation number, or kept unlinked until a case carries it
  if (agency === "itc") {
    const numbers = itcNumbers(header || body.slice(0, 3000))
    if (!numbers.length) return { linked: false, newCases: 0 }
    const { data, error } = await db.from("adcvd_cases").select("*").overlaps("itc_numbers", numbers)
    if (error) throw new Error(`Loading cases: ${error.message}`)
    const cases = (data ?? []) as CaseRow[]
    const shared: Omit<EventRow, "case_number"> = {
      ...base,
      event,
      summary: null,
      significant: SIGNIFICANT_EVENTS.includes(event),
      itc_numbers: numbers,
      countries: titleCountries.map(countryFromName).filter((c): c is string => !!c),
      hts_codes: itcCodes(body),
    }
    if (!cases.length) {
      await saveEvents(db, [{ ...shared, case_number: null }])
      return { linked: true, newCases: 0 }
    }
    await saveCases(db, cases.map((c) => ({ ...applyEvent(c, event, date, item.title), itc_numbers: union(c.itc_numbers, numbers) })))
    await saveEvents(db, cases.map((c) => ({ ...shared, case_number: c.case_number })))
    return { linked: true, newCases: 0 }
  }

  // ---- Commerce list notices: many cases, each with its row's product and country
  if (event.startsWith("list_")) {
    // Only the annual review lists are "Country: Product, case" rows; sunset tables put each
    // case's product after it, and scope ruling lists are prose, so those give case numbers only
    const tabular = event === "list_opportunity" || event === "list_review_init"
    const rows = listRows(body).map((r) => (tabular ? r : { ...r, product: null, country_name: null }))
    if (!rows.length) return { linked: false, newCases: 0 }
    const existing = await loadCases(db, rows.map((r) => r.case_number))
    const cases = rows.map((row) => applyListRow(existing.get(row.case_number) ?? blankCase(row.case_number), row, date))
    await saveCases(db, cases)
    const listEvent = LIST_EVENTS[event]
    if (listEvent) {
      await saveEvents(
        db,
        rows.map((row): EventRow => ({
          ...base,
          case_number: row.case_number,
          // A suspension agreement's row says so (the status follows from it)
          event: event === "list_opportunity" && row.suspended ? "suspension" : listEvent.event,
          summary: event === "list_opportunity" && row.suspended ? "A suspension agreement in its anniversary month: an annual review of it could be requested." : listEvent.summary,
          significant: false,
          itc_numbers: row.itc_number ? [row.itc_number] : [],
          countries: [],
          hts_codes: [],
          product: row.product,
          summarized_at: new Date().toISOString(),
        }))
      )
    }
    // The advance sunset lists split each case number around a contact column; they only repeat
    // orders the annual review lists name, so their gaps don't cost coverage
    const gap = event === "list_sunset_notice" ? 0 : listGap(body)
    const note = gap ? `Check ${documentNumber}: ${gap} case number${gap === 1 ? "" : "s"} in this list weren't read as rows (${item.url})` : undefined
    return { linked: true, newCases: rows.length - existing.size, note }
  }

  // ---- A notice about its own cases
  const own = Array.from(new Set([...(item.raw.docket_ids ?? []).flatMap((d) => caseNumbers(d)), ...caseNumbers(header)]))
  if (!own.length) return { linked: false, newCases: 0 }
  const existing = await loadCases(db, own)
  const scope = scopeOf(body)
  const single = titleCountries.length === 1 ? countryFromName(titleCountries[0]) : null
  const affirmativeCircumvention = event === "circumvention" && /Affirmative/i.test(item.title)
  const thirdCountries = affirmativeCircumvention ? circumventionCountries(item.title).map(countryFromName).filter((c): c is string => !!c) : []
  const numbers = itcNumbers(body)
  const cases = own.map((caseNumber) => {
    let c = existing.get(caseNumber) ?? blankCase(caseNumber)
    c = applyEvent(c, event, date, item.title)
    if (!c.country && single) c.country = single
    if (!c.product && product) c.product = product
    // Cases filed and ordered together share a scope: siblings fill in each other's codes
    if (own.length > 1 && own.length <= 30) c.siblings = union(c.siblings, own.filter((o) => o !== caseNumber))
    if (thirdCountries.length) c.third_countries = union(c.third_countries, thirdCountries.filter((t) => t !== c.country))
    // The ITC numbers an order or sunset notice cites for its investigation
    if (numbers.length && numbers.length <= 30 && ["order", "continuation", "revocation", "final", "sunset_result"].includes(event)) {
      c.itc_numbers = union(c.itc_numbers, numbers)
    }
    if (scope) c = applyScope(c, scope, documentNumber, date)
    return c
  })
  await saveCases(db, cases)
  await saveEvents(
    db,
    own.map((caseNumber): EventRow => ({
      ...base,
      case_number: caseNumber,
      event,
      summary: null,
      significant: SIGNIFICANT_EVENTS.includes(event),
      itc_numbers: [],
      countries: [],
      hts_codes: [],
    }))
  )
  return { linked: true, newCases: own.length - existing.size }
}

// Reads the month's unread notices until the deadline
export const readMonth = async (db: Db, month: string, { deadline, limit = 400 }: { deadline: number; limit?: number }): Promise<ReadResult & { remaining: boolean }> => {
  const result: ReadResult = { read: 0, linked: 0, skipped: 0, newCases: 0, errors: [] }
  const items = await unreadNotices(db, month, limit)
  for (const item of items) {
    if (Date.now() > deadline) return { ...result, remaining: true }
    try {
      const text = await noticeText(item.raw.raw_text_url)
      const { linked, newCases, note } = await readNotice(db, item, text)
      if (note) result.errors.push(note)
      result.read++
      if (linked) result.linked++
      else result.skipped++
      result.newCases += newCases
    } catch (e) {
      // Marked read anyway, so one bad notice can't stall the month; "Read again" on /adcvd retries it
      result.errors.push(`${item.document_number ?? item.external_id}: ${e instanceof Error ? e.message : String(e)}`)
    }
    await db.from("tariff_source_items").update({ adcvd_at: new Date().toISOString() }).eq("id", item.id)
  }
  return { ...result, remaining: items.length === limit }
}
