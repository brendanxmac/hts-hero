import type { SupabaseClient } from "@supabase/supabase-js"
import { csms } from "./sources/csms"
import { federalRegister, federalRegisterPublicInspection } from "./sources/federal-register"
import { ustr } from "./sources/ustr"
import { usitc } from "./sources/usitc"
import { whiteHouse } from "./sources/white-house"
import { matchTerms } from "./terms"
import type { Collector, SourceId, SourceItem } from "./types"

// Runs the collectors and stores what they find in tariff_source_items, one row per source item
// (an item already stored is left as it was). Each collector's run is logged in
// tariff_source_runs, so a source that stops answering shows up in the admin view.

export const COLLECTORS: Collector[] = [whiteHouse, federalRegisterPublicInspection, federalRegister, csms, ustr, usitc]

export type RunTrigger = "cron" | "manual" | "backfill"

export interface RunResult {
  source: SourceId
  found: number
  added: number
  error?: string
}

const CHUNK = 500

const rowOf = (item: SourceItem) => ({
  source: item.source,
  external_id: item.externalId,
  title: item.title,
  url: item.url,
  published_at: item.publishedAt,
  summary: item.summary ?? null,
  doc_type: item.docType ?? null,
  agencies: item.agencies ?? [],
  document_number: item.documentNumber ?? null,
  matched_terms: matchTerms(item.title, item.summary),
  raw: item.raw ?? {},
})

const runCollector = async (
  db: SupabaseClient,
  collector: Collector,
  { since, backfill, trigger }: { since: Date; backfill: boolean; trigger: RunTrigger }
): Promise<RunResult> => {
  const { data: run } = await db
    .from("tariff_source_runs")
    .insert({ source: collector.id, trigger, since: since.toISOString() })
    .select("id")
    .single()
  const finish = (result: RunResult) =>
    run
      ? db
          .from("tariff_source_runs")
          .update({ finished_at: new Date().toISOString(), found: result.found, added: result.added, error: result.error ?? null })
          .eq("id", run.id)
      : null

  try {
    const items = await collector.collect({ since, backfill })
    // One row per item, even when a source lists it twice
    const rows = Array.from(new Map(items.map((item) => [item.externalId, rowOf(item)])).values())
    let added = 0
    for (let i = 0; i < rows.length; i += CHUNK) {
      const { data, error } = await db
        .from("tariff_source_items")
        .upsert(rows.slice(i, i + CHUNK), { onConflict: "source,external_id", ignoreDuplicates: true })
        .select("id")
      if (error) throw new Error(error.message)
      added += data?.length ?? 0
    }
    const result = { source: collector.id, found: rows.length, added }
    await finish(result)
    return result
  } catch (e) {
    const result = { source: collector.id, found: 0, added: 0, error: e instanceof Error ? e.message : String(e) }
    await finish(result)
    return result
  }
}

export const collectSources = async (
  db: SupabaseClient,
  { since, backfill = false, trigger, sources }: { since: Date; backfill?: boolean; trigger: RunTrigger; sources?: SourceId[] }
) => {
  const collectors = sources ? COLLECTORS.filter((c) => sources.includes(c.id)) : COLLECTORS
  return Promise.all(collectors.map((c) => runCollector(db, c, { since, backfill, trigger })))
}
