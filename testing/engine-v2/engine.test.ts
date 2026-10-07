// Engine-v2 mechanics, tested with small synthetic rule sets so each capability is
// checked in isolation. Real-data tests are in real-data.test.ts.
import { describe, it, expect } from "../test-runner"
import { calculate } from "../../tariffs/engine-v2/calculate"
import { codeListVersions, tariffVersions } from "../../tariffs/engine-v2/versioning"
import { validateRules } from "../../tariffs/engine-v2/validate"
import {
  CalculationInput,
  CodeList,
  Interaction,
  RuleSet,
  Tariff,
} from "../../tariffs/engine-v2/types"

// ── Helpers ──

const tariff = (overrides: Partial<Tariff> & { code: string }): Tariff => ({
  program: "p-a",
  name: overrides.code,
  description: "",
  scope: { countries: "all", codes: "all" },
  rate: { kind: "adValorem", pct: 10 },
  effective: {},
  ...overrides,
})

const rules = (overrides: Partial<RuleSet> = {}): RuleSet => ({
  programs: [
    { id: "p-a", name: "Program A", authority: "232" },
    { id: "p-b", name: "Program B", authority: "301" },
    { id: "p-c", name: "Program C", authority: "122" },
  ],
  tariffs: [],
  lists: [],
  interactions: [],
  columnAssignments: [{ country: "RU", column: "column2", effective: {} }],
  preferences: [{ symbol: "S", name: "USMCA", countries: ["CA", "MX"], effective: {} }],
  fees: [],
  inputs: [
    { id: "confirmed", label: "Confirmed?", type: "boolean" },
    { id: "loadingDate", label: "Loading date", type: "date" },
    { id: "steelContentPct", label: "Steel %", type: "percent" },
  ],
  ...overrides,
})

const input = (overrides: Partial<CalculationInput> = {}): CalculationInput => ({
  htsCode: "7326.90.86.88",
  country: "CN",
  asOf: "2026-04-10",
  customsValue: 10_000,
  quantity: 100,
  baseRates: { general: "2%", special: "Free (S)", other: "45%" },
  ...overrides,
})

const line = (result: ReturnType<typeof calculate>, code: string) =>
  result.lines.find((l) => l.code === code)

// ============================================================
// Dates and versions
// ============================================================
describe("engine-v2: effective dates", () => {
  const set = rules({
    tariffs: tariffVersions(tariff({ code: "T1", effective: { from: "2026-02-24" } }), [
      { from: "2026-06-01", set: { rate: { kind: "adValorem", pct: 15 } } },
      { from: "2026-07-24", ends: true },
    ]),
  })
  const on = (asOf: string) => calculate(set, input({ asOf, baseRates: { general: "Free", special: null, other: null } }))

  it("doesn't apply before it starts", () => {
    expect(line(on("2026-02-23"), "T1")).toBeUndefined()
  })
  it("applies the rate in effect on the date", () => {
    expect(line(on("2026-02-24"), "T1").amount).toBe(1000)
    expect(line(on("2026-06-01"), "T1").amount).toBe(1500)
  })
  it("stops applying on its end date", () => {
    expect(line(on("2026-07-23"), "T1").amount).toBe(1500)
    expect(line(on("2026-07-24"), "T1")).toBeUndefined()
  })
})

describe("engine-v2: code lists change without changing the tariff", () => {
  const list: CodeList = codeListVersions(
    { id: "L1", kind: "hts", description: "", codes: ["7326"], effective: {} },
    [{ from: "2026-05-01", add: ["8302"], remove: ["7326"] }],
  )
  const set = rules({
    lists: [list],
    tariffs: [tariff({ code: "T1", scope: { countries: "all", codes: [{ list: "L1" }] } })],
  })

  it("uses the list version in effect on the date", () => {
    expect(line(calculate(set, input({ asOf: "2026-04-10" })), "T1")?.status).toBe("applies")
    expect(line(calculate(set, input({ asOf: "2026-05-02" })), "T1")).toBeUndefined()
    expect(
      line(calculate(set, input({ asOf: "2026-05-02", htsCode: "8302.41.60.15" })), "T1")?.status,
    ).toBe("applies")
  })
})

