import { LIVE_STATUSES, type CaseKind, type CaseRow, type CaseStatus, type EventRow, type EventType, type Rates } from "./types"

// Whether an import (HTS code + country of origin) may be covered by AD/CVD cases. Plain code,
// shared by the server (the lookup route) and the client (the Tracker's chips). Levels:
//   likely    the case's country is the import's and the scope lists the import's code, or a
//             heading above it, as what the covered goods are classified under; the case is live
//   possible  the code is on the "may also enter under" list, shares a six-digit subheading with
//             a listed code, is listed but renumbered since, or the case reaches this country only
//             through a circumvention ruling; or a petition names this country and code
//   history   the same match on a case that ended in the past year
// Never more than "likely": scope is decided by the product description, not the HTS code, and
// only the importer and their broker know the product. We flag, explain and link the source.

export type AdcvdLevel = "likely" | "possible" | "history"

export type MatchableCase = Pick<
  CaseRow,
  "case_number" | "kind" | "country" | "product" | "status" | "ended_on" | "third_countries" | "hts_main" | "hts_also" | "hts_excluded" | "hts_outdated" | "hts_successors"
>

export type MatchReason =
  | "country"
  | "third_country"
  | "listed"
  | "listed_renumbered"
  | "also_listed"
  | "same_subheading"
  | "renumbered"
  | "petition"
  | "live"
  | "ended"

export interface CaseMatch {
  case_number: string
  level: AdcvdLevel
  // The scope code that matched (digits)
  code: string | null
  reasons: MatchReason[]
}

// Recently ended cases stay on an import's timeline this long
export const HISTORY_DAYS = 365

const digitsOf = (code: string) => code.replace(/\D/g, "")

// A scope code names the import: the import is under it, or (an 8-digit import) one of its
// 10-digit lines is the one listed
export const scopeNames = (scopeCode: string, code: string) => code.startsWith(scopeCode) || (code.length === 8 && scopeCode.startsWith(code))

const ended = (c: Pick<CaseRow, "status">) => c.status === "revoked" || c.status === "terminated"

export const matchCase = (c: MatchableCase, item: { code: string; country: string }, today = new Date()): CaseMatch | null => {
  const code = digitsOf(item.code)
  const country = item.country.toUpperCase()
  if (code.length < 6) return null
  const direct = c.country === country
  const via = !direct && c.third_countries.includes(country)
  if (!direct && !via) return null
  if (ended(c)) {
    const since = c.ended_on ? (today.getTime() - new Date(c.ended_on).getTime()) / 86_400_000 : Infinity
    if (since > HISTORY_DAYS) return null
  } else if (!LIVE_STATUSES.includes(c.status as CaseStatus) && c.status !== "unknown") return null

  const current = c.hts_main.filter((s) => !c.hts_outdated.includes(s))
  const listed = current.find((s) => scopeNames(s, code))
  // A listed code the HTS has since replaced: the import is under one of its replacements. On the
  // old code's own 8-digit line it's as good as listed; a replacement elsewhere in its subheading
  // is only possible.
  const successors = c.hts_successors ?? {}
  const replaced = listed
    ? undefined
    : c.hts_main
        .flatMap((old) => (successors[old] ?? []).filter((n) => scopeNames(n, code)).map((n) => ({ old, n })))
        .sort((a, b) => Number(b.n.slice(0, 8) === b.old.slice(0, 8)) - Number(a.n.slice(0, 8) === a.old.slice(0, 8)))[0]
  // A code named only for excluded products, and not also listed as covered: not this case
  if (!listed && !replaced && c.hts_excluded.some((s) => scopeNames(s, code))) return null
  const alsoListed = listed || replaced ? undefined : c.hts_also.filter((s) => !c.hts_outdated.includes(s)).find((s) => scopeNames(s, code))
  // A renumbered code (usually a 10-digit statistical line split or replaced) still names its
  // 8-digit line; shorter ones their subheading
  const renumbered = listed || replaced || alsoListed ? undefined : c.hts_outdated.find((s) => { const n = s.length >= 10 ? 8 : 6; return s.slice(0, n) === code.slice(0, n) })
  const subheading = listed || replaced || alsoListed || renumbered ? undefined : current.find((s) => s.length >= 6 && s.slice(0, 6) === code.slice(0, 6))
  const matched = listed ?? replaced?.old ?? alsoListed ?? renumbered ?? subheading
  if (!matched) return null

  const live = LIVE_STATUSES.includes(c.status as CaseStatus)
  const reasons: MatchReason[] = [via ? "third_country" : "country"]
  reasons.push(listed ? "listed" : replaced ? "listed_renumbered" : alsoListed ? "also_listed" : renumbered ? "renumbered" : "same_subheading")
  reasons.push(ended(c) ? "ended" : "live")
  const asListed = !!listed || (!!replaced && replaced.n.slice(0, 8) === replaced.old.slice(0, 8))
  const level: AdcvdLevel = ended(c) ? "history" : asListed && direct && live ? "likely" : "possible"
  return { case_number: c.case_number, level, code: matched, reasons }
}

