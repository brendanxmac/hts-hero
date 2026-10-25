import { decodeEntities } from "../tariff-sources/text"
import { countryFromName, countryOfCase } from "./countries"
import type { EventType } from "./types"

// Reading AD/CVD notices without AI: case numbers, ITC investigation numbers, what kind of notice
// it is, the product and countries in its title, and the HTS codes its scope lists. Plain
// functions over the Federal Register's text, tested on real notices (testing/adcvd-parse.test.ts).

// The Federal Register's "text" format is HTML around a <pre> block. Plain text, with page
// markers ("[[Page 64346]]") taken out so they don't split sentences.
export const frText = (raw: string) =>
  decodeEntities(raw.replace(/<[^>]+>/g, ""))
    .replace(/\n*\[\[Page \d+\]\]\n*/g, "\n")
    .replace(/\r/g, "")

// One line of text, for reading lists and tables whose cells wrap: the date column ("10/1/25-
// 9/30/26") and dot leaders taken out, so a wrapped "A-\n 351-832" reads "A- 351-832".
const flatten = (text: string) =>
  text
    .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}\s*[-–]\s*\d{1,2}\/\d{1,2}\/\d{2,4}/g, " ")
    .replace(/\.{3,}/g, " ")
    .replace(/\s+/g, " ")

const CASE = /\b([AC])-\s?(\d{3})-\s?(\d{3})\b/g

const uniq = <T,>(list: T[]) => Array.from(new Set(list))

// Every Commerce case number in the text, written A-533-938
export const caseNumbers = (text: string) =>
  uniq(Array.from(flatten(text).matchAll(CASE), (m) => `${m[1]}-${m[2]}-${m[3]}`)).filter((c) => !/^[AC]-000-000$/.test(c))

// The bracketed line under the agency name: the notice's own cases ("[A-533-938, C-533-939]") or
// investigations ("[Investigation Nos. 701-TA-806 and 731-TA-1805-1807 (Preliminary)]"). A notice
// cites other cases in its footnotes; only these are its own.
export const headerLine = (text: string) => {
  const head = text.slice(0, 4000)
  const agency = head.search(/International Trade (?:Administration|Commission)/i)
  const after = agency >= 0 ? head.slice(agency) : head
  return after.match(/\[([^\]]*(?:[AC]-\s?\d{3}-\s?\d{3}|TA-)[^\]]*)\]/)?.[1]?.replace(/\s+/g, " ") ?? null
}

// ITC investigation numbers, one per country: "701-TA-806 and 731-TA-1805-1807" is 701-TA-806,
// 731-TA-1805, 731-TA-1806 and 731-TA-1807. "731-TA-1070-B" keeps its letter.
export const itcNumbers = (text: string) => {
  const out: string[] = []
  const flat = text.replace(/\s+/g, " ").replace(/(701|731)-\s?TA-\s?/g, "$1-TA-")
  for (const m of Array.from(flat.matchAll(/\b(701|731)-TA-((?:\d+(?:-[A-Z]\b)?(?:\s?[-–]\s?\d+)?)(?:\s?(?:,|and|,\s?and)\s?\d+(?![\d-]*TA)(?:\s?[-–]\s?\d+)?)*)/g))) {
    const law = m[1]
    for (const part of m[2].split(/\s?(?:,\s?and|,|and)\s?/)) {
      const letter = part.match(/^(\d+)-([A-Z])$/)
      if (letter) {
        out.push(`${law}-TA-${letter[1]}-${letter[2]}`)
        continue
      }
      const [lo, hi] = part.split(/\s?[-–]\s?/).map(Number)
      if (!Number.isFinite(lo)) continue
      // A range runs over a handful of countries; anything wider is a misread
      const last = Number.isFinite(hi) && hi > lo && hi - lo < 30 ? hi : lo
      for (let n = lo; n <= last; n++) out.push(`${law}-TA-${n}`)
    }
  }
  return uniq(out)
}

