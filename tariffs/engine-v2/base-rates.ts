// Base (Column 1 / Column 2) rates, including rates that apply to only part of the goods.
//
// Some HTS rates charge each part of an article separately, for example
//   9103.10.40: "24¢ each + 4.5% on the case + 3.5% on the battery"
//   2603.00.00: "1.7¢/kg on lead content"
// A percentage "on the case" applies to the value of the case, not the whole watch, and an
// amount "on lead content" applies to the weight of the lead, not the whole shipment.
//
// Each such part becomes a question (the component's value or weight). Until it's answered,
// the whole customs value or quantity is used, which is the most the part can come to, and
// the part is flagged as assumed.

import {
  BaseTariffI,
  getBaseTariffs,
  PROGRAM_LIST,
  splitOnClosingParen,
} from "../../libs/hts"
import { Answers, BasePart, BaseRates, DutyColumn, InputDefinition } from "./types"

// ── Parsing ──

// Fixes HTS text quirks that break the shared parser, in the rate text only
// (never in the program list, where "A+" is a program symbol)
const normalizeRateText = (text: string) =>
  text
    // "45% on the case +80% on the strap" → "45% on the case + 80% on the strap"
    .replace(/\s*\+\s*(?=[\d$¢])/g, " + ")
    // "35% on thebattery"
    .replace(/\bthebattery\b/g, "the battery")
    // "22.1¢/pf. liter" (proof liter): the period stops the parser reading the unit
    .replace(/\/\s*pf\.\s*liter/g, "/pfliter")
    // Words broken across lines in the HTS: "$2.50/thou- sand", "appli- cable", "high- est"
    .replace(/\b(thou|appli|high)- (sand|cable|est)\b/g, "$1$2")
    // "86.1¢/m2of recording surface"
    .replace(/\bm2of\b/g, "m2 of")
    // "each garment in the in the ensemble"
    .replace(/\bin the in the\b/g, "in the")

const parsePart = (part: string) => {
  const match = part.match(PROGRAM_LIST)
  const paren = match?.index ?? -1
  const rate = paren >= 0 ? part.slice(0, paren) : part
  const programs = paren >= 0 ? part.slice(paren) : ""
  return getBaseTariffs(
    `${normalizeRateText(rate).trim()}${programs ? ` ${programs}` : ""}`,
  )
}

// Every rate part in a column and the pieces that couldn't be read
export const parseRateColumnWithFailures = (
  raw: string | null,
): { tariffs: BaseTariffI[]; parsingFailures: string[] } => {
  const parsed = splitOnClosingParen(raw ?? "").map(parsePart)
  return {
    tariffs: parsed.flatMap((p) => p.tariffs),
    parsingFailures: parsed.flatMap((p) => p.parsingFailures),
  }
}

// Every rate part in a column, e.g. "Free (A,AU,...) 3.15% (JP)" → two parts with their programs
export const parseRateColumn = (raw: string | null): BaseTariffI[] =>
  parseRateColumnWithFailures(raw).tariffs

