import TariffSourcesDashboard from "@/components/tariff-sources/TariffSourcesDashboard"
import type { SourceItemRow, SourceRunRow, UpdateRow } from "@/components/tariff-sources/types"
import { createAdminClient } from "../api/supabase/server"
import { guardAdmin } from "@/libs/admin/access"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Tariff sources | HTS Hero",
  robots: { index: false, follow: false },
}

const MAX_ROWS = 10_000
// Supabase returns at most 1,000 rows a request
const PAGE = 1000

type Db = ReturnType<typeof createAdminClient>

// A table's rows, newest first, a page at a time
const loadAll = async <T,>(db: Db, table: string, columns: string, orderBy: string) => {
  const rows: T[] = []
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await db
      .from(table)
      .select(columns)
      .order(orderBy, { ascending: false })
      .order("id")
      .range(from, from + PAGE - 1)
    if (error) return { rows, error: error.message }
    rows.push(...(data as T[]))
    if (data.length < PAGE) break
  }
  return { rows, error: null }
}

export default async function TariffSourcesPage() {
  await guardAdmin()
  const db = createAdminClient()
  const [items, updates, runs] = await Promise.all([
    loadAll<SourceItemRow>(
      db,
      "tariff_source_items",
      "id, source, external_id, title, url, published_at, summary, doc_type, agencies, matched_terms, collected_at, category, category_reason, extraction, stage, update_id, match_confidence, grouped_by, process_error",
      "published_at"
    ),
    loadAll<UpdateRow>(
      db,
      "tariff_updates",
      "id, slug, title, summary, kind, authority, countries, hts_codes, products, effective_on, stage, first_seen_at, last_activity_at, lead_item_id, status, needs_review, review_notes, edited, scope_codes, scope_excluded_codes, scope_countries, scope_excluded_countries, scope_headings, scope_source, scope_read_at, scope_notes, scope_documents",
      "last_activity_at"
    ),
    db.from("tariff_source_runs").select("source, trigger, started_at, finished_at, found, added, error").order("started_at", { ascending: false }).limit(300),
  ])
  return (
    <TariffSourcesDashboard
      items={items.rows}
      updates={updates.rows}
      runs={(runs.data ?? []) as SourceRunRow[]}
      loadError={items.error ?? updates.error ?? runs.error?.message ?? null}
    />
  )
}
