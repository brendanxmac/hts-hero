// Handler registries: the engine's extension points. Records name a handler by `kind`.
// Rule: once past results depend on a handler, never change its behavior; register a new kind.
// See HowTariffsWork.md §11.

import { Answers, IsoDate, RuleSnapshot, Tri } from "./types"

export interface HandlerContext {
  asOf: IsoDate
  htsCode: string
  country: string
  customsValue: number
  quantity?: number
  answers: Answers
  baseRateEquivalentPct: number
  claimedPreference?: string
  snapshot: RuleSnapshot
}

type Params = Record<string, unknown>

export interface ConditionHandler {
  // Input ids this condition reads (so the UI can ask for them)
  inputs: (params: Params) => string[]
  check: (params: Params, ctx: HandlerContext) => Tri
  describe: (params: Params) => string
}

export interface BasisHandler {
  inputs: (params: Params) => string[]
  // "coveredBy" needs the other lines' bases, so it's resolved by the pipeline itself
  value: (params: Params, ctx: HandlerContext) => number | "unknown"
  describe: (params: Params) => string
}

export interface RateResult {
  pct?: number // percent of the basis value
  amount?: number // dollars
}

export interface RateHandler {
  inputs: (params: Params) => string[]
  compute: (params: Params, ctx: HandlerContext, basisValue: number) => RateResult
  describe: (params: Params) => string
}

export const conditionHandlers = new Map<string, ConditionHandler>()
export const basisHandlers = new Map<string, BasisHandler>()
export const rateHandlers = new Map<string, RateHandler>()

const register = <T>(registry: Map<string, T>, kind: string, handler: T) => {
  if (registry.has(kind)) throw new Error(`Handler "${kind}" is already registered`)
  registry.set(kind, handler)
}

const none = () => [] as string[]

const compare = (value: number, op: unknown, target: number) => {
  switch (op) {
    case "<":
      return value < target
    case "<=":
      return value <= target
    case ">":
      return value > target
    case ">=":
      return value >= target
    default:
      throw new Error(`Unknown comparison "${String(op)}"`)
  }
}

// ── Conditions ──

// The base rate equivalent (percent) compared with a threshold. See §9.3.
register(conditionHandlers, "baseRate", {
  inputs: none,
  check: (p, ctx) => compare(ctx.baseRateEquivalentPct, p.op, p.pct as number),
  describe: (p) => `base rate ${String(p.op)} ${String(p.pct)}%`,
})

// A yes/no answer must equal `equals` (default true).
register(conditionHandlers, "answer", {
  inputs: (p) => [p.input as string],
  check: (p, ctx) => {
    const value = ctx.answers[p.input as string]
    if (value === undefined || value === null) return "unknown"
    return value === (p.equals ?? true)
  },
  describe: (p) => `${String(p.input)} = ${String(p.equals ?? true)}`,
})

// A date answer must be before `date`.
register(conditionHandlers, "dateBefore", {
  inputs: (p) => [p.input as string],
  check: (p, ctx) => {
    const value = ctx.answers[p.input as string]
    if (!value) return "unknown"
    return (value as string) < (p.date as string)
  },
  describe: (p) => `${String(p.input)} before ${String(p.date)}`,
})

// A percent or number answer compared with a threshold.
register(conditionHandlers, "inputCompare", {
  inputs: (p) => [p.input as string],
  check: (p, ctx) => {
    const value = ctx.answers[p.input as string]
    if (value === undefined || value === null || value === "") return "unknown"
    return compare(Number(value), p.op, p.value as number)
  },
  describe: (p) => `${String(p.input)} ${String(p.op)} ${String(p.value)}`,
})

// The importer claims (or doesn't claim) one of the listed trade preferences (SPI symbols).
register(conditionHandlers, "preferenceClaimed", {
  inputs: none,
  check: (p, ctx) =>
    (p.symbols as string[]).includes(ctx.claimedPreference) === (p.equals ?? true),
  describe: (p) =>
    `${p.equals === false ? "not claiming" : "claiming"} trade preference ${(p.symbols as string[]).join(" or ")}`,
})

// ── Value bases ──

register(basisHandlers, "fullValue", {
  inputs: none,
  value: (_p, ctx) => ctx.customsValue,
  describe: () => "full customs value",
})

// The value of one metal's content, from a percent-of-value answer
register(basisHandlers, "metalContent", {
  inputs: (p) => [`${String(p.metal)}ContentPct`],
  value: (p, ctx) => {
    const pct = ctx.answers[`${String(p.metal)}ContentPct`]
    if (pct === undefined || pct === null || pct === "") return "unknown"
    return (ctx.customsValue * Number(pct)) / 100
  },
  describe: (p) => `${String(p.metal)} content value`,
})

// Resolved by the pipeline: the value covered by other applying tariffs matching `selector`
register(basisHandlers, "coveredBy", {
  inputs: none,
  value: () => {
    throw new Error("coveredBy is resolved by the pipeline")
  },
  describe: () => "value covered by the listed programs",
})

// ── Rates ──

register(rateHandlers, "adValorem", {
  inputs: none,
  compute: (p) => ({ pct: p.pct as number }),
  describe: (p) => `${String(p.pct)}%`,
})

register(rateHandlers, "perUnit", {
  inputs: none,
  compute: (p, ctx) => ({ amount: (p.amount as number) * (ctx.quantity ?? 0) }),
  describe: (p) => `$${String(p.amount)}/${String(p.per ?? "unit")}`,
})

// Tops the base rate up to `pct`: max(0, pct − base rate equivalent). See §19.2.
register(rateHandlers, "topUpTo", {
  inputs: none,
  compute: (p, ctx) => ({
    pct: Math.max(0, (p.pct as number) - ctx.baseRateEquivalentPct),
  }),
  describe: (p) => `${String(p.pct)}% minus the base rate`,
})

register(rateHandlers, "free", {
  inputs: none,
  compute: () => ({ pct: 0 }),
  describe: () => "Free",
})
