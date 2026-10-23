import { calculateBase, parseRateColumnParts } from "../../tariffs/engine-v2/base-rates"
import { AllRules } from "../../tariffs/engine-v2/data"
import { isEffectiveOn } from "../../tariffs/engine-v2/dates"
import type { HtsElement } from "../../interfaces/hts"
import type { OddRateStep } from "../../social/types"
import { postCountry, productNameOf, VALUE, UNITS } from "./data"

// The HTS's odd duty rates: rates charged per jewel, by the degree of a sugar's polarity, per
// square meter of recording surface, in fractions, or on one part of the goods. Worked out from
// the HTS the app loads, so the list follows each revision. The rules follow
// hts-data-processing's src/workflows/unusual-duty-strings.ts.
//
// Only rates the engine fully calculates are offered for posts, so a post never claims HTS Hero
// works out a rate it can't. A rate that needs an answer (a case's value, a sugar's polarity)
// counts: the calculator asks for it.

export type OddColumn = "general" | "other"

export interface OddRate {
  htsno: string
  column: OddColumn
  rate: string // as the HTS writes it, whitespace tidied
  product: string // a short name, for headlines
  why: string // "Charged per jewel; 3-part rate"
  hook: string // "per jewel": what the headline says the rate is charged
  rank: number // lower is more post-worthy
  calculable: boolean
}

// ── Reading a rate's shape ──

type PartCategory =
  | "free"
  | "ad_valorem"
  | "ad_valorem_on_component"
  | "specific"
  | "specific_on_component"
  | "specific_with_qualifier"
  | "reference"
  | "narrative"
  | "unknown"

const PROGRAM_CODE = /^[A-Z]{1,2}[+*]?$/
const programCodesIn = (inner: string) => {
  const codes = inner.split(",").map((c) => c.trim())
  return codes.length && codes.every((c) => PROGRAM_CODE.test(c)) ? codes : null
}

// "2.8¢/kg on drained weight" → "N¢/kg on drained weight"; "m2" keeps its digit
const toPattern = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\(([^)]*)\)/g, (match, inner: string) => (programCodesIn(inner) ? "(PROGRAMS)" : match))
    .replace(/\b\d{4}\.\d{2}(?:\.\d{2}){0,2}\b/g, "<HTS>")
    .replace(/(?<![A-Za-z<])\d+(?:,\d{3})*(?:\.\d+)?/g, "N")

// Rate text without its program lists: "Free (A,AU) 2.8% (JP)" → ["Free", "2.8%"]
const rateTexts = (raw: string) =>
  raw
    .replace(/\s+/g, " ")
    .replace(/\(([^)]*)\)/g, (match, inner: string) => (programCodesIn(inner) ? "\u0000" : match))
    .split("\u0000")
    .map((text) => text.trim())
    .filter(Boolean)

const partsOf = (rateText: string) =>
  rateText
    .split(/\s*\+\s*(?![,)]|$)/)
    .map((p) => p.trim())
    .filter(Boolean)

// Units with spaces in them: "$N/pf. liter", "N¢/clean kg", "N¢/line/ gross"
const UNIT = String.raw`(?:\d{1,3}(?:,\d{3})+|[^\s,]+)(?:\s+(?:liter|kg|m|gross)\b)?`
const SPECIFIC = new RegExp(String.raw`^(?:\$N|N¢)(?:\s*\/\s*${UNIT}|\s+each)?`)

const categorize = (pattern: string): PartCategory => {
  if (/^free$/i.test(pattern)) return "free"
  if (/^see\b/i.test(pattern)) return "reference"
  if (/^N(?: N\/N)?%$/.test(pattern)) return "ad_valorem"
  if (/^N% on\b/.test(pattern)) return "ad_valorem_on_component"
  const specific = pattern.match(SPECIFIC)
  if (specific) {
    const rest = pattern.slice(specific[0].length).trim()
    if (!rest) return "specific"
    if (/^on\b/.test(rest)) return "specific_on_component"
    return "specific_with_qualifier"
  }
  if (!/N/.test(pattern) || /^the rate\b/i.test(pattern)) return "narrative"
  return "unknown"
}

// "2.8¢/liter" → "liter", "$1.61 each" → "each", "$4/1000" → "1000"
const unitOf = (part: string) => {
  const match = part.match(new RegExp(String.raw`^(?:\$\s*[\d.,]+|[\d.,]+\s*¢)\s*(?:\/\s*(${UNIT})|\s+(each))`))
  return match ? (match[1] ?? match[2]) : null
}

