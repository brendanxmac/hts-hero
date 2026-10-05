// Batches: chunks of headings to add to the engine together. Built in /coverage-checker, written
// into the repo by `npm run pull-batch`, applied by /apply-batch.
//
// Lifecycle: draft (editable) → ready (every heading decided) → pulled (written to the repo) →
// applied (merged). A ready or pulled batch can be reopened as a draft. A heading can be in only
// one open batch (draft, ready or pulled) at a time.

import type { RevisionDb } from "../hts-revision-diff/access"
import {
  BATCH_DECISIONS,
  BATCH_NAME_PATTERN,
  BATCH_STATUSES,
  CoverageTables as T,
  DATES_MODES,
  OPEN_BATCH_STATUSES,
  slugify,
  type BatchDecision,
  type BatchStatus,
  type DatesMode,
} from "./constants"
import { must, selectAll } from "./db"
import type { BatchMembership, BatchSummary, CoverageBatch, CoverageBatchItem, CoverageItem } from "./types"

const now = () => new Date().toISOString()

// Which statuses a batch can move to from each status
const TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  draft: ["ready", "archived"],
  ready: ["draft", "pulled", "archived"],
  pulled: ["draft", "applied", "archived"],
  applied: ["archived"],
  archived: ["draft"],
}

const loadBatchRow = async (db: RevisionDb, id: string) =>
  must<CoverageBatch>(await db.from(T.BATCHES).select("*").eq("id", id).single(), "Load batch")

const requireDraft = (batch: CoverageBatch) => {
  if (batch.status !== "draft") throw new Error(`“${batch.title}” is ${batch.status}. Reopen it as a draft to change it.`)
}

export const listBatches = async (db: RevisionDb): Promise<{ batches: BatchSummary[]; memberships: Record<string, BatchMembership> }> => {
  const [batches, items, modeled] = await Promise.all([
    db.from(T.BATCHES).select("*").order("created_at", { ascending: false }),
    selectAll<Pick<CoverageBatchItem, "batch_id" | "htsno" | "decision">>(db, T.BATCH_ITEMS, "batch_id, htsno, decision"),
    selectAll<Pick<CoverageItem, "htsno" | "engine_modeled">>(db, T.ITEMS, "htsno, engine_modeled"),
  ])
  const rows = must<CoverageBatch[]>(batches, "Load batches")
  const isModeled = new Set(modeled.filter((m) => m.engine_modeled).map((m) => m.htsno))
  const byId = new Map(rows.map((b) => [b.id, b]))
  const summaries = rows.map((b) => ({ ...b, counts: { total: 0, include: 0, skip: 0, pending: 0, modeled: 0 } }))
  const summaryById = new Map(summaries.map((s) => [s.id, s]))
  const memberships: Record<string, BatchMembership> = {}
  for (const item of items) {
    const summary = summaryById.get(item.batch_id)
    if (!summary) continue
    summary.counts.total++
    summary.counts[item.decision]++
    if (isModeled.has(item.htsno)) summary.counts.modeled++
    const batch = byId.get(item.batch_id)!
    if (OPEN_BATCH_STATUSES.includes(batch.status)) {
      memberships[item.htsno] = { batch_id: batch.id, name: batch.name, title: batch.title, status: batch.status, decision: item.decision }
    }
  }
  return { batches: summaries, memberships }
}

// Headings already in another open batch, and which one
const openConflicts = async (db: RevisionDb, htsnos: string[], exceptBatchId?: string) => {
  const { memberships } = await listBatches(db)
  return htsnos.filter((h) => memberships[h] && memberships[h].batch_id !== exceptBatchId).map((h) => ({ htsno: h, batch: memberships[h].title }))
}

export const addBatchItems = async (db: RevisionDb, batchId: string, htsnos: string[]) => {
  const batch = await loadBatchRow(db, batchId)
  requireDraft(batch)
  const existing = must<{ htsno: string; sort_order: number }[]>(
    await db.from(T.BATCH_ITEMS).select("htsno, sort_order").eq("batch_id", batchId),
    "Load batch items"
  )
  const already = new Set(existing.map((e) => e.htsno))
  const conflicts = await openConflicts(db, htsnos, batchId)
  const blocked = new Set(conflicts.map((c) => c.htsno))
  const toAdd = Array.from(new Set(htsnos)).filter((h) => !already.has(h) && !blocked.has(h)).sort()
  let order = existing.reduce((max, e) => Math.max(max, e.sort_order), 0)
  if (toAdd.length) {
    must(
      await db.from(T.BATCH_ITEMS).insert(toAdd.map((htsno) => ({ batch_id: batchId, htsno, sort_order: ++order }))),
      "Add to batch"
    )
    must(await db.from(T.BATCHES).update({ updated_at: now() }).eq("id", batchId), "Touch batch")
  }
  return { added: toAdd.length, alreadyInBatch: htsnos.filter((h) => already.has(h)).length, conflicts }
}

export const removeBatchItems = async (db: RevisionDb, batchId: string, htsnos: string[]) => {
  requireDraft(await loadBatchRow(db, batchId))
  must(await db.from(T.BATCH_ITEMS).delete().eq("batch_id", batchId).in("htsno", htsnos), "Remove from batch")
  return { removed: htsnos.length }
}

