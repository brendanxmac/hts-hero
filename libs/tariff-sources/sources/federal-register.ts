import type { Collector, SourceItem } from "../types"
import { clip, dateOnly, fetchJson, isoDay, mapLimit, toIso } from "../text"

// The Federal Register's API (no key). Two collectors:
// - federalRegister: published documents. Every presidential document, plus everything from the
//   trade agencies below. That includes many antidumping/countervailing notices from ITA and
//   section 337 notices from the ITC; sorting those out is the classifier's job.
// - federalRegisterPublicInspection: the same documents when they're filed for public inspection,
//   usually one to several business days before they're published.

const API = "https://www.federalregister.gov/api/v1"

export const TRADE_AGENCIES = [
  "trade-representative-office-of-united-states",
  "u-s-customs-and-border-protection",
  "industry-and-security-bureau",
  "international-trade-administration",
  "international-trade-commission",
]

const FIELDS = [
  "document_number",
  "title",
  "type",
  "subtype",
  "abstract",
  "html_url",
  "pdf_url",
  "raw_text_url",
  "publication_date",
  "signing_date",
  "effective_on",
  "agencies",
  "executive_order_number",
  "proclamation_number",
  "docket_ids",
]

interface Agency {
  name: string | null
  raw_name: string
  slug?: string
}

interface FrDocument {
  document_number: string
  title: string
  type: string
  subtype: string | null
  abstract: string | null
  html_url: string
  pdf_url: string | null
  raw_text_url: string | null
  publication_date: string
  signing_date: string | null
  effective_on: string | null
  agencies: Agency[]
  executive_order_number: string | null
  proclamation_number: string | null
  docket_ids: string[]
}

interface FrPage<T> {
  count: number
  next_page_url?: string | null
  results?: T[]
}

const agencyNames = (agencies: Agency[]) => agencies.map((a) => a.name ?? a.raw_name)

// Every page of a documents search. `conditions` are API conditions as [name, value] pairs, such
// as ["conditions[type][]", "PRESDOCU"]
const searchDocuments = async (conditions: [string, string][]) => {
  const params = new URLSearchParams([...conditions, ["per_page", "1000"], ["order", "newest"]])
  for (const field of FIELDS) params.append("fields[]", field)
  const documents: FrDocument[] = []
  let url: string | null = `${API}/documents.json?${params}`
  while (url) {
    const page: FrPage<FrDocument> = await fetchJson<FrPage<FrDocument>>(url)
    documents.push(...(page.results ?? []))
    url = page.next_page_url ?? null
  }
  return documents
}

export const federalRegister: Collector = {
  id: "federal_register",
  collect: async ({ since }) => {
    const published: [string, string] = ["conditions[publication_date][gte]", isoDay(since)]
    const [presidential, agencies] = await Promise.all([
      searchDocuments([published, ["conditions[type][]", "PRESDOCU"]]),
      searchDocuments([published, ...TRADE_AGENCIES.map((slug): [string, string] => ["conditions[agencies][]", slug])]),
    ])
    return [...presidential, ...agencies].map(
      (doc): SourceItem => ({
        source: "federal_register",
        externalId: doc.document_number,
        title: doc.title,
        url: doc.html_url,
        publishedAt: dateOnly(doc.publication_date),
        summary: clip(doc.abstract),
        docType: doc.subtype ?? doc.type,
        agencies: agencyNames(doc.agencies),
        documentNumber: doc.document_number,
        raw: {
          type: doc.type,
          signing_date: doc.signing_date,
          effective_on: doc.effective_on,
          proclamation_number: doc.proclamation_number,
          executive_order_number: doc.executive_order_number,
          docket_ids: doc.docket_ids,
          pdf_url: doc.pdf_url,
          raw_text_url: doc.raw_text_url,
        },
      })
    )
  },
}

interface PiDocument {
  document_number: string
  title: string
  type: string
  filing_type: string | null
  agencies: Agency[]
  html_url: string
  pdf_url: string | null
  filed_at: string
  publication_date: string | null
  editorial_note: string | null
  toc_subject: string | null
  toc_doc: string | null
}

const isTradeDocument = (doc: PiDocument) =>
  doc.type === "Presidential Document" || doc.agencies.some((a) => a.slug && TRADE_AGENCIES.includes(a.slug))

const piItem = (doc: PiDocument): SourceItem => ({
  source: "federal_register_pi",
  externalId: doc.document_number,
  // Public inspection titles carry trailing spaces and doubled quotes from the filing
  title: doc.title.replace(/''/g, '"').replace(/\s+/g, " ").trim(),
  url: doc.html_url,
  publishedAt: toIso(doc.filed_at),
  summary: doc.publication_date ? `Scheduled to be published ${doc.publication_date}.` : null,
  docType: doc.type,
  agencies: agencyNames(doc.agencies),
  documentNumber: doc.document_number,
  raw: {
    publication_date: doc.publication_date,
    filing_type: doc.filing_type,
    editorial_note: doc.editorial_note,
    pdf_url: doc.pdf_url,
  },
})

// Weekdays from `since` through today
const weekdays = (since: Date) => {
  const days: string[] = []
  for (const d = new Date(`${isoDay(since)}T12:00:00Z`); d <= new Date(); d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) days.push(isoDay(d))
  }
  return days
}

export const federalRegisterPublicInspection: Collector = {
  id: "federal_register_pi",
  collect: async ({ since, backfill }) => {
    const pages = backfill
      ? await mapLimit(weekdays(since), 4, (day) =>
          fetchJson<FrPage<PiDocument>>(`${API}/public-inspection-documents.json?conditions[available_on]=${day}&per_page=1000`)
        )
      : [await fetchJson<FrPage<PiDocument>>(`${API}/public-inspection-documents/current.json`)]
    return pages
      .flatMap((page) => page.results ?? [])
      .filter(isTradeDocument)
      .map(piItem)
      .filter((item) => new Date(item.publishedAt) >= since)
  },
}
