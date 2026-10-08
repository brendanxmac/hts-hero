// Engine-v2 on real HTS codes and rules. Base rates are copied from the USITC export so these
// tests run offline. The expected results were cross-checked against the legacy engine before
// it was removed (Oct 2026); where the two differed, v2's result is the corrected one.
import { describe, it, expect } from "../test-runner"
import { calculate } from "../../tariffs/engine-v2/calculate"
import { AllRules } from "../../tariffs/engine-v2/data"
import { CalculationResult } from "../../tariffs/engine-v2/types"
import { validateRules } from "../../tariffs/engine-v2/validate"
import { getRevision, getVerifiedRevisions } from "../../tariffs/engine-v2/revisions"
import ch99Archive from "../../tariffs/engine-v2/data/ch99-first-seen.json"
import { calculateHistory, ruleChangeDates } from "../../tariffs/engine-v2/history"
import { HtsLine } from "./hts-fixture"
import { findNoteCitations } from "../../tariffs/engine-v2/citations"
import { questionSpecificity, sortBySpecificity } from "../../components/duty-calculator/lib/questions"

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
    // From the earliest verified revision, checked against when each heading was
    // in the HTS (data/ch99-first-seen.json)
    const { errors } = validateRules(AllRules, {
      checkFrom: getVerifiedRevisions()[0].from,
      archive: ch99Archive,
      revisionStart: (name) => getRevision(name)?.from,
    })
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

  it("parts certified for U.S. production or repair (9903.94.07, 9903.74.09) skip chapters that can't hold vehicle parts", () => {
    const asked = (htsCode: string) =>
      run(htsCode, "VN").questions.map((q) => q.input.id).filter((id) => /9903\.(94\.07|74\.09)/.test(id))
    // Apparel, vegetables, live animals
    for (const code of ["6109.10.00.12", "0711.90.30.00", "0101.21.00.10"]) expect(asked(code)).toEqual([])
    // Insulated wire, rubber, made-up textiles, seats, vehicle parts outside 33(g)
    for (const code of ["8544.42.90.90", "4015.12.10.10", "6307.90.98.70", "9401.69.60.31", "8708.99.81.80"]) {
      expect(asked(code)).toEqual(["confirm:9903.94.07", "confirm:9903.74.09"])
    }
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

// ============================================================
// 2026 Rev 12: Section 301 – Brazil, U.S. note 50 and 9903.05.01–.09 (Notice effective
// July 22, 2026)
// ============================================================
describe("engine-v2 real data: 2026 Rev 12 (Section 301 – Brazil)", () => {
  const TSHIRT = "6109.10.00.04" // not in any note 50 list
  const COFFEE = "0901.11.00.15" // 50(a)(ii)
  const PHARMA = "2933.49.08.00" // 50(a)(v)
  const AIRCRAFT_PART = "8411.91.90.80" // 50(a)(iv)
  const STEEL = "7206.90.00.00" // 16(c)(iii), 9903.82.02
  const calc = (htsCode: string, country: string, asOf: string, general: string, answers: Record<string, unknown> = {}) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general, special: "", other: "45%" },
      answers,
    })
  // Note 50's headings only (note 52's country rates, 9903.05.20 on, also start "9903.05")
  const brazil = (result: CalculationResult) => applying(result).filter((c) => /^9903\.05\.0\d$/.test(c))

  it("adds 25% from July 22, stacking with Section 122 until it ends July 24", () => {
    expect(brazil(calc(TSHIRT, "BR", "2026-07-21", "16.5%"))).toEqual([])
    const both = calc(TSHIRT, "BR", "2026-07-22", "16.5%")
    expect(applying(both)).toEqual(["9903.03.01", "9903.05.01"])
    expect(both.totalDuty).toBe(5150) // 16.5% base + 25% + 10% Section 122
    const after = calc(TSHIRT, "BR", "2026-07-25", "16.5%")
    // From July 24, note 52's 12.5% for Brazil (9903.05.27, Rev 13) stacks too (was $4,150
    // with 9903.05.01 alone)
    expect(applying(after)).toEqual(["9903.05.01", "9903.05.27"])
    expect(after.totalDuty).toBe(5400)
    expect(brazil(calc(TSHIRT, "VN", "2026-07-25", "16.5%"))).toEqual([])
  })

  it("exempts 50(a)(ii) products under 9903.05.03", () => {
    expect(brazil(calc(COFFEE, "BR", "2026-07-25", "Free"))).toEqual(["9903.05.03"])
  })

  it("exempts civil aircraft parts (9903.05.05) and pharmaceuticals (9903.05.06) once confirmed", () => {
    expect(brazil(calc(AIRCRAFT_PART, "BR", "2026-07-25", "Free"))).toEqual(["9903.05.01"])
    expect(brazil(calc(AIRCRAFT_PART, "BR", "2026-07-25", "Free", { "confirm:9903.05.05": true }))).toEqual(["9903.05.05"])
    expect(brazil(calc(PHARMA, "BR", "2026-07-25", "Free"))).toEqual(["9903.05.01"])
    expect(brazil(calc(PHARMA, "BR", "2026-07-25", "Free", { "confirm:9903.05.06": true }))).toEqual(["9903.05.06"])
  })

  it("exempts Section 232 articles (9903.05.07), but not ones under 9903.82.01, which (a)(vi) doesn't list", () => {
    const steel = calc(STEEL, "BR", "2026-07-25", "Free")
    // 9903.05.90 is note 52's matching exemption (Rev 13, from July 24)
    expect(applying(steel)).toEqual(["9903.05.07", "9903.05.90", "9903.82.02"])
    expect(steel.totalDuty).toBe(5000)
    const noMetal = calc(STEEL, "BR", "2026-07-25", "Free", { "confirm:9903.82.01": true })
    // Plus note 52's 12.5% from July 24 (was $2,500)
    expect(applying(noMetal)).toEqual(["9903.05.01", "9903.05.27", "9903.82.01"])
    expect(noMetal.totalDuty).toBe(3750)
  })

  it("exempts goods loaded before July 22 and entered before July 29 (9903.05.02)", () => {
    expect(brazil(calc(TSHIRT, "BR", "2026-07-25", "16.5%", { loadingDate: "2026-07-20" }))).toEqual(["9903.05.02"])
    expect(brazil(calc(TSHIRT, "BR", "2026-07-29", "16.5%", { loadingDate: "2026-07-20" }))).toEqual(["9903.05.01"])
  })

  it("exempts donations (9903.05.08) and informational materials (9903.05.09)", () => {
    expect(brazil(calc(TSHIRT, "BR", "2026-07-25", "16.5%", { isDonation: true }))).toEqual(["9903.05.08"])
    expect(brazil(calc(TSHIRT, "BR", "2026-07-25", "16.5%", { isInformationalMaterial: true }))).toEqual(["9903.05.09"])
  })
})

