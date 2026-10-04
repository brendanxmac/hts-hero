// Server side of the coverage checker: refreshing items from USITC and the engine, loading the
// dashboard, and the detail for one heading. Every caller has passed requireRevisionTool().

import { AllRules } from "../../tariffs/engine-v2/data"
import { todayIsoDate } from "../../tariffs/engine-v2/dates"
import { HtsRevisions } from "../../tariffs/engine-v2/revisions"
import type { Tariff } from "../../tariffs/engine-v2/types"
import type { RevisionDb } from "../hts-revision-diff/access"
import { RevisionDiffTables } from "../hts-revision-diff/constants"
import { downloadJson } from "../hts-revision-diff/storage"
import type { NoteNode, ParsedNotes } from "../hts-revision-diff/types"
import { fetchCh99Export, getCurrentReleaseName } from "../hts-revision-diff/usitc"
import { analyzeCoverage, type HtsExportRow, noteKey, suggestNotePrograms } from "./analyze"
import { CoverageTables as T, EXCLUDED_STATUSES } from "./constants"
import type { CoverageCounts, CoverageItem, CoverageSnapshot } from "./types"

const CHUNK = 500

const must = <R>(result: { data: R | null; error: { message: string } | null }, what: string): R => {
  if (result.error) throw new Error(`${what}: ${result.error.message}`)
  return result.data as R
}

// PostgREST returns at most 1,000 rows per request
const selectAll = async <R>(db: RevisionDb, table: string, columns = "*"): Promise<R[]> => {
  const out: R[] = []
  for (let from = 0; ; from += 1000) {
    const result = await db.from(table).select(columns).order("htsno").range(from, from + 999)
    const page = must(result as unknown as { data: R[] | null; error: { message: string } | null }, `Load ${table}`)
    out.push(...page)
    if (page.length < 1000) return out
  }
}

export const countCoverage = (items: Pick<CoverageItem, "htsno" | "subchapter" | "status" | "in_hts" | "engine_modeled">[]): CoverageCounts => {
  const counts: CoverageCounts = { total: 0, excluded: 0, inEffect: 0, modeled: 0, missing: 0, bySubchapter: {} }
  for (const item of items) {
    if (!item.in_hts) continue
    counts.total++
    if (EXCLUDED_STATUSES.includes(item.status)) {
      counts.excluded++
      continue
    }
    const sub = (counts.bySubchapter[item.subchapter] ??= { inEffect: 0, modeled: 0 })
    counts.inEffect++
    sub.inEffect++
    if (item.engine_modeled) {
      counts.modeled++
      sub.modeled++
    } else counts.missing++
  }
  return counts
}

// Pulls the current Chapter 99 export, compares it with the engine, and writes the HTS and engine
// columns of every item. Tracking columns (status, category, …) are set only when an item is new,
// from initial-status.ts. Saves a snapshot of the counts.
export const refreshCoverage = async (db: RevisionDb) => {
  const [revision, rows] = await Promise.all([getCurrentReleaseName(), fetchCh99Export()])
  const today = todayIsoDate()
  const now = new Date().toISOString()
  const { headings, stale } = analyzeCoverage(rows as HtsExportRow[], AllRules, today)

  const existing = await selectAll<Pick<CoverageItem, "htsno" | "status">>(db, T.ITEMS, "htsno, status")
  const known = new Set(existing.map((e) => e.htsno))

  const fromHts = headings.map((h) => ({
    htsno: h.htsno,
    subchapter: h.subchapter,
    description: h.description,
    general: h.general,
    special: h.special,
    other: h.other,
    footnotes: h.footnotes,
    note_citations: h.noteCitations,
    starts_on: h.startsOn,
    in_hts: true,
    last_seen_revision: revision,
    engine_modeled: h.modeled,
    engine_active: h.activeOn,
    engine_referenced: h.referenced,
    engine_programs: h.programs,
    category_suggested: h.suggestedCategory,
    refreshed_at: now,
    updated_at: now,
  }))
  const initial = new Map(headings.map((h) => [h.htsno, h]))
  const inserts = fromHts
    .filter((r) => !known.has(r.htsno))
    .map((r) => ({
      ...r,
      first_seen_revision: revision,
      status: initial.get(r.htsno)!.initialStatus,
      status_note: initial.get(r.htsno)!.initialStatusNote,
    }))
  const updates = fromHts.filter((r) => known.has(r.htsno))

  // Separate calls, so an update never touches the tracking columns
  for (let i = 0; i < inserts.length; i += CHUNK) {
    must(await db.from(T.ITEMS).insert(inserts.slice(i, i + CHUNK)), "Insert items")
  }
  for (let i = 0; i < updates.length; i += CHUNK) {
    must(await db.from(T.ITEMS).upsert(updates.slice(i, i + CHUNK), { onConflict: "htsno" }), "Update items")
  }
  const seen = new Set(headings.map((h) => h.htsno))
  const gone = existing.filter((e) => !seen.has(e.htsno)).map((e) => e.htsno)
  for (let i = 0; i < gone.length; i += CHUNK) {
    must(
      await db.from(T.ITEMS).update({ in_hts: false, refreshed_at: now, updated_at: now }).in("htsno", gone.slice(i, i + CHUNK)),
      "Mark removed items"
    )
  }

  const items = await selectAll<CoverageItem>(db, T.ITEMS, "htsno, subchapter, status, in_hts, engine_modeled")
  const counts = countCoverage(items)
  must(await db.from(T.SNAPSHOTS).insert({ revision, counts }), "Save snapshot")

  return { revision, counts, inserted: inserts.length, updated: updates.length, removed: gone.length, stale: stale.map((s) => s.code) }
}

