import { EuropeanUnionCountries } from "../../constants/countries"
import type { Authority, Kind } from "./types"

// Which of a user's imports a tariff update may affect, from what the update names: HTS codes
// (any length, or whole chapters) and countries. Plain code, run in the Tracker for its badges and
// on the server for alerts. Three levels:
//   confirmed  the duty engine shows the update's Chapter 99 heading applying to the import (server
//              only: libs/tariff-updates/impacts.ts), with the duty before and after
//   likely     the update names the import's code or a heading above it, and its country
//   possible   the update names the import's country but no products (shown, never emailed)
// An update for all countries that names no products matches nothing: too broad to say.

export type MatchLevel = "confirmed" | "likely" | "possible"

export interface UpdateScope {
  // Every product of its countries (less the exclusions): "all products of Brazil except…"
  allProducts: boolean
  // Digit prefixes of the products it names ("7326", "73", "870323")
  codes: string[]
  // Digit prefixes carved out of them
  excludedCodes: string[]
  excludedCountries: string[]
  // Chapter 99 headings it names ("9903.81.90")
  headings: string[]
  // Countries it names; "all" for every country; empty when it names none
  countries: string[] | "all"
}

export interface MatchableUpdate {
  slug: string
  hts_codes: string[]
  countries: string[]
  // The scope read from the update's PDFs or set in review (scope.ts), when there is one
  scope_codes?: string[] | null
  scope_excluded_codes?: string[] | null
  scope_countries?: string[] | null
  scope_excluded_countries?: string[] | null
  scope_headings?: string[] | null
  authority: Authority
  kind: Kind
}

export interface MatchableImport {
  // 8 or 10 digits
  code: string
  // Two-letter country code
  country: string
}

// HTS revisions name no products; they're the stage the other updates reach, not news of their own
const MATCHED_KINDS = (kind: Kind) => kind !== "hts_revision"

// "9903.05.20" from its 8 digits
const heading = (digits: string) => `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`

// A range as written: "9903.05.20–9903.05.84", "8708.10 through 8708.99"
const RANGE = /^\s*([\d.\s]+?)\s*(?:-|–|—|\bthrough\b|\bto\b)\s*([\d.\s]+?)\s*$/i

// "Chapter 73" → "73"; "7326.90.86" → "73269086"; "8708.10 through 8708.99" → "870810-870899";
// Chapter 99 numbers, and ranges of them, go to headings as "9903.05.20". Chapter 98 (special
// provisions such as 9802.00.80) names no products.
const prefixes = (raw: string[], headings?: Set<string>) => {
  const codes = new Set<string>()
  for (const code of raw) {
    const chapter = code.trim().match(/^ch(?:apter|\.)?\s*(\d{1,2})$/i)?.[1]
    if (chapter) {
      if (Number(chapter) < 98) codes.add(chapter.padStart(2, "0"))
      continue
    }
    const range = code.match(RANGE)
    const [lo, hi] = range ? [range[1].replace(/\D/g, ""), range[2].replace(/\D/g, "")] : []
    if (lo && hi && lo.length === hi.length && lo.length >= 4 && lo <= hi) {
      if (!lo.startsWith("99")) codes.add(`${lo}-${hi}`)
      // Every heading in it (a range of Chapter 99 headings runs to a few hundred at most)
      else if (lo.length === 8) for (let n = Number(lo); n <= Math.min(Number(hi), Number(lo) + 999); n++) headings?.add(heading(String(n)))
      continue
    }
    const digits = code.replace(/\D/g, "")
    if (digits.startsWith("99")) {
      if (digits.length === 8) headings?.add(heading(digits))
    } else if (digits.length >= 4 && !digits.startsWith("98")) codes.add(digits)
  }
  return Array.from(codes)
}

// A range prefix ("870810-870899") holds the code when the code's first digits fall within it
const inRange = (prefix: string, code: string) => {
  const [lo, hi] = prefix.split("-")
  return code.slice(0, lo.length) >= lo && code.slice(0, hi.length) <= hi
}

