import { describe, it, expect } from "./test-runner"
import {
  tariffIsApplicable,
  tariffIsActive,
  getTariffs,
  getTariffSets,
  getArticleTariffSet,
  getContentRequirementTariffSets,
  collectExceptionCodes,
  Section232MetalTariffs,
  TariffsList,
} from "../tariffs/tariffs"
import { TariffI, UITariff, TariffSet } from "../interfaces/tariffs"
import { ContentRequirementI } from "../components/Element"
import { ContentRequirements } from "../enums/tariff"

// ============================================================
// Helper: find a tariff in a TariffSet by code
// ============================================================
const findInSet = (set: TariffSet, code: string): UITariff | undefined =>
  set.tariffs.find((t) => t.code === code)

const findInSets = (sets: TariffSet[], code: string): UITariff | undefined => {
  for (const set of sets) {
    const found = findInSet(set, code)
    if (found) return found
  }
  return undefined
}

const findSetByName = (sets: TariffSet[], nameSubstr: string): TariffSet | undefined =>
  sets.find((s) => s.name.includes(nameSubstr))

// ============================================================
// 1. tariffIsApplicable
// ============================================================
describe("tariffIsApplicable", () => {
  it("returns true for wildcard country tariff (section 122 base 9903.03.01)", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.03.01")!
    expect(tariffIsApplicable(tariff, "CN", "2203.00.00")).toBe(true)
    expect(tariffIsApplicable(tariff, "DE", "7601.10.60")).toBe(true)
  })

  it("returns true for code-only inclusion tariff (aluminum derivative 9903.85.08)", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.85.08")!
    expect(tariffIsApplicable(tariff, "CN", "2203.00.00")).toBe(true)
    expect(tariffIsApplicable(tariff, "DE", "2203.00.00")).toBe(true)
  })

  it("returns false for code-only tariff when HTS code does not match", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.85.08")!
    expect(tariffIsApplicable(tariff, "CN", "0101.21.00")).toBe(false)
  })

  it("returns true for country+code tariff (UK aluminum 9903.85.12)", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.85.12")!
    expect(tariffIsApplicable(tariff, "GB", "7601.10.60")).toBe(true)
  })

  it("returns false for country+code tariff when country does not match", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.85.12")!
    expect(tariffIsApplicable(tariff, "CN", "7601.10.60")).toBe(false)
  })

  it("respects country exclusions (9903.85.02 excludes GB)", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.85.02")!
    expect(tariffIsApplicable(tariff, "GB", "7601.10.60")).toBe(false)
    expect(tariffIsApplicable(tariff, "CN", "7601.10.60")).toBe(true)
  })

  it("returns true for tariff-based inclusions (9903.03.06) when child tariff applies", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.03.06")!
    // 2203.00.00 is covered by 9903.85.08 (derivative aluminum 19(k))
    expect(tariffIsApplicable(tariff, "CN", "2203.00.00")).toBe(true)
  })

  it("returns false for tariff-based inclusions when no child tariff is applicable", () => {
    const syntheticParent: TariffI = {
      code: "SYN.PARENT",
      description: "Synthetic parent with tariff inclusions",
      name: "Synthetic Parent",
      general: 0,
      special: 0,
      other: 0,
      inclusions: {
        countries: ["*"],
        tariffs: ["SYN.CHILD"],
      },
    }
    const syntheticChild: TariffI = {
      code: "SYN.CHILD",
      description: "Synthetic child with specific codes",
      name: "Synthetic Child",
      general: 50,
      special: 50,
      other: 50,
      inclusions: {
        codes: ["9999.99.99"],
      },
    }
    // Temporarily add to TariffsList for lookup
    TariffsList.push(syntheticParent, syntheticChild)
    const result = tariffIsApplicable(syntheticParent, "CN", "0101.21.00")
    // Clean up
    TariffsList.pop()
    TariffsList.pop()
    expect(result).toBeFalsy()
  })

  it("respects code exclusions on tariffs", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.81.88")!
    // 7216.61.00 is in the exclusions list for 9903.81.88
    expect(tariffIsApplicable(tariff, "CN", "7216.61.00")).toBe(false)
  })

  it("respects tariffCodesToIgnore parameter", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.03.06")!
    expect(
      tariffIsApplicable(tariff, "CN", "2203.00.00", ["9903.03.06"])
    ).toBe(false)
  })
})