// ============================================================
// Scope
// ============================================================
describe("engine-v2: scope matching", () => {
  const set = rules({
    lists: [{ id: "L1", kind: "hts", description: "", versions: [{ codes: ["9401.69.6031"], effective: {} }] }],
    tariffs: [
      tariff({ code: "PREFIX", scope: { countries: ["CN"], codes: ["7326.90"] } }),
      tariff({ code: "NODOTS", scope: { countries: "all", codes: [{ list: "L1" }] } }),
      tariff({ code: "EXCEPT-CA", scope: { countries: "all", excludeCountries: ["CA"], codes: "all" } }),
    ],
  })

  it("matches codes by digit prefix", () => {
    expect(line(calculate(set, input()), "PREFIX")?.status).toBe("applies")
    expect(line(calculate(set, input({ htsCode: "7326.11.00.00" })), "PREFIX")).toBeUndefined()
  })
  it("matches codes regardless of dot placement (legacy substring matching missed these)", () => {
    expect(line(calculate(set, input({ htsCode: "9401.69.60.31" })), "NODOTS")?.status).toBe("applies")
  })
  it("respects country scope and exclusions", () => {
    expect(line(calculate(set, input({ country: "VN" })), "PREFIX")).toBeUndefined()
    expect(line(calculate(set, input({ country: "CA" })), "EXCEPT-CA")).toBeUndefined()
    expect(line(calculate(set, input({ country: "VN" })), "EXCEPT-CA")?.status).toBe("applies")
  })
})

// ============================================================
// Conditions and inputs
// ============================================================
describe("engine-v2: usContentShare basis (U.S. note 16(j))", () => {
  const split = (usContentPct?: number) => {
    const set = rules({
      inputs: [{ id: "usContentPct", label: "U.S. content", type: "percent" }],
      tariffs: [
        tariff({ code: "REST", basis: { kind: "usContentShare", cap: 40, part: "rest" }, rate: { kind: "adValorem", pct: 25 } }),
        tariff({ code: "CAPPED", basis: { kind: "usContentShare", cap: 40, part: "upToCap" }, rate: { kind: "free" } }),
      ],
    })
    return calculate(set, input({ answers: usContentPct === undefined ? {} : { usContentPct } }))
  }
  it("puts U.S. content below the cap in the capped share", () => {
    expect(line(split(20), "CAPPED").basisValue).toBe(2000)
    expect(line(split(20), "REST").amount).toBe(2000) // 25% of 8,000
  })
  it("caps the capped share at 40% of the value; the rest takes the remainder", () => {
    expect(line(split(40), "CAPPED").basisValue).toBe(4000)
    expect(line(split(60), "CAPPED").basisValue).toBe(4000)
    expect(line(split(60), "REST").amount).toBe(1500) // 25% of 6,000
  })
  it("explains on each line which share of the value it covers", () => {
    expect(line(split(30), "CAPPED").reasons).toContain("Covers $3,000: U.S. content up to 40% of the value has no added duty. U.S. content is 30%")
    expect(line(split(30), "REST").reasons).toContain("Covers $7,000: everything except U.S. content up to 40% of the value. U.S. content is 30%")
  })
  it("needs an answer when U.S. content isn't given", () => {
    expect(line(split(), "REST").status).toBe("needsAnswer")
    expect(line(split(), "CAPPED").status).toBe("needsAnswer")
  })
})

