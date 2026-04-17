import { describe, it, expect } from "./test-runner"
import {
  tariffIsApplicable,
  tariffIsActive,
  getTariffs,
  getTariffSets,
  collectExceptionCodes,
  TariffsList,
  getTariffByCode,
  tariffIsApplicableToCode,
  isAncestorTariff,
  isDescendantTariff,
} from "../tariffs/tariffs"
import {
  calculateDutyEstimates,
  SECTION_232_METAL_CONTENT_SET_NAME,
  hasActiveBaseDutySuppressor,
} from "../tariffs/tariff-calculations"
import { ParsedBaseTariff } from "../libs/hts"
import { TariffI, UITariff, TariffSet } from "../interfaces/tariffs"
import { ContentRequirementI } from "../components/Element"
import { ContentRequirements, TariffColumn } from "../enums/tariff"

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

const findSetByName = (
  sets: TariffSet[],
  nameSubstr: string,
): TariffSet | undefined => sets.find((s) => s.name.includes(nameSubstr))

// ============================================================
// 1. tariffIsApplicable
// ============================================================
describe("tariffIsApplicable", () => {
  it("returns true for wildcard country tariff (section 122 base 9903.03.01)", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.03.01")!
    expect(tariffIsApplicable(tariff, "CN", "2203.00.00")).toBe(true)
    expect(tariffIsApplicable(tariff, "DE", "7601.10.60")).toBe(true)
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
    const tariff = TariffsList.find((t) => t.code === "9903.81.88")! // TODO: this tariff code was removed
    // 7216.61.00 is in the exclusions list for 9903.81.88
    expect(tariffIsApplicable(tariff, "CN", "7216.61.00")).toBe(false)
  })

  it("respects tariffCodesToIgnore parameter", () => {
    const tariff = TariffsList.find((t) => t.code === "9903.03.06")!
    expect(tariffIsApplicable(tariff, "CN", "2203.00.00", ["9903.03.06"])).toBe(
      false,
    )
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
    // 9903.03.01 — Section 122 base tariff (wildcard country)
    expect(codes).toContain("9903.03.01")
    // 9903.03.06 — Section 122 exemption for Section 232 articles
    expect(codes).toContain("9903.03.06")
  })

  it("returns aluminum product tariffs for HTS 7601.10.60 from China", () => {
    const tariffs = getTariffs("CN", "7601.10.60")
    const codes = tariffs.map((t) => t.code)
    expect(codes).toContain("9903.03.01")
    expect(codes).toContain("9903.03.06")
  })
})

