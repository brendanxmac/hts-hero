import { describe, it, expect } from "./test-runner"
import { parseWatchList } from "../components/tariff-watcher/parse"

// Known codes stand in for the HTS; the parser only needs to know whether a code exists
const KNOWN = ["8413919015", "8409999190", "84833080", "7326908688"]
const find = (digits: string) => (KNOWN.includes(digits) ? digits : undefined)

describe("Tariff Watcher: reading the list", () => {
  it("reads code,country lines", () => {
    const { entries, errors } = parseWatchList("8413919015,BR\n8409999190,AR", find)
    expect(errors.length).toBe(0)
    expect(entries.map((e) => `${e.element}/${e.country.code}`)).toEqual(["8413919015/BR", "8409999190/AR"])
  })

  it("accepts dotted codes, other separators, names and lower case", () => {
    const { entries, errors } = parseWatchList(
      "8413.91.90.15; br\n8483.30.80\tAustria\n7326 90 86 88 china",
      find
    )
    expect(errors.length).toBe(0)
    expect(entries.map((e) => e.country.code)).toEqual(["BR", "AT", "CN"])
  })

  it("skips blank lines, comments and a header row, and keeps line numbers", () => {
    const { entries, errors } = parseWatchList("HTS Code,Country\n\n# pumps\n8413919015,BR", find)
    expect(errors.length).toBe(0)
    expect(entries[0].line).toBe(4)
  })

  it("explains lines it can't read", () => {
    const { entries, errors } = parseWatchList(
      "841391,BR\n8413919015\n8413919015,XX\n8413919015,US\n9999999999,BR\nhello",
      find
    )
    expect(entries.length).toBe(0)
    expect(errors.map((e) => e.line)).toEqual([1, 2, 3, 4, 5, 6])
    expect(errors[0].message).toBe("HTS codes need 8 or 10 digits (this has 6)")
    expect(errors[1].message).toBe("Add a country of origin after the code")
    expect(errors[3].message).toBe("The country of origin can't be the United States")
    expect(errors[4].message).toBe("9999999999 isn't in the current HTS")
  })

  it("keeps duplicates, in order", () => {
    const { entries } = parseWatchList("8413919015,BR\n8413919015,BR", find)
    expect(entries.length).toBe(2)
  })
})

// ── Exporting ──

import { HtsElement } from "../interfaces/hts"
import { findCountry } from "../components/tariff-watcher/parse"
import { watchProduct } from "../components/tariff-watcher/report"
import { buildTariffSheet, toCsv, toXlsx } from "../components/tariff-watcher/export"

// A top-level HTS line carrying its own base rate (no parents to look up)
const htsLine = (htsno: string, general: string, description: string) =>
  ({ uuid: htsno, htsno, indent: "0", description, units: [], general, special: null, other: null, footnotes: [] } as unknown as HtsElement)

const product = (htsno: string, general: string, country: string) =>
  watchProduct(
    { line: 1, text: `${htsno},${country}`, element: htsLine(htsno, general, "Test product"), country: findCountry(country)! },
    [],
    "2026-04-10"
  )

describe("Tariff Watcher: exporting the report", () => {
  const steel = product("7326.90.86.88", "2.9%", "CN")
  const watch = product("9103.10.40", "24¢ each + 4.5% on the case + 3.5% on the battery", "CL")
  const sheet = buildTariffSheet([steel, watch], "2026-04-10")
  const headers = sheet.columns.map((c) => c.header)
  const cell = (row: number, header: string) => sheet.rows[row][headers.indexOf(header)]

  it("starts with the HTS code and country code, without the description", () => {
    expect(headers.slice(0, 3)).toEqual(["HTS code", "Country code", "Country of origin"])
    expect(headers.includes("Description")).toBe(false)
    expect(sheet.rows[0].slice(0, 2)).toEqual(["7326.90.86.88", "CN"])
  })

  it("has a rate and a tariffs column for each type of tariff that applies, and no others", () => {
    expect(headers.includes("Section 122")).toBe(true)
    expect(headers.includes("Section 232 Tariffs")).toBe(true)
    expect(headers.includes("Section 301")).toBe(true)
    expect(headers.includes("IEEPA")).toBe(false)
    expect(headers.includes("Trade agreements")).toBe(false)
  })

  it("puts each tariff's rate in its column, and leaves types that don't apply empty", () => {
    expect(cell(0, "Base duty")).toBe(2.9)
    expect(cell(0, "Section 232")).toBe(50)
    expect(cell(0, "Section 301")).toBe(25)
    expect(cell(0, "Total duty rate")).toBe(77.9)
    expect(cell(1, "Section 232")).toBe(null)
    expect(cell(1, "Section 122")).toBe(10)
  })

  it("lists the heading and rate behind each tariff, without its description", () => {
    expect(cell(0, "Section 232 Tariffs")).toBe("9903.82.02 (50%)")
    expect(cell(1, "Section 122 Tariffs")).toBe("9903.03.01 (10%)")
  })

  it("explains per-unit rates in the notes", () => {
    expect(String(cell(1, "Notes")).includes("per-unit")).toBe(true)
  })

  it("marks percentage columns in the CSV header", () => {
    const header = toCsv(sheet).split("\r\n")[0]
    expect(header.includes("Section 232 (%)")).toBe(true)
    expect(header.includes("Section 232 Tariffs,")).toBe(true)
  })

  it("writes an Excel file (a zip starting with PK)", () => {
    const bytes = toXlsx(sheet, "2026-04-10")
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK")
  })
})
