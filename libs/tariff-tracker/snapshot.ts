import type { SupabaseClient } from "@supabase/supabase-js"
import type { HtsElement } from "../../interfaces/hts"
import { htsCodeDigitsOnly } from "../hts-code"
import { getUsImports } from "../us-imports-server"
import { readTrackerAccess } from "./access"
import { checksLeft, savingsUnlocked } from "./plan"
import { readAdjustments, type Adjustments } from "../../components/tariff-tracker/adjustments"
import { readCatalog, type CatalogItem } from "../../components/tariff-tracker/catalog"
import { catalogChanges, productHistory, type ProductHistory } from "../../components/tariff-tracker/insights/catalogHistory"
import { bestSavings, productSavings, type Saving } from "../../components/tariff-tracker/insights/savings"
import { opportunityKey } from "../../components/tariff-tracker/opportunities/review"
import { findCountry } from "../../components/tariff-tracker/parse"
import { historyRange } from "../../components/tariff-tracker/product/analysis/history"
import { trackProduct, type TrackedProduct } from "../../components/tariff-tracker/report"
import { originRates } from "../../components/tariff-tracker/product/analysis/analysis"

// An account's Tracker numbers, worked out on the server with the same code the Tracker runs in
// the browser (TrackerContext, InsightsContext): every import's duty on today's rates with its
// remembered adjustments, the rate changes that hit them in the last 12 months, and potential
// savings, unlocked (checked, or covered by a paid plan) and locked (the teaser), leaving out
// savings the user secured or ruled out. Savings stay potential in every email that quotes them.

type Db = SupabaseClient

const DAY = 86_400_000
const iso = (d: Date) => d.toISOString().slice(0, 10)

export interface TrackerSnapshot {
  user_id: string
  computed_at: string
  catalog_updated_at: string | null
  plan: string
  products: number
  countries: number
  values_default: number
  duty_per_shipment: number
  average_rate: number
  changes_12m: number
  products_hit_12m: number
  biggest_change: { code: string; country: string; description: string; fromPct: number; toPct: number; date: string } | null
  top_import: { key: string; code: string; country: string; description: string; ratePct: number; dutyUsd: number } | null
  savings_usd: number
  savings_products: number
  locked_savings_usd: number
  locked_savings_products: number
  top_saving: { key: string; code: string; country: string; description: string; usd: number; title: string; kind: string; locked: boolean } | null
  savings_checks_used: number
  savings_checks_left: number | null
  audit_checks_used: number
  audit_checks_left: number | null
}

const round = (n: number, places = 2) => Math.round(n * 10 ** places) / 10 ** places
const finite = (n: number) => (Number.isFinite(n) ? n : null)

const productFacts = (p: TrackedProduct) => ({
  key: p.key,
  code: p.entry.element.htsno,
  country: p.entry.country.name,
  description: p.description,
})

// The account's imports matched to today's HTS, worked out with their adjustments
export const trackedProducts = (items: CatalogItem[], adjustments: Record<string, Adjustments>, htsElements: HtsElement[], asOf = iso(new Date())) => {
  const byDigits = new Map<string, HtsElement>()
  for (const el of htsElements) {
    const digits = htsCodeDigitsOnly(el.htsno)
    if (digits.length === 8 || digits.length === 10) byDigits.set(digits, el)
  }
  const products: TrackedProduct[] = []
  items.forEach((item, index) => {
    const element = byDigits.get(item.code)
    const country = findCountry(item.country)
    if (!element || !country) return
    const entry = { line: index + 1, text: `${element.htsno},${country.code}`, element, country }
    products.push(trackProduct(entry, htsElements, asOf, adjustments[`${item.code}-${country.code}`]))
  })
  return products
}

// The imports a plan covers (TrackerContext's trackedKeys): until the user chooses, the
// highest-duty ones up to the limit; once they've tracked or untracked any, exactly their picks
export const coveredKeys = (items: CatalogItem[], products: TrackedProduct[], limit: number) => {
  const keyOf = (i: CatalogItem) => `${i.code}-${i.country}`
  if (items.some((i) => i.covered !== undefined)) return new Set(items.filter((i) => i.covered === true).map(keyOf).slice(0, limit))
  return new Set([...products].sort((a, b) => b.result.totalDuty - a.result.totalDuty).slice(0, limit).map((p) => p.key))
}