// Why a rate can't be calculated, in plain English
export const explainNotCalculated = (raw: string): string => {
  const text = raw.trim()
  if (/^see\s/i.test(text))
    return `The rate is set out in ${text.replace(/^see\s+/i, "")}, which the calculator doesn't look up.`
  if (/^\[?(the duty provided|no change|a duty of)/i.test(text))
    return "This is Chapter 99 wording for an additional duty. Enter the goods' own HTS code instead."
  if (/percent of the fair retail value/i.test(text))
    return "It's a percentage of the goods' fair retail value, which the calculator doesn't ask for."
  if (/percent of the cost of/i.test(text))
    return "It's a percentage of the cost of the parts or repairs, which the calculator doesn't ask for."
  if (/^a duty upon the (full )?value/i.test(text))
    return "It's the article's own rate, charged on only part of its value as the Chapter 98 note sets out, which the calculator doesn't model."
  if (/^a duty (equal|\(in lieu)/i.test(text))
    return "It depends on the duty and drawback on like articles, which the calculator doesn't model."
  if (/^the (rate|duty rate|rate of duty) (applicable|provided)/i.test(text))
    return "It's the rate of another HTS code, which the calculator doesn't look up here."
  if (/for each other piece or part/i.test(text))
    return "It's charged per piece, with a cap the calculator doesn't model."
  return "The HTS gives this rate in words the calculator can't calculate."
}

// Rates that are another HTS code's rate, and the question that asks for that code
const POINTERS: { test: RegExp; key: string; question: string; help: string }[] = [
  {
    // 6103.22.00 and the other ensembles
    test: /^the rate applicable to each garment in the ensemble/i,
    key: "garment",
    question: "What is the HTS code of a garment in the ensemble?",
    help: "Each garment in the ensemble is charged at the rate it would have if entered on its own. Enter one garment's code, with that garment's value as the customs value, and work out each garment the same way.",
  },
  {
    // 8205.90.60, 8211.10.00
    test: /^the rate of duty applicable to that article in the set subject to the highest rate/i,
    key: "set-article",
    question: "What is the HTS code of the article in the set with the highest rate?",
    help: "The whole set is charged at the rate of the article in it with the highest rate of duty.",
  },
  {
    // 9005.90.40, 9620.00.15
    test: /^the rate applicable to the article of which it is (a part or )?an? accessory|^the rate applicable to the article of which it is a part/i,
    key: "article",
    question: "What is the HTS code of the article it's a part or accessory of?",
    help: "It's charged at the rate of the article it belongs to.",
  },
  {
    // 2106.90.52, 2202.99.36
    test: /^the rate applicable to the natural juice in heading 2009/i,
    key: "juice",
    question: "What is the HTS code of the natural juice (heading 2009)?",
    help: "It's charged at the rate of the natural juice in heading 2009.",
  },
  {
    // 9110.11.00, 9110.90.20
    test: /^the rate applicable to the complete, assembled( movement)?$/i,
    key: "movement",
    question: "What is the HTS code of the complete, assembled movement?",
    help: "It's charged at the rate of the complete, assembled movement.",
  },
  {
    // 9608.50.00, 9810.00.35, 9810.00.85, 9817.61.01
    test: /^the rate applicable,? (to each article )?in the absence of this (sub)?heading$/i,
    key: "absent",
    question: "What HTS code would the goods have without this provision?",
    help: "It's charged at the rate the goods would have under their usual HTS code.",
  },
]

const pointerFor = (raw: string) => {
  const pointer = POINTERS.find((p) => p.test.test(raw.trim()))
  return pointer ? { key: pointer.key, question: pointer.question, help: pointer.help } : undefined
}

// Every rate part in a column, including those that can't be calculated: wording the parser
// can't read ("The rate applicable to…", "3 percent of the fair retail value") and references
// ("See 9822.04.25") stay in, with no value and the reason, so a rate is never shown as Free
// just because it couldn't be read
export const parseRateColumnParts = (raw: string | null): BaseTariffI[] =>
  splitOnClosingParen(raw ?? "").flatMap((segment) => {
    const parsed = parsePart(segment)
    const programs = segment.match(PROGRAM_LIST)?.[1].split(",").map((p) => p.trim()) ?? []
    return [
      ...parsed.tariffs.map((t) =>
        t.value === null ? { ...t, notCalculated: explainNotCalculated(t.raw) } : t,
      ),
      ...parsed.parsingFailures.map((failure): BaseTariffI => {
        const pointsTo = pointerFor(failure)
        return {
          value: null,
          type: "percent",
          raw: failure,
          programs,
          notCalculated: explainNotCalculated(failure),
          ...(pointsTo ? { pointsTo } : {}),
        }
      }),
    ]
  })

export const getBaseRateParts = (
  baseRates: {
    general: string | null
    special: string | null
    other: string | null
  },
  column: DutyColumn,
  claimedPreference?: string,
): BaseTariffI[] => {
  if (column === "column2") return parseRateColumnParts(baseRates.other)
  if (column === "special") {
    return parseRateColumnParts(baseRates.special).filter((t) =>
      t.programs?.includes(claimedPreference),
    )
  }
  return parseRateColumnParts(baseRates.general)
}

// Base rates that point to another code: with a way to look codes up, each asks for the code and,
// once it's given, is replaced by that code's rate in the same column (or under the same
// program). A code whose own rate points elsewhere, or can't be calculated, isn't followed.
export const resolveBaseParts = (
  parts: BaseTariffI[],
  {
    answers,
    lookupBaseRates,
    column,
    claimedPreference,
  }: {
    answers: Answers
    lookupBaseRates?: (htsCode: string) => BaseRates | null
    column: DutyColumn
    claimedPreference?: string
  },
): BaseTariffI[] =>
  parts.flatMap((t): BaseTariffI[] => {
    if (!t.pointsTo || !lookupBaseRates) return [t]
    const inputId = `baseCode:${t.pointsTo.key}`
    const pointsTo = { ...t.pointsTo, inputId }
    const code = String(answers[inputId] ?? "").trim()
    if (!code) {
      return [{ ...t, pointsTo, notCalculated: `It's the rate of another HTS code. Answer "${pointsTo.question}" to calculate it.` }]
    }
    const rates = lookupBaseRates(code)
    if (!rates) {
      return [{ ...t, pointsTo, notCalculated: `HTS code ${code} wasn't found. Check the code under Questions About Your Goods.` }]
    }
    if (![rates.general, rates.special, rates.other].some((r) => r && r.trim())) {
      return [{ ...t, pointsTo, notCalculated: `HTS code ${code} has no rate of its own. Enter the full code of the line with the rate.` }]
    }
    const referenced = getBaseRateParts(rates, column, claimedPreference)
    if (!referenced.length) {
      return [
        {
          ...t,
          pointsTo,
          notCalculated:
            column === "special"
              ? `HTS code ${code} has no special rate under ${claimedPreference}.`
              : `HTS code ${code} has no rate in this column.`,
        },
      ]
    }
    if (referenced.some((r) => r.notCalculated || r.pointsTo)) {
      return [{ ...t, pointsTo, notCalculated: `The rate of HTS code ${code} can't be calculated either.` }]
    }
    return referenced.map((r) => ({
      ...r,
      resolvedFrom: { raw: t.raw, code, inputId, question: pointsTo.question, help: pointsTo.help },
    }))
  })

// ── Components ──

// Phrases that mean the whole article, so no separate value is needed
// ("$1.32/t, including weight of container" is charged on the gross weight)
const WHOLE_ARTICLE = /^((the )?entire set|including weight of container)$/

// "on the value of the telescopic sight, if any" → "the telescopic sight",
// "33.9¢/kg of total sugars" → "total sugars", "15¢/jewel over 7" → "jewels over 7"
const componentOf = (t: BaseTariffI) => {
  // "See 9822.05.20" points to another provision; it has no rate of its own to apply to a part
  if (t.value === null) return null
  // "0.3¢/line/ gross": per line of button size per gross, so the quantity is in gross lines
  if (t.unit === "line/gross") return "gross lines"
  if (!t.details) return null
  if (/^over\s+\d+$/i.test(t.details)) return `${t.unit ?? "unit"}s ${t.details}`
  const component = t.details
    .replace(/^(on|of)\s+/i, "")
    .replace(/^the value of\s+/i, "")
    .replace(/,\s*if any$/i, "")
    .trim()
  if (!component || WHOLE_ARTICLE.test(component)) return null
  return component
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const withArticle = (component: string) =>
  /^the\s/i.test(component) ? component : `the ${component}`

const POLARITY_INPUT = "basePolarity"

// Questions for a component's weight or count: "How many kg of total sugars are in the shipment?"
const quantityQuestion = (component: string, unit: string) => {
  const name = component.replace(/^the\s+/i, "")
  if (component === "gross lines")
    return "How many gross lines (button size in lines × gross) are in the shipment?"
  if (/\bover\s+\d+$/.test(name)) return `How many ${name} are there across the shipment?`
  if (/\bweight$/.test(name)) return `What is the ${name}, in ${unit}?`
  return `How many ${unit} of ${name} are in the shipment?`
}

// The questions the base rate asks (a component's value or weight, a sugar's polarity, the code
// a rate points to): shown in their own section of Possible Adjustments, before the Chapter 99
// provisions
export const isBaseRateInput = (id: string) =>
  id.startsWith("baseValue:") ||
  id.startsWith("baseQuantity:") ||
  id.startsWith("baseCode:") ||
  id === POLARITY_INPUT

// An answer to a base-rate question from a link or an API call, in the type it takes (a code as
// typed, otherwise a number), or undefined when it isn't valid
export const baseRateAnswer = (id: string, value: unknown) => {
  if (id.startsWith("baseCode:")) {
    const code = String(value ?? "").trim()
    return /^\d{4}(\.?\d{2}){0,3}$/.test(code) ? code : undefined
  }
  const number = typeof value === "number" ? value : parseFloat(String(value))
  return Number.isFinite(number) ? number : undefined
}

// Units as people read them ("pfliter" was normalized from "pf. liter")
const unitLabel = (unit: string) =>
  unit === "pfliter" ? "proof liter" : unit === "line/gross" ? "line × gross" : unit

// "$6/1000", "$1/1,000 pins" and "20¢/thousand" are per thousand. Most such lines report
// their quantity in thousands, so it's used as is unless the caller says it's in another unit
// (the 0601.10 bulbs report "No.").
const isPerThousand = (unit?: string) => !!unit && /^thousand\b/.test(unit)
const isThousandsUnit = (unit: string) => /^thousands?$/i.test(unit.trim())
const quantityFor = (
  t: BaseTariffI,
  quantity: number | undefined,
  quantityUnit: string | undefined,
) =>
  quantity !== undefined &&
  isPerThousand(t.unit) &&
  quantityUnit &&
  !isThousandsUnit(quantityUnit)
    ? quantity / 1000
    : quantity

// Sugar sliding scales take off `perDegree` for each degree of polarity under `underDegrees`
// (fractions in proportion), down to `minimum`
const slidingRate = (t: BaseTariffI, polarity: number | null) => {
  const scale = t.slidingScale!
  const rate = t.value ?? 0
  if (polarity === null || polarity >= scale.underDegrees) return rate
  return Math.max(
    scale.minimum,
    rate - scale.perDegree * (scale.underDegrees - polarity),
  )
}

// ── Calculating ──

export interface BaseCalculation {
  parts: BasePart[]
  // Questions for component values and weights, in the order the parts appear
  inputs: InputDefinition[]
  amount: number
  // Percent parts that apply to the whole value (for display as a single rate)
  wholeValuePct: number
}

export const calculateBase = (
  rates: BaseTariffI[],
  customsValue: number,
  quantity: number | undefined,
  answers: Answers,
  // The unit the quantity is in (the HTS line's first unit), when the caller knows it
  quantityUnit?: string,
): BaseCalculation => {
  const inputs = new Map<string, InputDefinition>()

  const answerFor = (inputId: string) => {
    const answer = Number(answers[inputId])
    return answers[inputId] !== undefined &&
      answers[inputId] !== "" &&
      Number.isFinite(answer)
      ? answer
      : null
  }

  const parts: BasePart[] = rates.map((t) => {
    const rate = t.value ?? 0
    const component = componentOf(t)

    // The code a rate points to: asked for while it isn't given, and kept once it is
    const pointer = t.pointsTo?.inputId ? t.pointsTo : t.resolvedFrom
    if (pointer?.inputId) {
      inputs.set(pointer.inputId, {
        id: pointer.inputId,
        label: pointer.question,
        help: pointer.help,
        type: "htsCode",
      })
    }

    if (t.notCalculated) {
      return {
        raw: t.raw,
        kind: "percent",
        rate: 0,
        basis: customsValue,
        // Waiting on the code it points to
        ...(t.pointsTo?.inputId ? { inputId: t.pointsTo.inputId } : {}),
        assumed: Boolean(t.pointsTo?.inputId),
        amount: 0,
        notCalculated: t.notCalculated,
      }
    }
    const from = t.resolvedFrom ? { resolvedFrom: { raw: t.resolvedFrom.raw, code: t.resolvedFrom.code } } : {}

    if (t.type === "percent") {
      if (!component) {
        return {
          ...from,
          raw: t.raw,
          kind: "percent",
          rate,
          basis: customsValue,
          assumed: false,
          amount: (customsValue * rate) / 100,
        }
      }
      const inputId = `baseValue:${slug(component)}`
      inputs.set(inputId, {
        id: inputId,
        label: `What is the value of ${withArticle(component)}?`,
        help: `The HTS charges ${t.raw}. Until you enter it, the whole customs value is used, so the duty shown is the most it can be.`,
        type: "number",
        unit: "USD",
      })
      const answer = Number(answers[inputId])
      const answered =
        answers[inputId] !== undefined &&
        answers[inputId] !== "" &&
        Number.isFinite(answer)
      const basis = answered ? answer : customsValue
      return {
        ...from,
        raw: t.raw,
        kind: "percent",
        rate,
        component,
        inputId,
        basis,
        assumed: !answered,
        amount: (basis * rate) / 100,
      }
    }

    // Amounts, e.g. "24¢ each", "3.7¢/kg on drained weight"
    const unit = unitLabel(t.unit ?? "unit")
    if (t.slidingScale) {
      inputs.set(POLARITY_INPUT, {
        id: POLARITY_INPUT,
        label: "What is the sugar's polarity?",
        help: `The HTS charges ${t.raw}. Until you enter it, ${t.slidingScale.underDegrees} degrees is used, so the duty shown is the most it can be.`,
        type: "number",
        unit: "degrees",
      })
      const polarity = answerFor(POLARITY_INPUT)
      const slidRate = slidingRate(t, polarity)
      const basis = quantity ?? 0
      return {
        ...from,
        raw: t.raw,
        kind: "amount",
        rate: slidRate,
        unit,
        inputId: POLARITY_INPUT,
        basis,
        assumed: polarity === null,
        amount: slidRate * basis,
      }
    }
    if (!component) {
      const basis = quantityFor(t, quantity, quantityUnit) ?? 0
      return {
        ...from,
        raw: t.raw,
        kind: "amount",
        rate,
        unit,
        basis,
        assumed: false,
        amount: rate * basis,
      }
    }
    const inputId = `baseQuantity:${slug(component)}`
    inputs.set(inputId, {
      id: inputId,
      label: quantityQuestion(component, unit),
      help: `The HTS charges ${t.raw}. Until you enter it, the total quantity is used.`,
      type: "number",
      unit,
    })
    const answer = Number(answers[inputId])
    const answered =
      answers[inputId] !== undefined &&
      answers[inputId] !== "" &&
      Number.isFinite(answer)
    const basis = answered ? answer : (quantity ?? 0)
    return {
      ...from,
      raw: t.raw,
      kind: "amount",
      rate,
      unit,
      component,
      inputId,
      basis,
      assumed: !answered,
      amount: rate * basis,
    }
  })

  return {
    parts,
    inputs: Array.from(inputs.values()),
    amount: parts.reduce((sum, p) => sum + p.amount, 0),
    wholeValuePct: parts
      .filter((p) => p.kind === "percent" && !p.component)
      .reduce((sum, p) => sum + p.rate, 0),
  }
}
