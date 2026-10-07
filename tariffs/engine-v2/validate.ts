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

// A citation that identifies a document: not missing, and not just "Notice"
const hasCitation = (record: Dated) => {
  const citation = record.source?.citation?.trim()
  return !!citation && !/^notice\.?$/i.test(citation)
}

// When each subchapter III heading appears in the tariff tables of USITC's
// archived Chapter 99 PDFs (data/ch99-first-seen.json, `npm run ch99:archive`)
export interface HeadingArchive {
  revisions: string[]
  headings: Record<string, { first: string; last: string; missingFrom?: string[] }>
}

export interface ValidateOptions {
  // Only run date-based checks from this date on, e.g. the first verified revision.
  // Before it, records aren't fully dated yet, so date-based warnings are noise.
  checkFrom?: string
  // With this, records are checked against when their heading was in the HTS
  archive?: HeadingArchive
  // Start date of each revision in `archive`
  revisionStart?: (revision: string) => string | undefined
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

  // ── Prohibitions ──
  ;(rules.prohibitions ?? []).forEach((p) => {
    const label = `Prohibition ${p.id}`
    checkDates(label, p)
    if (!programIds.has(p.program)) errors.push(`${label}: unknown program "${p.program}"`)
    if (p.scope.countries !== "all") checkLists(label, p.scope.countries as CodeSelector)
    checkLists(label, p.scope.codes)
    ;(p.unless ?? []).forEach((condition) => {
      const handler = conditionHandlers.get(condition.kind)
      if (!handler) {
        errors.push(`${label}: no condition handler "${condition.kind}"`)
        return
      }
      handler.inputs(condition).forEach((id) => {
        if (!inputIds.has(id)) errors.push(`${label}: unknown input "${id}"`)
      })
    })
  })
  checkNoOverlap("Prohibition", (rules.prohibitions ?? []).map((p) => ({ key: p.id, record: p })))

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

  // Stand-in lists from the legacy migration, named after a heading instead of a U.S. note
  rules.lists
    .filter((l) => /^9903\./.test(l.id))
    .forEach((l) =>
      warnings.push(`List ${l.id} is named after a heading; replace it with a list named after its U.S. note subdivision`),
    )

  cycles.forEach((cycle) =>
    warnings.push(`Exception cycle: ${cycle} (resolved at calculation time; see calculate.ts)`),
  )

  // ── Against the HTS itself (HowTariffsWork.md §17.13) ──
  const { archive, revisionStart } = options
  if (archive && revisionStart) {
    const checkFrom = options.checkFrom ?? ""
    const lastRevision = archive.revisions[archive.revisions.length - 1]
    rules.tariffs.forEach((t) => {
      const seen = archive.headings[t.code]
      if (!seen) return
      const { from, to } = t.effective ?? {}
      const enteredHts = revisionStart(seen.first)
      // An undated record applies before its heading existed. Inside the checked
      // range that's a wrong result, so it's an error.
      if (!from && enteredHts && enteredHts > checkFrom && seen.first !== archive.revisions[0]) {
        errors.push(
          `Tariff ${t.code}: no start date, but the heading first appears in ${seen.first} (from ${enteredHts}). Undated, it applies before then; set effective.from to its legal start date.`,
        )
      }
      // Dated before its heading appeared: fine when the law was retroactive, but
      // that needs a citation
      if (from && enteredHts && from < enteredHts && !hasCitation(t)) {
        warnings.push(
          `Tariff ${t.code}: starts ${from}, before the heading first appears in ${seen.first} (${enteredHts}), with no citation for the date`,
        )
      }
      // Still in effect after the heading left the HTS
      if (seen.last !== lastRevision) {
        const i = archive.revisions.indexOf(seen.last)
        const removed = revisionStart(archive.revisions[i + 1])
        if (removed && (!to || to > removed) && (!checkFrom || !to || to > checkFrom)) {
          warnings.push(
            `Tariff ${t.code}: in effect after ${removed}, when the heading was removed from the HTS (last in ${seen.last})`,
          )
        }
      }
    })
  }

  // Dated records whose dates have no document behind them
  rules.tariffs.forEach((t) => {
    const { from, to } = t.effective ?? {}
    const inRange = (d?: string) => !!d && (!options.checkFrom || d >= options.checkFrom)
    if ((inRange(from) || inRange(to)) && !hasCitation(t)) {
      warnings.push(`Tariff ${t.code} (${describePeriod(t.effective)}): no citation for its dates beyond "Notice"`)
    }
  })

  return { errors, warnings }
}
