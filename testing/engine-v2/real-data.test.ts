// Engine-v2 on real HTS codes and rules. Base rates are copied from the USITC export so these
// tests run offline. The expected results were cross-checked against the legacy engine before
// it was removed (Oct 2026); where the two differed, v2's result is the corrected one.
import { describe, it, expect } from "../test-runner"
import { calculate } from "../../tariffs/engine-v2/calculate"
import { AllRules } from "../../tariffs/engine-v2/data"
import { CalculationResult } from "../../tariffs/engine-v2/types"
import { validateRules } from "../../tariffs/engine-v2/validate"
import { getLatestVerifiedRevision } from "../../tariffs/engine-v2/revisions"
import { calculateHistory, ruleChangeDates } from "../../tariffs/engine-v2/history"
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
  "7323.93.00.80": { htsno: "7323.93.00", general: "2%", special: "Free (A*,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "40%" },
  "7615.10.71.80": { htsno: "7615.10.71", general: "3.1%", special: "Free (A*,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "45.5%" },
  "8544.42.90.90": { htsno: "8544.42.90", general: "2.6%", special: "Free (A,AU,B,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "35%" },
  "7208.51.00.30": { htsno: "7208.51.00.30", general: "Free", special: "", other: "20%" },
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

// ============================================================
// U.S. note 16(a): "These headings [9903.82.02–9903.82.19] are mutually exclusive, such that an
// imported article will be subject to no more than one of these headings."
// Brute force: one code per combination of note 16 list memberships, every relevant country,
// base rates either side of the 10% and 15% thresholds, with and without a USMCA claim, every
// combination of answers to the metals questions, at a Rev 5 and a Rev 6 date.
// ============================================================
describe("engine-v2 real data: note 16(a) mutual exclusivity", () => {
  it("never applies more than one of 9903.82.02–9903.82.26 to an article", () => {
    const range = Array.from({ length: 25 }, (_, i) => `9903.82.${String(i + 2).padStart(2, "0")}`)
    const memberLists = [
      "aluminum16ci", "aluminumDerivatives16cii", "aluminumDerivatives16cix", "aluminumDerivatives16cvi",
      "copper16cv", "copperArticles16cviii", "motorcycleParts16cg", "steel16ciii", "steelDerivatives16civ",
      "steelDerivatives16cvii", "steelDerivatives16cx", "steelDerivatives16cxi", "metalsPartsForEquipment16k",
      "9903.82.03:excluded", "9903.85.67", "9903.85.68",
    ]
    const digits = (c: string) => c.replace(/\./g, "")
    const codesOf = (id: string) =>
      AllRules.lists.find((l) => l.id === id).versions.flatMap((v) => v.codes ?? []).map(digits)
    const listCodes = new Map(memberLists.map((id) => [id, codesOf(id)]))

    const representatives = new Map<string, string>()
    for (const code of Array.from(new Set(memberLists.slice(0, 13).flatMap((id) => listCodes.get(id))))) {
      const signature = memberLists
        .filter((id) => listCodes.get(id).some((c) => code.startsWith(c) || c.startsWith(code)))
        .join("+")
      if (!representatives.has(signature)) representatives.set(signature, code.padEnd(10, "0"))
    }
    const dotted = (c: string) => `${c.slice(0, 4)}.${c.slice(4, 6)}.${c.slice(6, 8)}.${c.slice(8, 10)}`

    const countries = ["CA", "MX", "GB", "RU", "BY", "KP", "CU", "CN", "DE", "JP", "TW", "VN"]
    const baseRates = [
      { general: "Free", special: "", other: "Free" },
      { general: "5%", special: "Free (S)", other: "5%" },
      { general: "12%", special: "Free (S)", other: "12%" },
      { general: "20%", special: "Free (S)", other: "20%" },
    ]
    const violations: string[] = []
    let applied18or19 = 0
    const appliedFrom20 = new Set<string>()

    for (const code of Array.from(representatives.values()))
      for (const country of countries)
        for (const rates of baseRates)
          for (const claimedPreference of [undefined, "S"])
            for (const asOf of ["2026-04-10", "2026-04-24", "2026-06-10"])
              // U.S. content only matters for 9903.82.20/.21 (USMCA, from June 8, 2026)
              for (const usContentPct of ["CA", "MX"].includes(country) && asOf >= "2026-06-08" ? [undefined, 20, 60] : [undefined]) {
              const base = {
                htsCode: dotted(code), country, asOf, customsValue: VALUE, quantity: UNITS,
                baseRates: rates, claimedPreference,
              }
              const fixed = usContentPct === undefined ? {} : { usContentPct }
              const inputs = calculate(AllRules, { ...base, answers: fixed }).questions
                .map((q) => q.input.id)
                .filter((id) => id.startsWith("confirm:9903.82") || id.startsWith("confirm:9903.85"))
              for (let mask = 0; mask < 1 << inputs.length; mask++) {
                const answers = { ...fixed, ...Object.fromEntries(inputs.map((id, i) => [id, Boolean(mask & (1 << i))])) }
                const headings = calculate(AllRules, { ...base, answers })
                  .lines.filter((l) => l.status === "applies" && range.includes(l.code))
                  .map((l) => l.code)
                if (headings.some((c) => c === "9903.82.18" || c === "9903.82.19")) applied18or19++
                headings.filter((c) => c >= "9903.82.20").forEach((c) => appliedFrom20.add(c))
                // Note 16(j) splits one article's value between 9903.82.20 and .21: one treatment
                const treatments = headings.filter((c) => c !== "9903.82.21" || !headings.includes("9903.82.20"))
                if (treatments.length > 1)
                  violations.push(`${headings.join(" + ")}: ${dotted(code)} ${country} ${asOf} base ${rates.general} ${JSON.stringify(answers)}`)
              }
            }

    if (violations.length) console.log(violations.slice(0, 10).join("\n"))
    expect(violations).toHaveLength(0)
    expect(applied18or19 > 0).toBe(true) // the newer headings were actually exercised
    expect(Array.from(appliedFrom20).sort()).toEqual(range.slice(18)) // .20–.26 each applied somewhere
  })
})

// ============================================================
// Note 16 precedence between alternative 9903.82 headings, and the other note 33/38/39
// non-stacking rules. Corrections made with 2026 Rev 6; they apply from the start of the data.
// ============================================================
describe("engine-v2 real data: note 16 precedence and notes 33/38/39 non-stacking", () => {
  const calc = (htsCode: string, country: string, answers: Record<string, unknown> = {}, rates = { general: "Free", special: null as string | null, other: "Free" }) =>
    calculate(AllRules, { htsCode, country, asOf: "2026-04-24", customsValue: VALUE, quantity: UNITS, baseRates: rates, answers })
  const metals = (result: CalculationResult) =>
    applying(result).filter((c) => c.startsWith("9903.82"))

  it("Russian (c)(iii)–(v) goods use 9903.82.14, whatever the Column 2 rate (not 9903.82.02)", () => {
    expect(metals(calc("7206.90.00.00", "RU"))).toEqual(["9903.82.14"])
    expect(metals(calc("7206.90.00.00", "RU", {}, { general: "Free", special: null, other: "20%" }))).toEqual(["9903.82.14"])
  })

  it("Russian goods 95% U.S.-melted use 9903.82.15 (note 16(e)), not 9903.82.14 or .16", () => {
    expect(metals(calc("7326.20.00.90", "RU", { "confirm:9903.82.15": true }))).toEqual(["9903.82.15"])
    expect(metals(calc("8302.10.60.00", "RU", { "confirm:9903.82.15": true }))).toEqual(["9903.82.15"])
  })

  it("U.S.-melted (9903.82.06) wins over UK (9903.82.04) when both are confirmed", () => {
    expect(metals(calc("7308.20.00.35", "GB", { "confirm:9903.82.04": true, "confirm:9903.82.06": true }))).toEqual(["9903.82.06"])
  })

  it("note 16(e) heading 9903.82.08 wins over 16(f) heading 9903.82.11 (16(f) covers goods not meeting (e))", () => {
    const rates = { general: "20%", special: null as string | null, other: "45%" }
    expect(metals(calc("8424.89.90.00", "DE", { "confirm:9903.82.08": true, "confirm:9903.82.11": true }, rates))).toEqual(["9903.82.08"])
  })

  it("Column 2 countries' (c)(ix)–(x) goods use 9903.82.12 over 9903.82.07/.08/.10/.11", () => {
    const rates = { general: "12%", special: null as string | null, other: "12%" }
    expect(metals(calc("8424.89.90.00", "BY", { "confirm:9903.82.08": true, "confirm:9903.82.10": true }, rates))).toEqual(["9903.82.12"])
  })

  it("the motorcycle-parts exemption 9903.82.13 displaces the (c)(vi)–(viii) duty headings (note 16(g))", () => {
    expect(metals(calc("8412.90.90.70", "GB", { "confirm:9903.82.05": true, "confirm:9903.82.13": true }))).toEqual(["9903.82.13"])
    expect(metals(calc("8412.90.90.70", "RU", { "confirm:9903.82.13": true }))).toEqual(["9903.82.13"])
  })

  it("a confirmed semiconductor article pays 9903.79.01, not the auto-parts duty (note 39(a)(2))", () => {
    const v2 = calc("8471.50.01.50", "JP", { "confirm:9903.79.01": true, "confirm:9903.94.43": true })
    expect(applying(v2)).toContain("9903.79.01")
    expect(v2.lines.find((l) => l.code === "9903.94.43").status).toBe("excluded")
    expect(v2.totalDuty).toBe(2500)
  })

  it("wood auto parts: 9903.94.07 removes 9903.76.03 (note 33(f)(4)); 9903.94.65 removes 9903.76.23 (33(t)(2))", () => {
    const vn = calc("9403.91.00.80", "VN", { "confirm:9903.94.07": true })
    expect(applying(vn)).toContain("9903.94.07")
    expect(vn.lines.find((l) => l.code === "9903.76.03").status).toBe("excluded")
    expect(applying(calc("9403.91.00.80", "VN"))).toContain("9903.76.03")

    const kr = calc("9403.91.00.80", "KR", { "confirm:9903.94.65": true })
    expect(applying(kr)).toContain("9903.94.65")
    expect(kr.lines.find((l) => l.code === "9903.76.23").status).toBe("excluded")
  })

  it("has no unknown codes in the non-stacking interactions beyond the not-yet-backfilled IEEPA headings", () => {
    const known = new Set(AllRules.tariffs.map((t) => t.code))
    const unknown = new Set(
      AllRules.interactions.flatMap((i) => (i.kind === "noStack" ? i.order.flatMap((s) => s.codes ?? []) : []))
        .filter((c) => !known.has(c) && !/^9903\.0[12]\./.test(c)),
    )
    expect(Array.from(unknown)).toEqual([])
  })
})

// ============================================================
// Note 16(c)(vi) and (vii) lists rebuilt from the note text (Oct 2, 2026). The migrated lists
// were missing 15 and 40 codes, which then got no Section 232 duty at all.
// ============================================================
describe("engine-v2 real data: note 16(c)(vi)/(vii) list corrections", () => {
  it("Vietnamese steel kitchenware (7323.93, 16(c)(vii)) pays 9903.82.09 at 25%", () => {
    const v2 = run("7323.93.00.80", "VN")
    expect(applying(v2)).toEqual(["9903.03.06", "9903.82.09"])
    expect(v2.totalDuty).toBe(2700) // 2% base + 25%
  })

  it("Vietnamese aluminum kitchenware (7615.10.71, 16(c)(vi)) pays 9903.82.09 at 25%", () => {
    const v2 = run("7615.10.71.80", "VN")
    expect(applying(v2)).toEqual(["9903.03.06", "9903.82.09"])
    expect(v2.totalDuty).toBe(2810) // 3.1% base + 25%
  })

  it("UK steel kitchenware, 95% UK-melted: 9903.82.05 at 15% (note 16(d))", () => {
    const rates = RATES["7323.93.00.80"]
    const v2 = calculate(AllRules, {
      htsCode: "7323.93.00.80", country: "GB", asOf: AS_OF, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: rates.general, special: rates.special, other: rates.other },
      answers: { "confirm:9903.82.05": true },
    })
    expect(applying(v2).filter((c) => c.startsWith("9903.82"))).toEqual(["9903.82.05"])
  })

  it("the 15% metal-weight exemption (9903.82.03) isn't offered for these chapter 73/76 codes", () => {
    expect(run("7323.93.00.80", "VN").lines.some((l) => l.code === "9903.82.03")).toBe(false)
  })
})

// ============================================================
// 2026 Rev 7: notes 16(a) and 16(e) and heading 9903.82.01, all by Notice effective
// April 6, 2026 (retroactive, so Rev 5 and Rev 6 dates change too)
// ============================================================
describe("engine-v2 real data: 2026 Rev 7", () => {
  const CABLE = "8544.42.90.90" // note 16(c)(viii), articles of copper
  const runAt = (htsCode: string, country: string, asOf: string, answers: Record<string, unknown> = {}) => {
    const rates = RATES[htsCode]
    return calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: rates.general, special: rates.special, other: rates.other },
      answers,
    })
  }
  const status = (result: CalculationResult, code: string) => result.lines.find((l) => l.code === code)?.status

  it("copper cable (16(c)(viii)) pays 9903.82.09 at 25% unless an exemption is confirmed", () => {
    const v2 = runAt(CABLE, "VN", "2026-05-01")
    expect(applying(v2)).toEqual(["9903.03.06", "9903.82.09"])
    expect(v2.totalDuty).toBe(2760) // 2.6% base + 25%
  })

  it("95% U.S.-smelted copper cable gets 9903.82.06 at 10% (note 16(e)), back to April 6, 2026", () => {
    for (const asOf of ["2026-05-01", "2026-04-10"]) {
      const v2 = runAt(CABLE, "VN", asOf, { "confirm:9903.82.06": true })
      expect(applying(v2)).toEqual(["9903.03.06", "9903.82.06"])
      expect(status(v2, "9903.82.09")).toBe("excluded")
      expect(v2.totalDuty).toBe(1260) // 2.6% base + 10%
    }
  })

  it("copper cable with no metal content is exempt under 9903.82.01 (heading covers all of 16(c))", () => {
    const v2 = runAt(CABLE, "VN", "2026-05-01", { "confirm:9903.82.01": true })
    // Corrected in 2026HTSRev11: 9903.82.01 isn't in note 2(aa)(v)(1), so Section 122 applies
    // (was 9903.03.06 and $260)
    expect(applying(v2)).toEqual(["9903.03.01", "9903.82.01"])
    expect(v2.totalDuty).toBe(1260) // 2.6% base + 10% Section 122
  })

  it("Russian U.S.-smelted copper cable uses 9903.82.15, not .06 or .16", () => {
    const v2 = runAt(CABLE, "RU", "2026-05-01", { "confirm:9903.82.15": true })
    expect(applying(v2).filter((c) => c.startsWith("9903.82"))).toEqual(["9903.82.15"])
  })

  it("9903.82.01 displaces the motorcycle-parts exemption 9903.82.13 (note 16(a))", () => {
    const v2 = calculate(AllRules, {
      htsCode: "8412.90.90.70", country: "VN", asOf: "2026-05-01", customsValue: VALUE, quantity: UNITS,
      baseRates: { general: "Free", special: null, other: "Free" },
      answers: { "confirm:9903.82.01": true, "confirm:9903.82.13": true },
    })
    expect(applying(v2).filter((c) => c.startsWith("9903.82"))).toEqual(["9903.82.01"])
    expect(status(v2, "9903.82.13")).toBe("excluded")
  })
})