describe("engine-v2: metalContentInChapters basis (notes 16 and 19 before April 6, 2026)", () => {
  const set = rules({
    tariffs: [
      tariff({ code: "STEEL", basis: { kind: "metalContentInChapters", metal: "steel", chapters: ["73"] }, rate: { kind: "adValorem", pct: 50 } }),
    ],
  })
  it("charges the steel content for chapter 73 goods", () => {
    const result = calculate(set, input({ htsCode: "7326.90.86.88", answers: { steelContentPct: 60 } }))
    expect(line(result, "STEEL").basisValue).toBe(6000)
    expect(line(result, "STEEL").amount).toBe(3000)
  })
  it("charges the full value outside the listed chapters, with or without a content answer", () => {
    expect(line(calculate(set, input({ htsCode: "7208.51.00.30" })), "STEEL").amount).toBe(5000)
    expect(line(calculate(set, input({ htsCode: "8708.10.30.50", answers: { steelContentPct: 20 } })), "STEEL").amount).toBe(5000)
  })
  it("needs an answer for chapter 73 goods when the steel content isn't given", () => {
    expect(line(calculate(set, input({ htsCode: "7326.90.86.88" })), "STEEL").status).toBe("needsAnswer")
  })
})

describe("engine-v2: metalContentCovered basis (note 2(aa)(v) before April 6, 2026)", () => {
  const set = rules({
    inputs: [
      { id: "steelContentPct", label: "Steel %", type: "percent" },
      { id: "aluminumContentPct", label: "Aluminum %", type: "percent" },
      { id: "confirmed", label: "Confirmed?", type: "boolean" },
    ],
    tariffs: [
      tariff({ code: "STEEL", rate: { kind: "adValorem", pct: 50 } }),
      tariff({ code: "ALU", requires: [{ kind: "answer", input: "confirmed", equals: true }], rate: { kind: "adValorem", pct: 50 } }),
      tariff({ code: "AUTO", scope: { countries: "all", codes: ["8703"] }, rate: { kind: "adValorem", pct: 25 } }),
      tariff({ code: "SURCHARGE", program: "p-c", exceptions: ["EXEMPT"] }),
      tariff({
        code: "EXEMPT",
        program: "p-c",
        scope: { countries: "all", codes: "all", whenApplies: { codes: ["STEEL", "ALU", "AUTO"] } },
        basis: { kind: "metalContentCovered", content: [{ metal: "steel", codes: ["STEEL"] }, { metal: "aluminum", codes: ["ALU"] }] },
        rate: { kind: "free" },
      }),
    ],
  })
  it("exempts only the steel content; the surcharge applies to the rest", () => {
    const result = calculate(set, input({ answers: { steelContentPct: 60 } }))
    expect(line(result, "EXEMPT").basisValue).toBe(6000)
    expect(line(result, "SURCHARGE").amount).toBe(400) // 10% of 4,000
  })
  it("adds the content of each metal whose headings apply, capped at the value", () => {
    const result = calculate(set, input({ answers: { confirmed: true, steelContentPct: 60, aluminumContentPct: 30 } }))
    expect(line(result, "EXEMPT").basisValue).toBe(9000)
    expect(line(result, "SURCHARGE").amount).toBe(100)
    const capped = calculate(set, input({ answers: { confirmed: true, steelContentPct: 80, aluminumContentPct: 50 } }))
    expect(line(capped, "EXEMPT").basisValue).toBe(10000)
    expect(line(capped, "SURCHARGE").status).toBe("excluded")
  })
  it("ignores metals whose headings don't apply", () => {
    const result = calculate(set, input({ answers: { steelContentPct: 60, aluminumContentPct: 30 } }))
    expect(line(result, "EXEMPT").basisValue).toBe(6000)
  })
  it("covers the full value when a trigger outside the metals applies", () => {
    const result = calculate(set, input({ htsCode: "8703.23.01.90", answers: { steelContentPct: 60 } }))
    expect(line(result, "EXEMPT").basisValue).toBe(10000)
    expect(line(result, "SURCHARGE").status).toBe("excluded")
  })
  it("needs an answer when the content isn't given, so the surcharge applies in full", () => {
    const result = calculate(set, input())
    expect(line(result, "EXEMPT").status).toBe("needsAnswer")
    expect(line(result, "SURCHARGE").amount).toBe(1000)
    expect(result.unansweredInputs.map((u) => u.input.id)).toContain("steelContentPct")
  })
})

