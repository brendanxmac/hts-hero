// Compares Chapter 99 headings from a USITC export with the engine's rules. Pure: used by the
// coverage checker's refresh and by `npm run ch99:coverage`.

import { findNoteCitations, NoteCitation } from "../../tariffs/engine-v2/citations"
import { isEffectiveOn } from "../../tariffs/engine-v2/dates"
import type { RuleSet, Tariff } from "../../tariffs/engine-v2/types"
import { subchapterRoman, type Category, type CoverageStatus } from "./constants"
import { expired, ftzSuspended, Matcher, matches, needsReview, parseEntry } from "./initial-status"

export interface HtsExportRow {
  htsno?: string | null
  description?: string | null
  general?: string | null
  special?: string | null
  other?: string | null
  footnotes?: unknown
}

export interface HeadingAnalysis {
  htsno: string
  subchapter: string // "9903"
  description: string
  general: string
  special: string
  other: string
  footnotes: string[]
  noteCitations: NoteCitation[]
  startsOn: string | null
  // From the engine
  records: Tariff[] // tariff records with this code, any date
  modeled: boolean
  activeOn: boolean // a record is in effect on the analysis date
  referenced: boolean // named anywhere in the engine data
  programs: string[]
  suggestedCategory: Category
  // From initial-status.ts
  initialStatus: CoverageStatus
  initialStatusNote: string | null
}

export const HEADING = /^99\d\d\.\d\d\.\d\d$/
const HEADING_ANYWHERE = /\b99\d\d\.\d\d\.\d\d\b/g

export const clean = (text: unknown) => (typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "")

const footnoteTexts = (footnotes: unknown): string[] =>
  Array.isArray(footnotes)
    ? footnotes
        .map((f) => (typeof f === "string" ? clean(f) : clean((f as { value?: string })?.value)))
        .filter(Boolean)
    : []

// findNoteCitations assumes subchapter III unless the text names one. A heading outside 9903 that
// says "U.S. note 2 to this subchapter" means its own subchapter.
export const citationsForHeading = (htsno: string, text: string): NoteCitation[] => {
  const found = findNoteCitations(text)
  const sub = htsno.slice(0, 4)
  if (sub === "9903" || /subchapter\s+III\b/i.test(text)) return found
  const roman = subchapterRoman(sub)
  return found.map((c) =>
    c.key.startsWith("sub-III/")
      ? {
          key: c.key.replace("sub-III/", `sub-${roman}/`),
          label: `${c.label} to subchapter ${roman}`,
          file: c.file.replace("sub-III-", `sub-${roman}-`),
        }
      : c
  )
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]

// "…entries, on or after November 10, 2026, of intermodal chassis…" → "2026-11-10"
export const startDateIn = (description: string): string | null => {
  const m = description.match(/\bon or after\s+([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})/)
  if (!m) return null
  const month = MONTHS.indexOf(m[1].toLowerCase())
  if (month < 0) return null
  return `${m[3]}-${String(month + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`
}

// A first guess from the rate and wording; the UI can override it
export const suggestCategory = (htsno: string, description: string, general: string): Category => {
  const sub = htsno.slice(0, 4)
  const rate = general.trim()
  const text = description.toLowerCase()
  if (sub === "9904") return "quantitative_quota"
  if (["9915", "9917", "9918", "9919", "9920", "9921", "9922"].includes(sub)) {
    return /safeguard/.test(text) ? "safeguard" : "fta_tpl"
  }
  if (/safeguard/.test(text)) return "safeguard"
  if (/aggregate quantity|in-quota|tariff-rate quota|quota quantity|quantitative limit/.test(text) && rate) {
    return "tariff_rate_quota"
  }
  if (!rate) return /quota/.test(text) ? "quantitative_quota" : "reporting"
  if (/¢|\$|\/kg|per\s+(kg|liter|unit|each)/i.test(rate)) return "specific_compound"
  if (/applicable subheading\s*\+\s*[\d.]+\s*%/i.test(rate)) return "additional_ad_valorem"
  if (/^the duty provided in the applicable subheading\.?$/i.test(rate) || /^no change\.?$/i.test(rate) || /^free\.?$/i.test(rate)) {
    return "exclusion"
  }
  if (/^[\d.]+\s*%$/.test(rate)) return "flat_rate"
  return "other"
}

