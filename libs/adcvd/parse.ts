import { decodeEntities } from "../tariff-sources/text"
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
  if (/Court Decision|Court of International Trade|Federal Circuit/i.test(t)) return "court"
  if (/Revocation of (?:the )?(?:Antidumping|Countervailing|Orders?)|and Revocation of|Revocation of .*Orders?$/i.test(t) && !/in Part/i.test(t)) return "revocation"
  if (/Continuation of (?:the )?(?:Antidumping|Countervailing|Orders?|Suspension)/i.test(t)) return "continuation"
  if (/Sunset Reviews?|Five-Year Reviews?/i.test(t)) return /Initiation/i.test(t) ? "sunset_init" : "sunset_result"
  if (/Scope Ruling/i.test(t)) return "scope_ruling"
  if (/Changed Circumstances/i.test(t)) return "changed_circumstances"
  if (/New Shipper/i.test(t)) return "new_shipper"
  if (/Administrative Reviews?/i.test(t)) {
    if (/Preliminary Results/i.test(t)) return "review_prelim"
    if (/Final Results/i.test(t)) return "review_final"
    return "review_other"
  }
  if (/Suspension Agreement|Suspended Investigation|Agreement Suspending/i.test(t)) return "suspension"
  if (/Termination of (?:the )?(?:Less-Than-Fair-Value |Countervailing Duty |Antidumping Duty )?Investigations?|Rescission of (?:the )?(?:Less-Than-Fair-Value|Countervailing Duty|Antidumping Duty) Investigation/i.test(t)) return "termination"
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

// A final or preliminary decision that ended a case: "Negative" in a determination's title
export const isNegative = (title: string) => /\bNegative\b/i.test(title) && !/\bAffirmative\b/i.test(title)

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
}

const DATE_RANGE = /\d{1,2}\/\d{1,2}\/\d{2,4}\s*[-–]\s*\d{1,2}\/\d{1,2}\/\d{2,4}/g
// "INDIA: Mattresses, A-533-919" or "The People's Republic of China:" at the start of a line
const COUNTRY_LINE = /^((?:THE |The )?[A-Z][A-Za-z'’[\]. ()-]{1,60}?):\s*(.*)$/
// Headings inside the list, which end whatever came before them
const SECTION_LINE = /^(?:(?:Antidumping|Countervailing) Duty Proceedings|Suspension Agreements?|Suspended Investigations?|(?:AD|CVD) Proceedings)\s*$/i
const COUNTRY_MARK = "\u0001"
const SECTION_MARK = "\u0002"

// The cases a list notice names (annual review opportunities, review initiations, sunset
// initiations), each with the product and country its row gives. The lists are tables: a country
// heading ("INDIA:"), then a row per product ("Mattresses, A-533-919 ..... 9/1/25-8/31/26"), long
// names and case numbers wrapping onto the next line. Read line by line: country headings and
// section headings become markers, the date column and dot leaders are dropped, and each case's
// product is the text since the previous case, heading or marker.
export const listRows = (text: string): ListRow[] => {
  const marked = text
    .split("\n")
    .map((line) => {
      const clean = line.replace(DATE_RANGE, " ").replace(/\.{3,}/g, " ").replace(/\s+$/, "")
      // Headings are centered: the whole line, whatever its indent
      if (SECTION_LINE.test(clean.trim())) return `${SECTION_MARK}${/Suspen/i.test(clean) ? "S" : "-"} `
      const country = /^\S/.test(clean) && !/^[AC]-\s?\d/.test(clean) ? clean.match(COUNTRY_LINE) : null
      if (country && !/\d{3}-\d{3}/.test(country[1])) return `${COUNTRY_MARK}${country[1].trim()}${COUNTRY_MARK} ${country[2]}`
      return clean
    })
    .join(" ")
    .replace(/\s+/g, " ")
  const rows = new Map<string, ListRow>()
  let suspended = false
  let country: string | null = null
  let from = 0
  for (const m of Array.from(marked.matchAll(CASE))) {
    const at = m.index ?? 0
    // Markers between the previous case and this one; the product starts after the last
    const between = marked.slice(from, at)
    let start = 0
    for (const mark of Array.from(between.matchAll(new RegExp(`${COUNTRY_MARK}([^${COUNTRY_MARK}]+)${COUNTRY_MARK}|${SECTION_MARK}(S|-)`, "g")))) {
      if (mark[1]) country = mark[1]
      else {
        suspended = mark[2] === "S"
        country = null
      }
      start = (mark.index ?? 0) + mark[0].length
    }
    const product = between.slice(start).replace(/\s+/g, " ").replace(/[,\s]+$/, "").trim()
    from = at + m[0].length
    const caseNumber = `${m[1]}-${m[2]}-${m[3]}`
    if (/^[AC]-000-000$/.test(caseNumber)) continue
    const itc = marked.slice(at, at + 40).match(/^[AC]-\s?\d{3}-\s?\d{3}\s+((?:701|731)-TA-\d+(?:-[A-Z])?)/)?.[1] ?? null
    const existing = rows.get(caseNumber)
    // A product name is a few words of letters, not a sentence or a table's column headings
    const usable =
      product && product.length >= 3 && product.length <= 140 && /^[A-Z0-9(]/.test(product) && !/\b(?:Period|Commerce|Federal Register|notice)\b|TA-\d|\(\d{3}\)/i.test(product)
    rows.set(caseNumber, {
      case_number: caseNumber,
      product: existing?.product ?? (usable ? product : null),
      country_name: existing?.country_name ?? country,
      suspended: existing?.suspended ?? suspended,
      itc_number: existing?.itc_number ?? itc,
    })
  }
  return Array.from(rows.values())
}

// A list notice's case numbers that weren't read as rows: every "A-" or "C-" followed by digits in
// the text, against the case numbers read (Commerce's "A-000-000" example aside). Above zero means
// a row was lost to the table's wrapping.
export const listGap = (text: string) => {
  const flat = text.replace(DATE_RANGE, " ").replace(/\.{3,}/g, " ").replace(/\s+/g, " ")
  // A case number's start ("A-525-"), however its end wrapped; not a standard's ("ASTM A-312")
  const loose = (flat.match(/(?<![A-Za-z0-9]|ASTM )[AC]-\s?\d{3}-/g) ?? []).length
  const read = (flat.match(CASE) ?? []).length
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
