import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { Countries } from "../../constants/countries"
import { buildEstimateInput } from "../../components/duty-calculator/lib/estimate"
import { todayIso } from "../../components/duty-calculator/lib/format"
import type { ChapterFile, UsImports } from "../../components/duty-calculator/lib/usImportsData"
import { calculate } from "../../tariffs/engine-v2/calculate"
import { AllRules } from "../../tariffs/engine-v2/data"
import { addDays, calculateHistory, LineChange } from "../../tariffs/engine-v2/history"
import { getVerifiedRange } from "../../tariffs/engine-v2/revisions"
import type { CalculationResult, DutyLine } from "../../tariffs/engine-v2/types"
import type { CountrySide, PostCountry, RateEvent, RatePoint } from "../../social/types"
import { shortLabel } from "../country-pages/topImports"
import { htsProductName } from "../hts-duty-summary"
import type { HtsElement } from "../../interfaces/hts"
import { DutyInputError, findHtsLine, findOrigin, HtsLine } from "../mcp/duty"
import { getUsImports } from "../us-imports-server"

// The figures every post is drawn from, for one HTS code: what each origin pays today (the
// engine, on a standard $10,000 ocean shipment), what the US bought from each (Census), and, on
// request, how the main origin's rate moved over the verified data.

export const VALUE = 10000
export const UNITS = 1000

export const SOURCE_ENGINE = "HTS Hero tariff engine"
export const SOURCE_BOTH = "HTS Hero tariff engine · US Census Bureau"
export const SOURCE_CENSUS = "US Census Bureau"

export const round1 = (n: number) => Math.round(n * 10) / 10
export const pctText = (n: number) => `${round1(n)}%`
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const postCountry = (code: string): PostCountry => {
  const c = Countries.find((x) => x.code === code)
  return { code, name: c?.name ?? code, flag: c?.flag ?? "" }
}

export const isKnownCountry = (code: string) => Countries.some((c) => c.code === code)

const programShort = (id?: string) => {
  const name = AllRules.programs.find((p) => p.id === id)?.name
  return name ? name.split(" – ")[0] : "Base duty"
}

export interface Side extends CountrySide {
  parts: { label: string; pct: number }[]
  // The Chapter 99 lines that charge something, with their legal sources
  lines: DutyLine[]
  perUnit: boolean
  priorValue?: number
}

// The rate as a percent of value, and what adds up to it, by program
const rateOf = (result: CalculationResult) => {
  const byProgram = new Map<string, number>()
  result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .forEach((l) => {
      const key = programShort(l.program)
      byProgram.set(key, (byProgram.get(key) ?? 0) + (l.amount / VALUE) * 100)
    })
  const parts = [{ label: "Base duty", pct: (result.base.amount / VALUE) * 100 }, ...Array.from(byProgram, ([label, pct]) => ({ label, pct }))]
  return {
    pct: (result.totalDuty / VALUE) * 100,
    lines: result.lines.filter((l) => l.status === "applies" && l.amount > 0),
    parts: parts.filter((x) => x.pct > 0).map((x) => ({ ...x, pct: round1(x.pct) })),
    perUnit: result.requiresQuantity,
  }
}

// A product's name for a headline. The HTS description, read with its parents, usually works
// ("Lithium-ion batteries"); statistical lines that only qualify their parent ("New", "Valued
// over $12", "G.V.W. exceeding 2.5 metric tons") fall back to their heading ("Motor cars · New").
export const productNameOf = (element: HtsElement, parents: HtsElement[]) => {
  const name = htsProductName(element, parents, 60)
  const fragment = !/^[A-Z]/.test(name) || /^(new|used|other|valued|weighing|g\.v\.w|having|containing|not |of |for |with |in )/i.test(name) || name.length < 6
  return fragment ? shortLabel(element, parents) : name
}

