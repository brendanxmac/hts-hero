// The calculation pipeline. See HowTariffsWork.md §12 for the steps.

import { calculateBase, getBaseRateParts, parseRateColumn } from "./base-rates"
import {
  basisHandlers,
  conditionHandlers,
  HandlerContext,
  rateHandlers,
} from "./handlers"
import {
  codeMatches,
  countryMatches,
  getRulesAsOf,
  selectorMatches,
} from "./snapshot"
import {
  CalculationInput,
  CalculationResult,
  DutyColumn,
  DutyLine,
  FeeLine,
  InputDefinition,
  RuleSet,
  RuleSnapshot,
  Tariff,
  TradePreference,
  Question,
  UnansweredInput,
} from "./types"

type State = "pending" | "on" | "off"

interface Evaluation {
  tariff: Tariff
  state: State
  // Why the tariff ended up off (or on), for the explanation
  reasons: string[]
  // Inputs that were unanswered while evaluating this tariff's conditions or basis
  unknownInputs: Set<string>
  // Every input consulted for this tariff, answered or not
  consultedInputs: Set<string>
  // Off only because an unanswered condition was assumed false
  offForMissingAnswer: boolean
  // At least one condition was decided by an actual answer
  answered: boolean
  basisValue: number
  ratePct?: number
  amount: number
}

const MAX_ROUNDS = 50

// Formal entry threshold; below it an entry may be informal, which uses a flat MPF (not modeled)
const INFORMAL_ENTRY_LIMIT = 2500