// ============================================================
// 2. tariffIsActive
// ============================================================
describe("tariffIsActive", () => {
  it("returns true for a simple tariff with no exceptions and no tariff inclusions", () => {
    const tariff: TariffI = {
      code: "TEST.01",
      description: "Test",
      name: "Test",
      general: 10,
      special: 10,
      other: 10,
      inclusions: { codes: ["1234"] },
    }
    const result = tariffIsActive(tariff, [])
    expect(result).toBe(true)
  })

  it("returns false for a tariff with requiresReview", () => {
    const tariff: TariffI = {
      code: "TEST.02",
      description: "Test",
      name: "Test",
      general: 10,
      special: 10,
      other: 10,
      requiresReview: true,
      inclusions: { codes: ["1234"] },
    }
    const result = tariffIsActive(tariff, [])
    expect(result).toBe(false)
  })

  it("returns true for tariff with exceptions when no exception is active", () => {
    const tariff: TariffI = {
      code: "TEST.03",
      description: "Test",
      name: "Test",
      general: 10,
      special: 10,
      other: 10,
      exceptions: ["EXC.01"],
      inclusions: { codes: ["1234"] },
    }
    const exception: UITariff = {
      code: "EXC.01",
      description: "Exception",
      name: "Exception",
      general: 0,
      special: 0,
      other: 0,
      isActive: false,
      inclusions: { codes: ["1234"] },
    }
    const result = tariffIsActive(tariff, [exception])
    expect(result).toBe(true)
  })

  it("returns false for tariff with exceptions when an exception IS active", () => {
    const tariff: TariffI = {
      code: "TEST.04",
      description: "Test",
      name: "Test",
      general: 10,
      special: 10,
      other: 10,
      exceptions: ["EXC.01"],
      inclusions: { codes: ["1234"] },
    }
    const exception: UITariff = {
      code: "EXC.01",
      description: "Exception",
      name: "Exception",
      general: 0,
      special: 0,
      other: 0,
      isActive: true,
      inclusions: { codes: ["1234"] },
    }
    const result = tariffIsActive(tariff, [exception])
    expect(result).toBe(false)
  })

  it("returns true for tariff with tariff inclusions when an inclusion IS active", () => {
    const tariff: TariffI = {
      code: "TEST.05",
      description: "Test",
      name: "Test",
      general: 0,
      special: 0,
      other: 0,
      inclusions: { tariffs: ["INC.01"] },
    }
    const inclusion: UITariff = {
      code: "INC.01",
      description: "Inclusion",
      name: "Inclusion",
      general: 10,
      special: 10,
      other: 10,
      isActive: true,
      inclusions: { codes: ["1234"] },
    }
    const result = tariffIsActive(tariff, [inclusion])
    expect(result).toBe(true)
  })

  it("returns false for tariff with tariff inclusions when no inclusion is active", () => {
    const tariff: TariffI = {
      code: "TEST.06",
      description: "Test",
      name: "Test",
      general: 0,
      special: 0,
      other: 0,
      inclusions: { tariffs: ["INC.01"] },
    }
    const inclusion: UITariff = {
      code: "INC.01",
      description: "Inclusion",
      name: "Inclusion",
      general: 10,
      special: 10,
      other: 10,
      isActive: false,
      inclusions: { codes: ["1234"] },
    }
    const result = tariffIsActive(tariff, [inclusion])
    expect(result).toBe(false)
  })

  it("returns false for tariff with tariff inclusions when no inclusion is found in applicable tariffs", () => {
    const tariff: TariffI = {
      code: "TEST.07",
      description: "Test",
      name: "Test",
      general: 0,
      special: 0,
      other: 0,
      inclusions: { tariffs: ["INC.01"] },
    }
    const result = tariffIsActive(tariff, [])
    expect(result).toBe(false)
  })

  // ---------------------------------------------------------
  // BUG FIX: tariff inclusions with undefined isActive
  // When tariffIsActive is called during initial construction
  // with TariffI[] (cast as UITariff[]), inclusion tariffs
  // won't have isActive set. The fix recursively evaluates them.
  // ---------------------------------------------------------
  it("recursively evaluates inclusion tariffs that lack isActive (TariffI[])", () => {
    const parentTariff: TariffI = {
      code: "PARENT.01",
      description: "Parent with tariff inclusions",
      name: "Parent",
      general: 0,
      special: 0,
      other: 0,
      inclusions: { tariffs: ["CHILD.01"], countries: ["*"] },
    }
    // Child has exceptions with no active ones → would evaluate to active
    const childTariff: TariffI = {
      code: "CHILD.01",
      description: "Child tariff",
      name: "Child",
      general: 50,
      special: 50,
      other: 50,
      exceptions: ["EXC.99"],
      inclusions: { codes: ["1234"] },
    }
    // Cast as UITariff[] to simulate initial construction — no isActive property
    const tariffs = [parentTariff, childTariff] as unknown as UITariff[]
    const result = tariffIsActive(parentTariff, tariffs)
    expect(result).toBe(true)
  })

  it("recursively evaluates and returns false when child would not be active", () => {
    const parentTariff: TariffI = {
      code: "PARENT.02",
      description: "Parent with tariff inclusions",
      name: "Parent",
      general: 0,
      special: 0,
      other: 0,
      inclusions: { tariffs: ["CHILD.02"], countries: ["*"] },
    }
    const childTariff: TariffI = {
      code: "CHILD.02",
      description: "Child tariff needing review",
      name: "Child",
      general: 50,
      special: 50,
      other: 50,
      requiresReview: true,
      inclusions: { codes: ["1234"] },
    }
    const tariffs = [parentTariff, childTariff] as unknown as UITariff[]
    const result = tariffIsActive(parentTariff, tariffs)
    expect(result).toBe(false)
  })
})