// Everything the dashboard shows
export const loadDashboard = async (db: RevisionDb) => {
  const [items, snapshots, overrides] = await Promise.all([
    selectAll<CoverageItem>(db, T.ITEMS),
    db.from(T.SNAPSHOTS).select("*").order("created_at"),
    db.from(T.NOTE_PROGRAMS).select("note_key, program"),
  ])
  // Suggested from the items' own engine data (what the modeled headings citing each note are)
  const suggested = suggestNotePrograms(
    items.map((i) => ({ modeled: i.engine_modeled, programs: i.engine_programs, noteCitations: i.note_citations }))
  )
  const programs = AllRules.programs.map((p) => ({ id: p.id, name: p.name }))
  // Engine tariff headings that aren't in the HTS any more (only meaningful after a refresh)
  const inHts = new Set(items.filter((i) => i.in_hts).map((i) => i.htsno))
  const stale = inHts.size ? Array.from(new Set(AllRules.tariffs.map((t) => t.code))).filter((c) => !inHts.has(c)).sort() : []
  return {
    items,
    snapshots: must<CoverageSnapshot[]>(snapshots, "Load snapshots"),
    notePrograms: {
      suggested,
      overrides: Object.fromEntries(must<{ note_key: string; program: string }[]>(overrides, "Load note programs").map((o) => [o.note_key, o.program])),
    },
    programs,
    stale,
  }
}

// ---------- Detail for one heading ----------

// The revision checker's parsed notes for the newest revision that has them, cached per file
const notesCache = new Map<string, Promise<ParsedNotes>>()
const latestParsedNotes = async (db: RevisionDb) => {
  const revisions = must<{ name: string; active_attempt_id: string | null }[]>(
    await db.from(RevisionDiffTables.REVISIONS).select("name, active_attempt_id"),
    "Load revisions"
  )
  const byName = new Map(revisions.map((r) => [r.name, r]))
  for (const rev of [...HtsRevisions].reverse()) {
    const attemptId = byName.get(rev.name)?.active_attempt_id
    if (!attemptId) continue
    const attempt = must<{ notes_path: string | null }>(
      await db.from(RevisionDiffTables.ATTEMPTS).select("notes_path").eq("id", attemptId).single(),
      "Load attempt"
    )
    if (!attempt.notes_path) continue
    const path = attempt.notes_path
    if (!notesCache.has(path)) {
      const loading = downloadJson<ParsedNotes>(db, path)
      loading.catch(() => notesCache.delete(path))
      notesCache.set(path, loading)
    }
    return { revision: rev.name, notes: await notesCache.get(path)! }
  }
  return null
}

export interface NoteSubtreeNode {
  citation: string
  depth: number
  text: string
}