// ============================================================
// 2026 Rev 8: note 38(i) makes 9903.74.08 subject to a manufacturer's Commerce offset.
// Offsets aren't modeled (by decision): the heading needs confirming, then charges in full.
// ============================================================
describe("engine-v2 real data: 2026 Rev 8", () => {
  const run = (answers: Record<string, unknown>) =>
    calculate(AllRules, {
      htsCode: "8708.99.68.00", country: "DE", asOf: "2026-05-25", customsValue: VALUE, quantity: UNITS,
      baseRates: { general: "2.5%", special: null, other: null },
      answers,
    })
  const line = (result: CalculationResult) => result.lines.find((l) => l.code === "9903.74.08")

  it("MHDV parts heading 9903.74.08 needs confirming before it's charged", () => {
    expect(line(run({})).status).toBe("needsAnswer")
  })

  it("once confirmed, 9903.74.08 charges its full 25% (no offset applied)", () => {
    const confirmed = line(run({ "confirm:9903.74.08": true }))
    expect(confirmed.status).toBe("applies")
    expect(confirmed.amount).toBe(2500)
  })
})

// ============================================================
// 2026 Rev 9: Taiwan (auto parts, wood, civil aircraft components), Notice effective
// May 1, 2026. Dates before May 1 keep the earlier treatment.
// ============================================================
describe("engine-v2 real data: 2026 Rev 9 (Taiwan)", () => {
  const BEFORE = "2026-04-28"
  const AFTER = "2026-05-05"
  const calc = (htsCode: string, country: string, asOf: string, general: string, answers: Record<string, unknown> = {}) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general, special: null, other: null },
      answers,
    })
  const PART = { "confirm:9903.94.05": true, "confirm:9903.94.66": true, "confirm:9903.94.67": true }

  it("Taiwan auto part (33(g)): 25% under 9903.94.05 before May 1, topped up to 15% under 9903.94.67 after", () => {
    expect(applying(calc("8708.10.30.50", "TW", BEFORE, "2.5%", PART))).toEqual(["9903.03.06", "9903.94.05"])
    const after = calc("8708.10.30.50", "TW", AFTER, "2.5%", PART)
    expect(applying(after)).toEqual(["9903.03.06", "9903.94.67"])
    expect(after.totalDuty).toBe(1500) // 2.5% base + 12.5% = 15%
  })

  it("Taiwan auto part with a base rate of 15% or more: 9903.94.66, no extra duty", () => {
    const v2 = calc("8708.10.30.50", "TW", AFTER, "20%", PART)
    expect(applying(v2)).toEqual(["9903.03.06", "9903.94.66"])
    expect(v2.totalDuty).toBe(2000)
  })

  it("Taiwan auto parts drop the metals duty once confirmed (note 33(u)(1)); unconfirmed, metals still apply", () => {
    expect(applying(calc("8708.10.30.50", "TW", AFTER, "2.5%", PART)).includes("9903.82.09")).toBe(false)
    expect(applying(calc("8708.10.30.50", "TW", AFTER, "2.5%"))).toContain("9903.82.09")
  })

  it("Taiwan (r) parts for U.S. production: 9903.94.07 before May 1, 9903.94.69 after", () => {
    const answers = { "confirm:9903.94.07": true, "confirm:9903.94.68": true, "confirm:9903.94.69": true }
    expect(applying(calc("8536.50.90.65", "TW", BEFORE, "2.7%", answers))).toEqual(["9903.03.06", "9903.94.07"])
    const after = calc("8536.50.90.65", "TW", AFTER, "2.7%", answers)
    expect(applying(after)).toEqual(["9903.03.06", "9903.94.69"])
    expect(after.totalDuty).toBe(1500)
  })

  it("Taiwan upholstered furniture: 25% under 9903.76.02 before May 1, 15% under 9903.76.24 after", () => {
    expect(applying(calc("9401.61.40.11", "TW", BEFORE, "Free"))).toEqual(["9903.03.06", "9903.76.02"])
    const after = calc("9401.61.40.11", "TW", AFTER, "Free")
    expect(applying(after)).toEqual(["9903.03.06", "9903.76.24"])
    expect(after.totalDuty).toBe(1500)
  })

  it("Korean wood (9903.76.23) now tops up to 15% including the base rate, like Japan, the EU and Taiwan", () => {
    const v2 = calc("9401.61.40.11", "KR", AFTER, "4%")
    expect(v2.lines.find((l) => l.code === "9903.76.23").amount).toBe(1100)
    expect(v2.totalDuty).toBe(1500) // was 1,900 (4% + a flat 15%)
  })

  it("Taiwan civil aircraft components (35(c)) are exempt from Section 232 metals once confirmed, from May 1", () => {
    expect(applying(calc("7304.31.30.00", "TW", AFTER, "Free"))).toContain("9903.82.02")
    const confirmed = calc("7304.31.30.00", "TW", AFTER, "Free", { "confirm:9903.96.03": true })
    expect(applying(confirmed)).toEqual(["9903.03.06", "9903.96.03"])
    expect(confirmed.totalDuty).toBe(0)
    expect(applying(calc("7304.31.30.00", "TW", BEFORE, "Free", { "confirm:9903.96.03": true }))).toContain("9903.82.02")
  })
})

