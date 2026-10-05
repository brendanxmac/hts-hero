// Diffs two parsed revisions: Chapter 99 note subdivisions and Chapter 99
// JSON rows

import type { CodeDiff, CodeFieldChange, HtsRow, NoteDiff, NoteNode, RangeChange } from "./types"
import { extractHtsRanges, formatRange, htsSortKey, inRange, normalizeForCompare, type HtsRange } from "./text"
import { wordDiff } from "./word-diff"

// Texts this long are distinctive enough to detect renumbering. Shorter ones
// ("[Deleted]", "Provided that:") repeat, so they're used only when the text
// appears once among the changed nodes of each revision.
const MIN_RENUMBER_TEXT = 40
const MIN_UNIQUE_RENUMBER_TEXT = 15

export const topNoteKeyFor = (node: NoteNode) =>
  `${node.groupKey}/${node.topNote ?? "_intro"}`

// How a range changed, in words
const describeRangeChange = (before: HtsRange, after: HtsRange) => {
  const later = (a: string, b: string) => htsSortKey(a) > htsSortKey(b)
  if (before.from === after.from) {
    return later(after.to, before.to)
      ? `extended at the end: now runs to ${after.to}`
      : `shortened at the end: now ends at ${after.to}`
  }
  if (before.to === after.to) {
    return later(before.from, after.from)
      ? `extended at the start: now starts at ${after.from}`
      : `shortened at the start: now starts at ${after.from}`
  }
  return `changed from ${formatRange(before)} to ${formatRange(after)}`
}

const overlaps = (a: HtsRange, b: HtsRange) => inRange(a.from, b) || inRange(a.to, b) || inRange(b.from, a)

// Codes and ranges mentioned in a subdivision's old and new text. A code that
// is still covered by a range ("9903.82.17" inside "…02–9903.82.19"), or is
// just the end of a range that moved, isn't reported as added or removed;
// the range change says what happened instead.
export const codeChanges = (beforeText: string, afterText: string, beforeCodes: string[], afterCodes: string[]) => {
  const beforeRanges = extractHtsRanges(beforeText)
  const afterRanges = extractHtsRanges(afterText)
  const key = (r: HtsRange) => formatRange(r)
  const beforeKeys = new Set(beforeRanges.map(key))
  const afterKeys = new Set(afterRanges.map(key))
  const gone = beforeRanges.filter((r) => !afterKeys.has(key(r)))
  const fresh = afterRanges.filter((r) => !beforeKeys.has(key(r)))

  const rangeChanges: RangeChange[] = []
  const paired = new Set<HtsRange>()
  for (const b of gone) {
    const a =
      fresh.find((r) => !paired.has(r) && (r.from === b.from || r.to === b.to)) ??
      fresh.find((r) => !paired.has(r) && overlaps(r, b))
    if (a) {
      paired.add(a)
      rangeChanges.push({ before: formatRange(b), after: formatRange(a), description: describeRangeChange(b, a) })
    } else {
      rangeChanges.push({ before: formatRange(b), after: null, description: "range no longer listed" })
    }
  }
  for (const a of fresh) {
    if (!paired.has(a)) rangeChanges.push({ before: null, after: formatRange(a), description: "new range" })
  }

  const endpoints = (ranges: HtsRange[]) => new Set(ranges.flatMap((r) => [r.from, r.to]))
  const goneEnds = endpoints(gone)
  const freshEnds = endpoints(fresh)
  const beforeSet = new Set(beforeCodes)
  const afterSet = new Set(afterCodes)
  return {
    added: afterCodes.filter((c) => !beforeSet.has(c) && !freshEnds.has(c) && !beforeRanges.some((r) => inRange(c, r))),
    removed: beforeCodes.filter((c) => !afterSet.has(c) && !goneEnds.has(c) && !afterRanges.some((r) => inRange(c, r))),
    rangeChanges,
  }
}

