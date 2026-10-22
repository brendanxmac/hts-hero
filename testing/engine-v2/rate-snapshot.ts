// Builds the golden snapshots rate-parsing.test.ts checks against: what the base-rate parser
// returns for every distinct general/special/other string, and the base duty engine-v2 works out
// for every line, column and trade program, across one or more USITC HTS exports.
// scripts/engine-v2/snapshot-rate-parsing.ts writes them.
import { BaseTariffI } from "../../libs/hts"
import { BaseCalculation } from "../../tariffs/engine-v2/base-rates"
import { DutyColumn } from "../../tariffs/engine-v2/types"

export interface ParseEntry {
  raw: string
  tariffs: BaseTariffI[]
  parsingFailures: string[]
}

export interface BaseRates {
  general: string | null
  special: string | null
  other: string | null
}

// The base duty depends only on the column's own string, the program claimed and, for rates per
// thousand, the unit the quantity is in, so entries are kept once per combination
export interface BaseEntry {
  column: DutyColumn
  raw: string
  program?: string
  // The line's first unit, the one the quantity is entered in (kept for rates per thousand)
  quantityUnit?: string
  // summarizeBase of the result for $10,000 and a quantity of 1,000, with no answers
  result: string
}

export interface Parser {
  parseRateColumnWithFailures: (raw: string | null) => { tariffs: BaseTariffI[]; parsingFailures: string[] }
  getBaseRateParts: (rates: BaseRates, column: DutyColumn, claimedPreference?: string) => BaseTariffI[]
  calculateBase: (
    rates: BaseTariffI[],
    customsValue: number,
    quantity: number | undefined,
    answers: Record<string, unknown>,
    quantityUnit?: string,
  ) => BaseCalculation
}

export const SNAPSHOT_VALUE = 10_000
export const SNAPSHOT_QUANTITY = 1000

// What matters in a base calculation: the amount, each part's kind, rate, unit, component and
// basis, and the questions it asks (labels aside)
export const summarizeBase = (calc: BaseCalculation) =>
  JSON.stringify({
    amount: Math.round(calc.amount * 1e6) / 1e6,
    parts: calc.parts.map((p) => [p.kind, p.rate, p.unit ?? null, p.component ?? null, p.basis]),
    inputs: calc.inputs.map((i) => i.id),
  })

const ratesFor = (column: DutyColumn, raw: string): BaseRates => ({
  general: column === "general" ? raw : null,
  special: column === "special" ? raw : null,
  other: column === "column2" ? raw : null,
})

const mentionsThousand = (raw: string) => /thou|1,?000/i.test(raw)

export const calculateEntry = (parser: Parser, entry: Omit<BaseEntry, "result">) =>
  summarizeBase(
    parser.calculateBase(
      parser.getBaseRateParts(ratesFor(entry.column, entry.raw), entry.column, entry.program),
      SNAPSHOT_VALUE,
      SNAPSHOT_QUANTITY,
      {},
      entry.quantityUnit,
    ),
  )

interface ExportLine {
  htsno: string
  indent: string | number
  units?: string[]
  general?: string | null
  special?: string | null
  other?: string | null
}

export const buildSnapshots = (exports: ExportLine[][], parser: Parser) => {
  const raws = new Set<string>()
  const runs = new Map<string, Omit<BaseEntry, "result">>()
  const add = (entry: Omit<BaseEntry, "result">) => runs.set(JSON.stringify(entry), entry)
  for (const lineList of exports) {
    lineList.forEach((e, i) => {
      const columns: [DutyColumn, string | null | undefined][] = [
        ["general", e.general],
        ["special", e.special],
        ["column2", e.other],
      ]
      if (!columns.some(([, v]) => v && v.trim())) return
      // A line's units, or its first statistical suffix's
      let units = e.units ?? []
      for (let j = i + 1; !units.length && j < lineList.length && Number(lineList[j].indent) > Number(e.indent); j++)
        units = lineList[j].units ?? []
      const unit = units.find(Boolean)
      columns.forEach(([column, raw]) => {
        if (!raw || !raw.trim()) return
        raws.add(raw)
        const quantityUnit = unit && mentionsThousand(raw) ? { quantityUnit: unit } : {}
        if (column !== "special") return add({ column, raw, ...quantityUnit })
        const programs = new Set(parser.parseRateColumnWithFailures(raw).tariffs.flatMap((t) => t.programs ?? []))
        programs.forEach((program) => add({ column, raw, program, ...quantityUnit }))
      })
    })
  }

  const parsing: ParseEntry[] = Array.from(raws)
    .sort()
    .map((raw) => ({ raw, ...parser.parseRateColumnWithFailures(raw) }))
  const base: BaseEntry[] = Array.from(runs.values()).map((entry) => ({
    ...entry,
    result: calculateEntry(parser, entry),
  }))
  return { parsing, base }
}
