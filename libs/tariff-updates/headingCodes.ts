import { AllRules } from "../../tariffs/engine-v2/data"
import { isEffectiveOn } from "../../tariffs/engine-v2/dates"
import { addDays } from "../../tariffs/engine-v2/history"
import { confirmInputId } from "../../tariffs/engine-v2/data/confirmations"
import type { CodeSelector, IsoDate, Tariff } from "../../tariffs/engine-v2/types"

// The HTS codes under a Chapter 99 heading, from the duty engine's data. A notice often names only
// the heading ("all exclusions under heading 9903.88.69") and leaves the codes to a U.S. note, so
// an update page shows each heading the engine knows with the codes its note lists, as they stood
// on the day the update takes effect. Headings the engine doesn't model are left out.

export interface HeadingCodes {
  heading: string
  name: string
  // The day the codes are as of
  asOf: IsoDate
  // Every product of its countries, less excludedCodes
  allProducts: boolean
  codes: string[]
  excludedCodes: string[]
  // Codes it covers only for a product described under the number (the goods must be that
  // product): every code when `allDescribed`
  describedCodes: string[]
  allDescribed: boolean
  // Countries it applies to, or "all"
  countries: string[] | "all"
}

// A list this long is shown as a count, not code by code
export const MAX_SHOWN = 1500

const byCode = new Map<string, Tariff[]>()
for (const t of AllRules.tariffs) byCode.set(t.code, [...(byCode.get(t.code) ?? []), t])
const listsById = new Map(AllRules.lists.map((l) => [l.id, l]))

// The codes on a list on a day, as written ("8483.50.90.40"), lists it includes flattened
const listCodes = (id: string, asOf: IsoDate, seen = new Set<string>()): string[] => {
  const list = listsById.get(id)
  if (!list || list.kind !== "hts" || seen.has(id)) return []
  seen.add(id)
  const version = list.versions.find((v) => isEffectiveOn(v.effective, asOf))
  if (!version) return []
  return [...(version.codes ?? []), ...(version.includes ?? []).flatMap((ref) => listCodes(ref.list, asOf, seen))]
}

const selectorCodes = (selector: CodeSelector | undefined, asOf: IsoDate) =>
  Array.from(new Set((selector ?? []).flatMap((s) => (typeof s === "string" ? [s] : listCodes(s.list, asOf))))).sort()

const selectorCountries = (selector: Tariff["scope"]["countries"], asOf: IsoDate): string[] | "all" => {
  if (selector === "all") return "all"
  const countries = new Set<string>()
  for (const s of selector) {
    if (typeof s === "string") countries.add(s)
    else {
      const list = listsById.get(s.list)
      list?.versions.find((v) => isEffectiveOn(v.effective, asOf))?.codes?.forEach((c) => countries.add(c))
    }
  }
  return Array.from(countries)
}

// The heading's record on the day, else the day before (an update that ends it), else the
// nearest earlier one, else the first
const recordOn = (records: Tariff[], date: IsoDate) =>
  records.find((t) => isEffectiveOn(t.effective, date)) ??
  records.find((t) => isEffectiveOn(t.effective, addDays(date, -1))) ??
  [...records].filter((t) => (t.effective.from ?? "") <= date).sort((a, b) => (b.effective.from ?? "").localeCompare(a.effective.from ?? ""))[0] ??
  records[0]

// "9903.88.69" (any punctuation) → the engine's form, or null for anything not an 8-digit Chapter 99 number
const asHeading = (code: string) => {
  const digits = code.replace(/\D/g, "")
  return digits.length === 8 && digits.startsWith("99") ? `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}` : null
}

export const headingCodes = (headings: string[], date: IsoDate): HeadingCodes[] =>
  Array.from(new Set(headings.map(asHeading).filter((h): h is string => !!h))).flatMap((heading) => {
    const records = byCode.get(heading)
    if (!records?.length) return []
    const t = recordOn(records, date)
    const asOf = isEffectiveOn(t.effective, date) ? date : (t.effective.to ? addDays(t.effective.to, -1) : t.effective.from ?? date)
    const allProducts = t.scope.codes === "all"
    const codes = t.scope.codes === "all" ? [] : selectorCodes(t.scope.codes, asOf)
    const excludedCodes = selectorCodes(t.scope.excludeCodes, asOf)
    const requires = t.requires ?? []
    const allDescribed = requires.some((c) => c.kind === "answer" && c.input === confirmInputId(heading))
    const describedLists = requires.filter((c) => c.kind === "answerForListedCodes" && typeof c.list === "string").map((c) => c.list as string)
    const described = new Set(describedLists.flatMap((id) => listCodes(id, asOf)))
    if (!allProducts && !codes.length) return []
    return [
      {
        heading,
        name: t.name,
        asOf,
        allProducts,
        codes,
        excludedCodes,
        describedCodes: allDescribed ? codes : codes.filter((c) => described.has(c)),
        allDescribed,
        countries: selectorCountries(t.scope.countries, asOf),
      },
    ]
  })

// Whether an update's own codes name a product (not just Chapter 98/99 numbers or "ALL")
const namesProducts = (codes: string[]) =>
  codes.some((code) => {
    const chapter = code.trim().match(/^ch(?:apter|\.)?\s*(\d{1,2})$/i)?.[1]
    if (chapter) return Number(chapter) < 98
    const digits = code.replace(/\D/g, "")
    return digits.length >= 2 && !digits.startsWith("98") && !digits.startsWith("99")
  })

// The codes under the headings an update names, only when it names no product codes of its own
// (or every product): a notice that lists its codes often also cites a broad heading ("except as
// provided in 9903.88.03"), whose thousands of codes it doesn't cover. Headings for every product
// aren't expanded: that's too broad to match on.
export const childrenOfHeadings = (named: string[], headings: string[], date: IsoDate): HeadingCodes[] =>
  namesProducts(named) || named.some((c) => c.trim().toUpperCase() === "ALL")
    ? []
    : headingCodes(headings, date).filter((h) => !h.allProducts)