// Whether the update names a product code. An 8-digit import is named by one of its 10-digit
// lines: it may be the one imported.
const codeNamed = (prefix: string, code: string) =>
  prefix.includes("-") ? inRange(prefix, code) : code.startsWith(prefix) || (code.length === 8 && prefix.startsWith(code))

// Only what's certainly carved out: one of an 8-digit import's 10-digit lines doesn't exclude it
const codeExcluded = (prefix: string, code: string) => (prefix.includes("-") ? inRange(prefix, code) : code.startsWith(prefix))

// Country codes as imports carry them: "EU" is its member states, "UK" is "GB"
const countryCodes = (raw: string[]) =>
  Array.from(
    new Set(
      raw.flatMap((c) => {
        const code = c.trim().toUpperCase()
        return code === "EU" ? EuropeanUnionCountries : code === "UK" ? ["GB"] : [code]
      })
    )
  )

// What an update covers: its scope when one was read or set, else what its sources named
export const scopeOf = (u: Pick<MatchableUpdate, "hts_codes" | "countries" | "scope_codes" | "scope_excluded_codes" | "scope_countries" | "scope_excluded_countries" | "scope_headings">): UpdateScope => {
  const scoped = !!u.scope_codes
  const headings = new Set<string>()
  prefixes(u.scope_headings ?? [], headings)
  const codes = prefixes(scoped ? u.scope_codes! : u.hts_codes, headings)
  const excludedCodes = prefixes(u.scope_excluded_codes ?? [])
  const countries = countryCodes(scoped && u.scope_countries?.length ? u.scope_countries : u.countries)
  return {
    // "ALL", or exceptions with nothing named as covered: everything but the exceptions (the
    // reader sometimes leaves the "ALL" out)
    allProducts: scoped && (u.scope_codes!.some((c) => c.trim().toUpperCase() === "ALL") || (!codes.length && excludedCodes.length > 0)),
    codes,
    excludedCodes,
    excludedCountries: countryCodes(u.scope_excluded_countries ?? []),
    headings: Array.from(headings),
    countries: countries.includes("ALL") ? "all" : countries,
  }
}

// How an update may touch one import, or null (confirmed is decided on the server)
export const matchImport = (scope: UpdateScope, item: MatchableImport): Exclude<MatchLevel, "confirmed"> | null => {
  const code = item.code.replace(/\D/g, "")
  const country = item.country.toUpperCase()
  if (scope.excludedCountries.includes(country) || scope.excludedCodes.some((prefix) => codeExcluded(prefix, code))) return null
  const countryNamed = scope.countries === "all" || scope.countries.includes(country)
  // Every product of the countries it names (exclusions already left out above)
  if (scope.allProducts) return countryNamed ? "likely" : null
  if (scope.codes.length) {
    const named = scope.codes.some((prefix) => codeNamed(prefix, code))
    // No countries named: the codes decide
    return named && (countryNamed || (scope.countries !== "all" && !scope.countries.length)) ? "likely" : null
  }
  return scope.countries !== "all" && scope.countries.includes(country) ? "possible" : null
}

export interface UpdateMatches {
  likely: string[]
  possible: string[]
}

// For each update, the keys ("code-country") of the imports it may affect
export const matchCatalog = (updates: MatchableUpdate[], items: MatchableImport[]) => {
  const out = new Map<string, UpdateMatches>()
  for (const u of updates) {
    if (!MATCHED_KINDS(u.kind)) continue
    const scope = scopeOf(u)
    const found: UpdateMatches = { likely: [], possible: [] }
    for (const item of items) {
      const level = matchImport(scope, item)
      if (level) found[level].push(`${item.code}-${item.country}`)
    }
    if (found.likely.length || found.possible.length) out.set(u.slug, found)
  }
  return out
}
