import type { SupabaseClient } from "@supabase/supabase-js"
import type { ClaudeUsage } from "../hts-revision-diff/types"
import { mapLimit } from "../tariff-sources/text"
import type { SourceId } from "../tariff-sources/types"
import { chooseUpdate, extractAction, triageItems, type GroupCandidate, type TriageInput } from "./claude"
import { fullTextOf } from "./fulltext"
import {
  LEAD_PRIORITY,
  MATCH_CONFIDENCE,
  PUBLISH_CONFIDENCE,
  STAGE_ORDER,
  stageOfSource,
  type Category,
  type Extraction,
  type Stage,
} from "./types"

// Turns source items into tariff updates, in three passes that each pick up where the last run
// stopped (so the cron, "Process now" and the backfill script all share it):
//   1. sort: every new item gets a category (items with no tariff words, and USITC releases,
//      without asking Claude)
//   2. read: each tariff action's full text becomes an Extraction (several at once)
//   3. group: oldest first, one at a time, each action joins an update or starts one. An FR
//      document joins the update its public inspection copy is in, without asking Claude.
// Items that fail keep the error in process_error and are skipped until it's cleared.

type Db = SupabaseClient

interface ItemRow {
  id: string
  source: SourceId
  title: string
  url: string
  published_at: string
  summary: string | null
  doc_type: string | null
  agencies: string[]
  matched_terms: string[]
  document_number: string | null
  raw: Record<string, unknown>
  category: Category | null
  extraction: Extraction | null
  stage: Stage | null
  update_id: string | null
}

const ITEM_COLUMNS =
  "id, source, title, url, published_at, summary, doc_type, agencies, matched_terms, document_number, raw, category, extraction, stage, update_id"

const TRIAGE_BATCH = 25
// How far back an action's earlier steps are looked for, and how many updates Claude chooses from:
// those sharing the action's authority or a country, most recent first
const CANDIDATE_DAYS = 240
const MAX_CANDIDATES = 40

// Claude's cost per step, in US$
export interface StepCosts {
  sort: number
  read: number
  group: number
}

const newCosts = (): StepCosts => ({ sort: 0, read: 0, group: 0 })
const addCost = (costs: StepCosts, step: keyof StepCosts, usage: ClaudeUsage) => {
  costs[step] += usage.cost_usd
}

// At most this many items per step in a run (a small sample, to see what processing costs)
export interface StepLimits {
  sort?: number
  read?: number
  group?: number
}

export interface ProcessResult {
  costs: StepCosts
  // Items Claude was asked about, per step (sorting asks in batches)
  asked: StepCosts
  sorted: number
  read: number
  grouped: number
  created: number
  errors: number
  remaining: boolean
}

const must = <T>(result: { data: T | null; error: { message: string } | null }, what: string): T => {
  if (result.error) throw new Error(`${what}: ${result.error.message}`)
  return result.data as T
}

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 500)

// ---------- 1. Sort ----------

const sortPending = async (db: Db, deadline: number, costs: StepCosts, asked: StepCosts, limit = 1000) => {
  const items = must<ItemRow[]>(
    await db.from("tariff_source_items").select(ITEM_COLUMNS).is("categorized_at", null).order("published_at").limit(limit),
    "Loading items to sort"
  )
  const now = () => new Date().toISOString()
  const ruled = items.flatMap((item) =>
    item.source === "usitc"
      ? [{ id: item.id, category: "hts_revision", category_reason: "USITC HTS release" }]
      : item.matched_terms.length === 0
        ? [{ id: item.id, category: "not_relevant", category_reason: "No tariff words in the title or summary" }]
        : []
  )
  for (const row of ruled) {
    must(await db.from("tariff_source_items").update({ ...row, categorized_at: now() }).eq("id", row.id), "Saving a category")
  }
  const ruledIds = new Set(ruled.map((r) => r.id))
  const toAsk = items.filter((item) => !ruledIds.has(item.id))
  const batches: ItemRow[][] = []
  for (let i = 0; i < toAsk.length; i += TRIAGE_BATCH) batches.push(toAsk.slice(i, i + TRIAGE_BATCH))

  let sorted = ruled.length
  let errors = 0
  await mapLimit(batches, 3, async (batch) => {
    if (Date.now() > deadline) return
    const inputs: TriageInput[] = batch.map((item, index) => ({
      index,
      source: item.source,
      doc_type: item.doc_type,
      agencies: item.agencies,
      title: item.title,
      summary: item.summary,
    }))
    try {
      const { answers: list, usage } = await triageItems(inputs)
      addCost(costs, "sort", usage)
      asked.sort += batch.length
      const answers = new Map(list.map((a) => [a.index, a]))
      for (const [index, item] of Array.from(batch.entries())) {
        const answer = answers.get(index)
        if (!answer) continue
        must(
          await db
            .from("tariff_source_items")
            .update({ category: answer.category, category_reason: answer.reason, categorized_at: now() })
            .eq("id", item.id),
          "Saving a category"
        )
        sorted++
      }
    } catch (e) {
      errors++
      console.error("Sorting tariff source items failed:", errorText(e))
    }
  })
  return { sorted, errors, remaining: sorted < items.length || items.length === limit }
}