export const diffNotes = (fromNodes: NoteNode[], toNodes: NoteNode[]): NoteDiff[] => {
  const fromByKey = new Map(fromNodes.map((n) => [n.key, n]))
  const toByKey = new Map(toNodes.map((n) => [n.key, n]))
  const norm = (n: NoteNode) => normalizeForCompare(n.text)

  // Nodes whose text isn't identical at the same key in the other revision
  const fromChanged = fromNodes.filter((n) => {
    const other = toByKey.get(n.key)
    return !other || norm(other) !== norm(n)
  })
  const toChanged = toNodes.filter((n) => {
    const other = fromByKey.get(n.key)
    return !other || norm(other) !== norm(n)
  })

  // Same text, different citation: renumbered (each node used once)
  const toByText = new Map<string, NoteNode[]>()
  for (const node of toChanged) {
    const text = norm(node)
    if (text.length < MIN_UNIQUE_RENUMBER_TEXT) continue
    toByText.set(text, [...(toByText.get(text) ?? []), node])
  }
  const fromTextCounts = new Map<string, number>()
  for (const node of fromChanged) {
    fromTextCounts.set(norm(node), (fromTextCounts.get(norm(node)) ?? 0) + 1)
  }
  const usedFrom = new Set<string>()
  const usedTo = new Set<string>()
  const diffs: NoteDiff[] = []

  for (const from of fromChanged) {
    const text = norm(from)
    const candidates = toByText.get(text)
    const distinctive =
      text.length >= MIN_RENUMBER_TEXT ||
      (candidates?.length === 1 && fromTextCounts.get(text) === 1)
    if (!distinctive) continue
    const match = candidates?.find((c) => !usedTo.has(c.key))
    if (!match) continue
    usedFrom.add(from.key)
    usedTo.add(match.key)
    diffs.push({
      status: "renumbered",
      key: match.key,
      fromKey: from.key,
      toKey: match.key,
      label: match.label,
      fromLabel: from.label,
      topNoteKey: topNoteKeyFor(match),
      before: from.text,
      after: match.text,
      words: null,
      codesAdded: [],
      codesRemoved: [],
      fromPage: from.page,
      toPage: match.page,
    })
  }

  for (const from of fromChanged) {
    if (usedFrom.has(from.key)) continue
    const to = toByKey.get(from.key)
    if (to && !usedTo.has(to.key)) {
      usedTo.add(to.key)
      const codes = codeChanges(from.text, to.text, from.htsCodes, to.htsCodes)
      diffs.push({
        status: "modified",
        key: to.key,
        fromKey: from.key,
        toKey: to.key,
        label: to.label,
        fromLabel: from.label,
        topNoteKey: topNoteKeyFor(to),
        before: from.text,
        after: to.text,
        words: wordDiff(from.text, to.text),
        codesAdded: codes.added,
        codesRemoved: codes.removed,
        rangeChanges: codes.rangeChanges,
        fromPage: from.page,
        toPage: to.page,
      })
    } else {
      diffs.push({
        status: "removed",
        key: from.key,
        fromKey: from.key,
        toKey: null,
        label: from.label,
        fromLabel: from.label,
        topNoteKey: topNoteKeyFor(from),
        before: from.text,
        after: null,
        words: null,
        codesAdded: [],
        codesRemoved: from.htsCodes,
        fromPage: from.page,
        toPage: null,
      })
    }
  }

  for (const to of toChanged) {
    if (usedTo.has(to.key)) continue
    diffs.push({
      status: "added",
      key: to.key,
      fromKey: null,
      toKey: to.key,
      label: to.label,
      fromLabel: null,
      topNoteKey: topNoteKeyFor(to),
      before: null,
      after: to.text,
      words: null,
      codesAdded: to.htsCodes,
      codesRemoved: [],
      fromPage: null,
      toPage: to.page,
    })
  }

  // Document order of the newer revision (removed nodes by older order)
  const toOrder = new Map(toNodes.map((n) => [n.key, n.order]))
  const fromOrder = new Map(fromNodes.map((n) => [n.key, n.order]))
  const orderOf = (d: NoteDiff) =>
    d.toKey ? (toOrder.get(d.toKey) ?? 0) : (fromOrder.get(d.fromKey ?? "") ?? 0) - 0.5
  return diffs.sort((a, b) => orderOf(a) - orderOf(b))
}

const CODE_FIELDS: (keyof HtsRow)[] = [
  "description",
  "general",
  "special",
  "other",
  "indent",
  "units",
  "footnotes",
]

const fieldText = (row: HtsRow, field: keyof HtsRow) => {
  const value = row[field]
  if (Array.isArray(value)) return value.join(" | ")
  return String(value ?? "")
}

export const diffCodes = (fromRows: HtsRow[], toRows: HtsRow[]): CodeDiff[] => {
  const fromByKey = new Map(fromRows.map((r) => [r.key, r]))
  const toByKey = new Map(toRows.map((r) => [r.key, r]))
  const diffs: CodeDiff[] = []

  for (const to of toRows) {
    const from = fromByKey.get(to.key)
    if (!from) {
      diffs.push({
        status: "added",
        key: to.key,
        htsno: to.htsno,
        description: to.description,
        fields: [],
        before: null,
        after: to,
      })
      continue
    }
    const fields: CodeFieldChange[] = []
    for (const field of CODE_FIELDS) {
      const before = fieldText(from, field)
      const after = fieldText(to, field)
      if (normalizeForCompare(before) === normalizeForCompare(after)) continue
      fields.push({
        field,
        before,
        after,
        words: field === "indent" ? null : wordDiff(before, after),
      })
    }
    if (fields.length) {
      diffs.push({
        status: "modified",
        key: to.key,
        htsno: to.htsno,
        description: to.description,
        fields,
        before: from,
        after: to,
      })
    }
  }

  for (const from of fromRows) {
    if (toByKey.has(from.key)) continue
    diffs.push({
      status: "removed",
      key: from.key,
      htsno: from.htsno,
      description: from.description,
      fields: [],
      before: from,
      after: null,
    })
  }

  const toOrder = new Map(toRows.map((r) => [r.key, r.order]))
  const fromOrder = new Map(fromRows.map((r) => [r.key, r.order]))
  const orderOf = (d: CodeDiff) =>
    d.after ? (toOrder.get(d.key) ?? 0) : (fromOrder.get(d.key) ?? 0) - 0.5
  return diffs.sort((a, b) => orderOf(a) - orderOf(b))
}