// ============================================================
// Duty over time (the calculator's "Duty Over Time" card)
// ============================================================
describe("engine-v2 real data: duty history across Rev 5 – Rev 9", () => {
  const FROM = "2026-04-08" // Rev 5
  const TO = "2026-06-08" // after Rev 9
  const history = (htsCode: string, country: string, extra: { claimedPreference?: string; answers?: Record<string, unknown> } = {}) => {
    const rates = RATES[htsCode]
    return calculateHistory(
      AllRules,
      {
        htsCode,
        country,
        asOf: FROM,
        customsValue: VALUE,
        quantity: UNITS,
        baseRates: { general: rates.general, special: rates.special, other: rates.other },
        ...extra,
      },
      FROM,
      TO,
    )
  }

  it("finds every date a rule starts or stops, starting with the first", () => {
    const dates = ruleChangeDates(AllRules, FROM, TO)
    expect(dates[0]).toBe(FROM)
    expect(dates).toContain("2026-04-23")
    expect(dates).toContain("2026-05-01")
    expect(dates.every((d) => d >= FROM && d < TO)).toBe(true)
  })

  it("Taiwan upholstered seats: 25% wood duty replaced by the 15% deal on May 1", () => {
    const segments = history("9401.61.40.11", "TW")
    expect(segments.map((s) => [s.from, s.to, round(s.result.totalDuty)])).toEqual([
      ["2026-04-08", "2026-05-01", 2500],
      ["2026-05-01", TO, 1500],
    ])
    expect(segments[1].revision?.name).toBe("2026HTSRev7")
    expect(segments[1].changes.map((c) => [c.kind, c.code, round(c.delta)])).toEqual([
      ["removed", "9903.76.02", -2500],
      ["added", "9903.76.24", 1500],
    ])
  })

  it("Mexico steel under USMCA with Commerce authorization: 50% to 25% on Apr 23", () => {
    const segments = history("7208.51.00.30", "MX", {
      claimedPreference: "S",
      answers: { "confirm:9903.82.18": true },
    })
    expect(segments.map((s) => [s.from, round(s.result.totalDuty)])).toEqual([
      ["2026-04-08", 5000],
      ["2026-04-23", 2500],
    ])
  })

  it("merges dates with the same duty into one stretch", () => {
    const segments = history("7326.90.86.88", "CN")
    expect(segments.length).toBe(1)
    expect(segments[0].from).toBe(FROM)
    expect(segments[0].to).toBe(TO)
    expect(segments[0].changes).toEqual([])
  })
})

