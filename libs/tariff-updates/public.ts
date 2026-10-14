import { createAdminClient, createPublicClient } from "@/app/api/supabase/server"
import type { SourceId } from "../tariff-sources/types"
import { STAGE_ORDER, type Authority, type Kind, type Stage } from "./types"

// What /tariff-updates shows: published updates, and for one update the official sources that
// moved it along. Updates are public through row-level security; source items aren't, so a page's
// sources are read on the server with only the columns shown.

export interface PublicUpdate {
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
}

export interface PublicSource {
  source: SourceId
  title: string
  url: string
  published_at: string
  doc_type: string | null
  stage: Stage | null
}

const COLUMNS = "slug, title, summary, kind, authority, countries, hts_codes, products, effective_on, stage, first_seen_at, last_activity_at"

// Supabase returns at most 1,000 rows a request
const PAGE = 1000

export const getPublishedUpdates = async (): Promise<PublicUpdate[]> => {
  const db = createPublicClient()
  const updates: PublicUpdate[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from("tariff_updates")
      .select(COLUMNS)
      .eq("status", "published")
      .order("last_activity_at", { ascending: false })
      .order("slug")
      .range(from, from + PAGE - 1)
    if (error) throw new Error(`Loading tariff updates: ${error.message}`)
    updates.push(...(data as PublicUpdate[]))
    if (data.length < PAGE) return updates
  }
}

export const getPublishedUpdate = async (slug: string) => {
  const { data: update, error } = await createPublicClient()
    .from("tariff_updates")
    .select(`id, ${COLUMNS}`)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle()
  if (error) throw new Error(`Loading a tariff update: ${error.message}`)
  if (!update) return null
  const { data: sources, error: sourcesError } = await createAdminClient()
    .from("tariff_source_items")
    .select("source, title, url, published_at, doc_type, stage")
    .eq("update_id", update.id)
    .order("published_at")
  if (sourcesError) throw new Error(`Loading a tariff update's sources: ${sourcesError.message}`)
  const { id: _id, ...rest } = update as PublicUpdate & { id: string }
  return { update: rest as PublicUpdate, sources: (sources ?? []) as PublicSource[] }
}

// The stages an update has reached, in order (an action can skip some: not every one is
// announced first or filed early)
export const stagesReached = (sources: PublicSource[]) =>
  STAGE_ORDER.filter((stage) => sources.some((s) => s.stage === stage))

// "9903.81.90", "8703", "4818.90.0080" → the /hts page's code; null when it isn't one
export const htsPageCode = (code: string) => {
  const digits = code.replace(/\D/g, "")
  if (!/^\d+$/.test(code.replace(/[.\s]/g, ""))) return null
  if (digits.length === 4) return digits
  if (digits.length === 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`
  if (digits.length === 8) return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`
  if (digits.length === 10) return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}.${digits.slice(8)}`
  return null
}

// "Chapter 73" → "73"
export const chapterOf = (code: string) => code.match(/^chapter\s+(\d{1,2})$/i)?.[1] ?? null
