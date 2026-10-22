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
import { Answers, BasePart, DutyColumn, InputDefinition } from "./types"

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

export const getBaseRateParts = (
  baseRates: {
    general: string | null
    special: string | null
    other: string | null
  },
  column: DutyColumn,
  claimedPreference?: string,
): BaseTariffI[] => {
  if (column === "column2") return parseRateColumn(baseRates.other)
  if (column === "special") {
    return parseRateColumn(baseRates.special).filter((t) =>
      t.programs?.includes(claimedPreference),
    )
  }
  return parseRateColumn(baseRates.general)
}

// ── Components ──

// Phrases that mean the whole article, so no separate value is needed
// ("$1.32/t, including weight of container" is charged on the gross weight)
const WHOLE_ARTICLE = /^((the )?entire set|including weight of container)$/

// "on the value of the telescopic sight, if any" → "the telescopic sight",
// "33.9¢/kg of total sugars" → "total sugars", "15¢/jewel over 7" → "jewels over 7"
const componentOf = (t: BaseTariffI) => {
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

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

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
const POLARITY_INPUT = "basePolarity"
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

    if (t.type === "percent") {
      if (!component) {
        return {
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
        label: `Value of ${withArticle(component)} (USD)`,
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
        label: "Polarity (degrees)",
        help: `The HTS charges ${t.raw}. Until you enter it, ${t.slidingScale.underDegrees} degrees is used, so the duty shown is the most it can be.`,
        type: "number",
        unit: "degrees",
      })
      const polarity = answerFor(POLARITY_INPUT)
      const slidRate = slidingRate(t, polarity)
      const basis = quantity ?? 0
      return {
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
      label: `${capitalize(component.replace(/^the\s+/i, ""))} (${unit})`,
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
