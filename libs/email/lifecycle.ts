import type { SupabaseClient } from "@supabase/supabase-js"
import { readCatalog } from "../../components/tariff-tracker/catalog"
import { createBatch, type OutboxMessage } from "./outbox"
import { appUrl, ensureAccountSubscriber, SUBSCRIBER_COLUMNS, subscriberFooter, type Subscriber } from "./subscribers"
import { UPDATE_EMAIL_COLUMNS, updateSummary, type UpdateRowForEmail } from "./tariff-news"

// Onboarding (lifecycle) emails. Once a day the job works out, per account, the one email its
// stage calls for and queues them all as one outbox batch, sent without review. Each email goes to an
// account at most once (lifecycle_emails), at most one every two days, and never to an account
// that turned these emails off or unsubscribed.
//
// The sequence drives each account to the next activation step, in order: add imports (alerts are
// on from then, alertPrefs.ts), check savings, audit an entry. Every CTA lands on that step in the
// Tracker. For the Tracker MVP (libs/tariff-tracker/features.ts) savings and audits are off: no step
// here targets them, and the emails' copy sells tracking, alerts and impact checks instead.
//
// No imports yet (accounts from ONBOARDING_FROM on), each stopping once an import is added:
//   no_imports_1  day 1   paste your codes: what you get back in a minute, and this week's actions
//   no_imports_2  day 4   this month's actions, and what an alert on your imports looks like
//   no_imports_3  day 10  a note from Brendan: need a hand? want it managed for you?
// Imports added (first seen by the snapshot job from ONBOARDING_FROM on):
//   first_look    the morning after, once   well done: the best rate, alerts on new tariffs and
//                                           easy audits, then HTS Hero Managed (tracker_findings)
// Accounts from before ONBOARDING_FROM get the one-time meet_tracker email instead (queued by
// `npm run email:meet-tracker`), with a one-click opt-in to the weekly digest.

type Db = SupabaseClient

// Accounts created from here on get the "no imports yet" emails
export const ONBOARDING_FROM = "2026-10-16T00:00:00Z"

const DAY = 86_400_000
// The steps, latest first: an account gets the latest step it has reached, if not sent yet
const NO_IMPORTS_STEPS = [
  { key: "no_imports_3", day: 10 },
  { key: "no_imports_2", day: 4 },
  { key: "no_imports_1", day: 1 },
] as const
// Past this, an account that never added an import gets no more onboarding email
const NO_IMPORTS_UNTIL_DAY = 14
const MIN_DAYS_BETWEEN = 2

const ACCOUNT_REASON = "You're getting this because you have an HTS Hero account."

interface Account {
  id: string
  email: string
  created_at: string
}

// The latest published tariff actions (not HTS revisions), and how many there were in 30 days
export const recentActions = async (db: Db, limit: number) => {
  const since = new Date(Date.now() - 30 * DAY).toISOString()
  const [{ data }, { count }] = await Promise.all([
    db.from("tariff_updates").select(UPDATE_EMAIL_COLUMNS).eq("status", "published").neq("kind", "hts_revision").order("last_activity_at", { ascending: false }).limit(limit),
    db.from("tariff_updates").select("id", { count: "exact", head: true }).eq("status", "published").neq("kind", "hts_revision").gte("first_seen_at", since),
  ])
  return { recent: ((data ?? []) as UpdateRowForEmail[]).map(updateSummary), thisMonth: count ?? 0 }
}

const subscribersFor = async (db: Db, accounts: Account[]) => {
  const rows = new Map<string, Subscriber>()
  if (!accounts.length) return rows
  const { data } = await db.from("email_subscribers").select(SUBSCRIBER_COLUMNS).in("user_id", accounts.map((a) => a.id))
  for (const s of (data ?? []) as Subscriber[]) rows.set(s.user_id!, s)
  // Accounts without a row yet (before subscriptions existed) get one: lifecycle on, no news
  for (const a of accounts.filter((a) => !rows.has(a.id) && a.email)) {
    await ensureAccountSubscriber(db, { userId: a.id, email: a.email, newsFrequency: "off" })
  }
  const missing = accounts.filter((a) => !rows.has(a.id)).map((a) => a.id)
  if (missing.length) {
    const { data: created } = await db.from("email_subscribers").select(SUBSCRIBER_COLUMNS).in("user_id", missing)
    for (const s of (created ?? []) as Subscriber[]) rows.set(s.user_id!, s)
  }
  return rows
}

const reachable = (s: Subscriber | undefined): s is Subscriber => !!s && s.lifecycle && !s.unsubscribed_at