// ============================================================
// 3. collectExceptionCodes
// ============================================================
describe("collectExceptionCodes", () => {
  it("collects direct exception codes", () => {
    const tariff: TariffI = {
      code: "T.01",
      description: "",
      name: "",
      exceptions: ["E.01", "E.02"],
      inclusions: { codes: ["*"] },
    }
    const allTariffs: TariffI[] = [
      tariff,
      { code: "E.01", description: "", name: "", inclusions: { codes: ["*"] } },
      { code: "E.02", description: "", name: "", inclusions: { codes: ["*"] } },
    ]
    const result = new Set<string>()
    collectExceptionCodes(tariff, allTariffs, result)
    expect(result.has("E.01")).toBe(true)
    expect(result.has("E.02")).toBe(true)
    expect(result.size).toBe(2)
  })

  it("collects nested exception codes recursively", () => {
    const tariff: TariffI = {
      code: "T.01",
      description: "",
      name: "",
      exceptions: ["E.01"],
      inclusions: { codes: ["*"] },
    }
    const e01: TariffI = {
      code: "E.01",
      description: "",
      name: "",
      exceptions: ["E.02"],
      inclusions: { codes: ["*"] },
    }
    const e02: TariffI = {
      code: "E.02",
      description: "",
      name: "",
      inclusions: { codes: ["*"] },
    }
    const allTariffs = [tariff, e01, e02]
    const result = new Set<string>()
    collectExceptionCodes(tariff, allTariffs, result)
    expect(result.has("E.01")).toBe(true)
    expect(result.has("E.02")).toBe(true)
  })

  it("respects ignoreCodes and skips them", () => {
    const tariff: TariffI = {
      code: "T.01",
      description: "",
      name: "",
      exceptions: ["E.01", "E.02"],
      inclusions: { codes: ["*"] },
    }
    const allTariffs: TariffI[] = [
      tariff,
      { code: "E.01", description: "", name: "", inclusions: { codes: ["*"] } },
      { code: "E.02", description: "", name: "", inclusions: { codes: ["*"] } },
    ]
    const result = new Set<string>()
    collectExceptionCodes(tariff, allTariffs, result, ["E.01"])
    expect(result.has("E.01")).toBe(false)
    expect(result.has("E.02")).toBe(true)
  })
})

