// The base-rate parser on every general/special/other string in the HTS, and engine-v2 on the
// rate shapes it learned in Oct 2026 (33 1/3%, m2/m3, pr./doz., per thousand, the sugar
// sliding scale, "of total sugars"…). Strings are real ones from the USITC exports.
//
// The golden snapshots in fixtures/ are what the parser and engine did BEFORE those changes
// (commit 835b6f65), over every line of every export we have: 2026 Rev 20 and Rev 15, the
// chapter 1–97 and chapter 98 exports, and the older all-chapters export. Every string that
// parsed then must parse exactly the same now, and every base duty worked out from it must come
// out the same, apart from the changes listed below. testing/engine-v2/rate-snapshot.ts builds
// them; scripts/engine-v2/snapshot-rate-parsing.ts rewrites them from the current code once a
// change is reviewed.
import { describe, it, expect } from "../test-runner"
import { calculate } from "../../tariffs/engine-v2/calculate"
import * as baseRates from "../../tariffs/engine-v2/base-rates"
import { parseRateColumn, parseRateColumnWithFailures } from "../../tariffs/engine-v2/base-rates"
import { CalculationInput, RuleSet } from "../../tariffs/engine-v2/types"
import { BaseEntry, calculateEntry, ParseEntry } from "./rate-snapshot"
import { encodeAnswers, parseAnswers } from "../../components/duty-calculator/lib/estimate"
import parseSnapshot from "./fixtures/rate-parsing-snapshot.json"
import baseSnapshot from "./fixtures/base-duty-snapshot.json"

// Results that were meant to change, with why. Each read a lowercase note letter or a typo as a
// trade program list, a program no claim can match, so the duty is the same.
const INTENDED_CHANGES: Record<string, string> = {
  // 9822.01.05, 9822.01.10: "(b)" read as a program "b"
  "Free, under the terms of U.S. note 1(b) to this subchapter": "now Free with no programs",
  "Free, under the terms of U.S. note 1(c) to this subchapter": "now Free with no programs",
  // 9901.00.50, 9901.00.52 (older export): "(e)" read as a program "e"
  "No change (A) Free (CA,IL, MX) See U.S. note 3 to this sub- chapter (E) See U.S. note 3(e) (CO,PE)":
    "now 'See U.S. note 3(e)' for CO and PE",
  "No change (A,E) Free (CA,IL, MX) See U.S. note 3(e) (CO,PE)": "now 'See U.S. note 3(e)' for CO and PE",
  // 0406.90.94 (older export): "(PA (PA)" read as a program "PA (PA"
  "Free (BH,CL,JO,MA,OM,SG) 11.2¢/kg (P) 15¢/kg (KR) See 9823.04.01-9823.04.54 (S+) See 9908.04.05 (IL) See 9915.04.80, 9915.04.88, 9915.04.97 (P+) See 9917.04.50, 9917.04.58 (PE) See 9918.04.50, 9918.04.58 (CO) See 9919.04.50, 9919.04.57, 9919.04.67 (PA (PA)":
    "now the last 'See' is for PA",
}

