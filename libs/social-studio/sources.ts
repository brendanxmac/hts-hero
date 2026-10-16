import type { DutyLine } from "../../tariffs/engine-v2/types"
import type { SourceLink } from "../../social/types"
import stats from "../country-pages/import-stats.json"

// Where each claim in a post can be checked. Official sources first (USITC's HTS, the Federal
// Register, CBP, the White House, Census); the HTS Hero calculator shows the duty breakdown the
// engine worked out, on the date given. Links are relative where they open HTS Hero itself.

// "8711.60.00.50" → "8711600050"
const digits = (code: string) => code.replace(/\D/g, "")

// The duty on a product from a country, in the calculator (on a past date when given)
export const calculatorLink = (claim: string, htsno: string, country: string, date?: string): SourceLink => ({
  claim,
  label: `HTS Hero calculator · ${htsno} from ${country}${date ? ` on ${date}` : " today"}`,
  url: `/duty-calculator?code=${encodeURIComponent(htsno)}&country=${country}${date ? `&date=${date}` : ""}`,
  official: false,
})

// The line in the official schedule: its description and base rates
export const htsLink = (claim: string, code: string): SourceLink => ({
  claim,
  label: `USITC Harmonized Tariff Schedule · ${code}`,
  url: `https://hts.usitc.gov/search?query=${encodeURIComponent(code.replace(/^(\d{4})(\d{2})(\d{2})/, "$1.$2.$3"))}`,
  official: true,
})

// The legal documents behind the Chapter 99 duties that apply (proclamations, FR notices, CSMS)
export const legalLinks = (claim: string, lines: DutyLine[]): SourceLink[] => {
  const seen = new Set<string>()
  return lines.flatMap((line) => {
    const url = line.source?.url
    if (!url || seen.has(url)) return []
    seen.add(url)
    return [{ claim, label: `${line.code} · ${line.source?.citation ?? line.name}`, url, official: true }]
  })
}

// US imports of a code by country, live from the Census API (the key stays on the server)
export const censusCodeLink = (claim: string, code: string, year: number): SourceLink => ({
  claim,
  label: `US Census Bureau · imports of HTS ${code} by country, ${year} (live from api.census.gov)`,
  url: `/api/social-studio/verify/census?code=${digits(code)}&year=${year}`,
  official: true,
})

const COUNTRY_STATS = stats.countries as Record<string, { census?: string; name: string }>

// A country's trade with the US, on census.gov
export const censusCountryLink = (claim: string, iso: string): SourceLink | null => {
  const census = COUNTRY_STATS[iso]?.census
  return census
    ? { claim, label: `US Census Bureau · US trade in goods with ${COUNTRY_STATS[iso].name}`, url: `https://www.census.gov/foreign-trade/balance/c${census}.html`, official: true }
    : null
}

export const censusWorldLink = (claim: string): SourceLink => ({
  claim,
  label: "US Census Bureau · US trade in goods by country",
  url: "https://www.census.gov/foreign-trade/balance/index.html",
  official: true,
})

// One link per URL, keeping the first claim it supports
export const dedupe = (links: (SourceLink | null)[]) => {
  const seen = new Set<string>()
  return links.filter((l): l is SourceLink => !!l && !seen.has(l.url) && !!seen.add(l.url))
}