// ============================================================
// 2026 Rev 10: Section 232 metals restructuring (Proclamation 11032), effective June 8, 2026
// ============================================================
describe("engine-v2 real data: 2026 Rev 10 (Proclamation 11032)", () => {
  const BEFORE = "2026-06-05"
  const AFTER = "2026-06-10"
  const calc = (htsCode: string, country: string, asOf: string, general: string, answers: Record<string, unknown> = {}, claimedPreference?: string) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general, special: general === "Free" ? "" : "Free (S)", other: "35%" },
      answers, claimedPreference,
    })
  const metals = (result: CalculationResult) => applying(result).filter((c) => c.startsWith("9903.82"))
  const EARTHMOVER = "8429.51.10.00" // moves from 16(c)(vii) to the new (xi)

  it("A/C parts move from (vii) (9903.82.09, 25%) to (x) (topped up to 15% under 9903.82.10)", () => {
    expect(metals(calc("8415.10.60.00", "VN", BEFORE, "1.4%"))).toEqual(["9903.82.09"])
    const after = calc("8415.10.60.00", "VN", AFTER, "1.4%", { "confirm:9903.82.10": true })
    expect(metals(after)).toEqual(["9903.82.10"])
    expect(after.totalDuty).toBe(1500)
  })

  it("(xi) equipment from partner countries pays 15% including base under 9903.82.22", () => {
    const v2 = calc(EARTHMOVER, "DE", AFTER, "Free")
    expect(metals(v2)).toEqual(["9903.82.22"])
    expect(v2.totalDuty).toBe(1500)
    expect(metals(calc(EARTHMOVER, "VN", AFTER, "Free"))).toEqual(["9903.82.09"])
  })

  it("USMCA (xi) equipment splits at 40% U.S. content: 9903.82.20 on the rest, .21 free (note 16(j))", () => {
    const low = calc(EARTHMOVER, "CA", AFTER, "Free", { usContentPct: 20 }, "S")
    expect(metals(low)).toEqual(["9903.82.20", "9903.82.21"])
    expect(low.totalDuty).toBe(2000) // 25% of the 80% that isn't U.S. content
    expect(calc(EARTHMOVER, "CA", AFTER, "Free", { usContentPct: 60 }, "S").totalDuty).toBe(1500) // 25% of 60%
    expect(metals(calc(EARTHMOVER, "CA", AFTER, "Free", {}, "S"))).toEqual(["9903.82.09"]) // unanswered: full 25%
  })

  it("parts for agricultural/industrial equipment (16(k)): 15% under .25, or 10% under .23 if 85% U.S.-melted", () => {
    expect(calc("8431.43.80.90", "VN", AFTER, "2.5%", { "confirm:9903.82.25": true }).totalDuty).toBe(1500)
    expect(calc("8431.43.80.90", "VN", AFTER, "2.5%", { "confirm:9903.82.23": true }).totalDuty).toBe(1000)
    // Not for Column 2 countries
    expect(metals(calc("8431.43.80.90", "RU", AFTER, "2.5%", { "confirm:9903.82.25": true }))).toEqual(["9903.82.16"])
  })

  it("9903.82.02 keeps the Section 122 exemption from June 8 (Rev 10's omission, corrected retroactively in Rev 11)", () => {
    // Was pinned at $6,000 with 9903.03.01 (Rev 10's note as published). The 2026HTSRev11
    // technical correction, effective 2026-04-06, restores 9903.82.02 to note 2(aa)(v)(1).
    expect(applying(calc("7206.90.00.00", "VN", BEFORE, "Free"))).toEqual(["9903.03.06", "9903.82.02"])
    const window = calc("7206.90.00.00", "VN", AFTER, "Free")
    expect(applying(window)).toEqual(["9903.03.06", "9903.82.02"])
    expect(window.totalDuty).toBe(5000) // 50%, no Section 122
  })
})