describe("engine-v2: conditions", () => {
  const set = rules({
    tariffs: [
      tariff({ code: "MAIN", exceptions: ["EXEMPT"] }),
      tariff({
        code: "EXEMPT",
        rate: { kind: "free" },
        requires: [{ kind: "answer", input: "confirmed", equals: true }],
      }),
      tariff({
        code: "IN-TRANSIT",
        rate: { kind: "free" },
        requires: [{ kind: "dateBefore", input: "loadingDate", date: "2026-02-24" }],
      }),
    ],
  })

  it("treats an unanswered exemption as not applying, and says which input is needed", () => {
    const result = calculate(set, input())
    expect(line(result, "EXEMPT").status).toBe("needsAnswer")
    expect(line(result, "MAIN").status).toBe("applies")
    expect(result.unansweredInputs.map((u) => u.input.id)).toContain("confirmed")
  })
  it("applies the exemption once answered, which excludes the main heading", () => {
    const result = calculate(set, input({ answers: { confirmed: true } }))
    expect(line(result, "EXEMPT").status).toBe("applies")
    expect(line(result, "MAIN").status).toBe("excluded")
    expect(line(result, "MAIN").reasons).toContain("Excluded by EXEMPT")
  })
  it("decides date conditions from a date answer", () => {
    expect(line(calculate(set, input({ answers: { loadingDate: "2026-02-20" } })), "IN-TRANSIT").status).toBe("applies")
    expect(line(calculate(set, input({ answers: { loadingDate: "2026-02-25" } })), "IN-TRANSIT").status).toBe("notApplicable")
  })
  it("uses `assume` when an input is unanswered", () => {
    const assumed = rules({
      tariffs: [tariff({ code: "T", requires: [{ kind: "answer", input: "confirmed", equals: true, assume: true }] })],
    })
    expect(line(calculate(assumed, input()), "T").status).toBe("applies")
  })
})

// ============================================================
// 15% all-in deals and base-rate thresholds
// ============================================================
describe("engine-v2: topUpTo pairs", () => {
  const set = rules({
    tariffs: [
      tariff({ code: "AT-OR-ABOVE", rate: { kind: "free" }, requires: [{ kind: "baseRate", op: ">=", pct: 15 }] }),
      tariff({ code: "BELOW", rate: { kind: "topUpTo", pct: 15 }, requires: [{ kind: "baseRate", op: "<", pct: 15 }] }),
    ],
  })
  const total = (general: string, quantity = 100) =>
    calculate(set, input({ baseRates: { general, special: null, other: null }, quantity })).totalDuty

  it("tops a low base rate up to 15% in total", () => {
    expect(total("4.5%")).toBe(1500)
    expect(total("Free")).toBe(1500)
  })
  it("leaves a base rate of 15% or more alone", () => {
    expect(total("20%")).toBe(2000)
  })
  it("uses the per-shipment equivalent for specific rates, so quantity can change the heading", () => {
    // $0.50/kg on $10,000: 100 kg = 0.5%, 4,000 kg = 20%
    expect(total("$0.50/kg", 100)).toBe(1500)
    expect(total("$0.50/kg", 4000)).toBe(2000)
  })
})

