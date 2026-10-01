// Groups raw diffs into the units reviewed in the UI:
// - one change per change record item (with the diffs it accounts for)
// - differences the change record doesn't mention, grouped by note / heading
// - change record items where no difference was found
// Each change carries context: surrounding note text and notes it refers to.

import { createHash } from "crypto"
import type {
  ChangePayload,
  CitedHeading,
  ChangeRecordItem,
  ChangeSource,
  CodeDiff,
  ContextBlock,
  HtsRow,
  NoteDiff,
  NoteNode,
} from "./types"
import { childrenByParent, groupSlugForNoteType, renderSubtree } from "./parse-ch99-notes"
import { htsSortKey, intToRoman, normalizeHtsCode, truncate } from "./text"

const CONTEXT_BLOCK_MAX = 15_000
const CROSS_REF_BLOCK_MAX = 6_000
const CONTEXT_TOTAL_MAX = 80_000
const MAX_CROSS_REFS = 8

const ALL_GROUP_SLUGS = ["us-notes", "statistical-notes", "notes", "additional-us-notes"]

export interface ChangeInsert {
  change_key: string
  source: ChangeSource
  title: string
  sort_order: number
  payload: ChangePayload
}

interface BuildInput {
  changeRecordItems: ChangeRecordItem[]
  noteDiffs: NoteDiff[]
  codeDiffs: CodeDiff[]
  fromNodes: NoteNode[]
  toNodes: NoteNode[]
  // The newer revision's Chapter 99 JSON rows, if it has any
  toRows: HtsRow[] | null
  // Whether codeDiffs covers every heading (both revisions had JSON)
  fullHeadingDiff: boolean
  toRevisionName: string
}

// "2 (v) (xi)" / "note 2(v)(xi)" -> "2(v)(xi)"
export const normalizeCitation = (citation: string) =>
  citation
    .replace(/^(u\.\s?s\.\s+|statistical\s+|additional\s+u\.\s?s\.\s+)?notes?\s*/i, "")
    .replace(/\s+/g, "")
    .replace(/\.$/, "")

const notePrefixes = (item: ChangeRecordItem) => {
  const scope = item.subchapter ? `sub-${item.subchapter.toUpperCase()}` : "ch99"
  const slug = groupSlugForNoteType(item.note_type)
  const slugs = slug ? [slug] : ALL_GROUP_SLUGS
  return item.note_citations
    .map(normalizeCitation)
    .filter(Boolean)
    .flatMap((citation) => slugs.map((s) => `${scope}/${s}/${citation}`))
}

const keyMatchesPrefix = (key: string | null, prefix: string) =>
  !!key && (key === prefix || key.startsWith(`${prefix}(`) || key.startsWith(`${prefix}#`))

// Headings a change record item cites, looked up in the newer revision's rows
const citedHeadingsFor = (item: ChangeRecordItem, rows: HtsRow[] | null): CitedHeading[] => {
  const codes = Array.from(new Set(item.hts_codes.map(normalizeHtsCode)))
  if (!rows) return codes.map((code) => ({ code, status: "unverified", row: null }))
  const withCode = rows.filter((r) => r.htsno)
  const cited: CitedHeading[] = codes.map((code) => {
    const row = withCode.find((r) => r.htsno === code) ?? null
    return { code, status: row ? "found" : "not_found", row }
  })
  // Ranges: every row inside the range, or the endpoints if none are found
  for (const range of item.hts_code_ranges) {
    const inRange = withCode.filter((r) =>
      codeMatches({ ...item, hts_codes: [], hts_code_ranges: [range] }, r.htsno)
    )
    if (inRange.length) {
      for (const row of inRange) {
        if (!cited.some((c) => c.code === row.htsno)) cited.push({ code: row.htsno, status: "found", row })
      }
    } else {
      cited.push({ code: normalizeHtsCode(range.from), status: "not_found", row: null })
      cited.push({ code: normalizeHtsCode(range.to), status: "not_found", row: null })
    }
  }
  return cited
}

