// The base-rate parser on every general/special/other string in the HTS, and engine-v2 on the
// rate shapes it learned in Oct 2026 (33 1/3%, m2/m3, pr./doz., per thousand, the sugar
// sliding scale, "of total sugars"…). Strings are real ones from the USITC export.
//
// fixtures/rate-parsing-snapshot.json is what the parser returned for each distinct string
// before those changes (scripts/engine-v2/snapshot-rate-parsing.ts). Strings that parsed then
// must parse exactly the same now.
import { describe, it, expect } from "../test-runner"
import { calculate } from "../../tariffs/engine-v2/calculate"
import { parseRateColumn, parseRateColumnWithFailures } from "../../tariffs/engine-v2/base-rates"
import { CalculationInput, RuleSet } from "../../tariffs/engine-v2/types"
import { BaseTariffI } from "../../libs/hts"
import snapshot from "./fixtures/rate-parsing-snapshot.json"

interface SnapshotEntry {
  raw: string
  tariffs: BaseTariffI[]
  parsingFailures: string[]
}

// Results that were meant to change, with why
const INTENDED_CHANGES: Record<string, string> = {
  // Read as Free because it contained "free"; it's a condition, not a plain free rate
  "Free, under bond": "now a parsing failure",
}

// Rates with no number of their own. Not handled yet: they still fail to parse.
const isOutOfScope = (failure: string) =>
  /^The rate (of duty )?applicable/.test(failure) ||
  /for each other piece or part, but if consisting in part of a plate/.test(failure) ||
  INTENDED_CHANGES[failure] !== undefined

const quietly = <T>(fn: () => T): T => {
  const error = console.error
  console.error = () => {}
  try {
    return fn()
  } finally {
    console.error = error
  }
}

const parse = (raw: string) => quietly(() => parseRateColumnWithFailures(raw))

describe("rate parsing: every HTS rate string", () => {
  const entries = snapshot as SnapshotEntry[]

  it("covers the whole HTS export", () => {
    expect(entries.length).toBeGreaterThan(1900)
  })

  it("parses every string that parsed before exactly as before", () => {
    const changed = entries
      .filter((e) => !e.parsingFailures.length && INTENDED_CHANGES[e.raw] === undefined)
      .filter(
        (e) =>
          JSON.stringify(parse(e.raw)) !==
          JSON.stringify({ tariffs: e.tariffs, parsingFailures: e.parsingFailures }),
      )
      .map((e) => e.raw)
    expect(changed).toEqual([])
  })

  it("now parses every string that failed before, except rates with no number", () => {
    const stillFailing = entries
      .filter((e) => e.parsingFailures.length)
      .flatMap((e) => parse(e.raw).parsingFailures)
      .filter((f) => !isOutOfScope(f))
    expect(stillFailing).toEqual([])
  })

  it("keeps the parts it could already read in strings that failed before", () => {
    const lost = entries
      .filter((e) => e.parsingFailures.length)
      .filter((e) => {
        const now = parse(e.raw).tariffs.map((t) => JSON.stringify(t))
        return e.tariffs.some((t) => !now.includes(JSON.stringify(t)))
      })
      .map((e) => e.raw)
    expect(lost).toEqual([])
  })

  it("no longer reads 'Free, under bond' as free", () => {
    expect(parse("Free, under bond")).toEqual({ tariffs: [], parsingFailures: ["Free, under bond"] })
  })
})