// ============================================================
// 2026 Rev 13: Section 122 ends at the close of July 23; Section 301 – Forced Labor (U.S. note 52,
// 9903.05.20–9903.06.21) from July 24, 2026
// ============================================================
describe("engine-v2 real data: 2026 Rev 13 (Section 301 – Forced Labor)", () => {
  const TSHIRT = "6109.10.00.04"
  const AFTER = "2026-07-29"
  const calc = (
    htsCode: string,
    country: string,
    asOf: string,
    general: string,
    opts: { answers?: Record<string, unknown>; special?: string; other?: string; claimedPreference?: string; customsValue?: number } = {},
  ) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: opts.customsValue ?? VALUE, quantity: UNITS,
      baseRates: { general, special: opts.special ?? "", other: opts.other ?? "45%" },
      answers: opts.answers ?? {}, claimedPreference: opts.claimedPreference,
    })
  // Note 52's headings only
  const note52 = (result: CalculationResult) =>
    applying(result).filter((c) => /^9903\.0(5\.([2-9]\d)|6\.\d\d)$/.test(c))

  it("replaces Section 122 (to July 23) with the country rate from July 24", () => {
    expect(applying(calc(TSHIRT, "VN", "2026-07-23", "16.5%"))).toEqual(["9903.03.01"])
    const v2 = calc(TSHIRT, "VN", "2026-07-24", "16.5%")
    expect(applying(v2)).toEqual(["9903.05.84"])
    expect(v2.totalDuty).toBe(2900) // 16.5% base + 12.5%
    expect(calc(TSHIRT, "GB", AFTER, "16.5%").totalDuty).toBe(2650) // UK +10%
    expect(note52(calc(TSHIRT, "KE", AFTER, "16.5%"))).toEqual([]) // not listed
  })

  it("EU, Japan, Korea, Switzerland and Taiwan total 10% or 12.5% including the base rate (note 52(k))", () => {
    const low = calc("8481.80.90.50", "DE", AFTER, "4%")
    expect(note52(low)).toEqual(["9903.05.39"])
    expect(low.totalDuty).toBe(1000)
    const high = calc("8481.80.90.50", "DE", AFTER, "12%")
    expect(note52(high)).toEqual(["9903.05.38"])
    expect(high.totalDuty).toBe(1200)
    expect(calc("8481.80.90.50", "JP", AFTER, "2%").totalDuty).toBe(1250)
    expect(note52(calc("8481.80.90.50", "TW", AFTER, "2%"))).toEqual(["9903.05.76"])
  })

  it("uses the ad valorem equivalent of a specific rate: duty payable ÷ customs value", () => {
    // 50¢/kg × 100 kg = $50 on $1,000 → 5%, so 9903.05.49 adds 7.5% ($75)
    const v2 = calc("0402.10.10.00", "JP", AFTER, "50¢/kg", { customsValue: 1000 })
    expect(note52(v2)).toEqual(["9903.05.49"])
    expect(v2.totalDuty).toBe(125)
  })

  it("stacks with Section 301 Brazil and Section 301 China", () => {
    const br = calc(TSHIRT, "BR", AFTER, "16.5%")
    expect(applying(br)).toEqual(["9903.05.01", "9903.05.27"])
    expect(br.totalDuty).toBe(5400) // 16.5% + 25% + 12.5%
    const cn = applying(calc(TSHIRT, "CN", AFTER, "16.5%"))
    expect(cn.includes("9903.05.31")).toBe(true)
    expect(cn.some((c) => c.startsWith("9903.88"))).toBe(true)
  })

  it("follows each heading's Column 2 rate: Russia's 12.5% applies in Column 2 (its heading says '+ 12.5%')", () => {
    const ru = calc(TSHIRT, "RU", AFTER, "16.5%", { other: "90%" })
    expect(note52(ru)).toEqual(["9903.05.66"])
    expect(ru.totalDuty).toBe(10250) // 90% column 2 + 12.5%
  })

  it("exempts USMCA goods of Canada and Mexico (9903.05.93/.94) only when claimed", () => {
    expect(note52(calc(TSHIRT, "CA", AFTER, "16.5%"))).toEqual(["9903.05.29"])
    expect(note52(calc(TSHIRT, "CA", AFTER, "16.5%", { special: "Free (S)", claimedPreference: "S" }))).toEqual(["9903.05.93"])
    expect(note52(calc(TSHIRT, "MX", AFTER, "16.5%", { special: "Free (S)", claimedPreference: "S" }))).toEqual(["9903.05.94"])
  })

  it("applies the shared exemptions (9903.05.85–.92)", () => {
    expect(note52(calc("0901.11.00.15", "VN", AFTER, "Free"))).toEqual(["9903.05.86"])
    expect(note52(calc("2933.11.00.00", "VN", AFTER, "Free"))).toEqual(["9903.05.84"])
    expect(note52(calc("2933.11.00.00", "VN", AFTER, "Free", { answers: { "confirm:9903.05.89": true } }))).toEqual(["9903.05.89"])
    expect(note52(calc("8411.91.90.80", "VN", AFTER, "Free", { answers: { "confirm:9903.05.88": true } }))).toEqual(["9903.05.88"])
    expect(note52(calc("7206.90.00.00", "VN", AFTER, "Free"))).toEqual(["9903.05.90"])
    expect(note52(calc(TSHIRT, "VN", "2026-07-26", "16.5%", { answers: { loadingDate: "2026-07-22" } }))).toEqual(["9903.05.85"])
    expect(note52(calc(TSHIRT, "VN", "2026-07-28", "16.5%", { answers: { loadingDate: "2026-07-22" } }))).toEqual(["9903.05.84"])
    expect(note52(calc(TSHIRT, "VN", AFTER, "16.5%", { answers: { isDonation: true } }))).toEqual(["9903.05.91"])
  })

  it("applies the country-specific exemptions in (i) and (j)", () => {
    expect(note52(calc("2208.30.30.00", "GB", AFTER, "Free"))).toEqual(["9903.05.96"])
    expect(note52(calc("1515.90.81.00", "MY", AFTER, "Free"))).toEqual(["9903.06.01"]) // argan oil
    // Guatemalan T-shirt: CAFTA-DR claim → (j)(6)(iii) 9903.06.06 (and the textile exemption .95 once confirmed)
    expect(note52(calc(TSHIRT, "GT", AFTER, "16.5%"))).toEqual(["9903.05.40"])
    expect(note52(calc(TSHIRT, "GT", AFTER, "16.5%", { special: "Free (P)", claimedPreference: "P" }))).toEqual(["9903.06.06"])
  })
})

// ============================================================
// 2026 Rev 14: Section 232 – Pharmaceuticals, U.S. note 40 and 9903.04.60–.69 (Proclamation
// 11020, effective July 31, 2026)
// ============================================================
describe("engine-v2 real data: 2026 Rev 14 (Section 232 – Pharmaceuticals)", () => {
  // An ingredient in 40(c) that isn't on note 52(b)'s or 50(a)(ii)'s automatic exemption lists
  // (most 40(c) codes are), so the country rates apply unless something else exempts it
  const DRUG = "2918.99.30.00"
  const AFTER = "2026-08-01"
  const calc = (country: string, asOf: string, general: string, answers: Record<string, unknown> = {}, htsCode = DRUG) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general, special: "", other: "45%" },
      answers,
    })
  const pharma = (result: CalculationResult) => applying(result).filter((c) => c.startsWith("9903.04.6"))
  const yes = (...codes: string[]) => Object.fromEntries(codes.map((c) => [`confirm:${c}`, true]))

  it("patented pharmaceuticals pay 100% in total from July 31, instead of the country rate (52(f)(8))", () => {
    const before = calc("IN", "2026-07-30", "Free")
    expect(applying(before)).toEqual(["9903.05.44"])
    const after = calc("IN", AFTER, "Free")
    expect(applying(after)).toEqual(["9903.04.60", "9903.05.90"])
    expect(after.totalDuty).toBe(10000)
    expect(calc("IN", AFTER, "5%").totalDuty).toBe(10000) // 5% base topped up to 100%
    expect(pharma(calc("IN", AFTER, "Free", {}, "3006.10.01.00"))).toEqual([]) // not in 40(c)
  })

  it("Japan, the EU, Korea, Switzerland and Liechtenstein pay 15% in total; the UK +10%", () => {
    const de = calc("DE", AFTER, "Free")
    expect(pharma(de)).toEqual(["9903.04.62"])
    expect(de.totalDuty).toBe(1500)
    expect(pharma(calc("LI", AFTER, "Free"))).toEqual(["9903.04.62"])
    const gb = calc("GB", AFTER, "Free")
    expect(pharma(gb)).toEqual(["9903.04.63"])
    // 2026HTSRev15 set 9903.04.63 to +0% from July 31 (was +10%, $1,000)
    expect(gb.totalDuty).toBe(0)
  })

  it("a confirmed onshoring plan (+20%) takes precedence over the country headings", () => {
    expect(calc("IN", AFTER, "Free", yes("9903.04.64")).totalDuty).toBe(2000)
    const jp = calc("JP", AFTER, "Free", yes("9903.04.64"))
    expect(pharma(jp)).toEqual(["9903.04.64"])
    expect(jp.totalDuty).toBe(2000)
    // Also for the UK, even though .63 is now +0% (decision, Rev 15): $0 → $2,000 once confirmed
    const gbOnshoring = calc("GB", AFTER, "Free", yes("9903.04.64"))
    expect(pharma(gbOnshoring)).toEqual(["9903.04.64"])
    expect(gbOnshoring.totalDuty).toBe(2000)
  })

  it("exempts onshoring with MFN pricing, specialty products and identified companies", () => {
    expect(pharma(calc("IN", AFTER, "Free", yes("9903.04.64", "9903.04.65")))).toEqual(["9903.04.65"])
    expect(calc("IN", AFTER, "Free", yes("9903.04.65")).totalDuty).toBe(0)
    expect(pharma(calc("DE", AFTER, "Free", yes("9903.04.66")))).toEqual(["9903.04.66"])
    expect(pharma(calc("IN", AFTER, "Free", yes("9903.04.61")))).toEqual(["9903.04.61"])
    // .61 ends September 29, 2026
    expect(pharma(calc("IN", "2026-09-29", "Free", yes("9903.04.61")))).toEqual(["9903.04.60"])
  })

  it("generics and non-pharmaceutical articles get no pharma duty, but do pay the country rate", () => {
    const generic = calc("IN", AFTER, "Free", yes("9903.04.67"))
    expect(applying(generic)).toEqual(["9903.04.67", "9903.05.44"])
    expect(generic.totalDuty).toBe(1000)
    expect(pharma(calc("IN", AFTER, "Free", yes("9903.04.69")))).toEqual(["9903.04.69"])
    expect(pharma(calc("IN", AFTER, "Free", yes("9903.04.68")))).toEqual(["9903.04.68"])
  })

  it("replaces Brazil's 25% for patented pharmaceuticals (50(a)(vi)(8)) but stacks with Section 301 China", () => {
    const br = calc("BR", AFTER, "Free")
    expect(applying(br)).toEqual(["9903.04.60", "9903.05.07", "9903.05.90"])
    expect(br.totalDuty).toBe(10000)
    const cn = applying(calc("CN", AFTER, "Free"))
    expect(cn.includes("9903.04.60")).toBe(true)
    expect(cn.includes("9903.05.31")).toBe(false)
  })

  it("never applies more than one of 9903.04.60–.69 (note 40(a)), for any combination of answers", () => {
    const codes = ["9903.04.61", "9903.04.64", "9903.04.65", "9903.04.66", "9903.04.67", "9903.04.68", "9903.04.69"]
    for (const country of ["IN", "DE", "JP", "LI", "GB", "BR", "CN"]) {
      for (let mask = 0; mask < 1 << codes.length; mask++) {
        const answers = yes(...codes.filter((_, i) => mask & (1 << i)))
        const applied = pharma(calc(country, AFTER, "Free", answers))
        if (applied.length !== 1) throw new Error(`${country} ${JSON.stringify(answers)}: ${applied.join(", ") || "none"}`)
      }
    }
  })
})