export interface ProductData {
  line: HtsLine
  htsno: string
  product: string // capitalized, for headlines
  imports: UsImports | null
  asOf: string
  // By ISO2: the asked-for origins, then the top suppliers by import value
  sides: Map<string, Side>
  requested: string[]
  // Origins by 2025 import value, largest first (Census), those the calculator knows
  suppliers: string[]
  main: string
  notes: string[]
}

export const productData = async ({
  htsCode,
  countries = [],
  productName,
  maxOrigins = 12,
}: {
  htsCode: string
  countries?: string[]
  productName?: string
  maxOrigins?: number
}): Promise<ProductData> => {
  const line = await findHtsLine(htsCode)
  const product = capitalize(productName?.trim() || productNameOf(line.element, line.parents))
  const htsno = line.element.htsno
  const imports = getUsImports(htsno)
  const asOf = todayIso()
  const notes: string[] = []

  const requested = countries.map((c) => findOrigin(c).code)
  const suppliers = imports
    ? Array.from(imports.byCountry.entries())
        .sort((a, b) => b[1].value - a[1].value)
        .map(([code]) => code)
        .filter(isKnownCountry)
    : []
  const main = requested[0] ?? suppliers[0]
  if (!main) throw new DutyInputError("No country given and Census has no import figures for this code to pick its top suppliers from.")
  if (imports && imports.level !== 10) notes.push(`Census has no figures for the exact line; import values are for its ${imports.level}-digit family.`)
  if (!imports) notes.push("Census has no import figures for this code; posts that need them are left out.")

  const origins = Array.from(new Set([...requested, ...suppliers])).slice(0, Math.max(maxOrigins, requested.length))
  const sides = new Map<string, Side>()
  origins.forEach((code) => {
    const rate = rateOf(calculate(AllRules, { ...inputFor(line, code, asOf), answers: {} }))
    const figures = imports?.byCountry.get(code)
    sides.set(code, {
      country: postCountry(code),
      ratePct: round1(rate.pct),
      importValue: figures?.value,
      priorValue: figures?.prior,
      importChangePct: figures && figures.prior > 0 ? ((figures.value - figures.prior) / figures.prior) * 100 : undefined,
      parts: rate.parts,
      lines: rate.lines,
      perUnit: rate.perUnit,
    })
  })
  if (sides.get(main)!.perUnit) notes.push("The base rate is per unit, so percentages assume a $10,000 shipment of 1,000 units.")
  return { line, htsno, product, imports, asOf, sides, requested, suppliers, main, notes }
}

const inputFor = (line: HtsLine, code: string, asOf: string) =>
  buildEstimateInput({
    element: line.element,
    tariffElement: line.rateElement,
    country: findOrigin(code),
    asOf,
    customsValue: VALUE,
    quantity: UNITS,
    transportMode: "ocean",
  })

// What moved the rate on a date, by program, biggest first: "IEEPA ends · Sec. 122 +10%",
// "Sec. 301 +12.5% · Sec. 122 ends"
const eventLabel = (changes: LineChange[]) => {
  const groups = new Map<string, { delta: number; allRemoved: boolean }>()
  changes.forEach((c) => {
    const name = (c.code === "BASE" ? "Base duty" : programShort(c.program)).replace(/^Section /, "Sec. ")
    const g = groups.get(name) ?? { delta: 0, allRemoved: true }
    groups.set(name, { delta: g.delta + c.delta, allRemoved: g.allRemoved && c.kind === "removed" })
  })
  return Array.from(groups)
    .filter(([, g]) => Math.abs(g.delta) >= 0.01)
    .sort((a, b) => Math.abs(b[1].delta) - Math.abs(a[1].delta))
    .slice(0, 2)
    .map(([name, g]) => {
      if (g.allRemoved) return `${name} ends`
      const own = (g.delta / VALUE) * 100
      return `${name} ${own > 0 ? "+" : "−"}${Math.abs(round1(own))}%`
    })
    .join(" · ")
}

export interface RateHistory {
  points: RatePoint[]
  events: RateEvent[] // the biggest moves, at most `maxEvents`, in date order
  // For each event, the duty lines that started, changed or ended (their legal sources)
  eventLines: DutyLine[][]
  changes: number // every date the rate moved
}

