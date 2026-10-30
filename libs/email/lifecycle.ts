import type { SupabaseClient } from "@supabase/supabase-js"
import { readCatalog, realItems } from "../../components/tariff-tracker/catalog"
import { LAUNCH_PRICING, launchPricingActive, REVERSE_TRIAL, TRIAL_ALLOWANCE } from "../../components/pricing-calculator/lib/pricing"
import { TRACKER_PLANS, trialEndsAt } from "../tariff-tracker/plan"
import { RENEWAL_GRACE_DAYS } from "../tariff-tracker/access"
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
// No imports of their own yet (accounts from ONBOARDING_FROM on; the example list doesn't count),
// each sequence stopping once one is added. Which one follows what the account came for and did
// (tracker_onboarding, the import onboarding plan of 2026-10-20):
//   Opened the Tracker, left it empty, counted from the first visit:
//     tracker_no_imports_1  day 1   this month's tariff actions, the three ways in, ask your broker
//     tracker_no_imports_2  day 3   a personal note from Brendan: can I give you a hand? (answers
//                                   their skip reason; reply with a spreadsheet and he sets it up)
//     tracker_no_imports_3  day 10  the same help first, then HTS Hero Managed
//     reminder_<day>        the day after "Remind me tomorrow" in the takeover, whenever pressed
//   Never opened the Tracker, counted from sign-up:
//     tracker_intro         day 1   signed up for the calculator (or classification): meet the Tracker
//     product_tour_1/2/3    day 1/3/6  a generic sign-up (home page, header): the calculator, the
//                                   Tracker's trial, the classification assistant
// The day-1 and founder emails sent under the old keys (no_imports_1, no_imports_3) count as sent.
// Imports added (first seen by the snapshot job from ONBOARDING_FROM on):
//   first_look    the morning after, once   well done: the best rate, alerts on new tariffs and
//                                           easy audits, then HTS Hero Managed (tracker_findings)
// Accounts from before ONBOARDING_FROM get the one-time meet_tracker email instead (queued by
// `npm run email:meet-tracker`), with a one-click opt-in to the weekly digest.
//
// The 14-day reverse trial (queueTrialEmails, run first so it wins the day):
//   trial_unlocked  accounts from before REVERSE_TRIAL.freshStartOn, once, as their fresh 14 days start
//   trial_ending_3  3 days before it ends   what they'll lose, in their numbers
//   trial_ending_1  the last day
//   trial_ended     the day after it ends   what they lost, and the plan that gets it back

type Db = SupabaseClient

// Accounts created from here on get the "no imports yet" emails
export const ONBOARDING_FROM = "2026-10-16T00:00:00Z"

const DAY = 86_400_000
// The steps, latest first: an account gets the latest step it has reached, if not sent yet (or
// under an older key that sent the same email)
interface Step {
  key: string
  day: number
  was?: string[]
}
const TRACKER_STEPS: Step[] = [
  { key: "tracker_no_imports_3", day: 10 },
  { key: "tracker_no_imports_2", day: 3, was: ["no_imports_3"] },
  { key: "tracker_no_imports_1", day: 1, was: ["no_imports_1"] },
]
const TOUR_STEPS: Step[] = [
  { key: "product_tour_3", day: 6 },
  { key: "product_tour_2", day: 3 },
  { key: "product_tour_1", day: 1 },
]
const INTRO_STEPS: Step[] = [{ key: "tracker_intro", day: 1 }]
// Past this, an account that never added an import gets no more onboarding email
const NO_IMPORTS_UNTIL_DAY = 14
const MIN_DAYS_BETWEEN = 2

const ACCOUNT_REASON = "You're getting this because you have an HTS Hero account."

interface Account {
  id: string
  email: string
  created_at: string
}

// What the import onboarding knows about an account (tracker_onboarding)
export interface OnboardingRow {
  user_id: string
  signup_source: string | null
  first_visit_at: string | null
  skipped_at: string | null
  skip_reason: string | null
  skip_note: string | null
}
const ONBOARDING_COLUMNS = "user_id, signup_source, first_visit_at, skipped_at, skip_reason, skip_note"

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