// ============================================================
// 2026 Rev 16: Section 201 – Quartz Surface Products, U.S. note 41 and 9903.45.30/.31
// (Proclamation 11051, effective August 15, 2026)
// ============================================================
describe("engine-v2 real data: 2026 Rev 16 (Section 201 – Quartz Surface Products)", () => {
  const QUARTZ = "6810.99.00.20"
  const AFTER = "2026-08-20"
  const calc = (country: string, asOf: string, answers: Record<string, unknown> = {}, htsCode = QUARTZ) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: "Free", special: "", other: "Free" },
      answers,
    })
  const quartz = (result: CalculationResult) => applying(result).filter((c) => c.startsWith("9903.45"))

  it("adds 25% in quota from August 15, stacking with the note 52 country rate", () => {
    expect(quartz(calc("VN", "2026-08-14"))).toEqual([])
    const vn = calc("VN", AFTER)
    expect(applying(vn)).toEqual(["9903.05.84", "9903.45.30"])
    expect(vn.totalDuty).toBe(3750) // 25% + 12.5%
    expect(quartz(calc("IN", AFTER))).toEqual(["9903.45.30"]) // India isn't exempt
    expect(quartz(calc("VN", AFTER, {}, "7020.00.60.00"))).toEqual(["9903.45.30"])
    expect(quartz(calc("VN", AFTER, {}, "6802.93.00.10"))).toEqual([]) // granite isn't covered
  })

  it("uses the over-quota heading (50%) only when the quota is filled", () => {
    const over = calc("VN", AFTER, { quartzQuotaFilled: true })
    expect(quartz(over)).toEqual(["9903.45.31"])
    expect(over.totalDuty).toBe(6250) // 50% + 12.5%
    expect(quartz(calc("VN", AFTER, { quartzQuotaFilled: false }))).toEqual(["9903.45.30"])
  })

  it("steps the rates down each year (41(e)) and ends after August 14, 2030", () => {
    const rate = (asOf: string, filled: boolean) =>
      calc("VN", asOf, { quartzQuotaFilled: filled }).lines.find((l) => l.code.startsWith("9903.45") && l.status === "applies")?.ratePct
    expect([rate("2027-08-20", false), rate("2027-08-20", true)]).toEqual([23, 49])
    expect([rate("2028-08-20", false), rate("2028-08-20", true)]).toEqual([21, 48])
    expect([rate("2030-08-14", false), rate("2030-08-14", true)]).toEqual([19, 47])
    expect(quartz(calc("VN", "2030-08-15"))).toEqual([])
  })

  it("exempts the 41(c) countries: USMCA, FTA partners, developing and Caribbean Basin countries", () => {
    for (const country of ["CA", "MX", "KR", "AU", "BR", "ZA", "BS", "TT"]) {
      expect(quartz(calc(country, AFTER))).toEqual([])
    }
  })

  it("applies unless the importer says the goods aren't quartz surface products (41(a))", () => {
    const glass = calc("VN", AFTER, { notQuartzSurfaceProduct: true }, "7020.00.60.00")
    expect(quartz(glass)).toEqual([])
    expect(glass.totalDuty).toBe(1250) // only the 12.5% country rate
    expect(quartz(calc("VN", AFTER, { notQuartzSurfaceProduct: true, quartzQuotaFilled: true }))).toEqual([])
    // Unanswered (an unchecked box) keeps the duty, and the question is listed
    const unanswered = calc("VN", AFTER)
    expect(quartz(unanswered)).toEqual(["9903.45.30"])
    expect(unanswered.unansweredInputs.some((u) => u.input.id === "notQuartzSurfaceProduct")).toBe(true)
  })

  it("stacks with Section 301 China", () => {
    const cn = applying(calc("CN", AFTER))
    expect(cn.includes("9903.45.30")).toBe(true)
    expect(cn.some((c) => c.startsWith("9903.88"))).toBe(true)
  })
})

// ============================================================
// Possible Adjustments order: questions about specific products before ones about a country's
// goods or everything
// ============================================================
describe("Possible Adjustments: sorted by specificity", () => {
  it("puts the quartz questions above donation and informational-materials questions", () => {
    const result = calculate(AllRules, {
      htsCode: "6810.99.00.20", country: "VN", asOf: "2026-08-20", customsValue: VALUE, quantity: UNITS,
      baseRates: { general: "Free", special: "", other: "Free" }, answers: {},
    })
    const order = sortBySpecificity(result.questions, result.asOf).map((q) => q.input.id)
    const pos = (id: string) => order.indexOf(id)
    expect(pos("notQuartzSurfaceProduct") >= 0 && pos("quartzQuotaFilled") >= 0).toBe(true)
    expect(pos("isDonation") >= 0).toBe(true)
    expect(Math.max(pos("notQuartzSurfaceProduct"), pos("quartzQuotaFilled")) < pos("isDonation")).toBe(true)
    expect(pos("quartzQuotaFilled") < pos("isInformationalMaterial")).toBe(true)
  })

  it("ranks listed products, then country-wide, then everything; ties keep their order", () => {
    // Canadian earthmover: 9903.82.20/.21 questions (a code list) before USMCA-only ones
    const result = calculate(AllRules, {
      htsCode: "8429.51.10.00", country: "CA", asOf: "2026-08-20", customsValue: VALUE, quantity: UNITS,
      baseRates: { general: "Free", special: "Free (S)", other: "Free" }, answers: {}, claimedPreference: "S",
    })
    const ranks = sortBySpecificity(result.questions, result.asOf).map((q) => questionSpecificity(q, result.asOf))
    for (let i = 1; i < ranks.length; i++) {
      expect(ranks[i - 1][0] < ranks[i][0] || (ranks[i - 1][0] === ranks[i][0] && ranks[i - 1][1] <= ranks[i][1])).toBe(true)
    }
  })
})

describe("engine-v2 real data: top-up lines explain their rate", () => {
  const line = (country: string, general: string, code: string) =>
    calculate(AllRules, {
      htsCode: "2918.99.30.00", country, asOf: "2026-08-01", customsValue: VALUE, quantity: UNITS,
      baseRates: { general, special: "", other: "45%" }, answers: {},
    }).lines.find((l) => l.code === code)

  it("says how much it adds on top of the regular duty", () => {
    expect(line("IN", "6.5%", "9903.04.60")?.reasons.includes("Tops up to 100% including the regular duty (6.5%), so 93.5% here")).toBe(true)
  })

  it("says when the regular duty already reaches the total", () => {
    expect(line("DE", "20%", "9903.04.62")?.reasons.includes("Tops up to 15% including the regular duty, which is already 20%, so nothing is added")).toBe(true)
  })
})

describe("note citations in legal text", () => {
  const keys = (text: string) => findNoteCitations(text).map((c) => c.key.replace("sub-III/us-notes/", ""))
  it("reads subdivisions, lists, ranges and inherited prefixes", () => {
    expect(keys("as provided for in subdivision (a)(iv) of U.S. note 50 to this subchapter")).toEqual(["50(a)(iv)"])
    expect(keys("as provided for in subdivisions (c) and (d) of U.S. note 40 to this subchapter")).toEqual(["40(c)", "40(d)"])
    expect(keys("subdivisions (c)(vi)–(viii) and (xi) of U.S. note 16")).toEqual(["16(c)(vi)", "16(c)(vii)", "16(c)(viii)", "16(c)(xi)"])
    // A letter after roman numerals is its own subdivision, even after a range ending in (x)
    expect(keys("subdivisions (c)(ii), (iv), (vi)–(viii), (xi) and (e) of U.S. note 16")).toEqual(["16(c)(ii)", "16(c)(iv)", "16(c)(vi)", "16(c)(vii)", "16(c)(viii)", "16(c)(xi)", "16(e)"])
    expect(keys("subdivisions (c)(ix)–(x) and (e) of U.S. note 16")).toEqual(["16(c)(ix)", "16(c)(x)", "16(e)"])
  })
  it("reads direct citations and ignores general, statistical and unnumbered notes", () => {
    expect(keys("as defined in U.S. note 41(a) to this subchapter … defined in note 41(d) to this subchapter")).toEqual(["41(a)", "41(d)"])
    expect(keys("articles the product of Algeria, as provided for in U.S. note 52 to this subchapter")).toEqual(["52"])
    expect(keys("special tariff treatment under general note 3(c)(i); see statistical note 1")).toEqual([])
    expect(keys("Except as provided in subdivisions (a)(ii) through (a)(vi) of this note")).toEqual([])
  })
  it("names another subchapter when the text does", () => {
    expect(findNoteCitations("subdivision (b) of U.S. note 3 to subchapter IV")[0].key).toBe("sub-IV/us-notes/3(b)")
  })
})