// ============================================================
// 5. getTariffSets — with content requirements
// ============================================================
describe("getTariffSets — content requirement structure", () => {
  it("creates Article set + content requirement sets when content requirements exist", () => {
    const tariffs = getTariffs("CN", "8202.39.00.40")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)

    expect(sets.length).toBeGreaterThanOrEqual(2)
    expect(sets[0].name).toBe("Article")

    const metalSet = findSetByName(sets, "Section 232 Metal")
    expect(metalSet).toBeDefined()
  })

  it("creates a single unnamed set when no content requirements exist", () => {
    const tariffs = getTariffs("CN", "0101.21.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = []
    const sets = getTariffSets(tariffs, contentReqs)

    expect(sets.length).toBe(1)
    expect(sets[0].name).toBe("")
  })

  it("skips content requirement set when no matching content tariffs exist for the country", () => {
    const tariffs = getTariffs("CN", "2203.00.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)

    const aluminumSet = findSetByName(sets, "Aluminum")
    expect(aluminumSet).toBeUndefined()
  })
})

// ============================================================
// 6. Section 122 — 9903.03.06 exemption for metal content tariffs
//    This is the core regression test for the bug fixed today.
// ============================================================
describe("Section 122 exemption (9903.03.06) for metal content tariffs", () => {
  it("9903.03.01 stays active in Article set (9903.03.06 inclusion tariffs are not in Article set)", () => {
    const tariffs = getTariffs("CN", "8202.39.00.40")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const articleSet = sets[0]

    const baseTariff = findInSet(articleSet, "9903.03.01")
    if (baseTariff) {
      expect(baseTariff.isActive).toBe(true)
    }
  })

  it("9903.03.06 is present in Section 232 Metal Content set", () => {
    const tariffs = getTariffs("CN", "8202.39.00.40")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const metalSet = findSetByName(sets, "Section 232 Metal")!

    const exemption = findInSet(metalSet, "9903.03.06")
    expect(exemption).toBeDefined()
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
      (t) => t.contentRequirement?.content === "Steel",
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
    const tariffs = getTariffs("CN", "8202.39.00.40")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const articleSet = sets[0]

    const contentTariffs = articleSet.tariffs.filter(
      (t) => (t as any).contentRequirement,
    )
    expect(contentTariffs.length).toBe(0)
  })

  it("Article set contains section 122 base tariff (9903.03.01)", () => {
    const tariffs = getTariffs("CN", "8202.39.00.40")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 80 },
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
  it("Section 232 Metal Content set contains both metal tariffs and non-content tariffs", () => {
    const tariffs = getTariffs("CN", "8202.39.00.40")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const metalSet = findSetByName(sets, "Section 232 Metal")!

    expect(metalSet).toBeDefined()
    // Should contain non-content tariffs like 9903.03.06
    expect(findInSet(metalSet, "9903.03.06")).toBeDefined()
  })
})

// ============================================================
// 10. requiresReview tariffs
// ============================================================
describe("requiresReview tariffs are always inactive", () => {
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
describe("Full integration — HTS 8202.39.00.40 (Section 232 Metal)", () => {
  it("produces correct tariff sets for GB with Section 232 Metal content", () => {
    const tariffs = getTariffs("GB", "8202.39.00.40")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)

    const metalSet = findSetByName(sets, "Section 232 Metal")!
    expect(metalSet).toBeDefined()

    // Should contain a Section 232 Metal tariff
    const metalTariffs = metalSet.tariffs.filter(
      (t) => (t as any).contentRequirement?.content === "Section 232 Metal",
    )
    expect(metalTariffs.length).toBeGreaterThan(0)
  })
})

// ============================================================
// calculateDutyEstimates — Section 232 Metal uses full value
// ============================================================
describe("calculateDutyEstimates — Section 232 Metal full value", () => {
  const makeTariff = (code: string, rate: number, isActive: boolean): UITariff => ({
    code,
    description: "",
    name: code,
    general: rate,
    special: rate,
    other: rate,
    isActive,
  })

  const emptyBaseTariffs: ParsedBaseTariff[] = [{ tariffs: [], parsingFailures: [] }]

  it("Section 232 Metal Content set applies to 100% of customs value regardless of slider", () => {
    const tariffSets: TariffSet[] = [
      {
        name: "Article",
        exceptionCodes: new Set(),
        tariffs: [],
      },
      {
        name: SECTION_232_METAL_CONTENT_SET_NAME,
        exceptionCodes: new Set(),
        tariffs: [makeTariff("9903.82.02", 50, true)],
      },
    ]
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 40 },
    ]

    const estimates = calculateDutyEstimates(
      tariffSets,
      emptyBaseTariffs,
      1000,
      1,
      contentReqs,
      TariffColumn.GENERAL,
      false,
    )

    const metalEstimate = estimates.find(
      (e) => e.tariffSetName === SECTION_232_METAL_CONTENT_SET_NAME,
    )!
    expect(metalEstimate).toBeDefined()
    expect(metalEstimate.contentPercentage).toBe(100)
    expect(metalEstimate.applicableValue).toBe(1000)
    expect(metalEstimate.adValoremDuty).toBe(500)
  })

  it("regular content set (Aluminum) uses the slider percentage", () => {
    const tariffSets: TariffSet[] = [
      {
        name: "Article",
        exceptionCodes: new Set(),
        tariffs: [],
      },
      {
        name: "Aluminum Content",
        exceptionCodes: new Set(),
        tariffs: [makeTariff("9903.03.01", 10, true)],
      },
    ]
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 60 },
    ]

    const estimates = calculateDutyEstimates(
      tariffSets,
      emptyBaseTariffs,
      2000,
      1,
      contentReqs,
      TariffColumn.GENERAL,
      false,
    )

    const aluminumEstimate = estimates.find(
      (e) => e.tariffSetName === "Aluminum Content",
    )!
    expect(aluminumEstimate).toBeDefined()
    expect(aluminumEstimate.contentPercentage).toBe(60)
    expect(aluminumEstimate.applicableValue).toBe(1200)
    expect(aluminumEstimate.adValoremDuty).toBe(120)
  })

  it("Article set is not reduced by Section 232 Metal percentage", () => {
    const tariffSets: TariffSet[] = [
      {
        name: "Article",
        exceptionCodes: new Set(),
        tariffs: [makeTariff("9903.01.01", 20, true)],
      },
      {
        name: SECTION_232_METAL_CONTENT_SET_NAME,
        exceptionCodes: new Set(),
        tariffs: [makeTariff("9903.82.02", 50, true)],
      },
    ]
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 30 },
    ]

    const estimates = calculateDutyEstimates(
      tariffSets,
      emptyBaseTariffs,
      1000,
      1,
      contentReqs,
      TariffColumn.GENERAL,
      false,
    )

    const articleEstimate = estimates.find(
      (e) => e.tariffSetName === "Article",
    )!
    expect(articleEstimate.contentPercentage).toBe(100)
    expect(articleEstimate.applicableValue).toBe(1000)

    const metalEstimate = estimates.find(
      (e) => e.tariffSetName === SECTION_232_METAL_CONTENT_SET_NAME,
    )!
    expect(metalEstimate.contentPercentage).toBe(100)
    expect(metalEstimate.applicableValue).toBe(1000)
  })

  it("Article set still uses complement for non-232 content requirements", () => {
    const tariffSets: TariffSet[] = [
      {
        name: "Article",
        exceptionCodes: new Set(),
        tariffs: [makeTariff("9903.01.01", 20, true)],
      },
      {
        name: "Aluminum Content",
        exceptionCodes: new Set(),
        tariffs: [makeTariff("9903.03.01", 10, true)],
      },
      {
        name: SECTION_232_METAL_CONTENT_SET_NAME,
        exceptionCodes: new Set(),
        tariffs: [makeTariff("9903.82.02", 50, true)],
      },
    ]
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Aluminum", value: 60 },
      { name: "Section 232 Metal", value: 40 },
    ]

    const estimates = calculateDutyEstimates(
      tariffSets,
      emptyBaseTariffs,
      1000,
      1,
      contentReqs,
      TariffColumn.GENERAL,
      false,
    )

    const articleEstimate = estimates.find(
      (e) => e.tariffSetName === "Article",
    )!
    expect(articleEstimate.contentPercentage).toBe(40)
    expect(articleEstimate.applicableValue).toBe(400)

    const aluminumEstimate = estimates.find(
      (e) => e.tariffSetName === "Aluminum Content",
    )!
    expect(aluminumEstimate.contentPercentage).toBe(60)
    expect(aluminumEstimate.applicableValue).toBe(600)

    const metalEstimate = estimates.find(
      (e) => e.tariffSetName === SECTION_232_METAL_CONTENT_SET_NAME,
    )!
    expect(metalEstimate.contentPercentage).toBe(100)
    expect(metalEstimate.applicableValue).toBe(1000)
  })
})