// The latest step reached `days` in, if it (or its older key) hasn't been sent
const latestStep = (steps: Step[], days: number, sent: Set<string>) => {
  const step = steps.find((s) => days >= s.day)
  return step && !sent.has(step.key) && !step.was?.some((k) => sent.has(k)) ? step : null
}

// The one email an account's stage calls for today, if any (latest-stage-first, at most once each).
// `onboarding` is null when tracker_onboarding can't be read (before its migration): the Tracker
// sequence then counts from sign-up, as it used to.
export const pickEmail = ({
  account,
  snapshot,
  imports,
  sent,
  now,
  scoped,
  onboarding,
}: {
  account: Account
  snapshot?: SnapshotRow
  imports: number
  sent: Set<string>
  now: Date
  scoped: boolean
  onboarding?: OnboardingRow | null
}): { key: string; kind: "first_look" | "tracker" | "reminder" | "intro" | "tour" } | null => {
  const fresh = snapshot && now.getTime() - new Date(snapshot.computed_at).getTime() < 2 * DAY
  if (snapshot && fresh && snapshot.products > 0) {
    // Imports added from onboarding's start on: the morning after, once
    const first = snapshot.first_products_at ? new Date(snapshot.first_products_at).getTime() : null
    if (first && (scoped || first >= new Date(ONBOARDING_FROM).getTime())) {
      const days = (now.getTime() - first) / DAY
      const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      if (!sent.has("first_look") && first < startOfToday && days <= 7) return { key: "first_look", kind: "first_look" }
    }
    return null
  }
  if (imports > 0) return null
  if (!scoped && new Date(account.created_at).getTime() < new Date(ONBOARDING_FROM).getTime()) return null
  const daysSince = (iso: string) => Math.floor((now.getTime() - new Date(iso).getTime()) / DAY)

  // They asked to be reminded: the next morning (from 12 hours on, within 2 days)
  if (onboarding?.skip_reason === "remind_me" && onboarding.skipped_at) {
    const since = now.getTime() - new Date(onboarding.skipped_at).getTime()
    const key = `reminder_${onboarding.skipped_at.slice(0, 10)}`
    if (since >= DAY / 2 && since < 2 * DAY && !sent.has(key)) return { key, kind: "reminder" }
  }

  // Opened the Tracker: counted from the first visit
  const firstVisit = onboarding === null ? account.created_at : onboarding?.first_visit_at
  if (firstVisit) {
    const days = daysSince(firstVisit)
    if (days > NO_IMPORTS_UNTIL_DAY) return null
    const step = latestStep(TRACKER_STEPS, days, sent)
    return step ? { key: step.key, kind: "tracker" } : null
  }

  // Never opened it: what they signed up for decides
  const days = daysSince(account.created_at)
  if (days > NO_IMPORTS_UNTIL_DAY) return null
  const generic = onboarding?.signup_source === "generic"
  const step = latestStep(generic ? TOUR_STEPS : INTRO_STEPS, days, sent)
  return step ? { key: step.key, kind: generic ? "tour" : "intro" } : null
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
  // And accounts whose first Tracker visit is in the window, whenever they signed up
  let visitQuery = db.from("tracker_onboarding").select("user_id").gte("first_visit_at", oldest).lte("first_visit_at", new Date(now.getTime() - DAY).toISOString())
  if (onlyUserIds) visitQuery = visitQuery.in("user_id", onlyUserIds)
  const [{ data: recentRows, error }, { data: snapshotRows }, { data: visitRows }] = await Promise.all([recentQuery, snapshotQuery, visitQuery])
  if (error) throw new Error(`Loading accounts: ${error.message}`)
  const snapshots = new Map(((snapshotRows ?? []) as SnapshotRow[]).map((s) => [s.user_id, s]))
  const known = new Set((recentRows ?? []).map((a) => a.id))
  const missing = Array.from(new Set([...snapshots.keys(), ...((visitRows ?? []) as { user_id: string }[]).map((v) => v.user_id)])).filter((id) => !known.has(id))
  const { data: moreRows }: { data: Account[] | null } = missing.length ? await db.from("users").select("id, email, created_at").in("id", missing) : { data: [] }
  const accounts = ([...(recentRows ?? []), ...(moreRows ?? [])] as Account[]).filter((a) => a.email)
  if (!accounts.length) return { queued: 0 }

  const ids = accounts.map((a) => a.id)
  const [{ data: catalogs }, { data: sentRows }, subscribers, { data: onboardingRows, error: onboardingError }] = await Promise.all([
    db.from("tracker_catalogs").select("user_id, items").in("user_id", ids),
    db.from("lifecycle_emails").select("user_id, email_key, queued_at").in("user_id", ids),
    subscribersFor(db, accounts),
    db.from("tracker_onboarding").select(ONBOARDING_COLUMNS).in("user_id", ids),
  ])
  // Unreadable (before its migration): null, and the Tracker sequence counts from sign-up
  const onboardingFor = (id: string): OnboardingRow | null | undefined =>
    onboardingError ? null : ((onboardingRows ?? []) as OnboardingRow[]).find((r) => r.user_id === id)
  const imports = new Map((catalogs ?? []).map((c) => [c.user_id as string, realItems(readCatalog(JSON.stringify(c.items)) ?? []).length]))
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
    const snapshot = snapshots.get(account.id)
    const onboarding = onboardingFor(account.id)
    const pick = pickEmail({ account, snapshot, imports: imports.get(account.id) ?? 0, sent: sentKeys.get(account.id) ?? new Set(), now, scoped, onboarding })
    if (!pick) continue
    // Two days apart at most, except a reminder they asked for (still never two in a day)
    const gap = now.getTime() - (lastSent.get(account.id) ?? 0)
    if (gap < (pick.kind === "reminder" ? 0.8 : MIN_DAYS_BETWEEN) * DAY) continue
    const footer = subscriberFooter(subscriber, ACCOUNT_REASON)
    const base = { channel: "email" as const, recipient: account.email, userId: account.id, subscriberId: subscriber.id }
    const skip = { skipReason: onboarding?.skip_reason ?? null, skipNote: onboarding?.skip_note ?? null }
    const message: OutboxMessage =
      pick.kind === "first_look"
        ? { ...base, template: "tracker_findings", props: { imports: snapshot!.products, footer } }
        : pick.key === "tracker_no_imports_2" || pick.key === "tracker_no_imports_3"
          ? { ...base, template: "founder_note", props: { variant: pick.key === "tracker_no_imports_2" ? "help" : "last", ...skip, footer } }
          : pick.kind === "intro"
            ? { ...base, template: "tracker_intro", props: { footer } }
            : pick.kind === "tour"
              ? { ...base, template: "product_tour", props: { step: Number(pick.key.slice(-1)), latest: recent[0] ?? null, footer } }
              : {
                  ...base,
                  template: "onboarding",
                  props: { step: 1, actionsThisMonth: thisMonth, recent: recent.slice(0, 2), reminder: pick.kind === "reminder" || onboarding?.skip_reason === "remind_me", footer },
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


// ---------- The 14-day reverse trial ----------

const TRIAL_PAGE = 1000

// Every account made in [from, to), a page at a time (selects stop at 1,000 rows)
const accountsBetween = async (db: Db, from: string | null, to: string): Promise<Account[]> => {
  const out: Account[] = []
  for (let page = 0; ; page++) {
    let query = db.from("users").select("id, email, created_at").lt("created_at", to).order("created_at").range(page * TRIAL_PAGE, (page + 1) * TRIAL_PAGE - 1)
    if (from) query = query.gte("created_at", from)
    const { data, error } = await query
    if (error) throw new Error(`Loading accounts: ${error.message}`)
    out.push(...((data ?? []) as Account[]))
    if (!data || data.length < TRIAL_PAGE) return out
  }
}

const chunks = <T,>(list: T[], size = 200) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size))