// ============================================================
// 4. getTariffs (integration with real TariffsList)
// ============================================================
describe("getTariffs — real tariff data", () => {
  it("returns applicable tariffs for HTS 2203.00.00 from China", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const codes = tariffs.map((t) => t.code)

    // 9903.85.08 — Derivative Aluminum from 19(k)
    expect(codes).toContain("9903.85.08")
    // 9903.03.01 — Section 122 base tariff (wildcard country)
    expect(codes).toContain("9903.03.01")
    // 9903.03.06 — Section 122 exemption for Section 232 articles
    expect(codes).toContain("9903.03.06")
  })

  it("returns aluminum product tariffs for HTS 7601.10.60 from China", () => {
    const tariffs = getTariffs("CN", "7601.10.60")
    const codes = tariffs.map((t) => t.code)
    expect(codes).toContain("9903.85.02")
    expect(codes).toContain("9903.03.01")
    expect(codes).toContain("9903.03.06")
  })

  it("returns UK-specific aluminum tariff for GB + aluminum code", () => {
    const tariffs = getTariffs("GB", "7601.10.60")
    const codes = tariffs.map((t) => t.code)
    // Should include UK-specific aluminum tariff, not the general one (which excludes GB)
    expect(codes).toContain("9903.85.12")
    expect(codes).not.toContain("9903.85.02")
  })

  it("does not return aluminum tariffs for non-aluminum HTS code", () => {
    const tariffs = getTariffs("CN", "0101.21.00")
    const codes = tariffs.map((t) => t.code)
    expect(codes).not.toContain("9903.85.02")
    expect(codes).not.toContain("9903.85.08")
  })
})

// ============================================================
// 5. getTariffSets — with content requirements
// ============================================================
describe("getTariffSets — content requirement structure", () => {
  it("creates Article set + content requirement sets when content requirements exist", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)

    expect(sets.length).toBeGreaterThanOrEqual(2)
    expect(sets[0].name).toBe("Article")

    const aluminumSet = findSetByName(sets, "Aluminum")
    expect(aluminumSet).toBeDefined()
  })

  it("creates a single unnamed set when no content requirements exist", () => {
    const tariffs = getTariffs("CN", "0101.21.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = []
    const sets = getTariffSets(tariffs, contentReqs)

    expect(sets.length).toBe(1)
    expect(sets[0].name).toBe("")
  })
})

// ============================================================
// 6. Section 122 — 9903.03.06 exemption for metal content tariffs
//    This is the core regression test for the bug fixed today.
// ============================================================
describe("Section 122 exemption (9903.03.06) for metal content tariffs", () => {
  it("9903.03.06 is active in the Aluminum Content set for HTS 2203.00.00", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const aluminumSet = findSetByName(sets, "Aluminum")!

    const exemption = findInSet(aluminumSet, "9903.03.06")
    expect(exemption).toBeDefined()
    expect(exemption!.isActive).toBe(true)
  })

  it("9903.85.08 is active in the Aluminum Content set for HTS 2203.00.00", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const aluminumSet = findSetByName(sets, "Aluminum")!

    const derivative = findInSet(aluminumSet, "9903.85.08")
    expect(derivative).toBeDefined()
    expect(derivative!.isActive).toBe(true)
  })

  it("9903.03.01 is NOT active in the Aluminum Content set when 9903.03.06 is active", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const aluminumSet = findSetByName(sets, "Aluminum")!

    const baseTariff = findInSet(aluminumSet, "9903.03.01")
    if (baseTariff) {
      // In the content req set, 9903.03.06 IS active, so 9903.03.01 should be deactivated
      expect(baseTariff.isActive).toBe(false)
    }
  })

  it("9903.03.01 stays active in Article set (9903.03.06 inclusion tariffs are not in Article set)", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const articleSet = sets[0]

    const baseTariff = findInSet(articleSet, "9903.03.01")
    if (baseTariff) {
      // In the Article set, metal content tariffs are excluded, so 9903.03.06's
      // inclusions aren't found, making it inactive → 9903.03.01 stays active
      expect(baseTariff.isActive).toBe(true)
    }
  })

  it("9903.03.06 is active for aluminum primary product codes (7601)", () => {
    const tariffs = getTariffs("CN", "7601.10.60")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const aluminumSet = findSetByName(sets, "Aluminum")!

    const exemption = findInSet(aluminumSet, "9903.03.06")
    expect(exemption).toBeDefined()
    expect(exemption!.isActive).toBe(true)
  })

  it("9903.03.06 is active for UK + aluminum code (via 9903.85.12)", () => {
    const tariffs = getTariffs("GB", "7601.10.60")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const aluminumSet = findSetByName(sets, "Aluminum")!

    const exemption = findInSet(aluminumSet, "9903.03.06")
    expect(exemption).toBeDefined()
    expect(exemption!.isActive).toBe(true)
  })
})

