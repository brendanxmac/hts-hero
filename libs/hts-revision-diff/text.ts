// Text helpers shared by parsing, diffing and summary checks

// Same text for comparison purposes: ignores whitespace, quote and dash style
export const normalizeForCompare = (text: string) =>
  text
    .replace(/\u00ad/g, "") // soft hyphen
    .replace(/[\u2018\u2019\u201a\u201b\u2032]/g, "'")
    .replace(/[\u201c\u201d\u201e\u201f\u2033]/g, '"')
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:)\]])/g, "$1")
    .replace(/([([])\s+/g, "$1")
    .trim()

// HTS numbers in text: 8-digit (9903.01.25) and 10-digit in either form
// (8471.30.0100 or 8471.30.01.00). Headings (4 digits) and 6-digit
// subheadings are included when written with dots (8471.30). Bare 4-digit
// numbers are skipped because they collide with years.
const HTS_CODE_PATTERN =
  /(?<![\d.])(\d{4}\.\d{2}(?:\.\d{4}|\.\d{2}(?:\.\d{2})?)?)(?![\d])/g

export const normalizeHtsCode = (code: string) => {
  const digits = code.replace(/\D/g, "")
  if (digits.length === 10) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}.${digits.slice(8)}`
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`
  }
  if (digits.length === 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`
  return code.trim()
}

export const extractHtsCodes = (text: string) => {
  const codes = new Set<string>()
  for (const match of Array.from(text.matchAll(HTS_CODE_PATTERN))) {
    codes.add(normalizeHtsCode(match[1]))
  }
  return Array.from(codes).sort()
}

// Digits only, padded so codes of different lengths compare by position
export const htsSortKey = (code: string) => code.replace(/\D/g, "").padEnd(10, "0")

const ROMAN_VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
}

export const romanToInt = (roman: string) => {
  let total = 0
  let prev = 0
  for (let i = roman.length - 1; i >= 0; i--) {
    const value = ROMAN_VALUES[roman[i].toUpperCase()]
    if (!value) return NaN
    if (value < prev) total -= value
    else {
      total += value
      prev = value
    }
  }
  return total
}

export const intToRoman = (value: number) => {
  const table: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ]
  let result = ""
  let remaining = value
  for (const [n, numeral] of table) {
    while (remaining >= n) {
      result += numeral
      remaining -= n
    }
  }
  return result
}

// A well-formed roman numeral (so "iv" is roman but "vx" is not)
export const isRoman = (value: string) => {
  if (!/^[ivxlcdm]+$/i.test(value)) return false
  const n = romanToInt(value)
  return n > 0 && intToRoman(n) === value.toUpperCase()
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

export const truncate = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max)}\n… [truncated, ${text.length - max} more characters]`

const revisionName = (year: string, revision: string | undefined) =>
  revision ? `${year}HTSRev${Number(revision)}` : `${year}HTSBasic`

// The revision a converted PDF says it is: "Revision 6 (2026)",
// "(2026 Revision 6)", "Basic Edition (2026)"…, and for a change record, the
// revision it follows ("updates made to the HTS after 2026 Revision 5").
// A Basic edition's title has no revision number ("Harmonized Tariff Schedule of the
// United States (2026)"), and its change record is cumulative: "updates made to the HTS
// since the last printed edition (2025 Basic Edition)" names the edition it doesn't follow
// directly, so it's neither its name nor its previous revision
export const detectRevision = (markdown: string) => {
  const head = markdown.slice(0, 6000)
  // A mention of an earlier edition, not the document's own
  const isReference = (index: number) => /(?:after|since)\b[^.]{0,80}$/i.test(head.slice(Math.max(0, index - 80), index))
  const patterns: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/Revision\s+(\d+)\s*\((\d{4})\)/gi, (m) => revisionName(m[2], m[1])],
    [/\((\d{4})\s+Revision\s+(\d+)\)/gi, (m) => revisionName(m[1], m[2])],
    [/Basic\s+Edition\s*\((\d{4})\)/gi, (m) => revisionName(m[1], undefined)],
    [/\((\d{4})\s+Basic\s+Edition\)/gi, (m) => revisionName(m[1], undefined)],
    [/Harmonized\s+Tariff\s+Schedule\s+of\s+the\s+United\s+States\s*\((\d{4})\)/gi, (m) => revisionName(m[1], undefined)],
  ]
  let name: string | null = null
  for (const [pattern, toName] of patterns) {
    const m = Array.from(head.matchAll(pattern)).find((x) => !isReference(x.index!))
    if (m) {
      name = toName(m)
      break
    }
  }
  const after = head.match(/after\s+(?:the\s+)?(\d{4})\s+(?:HTS\s+)?(?:Revision\s+(\d+)|Basic\s+Edition)/i)
  return { name, previous: after ? revisionName(after[1], after[2]) : null }
}