export interface CitedNote {
  key: string
  label: string
  // The key that was found: the cited one, or its nearest parent when the subdivision isn't parsed
  foundKey: string | null
  nodes: NoteSubtreeNode[]
}

const subtree = (nodes: NoteNode[], children: Map<string, NoteNode[]>, key: string): NoteSubtreeNode[] => {
  const root = nodes.find((n) => n.key === key)
  if (!root) return []
  const out: NoteSubtreeNode[] = []
  const visit = (node: NoteNode, depth: number) => {
    out.push({ citation: node.citation, depth, text: node.text })
    for (const c of children.get(node.key) ?? []) visit(c, depth + 1)
  }
  visit(root, 0)
  return out
}

// "sub-III/us-notes/20(h)(ii)" → "sub-III/us-notes/20(h)" → "sub-III/us-notes/20"
const parentKey = (key: string) => {
  const trimmed = key.replace(/\([^()]+\)$/, "")
  return trimmed === key ? null : trimmed
}

// Where else the engine names this heading
const referencesTo = (htsno: string) => {
  const out: { kind: string; id: string; label: string }[] = []
  const has = (value: unknown) => JSON.stringify(value).includes(`"${htsno}"`)
  for (const t of AllRules.tariffs) if (t.code !== htsno && has(t)) out.push({ kind: "tariff", id: t.code, label: t.name })
  for (const i of AllRules.interactions) if (has(i)) out.push({ kind: "interaction", id: i.id, label: i.description })
  for (const l of AllRules.lists) if (has(l)) out.push({ kind: "list", id: l.id, label: l.description })
  for (const i of AllRules.inputs) if (has(i)) out.push({ kind: "input", id: i.id, label: i.label })
  // One row per thing, even when it has several dated versions
  const seen = new Set<string>()
  return out.filter((r) => (seen.has(`${r.kind}:${r.id}`) ? false : (seen.add(`${r.kind}:${r.id}`), true)))
}

// Modeled headings that are likely the closest examples: same heading group, else same cited note
const examplesFor = (item: CoverageItem): Tariff[] => {
  const latest = new Map<string, Tariff>()
  for (const t of AllRules.tariffs) {
    if (t.code === item.htsno) continue
    const prev = latest.get(t.code)
    if (!prev || (t.effective.from ?? "") > (prev.effective.from ?? "")) latest.set(t.code, t)
  }
  const group = item.htsno.slice(0, 7)
  const sameGroup = Array.from(latest.values()).filter((t) => t.code.startsWith(group))
  if (sameGroup.length) return sameGroup.sort((a, b) => a.code.localeCompare(b.code)).slice(0, 3)
  const notes = new Set(item.note_citations.map(noteKey).filter(Boolean))
  if (!notes.size) return []
  return Array.from(latest.values())
    .filter((t) => t.description.match(/note\s+(\d+)/gi)?.some((m) => notes.has(`III:${m.replace(/\D/g, "")}`)))
    .slice(0, 3)
}

export const loadHeadingDetail = async (db: RevisionDb, htsno: string) => {
  const item = must<CoverageItem>(await db.from(T.ITEMS).select("*").eq("htsno", htsno).single(), `Load ${htsno}`)

  const parsed = item.note_citations.length ? await latestParsedNotes(db) : null
  let notes: CitedNote[] = []
  if (parsed) {
    const nodes = parsed.notes.nodes
    const children = new Map<string, NoteNode[]>()
    for (const n of nodes) if (n.parentKey) children.set(n.parentKey, [...(children.get(n.parentKey) ?? []), n])
    const keys = new Set(nodes.map((n) => n.key))
    notes = item.note_citations.map((c) => {
      let key: string | null = c.key
      while (key && !keys.has(key)) key = parentKey(key)
      return { key: c.key, label: c.label, foundKey: key, nodes: key ? subtree(nodes, children, key) : [] }
    })
  }

  return {
    item,
    notesRevision: parsed?.revision ?? null,
    notes,
    records: AllRules.tariffs.filter((t) => t.code === htsno),
    references: referencesTo(htsno),
    examples: examplesFor(item),
    asOf: todayIsoDate(),
  }
}
