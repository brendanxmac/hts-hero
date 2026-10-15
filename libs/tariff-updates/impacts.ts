import type { SupabaseClient } from "@supabase/supabase-js"
import type { HtsElement } from "../../interfaces/hts"
import { readAdjustments } from "../../components/tariff-tracker/adjustments"
import { readCatalog, type CatalogItem } from "../../components/tariff-tracker/catalog"
import type { TrackedProduct } from "../../components/tariff-tracker/report"
import { trackedProducts } from "../tariff-tracker/snapshot"
import { dutyOn, importImpacts, type ImpactUpdate } from "./impactOf"
import type { MatchLevel } from "./match"

// Which of each account's imports each recent tariff update may affect (tariff_update_impacts),
// on the server, for alerts and the onboarding emails. What each level means, and how it's worked
// out, is in impactOf.ts (the Tracker's Tariff impact tab uses the same code).

type Db = SupabaseClient

// Updates whose impacts are kept: active in this many days
const RECENT_DAYS = 120

export type { ImpactUpdate }

export interface ImpactRow {
  update_id: string
  user_id: string
  product_key: string
  level: MatchLevel
  before_pct: number | null
  after_pct: number | null
  delta_usd: number | null
}

export const recentUpdates = async (db: Db, { ids }: { ids?: string[] } = {}) => {
  let query = db
    .from("tariff_updates")
    .select("id, slug, hts_codes, countries, authority, kind, effective_on, scope_codes, scope_excluded_codes, scope_countries, scope_excluded_countries, scope_headings")
    .eq("status", "published")
    .eq("needs_review", false)
    // An HTS revision carries out actions that have their own updates: it only confirms them
    // (through the engine), never alerts by itself
    .neq("kind", "hts_revision")
  query = ids ? query.in("id", ids) : query.gte("last_activity_at", new Date(Date.now() - RECENT_DAYS * 86_400_000).toISOString())
  const { data, error } = await query
  if (error) throw new Error(`Loading updates: ${error.message}`)
  return (data ?? []) as ImpactUpdate[]
}

// One account's impacts from the given updates
export const impactsFor = (userId: string, items: CatalogItem[], products: TrackedProduct[], updates: ImpactUpdate[]): ImpactRow[] => {
  const on = dutyOn()
  const rows = updates.flatMap((u) =>
    importImpacts(u, items, products, on).map((i) => ({
      update_id: u.id,
      user_id: userId,
      product_key: i.key,
      level: i.level,
      before_pct: i.beforePct,
      after_pct: i.afterPct,
      delta_usd: i.deltaUsd,
    }))
  )
  // One row per update and import (a catalog can name the same import twice)
  const seen = new Set<string>()
  return rows.filter((r) => !seen.has(`${r.update_id}|${r.product_key}`) && !!seen.add(`${r.update_id}|${r.product_key}`))
}

const saveImpacts = async (db: Db, userId: string, rows: ImpactRow[], updateIds?: string[]) => {
  let clear = db.from("tariff_update_impacts").delete().eq("user_id", userId)
  if (updateIds) clear = clear.in("update_id", updateIds)
  const { error } = await clear
  if (error) throw new Error(`Clearing impacts: ${error.message}`)
  for (let i = 0; i < rows.length; i += 500) {
    const { error: insertError } = await db.from("tariff_update_impacts").insert(rows.slice(i, i + 500))
    if (insertError) throw new Error(`Saving impacts: ${insertError.message}`)
  }
}

const CATALOG_PAGE = 200

// Every account's impacts from the recent updates, or (updateIds) from just those updates
export const refreshImpacts = async (
  db: Db,
  htsElements: HtsElement[],
  { deadline, onlyUserIds, updateIds }: { deadline: number; onlyUserIds?: string[]; updateIds?: string[] }
) => {
  const updates = await recentUpdates(db, { ids: updateIds })
  // Every catalog, a page at a time (a query returns at most 1,000 rows)
  const catalogs: { user_id: string; items: unknown; adjustments: unknown }[] = []
  for (let from = 0; ; from += CATALOG_PAGE) {
    let query = db.from("tracker_catalogs").select("user_id, items, adjustments").order("user_id").range(from, from + CATALOG_PAGE - 1)
    if (onlyUserIds) query = query.in("user_id", onlyUserIds)
    const { data, error } = await query
    if (error) throw new Error(`Loading catalogs: ${error.message}`)
    catalogs.push(...(data ?? []))
    if ((data ?? []).length < CATALOG_PAGE) break
  }
  let accounts = 0
  let impacts = 0
  let failed = 0
  for (const c of catalogs) {
    if (Date.now() > deadline) break
    try {
      const items = readCatalog(JSON.stringify(c.items)) ?? []
      const products = trackedProducts(items, readAdjustments(JSON.stringify(c.adjustments)), htsElements)
      const rows = impactsFor(c.user_id, items, products, updates)
      // Without updateIds the recent set replaces everything (older updates drop off)
      await saveImpacts(db, c.user_id, rows, updateIds)
      accounts++
      impacts += rows.length
    } catch (e) {
      failed++
      console.error(`Impacts for ${c.user_id}:`, e instanceof Error ? e.message : e)
    }
  }
  return { updates: updates.length, accounts, impacts, failed }
}
