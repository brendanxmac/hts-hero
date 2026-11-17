import { cache } from "react"
import { createAdminClient } from "@/app/api/supabase/server"
import { getPublishedUpdates, type PublicUpdate } from "./public"

// One year's tariff actions for /tariff-updates/[year] pages: the published updates whose latest
// activity (the date the feed orders and dates them by) falls in that year, newest first.
// An HTS revision's page is noindexed until the calculator changelog describes the revision
// (getPublishedUpdate's `indexable`), so those stay off the year's log too, the same filter as the
// sitemap (next-sitemap.config.js getTariffUpdates).

// The slugs of published HTS revision updates the calculator changelog doesn't describe yet
const undescribedRevisionSlugs = async (): Promise<Set<string>> => {
  const db = createAdminClient()
  const { data: revisions, error } = await db.from("tariff_updates").select("id, slug").eq("status", "published").eq("kind", "hts_revision")
  if (error) throw new Error(`Loading HTS revision updates: ${error.message}`)
  if (!revisions?.length) return new Set()
  const { data: releases, error: releasesError } = await db
    .from("tariff_source_items")
    .select("update_id, external_id")
    .eq("source", "usitc")
    .in(
      "update_id",
      revisions.map((r) => r.id)
    )
  if (releasesError) throw new Error(`Loading HTS revision releases: ${releasesError.message}`)
  const { data: entries, error: entriesError } = await db.from("tariff_changelog").select("revision").eq("status", "published").eq("type", "revision")
  if (entriesError) throw new Error(`Loading the calculator changelog: ${entriesError.message}`)
  const described = new Set((entries ?? []).map((e) => e.revision))
  const releaseOf = new Map((releases ?? []).map((r) => [r.update_id, r.external_id]))
  return new Set(revisions.filter((r) => !described.has(releaseOf.get(r.id))).map((r) => r.slug))
}

export const getYearUpdates = cache(async (year: number): Promise<PublicUpdate[]> => {
  const [updates, hidden] = await Promise.all([getPublishedUpdates(), undescribedRevisionSlugs()])
  return updates.filter((u) => u.last_activity_at.startsWith(`${year}-`) && !hidden.has(u.slug))
})
