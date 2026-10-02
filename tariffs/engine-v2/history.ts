import { calculate } from "./calculate"
import { getRevisionForDate, HtsRevision } from "./revisions"
import { CalculationInput, CalculationResult, DutyLine, IsoDate, RuleSet } from "./types"

// How one entry's duty changes over a date range: the same code, country, value and answers,
// recalculated on every date a rule in the data starts or stops.

// A stretch of dates with the same duty, line for line
export interface HistorySegment {
  from: IsoDate
  to: IsoDate // exclusive
  revision?: HtsRevision // the revision in force on `from`
  result: CalculationResult
  // Applied lines that cost something, by Chapter 99 heading
  charged: DutyLine[]
  // Changes from the previous segment; empty for the first
  changes: LineChange[]
}

export interface LineChange {
  kind: "added" | "removed" | "changed"
  code: string // Chapter 99 heading, or "BASE"
  name: string
  program?: string
  before?: DutyLine
  after?: DutyLine
  delta: number // change in duty, USD
}

export const addDays = (date: IsoDate, days: number): IsoDate => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// Every date in [from, to) on which some rule record starts or stops
export const ruleChangeDates = (rules: RuleSet, from: IsoDate, to: IsoDate): IsoDate[] => {
  const dates = new Set<IsoDate>([from])
  const add = (date?: IsoDate) => {
    if (date && from < date && date < to) dates.add(date)
  }
  const records = [
    ...rules.tariffs,
    ...rules.lists.flatMap((l) => l.versions),
    ...rules.interactions,
    ...rules.columnAssignments,
    ...rules.preferences,
    ...rules.fees,
  ]
  records.forEach((r) => {
    add(r.effective.from)
    add(r.effective.to)
  })
  return Array.from(dates).sort()
}

const charged = (result: CalculationResult) => [
  result.base,
  ...result.lines.filter((l) => l.status === "applies" && l.amount > 0),
]

// Two results cost the same if every charged line has the same amount
const sameDuty = (a: CalculationResult, b: CalculationResult) => {
  const key = (r: CalculationResult) =>
    charged(r)
      .map((l) => `${l.code}:${l.amount.toFixed(2)}`)
      .join("|")
  return key(a) === key(b)
}

const diff = (before: CalculationResult, after: CalculationResult): LineChange[] => {
  const was = new Map(charged(before).map((l) => [l.code, l]))
  const now = new Map(charged(after).map((l) => [l.code, l]))
  const changes: LineChange[] = []
  now.forEach((line, code) => {
    const old = was.get(code)
    if (!old) {
      changes.push({ kind: "added", code, name: line.name, program: line.program, after: line, delta: line.amount })
    } else if (old.amount.toFixed(2) !== line.amount.toFixed(2)) {
      changes.push({
        kind: "changed",
        code,
        name: line.name,
        program: line.program,
        before: old,
        after: line,
        delta: line.amount - old.amount,
      })
    }
  })
  was.forEach((line, code) => {
    if (!now.has(code)) {
      changes.push({ kind: "removed", code, name: line.name, program: line.program, before: line, delta: -line.amount })
    }
  })
  // Biggest effect first
  return changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
}

// The entry's duty on each stretch of dates in [from, to), merging stretches that cost the same
export const calculateHistory = (
  rules: RuleSet,
  input: CalculationInput,
  from: IsoDate,
  to: IsoDate,
): HistorySegment[] => {
  const segments: HistorySegment[] = []
  ruleChangeDates(rules, from, to).forEach((date) => {
    const result = calculate(rules, { ...input, asOf: date })
    const last = segments[segments.length - 1]
    if (last && sameDuty(last.result, result)) return
    if (last) last.to = date
    segments.push({
      from: date,
      to,
      revision: getRevisionForDate(date),
      result,
      charged: charged(result),
      changes: last ? diff(last.result, result) : [],
    })
  })
  return segments
}

// The last day a segment covers, for display ("Apr 8 – Apr 22")
export const lastDay = (segment: HistorySegment) => addDays(segment.to, -1)