// ============================================================
// 2026 Rev 17: Section 338 – Canada, U.S. note 51 and 9903.03.12–.16 (Proclamations 11046–11048,
// 11056, effective August 22, 2026)
// ============================================================
describe("engine-v2 real data: 2026 Rev 17 (Section 338 – Canada)", () => {
  const WINE = "2204.21.20.00" // 51(b)(1)
  const AFTER = "2026-08-26"
  const calc = (htsCode: string, country: string, asOf: string, opts: { answers?: Record<string, unknown>; pref?: string } = {}) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: "Free", special: "Free (S)", other: "Free" },
      answers: opts.answers ?? {}, claimedPreference: opts.pref,
    })
  const s338 = (result: CalculationResult) => applying(result).filter((c) => /^9903\.03\.1[2-6]$/.test(c))

  it("adds 50% to listed Canadian products from August 22, on top of the country rate", () => {
    expect(s338(calc(WINE, "CA", "2026-08-21"))).toEqual([])
    const wine = calc(WINE, "CA", AFTER)
    expect(applying(wine)).toEqual(["9903.03.12", "9903.05.29"])
    expect(wine.totalDuty).toBe(6000) // 50% + 10%
    expect(s338(calc(WINE, "FR", AFTER))).toEqual([])
  })

  it("still applies with a USMCA claim (51(a)), while the country rate drops", () => {
    const usmca = calc(WINE, "CA", AFTER, { pref: "S" })
    expect(applying(usmca)).toEqual(["9903.03.12", "9903.05.93"])
    expect(usmca.totalDuty).toBe(5000)
  })

  it("uses 9903.03.13 for (b)(2) and 9903.03.14 for (b)(3)", () => {
    expect(s338(calc("0402.10.05.00", "CA", AFTER))).toEqual(["9903.03.13"])
    expect(s338(calc("3926.90.99.90", "CA", AFTER))).toEqual(["9903.03.14"])
  })

  it("exempts Section 232 articles (9903.03.15) and confirmed civil aircraft articles (9903.03.16)", () => {
    // Steel furniture: on (b)(3) and paying Section 232 metals
    const furniture = applying(calc("9403.20.00.82", "CA", AFTER))
    expect(furniture.includes("9903.03.15")).toBe(true)
    expect(furniture.includes("9903.03.14")).toBe(false)
    // Plastic aircraft part on (b)(3) and the (d) list
    expect(s338(calc("3926.90.99.90", "CA", AFTER, { answers: { "confirm:9903.03.16": true } }))).toEqual(["9903.03.16"])
  })
})

// ============================================================
// 2026 Rev 18: Section 232 – Unmanned Aircraft Systems (note 43, 9903.08.20–.26, September 3,
// 2026); note 20(vvv) exclusions on the July 1 statistical numbers; lean beef trimmings quota
// (note 7(c), 9903.54.02)
// ============================================================
describe("engine-v2 real data: 2026 Rev 18", () => {
  const DRONE = "8806.22.00.00" // 43(c)(3)/(4): thermal imaging decides
  const BIG_DRONE = "8806.24.00.00" // 43(c)(1): always 9903.08.21
  const CONTROL_PANEL = "8537.10.91.70" // 43(c)(1) docking stations, a general-purpose code
  const AFTER = "2026-09-05"
  const calc = (htsCode: string, country: string, asOf: string, answers: Record<string, unknown> = {}) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: "Free", special: "", other: "Free" },
      answers,
    })
  const uas = (result: CalculationResult) => applying(result).filter((c) => c.startsWith("9903.08.2"))
  const yes = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id.startsWith("9903") ? `confirm:${id}` : id, true]))

  it("drones pay 25% from September 3, or 100% with thermal imaging", () => {
    expect(uas(calc(DRONE, "VN", "2026-09-02"))).toEqual([])
    const drone = calc(DRONE, "VN", AFTER)
    expect(uas(drone)).toEqual(["9903.08.22"])
    expect(drone.totalDuty).toBe(3750) // 25% + Vietnam's 12.5% country rate (stacks)
    expect(uas(calc(DRONE, "VN", AFTER, yes("uasThermalImaging")))).toEqual(["9903.08.21"])
    expect(uas(calc(BIG_DRONE, "VN", AFTER))).toEqual(["9903.08.21"])
  })

  it("general-purpose codes are 9903.08.20 ($0) unless the goods are for unmanned aircraft", () => {
    expect(uas(calc(CONTROL_PANEL, "VN", AFTER))).toEqual(["9903.08.20"])
    expect(uas(calc(CONTROL_PANEL, "VN", AFTER, yes("uasForUse")))).toEqual(["9903.08.21"])
    expect(uas(calc("8807.30.00.60", "VN", AFTER, yes("uasForUse")))).toEqual(["9903.08.21"])
  })

  it("allied-made systems pay 15% in total (9903.08.24) or +10% for the UK (.23) once confirmed", () => {
    expect(uas(calc(DRONE, "DE", AFTER))).toEqual(["9903.08.22"])
    const de = calc(DRONE, "DE", AFTER, yes("9903.08.24"))
    expect(uas(de)).toEqual(["9903.08.24"])
    expect(de.lines.find((l) => l.code === "9903.08.24")?.amount).toBe(1500)
    expect(uas(calc(DRONE, "GB", AFTER, yes("9903.08.23", "uasThermalImaging")))).toEqual(["9903.08.23"])
    // Confirming .24 does nothing for a country it doesn't cover
    expect(uas(calc(DRONE, "VN", AFTER, yes("9903.08.24")))).toEqual(["9903.08.22"])
  })

  it("approved onshoring plans exempt the duty (9903.08.25/.26)", () => {
    expect(uas(calc(DRONE, "VN", AFTER, yes("9903.08.25")))).toEqual(["9903.08.25"])
    expect(uas(calc(BIG_DRONE, "DE", AFTER, yes("9903.08.24", "9903.08.26")))).toEqual(["9903.08.26"])
  })

  it("applies exactly one of 9903.08.20–.26 (note 43(a)) for every combination of answers", () => {
    const ids = ["uasThermalImaging", "uasForUse", "9903.08.23", "9903.08.24", "9903.08.25", "9903.08.26"]
    for (const code of [DRONE, BIG_DRONE, CONTROL_PANEL]) {
      for (const country of ["VN", "DE", "GB", "JP", "CN"]) {
        for (let mask = 0; mask < 1 << ids.length; mask++) {
          const applied = uas(calc(code, country, AFTER, yes(...ids.filter((_, i) => mask & (1 << i)))))
          if (applied.length !== 1) throw new Error(`${code} ${country} ${mask}: ${applied.join(", ") || "none"}`)
        }
      }
    }
  })

  // Updated Oct 2026 (correction, approved): these are exclusions of products "described in" the
  // numbers (20(vvv)(iii)), so 9903.88.69 now applies once the goods are confirmed to be that
  // product. Before, it applied to every Chinese good under the number.
  it("recognizes the 20(vvv) exclusions under the July 1, 2026 statistical numbers", () => {
    const exclusion = yes("9903.88.69")
    expect(applying(calc("8413.91.90.39", "CN", "2026-07-15", exclusion)).includes("9903.88.69")).toBe(true)
    expect(applying(calc("3926.90.99.15", "CN", "2026-07-15", exclusion)).includes("9903.88.69")).toBe(true)
    expect(applying(calc("8413.91.90.39", "CN", "2026-06-15", exclusion)).includes("9903.88.69")).toBe(false)
    expect(applying(calc("8413.91.90.39", "CN", "2026-07-15")).includes("9903.88.69")).toBe(false)
  })

  it("files lean beef trimmings under the additional quota (9903.54.02) when confirmed, at $0", () => {
    const beef = calc("0201.30.50.91", "AU", "2026-10-01", yes("9903.54.02"))
    expect(applying(beef).includes("9903.54.02")).toBe(true)
    expect(beef.lines.find((l) => l.code === "9903.54.02")?.amount).toBe(0)
    expect(applying(calc("0201.30.50.91", "AR", "2026-10-01", yes("9903.54.02"))).includes("9903.54.02")).toBe(false)
    expect(applying(calc("0201.30.50.91", "AU", "2026-12-01", yes("9903.54.02"))).includes("9903.54.02")).toBe(false)
  })
})