// "Oleoresin Paprika From India: Antidumping Duty Order" → product and the countries named
export const titleParts = (title: string) => {
  const flat = title.replace(/\s+/g, " ").trim()
  const from = flat.match(/^(.*?)\s+[Ff]rom\s+(.+?)(?:\s*[:;]\s*|$)/)
  if (!from) return { product: null as string | null, countries: [] as string[] }
  // "Notice of Extension of the Deadline …: Certain Corrugated Boxes" → the part after the colon;
  // "Antidumping and Countervailing Duty Orders on Aluminum Wire" → "Aluminum Wire"
  const product = from[1]
    .split(/:\s+/)
    .pop()!
    .replace(/^Notice of /i, "")
    .replace(/^(?:(?:Antidumping|Countervailing)(?: and Countervailing)? Duty (?:Orders?|Investigations?|Proceedings?|Petitions?) (?:on|of|Concerning) )/i, "")
    .replace(/[,;\s]+$/, "")
    .trim()
  const countries = from[2]
    .replace(/\(.*?\)/g, "")
    .split(/,\s*(?:and\s+)?|\s+and\s+(?!Herzegovina|Tobago|Barbuda|Nevis|Principe|Grenadines|Caicos|Futuna|McDonald)/)
    .map((c) => c.replace(/^the\s+/i, "").trim())
    .filter(Boolean)
  return { product: product || null, countries }
}

// What a notice is, from its title and agency
export const eventOf = (title: string, agency: "commerce" | "itc"): EventType => {
  const t = title.replace(/\s+/g, " ")
  if (/\bCorrection\b/i.test(t) && !/Correction(?:s)? to/i.test(t)) return "correction"
  if (agency === "itc") {
    if (/Institution of (?:Anti-?dumping|Countervailing)|Institution of .*Investigations? and Scheduling of Preliminary/i.test(t)) return "itc_institution"
    if (/Five-Year Reviews?|Sunset/i.test(t)) return "itc_sunset"
    if (/Determinations?\b/i.test(t) && /Preliminary/i.test(t)) return "itc_prelim"
    if (/Determinations?\b/i.test(t)) return "itc_final"
    if (/Scheduling|Revised Schedule|Hearing/i.test(t)) return "itc_schedule"
    return "itc_other"
  }
  // Deadlines moved, not decisions made
  if (/Postponement of|Extension of (?:the )?(?:Deadline|Time Limit)|Alignment of (?:the )?Final/i.test(t)) return "other"
  if (/Opportunity To Request Administrative Review/i.test(t)) return "list_opportunity"
  if (/^Initiation of Antidumping and Countervailing Duty Administrative Reviews/i.test(t)) return "list_review_init"
  if (/^Initiation of Five-Year \(Sunset\) Reviews?/i.test(t)) return "list_sunset_init"
  if (/Advance Notification of Sunset Reviews?/i.test(t)) return "list_sunset_notice"
  if (/Notice of Scope Rulings?\b|Scope Ruling Applications Filed/i.test(t)) return "list_scope_rulings"
  if (/Circumvention/i.test(t)) return "circumvention"
  // "Notice of Court Decision…; and Notice of Revocation of Antidumping Order": the order ends
  if (/Court Decision|Court of International Trade|Federal Circuit/i.test(t)) return /Revocation of (?:the )?(?:Antidumping|Countervailing) (?:Duty )?Orders?/i.test(t) && !/in Part/i.test(t) ? "revocation" : "court"
  if (/Revocation of (?:the )?(?:Antidumping|Countervailing|Orders?)|and Revocation of|Revocation of .*Orders?$/i.test(t) && !/in Part/i.test(t)) return "revocation"
  if (/Continuation of (?:the )?(?:Antidumping|Countervailing|Orders?|Suspension|Suspended)/i.test(t)) return "continuation"
  if (/Sunset Reviews?|Five-Year Reviews?/i.test(t)) return /Initiation/i.test(t) ? "sunset_init" : "sunset_result"
  if (/Scope Ruling/i.test(t)) return "scope_ruling"
  if (/Changed Circumstances/i.test(t)) return "changed_circumstances"
  if (/New Shipper/i.test(t)) return "new_shipper"
  if (/Administrative Reviews?/i.test(t)) {
    if (/Preliminary Results/i.test(t)) return "review_prelim"
    if (/Final Results/i.test(t)) return "review_final"
    return "review_other"
  }
  // A suspension agreement ended and the order issued instead
  if (/Termination of (?:the )?(?:Suspension Agreement|Agreement Suspending)/i.test(t) && /\bOrders?\b/i.test(t)) return "order"
  if (/Suspension Agreement|Suspended Investigation|Agreement Suspending|^Suspension of (?:the )?(?:Antidumping|Countervailing)/i.test(t)) return "suspension"
  // \b: "Amended Preliminary Determination of the Less-Than-Fair-Value Investigation" isn't one
  if (/\bTermination of (?:the )?(?:Less-Than-Fair-Value |Countervailing Duty |Antidumping Duty )?Investigations?|\bRescission of (?:the )?(?:Less-Than-Fair-Value|Countervailing Duty|Antidumping Duty) Investigation/i.test(t)) return "termination"
  if (/Initiation of (?:Less-Than-Fair-Value|Countervailing Duty|Antidumping Duty) Investigations?/i.test(t)) return "initiation"
  // An order wins over the determination it follows ("Amended Final Determination; … Antidumping Duty Orders")
  if (/(?:Antidumping|Countervailing) (?:Duty )?Orders?\b/i.test(t) && !/Review|Continuation|Revocation|Rescission|Court|Scope|Circumvention/i.test(t)) return "order"
  if (/Preliminary (?:Affirmative|Negative)?\s*(?:Determination|Countervailing|Antidumping)|Preliminary Determinations? of Sales at Less/i.test(t)) return "prelim"
  if (/Final (?:Affirmative|Negative)?\s*(?:Determination|Countervailing|Antidumping)|Final Determinations? of Sales at Less/i.test(t)) return "final"
  if (/(?:Antidumping|Countervailing) (?:Duty )?Orders?\b|Amended .*Orders?\b/i.test(t)) return "order"
  return "other"
}

