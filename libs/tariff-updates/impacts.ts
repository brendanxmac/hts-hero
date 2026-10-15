import type { SupabaseClient } from "@supabase/supabase-js"
import type { HtsElement } from "../../interfaces/hts"
import { AllRules } from "../../tariffs/engine-v2/data"
import { addDays } from "../../tariffs/engine-v2/history"
import { readAdjustments } from "../../components/tariff-tracker/adjustments"
import { readCatalog, type CatalogItem } from "../../components/tariff-tracker/catalog"
import { trackProduct, type TrackedProduct } from "../../components/tariff-tracker/report"
import { trackedProducts } from "../tariff-tracker/snapshot"
import { matchImport, scopeOf, type MatchableUpdate, type MatchLevel } from "./match"

// Which of each account's imports each recent tariff update may affect (tariff_update_impacts),
// on the server. Likely and possible come from what the update names (match.ts). Confirmed comes
// from the duty engine: when the update names a Chapter 99 heading the engine knows, every import
// is worked out the day before the update took effect and on the day; if the heading applies on
// the day, the import is confirmed, with the change in duty on one shipment.

type Db = SupabaseClient

// Updates whose impacts are kept: active in this many days
const RECENT_DAYS = 120

export interface ImpactUpdate extends MatchableUpdate {
  id: string
  effective_on: string | null
}

export interface ImpactRow {
  update_id: string
  user_id: string
  product_key: string
  level: MatchLevel
  before_pct: number | null
  after_pct: number | null
  delta_usd: number | null
}

const ENGINE_HEADINGS = new Set(AllRules.tariffs.map((t) => t.code))

const round = (n: number) => Math.round(n * 100) / 100

export const recentUpdates = async (db: Db, { ids }: { ids?: string[] } = {}) => {
  let query = db
    .from("tariff_updates")
    .select("id, slug, hts_codes, countries, authority, kind, effective_on, scope_codes, scope_excluded_codes, scope_countries, scope_excluded_countries, scope_headings")
    .eq("status", "published")
    .eq("needs_review", false)
  query = ids ? query.in("id", ids) : query.gte("last_activity_at", new Date(Date.now() - RECENT_DAYS * 86_400_000).toISOString())
  const { data, error } = await query
  if (error) throw new Error(`Loading updates: ${error.message}`)
  return (data ?? []) as ImpactUpdate[]
}

// The duty on an import on a given day, worked out again with its adjustments
const on = (p: TrackedProduct, htsElements: HtsElement[], date: string) => trackProduct(p.entry, htsElements, date, p.adjustments)

const headingApplies = (p: TrackedProduct, headings: Set<string>) => p.result.lines.some((l) => headings.has(l.code) && l.status === "applies")

// One account's impacts from the given updates
export const impactsFor = (userId: string, items: CatalogItem[], products: TrackedProduct[], updates: ImpactUpdate[], htsElements: HtsElement[]): ImpactRow[] => {
  const rows: ImpactRow[] = []
  const byKey = new Map(products.map((p) => [p.key, p]))
  for (const u of updates) {
    if (u.kind === "hts_revision") continue
    const scope = scopeOf(u)
    const known = new Set(scope.headings.filter((h) => ENGINE_HEADINGS.has(h)))
    const confirmed = new Set<string>()
    // Confirmed: the engine applies the update's heading on the day it took effect
    if (known.size && u.effective_on) {
      const before = addDays(u.effective_on, -1)
      for (const p of products) {
        const after = on(p, htsElements, u.effective_on)
        if (!headingApplies(after, known)) continue
        const prior = on(p, htsElements, before)
        if (headingApplies(prior, known) && Math.abs(prior.result.totalDuty - after.result.totalDuty) < 0.01) continue
        confirmed.add(p.key)
        rows.push({
          update_id: u.id,
          user_id: userId,
          product_key: p.key,
          level: "confirmed",
          before_pct: round(prior.totalPct),
          after_pct: round(after.totalPct),
          delta_usd: round(after.result.totalDuty - prior.result.totalDuty),
        })
      }
    }
    // Likely and possible: what the update names
    for (const item of items) {
      const key = `${item.code}-${item.country}`
      if (confirmed.has(key) || !byKey.has(key)) continue
      const level = matchImport(scope, item)
      if (level) rows.push({ update_id: u.id, user_id: userId, product_key: key, level, before_pct: null, after_pct: null, delta_usd: null })
    }
  }
  return rows
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

// Every account's impacts from the recent updates, or (updateIds) from just those updates
export const refreshImpacts = async (
  db: Db,
  htsElements: HtsElement[],
  { deadline, onlyUserIds, updateIds }: { deadline: number; onlyUserIds?: string[]; updateIds?: string[] }
) => {
  const updates = await recentUpdates(db, { ids: updateIds })
  let query = db.from("tracker_catalogs").select("user_id, items, adjustments")
  if (onlyUserIds) query = query.in("user_id", onlyUserIds)
  const { data: catalogs, error } = await query
  if (error) throw new Error(`Loading catalogs: ${error.message}`)
  let accounts = 0
  let impacts = 0
  let failed = 0
  for (const c of catalogs ?? []) {
    if (Date.now() > deadline) break
    try {
      const items = readCatalog(JSON.stringify(c.items)) ?? []
      const products = trackedProducts(items, readAdjustments(JSON.stringify(c.adjustments)), htsElements)
      const rows = impactsFor(c.user_id, items, products, updates, htsElements)
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
