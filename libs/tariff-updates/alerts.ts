import type { SupabaseClient } from "@supabase/supabase-js"
import type { HtsElement } from "../../interfaces/hts"
import type { AlertedImport, ImpactAlertEmailProps } from "../../emails/tariff-updates/ImpactAlertEmail"
import { readAdjustments } from "../../components/tariff-tracker/adjustments"
import { alertKinds, alertsOn, type AlertSettingsRow } from "../../components/tariff-tracker/alerts/alertPrefs"
import { readCatalog, realItems } from "../../components/tariff-tracker/catalog"
import { NEWS_ALERTS_FROM } from "../email/news-producer"
import { createBatch, type OutboxMessage } from "../email/outbox"
import { accountSubscriber, subscriberFooter } from "../email/subscribers"
import { reachedStages, UPDATE_EMAIL_COLUMNS, updateSummary, type UpdateRowForEmail } from "../email/tariff-news"
import { readTrackerAccess } from "../tariff-tracker/access"
import { hasFullAccess } from "../tariff-tracker/plan"
import { coveredKeys, trackedProducts } from "../tariff-tracker/snapshot"
import { refreshImpacts } from "./impacts"
import { STAGE_ORDER } from "./types"

// Impact alerts. The admin checks an update's impact in review (what it covers, against the
// official sources) and approves it; then this works out who's affected and sends each account
// one alert about its own imports, by email and to its Slack and Teams, without further review.
//
// Who: every account with a confirmed or likely match (tariff_update_impacts, worked out again
// first). What: the imports inside the plan's alert slots in full (the user's picks, then the
// highest-duty ones: TrackerContext's coverage), the rest as a count (the upgrade). Each import is
// alerted once per level: approving again later sends only what's new, what moved from likely to
// confirmed or changed amount, and which imports it no longer affects (tariff_impact_alerts).
//
// Not who: accounts that turned alerts off or don't want this kind of update (alertPrefs.ts), and
// imports added after the update was first approved (the Tracker shows them the update instead).
// Only updates with official activity from launch on (NEWS_ALERTS_FROM) can be approved.

type Db = SupabaseClient

interface ImpactRow {
  user_id: string
  product_key: string
  level: "confirmed" | "likely" | "possible"
  before_pct: number | null
  after_pct: number | null
  delta_usd: number | null
}

interface AlertRow {
  user_id: string
  product_key: string
  level: "confirmed" | "likely" | "removed"
  before_pct: number | null
  after_pct: number | null
  covered: boolean
}

export interface PlannedAlert {
  userId: string
  email: string | null
  imports: AlertedImport[]
  removed: { key: string; code: string; country: string; description: string }[]
  beyond: string[]
  // How many imports the plan alerts on
  limit: number
  // Rows to record once sent
  channels: { email: string | null; slack: string | null; teams: string | null }
  record: { product_key: string; level: "confirmed" | "likely" | "removed"; before_pct: number | null; after_pct: number | null; delta_usd: number | null; covered: boolean }[]
  paid: boolean
}

// Updates from before alerts started are history: shown on the site, never alerted
export const impactAlertable = (u: { last_activity_at: string; status?: string; kind?: string }) =>
  u.last_activity_at >= NEWS_ALERTS_FROM.slice(0, 10) && u.status !== "hidden" && u.kind !== "hts_revision"

// Every row a query returns, a page at a time (a query returns at most 1,000 rows)
const allRows = async <T>(page: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>) => {
  const rows: T[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await page(from, from + 999)
    if (error) throw new Error(`Loading impacts: ${error.message}`)
    rows.push(...((data ?? []) as T[]))
    if ((data ?? []).length < 1000) return rows
  }
}

// Worth telling again: new, back after being removed, now confirmed, or a different rate. Not a
// different dollar amount alone: that's the user changing their import's value, not the tariff.
const moved = (a: number | null, b: number | null) => Math.abs(Number(a ?? 0) - Number(b ?? 0)) >= 0.01
const changed = (prior: AlertRow | undefined, now: ImpactRow) =>
  !prior ||
  prior.level === "removed" ||
  (prior.level === "likely" && now.level === "confirmed") ||
  (prior.level === "confirmed" && now.level === "confirmed" && (moved(prior.before_pct, now.before_pct) || moved(prior.after_pct, now.after_pct)))

