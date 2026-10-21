import { CodeList, CodeListVersion, IsoDate, Source, Tariff } from "./types"

// ── Tariffs ──

export interface TariffChange {
  from: IsoDate
  // Fields that change from this date on. Anything not listed carries over.
  set?: Partial<Omit<Tariff, "code" | "effective">>
  // The tariff stops applying on `from` (must be the last change)
  ends?: boolean
  source?: Source
}

// Expands one tariff and its dated changes into back-to-back records. See HowTariffsWork.md §14.3.
export const tariffVersions = (base: Tariff, changes: TariffChange[]): Tariff[] => {
  if (base.effective.to && changes.length > 0) {
    throw new Error(
      `${base.code}: base record has effective.to; put the end in changes instead`,
    )
  }

  const sorted = [...changes].sort((a, b) => a.from.localeCompare(b.from))
  const records: Tariff[] = []
  let current: Tariff | null = base

  sorted.forEach((change, i) => {
    records.push({ ...current, effective: { ...current.effective, to: change.from } })

    if (change.ends) {
      if (i !== sorted.length - 1) {
        throw new Error(`${base.code}: changes found after it ends`)
      }
      current = null
      return
    }

    current = {
      ...current,
      ...change.set,
      effective: { from: change.from },
      source: change.source ?? current.source,
    }
  })

  if (current) records.push(current)
  return records
}

// ── Code lists ──

export interface CodeListChange {
  from: IsoDate
  add?: string[]
  remove?: string[]
  ends?: boolean
  source?: Source
}

export interface CodeListBase extends Omit<CodeList, "versions"> {
  codes: string[]
  effective: CodeListVersion["effective"]
  source?: Source
}

// Expands a starting list plus dated additions/removals into list versions. See HowTariffsWork.md §7.2.
export const codeListVersions = (
  base: CodeListBase,
  changes: CodeListChange[],
): CodeList => {
  const { codes, effective, source, ...list } = base
  const sorted = [...changes].sort((a, b) => a.from.localeCompare(b.from))
  const versions: CodeListVersion[] = []
  let current: CodeListVersion | null = { codes, effective, source }

  sorted.forEach((change, i) => {
    versions.push({ ...current, effective: { ...current.effective, to: change.from } })

    if (change.ends) {
      if (i !== sorted.length - 1) {
        throw new Error(`${base.id}: changes found after it ends`)
      }
      current = null
      return
    }

    const removed = new Set(change.remove ?? [])
    current = {
      codes: [...current.codes.filter((c) => !removed.has(c)), ...(change.add ?? [])],
      effective: { from: change.from },
      source: change.source ?? current.source,
    }
  })

  if (current) versions.push(current)
  return { ...list, versions }
}

// ── Splitting a record at a date ──

// Splits `record` at `date` when the date falls strictly inside its effective period: the part
// before `date` gets `earlier(record)` applied (e.g. older text from a backfill), the part from
// `date` on is the record as is. A record that starts on or after `date`, or ends on or before it,
// comes back unchanged, so applying this to every version of a heading only splits the one in force
// across `date`. Apply several dates from latest to earliest to step text back in stages.
export const splitTariffAt = (
  record: Tariff,
  date: IsoDate,
  earlier: (record: Tariff) => Partial<Omit<Tariff, "code" | "effective">>,
): Tariff[] => {
  const { from, to } = record.effective
  if ((from && from >= date) || (to && to <= date)) return [record]
  return [
    { ...record, ...earlier(record), effective: { ...record.effective, to: date } },
    { ...record, effective: { ...record.effective, from: date } },
  ]
}

// `text` with `find` replaced once by `replacement`; throws when `find` isn't there, so a split
// that expects a heading's wording fails loudly if that wording changes
export const replaceOnce = (text: string, find: string, replacement: string, label: string) => {
  if (!text.includes(find)) throw new Error(`${label}: expected "${find}" in its text`)
  return text.replace(find, replacement)
}
