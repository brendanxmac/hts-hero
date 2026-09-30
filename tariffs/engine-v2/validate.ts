// Checks the rule data for mistakes that would silently produce wrong results.
// See HowTariffsWork.md §15. Errors should fail tests; warnings are for review.

import { describePeriod, ISO_DATE } from "./dates"
import { basisHandlers, conditionHandlers, rateHandlers } from "./handlers"
import { getRulesAsOf } from "./snapshot"
import { CodeSelector, Dated, ListRef, RuleSet, Tariff } from "./types"
import { todayIsoDate } from "./dates"

export interface ValidationResult {
  errors: string[]
  warnings: string[]
}

const isListRef = (value: unknown): value is ListRef =>
  typeof value === "object" && value !== null && "list" in value

export interface ValidateOptions {
  // Only run date-based checks from this date on, e.g. the first verified revision.
  // Before it, records aren't fully dated yet, so date-based warnings are noise.
  checkFrom?: string
}

export const validateRules = (
  rules: RuleSet,
  options: ValidateOptions = {},
): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // ── Dates ──
  const checkDates = (label: string, record: Dated) => {
    const { from, to } = record.effective ?? {}
    if (!record.effective) errors.push(`${label}: missing effective`)
    if (from && !ISO_DATE.test(from)) errors.push(`${label}: invalid effective.from "${from}"`)
    if (to && !ISO_DATE.test(to)) errors.push(`${label}: invalid effective.to "${to}"`)
    if (from && to && from >= to) errors.push(`${label}: effective.from ${from} is not before effective.to ${to}`)
  }

  const checkNoOverlap = (kind: string, records: { key: string; record: Dated }[]) => {
    const byKey = new Map<string, Dated[]>()
    records.forEach(({ key, record }) => byKey.set(key, [...(byKey.get(key) ?? []), record]))
    byKey.forEach((versions, key) => {
      const sorted = [...versions].sort((a, b) =>
        (a.effective?.from ?? "").localeCompare(b.effective?.from ?? ""),
      )
      for (let i = 1; i < sorted.length; i++) {
        const prevTo = sorted[i - 1].effective?.to
        const nextFrom = sorted[i].effective?.from ?? ""
        if (!prevTo || prevTo > nextFrom) {
          errors.push(
            `${kind} ${key}: overlapping versions (${describePeriod(sorted[i - 1].effective)} and ${describePeriod(sorted[i].effective)})`,
          )
        }
      }
    })
  }

  rules.tariffs.forEach((t) => checkDates(`Tariff ${t.code}`, t))
  rules.interactions.forEach((i) => checkDates(`Interaction ${i.id}`, i))
  rules.lists.forEach((l) => l.versions.forEach((v) => checkDates(`List ${l.id}`, v)))
  rules.fees.forEach((f) => checkDates(`Fee ${f.id}`, f))

  checkNoOverlap("Tariff", rules.tariffs.map((t) => ({ key: t.code, record: t })))
  checkNoOverlap("Interaction", rules.interactions.map((i) => ({ key: i.id, record: i })))
  checkNoOverlap("Fee", rules.fees.map((f) => ({ key: f.id, record: f })))
  rules.lists.forEach((l) =>
    checkNoOverlap("List", l.versions.map((v) => ({ key: l.id, record: v }))),
  )

  // ── References ──
  const listIds = new Set(rules.lists.map((l) => l.id))
  const programIds = new Set(rules.programs.map((p) => p.id))
  const inputIds = new Set(rules.inputs.map((i) => i.id))

  const checkLists = (label: string, selector: CodeSelector | "all" | undefined) => {
    if (!selector || selector === "all") return
    selector.forEach((entry) => {
      if (isListRef(entry) && !listIds.has(entry.list)) {
        errors.push(`${label}: unknown list "${entry.list}"`)
      }
    })
  }

  rules.lists.forEach((l) =>
    l.versions.forEach((v) =>
      (v.includes ?? []).forEach((ref) => {
        if (!listIds.has(ref.list)) errors.push(`List ${l.id}: includes unknown list "${ref.list}"`)
      }),
    ),
  )

  const checkTariff = (t: Tariff) => {
    const label = `Tariff ${t.code}`
    if (!t.scope?.countries) errors.push(`${label}: scope.countries is required (use "all")`)
    if (!t.scope?.codes) errors.push(`${label}: scope.codes is required (use "all")`)
    if (!programIds.has(t.program)) errors.push(`${label}: unknown program "${t.program}"`)
    if (!t.source) warnings.push(`${label}: no source`)

    if (t.scope?.countries !== "all") checkLists(label, t.scope?.countries as CodeSelector)
    checkLists(label, t.scope?.excludeCountries as CodeSelector)
    checkLists(label, t.scope?.codes)
    checkLists(label, t.scope?.excludeCodes)
    const whenAppliesPrograms = t.scope?.whenApplies?.programs ?? []
    whenAppliesPrograms.forEach((p) => {
      if (!programIds.has(p)) errors.push(`${label}: whenApplies refers to unknown program "${p}"`)
    })

    const conditions = t.requires ?? []
    conditions.forEach((c) => {
      const handler = conditionHandlers.get(c.kind)
      if (!handler) return errors.push(`${label}: no condition handler "${c.kind}"`)
      handler.inputs(c).forEach((id) => {
        if (!inputIds.has(id)) errors.push(`${label}: condition uses undefined input "${id}"`)
      })
    })
    const basis = t.basis ?? { kind: "fullValue" }
    if (!basisHandlers.has(basis.kind)) errors.push(`${label}: no basis handler "${basis.kind}"`)
    const rateRules = [t.rate, ...Object.values(t.rateByColumn ?? {})]
    rateRules.forEach((rule) => {
      if (!rateHandlers.has(rule.kind)) errors.push(`${label}: no rate handler "${rule.kind}"`)
    })
  }
  rules.tariffs.forEach(checkTariff)

  // ── Checks on every date where anything starts or ends ──
  const dates = new Set<string>([options.checkFrom ?? todayIsoDate(), todayIsoDate()])
  const addDates = (d: Dated) => {
    const bounds = [d.effective?.from, d.effective?.to]
    bounds.forEach((date) => {
      if (date && (!options.checkFrom || date >= options.checkFrom)) dates.add(date)
    })
  }
  rules.tariffs.forEach(addDates)
  rules.interactions.forEach(addDates)
  rules.lists.forEach((l) => l.versions.forEach(addDates))

  const tracked = new Set(rules.tariffs.map((t) => t.code))
  const reported = new Set<string>()
  const cycles = new Set<string>()

  dates.forEach((date) => {
    const snapshot = getRulesAsOf(rules, date)

    snapshot.tariffs.forEach((t) => {
      // References to tracked headings that aren't in effect on this date
      const exceptions = t.exceptions ?? []
      exceptions.forEach((ref) => {
        const key = `${t.code}->${ref}`
        if (tracked.has(ref) && !snapshot.tariffsByCode.has(ref) && !reported.has(key)) {
          reported.add(key)
          warnings.push(`Tariff ${t.code} lists exception ${ref}, which isn't in effect on ${date}`)
        }
      })
      // Empty lists
      const refs = [t.scope.codes, t.scope.countries].flatMap((s) => (s === "all" ? [] : s ?? []))
      refs.filter(isListRef).forEach((ref) => {
        const key = `${t.code}:${ref.list}:empty`
        if ((snapshot.lists.get(ref.list)?.size ?? 0) === 0 && !reported.has(key)) {
          reported.add(key)
          warnings.push(`Tariff ${t.code} uses list ${ref.list}, which is empty on ${date}`)
        }
      })
    })

    // Exception cycles among headings in effect
    const edges = (code: string) =>
      (snapshot.tariffsByCode.get(code)?.exceptions ?? []).filter((c) => snapshot.tariffsByCode.has(c))
    const visit = (code: string, path: string[]) => {
      edges(code).forEach((next) => {
        const i = path.indexOf(next)
        if (i >= 0) {
          const cycle = path.slice(i)
          const start = cycle.indexOf([...cycle].sort()[0])
          cycles.add([...cycle.slice(start), ...cycle.slice(0, start)].join(" → "))
        } else if (path.length < 8) {
          visit(next, [...path, next])
        }
      })
    }
    snapshot.tariffs.forEach((t) => visit(t.code, [t.code]))
  })

  cycles.forEach((cycle) =>
    warnings.push(`Exception cycle: ${cycle} (resolved at calculation time; see calculate.ts)`),
  )

  return { errors, warnings }
}