// ---------- Code ranges ----------

export interface HtsRange {
  from: string
  to: string
}

const CODE = String.raw`\d{4}\.\d{2}(?:\.\d{4}|\.\d{2}(?:\.\d{2})?)?`
// "9903.82.02–9903.82.17", "9903.01.25 - 9903.01.30", "9903.45.01 through 9903.45.06", "… to …"
const RANGE_PATTERN = new RegExp(String.raw`(?<![\d.])(${CODE})\s*(?:[-‐-―−]|\bthrough\b|\bto\b)\s*(${CODE})(?![\d])`, "g")

export const extractHtsRanges = (text: string): HtsRange[] => {
  const seen = new Set<string>()
  const ranges: HtsRange[] = []
  for (const m of Array.from(text.matchAll(RANGE_PATTERN))) {
    const from = normalizeHtsCode(m[1])
    const to = normalizeHtsCode(m[2])
    // Only a real range: same heading, and "to" after "from"
    if (from.slice(0, 4) !== to.slice(0, 4) || htsSortKey(to) <= htsSortKey(from)) continue
    const key = `${from}–${to}`
    if (seen.has(key)) continue
    seen.add(key)
    ranges.push({ from, to })
  }
  return ranges
}

export const formatRange = (r: HtsRange) => `${r.from}–${r.to}`

// Whether a code falls inside a range (9903.82.17 covers 9903.82.17.xx too)
export const inRange = (code: string, r: HtsRange) => {
  const k = htsSortKey(code)
  return k >= htsSortKey(r.from) && k <= r.to.replace(/\D/g, "").padEnd(10, "9")
}

// ---------- Cumulative change records ----------

// A Basic edition's change record is cumulative: it lists every change since the last printed
// edition, with an Edition column naming the revision that made it ("Rev 16", …, "2026"). Only the
// rows the Basic edition itself made (Edition = its year) are changes from the revision before it;
// the rest were already in that revision. Rows that wrap onto a second line have a blank Edition
// cell and go with the row above. Other change records, and tables without an Edition column, are
// returned as is.
export const ownEditionRows = (markdown: string, revisionName: string) => {
  const basic = revisionName.match(/^(\d{4})HTSBasic$/)
  if (!basic) return { markdown, kept: null, dropped: 0 }
  const year = basic[1]
  const cells = (line: string) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.replace(/<[^>]+>/g, "").trim())
  const isSeparator = (line: string) => /^\|\s*:?-{3,}/.test(line.trim())
  let editionColumn = -1
  let keeping = true
  let kept = 0
  let dropped = 0
  const out: string[] = []
  for (const line of markdown.split("\n")) {
    if (!line.trim().startsWith("|")) {
      editionColumn = -1
      keeping = true
      out.push(line)
      continue
    }
    const row = cells(line)
    const header = row.findIndex((c) => /^edition$/i.test(c))
    if (header >= 0) {
      editionColumn = header
      out.push(line)
      continue
    }
    if (editionColumn < 0 || isSeparator(line)) {
      out.push(line)
      continue
    }
    const edition = row[editionColumn] ?? ""
    if (edition) keeping = edition === year
    if (keeping) {
      if (edition) kept++
      out.push(line)
    } else if (edition) dropped++
  }
  return { markdown: out.join("\n"), kept, dropped }
}