// ============================================================
// Exceptions: whenApplies, partial, cycles
// ============================================================
describe("engine-v2: whenApplies and partial exceptions", () => {
  const set = (partial: boolean) =>
    rules({
      tariffs: [
        tariff({ code: "METAL", program: "p-a", basis: { kind: "metalContent", metal: "steel" }, rate: { kind: "adValorem", pct: 50 } }),
        tariff({ code: "SURCHARGE", program: "p-c", exceptions: ["EXEMPT-232"] }),
        tariff({
          code: "EXEMPT-232",
          program: "p-c",
          rate: { kind: "free" },
          scope: { countries: "all", codes: "all", whenApplies: { authorities: ["232"] } },
          basis: partial ? { kind: "coveredBy", selector: { authorities: ["232"] } } : undefined,
        }),
      ],
    })

  it("turns an exemption on only when its trigger applies", () => {
    const withoutAnswer = calculate(set(false), input())
    expect(line(withoutAnswer, "METAL").status).toBe("needsAnswer")
    expect(line(withoutAnswer, "EXEMPT-232").status).toBe("notApplicable")
    expect(line(withoutAnswer, "SURCHARGE").status).toBe("applies")
  })
  it("fully excludes with a full-value exemption", () => {
    const result = calculate(set(false), input({ answers: { steelContentPct: 60 } }))
    expect(line(result, "METAL").amount).toBe(3000)
    expect(line(result, "SURCHARGE").status).toBe("excluded")
  })
  it("excludes only the covered value with a partial exemption", () => {
    const result = calculate(set(true), input({ answers: { steelContentPct: 60 } }))
    expect(line(result, "EXEMPT-232").basisValue).toBe(6000)
    expect(line(result, "SURCHARGE").basisValue).toBe(4000)
    expect(line(result, "SURCHARGE").amount).toBe(400)
  })
})

describe("engine-v2: exception cycles", () => {
  const set = rules({
    tariffs: [
      tariff({ code: "A", exceptions: ["B"] }),
      tariff({ code: "B", exceptions: ["A"], requires: [{ kind: "answer", input: "confirmed", equals: true }] }),
    ],
  })

  it("settles when the other side is off", () => {
    expect(line(calculate(set, input()), "A").status).toBe("applies")
  })
  it("prefers the confirmed heading when both could apply", () => {
    const result = calculate(set, input({ answers: { confirmed: true } }))
    expect(line(result, "B").status).toBe("applies")
    expect(line(result, "A").status).toBe("excluded")
  })
  it("applies neither and warns when nothing breaks the cycle", () => {
    const unbreakable = rules({
      tariffs: [tariff({ code: "A", exceptions: ["B"] }), tariff({ code: "B", exceptions: ["A"] })],
    })
    const result = calculate(unbreakable, input())
    expect(line(result, "A").status).toBe("excluded")
    expect(line(result, "B").status).toBe("excluded")
    expect(result.warnings.length).toBe(1)
  })
})

// ============================================================
// Interactions
// ============================================================
describe("engine-v2: interactions", () => {
  const base = [
    tariff({ code: "A1", program: "p-a", rate: { kind: "adValorem", pct: 25 } }),
    tariff({ code: "B1", program: "p-b", rate: { kind: "adValorem", pct: 20 } }),
    tariff({ code: "C1", program: "p-c", rate: { kind: "adValorem", pct: 10 } }),
  ]
  const run = (interaction: Interaction) =>
    calculate(rules({ tariffs: base, interactions: [interaction] }), input({ baseRates: { general: "Free", special: null, other: null } }))

  it("noStack keeps the first program that applies and drops later ones", () => {
    const result = run({ id: "ns", kind: "noStack", description: "A over B", order: [{ programs: ["p-a"] }, { programs: ["p-b"] }], effective: {} })
    expect(line(result, "A1").status).toBe("applies")
    expect(line(result, "B1").status).toBe("excluded")
    expect(line(result, "C1").status).toBe("applies")
  })
  it("excludePortion removes the winner's value from the losers", () => {
    const result = calculate(
      rules({
        tariffs: [
          tariff({ code: "M", program: "p-a", basis: { kind: "metalContent", metal: "steel" }, rate: { kind: "adValorem", pct: 50 } }),
          tariff({ code: "C1", program: "p-c" }),
        ],
        interactions: [{ id: "ep", kind: "excludePortion", description: "C not on A's value", winner: { programs: ["p-a"] }, losers: { programs: ["p-c"] }, effective: {} }],
      }),
      input({ answers: { steelContentPct: 60 } }),
    )
    expect(line(result, "C1").basisValue).toBe(4000)
  })
  it("capTotal limits the combined duty of the covered programs", () => {
    const result = run({ id: "cap", kind: "capTotal", description: "A+B max 30%", pct: 30, covers: { programs: ["p-a", "p-b"] }, includesBaseRate: false, effective: {} })
    const covered = line(result, "A1").amount + line(result, "B1").amount
    expect(Math.round(covered)).toBe(3000)
    expect(line(result, "C1").amount).toBe(1000)
  })
})