// Rates with no number of their own, Chapter 98 formulas and Chapter 99 wording (which the
// engine models in its own tariff data). Not handled yet: they still fail to parse.
const isOutOfScope = (failure: string) =>
  /^\[?(The|A|a) (rate|duty)\b/.test(failure) ||
  /^no change\.?$/i.test(failure) ||
  /^\d+(\.\d+)? percent of the /.test(failure) ||
  /for each other piece or part, but if consisting in part of a plate/.test(failure) ||
  // Chapter 99 text split on its brackets
  failure === "100%]" ||
  failure === ":"
// How many distinct failures there are; lower it as they're handled
const OUT_OF_SCOPE_FAILURES = 52

// A "See 9822.05.20" reference used to become a question for "the value of the See 9822.05.20";
// it no longer does. Nothing else about the result may change.
const withoutSeeQuestions = (result: string) => {
  const r = JSON.parse(result)
  return JSON.stringify({
    ...r,
    parts: r.parts.map((p: unknown[]) => (/^See /.test(String(p[3] ?? "")) ? [...p.slice(0, 3), null, p[4]] : p)),
    inputs: r.inputs.filter((id: string) => !id.startsWith("baseValue:see-")),
  })
}

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
  const entries = parseSnapshot as ParseEntry[]
  const failedBefore = new Set(entries.filter((e) => e.parsingFailures.length).map((e) => e.raw))

  it("covers every export, chapter 98 included", () => {
    expect(entries.length).toBeGreaterThan(2200)
    expect(entries.some((e) => e.raw.startsWith("Free, under bond, as prescribed in U.S. note 1"))).toBe(true)
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

  it("keeps the parts it could already read in strings that failed before", () => {
    const lost = entries
      .filter((e) => e.parsingFailures.length && INTENDED_CHANGES[e.raw] === undefined)
      .filter((e) => {
        const now = parse(e.raw).tariffs.map((t) => JSON.stringify(t))
        return e.tariffs.some((t) => !now.includes(JSON.stringify(t)))
      })
      .map((e) => e.raw)
    expect(lost).toEqual([])
  })

  it("parses every string except rates with no number of their own", () => {
    const failures = new Set(entries.flatMap((e) => parse(e.raw).parsingFailures))
    expect(Array.from(failures).filter((f) => !isOutOfScope(f))).toEqual([])
    expect(failures.size).toBe(OUT_OF_SCOPE_FAILURES)
  })

  it("works out the same base duty as before for every line, column and program", () => {
    const changed = (baseSnapshot as BaseEntry[])
      .filter((e) => !failedBefore.has(e.raw) && INTENDED_CHANGES[e.raw] === undefined)
      .filter((e) => withoutSeeQuestions(quietly(() => calculateEntry(baseRates, e))) !== withoutSeeQuestions(e.result))
      .map((e) => `${e.column}${e.program ? ` (${e.program})` : ""}: ${e.raw}`)
    expect(changed).toEqual([])
  })

  it("keeps every part it can't read, so no rate is shown as Free by mistake", () => {
    const dropped = entries
      .map((e) => ({ raw: e.raw, parsed: parse(e.raw), parts: quietly(() => baseRates.parseRateColumnParts(e.raw)) }))
      .filter(
        ({ parsed, parts }) =>
          parts.length !== parsed.tariffs.length + parsed.parsingFailures.length ||
          parts.some((p) => p.value === null && !p.notCalculated) ||
          // Zero only where the HTS says so: "Free…" or "0%"
          parts.some((p) => p.value === 0 && !/^(free\b|0+(\.0+)?\s*%)/i.test(p.raw)),
      )
      .map((e) => e.raw)
    expect(dropped).toEqual([])
  })

  it("reads conditional free rates as free", () => {
    // 9813.00.05, 9804.00.60, 5101.11.10 (column 2)
    ;[
      "Free, under bond, as prescribed in U.S. note 1 to this subchapter",
      "Free, for such temporary periods as the Secretary of the Treasury by regulation may prescribe",
      "Free, under bond",
    ].forEach((raw) => {
      const { tariffs, parsingFailures } = parse(raw)
      expect(parsingFailures).toEqual([])
      expect(tariffs.map((t) => [t.value, t.type, t.details ?? null])).toEqual([[0, "percent", null]])
    })
  })

  it("asks nothing about a 'See' reference", () => {
    // 1701.91.48 special, claimed under P+
    const result = quietly(() =>
      calculateEntry(baseRates, {
        column: "special",
        raw: "Free (BH,CL,JO,KR,OM,SG) See 9822.05.20 (P+) See 9822.06.10 (PE)",
        program: "P+",
      }),
    )
    expect(JSON.parse(result).inputs).toEqual([])
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

describe("engine-v2: base rates that can't be calculated", () => {
  it("never shows a rate it can't read as Free", () => {
    // 6103.22.00: before, the part was dropped and the base read "Free", $0, with no warning
    const result = run("The rate applicable to each garment in the ensemble if separately entered")
    expect(result.base.reasons[0]).toBe("The rate applicable to each garment in the ensemble if separately entered")
    expect(result.baseNotCalculated).toBe(true)
    expect(result.baseParts.map((p) => [p.amount, Boolean(p.notCalculated)])).toEqual([[0, true]])
    expect(result.warnings.some((w) => w.includes("can't be calculated, so the total excludes base duty"))).toBe(true)
  })

  it("explains Chapter 98 formulas", () => {
    // 9816.00.20
    const result = run("3 percent of the fair retail value")
    expect(result.baseNotCalculated).toBe(true)
    expect(result.base.reasons.some((r) => r.includes("fair retail value, which the calculator doesn't ask for"))).toBe(true)
  })

  it("charges watch movements' other pieces, with the cap as a note", () => {
    // 9110.90.40: 4.3% + 1.7¢/jewel + 0.2¢ for each other piece or part (capped at the complete
    // movement's duty when it has plates, which isn't applied)
    const watch = (answers = {}) =>
      run(
        "4.3% + 1.7¢/jewel + 0.2¢ for each other piece or part, but if consisting in part of a plate or a set of plates the total duty shall not exceed the duty for the complete movement",
        { quantity: 100, answers },
      )
    expect(watch().baseNotCalculated).toBe(false)
    expect(cents(watch().base.amount)).toBe(430 + 1.7 + 0.2)
    expect(watch().unansweredInputs.map((u) => [u.input.id, u.input.label])).toEqual([
      ["baseQuantity:other-pieces-or-parts", "How many other pieces or parts are in the shipment, in all?"],
    ])
    expect(cents(watch({ "baseQuantity:other-pieces-or-parts": 500 }).base.amount)).toBe(430 + 1.7 + 1)
    expect(watch().base.reasons.some((r) => r.startsWith("If the movement consists in part of a plate"))).toBe(true)
  })

  it("keeps a special-column wording rate with its programs", () => {
    // 2106.90.52 special, claimed under D
    const parts = baseRates.getBaseRateParts(
      { general: null, special: "Free (AU,BH,CL)The rate applicable to the natural juice in heading 2009 (A*,D)", other: null },
      "special",
      "D",
    )
    expect(parts.map((p) => [p.raw, p.value, Boolean(p.notCalculated)])).toEqual([
      ["The rate applicable to the natural juice in heading 2009", null, true],
    ])
  })

  it("flags a 'See' reference as not calculated, with no question", () => {
    const result = run("See additional U.S. note 2")
    expect(result.baseNotCalculated).toBe(true)
    expect(result.unansweredInputs.length).toBe(0)
  })

  it("leaves plain rates alone", () => {
    expect(run("2.5%").baseNotCalculated).toBe(false)
    expect(run("Free").baseNotCalculated).toBe(false)
    expect(run("Free, under bond").baseNotCalculated).toBe(false)
  })
})

describe("engine-v2: base rates that point to another code", () => {
  // A few real lines, as the calculator's lookup would return them
  const LINES: Record<string, { general: string | null; special: string | null; other: string | null }> = {
    "6104.42.00": { general: "11.5%", special: "Free (AU,BH,CL,CO,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "90%" },
    "2009.89.20": { general: "0.5¢/liter", special: "Free (A+,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "4.4¢/liter" },
    "6103.22.00": { general: "The rate applicable to each garment in the ensemble if separately entered", special: null, other: null },
    "6104.42": { general: null, special: null, other: null },
  }
  const lookupBaseRates = (code: string) => LINES[code.trim()] ?? null
  const ensemble = "The rate applicable to each garment in the ensemble if separately entered"

  it("asks for the code the rate points to, and leaves it out of the total until then", () => {
    const result = run(ensemble, { lookupBaseRates })
    expect(result.baseNotCalculated).toBe(true)
    expect(result.unansweredInputs.map((u) => [u.input.id, u.input.type])).toEqual([["baseCode:garment", "htsCode"]])
    expect(result.questions[0].input.label).toBe("What is the HTS code of a garment in the ensemble?")
    expect(result.base.reasons.some((r) => r.startsWith("Not calculated: It's the rate of another HTS code"))).toBe(true)
  })

  it("uses that code's rate in the same column once it's given", () => {
    const general = run(ensemble, { lookupBaseRates, answers: { "baseCode:garment": "6104.42.00" } })
    expect(general.baseNotCalculated).toBe(false)
    expect(cents(general.base.amount)).toBe(1150)
    expect(general.base.reasons).toContain(`${ensemble}: the rate of 6104.42.00`)
    expect(general.unansweredInputs.length).toBe(0)
    // Still asked, with its answer, so it can be changed
    expect(general.questions.some((q) => q.input.id === "baseCode:garment" && q.answered)).toBe(true)

    const column2 = run("", {
      country: "RU",
      lookupBaseRates,
      answers: { "baseCode:garment": "6104.42.00" },
      baseRates: { general: "", special: null, other: ensemble },
    })
    // RU isn't a column 2 country in these test rules; check the parts directly
    const parts = baseRates.resolveBaseParts(baseRates.getBaseRateParts({ general: null, special: null, other: ensemble }, "column2"), {
      answers: { "baseCode:garment": "6104.42.00" },
      lookupBaseRates,
      column: "column2",
    })
    expect(column2.baseNotCalculated).toBe(false)
    expect(parts.map((p) => [p.value, p.resolvedFrom?.code])).toEqual([[90, "6104.42.00"]])
  })

  it("uses the referenced code's rate under the same trade program", () => {
    // 2106.90.52 special: "The rate applicable to the natural juice in heading 2009 (A*,D)", claimed under D
    const parts = baseRates.resolveBaseParts(
      baseRates.getBaseRateParts(
        { general: null, special: "Free (AU,BH,CL)The rate applicable to the natural juice in heading 2009 (A*,D)", other: null },
        "special",
        "D",
      ),
      { answers: { "baseCode:juice": "2009.89.20" }, lookupBaseRates, column: "special", claimedPreference: "D" },
    )
    expect(parts.map((p) => [p.value, p.raw, p.resolvedFrom?.code])).toEqual([[0, "Free", "2009.89.20"]])
  })

  it("says why when the code can't be used", () => {
    const why = (code: string) =>
      run(ensemble, { lookupBaseRates, answers: { "baseCode:garment": code } }).baseParts[0].notCalculated
    expect(why("9999.99.99")).toBe("HTS code 9999.99.99 wasn't found. Check the code under Questions About Your Goods.")
    expect(why("6104.42")).toBe("HTS code 6104.42 has no rate of its own. Enter the full code of the line with the rate.")
    // A code whose rate points elsewhere isn't followed
    expect(why("6103.22.00")).toBe("The rate of HTS code 6103.22.00 can't be calculated either.")
  })

  it("doesn't ask when the caller can't look codes up", () => {
    const result = run(ensemble)
    expect(result.baseNotCalculated).toBe(true)
    expect(result.unansweredInputs.length).toBe(0)
  })

  it("covers every pointer wording in the HTS", () => {
    const ask = (raw: string) => baseRates.parseRateColumnParts(raw)[0]?.pointsTo?.key
    expect(
      [
        "The rate applicable to each garment in the ensemble if separately entered",
        "The rate applicable to each garment in the ensemble if entered separately",
        "The rate applicable to each garment in the in the ensemble if separately entered",
        "The rate of duty applicable to that article in the set subject to the highest rate of duty",
        "The rate of duty appli- cable to that article in the set subject to the high- est rate of duty",
        "The rate applicable to the article of which it is a part or accessory",
        "The rate applicable to the article of which it is an accessory",
        "The rate applicable to the natural juice in heading 2009",
        "The rate applicable to the complete, assembled movement",
        "The rate applicable to the complete, assembled",
        "The rate applicable to each article in the absence of this subheading",
        "The rate applicable, to each article in the absence of this subheading",
        "The rate applicable in the absence of this heading",
        "The rate applicable in the absence of this subheading",
      ].map((raw) => quietly(() => ask(raw))),
    ).toEqual(["garment", "garment", "garment", "set-article", "set-article", "article", "article", "juice", "movement", "movement", "absent", "absent", "absent", "absent"])
    // Chapter 98's "…on the cost of such parts" isn't a plain pointer
    expect(quietly(() => ask("The rate applicable in the absence of this subheading on the cost of such parts"))).toBeUndefined()
  })

  it("reads base-rate answers from links", () => {
    const answers = { "baseCode:garment": "6104.42.00", "baseValue:case": 200, basePolarity: 96 }
    expect(parseAnswers(encodeAnswers(answers))).toEqual(answers)
    expect(parseAnswers("baseCode:garment=not-a-code")).toEqual({})
  })
})

describe("engine-v2: 5810 embroidery, rates from chapter 58's additional U.S. notes", () => {
  const LINES: Record<string, { general: string | null; special: string | null; other: string | null }> = {
    // A fabric that, un-embroidered, pays more than the note's 4.2%
    "5407.52.20": { general: "12%", special: "Free (AU,BH,CL,CO,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "81%" },
    // and one that pays less
    "5208.21.20": { general: "2.5%", special: "Free (AU,BH,CL,CO,IL,JO,KR,MA,OM,P,PA,PE,S,SG)", other: "10%" },
  }
  const lookupBaseRates = (code: string) => LINES[code.trim()] ?? null
  const embroidery = (htsCode: string, general: string, answers = {}) =>
    run(general, { htsCode, lookupBaseRates, answers })

  it("uses the note's rate for each subheading", () => {
    expect(cents(embroidery("5810.91.00.20", "See additional U.S. note 1").base.amount)).toBe(0)
    expect(cents(embroidery("5810.92.10.00", "See additional U.S. note 2").base.amount)).toBe(420)
    expect(cents(embroidery("5810.92.90.80", "See additional U.S. note 3").base.amount)).toBe(740)
    expect(cents(embroidery("5810.99.10.00", "See additional U.S. note 4").base.amount)).toBe(740)
    expect(cents(embroidery("5810.99.90.00", "See additional U.S. note 5").base.amount)).toBe(420)
    const result = embroidery("5810.92.10.00", "See additional U.S. note 2")
    expect(result.baseNotCalculated).toBe(false)
    expect(result.base.reasons).toContain("See additional U.S. note 2: 4.2% under additional U.S. note 2 to chapter 58")
  })

  it("uses 90% in column 2", () => {
    const parts = baseRates.resolveBaseParts(baseRates.getBaseRateParts({ general: null, special: null, other: "See additional U.S. note 2" }, "column2"), {
      answers: {},
      column: "column2",
      htsCode: "5810.92.10.00",
    })
    expect(parts.map((p) => p.value)).toEqual([90])
  })

  it("asks about embroidery in the piece and charges the fabric's rate when it's higher", () => {
    const asked = embroidery("5810.92.10.00", "See additional U.S. note 2")
    expect(asked.questions.map((q) => q.input.id)).toContain("baseEmbroideryInPiece")
    const inPiece = embroidery("5810.92.10.00", "See additional U.S. note 2", { baseEmbroideryInPiece: true })
    expect(inPiece.questions.map((q) => q.input.id)).toContain("baseCode:unembroidered")
    expect(cents(inPiece.base.amount)).toBe(420) // until the fabric's code is given
    expect(inPiece.base.reasons.some((r) => r.startsWith("Embroidery in the piece pays at least"))).toBe(true)
    const higher = embroidery("5810.92.10.00", "See additional U.S. note 2", {
      baseEmbroideryInPiece: true,
      "baseCode:unembroidered": "5407.52.20",
    })
    expect(cents(higher.base.amount)).toBe(1200)
    expect(higher.base.reasons).toContain("See additional U.S. note 2: not less than the rate of 5407.52.20")
    const lower = embroidery("5810.92.10.00", "See additional U.S. note 2", {
      baseEmbroideryInPiece: true,
      "baseCode:unembroidered": "5208.21.20",
    })
    expect(cents(lower.base.amount)).toBe(420)
  })

  it("leaves other 'See additional U.S. note' rates alone", () => {
    expect(embroidery("5810.92.10.00", "See additional U.S. note 3").baseNotCalculated).toBe(true)
    expect(embroidery("6001.10.00.00", "See additional U.S. note 2").baseNotCalculated).toBe(true)
  })
})

describe("engine-v2: special rates on a Chapter 98/99 line ('See 9822.04.25 (AU)')", () => {
  // Real lines from 2026 Rev 20
  const LINES: Record<string, { general: string | null; special: string | null; other: string | null }> = {
    "9908.04.05": { general: null, special: "Free (IL)", other: null },
    "9918.04.50": { general: null, special: "Free (CO)", other: null },
    "9918.04.56": { general: null, special: "Free (CO)", other: null },
    "9919.04.50": { general: null, special: "Free (PA)", other: null },
    "9919.04.55": { general: null, special: "53.7¢/kg (PA)", other: null },
    "9919.04.65": { general: null, special: "$1.34/kg (PA)", other: null },
    "9919.04.14": { general: null, special: "Free (PA)", other: null },
    "9919.04.10": { general: null, special: "Free (PA)", other: null },
    "9919.04.12": { general: null, special: "Free (PA)", other: null },
  }
  const lookupBaseRates = (code: string) => {
    const digits = code.replace(/\D/g, "")
    const key = Object.keys(LINES).find((k) => k.replace(/\D/g, "") === digits)
    return key ? LINES[key] : null
  }
  // 0406.10.58 special, as in the HTS
  const SPECIAL =
    "Free (BH,CL,JO,KR,MA,OM,P,PE,SG) See 9822.04.40 (AU) See 9823.04.01-9823.04.54 (S+) See 9908.04.05 (IL) See 9918.04.50, 9918.04.56 (CO) See 9919.04.50, 9919.04.55, 9919.04.65 (PA)"
  const claim = (program: string, special = SPECIAL, lookup: "none" | "hts" = "hts") =>
    baseRates.resolveBaseParts(baseRates.getBaseRateParts({ general: null, special, other: null }, "special", program), {
      answers: {},
      lookupBaseRates: lookup === "hts" ? lookupBaseRates : undefined,
      column: "special",
      claimedPreference: program,
    })

  it("uses the line's rate, flagged as subject to its quota", () => {
    const parts = claim("IL")
    expect(parts.map((p) => [p.value, p.raw, Boolean(p.notCalculated)])).toEqual([[0, "Free", false]])
    expect(parts[0].note).toBe(
      "You may qualify for this rate: it's subject to the quota and conditions of 9908.04.05. Over the quota, a different rate applies.",
    )
  })

  it("uses the rate when every line listed agrees", () => {
    expect(claim("CO").map((p) => [p.value, p.resolvedFrom?.code])).toEqual([[0, "9918.04.50, 9918.04.56"]])
  })

  it("doesn't pick between lines within and over the quota", () => {
    const [part] = claim("PA")
    expect(part.notCalculated).toBe(
      "It depends on the quota: Free under 9919.04.50, 53.7¢/kg under 9919.04.55, $1.34/kg under 9919.04.65.",
    )
  })

  it("doesn't pick a line from a range", () => {
    expect(claim("S+")[0].notCalculated).toBe(
      "The rate is on one of the lines from 9823.04.01 to 9823.04.54, which differ by product and quota; the calculator doesn't pick one.",
    )
  })

  it("says so when the line isn't in the HTS it has", () => {
    expect(claim("AU")[0].notCalculated).toBe("The rate is on 9822.04.40, which the calculator couldn't read for AU.")
  })

  it("reads the '99.19.04.14' typo as 9919.04.14", () => {
    // 0402.99.45 special
    const special = "Free (BH,CL,CO,JO,KR,MA,OM,P,PE,SG) See 9919.04.10, 9919.04.12, 99.19.04.14 (PA)"
    expect(claim("PA", special).map((p) => [p.value, Boolean(p.notCalculated)])).toEqual([[0, false]])
  })

  it("stays not calculated without a way to look lines up", () => {
    expect(claim("IL", SPECIAL, "none")[0].notCalculated).toBe(
      "The rate is set out in 9908.04.05, which the calculator doesn't look up.",
    )
  })
})
