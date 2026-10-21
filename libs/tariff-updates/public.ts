import { createAdminClient, createPublicClient } from "@/app/api/supabase/server"
import { getHtsElementsServer } from "@/libs/hts-server"
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
  external_id: string
  title: string
  url: string
  published_at: string
  doc_type: string | null
  stage: Stage | null
}

const COLUMNS = "slug, title, summary, kind, authority, countries, hts_codes, products, effective_on, stage, first_seen_at, last_activity_at"

// Supabase returns at most 1,000 rows a request
const PAGE = 1000

// The newest few, for a page that shows the latest (the duty calculator's Tariff News)
export const getLatestUpdates = async (limit: number): Promise<PublicUpdate[]> => {
  const { data, error } = await createPublicClient()
    .from("tariff_updates")
    .select(COLUMNS)
    .eq("status", "published")
    .neq("kind", "hts_revision")
    .order("last_activity_at", { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Loading tariff updates: ${error.message}`)
  return (data ?? []) as PublicUpdate[]
}

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
    .select("source, external_id, title, url, published_at, doc_type, stage")
    .eq("update_id", update.id)
    .order("published_at")
  if (sourcesError) throw new Error(`Loading a tariff update's sources: ${sourcesError.message}`)
  const { id: _id, ...rest } = update as PublicUpdate & { id: string }
  const publicSources = (sources ?? []) as PublicSource[]
  const revisionEntry = rest.kind === "hts_revision" ? await revisionEntryFor(publicSources) : null
  return {
    update: rest as PublicUpdate,
    sources: publicSources,
    revisionEntry,
    // An HTS revision's page says little beyond "it was posted" until the calculator's changelog
    // describes it, so until then it stays out of search results
    indexable: rest.kind !== "hts_revision" || !!revisionEntry,
  }
}

// The calculator changelog's entry for an HTS revision update (its USITC release name), once
// published
const revisionEntryFor = async (sources: PublicSource[]) => {
  const release = sources.find((s) => s.source === "usitc")?.external_id
  if (!release) return null
  const { data } = await createPublicClient()
    .from("tariff_changelog")
    .select("title, summary, entry_date")
    .eq("status", "published")
    .eq("type", "revision")
    .eq("revision", release)
    .order("entry_date", { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as { title: string; summary: string; entry_date: string } | null) ?? null
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

// The ways an update may name this code or a heading above it: "8703", "8703.23", "870323",
// "8703.23.01", "4818.90.0080", "Chapter 87"
export const codeVariants = (htsno: string) => {
  const digits = htsno.replace(/\D/g, "")
  const variants = new Set<string>()
  for (const length of [4, 6, 8, 10]) {
    if (digits.length < length) break
    const prefix = digits.slice(0, length)
    variants.add(prefix)
    variants.add(htsPageCode(prefix)!)
    if (length === 10) variants.add(`${prefix.slice(0, 4)}.${prefix.slice(4, 6)}.${prefix.slice(6)}`)
  }
  if (digits.length >= 2) {
    variants.add(`Chapter ${digits.slice(0, 2)}`)
    variants.add(`Chapter ${Number(digits.slice(0, 2))}`)
  }
  return Array.from(variants)
}

// The latest published updates naming an HTS code or a heading above it, for its /hts page.
// Never throws: the code page renders without them.
export const getUpdatesNamingCode = async (htsno: string, limit = 5): Promise<PublicUpdate[]> => {
  const variants = codeVariants(htsno)
  if (!variants.length) return []
  const { data, error } = await createPublicClient()
    .from("tariff_updates")
    .select(COLUMNS)
    .eq("status", "published")
    .overlaps("hts_codes", variants)
    .order("last_activity_at", { ascending: false })
    .limit(limit)
  if (error) {
    console.error("Loading tariff updates for an HTS code:", error.message)
    return []
  }
  return data as PublicUpdate[]
}

// Where each code an update names should link on the site, worked out against the current HTS:
// its own /hts page; else the first line under it ("4802.61.10" has no page of its own, only
// "4802.61.10.00"); else the nearest heading above it. Chapters link to their chapter page.
// Codes that resolve to nothing aren't linked, so no link on these pages ever 404s.
export const resolveHtsLinks = async (codes: string[]): Promise<Record<string, string | null>> => {
  const htsnos = (await getHtsElementsServer()).map((e) => e.htsno).filter(Boolean)
  const known = new Set(htsnos)
  const sorted = [...htsnos].sort()
  const firstUnder = (code: string) => {
    let lo = 0
    let hi = sorted.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (sorted[mid] < code) lo = mid + 1
      else hi = mid
    }
    return sorted[lo]?.startsWith(`${code}.`) ? sorted[lo] : null
  }
  const links: Record<string, string | null> = {}
  for (const code of codes) {
    const chapter = chapterOf(code)
    if (chapter) {
      links[code] = `/chapter/${Number(chapter)}`
      continue
    }
    const htsno = htsPageCode(code)
    if (!htsno) {
      links[code] = null
      continue
    }
    let target = known.has(htsno) ? htsno : firstUnder(htsno)
    // Up through the parents: "4802.61.20" → "4802.61" → "4802"
    for (let parent = htsno; !target && parent.includes("."); ) {
      parent = parent.slice(0, parent.lastIndexOf("."))
      if (known.has(parent)) target = parent
    }
    links[code] = target ? `/hts/${target}` : null
  }
  return links
}