// ============================================================
// Columns, preferences, fees
// ============================================================
describe("engine-v2: columns and preferences", () => {
  const set = rules({
    tariffs: [tariff({ code: "T", rateByColumn: { column2: { kind: "free" }, special: { kind: "adValorem", pct: 5 } } })],
    fees: [{ id: "mpf", name: "MPF", ratePct: 0.3464, min: 33.58, max: 651.5, effective: {} }],
  })

  it("uses Column 2 for Column 2 countries", () => {
    const result = calculate(set, input({ country: "RU" }))
    expect(result.column).toBe("column2")
    expect(result.base.amount).toBe(4500)
    expect(line(result, "T").amount).toBe(0)
  })
  it("uses the special column when an available preference is claimed", () => {
    const result = calculate(set, input({ country: "MX", claimedPreference: "S" }))
    expect(result.column).toBe("special")
    expect(result.base.amount).toBe(0)
    expect(line(result, "T").amount).toBe(500)
  })
  it("ignores a preference that isn't available and warns", () => {
    const result = calculate(set, input({ country: "CN", claimedPreference: "S" }))
    expect(result.column).toBe("general")
    expect(result.warnings.length).toBe(1)
  })
  it("allows a USMCA claim on a line that's free under General with no special column", () => {
    const freeLine: CalculationInput["baseRates"] = { general: "Free", special: null, other: "20%" }
    const claimed = calculate(set, input({ country: "MX", claimedPreference: "S", baseRates: freeLine }))
    expect(claimed.column).toBe("special")
    expect(claimed.base.amount).toBe(0)
    expect(claimed.availablePreferences.map((p) => p.symbol)).toEqual(["S"])
    // Still only for USMCA countries
    expect(calculate(set, input({ country: "CN", claimedPreference: "S", baseRates: freeLine })).column).toBe("general")
  })
  it("doesn't add USMCA to a special column that lists other programs only", () => {
    const result = calculate(set, input({ country: "MX", claimedPreference: "S", baseRates: { general: "Free", special: "Free (KR)", other: "20%" } }))
    expect(result.column).toBe("general")
    expect(result.warnings.length).toBe(1)
  })
  it("charges HMF only on ocean shipments", () => {
    const withHmf = rules({
      fees: [
        { id: "mpf", name: "MPF", ratePct: 0.3464, min: 33.58, max: 651.5, effective: {} },
        { id: "hmf", name: "HMF", ratePct: 0.125, modes: ["ocean"], effective: {} },
      ],
    })
    const feeIds = (transportMode?: "ocean" | "air" | "truck" | "rail") =>
      calculate(withHmf, input({ transportMode })).fees.map((f) => f.id)
    expect(feeIds("ocean")).toEqual(["mpf", "hmf"])
    expect(feeIds("air")).toEqual(["mpf"])
    expect(feeIds("truck")).toEqual(["mpf"])
    expect(feeIds()).toEqual(["mpf", "hmf"])
  })

  it("notes that entries under $2,500 may be informal", () => {
    expect(calculate(set, input({ customsValue: 1000 })).fees[0].note.includes("informal")).toBe(true)
    expect(calculate(set, input({ customsValue: 10_000 })).fees[0].note).toBeUndefined()
  })

  it("says when the base rate needs a quantity", () => {
    expect(calculate(set, input()).requiresQuantity).toBe(false)
    expect(calculate(set, input({ baseRates: { general: "3.3¢/kg", special: null, other: null } })).requiresQuantity).toBe(true)
  })

  it("applies fee minimums and maximums", () => {
    expect(calculate(set, input({ customsValue: 1000 })).fees[0].amount).toBe(33.58)
    expect(calculate(set, input({ customsValue: 1_000_000 })).fees[0].amount).toBe(651.5)
  })
})