// ============================================================
// 7. Section 122 — 9903.03.06 for iron & steel content tariffs
// ============================================================
describe("Section 122 exemption (9903.03.06) for iron & steel content tariffs", () => {
  it("9903.03.06 is active in the Steel Content set for a steel HTS code", () => {
    // 7208.10.15 is a flat-rolled iron/steel product
    const tariffs = getTariffs("CN", "7208.10.15")
    const hasSteelTariff = tariffs.some(
      (t) => t.contentRequirement?.content === "Steel"
    )
    if (!hasSteelTariff) return // skip if no steel tariffs found for this code

    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Steel", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const steelSet = findSetByName(sets, "Steel")

    if (steelSet) {
      const exemption = findInSet(steelSet, "9903.03.06")
      if (exemption) {
        expect(exemption.isActive).toBe(true)
      }
    }
  })
})

// ============================================================
// 8. Article tariff set — metal content tariffs excluded
// ============================================================
describe("getArticleTariffSet — excludes metal content tariffs", () => {
  it("Article set does not contain tariffs with contentRequirement", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const articleSet = sets[0]

    const contentTariffs = articleSet.tariffs.filter(
      (t) => (t as any).contentRequirement
    )
    expect(contentTariffs.length).toBe(0)
  })

  it("Article set contains section 122 base tariff (9903.03.01)", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const articleSet = sets[0]

    const base122 = findInSet(articleSet, "9903.03.01")
    expect(base122).toBeDefined()
  })
})

// ============================================================
// 9. Content requirement tariff sets — includes both metal and non-metal tariffs
// ============================================================
describe("getContentRequirementTariffSets — composition", () => {
  it("Aluminum Content set contains both aluminum tariffs and non-content tariffs", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const aluminumSet = findSetByName(sets, "Aluminum")!

    // Should contain aluminum derivative tariff
    expect(findInSet(aluminumSet, "9903.85.08")).toBeDefined()
    // Should also contain non-content tariffs like 9903.03.06
    expect(findInSet(aluminumSet, "9903.03.06")).toBeDefined()
    // Should contain the section 122 base too
    expect(findInSet(aluminumSet, "9903.03.01")).toBeDefined()
  })
})

// ============================================================
// 10. requiresReview tariffs
// ============================================================
describe("requiresReview tariffs are always inactive", () => {
  it("9903.85.09 (smelted/cast in US) is inactive due to requiresReview", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.85.09")!
    expect(tariff.requiresReview).toBe(true)

    const result = tariffIsActive(tariff, [])
    expect(result).toBe(false)
  })

  it("9903.03.02 (in-transit exemption) is inactive due to requiresReview", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.03.02")!
    expect(tariff.requiresReview).toBe(true)

    const result = tariffIsActive(tariff, [])
    expect(result).toBe(false)
  })
})

