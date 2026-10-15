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
  // Digit prefixes of the products it names ("7326", "73", "870323")
  codes: string[]
  // Chapter 99 headings it names ("9903.81.90")
  headings: string[]
  // Countries it names; "all" for every country; empty when it names none
  countries: string[] | "all"
}

export interface MatchableUpdate {
  slug: string
  hts_codes: string[]
  countries: string[]
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

export const scopeOf = (u: Pick<MatchableUpdate, "hts_codes" | "countries">): UpdateScope => {
  const codes = new Set<string>()
  const headings = new Set<string>()
  for (const raw of u.hts_codes) {
    const chapter = raw.match(/^chapter\s+(\d{1,2})$/i)?.[1]
    if (chapter) {
      codes.add(chapter.padStart(2, "0"))
      continue
    }
    const digits = raw.replace(/\D/g, "")
    if (digits.startsWith("99")) headings.add(raw.trim())
    else if (digits.length >= 4) codes.add(digits)
  }
  return {
    codes: Array.from(codes),
    headings: Array.from(headings),
    countries: u.countries.includes("ALL") ? "all" : u.countries,
  }
}

// How an update may touch one import, or null (confirmed is decided on the server)
export const matchImport = (scope: UpdateScope, item: MatchableImport): Exclude<MatchLevel, "confirmed"> | null => {
  const countryNamed = scope.countries === "all" || scope.countries.includes(item.country)
  if (scope.codes.length) {
    const codeNamed = scope.codes.some((prefix) => item.code.startsWith(prefix))
    // No countries named: the codes decide
    return codeNamed && (countryNamed || (scope.countries !== "all" && !scope.countries.length)) ? "likely" : null
  }
  return scope.countries !== "all" && scope.countries.includes(item.country) ? "possible" : null
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