// The countries a revocation names when the same notice continues other countries' orders:
// "…: Continuation of Antidumping Duty Orders and Revocation of the Antidumping Duty Order on
// Certain Hot-Rolled Steel Flat Products From the United Kingdom" → ["United Kingdom"]
export const revokedCountries = (title: string) => {
  const flat = title.replace(/\s+/g, " ")
  const at = flat.search(/Revocation/i)
  if (at < 0) return []
  const tail = flat.slice(at)
  const from = tail.match(/\b[Ff]rom (?:the )?(.+?)(?:[;:]|$)/)?.[1]
  if (!from) return []
  return from
    .replace(/\(.*?\)/g, "")
    .split(/,\s*(?:and\s+)?|\s+and\s+(?!Herzegovina|Tobago)/)
    .map((c) => c.replace(/^the\s+/i, "").trim())
    .filter(Boolean)
}

// The countries a continuation's suspended investigations cover, when the same notice continues
// other countries' orders: "Continuation of Antidumping Duty Order on Certain Cut-to-Length Carbon
// Steel Plate From the People's Republic of China and Continuation of Suspended Antidumping Duty
// Investigations on Certain Cut-to-Length Carbon Steel Plate From the Russian Federation and
// Ukraine" → ["Russian Federation", "Ukraine"]
export const suspendedCountries = (title: string) => {
  const flat = title.replace(/\s+/g, " ")
  const at = flat.search(/Suspen/i)
  if (at < 0) return []
  const from = flat.slice(at).match(/\b[Ff]rom (?:the )?(.+?)(?:[;:]|\band Continuation\b|$)/)?.[1]
  if (!from) return []
  return from
    .replace(/\(.*?\)/g, "")
    .split(/,\s*(?:and\s+)?|\s+and\s+(?!Herzegovina|Tobago)/)
    .map((c) => c.replace(/^the\s+/i, "").trim())
    .filter(Boolean)
}

// A title about a suspension agreement (a suspended investigation, not an order)
export const isSuspension = (title: string) => /Agreement Suspending|Suspension Agreement|Suspended (?:Antidumping |Countervailing )?(?:Duty )?Investigations?|Continuation of Suspension/i.test(title)

