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

const parsePart = (part: string) => {
  const paren = part.indexOf("(")
  const rate = paren >= 0 ? part.slice(0, paren) : part
  const programs = paren >= 0 ? part.slice(paren) : ""
  return getBaseTariffs(
    `${normalizeRateText(rate).trim()}${programs ? ` ${programs}` : ""}`,
  )
}

// Every rate part in a column, e.g. "Free (A,AU,...) 3.15% (JP)" → two parts with their programs
export const parseRateColumn = (raw: string | null): BaseTariffI[] =>
  splitOnClosingParen(raw ?? "")
    .map(parsePart)
    .flatMap((parsed) => parsed.tariffs)

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
const WHOLE_ARTICLE = /^(the )?entire set$/

// "on the value of the telescopic sight, if any" → "the telescopic sight"
const componentOf = (details?: string) => {
  if (!details) return null
  const component = details
    .replace(/^on\s+/i, "")
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
const unitLabel = (unit: string) => (unit === "pfliter" ? "proof liter" : unit)

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
): BaseCalculation => {
  const inputs = new Map<string, InputDefinition>()

  const parts: BasePart[] = rates.map((t) => {
    const rate = t.value ?? 0
    const component = componentOf(t.details)

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
    if (!component) {
      const basis = quantity ?? 0
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
