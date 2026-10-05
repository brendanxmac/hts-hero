import { htsDigits } from "./codes"
import { isEffectiveOn } from "./dates"
import {
  CodeList,
  CodeSelector,
  CountrySelector,
  IsoDate,
  ListRef,
  RuleSet,
  RuleSnapshot,
  Selector,
  Tariff,
} from "./types"

const snapshotCache = new WeakMap<RuleSet, Map<IsoDate, RuleSnapshot>>()

// The version of every rule in effect on `asOf`. Cached per rule set and date.
export const getRulesAsOf = (rules: RuleSet, asOf: IsoDate): RuleSnapshot => {
  let byDate = snapshotCache.get(rules)
  if (!byDate) {
    byDate = new Map()
    snapshotCache.set(rules, byDate)
  }
  const cached = byDate.get(asOf)
  if (cached) return cached

  const tariffs = rules.tariffs.filter((t) => isEffectiveOn(t.effective, asOf))
  const snapshot: RuleSnapshot = {
    asOf,
    programs: new Map(rules.programs.map((p) => [p.id, p])),
    tariffs,
    tariffsByCode: new Map(tariffs.map((t) => [t.code, t])),
    lists: resolveLists(rules.lists, asOf),
    interactions: rules.interactions.filter((i) => isEffectiveOn(i.effective, asOf)),
    column2Countries: new Set(
      rules.columnAssignments
        .filter((c) => isEffectiveOn(c.effective, asOf))
        .map((c) => c.country),
    ),
    preferences: rules.preferences.filter((p) => isEffectiveOn(p.effective, asOf)),
    fees: rules.fees.filter((f) => isEffectiveOn(f.effective, asOf)),
    inputs: new Map(rules.inputs.map((i) => [i.id, i])),
  }

  byDate.set(asOf, snapshot)
  return snapshot
}

// Resolves each list to its members on `asOf`, flattening `includes`.
// HTS lists are stored as digit strings for prefix matching.
const resolveLists = (lists: CodeList[], asOf: IsoDate) => {
  const byId = new Map(lists.map((l) => [l.id, l]))
  const resolved = new Map<string, Set<string>>()

  const resolve = (id: string, visiting: Set<string>): Set<string> => {
    const done = resolved.get(id)
    if (done) return done
    const list = byId.get(id)
    const version = list?.versions.find((v) => isEffectiveOn(v.effective, asOf))
    const members = new Set<string>()
    if (!list || !version || visiting.has(id)) return members

    visiting.add(id)
    for (const code of version.codes ?? []) {
      members.add(list.kind === "hts" ? htsDigits(code) : code)
    }
    for (const ref of version.includes ?? []) {
      resolve(ref.list, visiting).forEach((member) => members.add(member))
    }
    visiting.delete(id)

    resolved.set(id, members)
    return members
  }

  for (const list of lists) resolve(list.id, new Set())
  return resolved
}

// ── Matching helpers ──

const isListRef = (value: string | ListRef): value is ListRef =>
  typeof value === "object" && value !== null && "list" in value

// Prefix lengths used in the HTS: heading, subheading, 8-digit, statistical
const PREFIX_LENGTHS = [2, 4, 6, 8, 10]

const listContainsPrefixOf = (members: Set<string>, htsCode: string) => {
  const digits = htsDigits(htsCode)
  return PREFIX_LENGTHS.some((len) => len <= digits.length && members.has(digits.slice(0, len)))
}

export const countryMatches = (
  selector: CountrySelector | (string | ListRef)[] | undefined,
  country: string,
  snapshot: RuleSnapshot,
) => {
  if (!selector) return false
  if (selector === "all") return true
  return selector.some((entry) =>
    isListRef(entry)
      ? snapshot.lists.get(entry.list)?.has(country) ?? false
      : entry === country,
  )
}

export const codeMatches = (
  selector: "all" | CodeSelector | undefined,
  htsCode: string,
  snapshot: RuleSnapshot,
) => {
  if (!selector) return false
  if (selector === "all") return true
  const digits = htsDigits(htsCode)
  return selector.some((entry) => {
    if (isListRef(entry)) {
      const members = snapshot.lists.get(entry.list)
      return members ? listContainsPrefixOf(members, htsCode) : false
    }
    const prefix = htsDigits(entry)
    return prefix.length > 0 && digits.startsWith(prefix)
  })
}

export const selectorMatches = (
  selector: Selector,
  tariff: Tariff,
  snapshot: RuleSnapshot,
) =>
  (selector.codes?.includes(tariff.code) ?? false) ||
  (selector.programs?.includes(tariff.program) ?? false) ||
  (selector.authorities?.includes(snapshot.programs.get(tariff.program)?.authority) ??
    false)