// ============================================================
// Base rates that apply to part of the article
// ============================================================
describe("engine-v2: partial-value base rates", () => {
  const set = rules()
  const watch = (answers = {}, customsValue = 10_000) =>
    calculate(
      set,
      input({
        customsValue,
        quantity: 1000,
        answers,
        baseRates: { general: "24¢ each + 4.5% on the case + 3.5% on the battery", special: null, other: null },
      }),
    )

  it("uses the whole value for each component until it's given (unchanged from before)", () => {
    const result = watch()
    expect(result.base.amount).toBe(240 + 450 + 350)
    expect(result.baseParts.filter((p) => p.assumed).length).toBe(2)
    expect(result.unansweredInputs.map((u) => u.input.id)).toEqual(["baseValue:case", "baseValue:battery"])
  })

  it("applies each percentage to its component's value once given", () => {
    const result = watch({ "baseValue:case": 2000, "baseValue:battery": 100 })
    // 24¢ × 1,000 + 4.5% × $2,000 + 3.5% × $100
    expect(Math.round(result.base.amount * 100) / 100).toBe(240 + 90 + 3.5)
    expect(result.baseParts.some((p) => p.assumed)).toBe(false)
  })

  it("uses the component values in the base rate equivalent", () => {
    const result = watch({ "baseValue:case": 2000, "baseValue:battery": 100 })
    expect(Math.round(result.baseRateEquivalentPct * 1000) / 1000).toBe(3.335)
  })

  it("warns when a component is worth more than the whole article", () => {
    expect(watch({ "baseValue:case": 20_000 }).warnings.length).toBe(1)
  })

  it("applies amounts on a component's weight to that weight", () => {
    const lead = (answers = {}) =>
      calculate(set, input({ quantity: 500, answers, baseRates: { general: "1.7¢/kg on lead content", special: null, other: null } }))
    const cents = (n: number) => Math.round(n * 100) / 100
    expect(cents(lead().base.amount)).toBe(8.5) // total quantity until given
    expect(cents(lead({ "baseQuantity:lead-content": 100 }).base.amount)).toBe(1.7)
  })

  it("parses rates with a missing space after '+' instead of dropping a part", () => {
    const result = calculate(
      set,
      input({ quantity: 100, baseRates: { general: "5.7¢/kg on drained weight +8%", special: null, other: null } }),
    )
    expect(result.baseParts.length).toBe(2)
    expect(Math.round(result.base.amount * 100) / 100).toBe(5.7 + 800)
  })

  it("parses proof-liter rates", () => {
    const result = calculate(set, input({ quantity: 100, baseRates: { general: "18.9¢/pf.liter", special: null, other: null } }))
    expect(Math.round(result.base.amount * 100) / 100).toBe(18.9)
    expect(result.baseParts[0].unit).toBe("proof liter")
  })

  it("treats a rate 'on the entire set' as the whole value", () => {
    const result = calculate(set, input({ baseRates: { general: "6.5% on the entire set", special: null, other: null } }))
    expect(result.base.amount).toBe(650)
    expect(result.questions.length).toBe(0)
  })

  it("leaves plain rates unchanged", () => {
    const result = calculate(set, input({ quantity: 10, baseRates: { general: "3.3¢/kg + 2%", special: null, other: null } }))
    expect(Math.round(result.base.amount * 100) / 100).toBe(0.33 + 200)
    expect(result.baseParts.every((p) => !p.component)).toBe(true)
  })
})