// An account on the trial: when it started (its first real imports, tracker_onboarding)
type TrialAccount = Account & { trial_started_at: string }

// Accounts whose trial started in [from, to), a page at a time. Until the tracker_onboarding
// migration is applied, trials started at sign-up.
const trialsStartedBetween = async (db: Db, from: string, to: string): Promise<TrialAccount[]> => {
  const started: { user_id: string; trial_started_at: string }[] = []
  for (let page = 0; ; page++) {
    const { data, error } = await db
      .from("tracker_onboarding")
      .select("user_id, trial_started_at")
      .gte("trial_started_at", from)
      .lt("trial_started_at", to)
      .order("trial_started_at")
      .range(page * TRIAL_PAGE, (page + 1) * TRIAL_PAGE - 1)
    if (error) return (await accountsBetween(db, from, to)).map((a) => ({ ...a, trial_started_at: a.created_at }))
    started.push(...((data ?? []) as typeof started))
    if (!data || data.length < TRIAL_PAGE) break
  }
  const out: TrialAccount[] = []
  for (const part of chunks(started)) {
    const { data, error } = await db.from("users").select("id, email, created_at").in("id", part.map((s) => s.user_id))
    if (error) throw new Error(`Loading accounts: ${error.message}`)
    const at = new Map(part.map((s) => [s.user_id, s.trial_started_at]))
    for (const a of (data ?? []) as Account[]) out.push({ ...a, trial_started_at: at.get(a.id)! })
  }
  return out
}