const codeMatches = (item: ChangeRecordItem, htsno: string) => {
  if (!htsno) return false
  for (const raw of item.hts_codes) {
    const code = normalizeHtsCode(raw)
    if (htsno === code || htsno.startsWith(`${code}.`)) return true
  }
  for (const range of item.hts_code_ranges) {
    // Upper bound includes everything under the "to" code (9903.01.30 covers
    // 9903.01.30.xx)
    const k = htsSortKey(htsno)
    const upper = range.to.replace(/\D/g, "").padEnd(10, "9")
    if (k >= htsSortKey(range.from) && k <= upper) return true
  }
  return false
}

// Subchapter of a Chapter 99 heading: 9903 -> III
const subchapterForCode = (htsno: string | null) => {
  const m = htsno?.match(/^99(\d{2})/)
  return m && Number(m[1]) > 0 ? intToRoman(Number(m[1])) : null
}

// "U.S. note 2(v)(xi) to this subchapter", "note 20(a) to subchapter III"
const CROSS_REF =
  /(general|additional|statistical|u\.\s?s\.)?\s*notes?\s+(\d{1,3})((?:\([A-Za-z0-9]{1,6}\))*)(\s+to\s+(?:this\s+)?subchapter(?:\s+([IVXLC]+))?)?/gi

const findCrossRefs = (text: string, subchapter: string | null) => {
  const refs: { subchapter: string | null; slug: string; citation: string }[] = []
  for (const m of text.matchAll(CROSS_REF)) {
    const kind = (m[1] ?? "").toLowerCase()
    if (kind === "general" || kind === "additional") continue
    const explicitSub = m[5] ?? null
    if (!m[4] && !subchapter) continue
    refs.push({
      subchapter: explicitSub ?? subchapter,
      slug: kind === "statistical" ? "statistical-notes" : "us-notes",
      citation: `${m[2]}${m[3] ?? ""}`,
    })
  }
  return refs
}

const hashPayload = (payload: Omit<ChangePayload, "hash">) =>
  createHash("sha256")
    .update(
      JSON.stringify({
        cr: payload.changeRecordItems.map((i) => i.source_text),
        notes: payload.noteDiffs.map((d) => [d.status, d.fromKey, d.toKey, d.before, d.after]),
        codes: payload.codeDiffs.map((d) => [d.status, d.key, d.before, d.after]),
        cited: (payload.citedHeadings ?? []).map((c) => [c.code, c.status, c.row]),
      })
    )
    .digest("hex")
    .slice(0, 16)