// Everyday units; anything else ("jewel", "head", "clean kg") is odd
const COMMON_UNITS = new Set(["kg", "liter", "each", "t", "bbl", "g", "m"])

// Units as a headline says them
const UNIT_WORDS: Record<string, string> = {
  t: "metric ton",
  m2: "square meter",
  m3: "cubic meter",
  "pr.": "pair",
  "doz.": "dozen",
  "doz. pr.": "dozen pairs",
  "pf. liter": "proof liter",
  "pf.liter": "proof liter",
  "line/ gross": "line per gross",
  "line/gross": "line per gross",
  "clean kg": "kg of clean wool",
  "1000": "thousand",
  "1,000": "thousand",
  "lin. m": "linear meter",
}
const unitWords = (unit: string) => UNIT_WORDS[unit] ?? unit

const WHY: Partial<Record<PartCategory, string>> = {
  narrative: "Rate is a sentence, not a number",
  reference: "Rate points to another provision",
  specific_with_qualifier: "Per-unit rate with extra conditions",
  specific_on_component: "Charged on part of the contents",
  ad_valorem_on_component: "Percentage of one part's value",
}

// Most post-worthy first
const RANKED = [
  "Rate is a sentence",
  "Conditional Free",
  "Fractional percentage",
  "Sliding scale",
  "Per-unit rate with extra conditions",
  "Charged per jewel",
  "-part rate",
  "Charged on part of the contents",
  "Percentage of one part's value",
  "Charged per",
  "Rate points to another provision",
]
const rankOf = (reasons: string[]) => {
  const ranks = reasons.map((r) => RANKED.findIndex((k) => r.includes(k))).filter((i) => i >= 0)
  return ranks.length ? Math.min(...ranks) : RANKED.length
}

// Why a rate stands out and what a headline says about it, or null when it's plain (a
// percentage, Free) or an ordinary per-unit rate ("2.2¢/kg + 5%")
export const describeRate = (duty: string): { why: string; hook: string; rank: number } | null => {
  const text = duty.replace(/\s+/g, " ").trim()
  const segments = rateTexts(text).map(partsOf)
  const parts = segments.flat().map((part) => ({ part, category: categorize(toPattern(part)), pattern: toPattern(part) }))
  if (!parts.length) return null
  const categories = new Set(parts.map((p) => p.category))

  const reasons: string[] = []
  const hooks: string[] = []
  categories.forEach((c) => WHY[c] && reasons.push(WHY[c]!))

  const sliding = parts.find((p) => /for each degree under/i.test(p.part))
  if (sliding) {
    reasons.unshift("Sliding scale by the degree")
    hooks.push("by the degree of the sugar's polarity")
  }
  const fraction = parts.find((p) => /^N N\/N%$/.test(p.pattern))
  if (fraction) {
    reasons.push("Fractional percentage")
    hooks.push(`at ${fraction.part}`)
  }
  const conditionalFree = parts.find((p) => /^free\b/i.test(p.part) && !/^free$/i.test(p.part))
  if (conditionalFree) {
    reasons.push("Conditional Free")
    hooks.push(`nothing, ${conditionalFree.part.replace(/^free\s*,?\s*/i, "")}`)
  }
  // Per-unit parts in odd units or with a condition: "per jewel over 7", "per kg of total sugars"
  parts.forEach((p) => {
    const unit = unitOf(p.part)
    const odd = !!unit && !COMMON_UNITS.has(unit)
    if (odd) reasons.push(`Charged per ${unitWords(unit!)}`)
    if (p.category !== "specific_with_qualifier" && !odd) return
    if (/for each degree/i.test(p.part)) return
    const condition = p.part.replace(new RegExp(String.raw`^(?:\$\s*[\d.,]+|[\d.,]+\s*¢)\s*(?:\/\s*${UNIT}|\s+each)?`), "").trim()
    hooks.push(unit && unit !== "each" ? `per ${unitWords(unit)}${condition ? `${condition.startsWith(",") ? "" : " "}${condition}` : ""}` : condition || "with a catch")
  })
  const onPart = parts.find((p) => p.category === "ad_valorem_on_component" || p.category === "specific_on_component")
  if (onPart) hooks.push(`${parts.length > 1 ? "partly " : ""}${onPart.part.replace(/^.*?\s(on\s)/, "$1")}`)
  const mostParts = Math.max(...segments.map((s) => s.length))
  if (mostParts >= 3) {
    reasons.push(`${mostParts}-part rate`)
    hooks.push(`in ${mostParts} parts`)
  }

  const plain = Array.from(categories).every((c) => c === "free" || c === "ad_valorem") && !fraction
  if (plain || !reasons.length) return null
  return { why: reasons.join("; "), hook: hooks[0] ?? "with a catch", rank: rankOf(reasons) }
}

