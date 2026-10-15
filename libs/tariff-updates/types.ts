import type { SourceId } from "../tariff-sources/types"

// Tariff updates: one per real-world tariff action, built from the source items that announce,
// sign, file, publish, implement and finally write it into the HTS. Labels here are shared by
// the processing code and the admin UI.

export const CATEGORIES = {
  tariff_action: "Tariff action",
  hts_revision: "HTS revision",
  ad_cvd: "AD/CVD",
  trade_related: "Trade, not a tariff change",
  not_relevant: "Not relevant",
} as const
export type Category = keyof typeof CATEGORIES

export const KINDS = {
  new_tariff: "New tariff",
  rate_change: "Rate change",
  scope_change: "Coverage change",
  exclusion: "Exclusion or exemption",
  pause: "Pause or delay",
  end: "Tariff ended",
  deadline: "Deadline or filing date",
  guidance: "CBP guidance",
  investigation: "Investigation or proposal",
  deal: "Trade deal",
  hts_revision: "HTS revision",
  other: "Other",
} as const
export type Kind = keyof typeof KINDS

export const AUTHORITIES = {
  section_232: "Section 232",
  section_301: "Section 301",
  section_122: "Section 122",
  section_338: "Section 338",
  section_201: "Section 201",
  ieepa: "IEEPA",
  trade_agreement: "Trade Agreements",
  quota: "Tariff Rate Quotas",
  hts: "HTS Revisions",
  other: "Other",
} as const
export type Authority = keyof typeof AUTHORITIES

// How far an action has got, in order
export const STAGES = {
  announced: "Announced",
  signed: "Signed",
  filed: "Filed in the Federal Register",
  published: "Published in the Federal Register",
  cbp_guidance: "CBP guidance",
  in_hts: "In the HTS",
} as const
export type Stage = keyof typeof STAGES
export const STAGE_ORDER = Object.keys(STAGES) as Stage[]

export const stageOfSource = (source: SourceId): Stage =>
  (
    ({
      ustr: "announced",
      white_house: "signed",
      federal_register_pi: "filed",
      federal_register: "published",
      csms: "cbp_guidance",
      usitc: "in_hts",
    }) as const
  )[source]

// Which item an update's title and summary come from: the most authoritative text
export const LEAD_PRIORITY: Record<SourceId, number> = {
  federal_register: 6,
  white_house: 5,
  federal_register_pi: 4,
  usitc: 3,
  ustr: 2,
  csms: 1,
}

// What Claude reads out of a tariff action's full text
export interface Extraction {
  headline: string
  summary: string
  kind: Kind
  authority: Authority
  countries: string[]
  hts_codes: string[]
  products: string | null
  effective_on: string | null
  confidence: number
  notes: string | null
  // The text was longer than Claude was given (see MAX_TEXT_CHARS)
  truncated?: boolean
}

// New updates below this go in hidden, for review
export const PUBLISH_CONFIDENCE = 0.75
// Items joined to an update below this flag it for review
export const MATCH_CONFIDENCE = 0.6
