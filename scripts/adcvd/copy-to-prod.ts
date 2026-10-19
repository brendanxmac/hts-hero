// Copies what the tariff sources, tariff updates and AD/CVD pipelines built in dev to production,
// so nothing is processed (or paid for) twice. Reference data only: no user's data is read or
// written (tariff_update_impacts, alerts, catalogs and accounts stay where they are).
//
//   npm run adcvd:copy-to-prod                # dry run: what would be copied, table by table
//   npm run adcvd:copy-to-prod -- --apply     # copy it
//
// Rows are matched on their natural keys (an item's source + external id, an update's slug, a
// case's number, an event's document + case), so rows prod already collected on its own are
// updated, not duplicated, and ids are remapped wherever one table points at another.
//
// Needs, in .env.local: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (dev, the source) and
// PROD_SUPABASE_URL + PROD_SUPABASE_SERVICE_ROLE_KEY (the destination). Apply every migration
// to prod first (PRE_DEPLOY.md lists them, in order).

import { existsSync } from "fs"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const fail = (message: string): never => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

const args = process.argv.slice(2)
const apply = args.includes("--apply")
const PAGE = 1000
const CHUNK = 300

type Row = Record<string, unknown>

const readAll = async (db: SupabaseClient, table: string, columns = "*") => {
  const rows: Row[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db.from(table).select(columns).range(from, from + PAGE - 1)
    if (error) throw new Error(`Reading ${table}: ${error.message}`)
    rows.push(...((data ?? []) as unknown as Row[]))
    if ((data ?? []).length < PAGE) return rows
  }
}

const chunks = <T,>(list: T[]) => Array.from({ length: Math.ceil(list.length / CHUNK) }, (_, i) => list.slice(i * CHUNK, (i + 1) * CHUNK))

const without = (row: Row, ...keys: string[]) => Object.fromEntries(Object.entries(row).filter(([k]) => !keys.includes(k)))