// ============================================================
// 2026 Rev 19: Section 338 – Canada lists (b)(1)/(b)(3) expanded and the Section 232 exemption
// limited to 9903.03.13 (note 51(c)), from September 15, 2026
// ============================================================
describe("engine-v2 real data: 2026 Rev 19 (Section 338 – Canada changes)", () => {
  const BEFORE = "2026-09-10"
  const AFTER = "2026-09-20"
  const calc = (htsCode: string, asOf: string, general = "Free") =>
    calculate(AllRules, {
      htsCode, country: "CA", asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general, special: "", other: "Free" }, answers: {},
    })
  const s338 = (result: CalculationResult) => applying(result).filter((c) => /^9903\.03\.1[2-6]$/.test(c))

  it("Section 232 goods on (b)(3) pay the 50% on top from September 15 (51(c) now covers only .13)", () => {
    const before = calc("9403.20.00.82", BEFORE) // steel furniture, Section 232 metals
    expect(s338(before)).toEqual(["9903.03.15"])
    expect(before.totalDuty).toBe(2500)
    const after = calc("9403.20.00.82", AFTER)
    expect(s338(after)).toEqual(["9903.03.14", "9903.03.15"])
    expect(after.totalDuty).toBe(7500) // 25% Section 232 + 50%
    // Wood cabinets (Section 232 wood) jump the same way
    expect(s338(calc("9403.60.80.93", AFTER)).includes("9903.03.14")).toBe(true)
  })

  it("adds cheese, hides and boats to (b)(1)", () => {
    expect(s338(calc("0406.10.64.00", BEFORE))).toEqual([])
    expect(s338(calc("0406.10.64.00", AFTER))).toEqual(["9903.03.12"])
    expect(s338(calc("8903.31.00.00", AFTER))).toEqual(["9903.03.12"])
    expect(s338(calc("4101.50.10.00", AFTER))).toEqual(["9903.03.12"])
  })

  it("narrows provisions to the statistical numbers the note lists", () => {
    expect(s338(calc("2208.30.60.80", BEFORE))).toEqual(["9903.03.12"])
    expect(s338(calc("2208.30.60.80", AFTER))).toEqual([])
    expect(s338(calc("2208.30.60.20", AFTER))).toEqual(["9903.03.12"])
    expect(s338(calc("4818.90.00.10", BEFORE))).toEqual(["9903.03.14"])
    expect(s338(calc("4818.90.00.10", AFTER))).toEqual([])
    expect(s338(calc("4818.90.00.20", AFTER))).toEqual(["9903.03.14"])
    expect(s338(calc("2501.00.00.00", AFTER))).toEqual([]) // salt, removed
  })

  it("leaves the dairy list (b)(2) and its Section 232 exemption unchanged", () => {
    expect(s338(calc("0402.10.05.00", AFTER))).toEqual(["9903.03.13"])
    const exceptions = (code: string) =>
      AllRules.tariffs.find((t) => t.code === code && t.effective.from === "2026-08-22")?.exceptions
    expect(exceptions("9903.03.13")).toEqual(["9903.03.15", "9903.03.16"])
  })
})

// ============================================================
// 2026 Rev 20: Section 232 – Pharmaceuticals, note 40 list re-split, new 9903.04.70 (clinical
// trials, R&D, non-commercial use), September 29, 2026
// ============================================================
describe("engine-v2 real data: 2026 Rev 20 (Section 232 – Pharmaceuticals changes)", () => {
  const DRUG = "2918.99.30.00"
  const BEFORE = "2026-09-28"
  const AFTER = "2026-09-30"
  const calc = (htsCode: string, country: string, asOf: string, answers: Record<string, unknown> = {}) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: "Free", special: "", other: "45%" }, answers,
    })
  const pharma = (result: CalculationResult) => applying(result).filter((c) => /^9903\.04\.(6\d|70)$/.test(c))
  const yes = (...codes: string[]) => Object.fromEntries(codes.map((c) => [`confirm:${c}`, true]))

  it("exempts articles solely for clinical trials, R&D or non-commercial use from September 29 (9903.04.70)", () => {
    expect(pharma(calc(DRUG, "IN", BEFORE, yes("9903.04.70")))).toEqual(["9903.04.60"])
    const exempt = calc(DRUG, "IN", AFTER, yes("9903.04.70"))
    expect(applying(exempt)).toEqual(["9903.04.70", "9903.05.44"]) // the country rate still applies
    expect(exempt.totalDuty).toBe(1000)
    // It also wins over the country headings
    expect(pharma(calc(DRUG, "DE", AFTER, yes("9903.04.70")))).toEqual(["9903.04.70"])
  })

  it("follows the Rev 20 list: split, added and removed statistical numbers", () => {
    expect(pharma(calc("2922.19.09.10", "IN", AFTER))).toEqual(["9903.04.60"]) // split from .0900
    expect(pharma(calc("3004.20.00.42", "IN", BEFORE))).toEqual([])
    expect(pharma(calc("3004.20.00.42", "IN", AFTER))).toEqual(["9903.04.60"])
    expect(pharma(calc("3004.20.00.83", "IN", BEFORE))).toEqual(["9903.04.60"])
    expect(pharma(calc("3004.20.00.83", "IN", AFTER))).toEqual([])
  })

  it("applies exactly one of 9903.04.60–.70 (note 40(a)) for every combination of answers", () => {
    const codes = ["9903.04.64", "9903.04.65", "9903.04.66", "9903.04.67", "9903.04.68", "9903.04.69", "9903.04.70"]
    for (const country of ["IN", "DE", "GB", "JP"]) {
      for (let mask = 0; mask < 1 << codes.length; mask++) {
        const applied = pharma(calc(DRUG, country, AFTER, yes(...codes.filter((_, i) => mask & (1 << i)))))
        if (applied.length !== 1) throw new Error(`${country} ${mask}: ${applied.join(", ") || "none"}`)
      }
    }
  })
})

// ============================================================
// Section 338 – Canada import bans: Proclamations 11061 (alcoholic beverages), 11062 (dairy) and
// 11063 (motor vehicles), from September 29, 2026, with the annexes attached to CSMS #70050970
// ============================================================
describe("engine-v2 real data: Section 338 – Canada import bans (Sep 29, 2026)", () => {
  const BEFORE = "2026-09-28"
  const AFTER = "2026-09-29"
  const calc = (htsCode: string, country: string, asOf: string, answers: Record<string, unknown> = {}) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: "Free", special: "", other: "Free" }, answers,
    })
  const bans = (result: CalculationResult) => result.prohibitions.map((p) => p.id)

  it("bans annex products of Canada from September 29, 2026, and not the day before", () => {
    expect(bans(calc("0404.10.05.00", "CA", BEFORE))).toEqual([])
    expect(bans(calc("0404.10.05.00", "CA", AFTER))).toEqual(["ban:canada-338-dairy"])
    expect(bans(calc("2202.91.00.00", "CA", AFTER))).toEqual(["ban:canada-338-dairy"])
    expect(bans(calc("8711.50.00.00", "CA", AFTER))).toEqual(["ban:canada-338-motor-vehicles"])
    expect(bans(calc("2208.30.60.20", "CA", AFTER))).toEqual(["ban:canada-338-alcohol"])
  })

  it("covers only products of Canada, and only the annex provisions", () => {
    expect(bans(calc("0404.10.05.00", "MX", AFTER))).toEqual([])
    expect(bans(calc("2208.30.60.20", "GB", AFTER))).toEqual([])
    expect(bans(calc("8711.40.30.00", "CA", AFTER))).toEqual([]) // 500–800 cc
    expect(bans(calc("0402.10.05.00", "CA", AFTER))).toEqual([]) // milk powder: 50% duty, no ban
  })

  it('bans "Packaged" provisions unless the beverages are in bulk, and asks', () => {
    const unanswered = calc("2208.30.60.40", "CA", AFTER) // bourbon over 4 liters: "Packaged"
    expect(bans(unanswered)).toEqual(["ban:canada-338-alcohol-packaged"])
    expect(unanswered.prohibitions[0].openInputs).toEqual(["alcoholInBulk"])
    const question = unanswered.questions.find((q) => q.input.id === "alcoholInBulk")
    expect(question?.liftsProhibition).toBe(true)
    expect(question?.answered).toBe(false)
    expect(bans(calc("2208.30.60.40", "CA", AFTER, { alcoholInBulk: true }))).toEqual([])
    // Provisions without the limitation are banned in any container, and don't ask
    const bourbonSmall = calc("2208.30.60.20", "CA", AFTER, { alcoholInBulk: true })
    expect(bans(bourbonSmall)).toEqual(["ban:canada-338-alcohol"])
    expect(bourbonSmall.questions.some((q) => q.input.id === "alcoholInBulk")).toBe(false)
  })

  it("never changes the duty: goods imported before the ban still pay the 50%", () => {
    const banned = calc("2203.00.00.30", "CA", AFTER)
    const bulk = calc("2203.00.00.30", "CA", AFTER, { alcoholInBulk: true })
    expect(bans(banned)).toEqual(["ban:canada-338-alcohol-packaged"])
    expect(banned.totalDuty).toBe(bulk.totalDuty)
  })
})

