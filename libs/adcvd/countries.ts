import { Countries } from "../../constants/countries"

// Commerce's three-digit country codes, the middle of a case number (A-533-938 is India). Built
// from Federal Register titles 2010–2026: every single-case notice "… From <country>" voted for its
// code, and each code below won by a wide margin. Codes not listed fall back to the country a
// notice's title or list row names, and the case is flagged in the admin page's problems.
export const COMMERCE_COUNTRIES: Record<string, string> = {
  "122": "CA",
  "201": "MX",
  "274": "TT",
  "301": "CO",
  "307": "VE",
  "331": "EC",
  "337": "CL",
  "351": "BR",
  "357": "AR",
  "400": "IS",
  "403": "NO",
  "405": "FI",
  "412": "GB",
  "421": "NL",
  "423": "BE",
  "427": "FR",
  "428": "DE",
  "433": "AT",
  "441": "CH",
  "449": "LV",
  "455": "PL",
  "469": "ES",
  "471": "PT",
  "475": "IT",
  "484": "GR",
  "485": "RO",
  "487": "BG",
  "489": "TR",
  "507": "IR",
  "508": "IL",
  "517": "SA",
  "518": "QA",
  "520": "AE",
  "523": "OM",
  "525": "BH",
  "533": "IN",
  "535": "PK",
  "542": "LK",
  "546": "MM",
  "549": "TH",
  "552": "VN",
  "553": "LA",
  "555": "KH",
  "557": "MY",
  "559": "SG",
  "560": "ID",
  "565": "PH",
  "570": "CN",
  "580": "KR",
  "583": "TW",
  "588": "JP",
  "602": "AU",
  "714": "MA",
  "721": "DZ",
  "723": "TN",
  "729": "EG",
  "762": "AO",
  "791": "ZA",
  "801": "RS",
  "803": "XK",
  "821": "RU",
  "822": "BY",
  "823": "UA",
  "831": "AM",
  "834": "KZ",
  "841": "MD",
  "851": "CZ",
  "856": "SI",
  "891": "HR",
  "893": "BA",
}

// How Federal Register notices write countries that the country list names differently
const ALIASES: Record<string, string> = {
  china: "CN",
  "people's republic of china": "CN",
  prc: "CN",
  korea: "KR",
  "south korea": "KR",
  "republic of korea": "KR",
  turkey: "TR",
  turkiye: "TR",
  "türkiye": "TR",
  "republic of turkiye": "TR",
  "republic of türkiye": "TR",
  "republic of turkey": "TR",
  russia: "RU",
  "russian federation": "RU",
  vietnam: "VN",
  "viet nam": "VN",
  "socialist republic of vietnam": "VN",
  "socialist of vietnam": "VN",
  taiwan: "TW",
  burma: "MM",
  laos: "LA",
  "lao people's democratic republic": "LA",
  "united kingdom": "GB",
  uk: "GB",
  iran: "IR",
  "islamic republic of iran": "IR",
  "czech republic": "CZ",
  czechia: "CZ",
  kosovo: "XK",
  "the netherlands": "NL",
  netherlands: "NL",
  "united arab emirates": "AE",
  uae: "AE",
  moldova: "MD",
  "republic of moldova": "MD",
}

const STRIP = /^(?:the\s+)?(?:(?:federal|socialist|islamic|kingdom|sultanate|state|republic|people's republic|democratic republic|grand duchy|principality)\s+of\s+(?:the\s+)?)?/i

const byName = new Map(Countries.map((c) => [c.name.toLowerCase(), c.code]))

// "the Sultanate of Oman" → OM, "Republic of T[uuml]rkiye" → TR; null when it isn't a country
export const countryFromName = (raw: string): string | null => {
  const name = raw
    .replace(/\[uuml\]/gi, "ü")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
  if (!name) return null
  if (ALIASES[name]) return ALIASES[name]
  const short = name.replace(STRIP, "").trim()
  return ALIASES[short] ?? byName.get(name) ?? byName.get(short) ?? null
}

// The country of a case, from its number: "A-533-938" → IN. Null for a code we don't know yet.
export const countryOfCase = (caseNumber: string) => COMMERCE_COUNTRIES[caseNumber.slice(2, 5)] ?? null
