import type { SourceId } from "@/libs/tariff-sources/types"
import type { Authority, Category, Extraction, Kind, Stage } from "@/libs/tariff-updates/types"

// Rows the /tariff-sources page loads, and the admin calls its views make

export interface SourceItemRow {
  id: string
  source: SourceId
  external_id: string
  title: string
  url: string
  published_at: string
  summary: string | null
  doc_type: string | null
  agencies: string[]
  matched_terms: string[]
  collected_at: string
  category: Category | null
  category_reason: string | null
  extraction: Extraction | null
  stage: Stage | null
  update_id: string | null
  match_confidence: number | null
  grouped_by: string | null
  process_error: string | null
}

export interface SourceRunRow {
  source: SourceId
  trigger: string
  started_at: string
  finished_at: string | null
  found: number | null
  added: number | null
  error: string | null
}

export interface UpdateRow {
  id: string
  slug: string
  title: string
  summary: string
  kind: Kind
  authority: Authority
  countries: string[]
  hts_codes: string[]
  products: string | null
  effective_on: string | null
  stage: Stage
  first_seen_at: string
  last_activity_at: string
  lead_item_id: string | null
  status: "published" | "hidden"
  needs_review: boolean
  review_notes: string | null
  edited: boolean
  // What it covers, read from its PDFs or set in review (libs/tariff-updates/scope.ts)
  scope_codes: string[] | null
  scope_excluded_codes: string[] | null
  scope_conditional_exclusions: { condition: string; codes: string[] }[] | null
  scope_countries: string[] | null
  scope_excluded_countries: string[] | null
  scope_headings: string[] | null
  scope_source: "reader" | "admin" | null
  scope_read_at: string | null
  scope_notes: string | null
  scope_documents: string[] | null
}

export const adminCall = async <T = unknown>(path: string, method: string, body?: unknown): Promise<T> => {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(json.error ?? `Request failed (${response.status})`)
  return json as T
}
