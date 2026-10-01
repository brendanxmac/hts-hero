// Engine-v2 on real HTS codes and rules. Base rates are copied from the USITC export so these
// tests run offline. The expected results were cross-checked against the legacy engine before
// it was removed (Oct 2026); where the two differed, v2's result is the corrected one.
import { describe, it, expect } from "../test-runner"
import { calculate } from "../../tariffs/engine-v2/calculate"
import { AllRules } from "../../tariffs/engine-v2/data"
import { CalculationResult } from "../../tariffs/engine-v2/types"
import { validateRules } from "../../tariffs/engine-v2/validate"
import { getLatestVerifiedRevision } from "../../tariffs/engine-v2/revisions"
import { HtsLine } from "./hts-fixture"

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
  "4015.12.10.10": { htsno: "4015.12.10", general: "Free", special: "", other: "25%" },
  "8505.11.00.70": { htsno: "8505.11.00", general: "2.1%", special: "Free (A,AU,B,BH,CL,CO,D,E,IL,JO,JP,KR,MA,OM,P,PA,PE,S,SG)", other: "45%" },
  "9401.61.40.11": { htsno: "9401.61.40", general: "Free", special: "", other: "40%" },
  "9401.69.60.31": { htsno: "9401.69.60", general: "Free", special: "", other: "40%" },
  "0402.10.10.00": { htsno: "0402.10.10.00", general: "3.3¢/kg", special: "Free (A+,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "6.6¢/kg" },
  "7601.10.30.00": { htsno: "7601.10.30.00", general: "2.6%", special: "Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA, OM,P,PA,PE,S,SG)", other: "18.5%" },
  "7612.10.00.00": { htsno: "7612.10.00.00", general: "2.4%", special: "Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "45%" },
  "8708.10.30.50": { htsno: "8708.10.30", general: "2.5%", special: "Free (A,AU,B,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "25%" },
}

const run = (htsCode: string, country: string) => {
  const rates = RATES[htsCode]
  return calculate(AllRules, {
    htsCode,
    country,
    asOf: AS_OF,
    customsValue: VALUE,
    quantity: UNITS,
    baseRates: { general: rates.general, special: rates.special, other: rates.other },
  })
}

const applying = (result: CalculationResult) =>
  result.lines.filter((l) => l.status === "applies").map((l) => l.code).sort()

const round = (n: number) => Math.round(n * 100) / 100

// ============================================================
// Totals and headings at 2026 Rev 5
// ============================================================
describe("engine-v2 real data: totals at Rev 5", () => {
  const cases: [string, string, number, string[], string][] = [
    ["7326.90.86.88", "CN", 7790, ["9903.03.06", "9903.82.02", "9903.88.03"], "China steel derivative: 301 + 232, 122 exempt via 9903.03.06"],
    ["7326.90.86.88", "VN", 5290, ["9903.03.06", "9903.82.02"], "Vietnam steel derivative: 232 only"],
    ["8703.23.01.90", "CN", 5250, ["9903.03.06", "9903.88.01", "9903.94.01"], "Chinese car: 232 autos + 301"],
    ["6109.10.00.12", "VN", 2650, ["9903.03.01"], "Vietnam T-shirt: Section 122"],
    ["6109.10.00.12", "CN", 3400, ["9903.03.01", "9903.88.15"], "Chinese T-shirt: 122 + 301 list 4A"],
    ["6109.10.00.12", "DE", 2650, ["9903.03.01"], "German T-shirt: Section 122 only (EU deal headings ended Feb 24, 2026)"],
    ["0711.90.30.00", "DE", 800, ["9903.03.03"], "German vegetables: 8% base duty, exempt from Section 122 via 9903.03.03"],
    ["8703.23.01.90", "DE", 2750, ["9903.03.06", "9903.94.01"], "German car: base duty + 232 autos (EU deal needs confirming)"],
    ["8708.99.81.80", "JP", 2750, ["9903.03.06", "9903.82.09"], "Japanese auto part: base duty + 232 metals derivative"],
    ["9401.61.40.11", "DE", 1500, ["9903.03.06", "9903.76.22"], "German upholstered furniture: 232 wood topped up to 15% including base"],
    ["8505.11.00.70", "CN", 2710, ["9903.03.03", "9903.91.06"], "Chinese permanent magnets: 9903.91.06 (31(g), 25%)"],
    ["0101.21.00.10", "MX", 1000, ["9903.03.01"], "Mexican horse without a USMCA claim: 122"],
    ["8708.99.81.80", "VN", 2750, ["9903.03.06", "9903.82.09"], "Vietnamese auto part, unconfirmed: 232 metals derivative"],
    ["0402.10.10.00", "CN", 1753.3, ["9903.03.01", "9903.88.15"], "Specific base rate (3.3¢/kg)"],
    ["9401.69.60.31", "CN", 3500, ["9903.03.01", "9903.88.04"], "301 exclusion 9401.69.60.31"],
  ]

  for (const [htsCode, country, total, headings, label] of cases) {
    it(label, () => {
      const v2 = run(htsCode, country)
      expect(round(v2.totalDuty)).toBe(total)
      expect(applying(v2)).toEqual(headings)
    })
  }
})

// ============================================================
// Corrections over the legacy engine
// ============================================================
describe("engine-v2 real data: corrections over the legacy engine", () => {
  it("Russian steel is exempt from Section 122 via 9903.03.06 (legacy charged 122 too)", () => {
    const v2 = run("7206.90.00.00", "RU")
    expect(applying(v2)).toContain("9903.03.06")
    expect(applying(v2).includes("9903.03.01")).toBe(false)
    expect(v2.totalDuty).toBe(7000) // 20% Column 2 base + 50% 232
  })

  it("face masks: 9903.91.04 ended Jan 1, 2026 and 9903.91.07 took over (legacy kept .04 too)", () => {
    const v2 = run("6307.90.98.70", "CN")
    expect(applying(v2).includes("9903.91.04")).toBe(false)
    expect(applying(v2)).toContain("9903.91.07")
  })

  it("medical gloves: 9903.91.08 (100%) replaces 9903.91.05 (50%) on Jan 1, 2026 (legacy charged both)", () => {
    const v2 = run("4015.12.10.10", "CN")
    expect(applying(v2).includes("9903.91.05")).toBe(false)
    expect(applying(v2)).toContain("9903.91.08")
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

  it("a Japanese good pays Section 122 at Rev 5 (the IEEPA deal headings ended Feb 24, 2026)", () => {
    const v2 = run("0101.21.00.10", "JP")
    expect(applying(v2).includes("9903.02.73")).toBe(false)
    expect(v2.totalDuty).toBe(1000) // Free base + 10% Section 122
  })

  it("the same Japanese good was topped up to 15% under the deal before Feb 24, 2026", () => {
    const rates = RATES["0101.21.00.10"]
    const v2 = calculate(AllRules, {
      htsCode: "0101.21.00.10", country: "JP", asOf: "2026-01-15", customsValue: VALUE, quantity: UNITS,
      baseRates: { general: rates.general, special: rates.special, other: rates.other },
    })
    expect(applying(v2)).toContain("9903.02.73")
    expect(v2.totalDuty).toBe(1500)
  })

  it("EU wood tops up to 15% including the base rate, and adds nothing at or above 15%", () => {
    const run = (general: string) =>
      calculate(AllRules, {
        htsCode: "9401.61.40.11", country: "DE", asOf: AS_OF, customsValue: VALUE, quantity: UNITS,
        baseRates: { general, special: null, other: null },
      })
    expect(run("4%").totalDuty).toBe(1500)
    expect(run("20%").totalDuty).toBe(2000)
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

  it("medical gloves were 50% under 31(f) in 2025, before 31(i) took over", () => {
    const rates = RATES["4015.12.10.10"]
    const run = (asOf: string) =>
      calculate(AllRules, {
        htsCode: "4015.12.10.10", country: "CN", asOf, customsValue: VALUE, quantity: UNITS,
        baseRates: { general: rates.general, special: rates.special, other: rates.other },
      })
    const in2025 = applying(run("2025-06-01"))
    expect(in2025).toContain("9903.91.05")
    expect(in2025.includes("9903.91.08")).toBe(false)
    const in2026 = run(AS_OF).lines.find((l) => l.code === "9903.91.08")
    expect(in2026.amount).toBe(10000) // 100% of $10,000
  })

  it("31(b) items (1)-(4) move to 31(h)/31(g) on Jan 1, 2026; other 31(b) codes stay on 9903.91.01", () => {
    const run = (htsCode: string, asOf: string) =>
      calculate(AllRules, {
        htsCode, country: "CN", asOf, customsValue: VALUE, quantity: 1,
        baseRates: { general: "Free", special: null, other: null },
      })
        .lines.filter((l) => l.status === "applies" && l.code.startsWith("9903.91"))
        .map((l) => `${l.code} ${l.ratePct}%`)
    expect(run("6307.90.98.42", "2024-09-26")).toHaveLength(0)
    expect(run("6307.90.98.42", "2024-09-27")).toEqual(["9903.91.01 25%"])
    expect(run("6307.90.98.42", "2025-12-31")).toEqual(["9903.91.01 25%"])
    expect(run("6307.90.98.42", "2026-01-01")).toEqual(["9903.91.07 50%"])
    expect(run("8507.60.00.10", "2025-12-31")).toEqual(["9903.91.01 25%"])
    expect(run("8507.60.00.10", "2026-01-01")).toEqual(["9903.91.06 25%"])
    expect(run("2602.00.00.10", "2026-01-01")).toEqual(["9903.91.01 25%"])
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

// ============================================================
// 2026 Rev 6: 9903.82.18/.19 (U.S. note 16(h)/(i)) and the extended 9903.82 ranges
// ============================================================
describe("engine-v2 real data: 2026 Rev 6", () => {
  const REV6 = "2026-04-24"
  const STEEL = "7206.90.00.00" // note 16(c)(iii); free under General, no special column
  const ALUMINUM = "7601.10.30.00" // note 16(c)(i)

  const runAt = (
    htsCode: string,
    country: string,
    asOf: string,
    extra: Partial<Parameters<typeof calculate>[1]> = {},
  ) => {
    const rates = RATES[htsCode]
    return calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: rates.general, special: rates.special, other: rates.other },
      ...extra,
    })
  }
  const status = (result: CalculationResult, code: string) =>
    result.lines.find((l) => l.code === code)?.status

  it("Canadian steel under USMCA, authorized by Commerce: 9903.82.18 at 25% replaces 9903.82.02", () => {
    const v2 = runAt(STEEL, "CA", REV6, { claimedPreference: "S", answers: { "confirm:9903.82.18": true } })
    expect(v2.column).toBe("special")
    expect(v2.totalDuty).toBe(2500)
    expect(applying(v2)).toEqual(["9903.03.06", "9903.03.07", "9903.82.18"])
    expect(status(v2, "9903.82.02")).toBe("excluded")
  })

  it("9903.82.18 needs the Commerce authorization confirmed; until then 9903.82.02 applies at 50%", () => {
    const v2 = runAt(STEEL, "CA", REV6, { claimedPreference: "S" })
    expect(status(v2, "9903.82.18")).toBe("needsAnswer")
    expect(applying(v2)).toContain("9903.82.02")
    expect(v2.totalDuty).toBe(5000)
  })

  it("9903.82.18 applies only with a USMCA claim (its rate is in the Special column only)", () => {
    const v2 = runAt(STEEL, "CA", REV6, { answers: { "confirm:9903.82.18": true } })
    expect(v2.column).toBe("general")
    expect(status(v2, "9903.82.18")).toBe("notApplicable")
    expect(v2.totalDuty).toBe(5000)
  })

  it("9903.82.18 starts on April 23, 2026", () => {
    const v2 = runAt(STEEL, "CA", "2026-04-22", { claimedPreference: "S", answers: { "confirm:9903.82.18": true } })
    expect(status(v2, "9903.82.18")).toBeUndefined()
    expect(v2.totalDuty).toBe(5000)
  })

  it("9903.82.18 covers only goods of Canada or Mexico", () => {
    const v2 = runAt(STEEL, "CN", REV6, { answers: { "confirm:9903.82.18": true } })
    expect(status(v2, "9903.82.18")).toBeUndefined()
    expect(applying(v2)).toContain("9903.82.02")
  })

  it("Mexican aluminum under USMCA, authorized by Commerce: 9903.82.19 at 25% replaces 9903.82.02", () => {
    const v2 = runAt(ALUMINUM, "MX", REV6, { claimedPreference: "S", answers: { "confirm:9903.82.19": true } })
    expect(v2.totalDuty).toBe(2500) // Free under USMCA + 25%
    expect(applying(v2)).toEqual(["9903.03.06", "9903.03.08", "9903.82.19"])
    expect(status(v2, "9903.82.02")).toBe("excluded")
  })

  it("7612.10.00 is a derivative aluminum article in note 16(c)(ii) (technical correction, PP 11021)", () => {
    const v2 = runAt("7612.10.00.00", "VN", AS_OF)
    expect(applying(v2)).toEqual(["9903.03.06", "9903.82.02"])
    expect(v2.totalDuty).toBe(5240) // 2.4% base + 50%
  })
})

// ============================================================
// Section 232 metals don't stack on autos, MHDVs and semiconductors (notes 33, 38, 39).
// Not modeled before 2026 Rev 6; the correction applies from the start of the data.
// ============================================================
describe("engine-v2 real data: metals non-stacking", () => {
  const PART = "8708.10.30.50" // auto part (33(g)) and derivative steel (16(c)(vii))

  it("a confirmed Japanese auto part pays 9903.94.43 and not 9903.82.09 (note 33(l)(1))", () => {
    const rates = RATES[PART]
    const v2 = calculate(AllRules, {
      htsCode: PART, country: "JP", asOf: AS_OF, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: rates.general, special: rates.special, other: rates.other },
      answers: { "confirm:9903.94.43": true },
    })
    expect(applying(v2)).toEqual(["9903.03.06", "9903.94.43"])
    expect(v2.lines.find((l) => l.code === "9903.82.09").status).toBe("excluded")
    expect(v2.totalDuty).toBe(1500) // 2.5% base topped up to 15%
  })

  it("an unconfirmed auto part still pays the 232 metals duty", () => {
    expect(applying(run(PART, "JP"))).toContain("9903.82.09")
  })

  it("a heavy-duty tractor pays 9903.74.01 and not 9903.82.09 (note 38(a)(1))", () => {
    const v2 = calculate(AllRules, {
      htsCode: "8701.21.00.80", country: "DE", asOf: "2026-04-24", customsValue: VALUE, quantity: 1,
      baseRates: { general: "4%", special: null, other: null },
    })
    expect(applying(v2)).toContain("9903.74.01")
    expect(v2.lines.find((l) => l.code === "9903.82.09").status).toBe("excluded")
    expect(v2.totalDuty).toBe(2900)
  })
})