const report = (table: string, total: number, existing: number) =>
  console.log(`  ${table.padEnd(22)} ${String(total).padStart(6)} rows: ${String(total - existing).padStart(6)} new, ${String(existing).padStart(6)} already in prod (updated)`)

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const devUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const devKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const prodUrl = process.env.PROD_SUPABASE_URL
  const prodKey = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY
  if (!devUrl || !devKey) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (dev) must be set in .env.local.")
  if (!prodUrl || !prodKey) fail("PROD_SUPABASE_URL and PROD_SUPABASE_SERVICE_ROLE_KEY must be set in .env.local (production's project URL and service role key).")
  if (new URL(devUrl!).host === new URL(prodUrl!).host) fail("PROD_SUPABASE_URL is the same project as NEXT_PUBLIC_SUPABASE_URL. Nothing to copy.")
  const dev = createClient(devUrl!, devKey!)
  const prod = createClient(prodUrl!, prodKey!)

  for (const table of ["tariff_source_items", "tariff_updates", "adcvd_cases", "adcvd_events", "adcvd_months", "adcvd_settings", "ai_usage"]) {
    const { error } = await prod.from(table).select("*", { head: true, count: "exact" }).limit(1)
    if (error) fail(`Production has no ${table} table yet (${error.message}). Apply the migrations to prod first (PRE_DEPLOY.md).`)
  }

  console.log(`\nFrom ${new URL(devUrl!).host} (dev) to ${new URL(prodUrl!).host} (prod)${apply ? "" : " — dry run, nothing written"}\n`)

  // ---- Read everything first
  const [items, updates, cases, events, months, settings, usage] = await Promise.all([
    readAll(dev, "tariff_source_items"),
    readAll(dev, "tariff_updates"),
    readAll(dev, "adcvd_cases"),
    readAll(dev, "adcvd_events"),
    readAll(dev, "adcvd_months"),
    readAll(dev, "adcvd_settings"),
    readAll(dev, "ai_usage"),
  ])
  const [prodItems, prodUpdates, prodCases, prodEvents, prodMonths, prodUsage] = await Promise.all([
    readAll(prod, "tariff_source_items", "id, source, external_id"),
    readAll(prod, "tariff_updates", "id, slug"),
    readAll(prod, "adcvd_cases", "case_number"),
    readAll(prod, "adcvd_events", "document_number, case_number"),
    readAll(prod, "adcvd_months", "month"),
    readAll(prod, "ai_usage", "id"),
  ])
  const itemKey = (r: Row) => `${r.source}|${r.external_id}`
  const eventKey = (r: Row) => `${r.document_number}|${r.case_number ?? ""}`
  const prodItemKeys = new Set(prodItems.map(itemKey))
  const prodSlugs = new Set(prodUpdates.map((u) => u.slug))
  const prodCaseNumbers = new Set(prodCases.map((c) => c.case_number))
  const prodEventKeys = new Set(prodEvents.map(eventKey))
  const prodMonthKeys = new Set(prodMonths.map((m) => m.month))
  const prodUsageIds = new Set(prodUsage.map((u) => u.id))

  report("tariff_updates", updates.length, updates.filter((u) => prodSlugs.has(u.slug)).length)
  report("tariff_source_items", items.length, items.filter((i) => prodItemKeys.has(itemKey(i))).length)
  report("adcvd_cases", cases.length, cases.filter((c) => prodCaseNumbers.has(c.case_number)).length)
  report("adcvd_events", events.length, events.filter((e) => prodEventKeys.has(eventKey(e))).length)
  report("adcvd_months", months.length, months.filter((m) => prodMonthKeys.has(m.month)).length)
  report("adcvd_settings", settings.length, settings.length)
  report("ai_usage", usage.length, usage.filter((u) => prodUsageIds.has(u.id)).length)
  if (!apply) {
    console.log("\nRun again with --apply to copy.\n")
    return
  }

  // ---- 1. Updates, by slug (their lead item is set once the items are in)
  const updateIds = new Map<string, string>()
  for (const part of chunks(updates)) {
    const { data, error } = await prod
      .from("tariff_updates")
      .upsert(part.map((u) => without(u, "id", "lead_item_id")), { onConflict: "slug" })
      .select("id, slug")
    if (error) throw new Error(`Copying tariff_updates: ${error.message}`)
    const bySlug = new Map((data ?? []).map((r) => [r.slug, r.id]))
    for (const u of part) updateIds.set(String(u.id), bySlug.get(u.slug as string)!)
  }
  console.log(`✓ tariff_updates`)

  // ---- 2. Source items, by source + external id, pointing at prod's updates
  const itemIds = new Map<string, string>()
  for (const part of chunks(items)) {
    const rows = part.map((i) => ({ ...without(i, "id"), update_id: i.update_id ? updateIds.get(String(i.update_id)) ?? null : null }))
    const { data, error } = await prod.from("tariff_source_items").upsert(rows, { onConflict: "source,external_id" }).select("id, source, external_id")
    if (error) throw new Error(`Copying tariff_source_items: ${error.message}`)
    const byKey = new Map((data ?? []).map((r) => [itemKey(r), r.id]))
    for (const i of part) itemIds.set(String(i.id), byKey.get(itemKey(i))!)
  }
  console.log(`✓ tariff_source_items`)

  // Each update's lead item, now that the items have prod ids
  for (const u of updates.filter((u) => u.lead_item_id)) {
    const lead = itemIds.get(String(u.lead_item_id))
    if (lead) await prod.from("tariff_updates").update({ lead_item_id: lead }).eq("id", updateIds.get(String(u.id))!)
  }

  // ---- 3. Cases, by case number
  for (const part of chunks(cases)) {
    const { error } = await prod.from("adcvd_cases").upsert(part, { onConflict: "case_number" })
    if (error) throw new Error(`Copying adcvd_cases: ${error.message}`)
  }
  console.log(`✓ adcvd_cases`)

  // ---- 4. Events: a document's rows in prod are replaced by dev's
  const docs = Array.from(new Set(events.map((e) => String(e.document_number))))
  for (const part of chunks(docs)) {
    const { error } = await prod.from("adcvd_events").delete().in("document_number", part)
    if (error) throw new Error(`Replacing adcvd_events: ${error.message}`)
  }
  for (const part of chunks(events)) {
    const rows = part.map((e) => ({
      ...without(e, "id"),
      item_id: e.item_id ? itemIds.get(String(e.item_id)) ?? null : null,
      update_id: e.update_id ? updateIds.get(String(e.update_id)) ?? null : null,
    }))
    const { error } = await prod.from("adcvd_events").insert(rows)
    if (error) throw new Error(`Copying adcvd_events: ${error.message}`)
  }
  console.log(`✓ adcvd_events`)

  // ---- 5. Months, settings and AI usage (usage keeps its ids: they're unique across projects)
  if (months.length) {
    const { error } = await prod.from("adcvd_months").upsert(months, { onConflict: "month" })
    if (error) throw new Error(`Copying adcvd_months: ${error.message}`)
  }
  if (settings.length) {
    const { error } = await prod.from("adcvd_settings").upsert(settings, { onConflict: "id" })
    if (error) throw new Error(`Copying adcvd_settings: ${error.message}`)
  }
  for (const part of chunks(usage.filter((u) => !prodUsageIds.has(u.id)))) {
    const { error } = await prod.from("ai_usage").insert(part)
    if (error) throw new Error(`Copying ai_usage: ${error.message}`)
  }
  console.log(`✓ adcvd_months, adcvd_settings, ai_usage`)

  // ---- Check: every row arrived
  const counts = await Promise.all(
    ["tariff_updates", "tariff_source_items", "adcvd_cases", "adcvd_events"].map(async (t) => {
      const { count } = await prod.from(t).select("*", { head: true, count: "exact" })
      return [t, count ?? 0] as const
    })
  )
  const expected: Record<string, number> = {
    tariff_updates: new Set([...prodUpdates.map((u) => u.slug), ...updates.map((u) => u.slug)]).size,
    tariff_source_items: new Set([...prodItems.map(itemKey), ...items.map(itemKey)]).size,
    adcvd_cases: new Set([...prodCases.map((c) => c.case_number), ...cases.map((c) => c.case_number)]).size,
    adcvd_events: events.length,
  }
  console.log("")
  for (const [table, count] of counts) {
    const ok = count >= expected[table]
    console.log(`${ok ? "✓" : "✗"} ${table.padEnd(22)} prod has ${count}, expected at least ${expected[table]}`)
  }
  console.log("\nDone. Revalidate /tariff-updates on prod (or wait 15 minutes) to see the copied updates.\n")
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