export const matchCases = (cases: MatchableCase[], item: { code: string; country: string }, today = new Date()) =>
  cases.map((c) => matchCase(c, item, today)).filter((m): m is CaseMatch => !!m)

// A petition's ITC notice, before Commerce has opened its cases: the countries and codes it names
export const matchPetition = (e: Pick<EventRow, "countries" | "hts_codes">, item: { code: string; country: string }) => {
  const code = digitsOf(item.code)
  return e.countries.includes(item.country.toUpperCase()) && e.hts_codes.some((s) => s.length >= 6 && (scopeNames(s, code) || s.slice(0, 6) === code.slice(0, 6)))
}

const LEVEL_ORDER: Record<AdcvdLevel, number> = { likely: 0, possible: 1, history: 2 }
export const strongest = (levels: AdcvdLevel[]) => levels.slice().sort((a, b) => LEVEL_ORDER[a] - LEVEL_ORDER[b])[0] ?? null

// ---------- The lookup's answer ----------

export interface FlagCompany {
  company: string
  rate: number | null
  // dumping_margin, subsidy_rate, or cash_deposit (what CBP collects, when it differs)
  basis?: string | null
  excluded: boolean
  as_of: string
}

export interface FlagCase {
  case_number: string
  // Each producer's latest rate, and producers excluded from the order (Tracker only)
  companies?: FlagCompany[]
  kind: CaseKind
  status: CaseStatus
  initiated_on: string | null
  order_on: string | null
  last_continued_on: string | null
  ended_on: string | null
  rates: Rates | null
}

export interface FlagEvent {
  date: string
  event: EventType
  label: string
  summary: string
  url: string
  document_number: string
  milestone: boolean
}

// One proceeding on one product (its AD and CVD cases together) that may cover the import
export interface AdcvdFlag {
  level: AdcvdLevel
  product: string
  // ISO alpha-2: the case's own country
  country: string | null
  // The import reaches it through a circumvention ruling
  via_circumvention: boolean
  cases: FlagCase[]
  reasons: MatchReason[]
  code: string | null
  // The scope's own sentence naming the code, with where it came from
  evidence: { quote: string; document_number: string; published_on: string | null } | null
  events: FlagEvent[]
  // The HTS codes its scope lists (current ones): what the covered goods are classified under, and
  // what they may also enter under
  scope_codes?: { main: string[]; also: string[] }
  // Estimates from the case's dates, labelled as such where shown
  next: { review_month: string | null; sunset_due: string | null }
}

export interface AdcvdLookup {
  code: string
  country: string
  checked_at: string
  flags: AdcvdFlag[]
  // ITC notices on a new petition naming this country and a matching code
  petitions: FlagEvent[]
}

// What anyone may know about one import (the calculator's teaser, signed out): whether any live
// case or new petition may cover it, not which
export interface AdcvdSummary {
  code: string
  country: string
  checked_at: string
  // Live cases (an AD case and its CVD twin are two)
  cases: number
  likely: boolean
  petitions: number
}

// The scope sentence that names a code, written however the notice writes it ("3203.00.8000",
// "7317.00.55.02")
export const evidenceSentence = (scopeText: string, code: string) => {
  const pattern = new RegExp(code.split("").join("\\.?"))
  const flat = scopeText.replace(/\s+/g, " ")
  const at = flat.search(pattern)
  if (at < 0) return null
  const dot = flat.lastIndexOf(". ", at)
  const start = Math.max(dot >= 0 ? dot + 2 : 0, at - 400)
  const endDot = flat.slice(at).search(/\.\s+[A-Z(]|\.$/)
  const end = endDot >= 0 ? Math.min(at + endDot + 1, at + 500) : Math.min(flat.length, at + 400)
  return flat.slice(start, end).trim()
}

// The month an order's annual review opens (its anniversary) and when its next five-year review
// is due, from its dates
export const nextDates = (c: Pick<FlagCase, "order_on" | "last_continued_on" | "status">, today = new Date()) => {
  if (c.status !== "order" && c.status !== "suspended") return { review_month: null, sunset_due: null }
  const base = c.last_continued_on ?? c.order_on
  const review = c.order_on ? new Date(`${c.order_on}T12:00:00Z`) : null
  let reviewMonth: string | null = null
  if (review) {
    review.setUTCFullYear(today.getUTCFullYear())
    if (review < today) review.setUTCFullYear(today.getUTCFullYear() + 1)
    reviewMonth = review.toISOString().slice(0, 7)
  }
  let sunset: string | null = null
  if (base) {
    const due = new Date(`${base}T12:00:00Z`)
    due.setUTCFullYear(due.getUTCFullYear() + 5)
    sunset = due.toISOString().slice(0, 7)
  }
  return { review_month: reviewMonth, sunset_due: sunset }
}