describe("rate parsing: new shapes", () => {
  const one = (raw: string) => {
    const { tariffs, parsingFailures } = parse(raw)
    expect(parsingFailures).toEqual([])
    expect(tariffs.length).toBe(1)
    return tariffs[0]
  }

  it("reads a fractional percentage (4202.29.20, column 2)", () => {
    const t = one("33 1/3%")
    expect(t.type).toBe("percent")
    expect(t.value).toBe(33.3333)
  })

  it("reads units with digits, periods and spaces", () => {
    const units: [string, string, number][] = [
      ["$1.27/m3", "m3", 1.27], // 4407.21
      ["38¢/m2", "m2", 0.38], // 3702.55
      ["$1.58/pr.", "pr.", 1.58], // 6402.19.50
      ["2.8¢/doz.", "doz.", 0.028], // 0407.11
      ["77.2¢/clean kg", "clean kg", 0.772], // 5101.11.50
      ["3.3¢/lin. m", "lin. m", 0.033], // 8523.29.50
      ["0.3¢/line/ gross", "line/gross", 0.003], // 9606.21.40
      ["38.4¢/1000", "thousand", 0.384], // 0601.10.30
      ["$1.50/1,000", "thousand", 1.5], // 8448.51.20
      ["$1/1,000 pins", "thousand pins", 1], // 9209.91.40
    ]
    units.forEach(([raw, unit, value]) => {
      const t = one(raw)
      expect(t.type).toBe("amount")
      expect(t.unit).toBe(unit)
      expect(t.value).toBe(value)
    })
  })

  it("keeps cents in full on the new patterns", () => {
    expect(one("3.6606¢/kg of total sugars").value).toBe(0.036606) // 1702.90.05
  })

  it("reads qualifiers that don't start with 'on'", () => {
    expect(one("33.9¢/kg of total sugars").details).toBe("of total sugars")
    expect(one("86.1¢/m2 of recording surface").details).toBe("of recording surface")
    expect(one("$40/kg of anhydrous morphine content").details).toBe("of anhydrous morphine content")
    expect(one("20¢/gross of immediate containers").details).toBe("of immediate containers")
    expect(one("$1.32/t, including weight of container").details).toBe("including weight of container")
    expect(one("15¢/jewel over 7").details).toBe("over 7")
  })

  it("reads the sugar sliding scale, keeping its parenthesis out of the program list", () => {
    const t = one(
      "3.6606¢/kg less 0.020668¢/kg for each degree under 100 degrees (and fractions of a degree in proportion) but not less than 3.143854¢/kg",
    )
    expect(t.unit).toBe("kg")
    expect(t.value).toBe(0.036606)
    expect(t.slidingScale).toEqual({ perDegree: 0.00020668, underDegrees: 100, minimum: 0.03143854 })
    expect(t.programs).toEqual([])
  })

  it("reads the sugar scale written with '¢ /kg' and a missing 'than' (1701.13.10, column 2)", () => {
    const t = one(
      "4.3817¢/kg less 0.0622005¢ /kg for each degree under 100 degrees (and fractions of a degree in proportion) but not less 2.831562¢ /kg",
    )
    expect(t.slidingScale).toEqual({ perDegree: 0.000622005, underDegrees: 100, minimum: 0.02831562 })
  })

  it("fixes words broken across lines", () => {
    // 9608.99.30, column 2: same as "20¢/thousand" in its general column
    const { tariffs, parsingFailures } = parse("$2.50/thou- sand + 40%")
    expect(parsingFailures).toEqual([])
    expect(tariffs.map((t) => [t.value, t.unit ?? null])).toEqual([[2.5, "thousand"], [40, null]])
    expect(one("86.1¢/m2of recording surface").details).toBe("of recording surface") // 8523.29.40
  })

  it("still splits program lists written without spaces", () => {
    const parts = parseRateColumn("Free (A,AU,BH,CL,CO,D,E,IL,KR,MA,OM,P,PA,PE,S,SG)8.8¢/liter(JO)")
    expect(parts.map((t) => [t.value, t.programs?.length])).toEqual([[0, 16], [0.088, 1]])
  })
})

// ── Engine ──

const rules = (): RuleSet => ({
  programs: [],
  tariffs: [],
  lists: [],
  interactions: [],
  columnAssignments: [],
  preferences: [],
  fees: [],
  inputs: [],
})

const run = (general: string, overrides: Partial<CalculationInput> = {}) =>
  quietly(() =>
    calculate(rules(), {
      htsCode: "0000.00.00.00",
      country: "CN",
      asOf: "2026-04-10",
      customsValue: 10_000,
      quantity: 1000,
      baseRates: { general, special: null, other: null },
      ...overrides,
    }),
  )

const cents = (n: number) => Math.round(n * 100) / 100

