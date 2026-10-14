// The government sources /tariff-updates is built from. Each collector reads one source's feed or
// API and returns its items as they are; classifying and grouping them into updates comes later.

export type SourceId = "white_house" | "federal_register" | "federal_register_pi" | "csms" | "ustr" | "usitc"

export const SOURCES: Record<SourceId, { label: string; home: string }> = {
  white_house: { label: "White House", home: "https://www.whitehouse.gov/presidential-actions/" },
  federal_register_pi: { label: "Federal Register (public inspection)", home: "https://www.federalregister.gov/public-inspection/current" },
  federal_register: { label: "Federal Register", home: "https://www.federalregister.gov/" },
  csms: { label: "CBP CSMS", home: "https://www.cbp.gov/trade/automated/cargo-systems-messaging-service" },
  ustr: { label: "USTR", home: "https://ustr.gov/about/policy-offices/press-office/press-releases" },
  usitc: { label: "USITC HTS", home: "https://hts.usitc.gov/" },
}

export const SOURCE_IDS = Object.keys(SOURCES) as SourceId[]

export interface SourceItem {
  source: SourceId
  // The source's own id: a Federal Register document number, a CSMS number, a URL…
  externalId: string
  title: string
  url: string
  // ISO timestamp. Sources that only give a date get 10:00 UTC (6 a.m. Eastern, when the
  // Federal Register goes up), so the day never shifts in US time zones.
  publishedAt: string
  summary?: string | null
  // "Proclamation", "Executive Order", "Rule", "Notice", "CSMS message", "HTS revision"…
  docType?: string | null
  agencies?: string[]
  // Federal Register document number, shared by an item's public-inspection and published copies
  documentNumber?: string | null
  raw?: Record<string, unknown>
}

export interface CollectOptions {
  // Items published before this are left out
  since: Date
  // Read archives too (page through feeds, monthly listings), not just the latest items
  backfill: boolean
}

export interface Collector {
  id: SourceId
  collect: (options: CollectOptions) => Promise<SourceItem[]>
}