// Only for tests: limit to these accounts and ignore the start date
export interface TestScope {
  onlyUserIds?: string[]
}

// What the snapshot job worked out for an account (tracker_snapshots), as the emails read it
interface SnapshotRow {
  user_id: string
  computed_at: string
  first_products_at: string | null
  products: number
}

// The one email an account's stage calls for today, if any (latest-stage-first, at most once each)
export const pickEmail = (
  {
    account,
    snapshot,
    imports,
    sent,
    now,
    scoped,
  }: { account: Account; snapshot?: SnapshotRow; imports: number; sent: Set<string>; now: Date; scoped: boolean }
): { key: string; step?: (typeof NO_IMPORTS_STEPS)[number] } | null => {
  const fresh = snapshot && now.getTime() - new Date(snapshot.computed_at).getTime() < 2 * DAY
  if (snapshot && fresh && snapshot.products > 0) {
    // Imports added from onboarding's start on: the morning after, once
    const first = snapshot.first_products_at ? new Date(snapshot.first_products_at).getTime() : null
    if (first && (scoped || first >= new Date(ONBOARDING_FROM).getTime())) {
      const days = (now.getTime() - first) / DAY
      const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      if (!sent.has("first_look") && first < startOfToday && days <= 7) return { key: "first_look" }
    }
    return null
  }
  // No imports yet: accounts from onboarding's start on, the latest step reached
  if (imports > 0) return null
  if (!scoped && new Date(account.created_at).getTime() < new Date(ONBOARDING_FROM).getTime()) return null
  const days = Math.floor((now.getTime() - new Date(account.created_at).getTime()) / DAY)
  if (days > NO_IMPORTS_UNTIL_DAY) return null
  const step = NO_IMPORTS_STEPS.find((s) => days >= s.day)
  return step && !sent.has(step.key) ? { key: step.key, step } : null
}

// The day's onboarding batch. Returns how many emails were queued.
export const queueDailyOnboarding = async (db: Db, now = new Date(), { onlyUserIds }: TestScope = {}) => {
  const today = now.toISOString().slice(0, 10)
  const scoped = !!onlyUserIds

  // Accounts in the "no imports yet" window, and every account with imports worked out
  const start = scoped ? 0 : new Date(ONBOARDING_FROM).getTime()
  const oldest = new Date(Math.max(start, now.getTime() - (NO_IMPORTS_UNTIL_DAY + 1) * DAY)).toISOString()
  let recentQuery = db.from("users").select("id, email, created_at").gte("created_at", oldest).lte("created_at", new Date(now.getTime() - DAY).toISOString())
  let snapshotQuery = db.from("tracker_snapshots").select("*").gt("products", 0)
  if (onlyUserIds) {
    recentQuery = recentQuery.in("id", onlyUserIds)
    snapshotQuery = snapshotQuery.in("user_id", onlyUserIds)
  }
  const [{ data: recentRows, error }, { data: snapshotRows }] = await Promise.all([recentQuery, snapshotQuery])
  if (error) throw new Error(`Loading accounts: ${error.message}`)
  const snapshots = new Map(((snapshotRows ?? []) as SnapshotRow[]).map((s) => [s.user_id, s]))
  const known = new Set((recentRows ?? []).map((a) => a.id))
  const missing = Array.from(snapshots.keys()).filter((id) => !known.has(id))
  const { data: moreRows }: { data: Account[] | null } = missing.length ? await db.from("users").select("id, email, created_at").in("id", missing) : { data: [] }
  const accounts = ([...(recentRows ?? []), ...(moreRows ?? [])] as Account[]).filter((a) => a.email)
  if (!accounts.length) return { queued: 0 }

  const ids = accounts.map((a) => a.id)
  const [{ data: catalogs }, { data: sentRows }, subscribers] = await Promise.all([
    db.from("tracker_catalogs").select("user_id, items").in("user_id", ids),
    db.from("lifecycle_emails").select("user_id, email_key, queued_at").in("user_id", ids),
    subscribersFor(db, accounts),
  ])
  const imports = new Map((catalogs ?? []).map((c) => [c.user_id as string, readCatalog(JSON.stringify(c.items))?.length ?? 0]))
  const sentKeys = new Map<string, Set<string>>()
  const lastSent = new Map<string, number>()
  for (const r of sentRows ?? []) {
    sentKeys.set(r.user_id, (sentKeys.get(r.user_id) ?? new Set()).add(r.email_key))
    lastSent.set(r.user_id, Math.max(lastSent.get(r.user_id) ?? 0, new Date(r.queued_at).getTime()))
  }

  const { recent, thisMonth } = await recentActions(db, 3)
  const picks: { account: Account; key: string; message: OutboxMessage }[] = []
  for (const account of accounts) {
    const subscriber = subscribers.get(account.id)
    if (!reachable(subscriber)) continue
    if (now.getTime() - (lastSent.get(account.id) ?? 0) < MIN_DAYS_BETWEEN * DAY) continue
    const snapshot = snapshots.get(account.id)
    const pick = pickEmail({ account, snapshot, imports: imports.get(account.id) ?? 0, sent: sentKeys.get(account.id) ?? new Set(), now, scoped })
    if (!pick) continue
    const footer = subscriberFooter(subscriber, ACCOUNT_REASON)
    const base = { channel: "email" as const, recipient: account.email, userId: account.id, subscriberId: subscriber.id }
    const days = Math.floor((now.getTime() - new Date(account.created_at).getTime()) / DAY)
    const message: OutboxMessage = pick.key === "first_look"
      ? { ...base, template: "tracker_findings", props: { imports: snapshot!.products, footer } }
      : pick.key === "no_imports_3"
        ? { ...base, template: "founder_note", props: { daysSinceSignup: days, footer } }
        : {
            ...base,
            template: "onboarding",
            props: { step: pick.key === "no_imports_1" ? 1 : 2, actionsThisMonth: thisMonth, recent: pick.key === "no_imports_1" ? recent.slice(0, 2) : recent, footer },
          }
    picks.push({ account, key: pick.key, message })
  }
  if (!picks.length) return { queued: 0 }

  const batchId = await createBatch(db, {
    kind: "lifecycle",
    title: `Onboarding · ${today} · ${picks.length} email${picks.length === 1 ? "" : "s"}`,
    ref: { date: today },
    dedupeKey: `lifecycle:${today}`,
    autoSend: true,
    messages: picks.map((p) => p.message),
  })
  if (!batchId) return { queued: 0 }
  await db.from("lifecycle_emails").insert(picks.map((p) => ({ user_id: p.account.id, email_key: p.key, batch_id: batchId })))
  return { queued: picks.length }
}

