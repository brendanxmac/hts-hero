import { calculate } from "../../tariffs/engine-v2/calculate"
import { AllRules } from "../../tariffs/engine-v2/data"
import type { CalculationResult } from "../../tariffs/engine-v2/types"
import { addDays } from "../../tariffs/engine-v2/history"
import type { CatalogItem } from "../../components/tariff-tracker/catalog"
import type { TrackedProduct } from "../../components/tariff-tracker/report"
import { matchImport, scopeOf, type MatchableUpdate, type MatchLevel } from "./match"

// What one tariff update does to each of an account's imports. Shared by the server (which stores
// the levels for alerts: impacts.ts) and the Tracker's Tariff impact tab (which shows the detail),
// so what an alert says and what the tab shows are worked out the same way.
//
// Confirmed comes from the duty engine: when the update names a Chapter 99 heading the engine
// knows, every import is worked out the day before the update took effect and on the day (or the
// day the engine has the change, when that's a little later); if one of its headings starts or
// stops applying, or applies and the duty changes, the import is confirmed, with the change in
// duty on one shipment. An import ban that starts that day on an import the update names confirms
// too. A duty heading waiting on the user's answer makes it likely. Likely and possible otherwise
// come from what the update names (match.ts).

export interface ImpactUpdate extends MatchableUpdate {
  id: string
  effective_on: string | null
}

export type ImpactReason =
  // Confirmed by the engine
  | "starts" // one of its headings starts applying
  | "ends" // one of its headings stops applying
  | "changes" // one of its headings applies before and after, at a different duty
  | "ban" // an import ban starts
  // Likely
  | "answer" // the engine has the duty, waiting on one of the user's answers
  | "named" // its scope names the import's code (or every product) and country
  // Possible
  | "country" // it names the import's country, not its code

export interface ImportImpact {
  key: string
  level: MatchLevel
  reason: ImpactReason
  // Confirmed: the day the change shows in the engine, and the import worked out the day before
  // and on it
  date: string | null
  before: DutyAt | null
  after: DutyAt | null
  beforePct: number | null
  afterPct: number | null
  deltaUsd: number | null
}

const ENGINE_HEADINGS = new Set(AllRules.tariffs.map((t) => t.code))
// Headings that charge a duty (not exemptions and other free headings)
const DUTY_HEADINGS = new Set(AllRules.tariffs.filter((t) => t.rate.kind !== "free").map((t) => t.code))

const round = (n: number) => Math.round(n * 100) / 100

const DAY = 86_400_000
const daysAfter = (date: string, from: string) => (Date.parse(date) - Date.parse(from)) / DAY

// The days to look for the change on: the update's effective date, then the days the engine starts
// or stops its headings from a week before it to a month after (a delay or a different reading
// moves the date: the Canada Section 338 duties were announced for August 19 and took effect
// August 22), nearest first. Not further back: guidance on an action already in force would take
// the action's own change as its own.
const changeDates = (effectiveOn: string, headings: Set<string>) => {
  const dates = new Set<string>()
  for (const t of AllRules.tariffs) {
    if (!headings.has(t.code)) continue
    for (const d of [t.effective.from, t.effective.to]) if (d && d !== effectiveOn && daysAfter(d, effectiveOn) >= -7 && daysAfter(d, effectiveOn) <= 31) dates.add(d)
  }
  const distance = (d: string) => Math.abs(daysAfter(d, effectiveOn))
  return [effectiveOn, ...Array.from(dates).sort((a, b) => distance(a) - distance(b)).slice(0, 3)]
}

const headingApplies = (p: DutyAt, headings: Set<string>) => p.result.lines.some((l) => headings.has(l.code) && l.status === "applies")

// A heading that charges a duty waits on an answer the user hasn't given (content, use, a claim)
const dutyOpen = (p: DutyAt, headings: Set<string>) => p.result.lines.some((l) => headings.has(l.code) && l.status === "needsAnswer" && DUTY_HEADINGS.has(l.code))

const bans = (p: DutyAt) => new Set(p.result.prohibitions.map((b) => b.id))

// An import's duty on a given day: the engine's answer for its saved shipment and answers (what
// answering each open question would change isn't needed here, and is most of the work)
export interface DutyAt {
  result: CalculationResult
  totalPct: number
}

// Worked out once per import and day, so updates that share dates (and a page that comes back to
// one) don't work it out again
export type DutyOn = (p: TrackedProduct, date: string) => DutyAt
export const dutyOn = (): DutyOn => {
  const worked = new Map<string, DutyAt>()
  return (p, date) => {
    const id = `${p.key}|${date}`
    if (!worked.has(id)) {
      const result = calculate(AllRules, { ...p.input, asOf: date, answers: p.adjustments.answers ?? {} })
      worked.set(id, { result, totalPct: (result.totalDuty / p.customsValue) * 100 })
    }
    return worked.get(id)!
  }
}

// The confirmed (or engine-likely) impact of an update on one import, if any
const engineImpact = (u: ImpactUpdate, p: TrackedProduct, known: Set<string>, dates: string[], on: DutyOn): ImportImpact | null => {
  for (const date of dates) {
    const after = on(p, date)
    const before = on(p, addDays(date, -1))
    const now = headingApplies(after, known)
    const then = headingApplies(before, known)
    const delta = after.result.totalDuty - before.result.totalDuty
    if (!(now || then) || (now === then && Math.abs(delta) < 0.01)) continue
    return {
      key: p.key,
      level: "confirmed",
      reason: now && !then ? "starts" : then && !now ? "ends" : "changes",
      date,
      before,
      after,
      beforePct: round(before.totalPct),
      afterPct: round(after.totalPct),
      deltaUsd: round(delta),
    }
  }
  if (u.effective_on && dutyOpen(on(p, u.effective_on), known))
    return { key: p.key, level: "likely", reason: "answer", date: null, before: null, after: null, beforePct: null, afterPct: null, deltaUsd: null }
  return null
}

// Every import the update affects or may affect, one each
export const importImpacts = (u: ImpactUpdate, items: CatalogItem[], products: TrackedProduct[], on: DutyOn): ImportImpact[] => {
  if (u.kind === "hts_revision") return []
  const out: ImportImpact[] = []
  const decided = new Set<string>()
  const scope = scopeOf(u)
  const known = new Set(scope.headings.filter((h) => ENGINE_HEADINGS.has(h)))
  if (known.size && u.effective_on) {
    const dates = changeDates(u.effective_on, known)
    for (const p of products) {
      const impact = engineImpact(u, p, known, dates, on)
      if (impact) {
        decided.add(p.key)
        out.push(impact)
      }
    }
  }
  const byKey = new Map(products.map((p) => [p.key, p]))
  for (const item of items) {
    const key = `${item.code}-${item.country}`
    const p = byKey.get(key)
    if (!p || decided.has(key)) continue
    const level = matchImport(scope, item)
    if (!level) continue
    decided.add(key)
    // An import ban that starts the day the update takes effect, on an import it names
    if (level === "likely" && u.effective_on) {
      const after = on(p, u.effective_on)
      const before = on(p, addDays(u.effective_on, -1))
      const was = bans(before)
      if (Array.from(bans(after)).some((id) => !was.has(id))) {
        out.push({ key, level: "confirmed", reason: "ban", date: u.effective_on, before, after, beforePct: round(before.totalPct), afterPct: round(after.totalPct), deltaUsd: 0 })
        continue
      }
    }
    out.push({ key, level, reason: level === "likely" ? "named" : "country", date: null, before: null, after: null, beforePct: null, afterPct: null, deltaUsd: null })
  }
  return out
}