export const calculate = (
  rules: RuleSet,
  input: CalculationInput,
): CalculationResult => {
  const snapshot = getRulesAsOf(rules, input.asOf)
  const answers = input.answers ?? {}
  const warnings: string[] = []

  // ── 2. Column and base rate ──

  const availablePreferences = getAvailablePreferences(snapshot, input)
  const isColumn2 = snapshot.column2Countries.has(input.country)
  let column: DutyColumn = isColumn2 ? "column2" : "general"
  if (input.claimedPreference) {
    if (isColumn2) {
      warnings.push(
        `${input.country} is a Column 2 country; trade preference ${input.claimedPreference} ignored`,
      )
    } else if (
      availablePreferences.some((p) => p.symbol === input.claimedPreference)
    ) {
      column = "special"
    } else {
      warnings.push(
        `Trade preference ${input.claimedPreference} isn't available for this code and country`,
      )
    }
  }

  const baseRates = getBaseRateParts(
    input.baseRates,
    column,
    input.claimedPreference,
  )
  if (baseRates.some((t) => t.value === null)) {
    warnings.push(
      `Base rate "${baseRates.find((t) => t.value === null)?.raw}" couldn't be computed and was counted as 0`,
    )
  }
  if (baseRates.some((t) => t.type === "amount") && !input.quantity) {
    warnings.push(
      "The base rate includes a per-unit amount, but no quantity was given",
    )
  }
  // Parts that apply to a component (the case, lead content) use its value or weight when given
  const baseCalc = calculateBase(
    baseRates,
    input.customsValue,
    input.quantity,
    answers,
  )
  baseCalc.parts
    .filter(
      (p) =>
        p.kind === "percent" &&
        p.component &&
        !p.assumed &&
        p.basis > input.customsValue,
    )
    .forEach((p) =>
      warnings.push(
        `The value of ${p.component} is more than the customs value of the whole article`,
      ),
    )
  const baseRateEquivalentPct =
    input.customsValue > 0 ? (baseCalc.amount / input.customsValue) * 100 : 0
  const base = getBaseLine(baseCalc, input, column)

  const ctx: HandlerContext = {
    asOf: input.asOf,
    htsCode: input.htsCode,
    country: input.country,
    customsValue: input.customsValue,
    quantity: input.quantity,
    answers,
    baseRateEquivalentPct,
    claimedPreference:
      column === "special" ? input.claimedPreference : undefined,
    snapshot,
  }

  // ── 3. Candidates ──

  const evaluations: Evaluation[] = snapshot.tariffs
    .filter((t) => isCandidate(t, input, snapshot))
    .map(
      (tariff): Evaluation => ({
        tariff,
        state: "pending",
        reasons: [],
        unknownInputs: new Set<string>(),
        consultedInputs: new Set<string>(),
        offForMissingAnswer: false,
        answered: false,
        basisValue: 0,
        amount: 0,
      }),
    )
  const byCode = new Map(evaluations.map((e) => [e.tariff.code, e]))

  // ── 4. Conditions ──

  for (const evaluation of evaluations) {
    for (const condition of evaluation.tariff.requires ?? []) {
      const handler = conditionHandlers.get(condition.kind)
      if (!handler) throw new Error(`No condition handler "${condition.kind}"`)
      handler
        .inputs(condition)
        .forEach((id) => evaluation.consultedInputs.add(id))
      let result = handler.check(condition, ctx)
      if (result === "unknown") {
        handler
          .inputs(condition)
          .forEach((id) => evaluation.unknownInputs.add(id))
        result = condition.assume === true
        if (!result) evaluation.offForMissingAnswer = true
      } else if (handler.inputs(condition).length > 0) {
        evaluation.answered = true
      }
      if (!result) {
        evaluation.state = "off"
        evaluation.reasons.push(
          `Condition not met: ${handler.describe(condition)}`,
        )
        break
      }
    }

    // A basis that needs an unanswered input can't be calculated, so decide that
    // before exceptions: an off heading mustn't trigger or displace others
    const basis = evaluation.tariff.basis ?? { kind: "fullValue" }
    const basisHandler = basisHandlers.get(basis.kind)
    if (!basisHandler) throw new Error(`No basis handler "${basis.kind}"`)
    if (evaluation.state === "pending" && basis.kind !== "coveredBy") {
      basisHandler
        .inputs(basis)
        .forEach((id) => evaluation.consultedInputs.add(id))
      if (basisHandler.value(basis, ctx) === "unknown") {
        basisHandler
          .inputs(basis)
          .forEach((id) => evaluation.unknownInputs.add(id))
        evaluation.state = "off"
        evaluation.offForMissingAnswer = true
        evaluation.reasons.push(
          `Needs ${basisHandler.describe(basis)} to calculate`,
        )
      }
    }
  }

  // ── 5. Exceptions and whenApplies ──

  resolveExceptions(evaluations, byCode, snapshot, warnings)

  // ── 6. noStack interactions ──

  const on = () => evaluations.filter((e) => e.state === "on")
  for (const interaction of interactionsFor(snapshot, input)) {
    if (interaction.kind !== "noStack") continue
    const groups = interaction.order.map((selector) =>
      on().filter((e) => selectorMatches(selector, e.tariff, snapshot)),
    )
    const winner = groups.findIndex((group) => group.length > 0)
    if (winner < 0) continue
    for (const group of groups.slice(winner + 1)) {
      for (const evaluation of group) {
        evaluation.state = "off"
        evaluation.reasons.push(`Not stacked: ${interaction.description}`)
      }
    }
  }

  // ── 7. Value split ──

  const coveredBy: Evaluation[] = []
  for (const evaluation of on()) {
    const basis = evaluation.tariff.basis ?? { kind: "fullValue" }
    if (basis.kind === "coveredBy") {
      coveredBy.push(evaluation)
      continue
    }
    // Unknown bases were switched off in step 4
    evaluation.basisValue = basisHandlers
      .get(basis.kind)
      .value(basis, ctx) as number
  }

  for (const evaluation of coveredBy) {
    const selector = evaluation.tariff.basis.selector as Parameters<
      typeof selectorMatches
    >[0]
    const covered = on()
      .filter(
        (e) =>
          e !== evaluation && selectorMatches(selector, e.tariff, snapshot),
      )
      .reduce((sum, e) => sum + e.basisValue, 0)
    evaluation.basisValue = Math.min(input.customsValue, covered)
  }

  // Partial exceptions: a displacing heading that covers only part of the value
  for (const evaluation of on()) {
    for (const code of evaluation.tariff.exceptions ?? []) {
      const exception = byCode.get(code)
      if (
        !exception ||
        exception.state !== "on" ||
        !isPartial(exception.tariff)
      )
        continue
      evaluation.basisValue = Math.max(
        0,
        evaluation.basisValue - exception.basisValue,
      )
      evaluation.reasons.push(`Doesn't apply to the value covered by ${code}`)
    }
  }

  for (const interaction of interactionsFor(snapshot, input)) {
    if (interaction.kind !== "excludePortion") continue
    const covered = Math.min(
      input.customsValue,
      on()
        .filter((e) => selectorMatches(interaction.winner, e.tariff, snapshot))
        .reduce((sum, e) => sum + e.basisValue, 0),
    )
    if (covered === 0) continue
    for (const evaluation of on()) {
      if (!selectorMatches(interaction.losers, evaluation.tariff, snapshot))
        continue
      evaluation.basisValue = Math.max(0, evaluation.basisValue - covered)
      evaluation.reasons.push(`Partly excluded: ${interaction.description}`)
    }
  }

  for (const evaluation of on()) {
    if (evaluation.basisValue === 0 && input.customsValue > 0) {
      evaluation.state = "off"
      evaluation.reasons.push("No value left for this heading to apply to")
    }
  }

  // ── 8. Rates ──

  for (const evaluation of on()) {
    const rule =
      evaluation.tariff.rateByColumn?.[column] ?? evaluation.tariff.rate
    const handler = rateHandlers.get(rule.kind)
    if (!handler) throw new Error(`No rate handler "${rule.kind}"`)
    const result = handler.compute(rule, ctx, evaluation.basisValue)
    evaluation.ratePct = result.pct
    evaluation.amount =
      (evaluation.basisValue * (result.pct ?? 0)) / 100 + (result.amount ?? 0)
  }

  // ── 9. Caps ──

  for (const interaction of interactionsFor(snapshot, input)) {
    if (interaction.kind !== "capTotal") continue
    const covered = on().filter((e) =>
      selectorMatches(interaction.covers, e.tariff, snapshot),
    )
    const coveredAmount = covered.reduce((sum, e) => sum + e.amount, 0)
    const total =
      coveredAmount + (interaction.includesBaseRate ? base.amount : 0)
    const cap = (input.customsValue * interaction.pct) / 100
    if (total <= cap || coveredAmount === 0) continue
    const scale = Math.max(0, coveredAmount - (total - cap)) / coveredAmount
    for (const evaluation of covered) {
      evaluation.amount *= scale
      evaluation.reasons.push(`Capped: ${interaction.description}`)
    }
  }

  // ── 10. Fees ──

  const fees: FeeLine[] = snapshot.fees
    .filter(
      (fee) =>
        !input.transportMode ||
        !fee.modes ||
        fee.modes.includes(input.transportMode),
    )
    .map((fee) => {
      let amount = (input.customsValue * fee.ratePct) / 100
      let note: string | undefined
      if (fee.min !== undefined && amount < fee.min) {
        amount = fee.min
        note = `Minimum applied ($${fee.min.toFixed(2)})`
      } else if (fee.max !== undefined && amount > fee.max) {
        amount = fee.max
        note = `Maximum applied ($${fee.max.toFixed(2)})`
      }
      if (fee.id === "mpf" && input.customsValue < INFORMAL_ENTRY_LIMIT) {
        note = [
          note,
          "Entries under $2,500 may be informal, with a flat MPF instead",
        ]
          .filter(Boolean)
          .join(". ")
      }
      return { id: fee.id, name: fee.name, ratePct: fee.ratePct, amount, note }
    })

  // ── 11. Explain ──

  const lines = evaluations.map(toDutyLine)
  const totalDuty =
    base.amount +
    lines.reduce((sum, l) => sum + (l.status === "applies" ? l.amount : 0), 0)

  return {
    asOf: input.asOf,
    htsCode: input.htsCode,
    country: input.country,
    column,
    claimedPreference:
      column === "special" ? input.claimedPreference : undefined,
    availablePreferences,
    baseRateEquivalentPct,
    requiresQuantity: baseCalc.parts.some(
      (p) => p.kind === "amount" && !p.component,
    ),
    base,
    baseParts: baseCalc.parts,
    lines,
    fees,
    totalDuty,
    totalFees: fees.reduce((sum, f) => sum + f.amount, 0),
    unansweredInputs: [
      ...baseCalc.inputs
        .filter((input) =>
          baseCalc.parts.some((p) => p.inputId === input.id && p.assumed),
        )
        .map((input) => ({ input, headings: ["BASE"] })),
      ...getUnansweredInputs(evaluations, snapshot),
    ],
    // Base-rate components first: they change the base duty directly
    questions: [
      ...baseCalc.inputs.map((input) => ({
        input,
        headings: ["BASE"],
        answered: !baseCalc.parts.some(
          (p) => p.inputId === input.id && p.assumed,
        ),
      })),
      ...getQuestions(evaluations, snapshot),
    ],
    warnings,
  }
}