// The one-time Meet the Tariff Tracker email to every account from before ONBOARDING_FROM that
// hasn't had it, as one outbox batch. Returns how many were queued.
export const queueMeetTracker = async (db: Db, { limit = 2000, onlyUserIds }: { limit?: number } & TestScope = {}) => {
  let query = db.from("users").select("id, email, created_at").lt("created_at", ONBOARDING_FROM).limit(limit)
  if (onlyUserIds) query = query.in("id", onlyUserIds)
  const { data: accountRows, error } = await query
  if (error) throw new Error(`Loading accounts: ${error.message}`)
  const accounts = ((accountRows ?? []) as Account[]).filter((a) => a.email)
  const { data: done } = await db.from("lifecycle_emails").select("user_id").eq("email_key", "meet_tracker")
  const already = new Set((done ?? []).map((r) => r.user_id))
  const todo = accounts.filter((a) => !already.has(a.id))
  if (!todo.length) return { queued: 0 }
  const subscribers = await subscribersFor(db, todo)
  const { recent } = await recentActions(db, 2)
  const picks = todo.flatMap((account) => {
    const s = subscribers.get(account.id)
    return reachable(s) ? [{ account, s }] : []
  })
  if (!picks.length) return { queued: 0 }
  const batchId = await createBatch(db, {
    kind: "lifecycle",
    title: `Meet the Tariff Tracker · ${picks.length} existing account${picks.length === 1 ? "" : "s"}`,
    ref: { email_key: "meet_tracker" },
    dedupeKey: `meet_tracker:${new Date().toISOString().slice(0, 10)}`,
    autoSend: true,
    messages: picks.map(({ account, s }) => ({
      channel: "email" as const,
      recipient: account.email,
      userId: account.id,
      subscriberId: s.id,
      template: "meet_tracker",
      props: {
        optInUrl: appUrl(`/api/email/opt-in?token=${s.token}`),
        recent,
        footer: subscriberFooter(s, "You're getting this one-time update because you have an HTS Hero account."),
      } as Record<string, unknown>,
    })),
  })
  if (!batchId) return { queued: 0 }
  await db.from("lifecycle_emails").insert(picks.map(({ account }) => ({ user_id: account.id, email_key: "meet_tracker", batch_id: batchId })))
  return { queued: picks.length }
}