// The trial email an account's day calls for: the latest step reached and not sent. Nothing
// before the trial starts (no imports yet).
export const pickTrialEmail = ({
  startedAt,
  createdAt,
  sent,
  now,
}: {
  startedAt: string | null
  createdAt: string
  sent: Set<string>
  now: Date
}): { key: string; daysLeft: number } | null => {
  const endsAt = trialEndsAt(startedAt)
  if (!endsAt) return null
  const ends = Date.parse(endsAt)
  const daysLeft = Math.ceil((ends - now.getTime()) / DAY)
  const fresh = Date.parse(`${REVERSE_TRIAL.freshStartOn}T00:00:00Z`)
  if (daysLeft <= 0) return daysLeft > -3 && !sent.has("trial_ended") ? { key: "trial_ended", daysLeft } : null
  if (daysLeft <= 1) return sent.has("trial_ending_1") ? null : { key: "trial_ending_1", daysLeft }
  if (daysLeft <= 3) return sent.has("trial_ending_3") || sent.has("trial_ending_1") ? null : { key: "trial_ending_3", daysLeft }
  // Existing accounts with imports, in the first days of their fresh trial
  const existing = Date.parse(createdAt) < fresh && Date.parse(startedAt!) < fresh + DAY
  if (existing && now.getTime() >= fresh && daysLeft > REVERSE_TRIAL.legacyDays - 4 && !sent.has("trial_unlocked")) return { key: "trial_unlocked", daysLeft }
  return null
}