// Which engine program each cited U.S. note belongs to. Keys are the note ("III:20") and its first
// subdivision ("III:20(h)"), most specific first, since one note can serve several programs
// (note 2 covers IEEPA and Section 122 headings).
export const noteKeys = (citation: NoteCitation): string[] => {
  const m = citation.key.match(/^sub-([IVXL]+)\/us-notes\/(\d+)(\([A-Za-z0-9]+\))?/)
  if (!m) return []
  const top = `${m[1]}:${m[2]}`
  return m[3] ? [`${top}${m[3]}`, top] : [top]
}

// The top-level note key ("III:20"), for grouping
export const noteKey = (citation: NoteCitation) => noteKeys(citation).at(-1) ?? null

// Suggested only where every modeled heading citing the note (or subdivision) is the same program
export const suggestNotePrograms = (headings: Pick<HeadingAnalysis, "modeled" | "programs" | "noteCitations">[]) => {
  const votes = new Map<string, Set<string>>()
  for (const h of headings) {
    if (!h.modeled) continue
    for (const key of Array.from(new Set(h.noteCitations.flatMap(noteKeys)))) {
      const programs = votes.get(key) ?? new Set<string>()
      h.programs.forEach((p) => programs.add(p))
      votes.set(key, programs)
    }
  }
  const out: Record<string, string> = {}
  votes.forEach((programs, key) => {
    if (programs.size === 1) out[key] = Array.from(programs)[0]
  })
  return out
}

export const analyzeCoverage = (rows: HtsExportRow[], rules: RuleSet, asOf: string) => {
  // First row wins (the export has no duplicates, but a saved file might)
  const hts = new Map<string, HtsExportRow>()
  for (const row of rows) {
    const code = clean(row.htsno)
    if (HEADING.test(code) && !hts.has(code)) hts.set(code, row)
  }
  const codes = Array.from(hts.keys()).sort((a, b) => a.localeCompare(b))

  const expiredMatchers = expired.map(parseEntry)
  const ftzMatchers = ftzSuspended.map(parseEntry)
  const reviewMatchers = needsReview.map(parseEntry)
  const firstMatch = (matchers: Matcher[], code: string) => matchers.find((m) => matches(m, code))

  // Every status entry should match at least one heading, so a typo can't hide
  const statusChecks = [
    ...expiredMatchers.map((m) => ({ list: "expired", m })),
    ...ftzMatchers.map((m) => ({ list: "FTZ-suspended", m })),
    ...reviewMatchers.map((m) => ({ list: "needs review", m })),
  ].map(({ list, m }) => ({
    list,
    codes: m.entry.codes,
    listed: "prefix" in m ? "prefix" : String(m.exact.length),
    inHts: codes.filter((c) => matches(m, c)).length,
  }))

  const tariffsByCode = new Map<string, Tariff[]>()
  for (const t of rules.tariffs) tariffsByCode.set(t.code, [...(tariffsByCode.get(t.code) ?? []), t])
  const referenced = new Set(JSON.stringify(rules).match(HEADING_ANYWHERE) ?? [])

  const headings: HeadingAnalysis[] = codes.map((htsno) => {
    const row = hts.get(htsno)!
    const description = clean(row.description)
    const general = clean(row.general)
    const records = tariffsByCode.get(htsno) ?? []
    const exp = firstMatch(expiredMatchers, htsno)
    const ftz = firstMatch(ftzMatchers, htsno)
    if (exp && ftz) throw new Error(`${htsno} is on both the expired (${exp.entry.codes}) and FTZ-suspended lists`)
    const review = firstMatch(reviewMatchers, htsno)
    const [initialStatus, initialStatusNote]: [CoverageStatus, string | null] = exp
      ? ["expired", exp.entry.note]
      : ftz
        ? ["ftz_suspended", ftz.entry.note]
        : review
          ? ["needs_review", review.entry.note]
          : ["open", null]
    return {
      htsno,
      subchapter: htsno.slice(0, 4),
      description,
      general,
      special: clean(row.special),
      other: clean(row.other),
      footnotes: footnoteTexts(row.footnotes),
      noteCitations: citationsForHeading(htsno, description),
      startsOn: startDateIn(description),
      records,
      modeled: records.length > 0,
      activeOn: records.some((t) => isEffectiveOn(t.effective, asOf)),
      referenced: referenced.has(htsno),
      programs: Array.from(new Set(records.map((t) => t.program))),
      suggestedCategory: suggestCategory(htsno, description, general),
      initialStatus,
      initialStatusNote,
    }
  })

  // Tariff records whose heading isn't in this HTS
  const stale = Array.from(tariffsByCode)
    .filter(([code]) => !hts.has(code))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, records]) => ({ code, records }))

  return { headings, stale, statusChecks }
}
