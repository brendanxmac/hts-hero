// AD/CVD cases and the notices about them. A case is one product from one country under one law:
// antidumping (A-533-938) or countervailing (C-533-939). Commerce (ITA) sets the scope and rates,
// the ITC decides injury, and an order lasts until a five-year (sunset) review ends it. Labels here
// are shared by the processing code, the admin page and the import flags.

export type CaseKind = "AD" | "CVD"

export const STATUSES = {
  investigation: "Investigation",
  order: "Order in effect",
  suspended: "Suspension agreement",
  revoked: "Revoked",
  terminated: "Ended without an order",
  unknown: "Unknown",
} as const
export type CaseStatus = keyof typeof STATUSES

// Live: duties can apply (an order or suspension agreement) or soon may (an open investigation)
export const LIVE_STATUSES: CaseStatus[] = ["investigation", "order", "suspended"]

// What a notice is. Commerce events first, then the ITC's, then Commerce's list notices (which
// name many cases at once).
export const EVENTS = {
  initiation: "Investigation started",
  prelim: "Preliminary determination",
  final: "Final determination",
  order: "Order issued",
  review_opportunity: "Annual review can be requested",
  review_init: "Annual review started",
  review_prelim: "Annual review: preliminary results",
  review_final: "Annual review: final results",
  review_other: "Annual review",
  new_shipper: "New shipper review",
  sunset_init: "Five-year review started",
  sunset_result: "Five-year review results",
  continuation: "Order continued",
  revocation: "Order revoked",
  final_period: "Listed for a final period: the order has ended",
  termination: "Investigation ended",
  suspension: "Suspension agreement",
  circumvention: "Circumvention inquiry",
  scope_ruling: "Scope ruling",
  changed_circumstances: "Changed circumstances review",
  court: "Court decision",
  correction: "Correction",
  other: "Other notice",
  itc_institution: "Petition filed: ITC investigation started",
  itc_prelim: "ITC preliminary vote",
  itc_final: "ITC final vote",
  itc_negative: "ITC voted no: the investigation ends",
  itc_sunset: "ITC five-year review",
  itc_schedule: "ITC schedule",
  itc_other: "ITC notice",
  cbp_message: "CBP instructions",
  list_opportunity: "Annual review opportunities",
  list_review_init: "Annual reviews started",
  list_sunset_init: "Five-year reviews started",
  list_sunset_notice: "Five-year reviews coming up",
  list_scope_rulings: "Scope rulings list",
} as const
export type EventType = keyof typeof EVENTS

// Events that change whether, or how, duties apply: these go to /tariff-updates and the news.
// Routine annual reviews show only on the case and import timelines.
export const SIGNIFICANT_EVENTS: EventType[] = [
  "initiation",
  "prelim",
  "final",
  "order",
  "continuation",
  "revocation",
  "termination",
  "suspension",
  "circumvention",
  "scope_ruling",
  "itc_institution",
  "itc_prelim",
  "itc_final",
]

// Milestones of a live case, kept on an import's timeline however old they are
export const MILESTONE_EVENTS: EventType[] = ["initiation", "itc_institution", "prelim", "final", "order", "continuation", "suspension"]

// Rates a notice sets, in percent. `basis` says which: Commerce's dumping margins, its subsidy
// rates, or the cash deposit rates CBP collects.
export interface Rates {
  low: number | null
  high: number | null
  all_others: number | null
  basis: "dumping_margin" | "subsidy_rate" | "cash_deposit"
  as_of: string
  doc: string
}

// Rates worth showing: at least one above zero. A notice that sets none (a rescission, a schedule)
// sometimes reads as all zeros; showing "0%" would mislead.
export const ratesSet = (r: Pick<Rates, "low" | "high" | "all_others"> | null | undefined) => !!r && [r.low, r.high, r.all_others].some((v) => v !== null && v > 0)

export interface CaseRow {
  case_number: string
  kind: CaseKind
  commerce_country: string
  country: string | null
  product: string | null
  status: CaseStatus
  initiated_on: string | null
  order_on: string | null
  last_continued_on: string | null
  ended_on: string | null
  itc_numbers: string[]
  siblings: string[]
  third_countries: string[]
  hts_main: string[]
  hts_also: string[]
  hts_excluded: string[]
  hts_outdated: string[]
  // Renumbered scope codes → the current codes that replaced them
  hts_successors?: Record<string, string[]>
  // Where each code in hts_* came from (codes.ts): "fr:<document>", "ita-scope", "ita-list", "itc-petition"
  hts_sources?: Record<string, string[]>
  // The Federal Register scope's codes (scope.ts, notices.ts); hts_* are these merged with ITA's
  fr_main?: string[]
  fr_also?: string[]
  fr_excluded?: string[]
  // ITA's public case page (ita.ts): null until fetched, false when ITA has no page for the case
  ita_found?: boolean | null
  ita_hts?: string[]
  ita_scope?: string | null
  ita_main?: string[]
  ita_also?: string[]
  ita_excluded?: string[]
  ita_method?: "regex" | "sonnet" | null
  ita_fetched_at?: string | null
  scope_text: string | null
  scope_doc: string | null
  scope_published_on: string | null
  scope_method: "regex" | "sonnet" | "sibling" | "opus" | "none" | null
  scope_checked_at: string | null
  rates: Rates | null
  problems: string[]
  first_seen_on: string | null
  last_activity_on: string | null
  updated_at?: string
}

export interface EventRow {
  id?: string
  case_number: string | null
  item_id: string | null
  document_number: string
  published_on: string
  agency: "commerce" | "itc" | "cbp"
  event: EventType
  title: string
  url: string
  summary: string | null
  rates: Rates | null
  significant: boolean
  itc_numbers: string[]
  countries: string[]
  hts_codes: string[]
  product: string | null
  update_id?: string | null
  summarized_at?: string | null
}

export interface CompanyRate {
  case_number: string
  company: string
  rate: number | null
  basis: Rates["basis"] | null
  excluded: boolean
  as_of: string
  doc: string
}

export interface MonthRow {
  month: string
  status: "pending" | "running" | "done" | "paused" | "error"
  notices: number
  linked: number
  new_cases: number
  scopes_found: number
  cost_usd: number
  step: string | null
  started_at: string | null
  finished_at: string | null
  error: string | null
}

// Federal Register document links
export const frDocUrl = (documentNumber: string) => `https://www.federalregister.gov/d/${documentNumber}`
// Commerce's own case search, and CBP's AD/CVD messages, for checking a case at the source
export const ACCESS_URL = "https://access.trade.gov/adcvd"
export const CBP_MESSAGES_URL = "https://trade.cbp.dhs.gov/ace/adcvd/adcvd-public/"
