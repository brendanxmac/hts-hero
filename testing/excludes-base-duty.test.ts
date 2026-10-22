// Totals shown outside the calculator say when they leave out a base rate that can't be
// calculated ("The rate applicable to each garment in the ensemble…"), instead of passing a
// partial total off as the whole duty
import { describe, it, expect } from "./test-runner"
import { HtsElement } from "../interfaces/hts"
import { calculate } from "../tariffs/engine-v2/calculate"
import { AllRules } from "../tariffs/engine-v2/data"
import { describeTotal, dutyAnswerSentence, getHtsDutySummary, lowestTotal } from "../libs/hts-duty-summary"
import { countryExamples } from "../libs/country-pages/countryTariffs"
import { findCountry } from "../components/tariff-tracker/parse"
import { trackProduct } from "../components/tariff-tracker/report"
import { buildTariffSheet } from "../components/tariff-tracker/export"
import { originRow } from "../libs/mcp/payloads"

const ENSEMBLE = "The rate applicable to each garment in the ensemble if separately entered"

const line = (htsno: string, general: string, other: string | null = null) =>
  ({ uuid: htsno, htsno, chapter: Number(htsno.slice(0, 2)), indent: "0", description: "Ensembles", units: [], general, special: null, other, footnotes: [] } as unknown as HtsElement)

const quietly = <T>(fn: () => T): T => {
  const error = console.error
  console.error = () => {}
  try {
    return fn()
  } finally {
    console.error = error
  }
}

describe("excludes base duty: HTS page duty by country", () => {
  const ensemble = line("6103.22.00.50", ENSEMBLE, ENSEMBLE)
  const summary = quietly(() => getHtsDutySummary(ensemble, ensemble, ["CN", "VN"]))!
  const china = summary.rows.find((r) => r.country.code === "CN")!

  it("has no total rate, so it's not shown or ranked as the whole duty", () => {
    expect(china.baseNotCalculated).toBe(true)
    expect(china.totalPct).toBe(null)
    expect(lowestTotal(summary.rows)).toBe(null)
  })

  it("says the base duty isn't calculated", () => {
    expect(describeTotal(china)).toBe(
      china.additionalPct > 0 ? `${china.additionalPct}% + base duty (not calculated)` : "Base duty not calculated",
    )
    const sentence = dutyAnswerSentence({ productName: "Ensembles", htsno: ensemble.htsno, row: china, asOf: summary.asOf })
    expect(sentence.includes(`a base rate given as "${ENSEMBLE}", which isn't calculated here,`)).toBe(true)
  })

  it("leaves rates it can calculate as they were", () => {
    const shirts = line("6109.10.00.12", "16.5%", "90%")
    const row = quietly(() => getHtsDutySummary(shirts, shirts, ["VN"]))!.rows[0]
    expect(row.baseNotCalculated).toBe(false)
    expect(describeTotal(row)).toBe(`${row.totalPct}%`)
  })
})

describe("excludes base duty: country page examples", () => {
  it("flags an example whose base rate can't be calculated", () => {
    // The T-shirt example, given a wording-only rate
    const [example] = quietly(() => countryExamples("VN", "2026-10-22", [line("6109.10.00.12", ENSEMBLE)]))
    expect(example.baseNotCalculated).toBe(true)
    expect(example.totalPct).toBe(null)
  })

  it("leaves a plain rate alone", () => {
    const [example] = quietly(() => countryExamples("VN", "2026-10-22", [line("6109.10.00.12", "16.5%")]))
    expect(example.baseNotCalculated).toBe(false)
    expect(example.totalPct === null).toBe(false)
  })
})

describe("excludes base duty: Tariff Tracker", () => {
  const product = (general: string) =>
    quietly(() =>
      trackProduct(
        { line: 1, text: "6103.22.00.50,CN", element: line("6103.22.00.50", general), country: findCountry("CN")! },
        [],
        "2026-10-22",
      ),
    )

  it("marks the product, and the export leaves its base duty empty with the reason in the notes", () => {
    const ensemble = product(ENSEMBLE)
    expect(ensemble.baseNotCalculated).toBe(true)
    const sheet = buildTariffSheet([ensemble], "2026-10-22")
    const headers = sheet.columns.map((c) => c.header)
    expect(sheet.rows[0][headers.indexOf("Base duty")]).toBe(null)
    expect(String(sheet.rows[0][headers.indexOf("Notes")]).includes("so the total excludes base duty")).toBe(true)
  })

  it("leaves a plain rate alone", () => {
    const shirts = product("16.5%")
    expect(shirts.baseNotCalculated).toBe(false)
    const sheet = buildTariffSheet([shirts], "2026-10-22")
    expect(sheet.rows[0][sheet.columns.map((c) => c.header).indexOf("Base duty")]).toBe(16.5)
  })
})

describe("excludes base duty: MCP origin comparison", () => {
  it("says when an origin's rate leaves the base duty out", () => {
    const result = quietly(() =>
      calculate(AllRules, {
        htsCode: "6103.22.00.50",
        country: "CN",
        asOf: "2026-10-22",
        customsValue: 10_000,
        quantity: 100,
        baseRates: { general: ENSEMBLE, special: null, other: null },
      }),
    )
    const row = originRow({ country: findCountry("CN")!, result, pct: 0, parts: [], isOrigin: true }, 10_000, 1, "standard")
    expect(row.base_calculated).toBe(false)
  })
})