export const buildChanges = (input: BuildInput): ChangeInsert[] => {
  const { changeRecordItems, noteDiffs, codeDiffs, fromNodes, toNodes, toRows, fullHeadingDiff, toRevisionName } = input
  const fromByKey = new Map(fromNodes.map((n) => [n.key, n]))
  const toByKey = new Map(toNodes.map((n) => [n.key, n]))
  const fromChildren = childrenByParent(fromNodes)
  const toChildren = childrenByParent(toNodes)
  const rowsByCode = new Map((toRows ?? []).filter((r) => r.htsno).map((r) => [r.htsno, r]))

  const claimedNotes = new Set<NoteDiff>()
  const claimedCodes = new Set<CodeDiff>()
  const changes: ChangeInsert[] = []

  const contextFor = (notes: NoteDiff[], codes: CodeDiff[], extraNoteKeys: string[] = []) => {
    const blocks: ContextBlock[] = []
    const seen = new Set<string>()
    let total = 0
    // True if this node or one above it is already shown (subtrees include
    // their children, so showing a child again would repeat it)
    const covered = (key: string, revision: "from" | "to") => {
      const byKey = revision === "to" ? toByKey : fromByKey
      for (let node = byKey.get(key); node; node = node.parentKey ? byKey.get(node.parentKey) : undefined) {
        if (seen.has(`${revision}:${node.key}`)) return true
      }
      return false
    }
    const add = (block: ContextBlock) => {
      const id = `${block.revision}:${block.key}`
      if (seen.has(id) || covered(block.key, block.revision) || total > CONTEXT_TOTAL_MAX) return
      seen.add(id)
      total += block.text.length
      blocks.push(block)
    }

    // The parent subdivision of each changed node, before and after
    for (const diff of notes) {
      const toNode = diff.toKey ? toByKey.get(diff.toKey) : null
      const fromNode = diff.fromKey ? fromByKey.get(diff.fromKey) : null
      const toParent = toNode?.parentKey ? toByKey.get(toNode.parentKey) : toNode
      const fromParent = fromNode?.parentKey ? fromByKey.get(fromNode.parentKey) : fromNode
      if (fromParent) {
        add({
          key: fromParent.key,
          label: fromParent.label,
          revision: "from",
          reason: "Surrounding text, older revision",
          text: truncate(renderSubtree(fromParent, fromChildren), CONTEXT_BLOCK_MAX),
        })
      }
      if (toParent) {
        add({
          key: toParent.key,
          label: toParent.label,
          revision: "to",
          reason: "Surrounding text, newer revision",
          text: truncate(renderSubtree(toParent, toChildren), CONTEXT_BLOCK_MAX),
        })
      }
    }

    // Notes the change record named but where nothing changed
    for (const key of extraNoteKeys) {
      const toNode = toByKey.get(key)
      if (toNode) {
        add({
          key,
          label: toNode.label,
          revision: "to",
          reason: "Named in the change record",
          text: truncate(renderSubtree(toNode, toChildren), CONTEXT_BLOCK_MAX),
        })
      }
    }

    // Notes the changed text refers to
    const refTexts: { text: string; subchapter: string | null }[] = [
      ...notes.map((d) => ({
        text: d.after ?? d.before ?? "",
        subchapter: (d.toKey ? toByKey.get(d.toKey) : fromByKey.get(d.fromKey ?? ""))?.subchapter ?? null,
      })),
      ...codes.map((d) => ({
        text: `${d.after?.description ?? d.before?.description ?? ""} ${(d.after?.footnotes ?? []).join(" ")} ${d.after?.general ?? ""} ${d.after?.special ?? ""}`,
        subchapter: subchapterForCode(d.htsno || d.after?.parentHtsno || d.before?.parentHtsno || null),
      })),
    ]
    const ownKeys = new Set(notes.flatMap((d) => [d.toKey, d.fromKey]))
    let refCount = 0
    for (const { text, subchapter } of refTexts) {
      for (const ref of findCrossRefs(text, subchapter)) {
        if (refCount >= MAX_CROSS_REFS) break
        const key = `${ref.subchapter ? `sub-${ref.subchapter}` : "ch99"}/${ref.slug}/${ref.citation}`
        if (ownKeys.has(key)) continue
        const node = toByKey.get(key)
        if (!node || seen.has(`to:${key}`)) continue
        refCount++
        add({
          key,
          label: node.label,
          revision: "to",
          reason: "Referred to by the changed text",
          text: truncate(renderSubtree(node, toChildren), CROSS_REF_BLOCK_MAX),
        })
      }
    }

    // Current JSON rows for codes named in changed note text
    const mentioned = new Set(notes.flatMap((d) => [...d.codesAdded, ...d.codesRemoved]))
    for (const code of Array.from(mentioned).slice(0, 20)) {
      const row = rowsByCode.get(code)
      if (!row) continue
      add({
        key: `code:${code}`,
        label: `Heading ${code}`,
        revision: "to",
        reason: "Heading named in the changed note text",
        text: `${code}: ${row.description}\nGeneral: ${row.general || "—"}\nSpecial: ${row.special || "—"}\nOther: ${row.other || "—"}${row.footnotes.length ? `\nFootnotes: ${row.footnotes.join(" | ")}` : ""}`,
      })
    }
    return blocks
  }

  const makePayload = (
    items: ChangeRecordItem[],
    notes: NoteDiff[],
    codes: CodeDiff[],
    warnings: string[],
    extraNoteKeys: string[] = [],
    citedHeadings: CitedHeading[] = []
  ): ChangePayload => {
    const base = {
      changeRecordItems: items,
      noteDiffs: notes,
      codeDiffs: codes,
      citedHeadings,
      context: contextFor(notes, codes, extraNoteKeys),
      warnings,
    }
    return { ...base, hash: hashPayload(base) }
  }

  // 1. Change record items
  for (const item of changeRecordItems.filter((i) => i.in_chapter_99)) {
    const prefixes = notePrefixes(item)
    const notes = noteDiffs.filter((d) =>
      prefixes.some((p) => keyMatchesPrefix(d.toKey, p) || keyMatchesPrefix(d.fromKey, p))
    )
    const codes = codeDiffs.filter(
      (d) => codeMatches(item, d.htsno) || codeMatches(item, d.after?.parentHtsno ?? d.before?.parentHtsno ?? "")
    )
    notes.forEach((d) => claimedNotes.add(d))
    codes.forEach((d) => claimedCodes.add(d))

    const warnings: string[] = []
    const namedKeys = prefixes.filter((p) => toByKey.has(p) || fromByKey.has(p))
    if (prefixes.length && !namedKeys.length && !notes.length) {
      warnings.push(
        `None of the cited notes (${item.note_citations.join(", ")}) were found in either revision's parsed notes. Check the citation or the parse.`
      )
    }
    const cited = citedHeadingsFor(item, toRows)
    const citesHeadings = item.hts_codes.length + item.hts_code_ranges.length > 0
    // Without a full heading diff, a heading change can't be confirmed by
    // diffing, so a heading citation counts as the change itself
    const found = notes.length + codes.length > 0 || (!fullHeadingDiff && citesHeadings)
    if (!found) {
      warnings.push(
        "The change record lists this, but no difference was found. Either the change is outside what was parsed, the citation didn't match, or the parse missed it."
      )
    }
    if (citesHeadings && !toRows) {
      warnings.push(
        `Heading text for ${toRevisionName} isn't available: USITC only exports the current revision's JSON, and ${toRevisionName} wasn't current when it was processed. Check these headings in the Chapter 99 PDF.`
      )
    }
    const missing = cited.filter((c) => c.status === "not_found").map((c) => c.code)
    if (missing.length) {
      warnings.push(
        item.action === "deleted"
          ? `Not in ${toRevisionName}'s Chapter 99 data, as expected for a deletion: ${missing.join(", ")}`
          : `Cited but not in ${toRevisionName}'s Chapter 99 data: ${missing.join(", ")}. Check the citation; this is expected only if the heading was deleted.`
      )
    }

    changes.push({
      change_key: `cr:${item.id}`,
      source: found ? "change_record" : "change_record_no_diff",
      title: truncate(`${item.id}: ${item.description}`, 200).split("\n")[0],
      sort_order: changes.length,
      payload: makePayload([item], notes, codes, warnings, found ? [] : namedKeys, cited),
    })
  }

  // 2. Note differences the change record didn't mention, per top-level note
  const leftoverNotes = new Map<string, NoteDiff[]>()
  for (const diff of noteDiffs) {
    if (claimedNotes.has(diff)) continue
    leftoverNotes.set(diff.topNoteKey, [...(leftoverNotes.get(diff.topNoteKey) ?? []), diff])
  }
  for (const [topKey, notes] of Array.from(leftoverNotes.entries())) {
    const top = toByKey.get(topKey) ?? fromByKey.get(topKey)
    const label = top?.label ?? notes[0].label
    changes.push({
      change_key: `notes:${topKey}`,
      source: "not_in_change_record",
      title: `${label}: ${notes.length} difference${notes.length === 1 ? "" : "s"} not in the change record`,
      sort_order: changes.length,
      payload: makePayload([], notes, [], []),
    })
  }

  // 3. Code differences the change record didn't mention, per 9903.xx group
  const leftoverCodes = new Map<string, CodeDiff[]>()
  for (const diff of codeDiffs) {
    if (claimedCodes.has(diff)) continue
    const code = diff.htsno || diff.after?.parentHtsno || diff.before?.parentHtsno || "unknown"
    const group = code.slice(0, 7)
    leftoverCodes.set(group, [...(leftoverCodes.get(group) ?? []), diff])
  }
  for (const [group, codes] of Array.from(leftoverCodes.entries())) {
    changes.push({
      change_key: `codes:${group}`,
      source: "not_in_change_record",
      title: `Headings ${group}: ${codes.length} difference${codes.length === 1 ? "" : "s"} not in the change record`,
      sort_order: changes.length,
      payload: makePayload([], [], codes, []),
    })
  }

  return changes
}