// ============================================================
// 11. Edge cases and specific HTS codes
// ============================================================
describe("Edge cases", () => {
  it("Russian aluminum gets 200% tariff (9903.85.67)", () => {
    const tariffs = getTariffs("RU", "7601.10.60")
    const codes = tariffs.map((t) => t.code)
    expect(codes).toContain("9903.85.67")

    const russianTariff = tariffs.find((t) => t.code === "9903.85.67")!
    expect(russianTariff.general).toBe(200)
  })

  it("Section232MetalTariffs list contains expected codes", () => {
    expect(Section232MetalTariffs).toContain("9903.85.08")
    expect(Section232MetalTariffs).toContain("9903.85.02")
    expect(Section232MetalTariffs).toContain("9903.81.87")
    expect(Section232MetalTariffs).toContain("9903.78.01")
  })

  it("tariffIsActive handles tariff with both exceptions and inclusions", () => {
    const tariff: TariffI = {
      code: "BOTH.01",
      description: "Has both",
      name: "Both",
      general: 10,
      special: 10,
      other: 10,
      exceptions: ["EXC.01"],
      inclusions: { tariffs: ["INC.01"] },
    }
    const exc: UITariff = {
      code: "EXC.01",
      description: "",
      name: "",
      general: 0,
      special: 0,
      other: 0,
      isActive: false,
      inclusions: { codes: ["*"] },
    }
    const inc: UITariff = {
      code: "INC.01",
      description: "",
      name: "",
      general: 10,
      special: 10,
      other: 10,
      isActive: true,
      inclusions: { codes: ["*"] },
    }
    // No active exception + active inclusion → should be active
    expect(tariffIsActive(tariff, [exc, inc])).toBe(true)
  })

  it("tariffIsActive: active exception takes priority over active inclusion", () => {
    const tariff: TariffI = {
      code: "BOTH.02",
      description: "Has both",
      name: "Both",
      general: 10,
      special: 10,
      other: 10,
      exceptions: ["EXC.01"],
      inclusions: { tariffs: ["INC.01"] },
    }
    const exc: UITariff = {
      code: "EXC.01",
      description: "",
      name: "",
      general: 0,
      special: 0,
      other: 0,
      isActive: true,
      inclusions: { codes: ["*"] },
    }
    const inc: UITariff = {
      code: "INC.01",
      description: "",
      name: "",
      general: 10,
      special: 10,
      other: 10,
      isActive: true,
      inclusions: { codes: ["*"] },
    }
    // Active exception → should be inactive even with active inclusion
    expect(tariffIsActive(tariff, [exc, inc])).toBe(false)
  })
})

// ============================================================
// 12. Full integration: specific HTS codes end-to-end
// ============================================================
describe("Full integration — HTS 2203.00.00 (beer/aluminum derivative)", () => {
  it("produces correct tariff sets for China", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)

    // Should have Article + Aluminum Content sets
    expect(sets.length).toBeGreaterThanOrEqual(2)

    // Aluminum Content set checks
    const aluminumSet = findSetByName(sets, "Aluminum")!
    expect(aluminumSet).toBeDefined()

    const aluminumTariffs = aluminumSet.tariffs
    const activeCodes = aluminumTariffs
      .filter((t) => t.isActive)
      .map((t) => t.code)

    // 9903.85.08 should be active (derivative aluminum 19(k))
    expect(activeCodes).toContain("9903.85.08")
    // 9903.03.06 should be active (section 122 exemption for 232 articles)
    expect(activeCodes).toContain("9903.03.06")
  })

  it("9903.03.01 deactivated in Aluminum Content set due to active 9903.03.06 exception", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const aluminumSet = findSetByName(sets, "Aluminum")!

    const base122 = findInSet(aluminumSet, "9903.03.01")
    if (base122) {
      expect(base122.isActive).toBe(false)
    }
  })
})

describe("Full integration — HTS 7601.10.60 (unwrought aluminum)", () => {
  it("produces correct tariff sets for China with Aluminum content", () => {
    const tariffs = getTariffs("CN", "7601.10.60")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)

    const aluminumSet = findSetByName(sets, "Aluminum")!
    expect(aluminumSet).toBeDefined()

    // 9903.85.02 (primary aluminum 232) should be active
    const primaryAl = findInSet(aluminumSet, "9903.85.02")
    expect(primaryAl).toBeDefined()
    expect(primaryAl!.isActive).toBe(true)

    // 9903.03.06 (section 122 exemption) should be active
    const exemption = findInSet(aluminumSet, "9903.03.06")
    expect(exemption).toBeDefined()
    expect(exemption!.isActive).toBe(true)
  })
})