// ---------- 2. Read ----------

const readPending = async (db: Db, deadline: number, costs: StepCosts, asked: StepCosts, limit = 200) => {
  const items = must<ItemRow[]>(
    await db
      .from("tariff_source_items")
      .select(ITEM_COLUMNS)
      .eq("category", "tariff_action")
      .is("extracted_at", null)
      .is("process_error", null)
      .order("published_at")
      .limit(limit),
    "Loading tariff actions to read"
  )
  let read = 0
  let errors = 0
  await mapLimit(items, 4, async (item) => {
    if (Date.now() > deadline) return
    try {
      const { text, truncated } = await fullTextOf(item)
      const result = await extractAction(item, text)
      addCost(costs, "read", result.usage)
      asked.read++
      const extraction: Extraction = { ...result.extraction, ...(truncated ? { truncated } : {}) }
      must(
        await db
          .from("tariff_source_items")
          .update({ extraction, extracted_at: new Date().toISOString(), stage: stageOfSource(item.source) })
          .eq("id", item.id),
        "Saving an extraction"
      )
      read++
    } catch (e) {
      errors++
      await db.from("tariff_source_items").update({ process_error: `Reading: ${errorText(e)}` }).eq("id", item.id)
    }
  })
  return { read, errors, remaining: read + errors < items.length || items.length === limit }
}

// ---------- Updates ----------

// "US sets 25% tariff on trucks" → "us-sets-25-tariff-on-trucks", cut at a word past 80 characters
export const slugify = (text: string) => {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return slug.length > 80 ? slug.slice(0, 80).replace(/-[^-]*$/, "") : slug
}

const uniqueSlug = async (db: Db, base: string) => {
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`
    const { data } = await db.from("tariff_updates").select("id").eq("slug", slug).maybeSingle()
    if (!data) return slug
  }
}

const hasExtraction = (item: ItemRow): item is ItemRow & { extraction: Extraction } => !!item.extraction

// The update's fields, worked out again from all its items: the latest stage, the earliest and
// latest dates, every country and code, and the lead item's headline and summary (unless edited)
export const recomputeUpdate = async (db: Db, updateId: string) => {
  const items = must<ItemRow[]>(await db.from("tariff_source_items").select(ITEM_COLUMNS).eq("update_id", updateId), "Loading an update's items")
  if (!items.length) {
    must(await db.from("tariff_updates").delete().eq("id", updateId), "Removing an empty update")
    return
  }
  const update = must<{ edited: boolean }>(await db.from("tariff_updates").select("edited").eq("id", updateId).single(), "Loading an update")
  const byDate = [...items].sort((a, b) => a.published_at.localeCompare(b.published_at))
  // The action leads over the steps toward it (hearings, comment requests): among items that aren't
  // investigation steps (or all, if every item is), the most authoritative source, then the latest
  const substantive = items.filter((i) => i.extraction && i.extraction.kind !== "investigation")
  const lead = [...(substantive.length ? substantive : items)].sort(
    (a, b) => LEAD_PRIORITY[b.source] - LEAD_PRIORITY[a.source] || b.published_at.localeCompare(a.published_at)
  )[0]
  const extracted = items.filter(hasExtraction)
  const leadExtraction = lead.extraction ?? extracted[0]?.extraction
  const stage = STAGE_ORDER[Math.max(...items.map((i) => STAGE_ORDER.indexOf(i.stage ?? stageOfSource(i.source))))]
  const union = (values: string[][], max: number) => Array.from(new Set(values.flat())).slice(0, max)
  const effective =
    leadExtraction?.effective_on ??
    extracted
      .map((i) => i.extraction.effective_on)
      .filter(Boolean)
      .sort()
      .pop() ??
    null

  must(
    await db
      .from("tariff_updates")
      .update({
        ...(update.edited || !leadExtraction ? {} : { title: leadExtraction.headline, summary: leadExtraction.summary }),
        ...(leadExtraction ? { kind: leadExtraction.kind, authority: leadExtraction.authority, products: leadExtraction.products } : {}),
        countries: union(extracted.map((i) => i.extraction.countries), 300),
        hts_codes: union(extracted.map((i) => i.extraction.hts_codes), 500),
        effective_on: effective,
        stage,
        first_seen_at: byDate[0].published_at,
        last_activity_at: byDate[byDate.length - 1].published_at,
        lead_item_id: lead.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", updateId),
    "Saving an update"
  )
}

// A new update from one item
export const createUpdate = async (db: Db, item: ItemRow, opts: { reviewNote?: string } = {}) => {
  const extraction: Extraction =
    item.extraction ??
    // USITC releases aren't read: their change record is the whole revision
    {
      headline: `USITC posts ${item.title}`,
      summary: [
        typeof item.raw.effective_from === "string" &&
          `It takes effect ${new Date(`${item.raw.effective_from}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}.`,
        "The change record lists every change to the HTS in this revision.",
      ]
        .filter(Boolean)
        .join(" "),
      kind: "hts_revision",
      authority: "hts",
      countries: [],
      hts_codes: [],
      products: null,
      effective_on: typeof item.raw.effective_from === "string" ? item.raw.effective_from : null,
      confidence: 1,
      notes: null,
    }
  const confident = extraction.confidence >= PUBLISH_CONFIDENCE && !extraction.truncated
  const notes = [
    !confident && `Claude's confidence ${extraction.confidence}${extraction.truncated ? ", text was cut off" : ""}`,
    extraction.notes,
    opts.reviewNote,
  ].filter(Boolean)
  const created = must<{ id: string }>(
    await db
      .from("tariff_updates")
      .insert({
        slug: await uniqueSlug(db, `${slugify(extraction.headline)}-${item.published_at.slice(0, 10)}`),
        title: extraction.headline,
        summary: extraction.summary,
        kind: extraction.kind,
        authority: extraction.authority,
        countries: extraction.countries,
        hts_codes: extraction.hts_codes.slice(0, 500),
        products: extraction.products,
        effective_on: extraction.effective_on,
        stage: item.stage ?? stageOfSource(item.source),
        first_seen_at: item.published_at,
        last_activity_at: item.published_at,
        lead_item_id: item.id,
        status: confident ? "published" : "hidden",
        needs_review: !confident || !!opts.reviewNote,
        review_notes: notes.length ? notes.join("\n") : null,
      })
      .select("id")
      .single(),
    "Creating an update"
  )
  return created.id
}