// What approving the update's impact check would send, account by account (nothing is saved)
export const planImpactAlerts = async (db: Db, updateId: string, htsElements: HtsElement[]): Promise<PlannedAlert[]> => {
  const { data: update, error: updateError } = await db.from("tariff_updates").select("kind, impact_first_approved_at").eq("id", updateId).single()
  if (updateError || !update) throw new Error(`Loading the update: ${updateError?.message ?? "not found"}`)
  const firstApproved: string | null = update.impact_first_approved_at
  const [impacts, prior] = await Promise.all([
    allRows<ImpactRow>((from, to) =>
      db.from("tariff_update_impacts").select("user_id, product_key, level, before_pct, after_pct, delta_usd").eq("update_id", updateId).in("level", ["confirmed", "likely"]).order("user_id").order("product_key").range(from, to)
    ),
    allRows<AlertRow>((from, to) =>
      db.from("tariff_impact_alerts").select("user_id, product_key, level, before_pct, after_pct, covered").eq("update_id", updateId).order("user_id").order("product_key").range(from, to)
    ),
  ])
  const byUser = new Map<string, ImpactRow[]>()
  for (const r of impacts) byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r])
  const priorByUser = new Map<string, Map<string, AlertRow>>()
  for (const r of prior) priorByUser.set(r.user_id, (priorByUser.get(r.user_id) ?? new Map()).set(r.product_key, r))
  const userIds = Array.from(new Set(Array.from(byUser.keys()).concat(Array.from(priorByUser.keys()))))
  if (!userIds.length) return []

  // A hundred accounts at a time: the ids go in the request's URL
  const catalogs: { user_id: string; items: unknown; adjustments: unknown }[] = []
  const users: { id: string; email: string | null }[] = []
  const settings: (AlertSettingsRow & { user_id: string })[] = []
  for (let i = 0; i < userIds.length; i += 100) {
    const ids = userIds.slice(i, i + 100)
    const [{ data: c, error: catalogError }, { data: u, error: userError }, { data: a, error: settingsError }] = await Promise.all([
      db.from("tracker_catalogs").select("user_id, items, adjustments").in("user_id", ids),
      db.from("users").select("id, email").in("id", ids),
      db.from("tracker_alert_settings").select("user_id, email_enabled, email, slack_webhook, teams_webhook, alert_kinds").in("user_id", ids),
    ])
    if (catalogError || userError || settingsError) throw new Error(`Loading accounts: ${(catalogError ?? userError ?? settingsError)!.message}`)
    catalogs.push(...(c ?? []))
    users.push(...(u ?? []))
    settings.push(...((a ?? []) as (AlertSettingsRow & { user_id: string })[]))
  }
  const emails = new Map(users.map((u) => [u.id, u.email ?? null]))
  const plans: PlannedAlert[] = []
  for (const userId of userIds) {
    // Alerts off, or not this kind of update: nothing sent, nothing recorded
    const prefs = settings.find((s) => s.user_id === userId)
    if (!alertsOn(prefs) || !alertKinds(prefs).includes(update.kind)) continue
    const catalog = catalogs.find((c) => c.user_id === userId)
    // The example list isn't theirs: never alerted
    const items = catalog ? realItems(readCatalog(JSON.stringify(catalog.items)) ?? []) : []
    const products = trackedProducts(items, catalog ? readAdjustments(JSON.stringify(catalog.adjustments)) : {}, htsElements)
    const byKey = new Map(products.map((p) => [p.key, p]))
    const access = await readTrackerAccess(db, userId)
    const covered = coveredKeys(items, products, access.pairLimit)
    const before = priorByUser.get(userId) ?? new Map<string, AlertRow>()
    // Imports added after the update was first approved aren't alerted about it
    const addedAt = new Map(items.map((i) => [`${i.code}-${i.country}`, i.addedAt]))
    const late = (key: string) => !!firstApproved && !before.has(key) && (addedAt.get(key) ?? "") > firstApproved
    const now = (byUser.get(userId) ?? []).filter((r) => byKey.has(r.product_key) && !late(r.product_key))
    const facts = (key: string) => {
      const p = byKey.get(key)
      return { code: p?.entry.element.htsno ?? key.split("-")[0], country: p?.entry.country.name ?? key.split("-")[1], description: p?.description ?? "" }
    }

    const fresh = now.filter((r) => changed(before.get(r.product_key), r))
    const nowKeys = new Set(now.map((r) => r.product_key))
    const removed = Array.from(before.values()).filter((r) => r.level !== "removed" && !nowKeys.has(r.product_key))
    if (!fresh.length && !removed.length) continue

    const inSlots = fresh.filter((r) => covered.has(r.product_key))
    const outside = fresh.filter((r) => !covered.has(r.product_key))
    plans.push({
      userId,
      email: emails.get(userId) ?? null,
      // Where it goes: the account's alert settings, else its account email
      channels: {
        email: prefs?.email_enabled === false ? null : prefs?.email || emails.get(userId) || null,
        slack: prefs?.slack_webhook ?? null,
        teams: prefs?.teams_webhook ?? null,
      },
      // On a plan or the 14-day trial: the note on imports past it talks about its size, not the free limit
      paid: hasFullAccess(access),
      imports: inSlots
        .sort((a, b) => Number(b.delta_usd ?? -1) - Number(a.delta_usd ?? -1))
        .map((r) => ({
          key: r.product_key,
          ...facts(r.product_key),
          level: r.level as "confirmed" | "likely",
          beforePct: r.before_pct,
          afterPct: r.after_pct,
          deltaUsd: r.delta_usd,
          nowConfirmed: before.get(r.product_key)?.level === "likely" && r.level === "confirmed",
        })),
      // Told about it before and still imported: say it no longer applies
      removed: removed.filter((r) => r.covered && byKey.has(r.product_key)).map((r) => ({ key: r.product_key, ...facts(r.product_key) })),
      beyond: outside.map((r) => r.product_key),
      limit: access.pairLimit,
      record: [
        ...fresh.map((r) => ({
          product_key: r.product_key,
          level: r.level as "confirmed" | "likely",
          before_pct: r.before_pct,
          after_pct: r.after_pct,
          delta_usd: r.delta_usd,
          covered: covered.has(r.product_key),
        })),
        ...removed.map((r) => ({ product_key: r.product_key, level: "removed" as const, before_pct: null as number | null, after_pct: null as number | null, delta_usd: null as number | null, covered: r.covered })),
      ],
    })
  }
  return plans
}