// The day's trial emails, as one outbox batch. Returns how many were queued.
export const queueTrialEmails = async (db: Db, now = new Date(), { onlyUserIds }: TestScope = {}) => {
  const today = now.toISOString().slice(0, 10)
  const fresh = Date.parse(`${REVERSE_TRIAL.freshStartOn}T00:00:00Z`)
  // Accounts whose trial ends between 3 days ago and 4 days from now (trials are a week, or two for
  // those started before REVERSE_TRIAL.shortFrom: the window covers both), and, in the first days of
  // the fresh start, those whose trial started with it (existing accounts with imports)
  const recentFrom = new Date(now.getTime() - REVERSE_TRIAL.legacyDays * DAY - 3 * DAY).toISOString()
  const recentTo = new Date(now.getTime() - REVERSE_TRIAL.days * DAY + 4 * DAY).toISOString()
  const freshUnlocking = now.getTime() >= fresh && now.getTime() < fresh + 4 * DAY
  const [recent, unlocking] = await Promise.all([
    trialsStartedBetween(db, recentFrom, recentTo),
    freshUnlocking ? trialsStartedBetween(db, new Date(fresh - REVERSE_TRIAL.legacyDays * DAY).toISOString(), new Date(fresh + DAY).toISOString()) : Promise.resolve([] as TrialAccount[]),
  ])
  const byId = new Map([...recent, ...unlocking].map((a) => [a.id, a]))
  let accounts = [...byId.values()].filter((a) => a.email)
  if (onlyUserIds) accounts = accounts.filter((a) => onlyUserIds.includes(a.id))
  if (!accounts.length) return { queued: 0 }

  // Paying accounts get none
  const ids = accounts.map((a) => a.id)
  const since = new Date(now.getTime() - RENEWAL_GRACE_DAYS * DAY).toISOString()
  const paid = new Set<string>()
  const sentKeys = new Map<string, Set<string>>()
  const lastSent = new Map<string, number>()
  const snapshots = new Map<string, { products: number; changes_12m: number; products_hit_12m: number }>()
  const imports = new Map<string, number>()
  for (const part of chunks(ids)) {
    const [{ data: plans }, { data: sentRows }, { data: snaps }, { data: catalogs }] = await Promise.all([
      db.from("purchases").select("user_id").in("user_id", part).in("product_name", TRACKER_PLANS.map((p) => p.plan)).gte("expires_at", since),
      db.from("lifecycle_emails").select("user_id, email_key, queued_at").in("user_id", part),
      db.from("tracker_snapshots").select("user_id, products, changes_12m, products_hit_12m").in("user_id", part),
      db.from("tracker_catalogs").select("user_id, items").in("user_id", part),
    ])
    for (const r of plans ?? []) paid.add(r.user_id)
    for (const r of sentRows ?? []) {
      sentKeys.set(r.user_id, (sentKeys.get(r.user_id) ?? new Set()).add(r.email_key))
      lastSent.set(r.user_id, Math.max(lastSent.get(r.user_id) ?? 0, new Date(r.queued_at).getTime()))
    }
    for (const r of snaps ?? []) snapshots.set(r.user_id, r)
    for (const c of catalogs ?? []) imports.set(c.user_id as string, realItems(readCatalog(JSON.stringify(c.items)) ?? []).length)
  }

  const due = accounts.flatMap((account) => {
    if (paid.has(account.id)) return []
    // One email a day at most
    if (now.getTime() - (lastSent.get(account.id) ?? 0) < 20 * 60 * 60 * 1000) return []
    const pick = pickTrialEmail({ startedAt: account.trial_started_at, createdAt: account.created_at, sent: sentKeys.get(account.id) ?? new Set(), now })
    return pick ? [{ account, ...pick }] : []
  })
  if (!due.length) return { queued: 0 }
  const subscribers = await subscribersFor(db, due.map((d) => d.account))
  const launch = launchPricingActive(now.getTime())
  const endsOn = (startedAt: string) => new Date(trialEndsAt(startedAt)!).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })

  const picks = due.flatMap(({ account, key, daysLeft }) => {
    const subscriber = subscribers.get(account.id)
    if (!reachable(subscriber)) return []
    const snap = snapshots.get(account.id)
    const count = imports.get(account.id) ?? snap?.products ?? 0
    // The trial tracks up to REVERSE_TRIAL.imports; the free plan keeps TRIAL_ALLOWANCE.alertImports
    const losing = Math.max(0, Math.min(count, REVERSE_TRIAL.imports) - TRIAL_ALLOWANCE.alertImports)
    const plan = TRACKER_PLANS.find((p) => count <= p.maxPairs) ?? null
    const message: OutboxMessage = {
      channel: "email",
      recipient: account.email,
      userId: account.id,
      subscriberId: subscriber.id,
      template: "trial",
      props: {
        variant: key === "trial_unlocked" ? "unlocked" : key === "trial_ended" ? "ended" : "ending",
        daysLeft,
        endsOn: endsOn(account.trial_started_at),
        imports: count,
        losing,
        changes12m: snap?.changes_12m ?? 0,
        productsHit12m: snap?.products_hit_12m ?? 0,
        plan: plan ? { imports: plan.maxPairs, price: plan.price } : null,
        launchEndsDay: launch ? LAUNCH_PRICING.endsDay : null,
        footer: subscriberFooter(subscriber, ACCOUNT_REASON),
      },
    }
    return [{ account, key, message }]
  })
  if (!picks.length) return { queued: 0 }

  const batchId = await createBatch(db, {
    kind: "lifecycle",
    title: `Free trial · ${today} · ${picks.length} email${picks.length === 1 ? "" : "s"}`,
    ref: { date: today, kind: "trial" },
    dedupeKey: `trial:${today}`,
    // The "unlocked" email goes to every existing account at once: reviewed in /email-outbox first
    autoSend: !picks.some((p) => p.key === "trial_unlocked"),
    messages: picks.map((p) => p.message),
  })
  if (!batchId) return { queued: 0 }
  for (const part of chunks(picks, 500)) {
    await db.from("lifecycle_emails").insert(part.map((p) => ({ user_id: p.account.id, email_key: p.key, batch_id: batchId })))
  }
  return { queued: picks.length }
}