const flagForReview = async (db: Db, updateId: string, note: string) => {
  const current = must<{ review_notes: string | null }>(
    await db.from("tariff_updates").select("review_notes").eq("id", updateId).single(),
    "Loading an update"
  )
  must(
    await db
      .from("tariff_updates")
      .update({ needs_review: true, review_notes: [current.review_notes, note].filter(Boolean).join("\n") })
      .eq("id", updateId),
    "Flagging an update"
  )
}

const attach = async (db: Db, item: ItemRow, updateId: string, groupedBy: string, confidence: number | null) =>
  must(
    await db
      .from("tariff_source_items")
      .update({
        update_id: updateId,
        grouped_at: new Date().toISOString(),
        grouped_by: groupedBy,
        match_confidence: confidence,
        stage: item.stage ?? stageOfSource(item.source),
      })
      .eq("id", item.id),
    "Joining an item to an update"
  )

// ---------- 3. Group ----------

const candidatesFor = async (db: Db, item: ItemRow & { extraction: Extraction }): Promise<GroupCandidate[]> => {
  const from = new Date(new Date(item.published_at).getTime() - CANDIDATE_DAYS * 86_400_000).toISOString()
  const countries = item.extraction.countries.includes("ALL") ? [] : item.extraction.countries
  // Same authority, or a shared country (an all-countries action shares every country)
  const related = [
    `authority.eq.${item.extraction.authority}`,
    ...(countries.length ? [`countries.ov.{${[...countries, "ALL"].join(",")}}`] : []),
  ].join(",")
  const rows = must<{ id: string; title: string; authority: string; countries: string[]; products: string | null; effective_on: string | null; stage: string; first_seen_at: string; summary: string }[]>(
    await db
      .from("tariff_updates")
      .select("id, title, authority, countries, products, effective_on, stage, first_seen_at, summary")
      .neq("kind", "hts_revision")
      .gte("last_activity_at", from)
      .lte("first_seen_at", item.published_at)
      .or(related)
      .order("last_activity_at", { ascending: false })
      .limit(MAX_CANDIDATES),
    "Loading candidate updates"
  )
  return rows.map((r) => ({ ...r, first_seen: r.first_seen_at.slice(0, 10), summary: r.summary.slice(0, 400) }))
}

