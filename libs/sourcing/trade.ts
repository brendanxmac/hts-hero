// What the US imported of one HTS code, by country, from the Census Bureau's international trade
// API (/api/sourcing/trade), for the Tracker's Sourcing tab. Plain types and helpers, shared by the
// route and the page.
//
// Census terms (https://www.census.gov/data/developers/about/terms-of-service.html): show its
// notice wherever this is used, don't alter the figures while crediting Census, and never use them
// to identify a business. These are published country-by-product totals only.

// Twelve months of one country's imports, in USD (quantity in the code's first unit)
export interface TradeTotals {
  // General imports, customs value
  value: number
  // Freight, insurance and other charges to bring it to the US port (CIF minus customs value)
  charges: number
  // By vessel and by air: value and charges
  vesVal: number
  vesCha: number
  airVal: number
  airCha: number
  // Imports for consumption: value and quantity (for a unit value)
  conVal: number
  qty: number
}

export interface TradeCountry {
  // The last 12 months
  last: TradeTotals
  // General imports in the 12 months before those
  prior: number
  // General imports each month, oldest first (TradeData.months)
  monthly: number[]
  // Where it entered the US in the last full year: [Census district, share of value], largest first
  districts: [string, number][]
}

export type TradeLevel = "HS10" | "HS8" | "HS6"
export const LEVEL_DIGITS: Record<TradeLevel, number> = { HS10: 10, HS8: 8, HS6: 6 }

export interface TradeData {
  code: string
  // The level these figures are for: the code itself, every code under its 8 digits, or every
  // code under its 6-digit subheading. Asked for (requested), or the next one up when the code
  // has had no imports in the last 12 months (a code renumbered in a recent HTS revision)
  level: TradeLevel
  requested: TradeLevel
  // The code's own last 12 months, whatever the level, for its average unit value
  exact: { unit: string | null; conVal: number; qty: number } | null
  // Every 10-digit code under the subheading: [code, US imports in the last 12 months], largest first
  codes: [string, number][]
  // Countries that ship this subheading to the US under codes outside the level shown, and little
  // or none under it, in the last 12 months: country → [code, value] (when the level is the code or
  // its 8 digits)
  elsewhere: Record<string, [string, number][]>
  // The first unit of quantity ("NO", "KG", "DOZ"…), or null when the code has none
  unit: string | null
  // "2023-09"… the latest month Census has published, oldest first
  months: string[]
  districtYear: number
  total: Omit<TradeCountry, "districts">
  countries: Record<string, TradeCountry>
  retrieved: string
}

export const emptyTotals = (): TradeTotals => ({ value: 0, charges: 0, vesVal: 0, vesCha: 0, airVal: 0, airCha: 0, conVal: 0, qty: 0 })

// Freight and insurance as a share of the goods' value. Land shipments (Canada, Mexico) carry
// almost no recorded charges, so only the vessel and air share say much: null below $50k shipped
// that way, where one shipment would swing it.
export const freightShare = (t: TradeTotals) => {
  const value = t.vesVal + t.airVal
  return value >= 50_000 ? ((t.vesCha + t.airCha) / value) * 100 : null
}

// How it travels: the share by air, by vessel and the rest (land, mail, pipeline…)
export const modeMix = (t: TradeTotals) => {
  if (!(t.value > 0)) return null
  const air = Math.min(1, t.airVal / t.value)
  const vessel = Math.min(1 - air, t.vesVal / t.value)
  return { air, vessel, other: Math.max(0, 1 - air - vessel) }
}

// Average customs value per unit, when the code counts units and enough was shipped to say
export const unitValue = (t: TradeTotals) => (t.qty > 0 && t.conVal >= 10_000 ? t.conVal / t.qty : null)

// Census's units of quantity, in words
export const UNIT_NAMES: Record<string, [string, string]> = {
  NO: ["unit", "units"],
  KG: ["kg", "kg"],
  DOZ: ["dozen", "dozen"],
  PRS: ["pair", "pairs"],
  DPR: ["dozen pairs", "dozen pairs"],
  M2: ["m²", "m²"],
  M3: ["m³", "m³"],
  M: ["m", "m"],
  L: ["liter", "liters"],
  T: ["metric ton", "metric tons"],
  DOZPRS: ["dozen pairs", "dozen pairs"],
  GROSS: ["gross", "gross"],
  THS: ["thousand", "thousand"],
  CTN: ["carat", "carats"],
  BBL: ["barrel", "barrels"],
}

// Another code a product's AD/CVD cases cover, and what the US imported under it in the last 12
// months (/api/sourcing/related): all countries, and the largest suppliers [country, USD]
export interface RelatedCode {
  code: string
  total: number
  top: [string, number][]
  through?: string
}

// Who supplies a product by other sources, at its 6-digit group (/api/sourcing/partners): US
// imports by country and year from the Atlas (importer and exporter reports reconciled) and from
// Census at the same level and years, where each country's exports go, and EU imports by country
// (euros)
export interface YearlyByCountry {
  years: number[]
  byCountry: Record<string, Record<number, number>>
}
// Each exporter's exports of one 6-digit product (thousands of USD), by year: to the world (t),
// and to its largest destinations, the US and the usual transshipment hubs (d), from the Atlas's
// country-to-country data (scripts/sourcing/build_bilateral.py, in Supabase Storage)
export interface Bilateral {
  source: string
  url: string
  license: string
  years: number[]
  unit: string
  e: Record<string, { t: number[]; d: Record<string, number[]> }>
}

export interface CrossSources {
  group: string
  // Each country's exports of the group to the US, from the Atlas (USD)
  atlas: YearlyByCountry | null
  // Where each country's exports of the group go
  bilateral: Bilateral | null
  census: YearlyByCountry | null
  eu: YearlyByCountry | null
}