// Sends each plan's alert (straight to the outbox, approved) and records what each account was told
const sendPlans = async (db: Db, u: UpdateRowForEmail, plans: PlannedAlert[], { title, at }: { title: string; at: string }) => {
  const summary = updateSummary(u)
  const reached = await reachedStages(db, u.id)
  const messages: OutboxMessage[] = []
  for (const plan of plans) {
    // Only changes outside the alert slots that were already gone: recorded, nothing to say
    if (!plan.imports.length && !plan.beyond.length && !plan.removed.length) continue
    const { channels } = plan
    const subscriber = plan.email ? await accountSubscriber(db, { userId: plan.userId, email: plan.email }) : null
    const props: ImpactAlertEmailProps = {
      update: summary,
      reached,
      current: STAGE_ORDER.indexOf(u.stage),
      imports: plan.imports,
      removed: plan.removed,
      beyond: plan.beyond.length,
      limit: plan.limit,
      paid: plan.paid,
      footer: subscriber
        ? subscriberFooter(subscriber, "You're getting this because alerts are on for your imports in the HTS Hero Tariff Tracker.")
        : { reason: "You're getting this because alerts are on for your imports in the HTS Hero Tariff Tracker." },
    }
    const base = { userId: plan.userId, subscriberId: subscriber?.id ?? null, template: "impact_alert", props: props as unknown as Record<string, unknown> }
    // A global unsubscribe stops the email; Slack and Teams were set up on purpose and still go
    if (channels.email && !subscriber?.unsubscribed_at) messages.push({ ...base, channel: "email", recipient: channels.email })
    if (channels.slack) messages.push({ ...base, channel: "slack", recipient: channels.slack })
    if (channels.teams) messages.push({ ...base, channel: "teams", recipient: channels.teams })
  }

  const batchId = await createBatch(db, {
    kind: "tariff_impact",
    title: `${title}: ${u.title} · ${plans.length} account${plans.length === 1 ? "" : "s"}`,
    ref: { update_id: u.id, approved_at: at },
    dedupeKey: `tariff_impact:${u.id}:${at}`,
    autoSend: true,
    messages,
  })
  const rows = plans.flatMap((p) => p.record.map((r) => ({ ...r, update_id: u.id, user_id: p.userId, batch_id: batchId, sent_at: at })))
  for (let i = 0; i < rows.length; i += 500) {
    const { error: saveError } = await db.from("tariff_impact_alerts").upsert(rows.slice(i, i + 500), { onConflict: "update_id,user_id,product_key" })
    if (saveError) throw new Error(`Recording alerts: ${saveError.message}`)
  }
  return { messages: messages.length, batchId }
}

