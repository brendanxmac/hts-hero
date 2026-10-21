import { describe, it, expect } from "./test-runner"
import { evidenceSentence, matchCase, matchPetition, nextDates, type MatchableCase } from "../libs/adcvd/match"

// Whether an import may be covered by an AD/CVD case (libs/adcvd/match.ts)
const paprika: MatchableCase = {
  case_number: "A-533-938",
  kind: "AD",
  country: "IN",
  product: "Oleoresin Paprika",
  status: "order",
  ended_on: null,
  third_countries: [],
  hts_main: ["3203008000", "3301901010"],
  hts_also: ["1301909190", "1302199140", "3205000500"],
  hts_excluded: [],
  hts_outdated: [],
}

const nails: MatchableCase = {
  ...paprika,
  case_number: "A-552-818",
  country: "VN",
  product: "Certain Steel Nails",
  hts_main: ["7317005502", "73170065"],
  hts_also: [],
  hts_excluded: ["7317002000", "940130"],
}

const level = (c: MatchableCase, code: string, country: string, today = new Date("2026-10-17")) => matchCase(c, { code, country }, today)?.level ?? null

describe("AD/CVD: matching imports to cases", () => {
  it("a listed code from the case's country is likely; another country is nothing", () => {
    expect(level(paprika, "3203008000", "IN")).toBe("likely")
    expect(level(paprika, "3203008000", "ES")).toBe(null)
  })

  it("an 8-digit import is named by its 10-digit lines; a shorter scope code covers the lines under it", () => {
    expect(level(paprika, "32030080", "IN")).toBe("likely")
    expect(level(nails, "7317006530", "VN")).toBe("likely")
  })

  it("'may also enter under' codes and shared subheadings are only possible", () => {
    expect(level(paprika, "1302199140", "IN")).toBe("possible")
    expect(level(paprika, "3203001000", "IN")).toBe("possible")
    expect(level(paprika, "2009000000", "IN")).toBe(null)
  })

  it("codes named only for excluded products don't match", () => {
    expect(level(nails, "7317002000", "VN")).toBe(null)
    expect(level(nails, "9401300010", "VN")).toBe(null)
  })

  it("renumbered codes match on their 8-digit line, as possible", () => {
    expect(level({ ...paprika, hts_outdated: ["3203008000"] }, "3203008000", "IN")).toBe("possible")
    expect(level({ ...paprika, hts_outdated: ["3203008000"] }, "3203008010", "IN")).toBe("possible")
    // Another 8-digit line under the same subheading: only the subheading rule, as for any listed code
    expect(level({ ...paprika, hts_main: ["3203008000"], hts_also: [] as string[], hts_outdated: ["3203008000"] }, "3203001000", "IN")).toBe(null)
  })

  it("a listed code the HTS replaced matches its replacements: likely on its own line, possible beyond", () => {
    const shelving = { ...paprika, hts_main: ["9403200018"], hts_also: [] as string[], hts_outdated: ["9403200018"], hts_successors: { "9403200018": ["9403200011", "9403200016", "9403990000"] } }
    expect(level(shelving, "9403200016", "IN")).toBe("likely")
    expect(level(shelving, "9403990000", "IN")).toBe("possible")
  })

  it("a circumvention ruling's countries are possible; ended cases are history for a year", () => {
    expect(level({ ...paprika, third_countries: ["VN"] }, "3203008000", "VN")).toBe("possible")
    expect(level({ ...paprika, status: "revoked", ended_on: "2026-03-01" }, "3203008000", "IN")).toBe("history")
    expect(level({ ...paprika, status: "revoked", ended_on: "2024-03-01" }, "3203008000", "IN")).toBe(null)
  })

  it("a petition matches the countries and codes its ITC notice names", () => {
    expect(matchPetition({ countries: ["CN", "MY", "TR"], hts_codes: ["48191000"] }, { code: "4819100040", country: "MY" })).toBe(true)
    expect(matchPetition({ countries: ["CN", "MY", "TR"], hts_codes: ["48191000"] }, { code: "4819100040", country: "VN" })).toBe(false)
  })

  it("quotes the scope's own sentence naming the code", () => {
    const scope = "The merchandise subject to these orders is classified in the HTSUS under subheadings 3203.00.8000 and 3301.90.1010. Subject merchandise may also enter under HTSUS subheading 1301.90.9190."
    expect(evidenceSentence(scope, "3203008000")).toBe("The merchandise subject to these orders is classified in the HTSUS under subheadings 3203.00.8000 and 3301.90.1010.")
  })

  it("estimates the next annual review month and five-year review", () => {
    expect(nextDates({ status: "order", order_on: "2026-10-08", last_continued_on: null }, new Date("2026-10-17"))).toEqual({ review_month: "2027-10", sunset_due: "2031-10" })
    expect(nextDates({ status: "investigation", order_on: null, last_continued_on: null })).toEqual({ review_month: null, sunset_due: null })
  })
})