// A final or preliminary decision that ended a case: "Negative" in a determination's title
export const isNegative = (title: string) => /\bNegative\b/i.test(title) && !/\bAffirmative\b/i.test(title)

// The cases an ITC final vote ends, from its text (titles only say "Determinations"): countries
// found "not materially injured" (or "not materially retarded"), or whose imports were negligible
// and the investigation terminated. A split vote ends only those countries: Float Glass, March
// 2026, injured by imports from China, Malaysia's antidumping investigation terminated.
//   kind: AD or CVD when the clause names only less-than-fair-value or only subsidized imports
export interface ItcEnded {
  kind: "AD" | "CVD" | null
  countries: string[]
}

const countriesIn = (text: string) => {
  const words = text.replace(/[(),;]/g, " ").split(/\s+/).filter(Boolean)
  const out: string[] = []
  for (let i = 0; i < words.length; i++) {
    // The longest name starting here ("Bosnia and Herzegovina", "Republic of Korea")
    for (let n = 4; n >= 1; n--) {
      const country = /^[A-Z]/.test(words[i]) ? countryFromName(words.slice(i, i + n).join(" ")) : null
      if (country) {
        if (!out.includes(country)) out.push(country)
        i += n - 1
        break
      }
    }
  }
  return out
}

const kindOf = (clause: string): ItcEnded["kind"] => {
  const ltfv = /less than fair value|LTFV|antidumping/i.test(clause)
  const subsidy = /subsidi[sz]ed|countervailing/i.test(clause)
  return ltfv && !subsidy ? "AD" : subsidy && !ltfv ? "CVD" : null
}