export const computeSnapshot = async (db: Db, userId: string, htsElements: HtsElement[]): Promise<TrackerSnapshot | null> => {
  const { data: catalog } = await db.from("tracker_catalogs").select("items, adjustments, updated_at").eq("user_id", userId).maybeSingle()
  // Stored the way the Tracker saves it (catalogSync.ts), read the way it reads it
  const items = catalog ? (readCatalog(JSON.stringify(catalog.items)) ?? []) : []
  const adjustments = catalog ? readAdjustments(JSON.stringify(catalog.adjustments)) : {}
  const [access, { data: opportunities }] = await Promise.all([
    readTrackerAccess(db, userId),
    db.from("tracker_opportunities").select("product_key, kind, option_ref, status").eq("user_id", userId),
  ])

  const products = trackedProducts(items, adjustments, htsElements)
  const now = new Date()
  const yearAgo = iso(new Date(now.getTime() - 365 * DAY))
  const today = iso(now)

  // Rate changes in the last 12 months
  const range = historyRange()
  const histories = new Map<string, ProductHistory>(products.map((p) => [p.key, productHistory(p, range)]))
  const changes = catalogChanges(products, histories).filter((c) => c.date >= yearAgo && c.date <= today)
  const biggest = [...changes].sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))[0]

  // Potential savings, unlocked and locked, without those secured or ruled out
  const unlocked = savingsUnlocked(access, coveredKeys(items, products, access.pairLimit))
  const closed = new Set(
    (opportunities ?? []).filter((o) => o.status === "secured" || o.status === "not_eligible").map((o) => opportunityKey(o.product_key, o.kind, o.option_ref))
  )
  let savingsUsd = 0
  let savingsProducts = 0
  let lockedUsd = 0
  let lockedProducts = 0
  let top: { p: TrackedProduct; s: Saving; locked: boolean } | null = null
  for (const p of products) {
    const all = productSavings(p, getUsImports(p.entry.element.htsno), originRates(p)).filter((s) => !closed.has(opportunityKey(p.key, s.kind, s.ref)))
    const best = bestSavings(all).any
    if (!best || best.usd <= 0) continue
    const locked = !unlocked.has(p.key)
    if (locked) {
      lockedUsd += best.usd
      lockedProducts++
    } else {
      savingsUsd += best.usd
      savingsProducts++
    }
    if (!top || best.usd > top.s.usd) top = { p, s: best, locked }
  }

  const duty = products.reduce((sum, p) => sum + p.result.totalDuty, 0)
  const value = products.reduce((sum, p) => sum + p.customsValue, 0)
  const highest = [...products].sort((a, b) => b.totalPct - a.totalPct)[0]
  const savingsLeft = checksLeft(access, "savings")
  const auditsLeft = checksLeft(access, "audit")

  return {
    user_id: userId,
    computed_at: now.toISOString(),
    catalog_updated_at: catalog?.updated_at ?? null,
    plan: access.kind,
    products: products.length,
    countries: new Set(products.map((p) => p.entry.country.code)).size,
    values_default: products.filter((p) => p.adjustments.customsValue === undefined).length,
    duty_per_shipment: round(duty),
    average_rate: value ? round((duty / value) * 100) : 0,
    changes_12m: changes.length,
    products_hit_12m: new Set(changes.map((c) => c.product.key)).size,
    biggest_change: biggest
      ? { ...productFacts(biggest.product), fromPct: round(biggest.before.pct), toPct: round(biggest.after.pct), date: biggest.date }
      : null,
    top_import: highest ? { ...productFacts(highest), ratePct: round(highest.totalPct), dutyUsd: round(highest.result.totalDuty) } : null,
    savings_usd: round(savingsUsd),
    savings_products: savingsProducts,
    locked_savings_usd: round(lockedUsd),
    locked_savings_products: lockedProducts,
    top_saving: top ? { ...productFacts(top.p), usd: round(top.s.usd), title: top.s.title, kind: top.s.kind, locked: top.locked } : null,
    savings_checks_used: access.usage.savingsChecked.length,
    savings_checks_left: finite(savingsLeft),
    audit_checks_used: access.usage.auditsChecked.length,
    audit_checks_left: finite(auditsLeft),
  }
}

// Works out and saves snapshots for every account with a catalog, the stalest first, until
// `deadline`. Keeps the date imports were first seen.
export const refreshSnapshots = async (db: Db, htsElements: HtsElement[], { deadline, onlyUserIds }: { deadline: number; onlyUserIds?: string[] }) => {
  let query = db.from("tracker_catalogs").select("user_id, updated_at")
  if (onlyUserIds) query = query.in("user_id", onlyUserIds)
  const { data: catalogs, error } = await query
  if (error) throw new Error(`Loading catalogs: ${error.message}`)
  const { data: existing } = await db.from("tracker_snapshots").select("user_id, computed_at, first_products_at, catalog_updated_at")
  const known = new Map((existing ?? []).map((s) => [s.user_id as string, s]))
  // A snapshot from today of an unchanged catalog doesn't need doing again
  const today = iso(new Date())
  const todo = (catalogs ?? [])
    .filter((c) => {
      const s = known.get(c.user_id)
      return !s || s.catalog_updated_at !== c.updated_at || s.computed_at.slice(0, 10) !== today
    })
    .sort((a, b) => (known.get(a.user_id)?.computed_at ?? "").localeCompare(known.get(b.user_id)?.computed_at ?? ""))
  let done = 0
  let failed = 0
  for (const c of todo) {
    if (Date.now() > deadline) break
    try {
      const snapshot = await computeSnapshot(db, c.user_id, htsElements)
      if (!snapshot) continue
      const before = known.get(c.user_id)
      const first_products_at = before?.first_products_at ?? (snapshot.products > 0 ? snapshot.computed_at : null)
      const { error: saveError } = await db.from("tracker_snapshots").upsert({ ...snapshot, first_products_at })
      if (saveError) throw new Error(saveError.message)
      done++
    } catch (e) {
      failed++
      console.error(`Tracker snapshot for ${c.user_id}:`, e instanceof Error ? e.message : e)
    }
  }
  return { done, failed, remaining: todo.length - done - failed }
}