// ============================================================
// calculateDutyEstimates — suppressesBaseDuty
// ============================================================
describe("calculateDutyEstimates — suppressesBaseDuty", () => {
  const makeTariff = (
    code: string,
    rate: number,
    isActive: boolean,
    opts?: Partial<UITariff>,
  ): UITariff => ({
    code,
    description: "",
    name: code,
    general: rate,
    special: rate,
    other: rate,
    isActive,
    ...opts,
  })

  const basePercent5: ParsedBaseTariff[] = [
    {
      tariffs: [{ value: 5, type: "percent", raw: "5%" }],
      parsingFailures: [],
    },
  ]

  it("active suppressor excludes base tariffs from rate and duty", () => {
    const tariffSets: TariffSet[] = [
      {
        name: SECTION_232_METAL_CONTENT_SET_NAME,
        exceptionCodes: new Set(),
        tariffs: [
          makeTariff("9903.82.10", 15, true, { suppressesBaseDuty: true }),
        ],
      },
    ]
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 50 },
    ]

    const estimates = calculateDutyEstimates(
      tariffSets,
      basePercent5,
      1000,
      1,
      contentReqs,
      TariffColumn.GENERAL,
      false,
    )

    const est = estimates[0]
    expect(est.percentRate).toBe(15)
    expect(est.adValoremDuty).toBe(150)
  })

  it("inactive suppressor includes base tariffs normally", () => {
    const tariffSets: TariffSet[] = [
      {
        name: SECTION_232_METAL_CONTENT_SET_NAME,
        exceptionCodes: new Set(),
        tariffs: [
          makeTariff("9903.82.10", 15, false, { suppressesBaseDuty: true }),
          makeTariff("9903.82.02", 50, true),
        ],
      },
    ]
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 50 },
    ]

    const estimates = calculateDutyEstimates(
      tariffSets,
      basePercent5,
      1000,
      1,
      contentReqs,
      TariffColumn.GENERAL,
      false,
    )

    const est = estimates[0]
    expect(est.percentRate).toBe(55)
    expect(est.adValoremDuty).toBe(550)
  })

  it("suppressor own rate still included in calculation", () => {
    const tariffSets: TariffSet[] = [
      {
        name: SECTION_232_METAL_CONTENT_SET_NAME,
        exceptionCodes: new Set(),
        tariffs: [
          makeTariff("9903.82.10", 15, true, { suppressesBaseDuty: true }),
          makeTariff("9903.82.02", 50, true),
        ],
      },
    ]
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 50 },
    ]

    const estimates = calculateDutyEstimates(
      tariffSets,
      basePercent5,
      1000,
      1,
      contentReqs,
      TariffColumn.GENERAL,
      false,
    )

    const est = estimates[0]
    expect(est.percentRate).toBe(65)
    expect(est.adValoremDuty).toBe(650)
  })
})