// ============================================================
// Corrections (Oct 2026): civil aircraft agreements and note 19 lists, from Rev 5 on
// ============================================================
describe("engine-v2 real data: civil aircraft agreements and Russian aluminum (corrections)", () => {
  const calc = (htsCode: string, country: string, asOf: string, general: string, answers: Record<string, unknown> = {}) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general, special: null, other: null },
      answers,
    })
  const metals = (result: CalculationResult) => applying(result).filter((c) => c.startsWith("9903.82"))
  const AIRCRAFT: [string, string][] = [["GB", "9903.96.01"], ["DE", "9903.02.76"], ["JP", "9903.96.02"], ["KR", "9903.02.81"]]

  // U.S. notes 35(a), 2(v)(xxii), 35(b), 2(v)(xxiv)(b). The EU and Korea headings outlive
  // IEEPA: Proclamation 11021 clause (10) keeps the Section 232 civil aircraft agreements.
  // Was: metals duty applied to all four (the exemptions weren't modeled).
  it("civil aircraft steel tube of the UK, EU, Japan or Korea drops the metals duty once confirmed", () => {
    for (const asOf of ["2026-04-10", "2026-08-01"]) {
      for (const [country, heading] of AIRCRAFT) {
        expect(metals(calc("7304.31.30.00", country, asOf, "Free")).length).toBe(1)
        const confirmed = calc("7304.31.30.00", country, asOf, "Free", { [`confirm:${heading}`]: true })
        expect(applying(confirmed)).toContain(heading)
        expect(metals(confirmed)).toEqual([])
        expect(confirmed.totalDuty).toBe(0)
      }
    }
  })

  it("the agreements don't cover other countries' aircraft goods", () => {
    const confirmed = calc("7304.31.30.00", "FR", "2026-04-10", "Free", { "confirm:9903.96.01": true, "confirm:9903.96.02": true })
    expect(metals(confirmed)).toEqual(["9903.82.02"])
  })

  // Was: 7612.10.00 and 123 other note 19(i)–(k) codes were missing from the 9903.85.68 list,
  // so Russian aluminum containers paid 50% under 9903.82.02 instead of 200%
  it("Russian aluminum containers (19(j)) get 9903.85.68 at 200% instead of 9903.82.02", () => {
    const v2 = calc("7612.10.00.00", "RU", "2026-04-10", "2.4%", { "confirm:9903.85.68": true })
    expect(applying(v2)).toContain("9903.85.68")
    expect(applying(v2)).not.toContain("9903.82.02")
    expect(v2.lines.find((l) => l.code === "9903.85.68").amount).toBe(20_000)
  })

  // Note 16(a): "Except as provided in headings 9903.85.67 and 9903.85.68, headings
  // 9903.82.02–9903.82.17 [later .19, .26] provide …". Was: only 9903.82.02 gave way to both,
  // so e.g. 7616.99.51.30 of Russia paid 9903.85.67 (200%) plus 9903.82.09 (25%).
  it("every 9903.82 heading gives way to the Russia headings 9903.85.67/.68 (note 16(a))", () => {
    for (const asOf of ["2026-04-10", "2026-06-10", "2026-08-01"]) {
      const casting = calc("7616.99.51.30", "RU", asOf, "2.5%")
      expect(applying(casting)).toContain("9903.85.67")
      expect(applying(casting).filter((c) => c.startsWith("9903.82"))).toEqual([])
      const steel = calc("7308.20.00.35", "RU", asOf, "Free", { "confirm:9903.85.68": true })
      expect(applying(steel)).toContain("9903.85.68")
      expect(applying(steel).filter((c) => c.startsWith("9903.82"))).toEqual([])
    }
  })

  // 7616.99.51.30/.40/.90 are in 19(g) (9903.85.67) and listed by name in 19(j) (9903.85.68).
  // Was: both 200% duties applied once .68 was confirmed.
  it("Russian goods on both 19(g) and 19(j) pay 200% once: .67, or .68 when confirmed as derivatives", () => {
    for (const asOf of ["2026-03-15", "2026-04-10"]) {
      const confirmed = calc("7616.99.51.30", "RU", asOf, "2.5%", { aluminumContentPct: 90, "confirm:9903.85.68": true })
      const russia = applying(confirmed).filter((c) => /^9903\.85\./.test(c))
      expect(russia).toEqual(["9903.85.68"])
      expect(applying(calc("7616.99.51.30", "RU", asOf, "2.5%", { aluminumContentPct: 90 })).filter((c) => /^9903\.85\./.test(c))).toEqual(["9903.85.67"])
    }
  })
})

