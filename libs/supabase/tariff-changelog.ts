import { SupabaseClient } from "@supabase/supabase-js"

// Changelog for the tariff calculator. Table: supabase/migrations/tariff_changelog.sql

export const CHANGELOG_ADMIN_EMAIL = "brendan@htshero.com"

export const ChangelogTypes = ["revision", "fix", "improvement"] as const
export type ChangelogType = (typeof ChangelogTypes)[number]

export const ChangelogTypeLabels: Record<ChangelogType, string> = {
  revision: "HTS revision",
  fix: "Fix",
  improvement: "Improvement",
}

export type ChangelogStatus = "draft" | "published"

export interface ChangelogEntry {
  id: string
  entry_date: string // YYYY-MM-DD
  type: ChangelogType
  title: string
  summary: string
  revision: string | null
  status: ChangelogStatus
  created_at: string
  updated_at: string
}

export type ChangelogEntryInput = Pick<
  ChangelogEntry,
  "entry_date" | "type" | "title" | "summary" | "revision" | "status"
>

// Newest first. RLS limits non-admin clients to published entries; pass
// `includeDrafts` only with the service-role client.
export async function getChangelogEntries(
  supabase: SupabaseClient,
  { limit, includeDrafts = false }: { limit?: number; includeDrafts?: boolean } = {},
): Promise<ChangelogEntry[]> {
  let query = supabase
    .from("tariff_changelog")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
  if (!includeDrafts) query = query.eq("status", "published")
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) {
    console.error("Failed to fetch tariff changelog:", error)
    return []
  }
  return (data ?? []) as ChangelogEntry[]
}

// Validates a create or update body. Returns the cleaned fields or an error message.
export function parseChangelogInput(
  body: Record<string, unknown>,
  { partial = false }: { partial?: boolean } = {},
): { input: Partial<ChangelogEntryInput>; error?: string } {
  const input: Partial<ChangelogEntryInput> = {}
  const text = (key: string) => (typeof body[key] === "string" ? (body[key] as string).trim() : undefined)

  const entryDate = text("entry_date")
  if (entryDate !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) return { input, error: "Date must be YYYY-MM-DD." }
    input.entry_date = entryDate
  }
  const type = text("type")
  if (type !== undefined) {
    if (!ChangelogTypes.includes(type as ChangelogType)) return { input, error: "Unknown type." }
    input.type = type as ChangelogType
  }
  const title = text("title")
  if (title !== undefined) {
    if (!title) return { input, error: "Title is required." }
    input.title = title
  }
  const summary = text("summary")
  if (summary !== undefined) {
    if (!summary) return { input, error: "Summary is required." }
    input.summary = summary
  }
  if ("revision" in body) input.revision = text("revision") || null
  const status = text("status")
  if (status !== undefined) {
    if (status !== "draft" && status !== "published") return { input, error: "Unknown status." }
    input.status = status
  }

  if (!partial) {
    for (const key of ["type", "title", "summary"] as const) {
      if (!input[key]) return { input, error: `${key[0].toUpperCase()}${key.slice(1)} is required.` }
    }
  }
  return { input }
}

// "2026-10-02" → "Oct 2, 2026", without time zone shifts
export const formatChangelogDate = (isoDate: string) =>
  new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