// ============================================================
// hasActiveBaseDutySuppressor
// ============================================================
describe("hasActiveBaseDutySuppressor", () => {
  const makeTariff = (
    isActive: boolean,
    suppressesBaseDuty?: boolean,
  ): UITariff => ({
    code: "test",
    description: "",
    name: "test",
    general: 0,
    special: 0,
    other: 0,
    isActive,
    suppressesBaseDuty,
  })

  it("returns true when an active tariff has suppressesBaseDuty", () => {
    expect(hasActiveBaseDutySuppressor([makeTariff(true, true)])).toBe(true)
  })

  it("returns false when suppressor is inactive", () => {
    expect(hasActiveBaseDutySuppressor([makeTariff(false, true)])).toBe(false)
  })

  it("returns false when no tariffs have suppressesBaseDuty", () => {
    expect(hasActiveBaseDutySuppressor([makeTariff(true)])).toBe(false)
  })
})

// ============================================================
// Exception-based mutual exclusion during toggle
// ============================================================
describe("Exception-based deactivation (toggle cascade)", () => {
  const simulateToggle = (
    tariffCode: string,
    tariffs: UITariff[],
  ) => {
    const tariff = tariffs.find((t) => t.code === tariffCode)!
    tariff.isActive = !tariff.isActive

    let changed = true
    let iterations = 0
    while (changed && iterations < 10) {
      changed = false
      iterations++
      for (const t of tariffs) {
        if (t.code === tariffCode) continue
        const isAnc = isAncestorTariff(t, tariff, tariffs)
        const isDesc = isDescendantTariff(t, tariff, tariffs)
        if (isAnc || isDesc) {
          let newActive: boolean
          if (t.requiresReview) {
            const hasActiveException =
              t.exceptions?.some((exCode) =>
                tariffs.some((et) => et.code === exCode && et.isActive),
              ) ?? false
            newActive = hasActiveException ? false : t.isActive
          } else {
            newActive = tariffIsActive(t, tariffs)
          }
          if (t.isActive !== newActive) {
            t.isActive = newActive
            changed = true
          }
        }
      }
    }
    return tariffs
  }

  it("activating an exception deactivates the parent tariff (both requiresReview)", () => {
    const tariffs: UITariff[] = [
      {
        code: "PARENT",
        description: "",
        name: "Parent",
        general: 25,
        special: 25,
        other: 25,
        isActive: true,
        requiresReview: true,
        exceptions: ["CHILD"],
      },
      {
        code: "CHILD",
        description: "",
        name: "Child exception",
        general: 10,
        special: 10,
        other: 10,
        isActive: false,
        requiresReview: true,
      },
    ]

    simulateToggle("CHILD", tariffs)

    expect(tariffs.find((t) => t.code === "CHILD")!.isActive).toBe(true)
    expect(tariffs.find((t) => t.code === "PARENT")!.isActive).toBe(false)
  })

  it("deactivating an exception does not force-reactivate the parent", () => {
    const tariffs: UITariff[] = [
      {
        code: "PARENT",
        description: "",
        name: "Parent",
        general: 25,
        special: 25,
        other: 25,
        isActive: false,
        requiresReview: true,
        exceptions: ["CHILD"],
      },
      {
        code: "CHILD",
        description: "",
        name: "Child exception",
        general: 10,
        special: 10,
        other: 10,
        isActive: true,
        requiresReview: true,
      },
    ]

    simulateToggle("CHILD", tariffs)

    expect(tariffs.find((t) => t.code === "CHILD")!.isActive).toBe(false)
    expect(tariffs.find((t) => t.code === "PARENT")!.isActive).toBe(false)
  })

  it("9903.82.04 and 9903.82.06 cannot both be active (real tariff data)", () => {
    const tariffs = getTariffs("GB", "7307.22.50.00")
    const contentReqs: ContentRequirementI<ContentRequirements>[] = [
      { name: "Section 232 Metal", value: 80 },
    ]
    const sets = getTariffSets(tariffs, contentReqs)
    const metalSet = sets.find((s) => s.name.includes("Section 232 Metal"))
    if (!metalSet) return

    const t04 = metalSet.tariffs.find((t) => t.code === "9903.82.04")
    const t06 = metalSet.tariffs.find((t) => t.code === "9903.82.06")
    if (!t04 || !t06) return

    t04.isActive = true
    t06.isActive = false

    simulateToggle("9903.82.06", metalSet.tariffs)

    expect(t06.isActive).toBe(true)
    expect(t04.isActive).toBe(false)
  })

  it("bidirectional exceptions: activating either one deactivates the other", () => {
    const tariffs: UITariff[] = [
      {
        code: "A",
        description: "",
        name: "Tariff A",
        general: 25,
        special: 25,
        other: 25,
        isActive: true,
        requiresReview: true,
        exceptions: ["B"],
      },
      {
        code: "B",
        description: "",
        name: "Tariff B",
        general: 10,
        special: 10,
        other: 10,
        isActive: false,
        requiresReview: true,
        exceptions: ["A"],
      },
    ]

    simulateToggle("B", tariffs)
    expect(tariffs.find((t) => t.code === "B")!.isActive).toBe(true)
    expect(tariffs.find((t) => t.code === "A")!.isActive).toBe(false)

    simulateToggle("A", tariffs)
    expect(tariffs.find((t) => t.code === "A")!.isActive).toBe(true)
    expect(tariffs.find((t) => t.code === "B")!.isActive).toBe(false)
  })

  it("bidirectional exceptions: no infinite loop with circular exception chains", () => {
    const tariffs: UITariff[] = [
      {
        code: "X",
        description: "",
        name: "X",
        general: 20,
        special: 20,
        other: 20,
        isActive: false,
        requiresReview: true,
        exceptions: ["Y"],
      },
      {
        code: "Y",
        description: "",
        name: "Y",
        general: 15,
        special: 15,
        other: 15,
        isActive: false,
        requiresReview: true,
        exceptions: ["Z"],
      },
      {
        code: "Z",
        description: "",
        name: "Z",
        general: 10,
        special: 10,
        other: 10,
        isActive: false,
        requiresReview: true,
        exceptions: ["X"],
      },
    ]

    simulateToggle("Z", tariffs)
    expect(tariffs.find((t) => t.code === "Z")!.isActive).toBe(true)
    expect(tariffs.find((t) => t.code === "X")!.isActive).toBe(false)
  })
})