const groupPending = async (db: Db, deadline: number, costs: StepCosts, asked: StepCosts, limit = 300) => {
  const items = must<ItemRow[]>(
    await db
      .from("tariff_source_items")
      .select(ITEM_COLUMNS)
      .or("and(category.eq.tariff_action,extracted_at.not.is.null),category.eq.hts_revision")
      .is("grouped_at", null)
      .is("process_error", null)
      .order("published_at")
      .limit(limit),
    "Loading tariff actions to group"
  )
  let grouped = 0
  let created = 0
  let errors = 0
  for (const item of items) {
    if (Date.now() > deadline) break
    try {
      // A published FR document joins its public inspection copy's update
      const sibling = item.document_number
        ? must<{ update_id: string | null }[]>(
            await db
              .from("tariff_source_items")
              .select("update_id")
              .eq("document_number", item.document_number)
              .neq("id", item.id)
              .not("update_id", "is", null)
              .limit(1),
            "Looking for the same FR document"
          )[0]
        : undefined
      if (sibling?.update_id) {
        await attach(db, item, sibling.update_id, "document_number", 1)
        await recomputeUpdate(db, sibling.update_id)
      } else if (item.category === "hts_revision" || !item.extraction) {
        await attach(db, item, await createUpdate(db, item), "rule", null)
        created++
      } else {
        const candidates = await candidatesFor(db, { ...item, extraction: item.extraction })
        const choice = candidates.length
          ? await chooseUpdate({ ...item, extraction: item.extraction }, candidates)
          : { update_id: null, confidence: 1, reason: "No related earlier updates", usage: null }
        if (choice.usage) {
          addCost(costs, "group", choice.usage)
          asked.group++
        }
        if (choice.update_id) {
          await attach(db, item, choice.update_id, "claude", choice.confidence)
          await recomputeUpdate(db, choice.update_id)
          if (choice.confidence < MATCH_CONFIDENCE) {
            await flagForReview(db, choice.update_id, `Unsure "${item.title}" belongs here (${choice.confidence}): ${choice.reason}`)
          }
        } else {
          const reviewNote = choice.confidence < MATCH_CONFIDENCE ? `Might belong to an existing update: ${choice.reason}` : undefined
          await attach(db, item, await createUpdate(db, item, { reviewNote }), "claude", choice.confidence)
          created++
        }
      }
      grouped++
    } catch (e) {
      errors++
      await db.from("tariff_source_items").update({ process_error: `Grouping: ${errorText(e)}` }).eq("id", item.id)
    }
  }
  return { grouped, created, errors, remaining: grouped + errors < items.length || items.length === limit }
}

// ---------- All three ----------

const skipped = { sorted: 0, read: 0, grouped: 0, created: 0, errors: 0, remaining: true }

export const processTariffUpdates = async (
  db: Db,
  { deadline, limits = {} }: { deadline: number; limits?: StepLimits }
): Promise<ProcessResult> => {
  const costs = newCosts()
  const asked = newCosts()
  // A limit of 0 skips the step
  const sort = limits.sort === 0 ? skipped : await sortPending(db, deadline, costs, asked, limits.sort)
  const read = limits.read === 0 ? skipped : await readPending(db, deadline, costs, asked, limits.read)
  const group = limits.group === 0 ? skipped : await groupPending(db, deadline, costs, asked, limits.group)
  return {
    costs,
    asked,
    sorted: sort.sorted,
    read: read.read,
    grouped: group.grouped,
    created: group.created,
    errors: sort.errors + read.errors + group.errors,
    remaining: sort.remaining || read.remaining || group.remaining,
  }
}

// ---------- Admin changes ----------

// Moves an item to another update, or (null) into a new update of its own
export const moveItem = async (db: Db, itemId: string, toUpdateId: string | null) => {
  const item = must<ItemRow>(await db.from("tariff_source_items").select(ITEM_COLUMNS).eq("id", itemId).single(), "Loading the item")
  const target = toUpdateId ?? (await createUpdate(db, item))
  await attach(db, item, target, "admin", 1)
  await recomputeUpdate(db, target)
  if (item.update_id && item.update_id !== target) await recomputeUpdate(db, item.update_id)
  return target
}

// Re-sorts an item by hand: it's read and grouped again (if a tariff action) on the next run
export const setItemCategory = async (db: Db, itemId: string, category: Category) => {
  const item = must<ItemRow>(await db.from("tariff_source_items").select(ITEM_COLUMNS).eq("id", itemId).single(), "Loading the item")
  must(
    await db
      .from("tariff_source_items")
      .update({
        category,
        category_reason: "Set by hand",
        categorized_at: new Date().toISOString(),
        extraction: null,
        extracted_at: null,
        update_id: null,
        grouped_at: null,
        grouped_by: null,
        match_confidence: null,
        process_error: null,
      })
      .eq("id", itemId),
    "Saving the category"
  )
  if (item.update_id) await recomputeUpdate(db, item.update_id)
}
