import type { SupabaseClient } from "@supabase/supabase-js"
import type { HtsElement } from "../../interfaces/hts"
import type { AlertedImport, ImpactAlertEmailProps } from "../../emails/tariff-updates/ImpactAlertEmail"
import { readAdjustments } from "../../components/tariff-tracker/adjustments"
import { readCatalog } from "../../components/tariff-tracker/catalog"
import { createBatch, type OutboxMessage } from "../email/outbox"
import { accountSubscriber, subscriberFooter } from "../email/subscribers"
import { reachedStages, UPDATE_EMAIL_COLUMNS, updateSummary, type UpdateRowForEmail } from "../email/tariff-news"
import { readTrackerAccess } from "../tariff-tracker/access"
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
  delta_usd: number | null
  covered: boolean
}

export interface PlannedAlert {
  userId: string
  email: string | null
  imports: AlertedImport[]
  removed: { key: string; code: string; country: string; description: string }[]
  beyond: string[]
  // Rows to record once sent
  record: { product_key: string; level: "confirmed" | "likely" | "removed"; before_pct: number | null; after_pct: number | null; delta_usd: number | null; covered: boolean }[]
  paid: boolean
}

const changed = (prior: AlertRow | undefined, now: ImpactRow) =>
  !prior ||
  prior.level === "removed" ||
  (prior.level === "likely" && now.level === "confirmed") ||
  (now.level === "confirmed" && Math.abs(Number(prior.delta_usd ?? 0) - Number(now.delta_usd ?? 0)) >= 1)

// What approving the update's impact check would send, account by account (nothing is saved)
export const planImpactAlerts = async (db: Db, updateId: string, htsElements: HtsElement[]): Promise<PlannedAlert[]> => {
  const [{ data: impacts }, { data: prior }] = await Promise.all([
    db.from("tariff_update_impacts").select("user_id, product_key, level, before_pct, after_pct, delta_usd").eq("update_id", updateId).in("level", ["confirmed", "likely"]),
    db.from("tariff_impact_alerts").select("user_id, product_key, level, delta_usd, covered").eq("update_id", updateId),
  ])
  const byUser = new Map<string, ImpactRow[]>()
  for (const r of (impacts ?? []) as ImpactRow[]) byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r])
  const priorByUser = new Map<string, Map<string, AlertRow>>()
  for (const r of (prior ?? []) as AlertRow[]) priorByUser.set(r.user_id, (priorByUser.get(r.user_id) ?? new Map()).set(r.product_key, r))
  const userIds = Array.from(new Set(Array.from(byUser.keys()).concat(Array.from(priorByUser.keys()))))
  if (!userIds.length) return []

  const [{ data: catalogs }, { data: users }] = await Promise.all([
    db.from("tracker_catalogs").select("user_id, items, adjustments").in("user_id", userIds),
    db.from("users").select("id, email").in("id", userIds),
  ])
  const emails = new Map((users ?? []).map((u) => [u.id as string, (u.email as string) ?? null]))
  const plans: PlannedAlert[] = []
  for (const userId of userIds) {
    const catalog = (catalogs ?? []).find((c) => c.user_id === userId)
    const items = catalog ? (readCatalog(JSON.stringify(catalog.items)) ?? []) : []
    const products = trackedProducts(items, catalog ? readAdjustments(JSON.stringify(catalog.adjustments)) : {}, htsElements)
    const byKey = new Map(products.map((p) => [p.key, p]))
    const access = await readTrackerAccess(db, userId)
    const covered = coveredKeys(items, products, access.pairLimit)
    const now = (byUser.get(userId) ?? []).filter((r) => byKey.has(r.product_key))
    const before = priorByUser.get(userId) ?? new Map<string, AlertRow>()
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
      paid: access.kind === "paid",
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

// Where an account's alerts go: its alert settings (email, Slack, Teams), else its account email
const channelsFor = async (db: Db, plan: PlannedAlert) => {
  const { data: settings } = await db.from("tracker_alert_settings").select("email_enabled, email, slack_webhook, teams_webhook").eq("user_id", plan.userId).maybeSingle()
  const email = settings?.email_enabled === false ? null : settings?.email || plan.email
  return { email, slack: settings?.slack_webhook ?? null, teams: settings?.teams_webhook ?? null }
}

// Approves the update's impact check: works its matches out again, then sends each affected account
// its alert (straight to the outbox, approved) and records what each was told
export const approveImpact = async (db: Db, updateId: string, htsElements: HtsElement[], { approvedBy }: { approvedBy: string }) => {
  await refreshImpacts(db, htsElements, { deadline: Date.now() + 120_000, updateIds: [updateId] })
  const { data: update, error } = await db.from("tariff_updates").select(UPDATE_EMAIL_COLUMNS).eq("id", updateId).single()
  if (error || !update) throw new Error(`Loading the update: ${error?.message ?? "not found"}`)
  const u = update as UpdateRowForEmail
  const plans = await planImpactAlerts(db, updateId, htsElements)
  const approvedAt = new Date().toISOString()
  if (!plans.length) {
    await db.from("tariff_updates").update({ impact_approved_at: approvedAt, impact_approved_by: approvedBy, impact_alerted: 0 }).eq("id", updateId)
    return { accounts: 0, messages: 0 }
  }

  const summary = updateSummary(u)
  const reached = await reachedStages(db, updateId)
  const messages: OutboxMessage[] = []
  for (const plan of plans) {
    // Only changes outside the alert slots that were already gone: recorded, nothing to say
    if (!plan.imports.length && !plan.beyond.length && !plan.removed.length) continue
    const channels = await channelsFor(db, plan)
    const subscriber = plan.email ? await accountSubscriber(db, { userId: plan.userId, email: plan.email }) : null
    const props: ImpactAlertEmailProps = {
      update: summary,
      reached,
      current: STAGE_ORDER.indexOf(u.stage),
      imports: plan.imports,
      removed: plan.removed,
      beyond: plan.beyond.length,
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
    title: `Impact alert: ${u.title} · ${plans.length} account${plans.length === 1 ? "" : "s"}`,
    ref: { update_id: updateId, approved_at: approvedAt },
    dedupeKey: `tariff_impact:${updateId}:${approvedAt}`,
    autoSend: true,
    messages,
  })
  const rows = plans.flatMap((p) => p.record.map((r) => ({ ...r, update_id: updateId, user_id: p.userId, batch_id: batchId, sent_at: approvedAt })))
  for (let i = 0; i < rows.length; i += 500) {
    const { error: saveError } = await db.from("tariff_impact_alerts").upsert(rows.slice(i, i + 500), { onConflict: "update_id,user_id,product_key" })
    if (saveError) throw new Error(`Recording alerts: ${saveError.message}`)
  }
  await db.from("tariff_updates").update({ impact_approved_at: approvedAt, impact_approved_by: approvedBy, impact_alerted: plans.length }).eq("id", updateId)
  return { accounts: plans.length, messages: messages.length, batchId }
}
