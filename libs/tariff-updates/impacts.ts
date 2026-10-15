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
// is worked out the day before the update took effect and on the day (or the day the engine has
// the change, when that's a little later); if one of its headings starts or stops applying, or
// applies and the duty changes, the import is confirmed, with the change in duty on one shipment.
// A duty heading waiting on the user's answer makes it likely.

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
// Headings that charge a duty (not exemptions and other free headings)
const DUTY_HEADINGS = new Set(AllRules.tariffs.filter((t) => t.rate.kind !== "free").map((t) => t.code))

const round = (n: number) => Math.round(n * 100) / 100

const DAY = 86_400_000
const daysAfter = (date: string, from: string) => (Date.parse(date) - Date.parse(from)) / DAY

// The days to look for the change on: the update's effective date, then the days the engine starts
// or stops its headings from a week before it to a month after (a delay or a different reading
// moves the date: the Canada Section 338 duties were announced for August 19 and took effect
// August 22), nearest first. Not further back: guidance on an action already in force would take
// the action's own change as its own.
const changeDates = (effectiveOn: string, headings: Set<string>) => {
  const dates = new Set<string>()
  for (const t of AllRules.tariffs) {
    if (!headings.has(t.code)) continue
    for (const d of [t.effective.from, t.effective.to]) if (d && d !== effectiveOn && daysAfter(d, effectiveOn) >= -7 && daysAfter(d, effectiveOn) <= 31) dates.add(d)
  }
  const distance = (d: string) => Math.abs(daysAfter(d, effectiveOn))
  return [effectiveOn, ...Array.from(dates).sort((a, b) => distance(a) - distance(b)).slice(0, 3)]
}

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

const headingApplies = (p: TrackedProduct, headings: Set<string>) => p.result.lines.some((l) => headings.has(l.code) && l.status === "applies")

// A heading that charges a duty waits on an answer the user hasn't given (content, use, a claim)
const dutyOpen = (p: TrackedProduct, headings: Set<string>) => p.result.lines.some((l) => headings.has(l.code) && l.status === "needsAnswer" && DUTY_HEADINGS.has(l.code))

// One account's impacts from the given updates
export const impactsFor = (userId: string, items: CatalogItem[], products: TrackedProduct[], updates: ImpactUpdate[], htsElements: HtsElement[]): ImpactRow[] => {
  const rows: ImpactRow[] = []
  const byKey = new Map(products.map((p) => [p.key, p]))
  // The duty on an import on a given day, worked out again with its adjustments (once per day:
  // updates share dates)
  const worked = new Map<string, TrackedProduct>()
  const on = (p: TrackedProduct, date: string) => {
    const id = `${p.key}|${date}`
    if (!worked.has(id)) worked.set(id, trackProduct(p.entry, htsElements, date, p.adjustments))
    return worked.get(id)!
  }
  for (const u of updates) {
    if (u.kind === "hts_revision") continue
    const scope = scopeOf(u)
    const known = new Set(scope.headings.filter((h) => ENGINE_HEADINGS.has(h)))
    const decided = new Set<string>()
    // Confirmed: one of the update's headings starts or stops applying to the import, or changes
    // what it pays, on the day it took effect (an end or exemption confirms as well as a new duty)
    if (known.size && u.effective_on) {
      const dates = changeDates(u.effective_on, known)
      for (const p of products) {
        for (const date of dates) {
          const after = on(p, date)
          const prior = on(p, addDays(date, -1))
          const now = headingApplies(after, known)
          const then = headingApplies(prior, known)
          const delta = after.result.totalDuty - prior.result.totalDuty
          if (!(now || then) || (now === then && Math.abs(delta) < 0.01)) continue
          decided.add(p.key)
          rows.push({
            update_id: u.id,
            user_id: userId,
            product_key: p.key,
            level: "confirmed",
            before_pct: round(prior.totalPct),
            after_pct: round(after.totalPct),
            delta_usd: round(delta),
          })
          break
        }
        // Likely: the engine has the duty waiting on one of the user's answers
        if (!decided.has(p.key) && dutyOpen(on(p, u.effective_on), known)) {
          decided.add(p.key)
          rows.push({ update_id: u.id, user_id: userId, product_key: p.key, level: "likely", before_pct: null, after_pct: null, delta_usd: null })
        }
      }
    }
    // Likely and possible: what the update names
    for (const item of items) {
      const key = `${item.code}-${item.country}`
      if (decided.has(key) || !byKey.has(key)) continue
      const level = matchImport(scope, item)
      if (level) rows.push({ update_id: u.id, user_id: userId, product_key: key, level, before_pct: null, after_pct: null, delta_usd: null })
    }
  }
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