export const createBatch = async (
  db: RevisionDb,
  input: { title?: unknown; name?: unknown; instructions?: unknown; htsnos?: unknown }
) => {
  const title = typeof input.title === "string" ? input.title.trim() : ""
  if (!title) throw new Error("A batch needs a title")
  const name = typeof input.name === "string" && input.name.trim() ? input.name.trim() : slugify(title)
  if (!BATCH_NAME_PATTERN.test(name)) throw new Error("The name must be 2–60 lowercase letters, digits and dashes")
  const batch = must<CoverageBatch>(
    await db
      .from(T.BATCHES)
      .insert({ title, name, instructions: typeof input.instructions === "string" ? input.instructions.trim() || null : null })
      .select("*")
      .single(),
    "Create batch"
  )
  const htsnos = Array.isArray(input.htsnos) ? input.htsnos.filter((h): h is string => typeof h === "string") : []
  const added = htsnos.length ? await addBatchItems(db, batch.id, htsnos) : null
  return { batch, added }
}

export const loadBatch = async (db: RevisionDb, id: string) => {
  const batch = await loadBatchRow(db, id)
  const batchItems = must<CoverageBatchItem[]>(
    await db.from(T.BATCH_ITEMS).select("*").eq("batch_id", id).order("sort_order"),
    "Load batch items"
  )
  const codes = batchItems.map((b) => b.htsno)
  const items: CoverageItem[] = []
  for (let i = 0; i < codes.length; i += 300) {
    items.push(...must<CoverageItem[]>(await db.from(T.ITEMS).select("*").in("htsno", codes.slice(i, i + 300)), "Load headings"))
  }
  const byCode = new Map(items.map((i) => [i.htsno, i]))
  return { batch, items: batchItems.map((b) => ({ ...b, item: byCode.get(b.htsno)! })).filter((b) => b.item) }
}

export const updateBatch = async (
  db: RevisionDb,
  id: string,
  patch: { title?: unknown; instructions?: unknown; dates_mode?: unknown; status?: unknown; pr_url?: unknown }
) => {
  const batch = await loadBatchRow(db, id)
  const values: Partial<CoverageBatch> = { updated_at: now() }

  const editsContent = "title" in patch || "instructions" in patch || "dates_mode" in patch
  if (editsContent) requireDraft(batch)
  if ("title" in patch) {
    const title = typeof patch.title === "string" ? patch.title.trim() : ""
    if (!title) throw new Error("A batch needs a title")
    values.title = title
  }
  if ("instructions" in patch) values.instructions = typeof patch.instructions === "string" ? patch.instructions.trim() || null : null
  if ("dates_mode" in patch) {
    if (!DATES_MODES.includes(patch.dates_mode as DatesMode)) throw new Error(`Unknown dates mode ${patch.dates_mode}`)
    values.dates_mode = patch.dates_mode as DatesMode
  }
  if ("pr_url" in patch) values.pr_url = typeof patch.pr_url === "string" ? patch.pr_url.trim() || null : null

  if ("status" in patch && patch.status !== batch.status) {
    const status = patch.status as BatchStatus
    if (!BATCH_STATUSES.includes(status)) throw new Error(`Unknown status ${patch.status}`)
    if (!TRANSITIONS[batch.status].includes(status)) throw new Error(`A ${batch.status} batch can't become ${status}`)
    const items = must<Pick<CoverageBatchItem, "htsno" | "decision">[]>(
      await db.from(T.BATCH_ITEMS).select("htsno, decision").eq("batch_id", id),
      "Load batch items"
    )
    if (status === "ready") {
      const pending = items.filter((i) => i.decision === "pending").length
      if (pending) throw new Error(`${pending} heading${pending === 1 ? " has" : "s have"} no decision yet`)
      if (!items.some((i) => i.decision === "include")) throw new Error("Include at least one heading")
    }
    // Reopening an archived batch: its headings may be in another open batch by now
    if (status === "draft" && batch.status === "archived") {
      const conflicts = await openConflicts(
        db,
        items.map((i) => i.htsno),
        id
      )
      if (conflicts.length) throw new Error(`${conflicts.map((c) => `${c.htsno} (in ${c.batch})`).join(", ")} are in another open batch`)
    }
    values.status = status
    if (status === "pulled") values.pulled_at = now()
    if (status === "applied") values.applied_at = now()
  }

  return must<CoverageBatch>(await db.from(T.BATCHES).update(values).eq("id", id).select("*").single(), "Update batch")
}

export const updateBatchItem = async (
  db: RevisionDb,
  batchId: string,
  htsno: string,
  patch: { decision?: unknown; instructions?: unknown }
) => {
  requireDraft(await loadBatchRow(db, batchId))
  const values: Partial<CoverageBatchItem> = { updated_at: now() }
  if ("decision" in patch) {
    if (!BATCH_DECISIONS.includes(patch.decision as BatchDecision)) throw new Error(`Unknown decision ${patch.decision}`)
    values.decision = patch.decision as BatchDecision
    values.reviewed_at = patch.decision === "pending" ? null : now()
  }
  if ("instructions" in patch) values.instructions = typeof patch.instructions === "string" ? patch.instructions.trim() || null : null
  return must<CoverageBatchItem>(
    await db.from(T.BATCH_ITEMS).update(values).eq("batch_id", batchId).eq("htsno", htsno).select("*").single(),
    "Update batch item"
  )
}

export const deleteBatch = async (db: RevisionDb, id: string) => {
  const batch = await loadBatchRow(db, id)
  if (!["draft", "archived"].includes(batch.status)) throw new Error("Only draft or archived batches can be deleted")
  must(await db.from(T.BATCHES).delete().eq("id", id), "Delete batch")
  return { deleted: batch.name }
}