// ── Helpers ──

const isCandidate = (
  tariff: Tariff,
  input: CalculationInput,
  snapshot: RuleSnapshot,
) => {
  const { scope } = tariff
  return (
    countryMatches(scope.countries, input.country, snapshot) &&
    !countryMatches(scope.excludeCountries, input.country, snapshot) &&
    codeMatches(scope.codes, input.htsCode, snapshot) &&
    !codeMatches(scope.excludeCodes, input.htsCode, snapshot)
  )
}

const isPartial = (tariff: Tariff) => tariff.basis?.kind === "coveredBy"

// Settles which candidates apply, given that exceptions switch headings off and
// `whenApplies` switches them on. Repeats until nothing changes; cycles that can't
// be settled are broken in favor of headings backed by an answer, then switched off.
const resolveExceptions = (
  evaluations: Evaluation[],
  byCode: Map<string, Evaluation>,
  snapshot: RuleSnapshot,
  warnings: string[],
) => {
  const eligible = evaluations.filter((e) => e.state === "pending")

  const fullExceptionsOf = (e: Evaluation) =>
    (e.tariff.exceptions ?? [])
      .map((code) => byCode.get(code))
      .filter((x) => x && x !== e && x.state !== "off" && !isPartial(x.tariff))

  const triggersOf = (e: Evaluation) =>
    eligible.filter(
      (other) =>
        other !== e &&
        selectorMatches(e.tariff.scope.whenApplies, other.tariff, snapshot),
    )

  const settle = () => {
    for (let round = 0; round < MAX_ROUNDS; round++) {
      let changed = false
      for (const e of eligible) {
        if (e.state !== "pending") continue
        const exceptions = fullExceptionsOf(e)
        const activeException = exceptions.find((x) => x.state === "on")
        const triggers = e.tariff.scope.whenApplies ? triggersOf(e) : null

        if (activeException) {
          e.state = "off"
          e.reasons.push(`Excluded by ${activeException.tariff.code}`)
          changed = true
        } else if (triggers && triggers.every((t) => t.state === "off")) {
          e.state = "off"
          e.reasons.push(
            "Only applies alongside headings that don't apply here",
          )
          changed = true
        } else if (
          exceptions.length === 0 &&
          (!triggers || triggers.some((t) => t.state === "on"))
        ) {
          e.state = "on"
          if (triggers) {
            const trigger = triggers.find((t) => t.state === "on")
            e.reasons.push(`Applies because ${trigger.tariff.code} applies`)
          }
          changed = true
        }
      }
      if (!changed) return
    }
    throw new Error("Exception resolution did not settle")
  }

  settle()

  const stuck = eligible.filter((e) => e.state === "pending")
  if (stuck.length === 0) return

  const preferred = stuck.filter((e) => e.answered)
  for (const e of preferred) {
    e.state = "on"
    e.reasons.push("Circular exceptions: applies because it was confirmed")
  }
  settle()

  const remaining = eligible.filter((e) => e.state === "pending")
  if (remaining.length > 0) {
    const codes = remaining.map((e) => e.tariff.code).join(", ")
    warnings.push(
      `Circular exceptions between ${codes}; none of them were applied`,
    )
    for (const e of remaining) {
      e.state = "off"
      e.reasons.push("Circular exceptions with other headings")
    }
  }
}

