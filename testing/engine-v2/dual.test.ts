// Runs real HTS codes through both engines. Cases in "agree" must give the same total and
// headings; cases in "known differences" pin each deliberate change (see PROGRESS.md).
// Base rates are copied from the USITC export so these tests run offline.
import { describe, it, expect } from "../test-runner"
import { calculate } from "../../tariffs/engine-v2/calculate"
import { AllRules } from "../../tariffs/engine-v2/data"
import { CalculationResult } from "../../tariffs/engine-v2/types"
import { validateRules } from "../../tariffs/engine-v2/validate"
import { getLatestVerifiedRevision } from "../../tariffs/engine-v2/revisions"
import { HtsLine, legacyCalculate } from "./legacy-adapter"

const AS_OF = "2026-04-10" // 2026 Rev 5
const VALUE = 10_000
const UNITS = 100

const RATES: Record<string, HtsLine> = {
  "7326.90.86.88": { htsno: "7326.90.86", general: "2.9%", special: "Free (A,AU,B,BH,CL,CO,D,E,IL,JO,JP,KR,MA,OM,P,PA,PE,S,SG)", other: "45%" },
  "8703.23.01.90": { htsno: "8703.23.01", general: "2.5%", special: "Free (A+,AU,B,BH,CL,CO,D,E,IL,JO,KR,MA,OM, P,PA,PE,S,SG)", other: "10%" },
  "0711.90.30.00": { htsno: "0711.90.30.00", general: "8%", special: "Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "20%" },
  "7206.90.00.00": { htsno: "7206.90.00.00", general: "Free", special: "", other: "20%" },
  "8202.39.00.40": { htsno: "8202.39.00", general: "Free", special: "", other: "25%" },
  "6307.90.98.70": { htsno: "6307.90.98", general: "7%", special: "Free (A*,AU,B,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "40%" },
  "6109.10.00.12": { htsno: "6109.10.00", general: "16.5%", special: "Free (AU,BH,CL,CO,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "90%" },
  "0101.21.00.10": { htsno: "0101.21.00", general: "Free", special: "", other: "Free" },
  "8708.99.81.80": { htsno: "8708.99.81", general: "2.5%", special: "Free (A*,AU,B,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "25%" },
  "0402.10.10.00": { htsno: "0402.10.10.00", general: "3.3¢/kg", special: "Free (A+,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "6.6¢/kg" },
}

const both = (htsCode: string, country: string) => {
  const rates = RATES[htsCode]
  const legacy = legacyCalculate(htsCode, rates, country, VALUE, UNITS)
  const v2 = calculate(AllRules, {
    htsCode,
    country,
    asOf: AS_OF,
    customsValue: VALUE,
    quantity: UNITS,
    baseRates: { general: rates.general, special: rates.special, other: rates.other },
  })
  return { legacy, v2 }
}

const applying = (result: CalculationResult) =>
  result.lines.filter((l) => l.status === "applies").map((l) => l.code).sort()

const round = (n: number) => Math.round(n * 100) / 100

// ============================================================
// Cases where both engines must agree
// ============================================================
describe("engine-v2 vs legacy: agree", () => {
  const cases: [string, string, string][] = [
    ["7326.90.86.88", "CN", "China steel derivative: 301 + 232, 122 exempt via 9903.03.06"],
    ["7326.90.86.88", "VN", "Vietnam steel derivative: 232 only"],
    ["8703.23.01.90", "CN", "Chinese car: 232 autos + 301 (31(d)) + 301 list"],
    ["6109.10.00.12", "VN", "Vietnam T-shirt: Section 122"],
    ["6109.10.00.12", "CN", "Chinese T-shirt: 122 + 301 list 4A"],
    ["6109.10.00.12", "DE", "German T-shirt, base >= 15%: 122 + EU deal at 0"],
    ["0101.21.00.10", "MX", "Mexican horse without a USMCA claim: 122"],
    ["8708.99.81.80", "VN", "Vietnamese auto part, unconfirmed: 232 metals derivative"],
    ["0402.10.10.00", "CN", "Specific base rate (3.3¢/kg)"],
  ]

  for (const [htsCode, country, label] of cases) {
    it(label, () => {
      const { legacy, v2 } = both(htsCode, country)
      expect(round(v2.totalDuty)).toBe(round(legacy.totalDuty))
      expect(applying(v2)).toEqual([...legacy.activeCodes].sort())
    })
  }
})

// ============================================================
// Known differences (each is a legacy bug or a correction, see PROGRESS.md)
// ============================================================
describe("engine-v2 vs legacy: known differences", () => {
  it("EU good exempt from the deal keeps its base duty (legacy dropped it)", () => {
    const { legacy, v2 } = both("0711.90.30.00", "DE")
    expect(legacy.totalDuty).toBe(0)
    expect(v2.totalDuty).toBe(800) // 8% base; 9903.02.74 exempts it from the deal and 122
  })

  it("EU car keeps its base duty under 232 autos (legacy dropped it)", () => {
    const { legacy, v2 } = both("8703.23.01.90", "DE")
    expect(legacy.totalDuty).toBe(2500)
    expect(v2.totalDuty).toBe(2750) // 2.5% base + 25% 232 autos (EU deal needs confirming)
  })

  it("Japanese auto part under 232 metals keeps its base duty (legacy dropped it)", () => {
    const { legacy, v2 } = both("8708.99.81.80", "JP")
    expect(legacy.totalDuty).toBe(2500)
    expect(v2.totalDuty).toBe(2750) // 2.5% base + 25% 9903.82.09
  })

  it("exclusion codes missing a dot are still matched (legacy substring match missed them)", () => {
    const rates = { htsno: "9401.69.60", general: "Free", special: "", other: "40%" }
    const legacy = legacyCalculate("9401.69.60.31", rates, "CN", VALUE, UNITS)
    const v2 = calculate(AllRules, {
      htsCode: "9401.69.60.31", country: "CN", asOf: AS_OF, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: rates.general, special: rates.special, other: rates.other },
    })
    expect(legacy.activeCodes).toContain("9903.88.15") // excluded code "9401.69.6031" in legacy data
    expect(applying(v2).includes("9903.88.15")).toBe(false)
  })

  it("Russian steel is exempt from Section 122 via 9903.03.06 (legacy charged 122 too)", () => {
    const { legacy, v2 } = both("7206.90.00.00", "RU")
    expect(legacy.activeCodes).toContain("9903.03.01")
    expect(applying(v2)).toContain("9903.03.06")
    expect(v2.totalDuty).toBe(7000) // 20% Column 2 base + 50% 232
  })

  it("9903.91.04 (301, 31(e)) ended Jan 1, 2026 (legacy still applied it)", () => {
    const { legacy, v2 } = both("6307.90.98.70", "CN")
    expect(legacy.activeCodes).toContain("9903.91.04")
    expect(applying(v2).includes("9903.91.04")).toBe(false)
  })
})

// ============================================================
// Engine-v2 behavior on real data
// ============================================================
describe("engine-v2 real data", () => {
  it("has no validation errors in verified revisions", () => {
    const { errors } = validateRules(AllRules, { checkFrom: getLatestVerifiedRevision().from })
    if (errors.length) console.log(errors.join("\n"))
    expect(errors).toHaveLength(0)
  })

  it("tops a Japanese good with a low base rate up to 15%", () => {
    const { v2 } = both("0101.21.00.10", "JP")
    expect(applying(v2)).toContain("9903.02.73")
    // 0% base + 15% deal + 10% Section 122 (both applied at Rev 5; see PROGRESS.md question 1)
    expect(v2.totalDuty).toBe(2500)
  })

  it("exempts a USMCA claim from Section 122", () => {
    const rates = RATES["8708.99.81.80"]
    const v2 = calculate(AllRules, {
      htsCode: "8708.99.81.80", country: "MX", asOf: AS_OF, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: rates.general, special: rates.special, other: rates.other },
      claimedPreference: "S",
    })
    expect(v2.column).toBe("special")
    expect(applying(v2)).toContain("9903.03.08")
    expect(applying(v2).includes("9903.03.01")).toBe(false)
  })

  it("an EU auto part >= 15% no longer adds 15% (9903.94.44 rate fixed)", () => {
    const v2 = calculate(AllRules, {
      htsCode: "8708.99.81.80", country: "DE", asOf: AS_OF, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: "20%", special: null, other: null },
      answers: { "confirm:9903.94.44": true },
    })
    const line = v2.lines.find((l) => l.code === "9903.94.44")
    expect(line.status).toBe("applies")
    expect(line.amount).toBe(0)
  })

  it("drops Section 122 after it expired on July 24, 2026", () => {
    const rates = RATES["6109.10.00.12"]
    const v2 = calculate(AllRules, {
      htsCode: "6109.10.00.12", country: "VN", asOf: "2026-08-01", customsValue: VALUE, quantity: UNITS,
      baseRates: { general: rates.general, special: rates.special, other: rates.other },
    })
    expect(v2.lines.some((l) => l.code === "9903.03.01")).toBe(false)
  })
})