// Words the HTS broke across lines, and a "+" missing its space: "$2.50/thou- sand",
// "sugars+ 6%", "86.1¢/m2of recording surface"
export const tidyRate = (rate: string) =>
  rate
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b(thou|appli|high)- (sand|cable|est)\b/g, "$1$2")
    .replace(/\bm2of\b/g, "m2 of")
    .replace(/\s*\+\s*(?=[\d$¢])/g, " + ")
    .replace(/(\d)¢ \//g, "$1¢/")

// ── Whether HTS Hero calculates it, and how ──

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const count = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 3 })

// True when the engine reads every part of the rate (no "Not calculated" part, no code to ask for)
export const isCalculable = (rate: string) => {
  const parts = parseRateColumnParts(rate)
  return parts.length > 0 && parts.every((t) => !t.notCalculated && !t.pointsTo && t.value !== null)
}

export interface WorkedExample {
  steps: OddRateStep[]
  // The base duty when every part is worked out without an answer
  total?: string
  totalPct?: number
}

// The engine's own working on the standard shipment (customs value $10,000, 1,000 units in the
// line's first unit): each part's figure, or the question the calculator asks for it
export const workedExample = (rate: string, quantityUnit?: string): WorkedExample => {
  const base = calculateBase(parseRateColumnParts(rate), VALUE, UNITS, {}, quantityUnit)
  const questions = new Map(base.inputs.map((i) => [i.id, i.label]))
  const steps = base.parts.map((p): OddRateStep => {
    const asks = p.inputId && (p.assumed || p.component) ? questions.get(p.inputId) : undefined
    if (asks) return { rate: p.raw, asks }
    if (/^free\b/i.test(p.raw)) return { rate: p.raw, amount: usd(0) }
    const unit = p.unit === "each" ? "" : /^(jewel|head|piece|pair|article)$/.test(p.unit ?? "") ? ` ${p.unit}s` : ` ${p.unit ?? "units"}`
    const detail = p.kind === "percent" ? `of ${usd(p.basis)}` : `× ${count(p.basis)}${unit}`
    return { rate: p.raw, detail, amount: usd(p.amount) }
  })
  if (steps.some((s) => s.asks)) return { steps }
  return { steps, total: usd(base.amount), totalPct: Math.round((base.amount / VALUE) * 1000) / 10 }
}

// ── The list ──

export const COLUMN_LABEL: Record<OddColumn, string> = {
  general: "General rate",
  other: "Column 2 rate",
}

// The countries Column 2 applies to today ("Cuba, North Korea, Russia, Belarus")
export const column2Countries = (asOf: string) =>
  AllRules.columnAssignments.filter((c) => isEffectiveOn(c.effective, asOf)).map((c) => postCountry(c.country))

// Every odd rate in the HTS, most post-worthy first. A line's statistical suffixes share its
// rates, so each rate is listed once, on the line that carries it.
export const findOddRates = (elements: HtsElement[]): OddRate[] => {
  const out: OddRate[] = []
  const parents: HtsElement[] = []
  elements.forEach((e) => {
    const indent = Number(e.indent) || 0
    parents.length = indent
    // Chapters 98 and 99 are special provisions, not products
    if (e.htsno && !/^9[89]/.test(e.htsno)) {
      ;(["general", "other"] as OddColumn[]).forEach((column) => {
        const rate = tidyRate(e[column] ?? "")
        if (!rate) return
        const described = describeRate(rate)
        if (!described) return
        out.push({ htsno: e.htsno, column, rate, product: productNameOf(e, parents.filter(Boolean)), ...described, calculable: isCalculable(rate) })
      })
    }
    parents[indent] = e
  })
  return out.sort((a, b) => a.rank - b.rank || (a.column === b.column ? 0 : a.column === "general" ? -1 : 1))
}