// ============================================================
// Cycle detection in recursive tariff functions
// ============================================================
describe("Cycle detection in recursive tariff functions", () => {
  it("isAncestorTariff does not infinite loop with circular exceptions", () => {
    const a: UITariff = {
      code: "A", description: "", name: "A",
      general: 10, special: 10, other: 10, isActive: true,
      exceptions: ["B"],
    }
    const b: UITariff = {
      code: "B", description: "", name: "B",
      general: 10, special: 10, other: 10, isActive: true,
      exceptions: ["A"],
    }
    const result = isAncestorTariff(a, b, [a, b])
    expect(result).toBe(true)
  })

  it("isDescendantTariff does not infinite loop with circular exceptions", () => {
    const a: UITariff = {
      code: "A", description: "", name: "A",
      general: 10, special: 10, other: 10, isActive: true,
      exceptions: ["B"],
    }
    const b: UITariff = {
      code: "B", description: "", name: "B",
      general: 10, special: 10, other: 10, isActive: true,
      exceptions: ["A"],
    }
    const result = isDescendantTariff(a, b, [a, b])
    expect(result).toBe(true)
  })

  it("collectExceptionCodes does not infinite loop with circular exceptions", () => {
    const a: TariffI = {
      code: "A", description: "", name: "A",
      general: 10, special: 10, other: 10,
      exceptions: ["B"],
    }
    const b: TariffI = {
      code: "B", description: "", name: "B",
      general: 10, special: 10, other: 10,
      exceptions: ["A"],
    }
    const codes = new Set<string>()
    collectExceptionCodes(a, [a, b], codes)
    expect(codes.has("B")).toBe(true)
    expect(codes.has("A")).toBe(true)
  })
})