export const itcEndedCases = (text: string): ItcEnded[] => {
  const flat = text.slice(0, 10_000).replace(/\s+/g, " ").replace(/``|''/g, '"')
  const out: ItcEnded[] = []
  for (const sentence of flat.split(/(?<=[a-z0-9)"'])\.\s+(?=[A-Z])/)) {
    // "…is not materially injured or threatened with material injury, and the establishment of an
    // industry … is not materially retarded, by reason of imports of X from Y …"
    const no = sentence.search(/\b(?:is|are) not materially (?:injured|retarded)\b/i)
    if (no >= 0) {
      const clause = sentence.slice(no).split(/\bThe Commission further\b/)[0]
      // Just "by reason of imports of X from Y": not the HTS sentence or "the United States" after it
      const imports = clause.slice(Math.max(0, clause.search(/by reason of imports/i))).split(/,? provided for in|,? that (?:have been|are|were) |\bfound by\b/i)[0]
      const countries = countriesIn(imports).filter((c) => c !== "US")
      if (countries.length) out.push({ kind: kindOf(clause), countries })
    }
    // "…are negligible and terminates the antidumping duty investigation concerning Malaysia"
    for (const m of Array.from(sentence.matchAll(/terminates? (?:the|its) (antidumping|countervailing)(?: duty)? investigations? (?:concerning|on|of|with respect to) ([^.;]+)/gi))) {
      const countries = countriesIn(m[2]).filter((c) => c !== "US")
      if (countries.length) out.push({ kind: /antidumping/i.test(m[1]) ? "AD" : "CVD", countries })
    }
  }
  return out
}

// Whether a case is among the ones an ITC vote ended
export const itcEnded = (ended: ItcEnded[], kind: "AD" | "CVD", country: string | null) =>
  !!country && ended.some((e) => (!e.kind || e.kind === kind) && e.countries.includes(country))

const CODE = /\b(\d{4})\.(\d{2})(?:\.(\d{4})|\.(\d{2})(?:\.(\d{2}))?)?\b/g

// HTS codes as digits: "3203.00.8000" and "7317.00.55.02" → "3203008000", "7317005502"
export const htsCodes = (text: string) =>
  uniq(
    Array.from(text.matchAll(CODE), (m) => `${m[1]}${m[2]}${m[3] ?? ""}${m[4] ?? ""}${m[5] ?? ""}`).filter(
      // Not Chapter 98/99 special provisions, and not a stray decimal ("1994.12")
      (code) => !/^9[89]/.test(code) && Number(code.slice(0, 2)) >= 1 && Number(code.slice(0, 2)) <= 97
    )
  )

// A scope to store: whole up to 12,000 characters, else its start and its end (where the HTS
// codes and "dispositive" sentence are)
export const storedScope = (text: string, max = 12_000) => (text.length <= max ? text : `${text.slice(0, max / 2)}\n…\n${text.slice(-max / 2)}`)

export interface Scope {
  text: string
  main: string[]
  also: string[]
  excluded: string[]
}

const SCOPE_HEADING = /^[ \t]{0,2}Scope of (?:the |this |these )?(?:Orders?|Investigations?|Reviews?|Inquiry|Inquiries|Antidumping|Countervailing|Suspension|Agreement|Merchandise|the Order)[^\n]{0,80}$/gim
const HTS_MENTION = /HTSUS|Harmonized Tariff Schedule/i
const EXCLUDED_PARAGRAPH = /\bexclu(?:ded|des|sion|sions)\b|\bnot (?:included|covered)\b|\boutside (?:of )?the scope\b/i
const SUBJECT_SENTENCE = /\bsubject (?:merchandise|to (?:the|this|these)\b)|\bcovered by (?:the|this|these)\b|\bmerchandise (?:covered|subject)\b|\bproducts? (?:covered|subject)\b/i
const ALSO = /\b(?:may|might|can) also\b|\balso may\b|\bmay (?:be (?:classified|entered|imported)|enter)\b/i

const sentences = (paragraph: string) => paragraph.split(/(?<=[a-z0-9)\]][.;])\s+(?=[A-Z(])/)

// Sorts the codes in a scope: main (what the merchandise "is classified under"), also ("may also
// enter under"), excluded (named only to describe what's left out).
export const splitScopeCodes = (scopeText: string): Omit<Scope, "text"> => {
  const main: string[] = []
  const also: string[] = []
  const excluded: string[] = []
  const paragraphs = scopeText.split(/\n(?=[ \t]{3,}\S)|\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim())
  for (const paragraph of paragraphs) {
    const excludes = EXCLUDED_PARAGRAPH.test(paragraph)
    for (const sentence of sentences(paragraph)) {
      if (!htsCodes(sentence).length) continue
      if (excludes && !SUBJECT_SENTENCE.test(sentence)) {
        excluded.push(...htsCodes(sentence))
        continue
      }
      // "classified under 3203.00.8000; it may also enter under 1301.90.9190": split at "also"
      const at = sentence.search(ALSO)
      if (at >= 0) {
        main.push(...htsCodes(sentence.slice(0, at)))
        also.push(...htsCodes(sentence.slice(at)))
      } else {
        main.push(...htsCodes(sentence))
      }
    }
  }
  const mainSet = uniq(main)
  return {
    main: mainSet,
    also: uniq(also).filter((c) => !mainSet.includes(c)),
    excluded: uniq(excluded).filter((c) => !mainSet.includes(c)),
  }
}

// The scope of the case(s) a notice is about, with its codes sorted. Scopes end with the sentence
// saying the written description is "dispositive"; the region is the "Scope of …" heading up to
// it. Null when the notice has no scope listing HTS codes (most annual review notices).
export const scopeOf = (text: string): Scope | null => {
  const regions: string[] = []
  for (const m of Array.from(text.matchAll(SCOPE_HEADING))) {
    const start = m.index ?? 0
    const rest = text.slice(start, start + 40_000)
    const end = rest.search(/dispositive\.?/i)
    // The next top-level heading, when the scope doesn't end with "dispositive"
    const next = rest.slice(m[0].length).search(/\n\n[A-Z][^\n]{2,90}\n\n/)
    const stop = end >= 0 ? end + "dispositive.".length : next >= 0 ? next + m[0].length : 12_000
    regions.push(rest.slice(0, stop))
  }
  // No heading: the paragraph(s) before "dispositive"
  if (!regions.length) {
    const end = text.search(/written description[^.]{0,120}dispositive/i)
    if (end >= 0) regions.push(text.slice(Math.max(0, end - 6000), end + 200))
  }
  const candidates = regions
    .filter((r) => HTS_MENTION.test(r))
    .map((r) => ({ text: r.trim(), ...splitScopeCodes(r) }))
    .filter((s) => s.main.length || s.also.length)
  if (!candidates.length) return null
  // The fullest scope (an appendix often repeats a shorter summary's codes)
  return candidates.sort((a, b) => b.main.length + b.also.length - (a.main.length + a.also.length))[0]
}

// The HTS codes an ITC notice names ("provided for in subheading 4819.10.00 of the Harmonized
// Tariff Schedule"): its first few paragraphs only, where the products are described.
export const itcCodes = (text: string) => {
  const summary = text.slice(0, 6000)
  return htsCodes(
    sentences(summary.replace(/\s+/g, " "))
      .filter((s) => /provided for in|Harmonized Tariff Schedule|HTSUS/i.test(s))
      .join(" ")
  )
}

export interface ListRow {
  case_number: string
  product: string | null
  country_name: string | null
  // Under the "Suspension Agreements" heading of a list notice
  suspended: boolean
  itc_number: string | null
  // The row's review period's last day ("12/1/24-12/15/24" → 2024-12-15), when it gives one. Review
  // periods end on a month's last day; one ending mid-month is the final stub of an order that
  // ended (revoked on the 16th): see finalPeriod
  period_end: string | null
  // A footnote on the row says the order has been revoked ("revoked due to litigation")
  revoked_note: boolean
}

// A row a list names but that can't be the case it prints: a typo (the number's country or kind
// doesn't fit the heading it's under). A case we already know is kept anyway (notices.ts): a list's
// layout can mislead the check too.
export interface RejectedRow {
  case_number: string
  reason: string
  row: ListRow
}

const DATE_RANGE = /\d{1,2}\/\d{1,2}\/\d{2,4}\s*[-–]\s*\d{1,2}\/\d{1,2}\/\d{2,4}/g
// "INDIA: Mattresses, A-533-919" or "The People's Republic of China:" at the start of a line
const COUNTRY_LINE = /^((?:THE |The )?[A-Z][A-Za-z'’[\]. ()-]{1,60}?):\s*(.*)$/
// Headings inside the list, which end whatever came before them
// (with the table's column heading on the same line: "CVD Proceedings Period")
const SECTION_LINE = /^(?:(?:Antidumping|Countervailing) Duty Proceedings|Suspension Agreements?|Suspended Investigations?|(?:AD|CVD) Proceedings)(?:\s+Period(?: of Review)?)?\s*$/i
const COUNTRY_MARK = "\u0001"
const SECTION_MARK = "\u0002"
const PERIOD_MARK = "\u0003"
// A case number, or one printed without its letter ("Polyethylene Terephthalate Resin, -122-855"):
// the letter then comes from the section it's under. A number that wraps has the row's period
// between its parts ("A-  9/1/25-8/31/26 \n 570-941"), which is that row's period.
const PERIOD_IN = `(?:${PERIOD_MARK}([^${PERIOD_MARK}]*)${PERIOD_MARK}\\s?)?`
const LIST_CASE = new RegExp(`(?:\\b([AC])|(?<![A-Za-z0-9/-]))-\\s?${PERIOD_IN}(\\d{3})-\\s?${PERIOD_IN}(\\d{3})\\b`, "g")

// "12/15/24" → "2024-12-15"
const isoDay = (us: string) => {
  const [m, d, y] = us.split("/").map(Number)
  const year = y < 100 ? 2000 + y : y
  return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

// Footnotes that say an order listed has been revoked ("\5\ We are listing this order, however,
// this order has been revoked due to litigation."): their numbers
const revokedFootnotes = (text: string) => {
  const out = new Set<string>()
  for (const m of Array.from(text.matchAll(/^\s*\\(\d{1,2})\\\s([\s\S]*?)(?=^\s*\\\d{1,2}\\\s|^-{20,}|$(?![\s\S]))/gm))) {
    if (/\b(?:has|have) been revoked\b|\brevoked due to\b/i.test(m[2].replace(/\s+/g, " "))) out.add(m[1])
  }
  return out
}

// The cases a list notice names (annual review opportunities, review initiations, sunset
// initiations), each with the product, country and review period its row gives. The lists are
// tables: a country heading ("INDIA:"), then a row per product ("Mattresses, A-533-919 .....
// 9/1/25-8/31/26"), long names and case numbers wrapping onto the next line. Read line by line:
// country headings, section headings and review periods become markers, dot leaders are dropped,
// and each case's product is the text since the previous case, heading or marker. A row whose
// number can't be right (its country code isn't the heading's country, or its letter isn't the
// section's kind) is rejected as a typo.
export const listRowsChecked = (text: string): { rows: ListRow[]; rejected: RejectedRow[] } => {
  const footnotes = revokedFootnotes(text)
  const marked = text
    .split("\n")
    .map((line) => {
      const clean = line.replace(DATE_RANGE, (range) => ` ${PERIOD_MARK}${range.replace(/\s/g, "")}${PERIOD_MARK} `).replace(/\.{3,}/g, " ").replace(/\s+$/, "")
      // Headings are centered: the whole line, whatever its indent
      if (SECTION_LINE.test(clean.trim())) {
        const kind = /Suspen/i.test(clean) ? "S" : /Countervailing|CVD/i.test(clean) ? "C" : "A"
        return `${SECTION_MARK}${kind} `
      }
      const country = /^\S/.test(clean) && !/^[AC]?-\s?\d/.test(clean) ? clean.match(COUNTRY_LINE) : null
      if (country && !/\d{3}-\d{3}/.test(country[1])) return `${COUNTRY_MARK}${country[1].trim()}${COUNTRY_MARK} ${country[2]}`
      // A heading with a comma for its colon ("SERBIA, Mattresses, A-801-002"): a country in capitals
      const comma = /^\S/.test(clean) ? clean.match(/^([A-Z][A-Z'’[\]. ()-]{2,60}?),\s+(.*)$/) : null
      if (comma && countryFromName(comma[1])) return `${COUNTRY_MARK}${comma[1].trim()}${COUNTRY_MARK} ${comma[2]}`
      return clean
    })
    .join(" ")
    .replace(/\s+/g, " ")
  const rows = new Map<string, ListRow>()
  const rejected: RejectedRow[] = []
  let section: "A" | "C" | "S" | null = null
  let country: string | null = null
  let from = 0
  const matches = Array.from(marked.matchAll(LIST_CASE))
  matches.forEach((m, i) => {
    const at = m.index ?? 0
    // Markers between the previous case and this one; the product starts after the last
    const between = marked.slice(from, at)
    let start = 0
    for (const mark of Array.from(between.matchAll(new RegExp(`${COUNTRY_MARK}([^${COUNTRY_MARK}]+)${COUNTRY_MARK}|${SECTION_MARK}([ACS])`, "g")))) {
      if (mark[1]) country = mark[1]
      else if (mark[2]) {
        section = mark[2] as "A" | "C" | "S"
        country = null
      }
      start = (mark.index ?? 0) + mark[0].length
    }
    // Periods aren't part of the name: a long name wraps around its row's period column
    const raw = between.slice(start).replace(new RegExp(`${PERIOD_MARK}[^${PERIOD_MARK}]*${PERIOD_MARK}`, "g"), " ")
    const product = raw.replace(/\\\d{1,2}\\/g, "").replace(/\s+/g, " ").replace(/[,\s]+$/, "").trim()
    from = at + m[0].length
    // The row's review period: inside its wrapped number, else the first one after it
    const next = matches[i + 1]?.index ?? marked.length
    const period = m[2] ?? m[4] ?? marked.slice(from, next).match(new RegExp(`${PERIOD_MARK}([^${PERIOD_MARK}]*)${PERIOD_MARK}`))?.[1] ?? null
    const letter = m[1] ?? (section === "A" || section === "C" ? section : null)
    if (!letter) return
    const caseNumber = `${letter}-${m[3]}-${m[5]}`
    if (/^[AC]-000-000$/.test(caseNumber)) return
    const heading = country ? countryFromName(country) : null
    const own = countryOfCase(caseNumber)
    // Not when the row itself names its number's country (a heading the list mistyped)
    const namesOwn = !!own && raw.split(/[^A-Za-z'’[\]]+/).some((word, i, words) => [word, `${word} ${words[i + 1] ?? ""}`].some((w) => w.length > 3 && countryFromName(w) === own))
    const reason =
      m[1] && (section === "A" || section === "C") && m[1] !== section
        ? `a ${m[1] === "A" ? "antidumping" : "countervailing"} number under the ${section === "A" ? "antidumping" : "countervailing"} heading`
        : heading && own && heading !== own && !namesOwn
          ? `its country code (${m[3]}) isn't ${country}'s`
          : null
    const itc = marked.slice(at, at + 80).replace(new RegExp(`${PERIOD_MARK}[^${PERIOD_MARK}]*${PERIOD_MARK}\\s?`, "g"), "").match(/^[AC]?-\s?\d{3}-\s?\d{3}\s+((?:701|731)-TA-\d+(?:-[A-Z])?)/)?.[1] ?? null
    const existing = rows.get(caseNumber)
    // A product name is a few words of letters, not a sentence or a table's column headings
    const usable =
      product && product.length >= 3 && product.length <= 140 && /^[A-Z0-9(]/.test(product) && !/\b(?:Period|Commerce|Federal Register|notice)\b|TA-\d|\(\d{3}\)/i.test(product)
    const marks = Array.from(raw.matchAll(/\\(\d{1,2})\\/g), (f) => f[1])
    const row: ListRow = {
      case_number: caseNumber,
      product: existing?.product ?? (usable ? product : null),
      country_name: existing?.country_name ?? country,
      suspended: existing?.suspended ?? section === "S",
      itc_number: existing?.itc_number ?? itc,
      // The later date: Commerce has printed a period backwards ("8/31/26-9/1/25")
      period_end: existing?.period_end ?? (period ? period.split(/[-–]/).map(isoDay).sort()[1] : null),
      revoked_note: (existing?.revoked_note ?? false) || marks.some((n) => footnotes.has(n)),
    }
    if (reason) rejected.push({ case_number: caseNumber, reason, row })
    else rows.set(caseNumber, row)
  })
  return { rows: Array.from(rows.values()), rejected }
}

export const listRows = (text: string): ListRow[] => listRowsChecked(text).rows

// A review period that ends mid-month: the order ended the next day, and the list names it only
// for the entries made before (kegs from China, "12/1/24-12/15/24", revoked 12/16/24)
export const finalPeriod = (periodEnd: string | null) => {
  if (!periodEnd) return false
  const next = new Date(`${periodEnd}T12:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  return next.getUTCDate() !== 1
}

// A list notice's case numbers that weren't read as rows: every case number start in the text
// ("A-525-", or a bare "-122-" printed without its letter), against the rows read and rejected
// (Commerce's "A-000-000" example aside). Above zero means a row was lost to the table's wrapping.
export const listGap = (text: string) => {
  const flat = text.replace(DATE_RANGE, " ").replace(/\.{3,}/g, " ").replace(/\s+/g, " ")
  // A case number's start, however its end wrapped; not a standard's ("ASTM A-312")
  const loose = (flat.match(/(?<![A-Za-z0-9/-]|ASTM )[AC]?-\s?\d{3}-/g) ?? []).length
  const read = (flat.match(LIST_CASE) ?? []).length
  return Math.max(0, loose - read)
}

// Countries a circumvention ruling reaches: "… Circumvention … With Respect to Malaysia",
// "… Completed in the Socialist Republic of Vietnam"
export const circumventionCountries = (title: string) => {
  const flat = title.replace(/\s+/g, " ")
  const out: string[] = []
  for (const m of Array.from(flat.matchAll(/(?:with respect to|completed in|assembled in|processed in|exported from|through)\s+(?:the\s+)?([A-Z][^:;]+?)(?=[:;]|$)/gi))) {
    for (const name of m[1].split(/,\s*(?:and\s+)?|\s+and\s+(?!Herzegovina|Tobago)/)) {
      const country = name.replace(/^the\s+/i, "").trim()
      if (/^[A-Z]/.test(country)) out.push(country)
    }
  }
  return uniq(out)
}