// How an origin's rate on the product moved over the verified data
export const rateHistory = (data: ProductData, code: string, maxEvents = 4): RateHistory => {
  const range = getVerifiedRange()
  const history = calculateHistory(AllRules, { ...inputFor(data.line, code, data.asOf), answers: {} }, range.from, addDays(data.asOf, 1))
  const points = history.map((s) => ({ from: s.from, pct: round1((s.result.totalDuty / VALUE) * 100) }))
  const moves = history
    .slice(1)
    .map((s, i) => ({ s, delta: points[i + 1].pct - points[i].pct }))
    .filter(({ s, delta }) => delta !== 0 && s.changes.length)
  const top = [...moves]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, maxEvents)
    .sort((a, b) => a.s.from.localeCompare(b.s.from))
  const events = top.map(({ s, delta }) => ({ date: s.from, label: eventLabel(s.changes), tone: delta > 0 ? ("up" as const) : ("down" as const) }))
  const eventLines = top.map(({ s }) => s.changes.flatMap((c) => [c.after, c.before]).filter((l): l is DutyLine => !!l && l.code !== "BASE"))
  return { points, events, eventLines, changes: moves.length }
}

// Chapters that aren't products an importer prices: fuels, art, US goods returned, Chapter 99
const EXCLUDED_CHAPTERS = new Set(["27", "71", "97", "98", "99"])

const chapters = new Map<string, ChapterFile | null>()

// One Census chapter file ("85"), read once
export const chapterFile = (chapter: string) => {
  if (!chapters.has(chapter)) {
    try {
      chapters.set(chapter, JSON.parse(readFileSync(join(process.cwd(), "public/data/us-imports", `${chapter}.json`), "utf8")) as ChapterFile)
    } catch {
      chapters.set(chapter, null)
    }
  }
  return chapters.get(chapter)!
}

// US imports in the Census year under HTS codes of any length ("87", "0404", "8413.91.9039"),
// from the given countries (all when empty). Census files keep each code's top 60 origins, so
// this can run a little low. Null when no code is a product code.
export const importsUnder = (codes: string[], countries: string[]) => {
  const prefixes = Array.from(new Set(codes.map((c) => c.replace(/\D/g, "")).filter((d) => [2, 4, 6, 8, 10].includes(d.length) && !d.startsWith("99"))))
    .sort((a, b) => a.length - b.length)
    .filter((d, i, all) => !all.slice(0, i).some((shorter) => d.startsWith(shorter)))
  if (!prefixes.length) return null
  const only = countries.length ? new Set(countries) : null
  let value = 0
  let year = 0
  prefixes.forEach((prefix) => {
    const file = chapterFile(prefix.slice(0, 2))
    if (!file) return
    year = file.year
    Object.entries(file.codes).forEach(([code, rows]) => {
      if (!code.startsWith(prefix)) return
      rows.forEach(([iso, thousands]) => {
        if (!only || only.has(iso)) value += thousands * 1000
      })
    })
  })
  return year ? { value, year } : null
}

let pool: { code: string; value: number }[] | null = null

// The most-imported 10-digit codes across every Census chapter file, by 2025 value
export const topImportedCodes = (n: number) => {
  if (!pool) {
    const dir = join(process.cwd(), "public/data/us-imports")
    pool = readdirSync(dir)
      .filter((f) => /^\d\d\.json$/.test(f) && !EXCLUDED_CHAPTERS.has(f.slice(0, 2)))
      .flatMap((f) => {
        const file = JSON.parse(readFileSync(join(dir, f), "utf8")) as ChapterFile
        return Object.entries(file.codes).map(([code, rows]) => ({ code, value: rows.reduce((s, r) => s + r[1] * 1000, 0) }))
      })
      .sort((a, b) => b.value - a.value)
  }
  return pool.slice(0, n)
}

// "8711600050" → "8711.60.00.50"
export const dotted = (digits: string) => `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}.${digits.slice(8, 10)}`