const interactionsFor = (snapshot: RuleSnapshot, input: CalculationInput) =>
  snapshot.interactions.filter(
    (i) =>
      (!i.appliesTo?.countries ||
        countryMatches(i.appliesTo.countries, input.country, snapshot)) &&
      (!i.appliesTo?.codes ||
        codeMatches(i.appliesTo.codes, input.htsCode, snapshot)),
  )

const getAvailablePreferences = (
  snapshot: RuleSnapshot,
  input: CalculationInput,
) => {
  const symbols = new Set(
    parseRateColumn(input.baseRates.special).flatMap((t) => t.programs ?? []),
  )
  return snapshot.preferences.filter(
    (p: TradePreference) =>
      symbols.has(p.symbol) &&
      countryMatches(p.countries, input.country, snapshot),
  )
}

const getBaseLine = (
  baseCalc: ReturnType<typeof calculateBase>,
  input: CalculationInput,
  column: DutyColumn,
): DutyLine => {
  const columnName = {
    general: "Column 1 General",
    special: "Column 1 Special",
    column2: "Column 2",
  }[column]
  const assumedValue = baseCalc.parts
    .filter((p) => p.assumed && p.kind === "percent")
    .map((p) => p.component)
  const assumedWeight = baseCalc.parts
    .filter((p) => p.assumed && p.kind === "amount")
    .map((p) => p.component)
  return {
    code: "BASE",
    name: `Base duty (${columnName})`,
    status: "applies",
    basisValue: input.customsValue,
    ratePct: baseCalc.wholeValuePct,
    amount: baseCalc.amount,
    reasons: [
      baseCalc.parts.map((p) => p.raw).join(" + ") || "Free",
      ...(assumedValue.length
        ? [
            `Uses the whole customs value for ${assumedValue.join(", ")} until you enter it, so this is the most it can be`,
          ]
        : []),
      ...(assumedWeight.length
        ? [`Uses the total quantity for ${assumedWeight.join(", ")} until you enter it`]
        : []),
    ],
  }
}