describe("engine-v2: new base rate shapes", () => {
  it("charges a fractional percentage", () => {
    expect(cents(run("33 1/3%").base.amount)).toBe(3333.33)
  })

  it("charges per-unit amounts in the new units", () => {
    expect(cents(run("$1.27/m3", { quantity: 100 }).base.amount)).toBe(127)
    // 6402.19.50, column 2: $1.58 × 100 pairs + 66% × $10,000
    expect(cents(run("$1.58/pr. + 66%", { quantity: 100 }).base.amount)).toBe(158 + 6600)
    expect(cents(run("77.2¢/clean kg", { quantity: 100 }).base.amount)).toBe(77.2)
  })

  it("charges the sugar scale's full rate until the polarity is given", () => {
    const sugar =
      "3.6606¢/kg less 0.020668¢/kg for each degree under 100 degrees (and fractions of a degree in proportion) but not less than 3.143854¢/kg"
    const result = run(sugar)
    expect(cents(result.base.amount)).toBe(36.61)
    expect(result.baseParts[0].assumed).toBe(true)
    expect(result.unansweredInputs.map((u) => u.input.id)).toEqual(["basePolarity"])
    expect(result.requiresQuantity).toBe(true)
    expect(result.base.reasons.some((r) => r.includes("polarity"))).toBe(true)

    const at = (polarity: number) => run(sugar, { answers: { basePolarity: polarity } })
    // 3.6606¢ − 4 × 0.020668¢ = 3.577928¢/kg
    expect(Math.round(at(96).base.amount * 1e5) / 1e5).toBe(35.77928)
    // Fractions of a degree in proportion: 3.6606¢ − 0.5 × 0.020668¢
    expect(Math.round(at(99.5).base.amount * 1e5) / 1e5).toBe(36.50266)
    // Never below 3.143854¢/kg
    expect(Math.round(at(70).base.amount * 1e5) / 1e5).toBe(31.43854)
    expect(at(96).baseParts[0].assumed).toBe(false)
  })

  it("asks for the total sugars and uses the total quantity until given", () => {
    // 1702.40.28
    const sugars = (answers = {}) => run("33.9¢/kg of total sugars + 5.1%", { answers })
    expect(cents(sugars().base.amount)).toBe(339 + 510)
    expect(sugars().unansweredInputs.map((u) => u.input.id)).toEqual(["baseQuantity:total-sugars"])
    expect(cents(sugars({ "baseQuantity:total-sugars": 400 }).base.amount)).toBe(135.6 + 510)
  })

  it("charges 'including weight of container' on the whole quantity, with no question", () => {
    const result = run("$1.32/t, including weight of container", { quantity: 10 })
    expect(cents(result.base.amount)).toBe(13.2)
    expect(result.unansweredInputs.length).toBe(0)
    expect(result.baseParts[0].component).toBeUndefined()
  })

  it("asks for the jewels over 7 on watch movements", () => {
    // 9105.19.30, column 2
    const watch = (answers = {}) =>
      run("$2.25 each + 15¢/jewel over 7 + 60% on the case", { quantity: 10, customsValue: 1000, answers })
    expect(cents(watch().base.amount)).toBe(22.5 + 1.5 + 600)
    expect(watch().unansweredInputs.map((u) => u.input.id)).toEqual(["baseQuantity:jewels-over-7", "baseValue:case"])
    expect(cents(watch({ "baseQuantity:jewels-over-7": 50, "baseValue:case": 200 }).base.amount)).toBe(22.5 + 7.5 + 120)
  })

  it("asks for gross lines on buttons charged per line per gross", () => {
    // 9606.21.40
    const buttons = (answers = {}) => run("0.3¢/line/ gross + 4.6%", { quantity: 10, customsValue: 1000, answers })
    expect(cents(buttons().base.amount)).toBe(46.03)
    expect(cents(buttons({ "baseQuantity:gross-lines": 240 }).base.amount)).toBe(46.72)
  })

  it("divides by 1,000 for rates per thousand when the quantity is in single items", () => {
    // 0601.10.15 reports "No.": 100,000 bulbs at 89.6¢ per 1,000
    expect(cents(run("89.6¢/1000", { quantity: 100_000, quantityUnit: "No." }).base.amount)).toBe(89.6)
  })

  it("uses the quantity as is for rates per thousand when it's in thousands or the unit isn't known", () => {
    // 9209.92.40 reports "thousands"
    expect(cents(run("10¢/1,000 pins + 3.5%", { quantity: 50, customsValue: 1000, quantityUnit: "thousands" }).base.amount)).toBe(40)
    expect(cents(run("89.6¢/1000", { quantity: 100 }).base.amount)).toBe(89.6)
    // 9608.99.30 parsed before as well: unchanged with or without the unit
    expect(cents(run("20¢/thousand + 3.5%", { quantity: 50, customsValue: 1000 }).base.amount)).toBe(45)
    expect(cents(run("20¢/thousand + 3.5%", { quantity: 50, customsValue: 1000, quantityUnit: "thousands" }).base.amount)).toBe(45)
  })

  it("leaves other per-unit amounts alone whatever the quantity's unit", () => {
    expect(cents(run("3.3¢/kg", { quantity: 100, quantityUnit: "No." }).base.amount)).toBe(3.3)
  })
})