const loadUpdate = async (db: Db, updateId: string) => {
  const { data, error } = await db.from("tariff_updates").select(`${UPDATE_EMAIL_COLUMNS}, last_activity_at, status, impact_first_approved_at`).eq("id", updateId).single()
  if (error || !data) throw new Error(`Loading the update: ${error?.message ?? "not found"}`)
  return data as unknown as UpdateRowForEmail & { last_activity_at: string; status: string; impact_first_approved_at: string | null }
}

// Approves the update's impact check: works its matches out again, then sends each affected account
// its alert and records what each was told
export const approveImpact = async (db: Db, updateId: string, htsElements: HtsElement[], { approvedBy }: { approvedBy: string }) => {
  await refreshImpacts(db, htsElements, { deadline: Date.now() + 120_000, updateIds: [updateId] })
  const u = await loadUpdate(db, updateId)
  if (!impactAlertable(u)) throw new Error("This update can't send impact alerts: it's from before alerts started, hidden, or an HTS revision.")
  const plans = await planImpactAlerts(db, updateId, htsElements)
  const approvedAt = new Date().toISOString()
  const approval = { impact_approved_at: approvedAt, impact_approved_by: approvedBy, impact_first_approved_at: u.impact_first_approved_at ?? approvedAt }
  const sent = plans.length ? await sendPlans(db, u, plans, { title: "Impact alert", at: approvedAt }) : { messages: 0, batchId: undefined }
  await db.from("tariff_updates").update({ ...approval, impact_alerted: plans.length }).eq("id", updateId)
  return { accounts: plans.length, ...sent }
}

// Once an update's impact check is approved, the engine catching up (an HTS revision carrying the
// action out) confirms imports that were alerted as "may apply". Those confirmations go out by
// themselves, and only those: anything else new waits for the admin to approve again.
export const sendConfirmations = async (db: Db, htsElements: HtsElement[], { deadline }: { deadline: number }) => {
  const likely = await allRows<{ update_id: string; user_id: string; product_key: string }>((from, to) =>
    db.from("tariff_impact_alerts").select("update_id, user_id, product_key").eq("level", "likely").order("update_id").order("user_id").order("product_key").range(from, to)
  )
  const updateIds = Array.from(new Set(likely.map((r) => r.update_id)))
  if (!updateIds.length) return { updates: 0, accounts: 0 }
  const confirmed = await allRows<{ update_id: string; user_id: string; product_key: string }>((from, to) =>
    db.from("tariff_update_impacts").select("update_id, user_id, product_key").in("update_id", updateIds).eq("level", "confirmed").order("update_id").order("user_id").order("product_key").range(from, to)
  )
  const isConfirmed = new Set(confirmed.map((r) => `${r.update_id}|${r.user_id}|${r.product_key}`))
  const wasLikely = new Set(likely.map((r) => `${r.update_id}|${r.user_id}|${r.product_key}`))
  const ready = Array.from(new Set(likely.filter((r) => isConfirmed.has(`${r.update_id}|${r.user_id}|${r.product_key}`)).map((r) => r.update_id)))

  let updates = 0
  let accounts = 0
  for (const updateId of ready) {
    if (Date.now() > deadline) break
    const u = await loadUpdate(db, updateId)
    if (!u.impact_first_approved_at || !impactAlertable(u)) continue
    const plans = (await planImpactAlerts(db, updateId, htsElements)).flatMap((p) => {
      // Alerted as likely, confirmed now: sent when in the alert slots, recorded either way (so
      // approving again doesn't repeat them)
      const record = p.record.filter((r) => r.level === "confirmed" && wasLikely.has(`${updateId}|${p.userId}|${r.product_key}`))
      if (!record.length) return []
      const keys = new Set(record.map((r) => r.product_key))
      const plan: PlannedAlert = { ...p, imports: p.imports.filter((i) => keys.has(i.key)), removed: [], beyond: [], record }
      return [plan]
    })
    if (!plans.length) continue
    await sendPlans(db, u, plans, { title: "Now confirmed", at: new Date().toISOString() })
    updates++
    accounts += plans.filter((p) => p.imports.length).length
  }
  return { updates, accounts }
}