const toDutyLine = (e: Evaluation): DutyLine => {
  let status: DutyLine["status"]
  if (e.state === "on") status = "applies"
  else if (e.offForMissingAnswer) status = "needsAnswer"
  else if (
    e.reasons.some(
      (r) => r.startsWith("Condition not met") || r.startsWith("Only applies"),
    )
  )
    status = "notApplicable"
  else status = "excluded"

  return {
    code: e.tariff.code,
    name: e.tariff.name,
    program: e.tariff.program,
    status,
    basisValue: e.state === "on" ? e.basisValue : 0,
    ratePct: e.state === "on" ? e.ratePct : undefined,
    amount: e.state === "on" ? e.amount : 0,
    reasons: e.reasons,
    source: e.tariff.source,
  }
}

const getQuestions = (
  evaluations: Evaluation[],
  snapshot: RuleSnapshot,
): Question[] => {
  const byInput = new Map<string, { headings: string[]; answered: boolean }>()
  for (const e of evaluations) {
    e.consultedInputs.forEach((id) => {
      const entry = byInput.get(id) ?? { headings: [], answered: true }
      entry.headings.push(e.tariff.code)
      if (e.unknownInputs.has(id)) entry.answered = false
      byInput.set(id, entry)
    })
  }
  return Array.from(byInput).map(([id, { headings, answered }]) => ({
    input:
      snapshot.inputs.get(id) ??
      ({ id, label: id, type: "boolean" } as InputDefinition),
    headings,
    answered,
  }))
}

const getUnansweredInputs = (
  evaluations: Evaluation[],
  snapshot: RuleSnapshot,
): UnansweredInput[] => {
  const byInput = new Map<string, string[]>()
  for (const e of evaluations) {
    e.unknownInputs.forEach((id) => {
      byInput.set(id, [...(byInput.get(id) ?? []), e.tariff.code])
    })
  }
  return Array.from(byInput).map(([id, headings]) => ({
    input:
      snapshot.inputs.get(id) ??
      ({ id, label: id, type: "boolean" } as InputDefinition),
    headings,
  }))
}