// ============================================================
// 2026 Rev 11: note 2(aa)(v)(1) technical correction (PP 11021, effective April 6, 2026), and
// the Section 122 triggers corrected to the note's list
// ============================================================
describe("engine-v2 real data: 2026 Rev 11", () => {
  const STEEL = "7206.90.00.00" // note 16(c)(iii), 9903.82.02
  const CABLE = "8544.42.90.90" // note 16(c)(viii)
  const calc = (htsCode: string, asOf: string, general: string, answers: Record<string, unknown> = {}) =>
    calculate(AllRules, {
      htsCode, country: "VN", asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general, special: "", other: "35%" },
      answers,
    })

  it("9903.82.02 steel is exempt from Section 122 before, during and after Rev 10", () => {
    for (const asOf of ["2026-04-10", "2026-06-15", "2026-07-01"]) {
      const v2 = calc(STEEL, asOf, "Free")
      expect(applying(v2)).toEqual(["9903.03.06", "9903.82.02"])
      expect(v2.totalDuty).toBe(5000)
    }
  })

  it("articles under 9903.82.03 (metal under 15% of the weight) pay Section 122: not in note 2(aa)(v)(1)", () => {
    for (const asOf of ["2026-04-10", "2026-07-01"]) {
      const v2 = calc(CABLE, asOf, "2.6%", { "confirm:9903.82.03": true })
      expect(applying(v2)).toEqual(["9903.03.01", "9903.82.03"])
      expect(v2.totalDuty).toBe(1260) // 2.6% base + 10% Section 122
    }
  })

  it("articles under 9903.82.01 (no aluminum, steel or copper) pay Section 122 too", () => {
    const v2 = calc(CABLE, "2026-07-01", "2.6%", { "confirm:9903.82.01": true })
    expect(applying(v2)).toEqual(["9903.03.01", "9903.82.01"])
    expect(v2.totalDuty).toBe(1260)
  })
})