// ============================================================
// Validation
// ============================================================
describe("engine-v2: validation", () => {
  it("flags overlapping versions of a heading", () => {
    const { errors } = validateRules(
      rules({
        tariffs: [
          tariff({ code: "T", effective: { from: "2026-01-01", to: "2026-05-01" } }),
          tariff({ code: "T", effective: { from: "2026-04-01" } }),
        ],
      }),
    )
    expect(errors.some((e) => e.includes("overlapping"))).toBe(true)
  })
  it("flags unknown lists, programs, handlers and inputs", () => {
    const { errors } = validateRules(
      rules({
        tariffs: [
          tariff({
            code: "T",
            program: "nope",
            scope: { countries: "all", codes: [{ list: "missing" }] },
            requires: [{ kind: "answer", input: "undefinedInput" }],
            rate: { kind: "noSuchRate" },
          }),
        ],
      }),
    )
    expect(errors.length).toBe(4)
  })

  // When each heading was in the HTS, as `npm run ch99:archive` writes it
  const archive = {
    revisions: ["R1", "R2", "R3"],
    headings: {
      "9903.01.01": { first: "R1", last: "R3" },
      "9903.01.02": { first: "R2", last: "R3" },
      "9903.01.03": { first: "R1", last: "R2" },
    },
  }
  const starts: Record<string, string> = { R1: "2025-01-01", R2: "2025-03-01", R3: "2025-06-01" }
  const checkArchive = (tariffs: Tariff[], checkFrom = "2025-01-01") =>
    validateRules(rules({ tariffs }), { checkFrom, archive, revisionStart: (r) => starts[r] })

  it("flags an undated heading that first appears in the HTS after the checked range starts", () => {
    const { errors } = checkArchive([tariff({ code: "9903.01.02", effective: {} })])
    expect(errors.some((e) => e.includes("9903.01.02") && e.includes("no start date"))).toBe(true)
    // Already in the HTS when the checked range starts: fine
    expect(checkArchive([tariff({ code: "9903.01.02", effective: {} })], "2025-04-01").errors).toHaveLength(0)
    // In the earliest archived revision: it may be older, so no start date is fine
    expect(checkArchive([tariff({ code: "9903.01.01", effective: {} })]).errors).toHaveLength(0)
  })

  it("asks for a citation when a heading is dated before it appears in the HTS", () => {
    const uncited = checkArchive([tariff({ code: "9903.01.02", effective: { from: "2025-02-15" } })])
    expect(uncited.warnings.some((w) => w.includes("before the heading first appears"))).toBe(true)
    const cited = checkArchive([
      tariff({ code: "9903.01.02", effective: { from: "2025-02-15" }, source: { citation: "EO 14000" } }),
    ])
    expect(cited.warnings.some((w) => w.includes("before the heading first appears"))).toBe(false)
  })

  it("warns when a heading stays in effect after it left the HTS", () => {
    const open = checkArchive([tariff({ code: "9903.01.03", effective: { from: "2025-01-01" } })])
    expect(open.warnings.some((w) => w.includes("removed from the HTS"))).toBe(true)
    const ended = checkArchive([tariff({ code: "9903.01.03", effective: { from: "2025-01-01", to: "2025-05-20" } })])
    expect(ended.warnings.some((w) => w.includes("removed from the HTS"))).toBe(false)
  })

  it("warns about dates whose only source is \"Notice\"", () => {
    const { warnings } = checkArchive([
      tariff({ code: "9903.01.01", effective: { from: "2025-02-01" }, source: { citation: "Notice" } }),
    ])
    expect(warnings.some((w) => w.includes("no citation for its dates"))).toBe(true)
  })
})
