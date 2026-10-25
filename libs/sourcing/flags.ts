import { columnAssignments } from "@/tariffs/engine-v2/data/columns"

// Compliance flags for the Tracker's Sourcing tab: things that can stop or slow goods from a
// country, from US government sources (public domain), each with where it comes from. We find,
// flag and explain; whether goods may enter is Customs' call, and a broker's or counsel's to advise
// on. A country or sector flag says nothing about a particular supplier.

export type FlagTone = "error" | "warning" | "info"

export interface SourcingFlag {
  id: string
  tone: FlagTone
  // A few words, for a chip
  label: string
  // A sentence on what it means
  detail: string
  source: string
  url: string
}

// Comprehensive OFAC sanctions programs that cover imports from the whole country
const EMBARGOED: Record<string, string> = {
  CU: "Cuba",
  IR: "Iran",
  KP: "North Korea",
}
const OFAC_URL = "https://ofac.treasury.gov/sanctions-programs-and-country-information"

// Countries without normal trade relations (Column 2 rates, general note 3(b)), from the engine
const COLUMN_TWO = new Set(columnAssignments.filter((c) => c.column === "column2").map((c) => c.country))

// DHS's UFLPA high-priority sectors, matched to the HTS headings and subheadings they cover (our
// mapping, by HTS prefix). Goods made wholly or partly in Xinjiang, from any country, are presumed
// made with forced labor and barred unless the importer proves otherwise.
const UFLPA_SECTORS: { sector: string; prefixes: string[] }[] = [
  { sector: "apparel", prefixes: ["61", "62"] },
  { sector: "cotton and cotton products", prefixes: ["5201", "5202", "5203", "5204", "5205", "5206", "5207", "5208", "5209", "5210", "5211", "5212", "63"] },
  { sector: "silica-based products, including polysilicon", prefixes: ["280461", "280469", "854142", "854143"] },
  { sector: "tomatoes and tomato products", prefixes: ["0702", "2002", "210320"] },
  { sector: "aluminum", prefixes: ["76"] },
  { sector: "PVC", prefixes: ["3904"] },
  { sector: "seafood", prefixes: ["03", "1604", "1605"] },
  { sector: "steel", prefixes: ["72", "73"] },
  { sector: "copper", prefixes: ["74"] },
  { sector: "lithium", prefixes: ["282520", "283691", "850760"] },
  { sector: "red dates (jujubes)", prefixes: ["081340"] },
]
const UFLPA_URL = "https://www.dhs.gov/uflpa"

// The UFLPA high-priority sector an HTS code falls in, if any
export const uflpaSector = (htsno: string) => {
  const digits = htsno.replace(/\D/g, "")
  return UFLPA_SECTORS.find((s) => s.prefixes.some((p) => digits.startsWith(p)))?.sector ?? null
}

// AGOA is authorized only through the end of 2026 (reauthorized Feb 3, 2026)
const AGOA_SYMBOL = "D"
const AGOA_URL = "https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa"

// A country's flags for one HTS code. agreement: the trade agreement symbol it could claim, if any
export const countryFlags = (country: string, htsno: string, agreement?: string): SourcingFlag[] => {
  const flags: SourcingFlag[] = []
  if (EMBARGOED[country]) {
    flags.push({
      id: "embargo",
      tone: "error",
      label: "US sanctions",
      detail: `A comprehensive US sanctions program covers ${EMBARGOED[country]}: imports are generally prohibited without an OFAC license.`,
      source: "U.S. Treasury, OFAC",
      url: OFAC_URL,
    })
  }
  if (country === "RU") {
    flags.push({
      id: "russia",
      tone: "error",
      label: "Import bans",
      detail: "US executive orders ban imports of several Russian goods (among them seafood, alcohol, non-industrial diamonds, gold and some metals); check the OFAC determinations before sourcing.",
      source: "U.S. Treasury, OFAC",
      url: "https://ofac.treasury.gov/sanctions-programs-and-country-information/russian-harmful-foreign-activities-sanctions",
    })
  }
  if (COLUMN_TWO.has(country)) {
    flags.push({
      id: "column2",
      tone: "error",
      label: "Column 2 rates",
      detail: "No normal trade relations with the US: goods pay the HTS's Column 2 rates, usually far above the general rates.",
      source: "HTS General Note 3(b)",
      url: "https://hts.usitc.gov/",
    })
  }
  const sector = uflpaSector(htsno)
  if (sector && country === "CN") {
    flags.push({
      id: "uflpa",
      tone: "warning",
      label: "UFLPA priority sector",
      detail: `DHS names ${sector} a high-priority sector under the Uyghur Forced Labor Prevention Act. Goods made wholly or partly in Xinjiang are presumed barred unless the importer proves otherwise, so expect to show supply-chain tracing.`,
      source: "U.S. Department of Homeland Security",
      url: UFLPA_URL,
    })
  }
  if (agreement === AGOA_SYMBOL) {
    flags.push({
      id: "agoa",
      tone: "info",
      label: "AGOA ends Dec 31, 2026",
      detail: "Its AGOA rate depends on a program authorized only through December 31, 2026, unless Congress renews it.",
      source: "AGOA reauthorization, Feb 3, 2026",
      url: AGOA_URL,
    })
  }
  return flags
}

// Can't realistically be a new source (sanctions or no normal trade relations)
export const isBlocked = (flags: SourcingFlag[]) => flags.some((f) => f.id === "embargo" || f.id === "column2")