// ============================================================
// 2026 Rev 4 (Feb 25 – Apr 8, 2026): the Section 232 metals structure before Proclamation
// 11021, which replaced it for entries on or after April 6, 2026. $10,000, 100 units.
// ============================================================
describe("engine-v2 real data: 2026 Rev 4 (before Proclamation 11021)", () => {
  const BEFORE = "2026-03-15"
  const calc = (htsCode: string, country: string, asOf: string, general: string, answers: Record<string, unknown> = {}) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general, special: null, other: null },
      answers,
    })
  const amount = (result: CalculationResult, code: string) => round(result.lines.find((l) => l.code === code)?.amount ?? 0)
  const status = (result: CalculationResult, code: string) => result.lines.find((l) => l.code === code)?.status

  it("is a verified revision", () => {
    expect(getVerifiedRevisions().map((r) => r.name)).toContain("2026HTSRev4")
  })

  it("steel mill product (16(j)): 9903.81.87 at 50% of the full value until April 5, then 9903.82.02", () => {
    for (const asOf of [BEFORE, "2026-04-05"]) {
      const v2 = calc("7208.51.00.30", "DE", asOf, "Free", { steelContentPct: 100 })
      expect(applying(v2)).toEqual(["9903.03.06", "9903.81.87"])
      expect(v2.totalDuty).toBe(5000)
    }
    const after = calc("7208.51.00.30", "DE", "2026-04-06", "Free", { steelContentPct: 100 })
    expect(applying(after)).toEqual(["9903.03.06", "9903.82.02"])
    expect(after.totalDuty).toBe(5000)
  })

  it("Section 122 still applies to the non-steel content (note 2(aa)(v)(a)); unanswered, to the full value", () => {
    const answered = calc("7208.51.00.30", "DE", BEFORE, "Free", { steelContentPct: 95 })
    expect(amount(answered, "9903.03.01")).toBe(50) // 10% of the $500 non-steel content
    const unanswered = calc("7208.51.00.30", "DE", BEFORE, "Free")
    expect(status(unanswered, "9903.03.06")).toBe("needsAnswer")
    expect(amount(unanswered, "9903.03.01")).toBe(1000)
    expect(unanswered.totalDuty).toBe(6000)
  })

  it("chapter 73 derivative (16(m)) pays on the steel content; 122 on the rest (HowTariffsWork §19.1)", () => {
    const v2 = calc("7326.90.86.88", "CN", BEFORE, "2.9%", { steelContentPct: 60 })
    expect(amount(v2, "9903.81.90")).toBe(3000)
    expect(amount(v2, "9903.88.03")).toBe(2500)
    expect(round(v2.lines.find((l) => l.code === "9903.03.06").basisValue)).toBe(6000)
    expect(amount(v2, "9903.03.01")).toBe(400)
    expect(round(v2.totalDuty)).toBe(6190)
    // Unanswered, the steel duty needs an answer
    expect(status(calc("7326.90.86.88", "CN", BEFORE, "2.9%"), "9903.81.90")).toBe("needsAnswer")
  })

  it("duty history steps up on April 6, when 232 moves to the full value", () => {
    const rates = RATES["7326.90.86.88"]
    const segments = calculateHistory(
      AllRules,
      { htsCode: "7326.90.86.88", country: "CN", asOf: "2026-02-25", customsValue: VALUE, quantity: UNITS,
        baseRates: { general: rates.general, special: null, other: null }, answers: { steelContentPct: 60 } },
      "2026-02-25",
      "2026-04-23",
    )
    expect(segments.map((s) => [s.from, round(s.result.totalDuty)])).toEqual([["2026-02-25", 6190], ["2026-04-06", 7790]])
    expect(segments[1].changes.map((c) => [c.kind, c.code])).toEqual([
      ["added", "9903.82.02"], ["removed", "9903.81.90"], ["removed", "9903.03.01"],
    ])
  })

  it("16(l)/(m) split 7317.00.55: the listed statistical numbers go to .89, the rest to .90", () => {
    expect(applying(calc("7317.00.55.03", "DE", BEFORE, "Free", { steelContentPct: 90 }))).toContain("9903.81.89")
    const other = calc("7317.00.55.18", "DE", BEFORE, "Free", { steelContentPct: 90 })
    expect(applying(other)).toContain("9903.81.90")
    expect(applying(other)).not.toContain("9903.81.89")
  })

  it("16(n) derivative outside chapter 73 pays on the steel content (9903.81.91)", () => {
    const v2 = calc("8431.49.90.95", "DE", BEFORE, "Free", { steelContentPct: 40 })
    expect(amount(v2, "9903.81.91")).toBe(2000)
    expect(amount(v2, "9903.03.01")).toBe(600)
  })

  it("bumper stampings (16(l)(C), chapter 87) pay steel on the full value, aluminum (19(k)) on its content", () => {
    const v2 = calc("8708.10.30.50", "DE", BEFORE, "2.5%", { steelContentPct: 50, aluminumContentPct: 10 })
    expect(amount(v2, "9903.81.89")).toBe(5000)
    expect(amount(v2, "9903.85.08")).toBe(500)
    expect(applying(v2)).not.toContain("9903.85.04") // 8708.10.30.50 is listed by name in 19(k)
    expect(amount(v2, "9903.03.01")).toBe(400) // 122 on everything but the steel and aluminum content
  })

  it("UK steel: 9903.81.94 at 25% (no 95% test before April 6)", () => {
    const v2 = calc("7208.51.00.30", "GB", BEFORE, "Free", { steelContentPct: 100 })
    expect(applying(v2)).toEqual(["9903.03.06", "9903.81.94"])
    expect(v2.totalDuty).toBe(2500)
  })

  it("Mexican steel pays the full 50% (no USMCA rate before April 6)", () => {
    expect(calc("7208.51.00.30", "MX", BEFORE, "Free", { steelContentPct: 100 }).totalDuty).toBe(5000)
  })

  it("derivatives processed abroad from U.S.-melted steel (9903.81.92) pay no steel duty; 122 still spares the steel content", () => {
    const v2 = calc("7326.90.86.88", "DE", BEFORE, "2.9%", { steelContentPct: 60, "confirm:9903.81.92": true })
    expect(status(v2, "9903.81.90")).toBe("excluded")
    expect(applying(v2)).toContain("9903.81.92")
    expect(amount(v2, "9903.03.01")).toBe(400)
  })

  it("FTZ goods admitted under privileged foreign status before June 4, 2025 file 9903.81.88 instead (same duty)", () => {
    const before = calc("7208.51.00.30", "DE", BEFORE, "Free", { steelContentPct: 100, ftzPrivilegedForeignAdmissionDate: "2025-05-01" })
    expect(applying(before)).toEqual(["9903.03.06", "9903.81.88"])
    expect(before.totalDuty).toBe(5000)
    const after = calc("7208.51.00.30", "DE", BEFORE, "Free", { steelContentPct: 100, ftzPrivilegedForeignAdmissionDate: "2025-07-01" })
    expect(applying(after)).toEqual(["9903.03.06", "9903.81.87"])
  })

  it("aluminum (19(g)) and chapter 76 derivatives (19(j)) pay on the aluminum content", () => {
    expect(amount(calc("7601.10.30.00", "DE", BEFORE, "2.6%", { aluminumContentPct: 100 }), "9903.85.02")).toBe(5000)
    const container = calc("7612.10.00.00", "DE", BEFORE, "2.4%", { aluminumContentPct: 80 })
    expect(amount(container, "9903.85.07")).toBe(4000)
    expect(amount(container, "9903.03.01")).toBe(200)
    // 7616.99.51.30 is in 19(g) (7616.99.51) and listed by name in 19(j): 9903.85.07 only
    const casting = calc("7616.99.51.30", "DE", BEFORE, "2.5%", { aluminumContentPct: 90 })
    expect(applying(casting)).toContain("9903.85.07")
    expect(applying(casting)).not.toContain("9903.85.02")
  })

  it("U.S.-smelted aluminum derivatives (9903.85.09) pay no aluminum duty", () => {
    const v2 = calc("7612.10.00.00", "DE", BEFORE, "2.4%", { aluminumContentPct: 80, "confirm:9903.85.09": true })
    expect(status(v2, "9903.85.07")).toBe("excluded")
    expect(round(v2.totalDuty)).toBe(440) // 2.4% base + 122 on the $2,000 non-aluminum content
  })

  it("Russian aluminum: 9903.85.67/.68 at 200% of the full value, or their FTZ twins .69/.70", () => {
    const ingot = calc("7601.10.30.00", "RU", BEFORE, "2.6%", { aluminumContentPct: 100 })
    expect(amount(ingot, "9903.85.67")).toBe(20000)
    expect(status(ingot, "9903.85.02")).toBe("excluded")
    const container = { aluminumContentPct: 80, "confirm:9903.85.68": true }
    expect(amount(calc("7612.10.00.00", "RU", BEFORE, "2.4%", container), "9903.85.68")).toBe(20000)
    const ftz = calc("7612.10.00.00", "RU", BEFORE, "2.4%", { ...container, ftzPrivilegedForeignAdmissionDate: "2023-01-01" })
    expect(applying(ftz)).toContain("9903.85.70")
    expect(applying(ftz)).not.toContain("9903.85.68")
    // After April 6, .69/.70 are gone and .67 applies regardless of the FTZ date
    expect(applying(calc("7601.10.30.00", "RU", "2026-04-10", "2.6%", { ftzPrivilegedForeignAdmissionDate: "2023-01-01" }))).toContain("9903.85.67")
  })

  it("goods on both 16(n) and 19(k) pay both, each on its own content; dropped from the lists on April 6", () => {
    const before = calc("0402.99.68.00", "DE", BEFORE, "Free", { steelContentPct: 5, aluminumContentPct: 10 })
    expect(amount(before, "9903.81.91")).toBe(250)
    expect(amount(before, "9903.85.08")).toBe(500)
    expect(amount(before, "9903.03.01")).toBe(850)
    const after = calc("0402.99.68.00", "DE", "2026-04-10", "Free", { steelContentPct: 5, aluminumContentPct: 10 })
    expect(applying(after).filter((c) => c.startsWith("9903.8"))).toEqual([])
  })

  it("UK derivatives on 16(u) and 19(s) pay 25% of each content", () => {
    const v2 = calc("0402.99.68.00", "GB", BEFORE, "Free", { steelContentPct: 5, aluminumContentPct: 10 })
    expect(amount(v2, "9903.81.98")).toBe(125)
    expect(amount(v2, "9903.85.15")).toBe(250)
  })

  it("copper (36(b)): 9903.78.01 at 50% of the copper content, with the 9903.78.02 line for the rest", () => {
    const v2 = calc("8544.42.90.90", "DE", BEFORE, "2.6%", { copperContentPct: 40 })
    expect(amount(v2, "9903.78.01")).toBe(2000)
    expect(applying(v2)).toContain("9903.78.02")
    expect(amount(v2, "9903.03.01")).toBe(600)
    expect(round(v2.totalDuty)).toBe(2860)
    // 8544.42.90 is also in 19(k): with aluminum content, 122 spares both contents
    const both = calc("8544.42.90.90", "DE", BEFORE, "2.6%", { copperContentPct: 40, aluminumContentPct: 10 })
    expect(amount(both, "9903.85.08")).toBe(500)
    expect(amount(both, "9903.03.01")).toBe(500)
  })

  it("auto parts under their own 232 heading don't pay the old metals duties (notes 33, 38, 39)", () => {
    const v2 = calc("8708.10.30.50", "CN", BEFORE, "2.5%", { steelContentPct: 50, aluminumContentPct: 10, "confirm:9903.94.05": true })
    expect(status(v2, "9903.81.89")).toBe("excluded")
    expect(status(v2, "9903.85.08")).toBe("excluded")
    expect(applying(v2)).toContain("9903.94.05")
    expect(status(v2, "9903.03.01")).toBe("excluded")
  })

  it("civil aircraft of the UK, EU, Japan and Korea don't pay the old metals duties once confirmed", () => {
    const cases: [string, string, string][] = [["GB", "9903.96.01", "9903.81.94"], ["DE", "9903.02.76", "9903.81.87"], ["JP", "9903.96.02", "9903.81.87"], ["KR", "9903.02.81", "9903.81.87"]]
    for (const [country, exemption, metals] of cases) {
      expect(applying(calc("7304.31.30.00", country, BEFORE, "Free", { steelContentPct: 100 }))).toContain(metals)
      const confirmed = calc("7304.31.30.00", country, BEFORE, "Free", { steelContentPct: 100, [`confirm:${exemption}`]: true })
      expect(status(confirmed, metals)).toBe("excluded")
      expect(applying(confirmed)).toContain(exemption)
      expect(confirmed.totalDuty).toBe(0)
    }
  })

  it("non-metal goods are unchanged across April 6", () => {
    expect(calc("0711.90.30.00", "DE", BEFORE, "8%").totalDuty).toBe(calc("0711.90.30.00", "DE", "2026-04-10", "8%").totalDuty)
  })
})

// ============================================================
// Correction (Oct 2026): Section 301 exclusions (9903.88.69/.70) for described products need a
// confirmation; whole-number exclusions don't. Extended through Nov 9, 2026 (90 FR 55232).
// ============================================================
describe("engine-v2 real data: Section 301 China exclusions (corrections)", () => {
  const calc = (htsCode: string, answers: Record<string, unknown> = {}, asOf = "2026-08-01") =>
    calculate(AllRules, {
      htsCode, country: "CN", asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general: "3%", special: null, other: null }, answers: { steelContentPct: 60, ...answers },
    })
  const confirmed = { "confirm:9903.88.69": true }

  it("steel cable hooks (20(vvv)(iii)(41)): 25% unless confirmed as the excluded product", () => {
    expect(applying(calc("7326.90.86.88"))).toContain("9903.88.03")
    const hooks = calc("7326.90.86.88", confirmed)
    expect(applying(hooks)).toContain("9903.88.69")
    expect(applying(hooks)).not.toContain("9903.88.03")
  })

  it("the other two added exclusions: rear-view mirrors and telecom conductors", () => {
    for (const code of ["7009.10.00.00", "8544.42.20.00"]) {
      expect(applying(calc(code))).toContain("9903.88.03")
      expect(applying(calc(code, confirmed))).not.toContain("9903.88.03")
    }
  })

  it("whole-number exclusions (20(vvv)(i)) apply without a question", () => {
    const v2 = calc("8483.50.90.40")
    expect(applying(v2)).toContain("9903.88.69")
    expect(v2.questions.some((q) => q.input.id === "confirm:9903.88.69")).toBe(false)
  })

  it("asks only for described-product codes", () => {
    expect(calc("7326.90.86.88").questions.some((q) => q.input.id === "confirm:9903.88.69")).toBe(true)
  })

  it("solar wafer equipment (20(www)) needs confirmation too", () => {
    expect(applying(calc("8486.10.00.00"))).not.toContain("9903.88.70")
    expect(applying(calc("8486.10.00.00", { "confirm:9903.88.70": true }))).toContain("9903.88.70")
  })

  it("the exclusions end with Nov 9, 2026", () => {
    expect(applying(calc("8483.50.90.40", {}, "2026-11-09"))).toContain("9903.88.69")
    expect(applying(calc("8483.50.90.40", {}, "2026-11-10"))).not.toContain("9903.88.69")
  })
})

// ============================================================
// 2026 Rev 3 (Feb 12 – Feb 25, 2026): the IEEPA duties until they ended on Feb 24, 2026
// (EO 14389; CSMS # 67834313). $10,000, 100 units.
// ============================================================
describe("engine-v2 real data: 2026 Rev 3 (IEEPA, until Feb 24, 2026)", () => {
  const BEFORE = "2026-02-20"
  const calc = (htsCode: string, country: string, asOf: string, general: string, answers: Record<string, unknown> = {}, claimedPreference?: string) =>
    calculate(AllRules, {
      htsCode, country, asOf, customsValue: VALUE, quantity: UNITS,
      baseRates: { general, special: claimedPreference ? `Free (${claimedPreference})` : null, other: null },
      answers, claimedPreference,
    })
  const amount = (result: CalculationResult, code: string) => round(result.lines.find((l) => l.code === code)?.amount ?? 0)
  const ieepa = (result: CalculationResult) => applying(result).filter((c) => /^9903\.0[12]\./.test(c))
  const TEXTILE = "6307.90.98.70" // 7%, not on the Annex II list

  it("is a verified revision", () => {
    expect(getVerifiedRevisions().map((r) => r.name)).toContain("2026HTSRev3")
  })

  it("Chinese steel hardware: fentanyl 10%, reciprocal 10% on the non-steel content; Section 122 from Feb 24", () => {
    const before = calc("7326.90.86.88", "CN", BEFORE, "2.9%", { steelContentPct: 60 })
    expect(amount(before, "9903.01.24")).toBe(1000)
    expect(amount(before, "9903.01.25")).toBe(400) // 10% of the $4,000 non-steel content (2(v)(vii))
    expect(amount(before, "9903.81.90")).toBe(3000)
    expect(round(before.totalDuty)).toBe(7190)
    const after = calc("7326.90.86.88", "CN", "2026-02-24", "2.9%", { steelContentPct: 60 })
    expect(ieepa(after)).toEqual([])
    expect(round(after.totalDuty)).toBe(6190)
  })

  it("ends on Feb 24: Feb 23 still pays IEEPA, Feb 24 pays Section 122 instead", () => {
    expect(amount(calc(TEXTILE, "VN", "2026-02-23", "7%"), "9903.02.69")).toBe(2000)
    const after = calc(TEXTILE, "VN", "2026-02-24", "7%")
    expect(ieepa(after)).toEqual([])
    expect(amount(after, "9903.03.01")).toBe(1000)
  })

  it("country rates and the 10% baseline", () => {
    expect(amount(calc(TEXTILE, "VN", BEFORE, "7%"), "9903.02.69")).toBe(2000)
    expect(amount(calc(TEXTILE, "IN", BEFORE, "7%"), "9903.02.26")).toBe(2500) // India's Russian-oil 25% ended Feb 7
    expect(amount(calc(TEXTILE, "GB", BEFORE, "7%"), "9903.02.66")).toBe(1000)
    expect(amount(calc(TEXTILE, "SG", BEFORE, "7%"), "9903.01.25")).toBe(1000)
    // China's 34% (9903.01.63) is suspended, so China pays the baseline plus fentanyl; Macau only the baseline
    expect(ieepa(calc(TEXTILE, "CN", BEFORE, "7%"))).toEqual(["9903.01.24", "9903.01.25"])
    expect(ieepa(calc(TEXTILE, "MO", BEFORE, "7%"))).toEqual(["9903.01.25"])
  })

  it("deals top up to 15% including the base rate; 15% or more pays nothing extra", () => {
    for (const [country, code] of [["DE", "9903.02.20"], ["JP", "9903.02.73"], ["KR", "9903.02.80"], ["CH", "9903.02.83"], ["LI", "9903.02.88"]]) {
      const v2 = calc(TEXTILE, country, BEFORE, "7%")
      expect(ieepa(v2)).toEqual([code])
      expect(amount(v2, code)).toBe(800)
    }
    expect(ieepa(calc("6109.10.00.12", "JP", BEFORE, "16.5%"))).toEqual(["9903.02.72"])
  })

  it("Brazil: 40% plus its 10% reciprocal; Section 232 goods are exempt from the 40% in full", () => {
    expect(ieepa(calc(TEXTILE, "BR", BEFORE, "7%"))).toEqual(["9903.01.77", "9903.02.09"])
    expect(round(calc(TEXTILE, "BR", BEFORE, "7%").totalDuty)).toBe(5700)
    const hardware = calc("7326.90.86.88", "BR", BEFORE, "2.9%", { steelContentPct: 60 })
    expect(applying(hardware)).toContain("9903.01.83")
    expect(amount(hardware, "9903.01.77")).toBe(0)
    expect(amount(hardware, "9903.02.09")).toBe(400) // the reciprocal still applies to the non-steel content
  })

  it("Canada and Mexico: 35% / 25%, 10% on energy and potash, nothing under USMCA, nothing on 232 steel or wood", () => {
    expect(amount(calc(TEXTILE, "CA", BEFORE, "7%"), "9903.01.10")).toBe(3500)
    expect(amount(calc("2709.00.20.10", "CA", BEFORE, "Free"), "9903.01.13")).toBe(1000)
    expect(amount(calc("3104.20.00.10", "CA", BEFORE, "Free"), "9903.01.15")).toBe(1000)
    expect(amount(calc("3104.20.00.10", "MX", BEFORE, "Free"), "9903.01.05")).toBe(1000)
    expect(amount(calc(TEXTILE, "MX", BEFORE, "7%"), "9903.01.01")).toBe(2500)
    expect(ieepa(calc(TEXTILE, "CA", BEFORE, "7%", {}, "S"))).toEqual(["9903.01.14", "9903.01.26"])
    // Note 16(i): no fentanyl duty on Section 232 steel; the reciprocal doesn't apply to Mexico
    const steel = calc("7208.51.00.30", "MX", BEFORE, "Free", { steelContentPct: 100 })
    expect(applying(steel)).not.toContain("9903.01.01")
    expect(round(steel.totalDuty)).toBe(5000)
    // Note 2(j): no 9903.01.10 on Section 232 wood
    expect(applying(calc("9401.61.40.11", "CA", BEFORE, "Free"))).not.toContain("9903.01.10")
    // Transshipped goods: 40% in lieu of 35%
    const transshipped = calc(TEXTILE, "CA", BEFORE, "7%", { "confirm:9903.01.16": true })
    expect(ieepa(transshipped)).toEqual(["9903.01.16", "9903.01.26"])
  })

  it("exemptions: Annex II, donations, Column 2 countries, U.S. content of 20% or more", () => {
    expect(ieepa(calc("8471.30.01.00", "VN", BEFORE, "Free"))).toEqual(["9903.01.32"])
    expect(applying(calc(TEXTILE, "CN", BEFORE, "7%", { isDonation: true })).filter((c) => ["9903.01.24", "9903.01.25"].includes(c))).toEqual([])
    expect(ieepa(calc(TEXTILE, "RU", BEFORE, "7%"))).toEqual(["9903.01.29"])
    expect(amount(calc(TEXTILE, "VN", BEFORE, "7%", { usContentPct: 30 }), "9903.02.69")).toBe(1400) // 20% of $7,000
    expect(amount(calc(TEXTILE, "VN", BEFORE, "7%", { usContentPct: 10 }), "9903.02.69")).toBe(2000)
  })

  it("transshipment (9903.02.01): 40% in lieu of the country rate", () => {
    const v2 = calc(TEXTILE, "VN", BEFORE, "7%", { "confirm:9903.02.01": true })
    expect(ieepa(v2)).toEqual(["9903.02.01"])
    expect(amount(v2, "9903.02.01")).toBe(4000)
  })

  it("EU steel hardware: the deal top-up applies to the non-steel content only", () => {
    const v2 = calc("7326.90.86.88", "DE", BEFORE, "2.9%", { steelContentPct: 60 })
    expect(amount(v2, "9903.02.20")).toBe(484) // (15% − 2.9%) of $4,000
  })

  // Correction (Oct 2026): 9903.88.15 (List 4A, 7.5%) listed 8507.60.00, which U.S. note 20(s)
  // doesn't in any revision (Rev 3 to Rev 20); lithium-ion batteries are in note 31 (9903.91.06)
  it("Chinese lithium-ion batteries don't pay the List 4A 7.5% (9903.88.15)", () => {
    for (const asOf of [BEFORE, "2026-04-10", "2026-08-01"]) {
      expect(applying(calc("8507.60.00.20", "CN", asOf, "3.4%"))).not.toContain("9903.88.15")
    }
  })

  it("Section 232 autos and semiconductors don't pay the reciprocal duty; China's fentanyl duty still applies to autos", () => {
    const part = calc("8708.10.30.50", "CN", BEFORE, "2.5%", { steelContentPct: 50, "confirm:9903.94.05": true })
    expect(applying(part)).toContain("9903.01.24")
    expect(applying(part)).not.toContain("9903.01.25")
    expect(ieepa(calc("8471.50.01.50", "TW", BEFORE, "Free", { "confirm:9903.79.01": true })).filter((c) => c !== "9903.01.32")).toEqual([])
  })
})
