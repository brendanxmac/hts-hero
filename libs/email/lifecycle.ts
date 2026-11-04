import type { SupabaseClient } from "@supabase/supabase-js"
import { readCatalog, realItems } from "../../components/tariff-tracker/catalog"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"
import { PricingPlan } from "../../types"
import { ALERT_PLANS, AUDIT_PLANS, OWNED_PLAN_NAMES, planFitting, trialEndsAt, trialLengthFrom } from "../tariff-tracker/plan"
import { RENEWAL_GRACE_DAYS } from "../tariff-tracker/access"
import { createBatch, type OutboxMessage } from "./outbox"
import { ensureAccountSubscriber, SUBSCRIBER_COLUMNS, subscriberFooter, type Subscriber } from "./subscribers"
import { UPDATE_EMAIL_COLUMNS, updateSummary, type UpdateRowForEmail } from "./tariff-news"

// Onboarding (lifecycle) emails. Once a day the job works out, per account, the one email its
// stage calls for and queues them all as one outbox batch, sent without review. Each email goes to an
// account at most once (lifecycle_emails), at most one every two days, and never to an account
// that turned these emails off or unsubscribed.
//
// The sequence drives each account to the next activation step, in order: add imports (alerts are
// on from then, alertPrefs.ts), check savings, audit an entry. Every CTA lands on that step in the
// Duty Guard.
//
// No imports of their own yet (accounts from ONBOARDING_FROM on; the example list doesn't count),
// each sequence stopping once one is added. Which one follows what the account came for and did
// (tracker_onboarding, the import onboarding plan of 2026-10-20):
//   Opened Duty Guard, left it empty, counted from the first visit:
//     tracker_no_imports_1  day 1   detect possible overpayments
//     tracker_no_imports_2  day 3   get alerts when tariffs change on their imports
//     tracker_no_imports_3  day 7   discover possible savings
//     Reminders: the day after "Remind me tomorrow" in the takeover, whenever pressed, the next of
//     these they haven't had (reminder_<day> if they've had them all)
//   Never opened Duty Guard, counted from sign-up:
//     tracker_intro         day 1   signed up for the calculator (or classification): meet Duty Guard
//     product_tour_1/2/3    day 1/3/6  a generic sign-up (home page, header): the calculator, the
//                                   Duty Guard's trial, the classification assistant
//     classify_1/2/3        day 1/3/6  signed up to classify (entry point): first classification,
//                                   the report, the free classifications and plans; stops on a plan
// The day-1 and founder emails sent under the old keys (no_imports_1, no_imports_3) count as sent.
// Imports added (first seen by the snapshot job from ONBOARDING_FROM on):
//   first_look    the morning after, once   well done: the best rate, alerts on new tariffs and
//                                           easy audits, then HTS Hero Managed (tracker_findings)
//
// The reverse trial (queueTrialEmails, run after the onboarding batch so first_look wins the day):
//   trial_unlocked  accounts from before REVERSE_TRIAL.freshStartOn, once, as their fresh trial starts
//   trial_lesson_*  day 2 alerts, day 3 savings, day 5 audits, on 7-day trials: one thing to try
//   trial_ending_3  3 days before it ends   what they'll lose, in their numbers
//   trial_ending_1  the last day
//   trial_ended     the day after it ends   what they lost, and the plan that gets it back
//   trial_winback_7/14  7 and 14 days after it ended
// Paying accounts get none of these.
//
// Duty Guard Essentials subscribers (queueAuditsUpsell): audits_upsell_1/2, 10 and 20 days in.

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
  { key: "tracker_no_imports_3", day: 7 },
  { key: "tracker_no_imports_2", day: 3, was: ["no_imports_3"] },
  { key: "tracker_no_imports_1", day: 1, was: ["no_imports_1"] },
]
const TOUR_STEPS: Step[] = [
  { key: "product_tour_3", day: 6 },
  { key: "product_tour_2", day: 3 },
  { key: "product_tour_1", day: 1 },
]
const INTRO_STEPS: Step[] = [{ key: "tracker_intro", day: 1 }]
const CLASSIFY_STEPS: Step[] = [
  { key: "classify_3", day: 6 },
  { key: "classify_2", day: 3 },
  { key: "classify_1", day: 1 },
]
// Past this, an account that never added an import gets no more onboarding email
const NO_IMPORTS_UNTIL_DAY = 14
const MIN_DAYS_BETWEEN = 2

// How long since the account's last email before this kind can go. Runs are a day apart to the
// minute, not to the second, so the two-day wait is a little under two days. A reminder they asked
// for and first_look (what their imports just turned on) only wait out the day: never two at once.
export const waitBefore = (kind: string) => (kind === "reminder" || kind === "first_look" ? 0.8 : MIN_DAYS_BETWEEN - 0.1) * DAY

// When the account last got one of these. The welcome email doesn't count: it's sent at sign-up
// outside this sequence, and counting it would push the day-1 emails back to day 2 or 3.
const paces = (emailKey: string) => emailKey !== "welcome"

export const ACCOUNT_REASON = "You're getting this because you have an HTS Hero account."

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
}
const ONBOARDING_COLUMNS = "user_id, signup_source, first_visit_at, skipped_at, skip_reason"

// The latest published tariff actions (not HTS revisions), and how many there were in 30 days
export const recentActions = async (db: Db, limit: number) => {
  const since = new Date(Date.now() - 30 * DAY).toISOString()
  const [{ data }, { count }] = await Promise.all([
    db.from("tariff_updates").select(UPDATE_EMAIL_COLUMNS).eq("status", "published").neq("kind", "hts_revision").order("last_activity_at", { ascending: false }).limit(limit),
    db.from("tariff_updates").select("id", { count: "exact", head: true }).eq("status", "published").neq("kind", "hts_revision").gte("first_seen_at", since),
  ])
  return { recent: ((data ?? []) as UpdateRowForEmail[]).map(updateSummary), thisMonth: count ?? 0 }
}

export const subscribersFor = async (db: Db, accounts: Account[]) => {
  const rows = new Map<string, Subscriber>()
  if (!accounts.length) return rows
  const { data } = await db.from("email_subscribers").select(SUBSCRIBER_COLUMNS).in("user_id", accounts.map((a) => a.id))
  for (const s of (data ?? []) as Subscriber[]) rows.set(s.user_id!, s)
  // Accounts without a row yet (before subscriptions existed) get one: lifecycle on, no news. Ten at
  // a time, so hundreds of them (a marketing send to every user) take seconds, not minutes.
  const rowless = accounts.filter((a) => !rows.has(a.id) && a.email)
  for (let i = 0; i < rowless.length; i += 10) {
    await Promise.all(rowless.slice(i, i + 10).map((a) => ensureAccountSubscriber(db, { userId: a.id, email: a.email, newsFrequency: "off" })))
  }
  const missing = accounts.filter((a) => !rows.has(a.id)).map((a) => a.id)
  if (missing.length) {
    const { data: created } = await db.from("email_subscribers").select(SUBSCRIBER_COLUMNS).in("user_id", missing)
    for (const s of (created ?? []) as Subscriber[]) rows.set(s.user_id!, s)
  }
  return rows
}

export const reachable = (s: Subscriber | undefined): s is Subscriber => !!s && s.lifecycle && !s.unsubscribed_at

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
// `onboarding` is null when tracker_onboarding can't be read (before its migration): Duty Guard
// sequence then counts from sign-up, as it used to.
export const pickEmail = ({
  account,
  snapshot,
  imports,
  sent,
  now,
  scoped,
  onboarding,
  entry,
  classifyPlan = false,
}: {
  account: Account
  snapshot?: SnapshotRow
  imports: number
  sent: Set<string>
  now: Date
  scoped: boolean
  onboarding?: OnboardingRow | null
  // Where they signed up from (signup_onboarding.entry_point)
  entry?: string | null
  // They've bought a classification plan
  classifyPlan?: boolean
}): { key: string; kind: "first_look" | "tracker" | "reminder" | "intro" | "tour" | "classify" } | null => {
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

  // Signed up to classify: its own sequence, until they buy a plan
  if (entry === "classify") {
    if (classifyPlan || daysSince(account.created_at) > NO_IMPORTS_UNTIL_DAY) return null
    const step = latestStep(CLASSIFY_STEPS, daysSince(account.created_at), sent)
    return step ? { key: step.key, kind: "classify" } : null
  }

  // They asked to be reminded: the next morning (from 12 hours on, within 2 days)
  if (onboarding?.skip_reason === "remind_me" && onboarding.skipped_at) {
    const since = now.getTime() - new Date(onboarding.skipped_at).getTime()
    const next = [...TRACKER_STEPS].reverse().find((s) => latestStep([s], s.day, sent))
    const key = next?.key ?? `reminder_${onboarding.skipped_at.slice(0, 10)}`
    if (since >= DAY / 2 && since < 2 * DAY && !sent.has(key)) return { key, kind: "reminder" }
  }

  // Opened Duty Guard: counted from the first visit
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
  // And accounts whose first Duty Guard visit is in the window, whenever they signed up
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
  const [{ data: catalogs }, { data: sentRows }, subscribers, { data: onboardingRows, error: onboardingError }, { data: entryRows }, { data: classifyRows }] = await Promise.all([
    db.from("tracker_catalogs").select("user_id, items").in("user_id", ids),
    db.from("lifecycle_emails").select("user_id, email_key, queued_at").in("user_id", ids),
    subscribersFor(db, accounts),
    db.from("tracker_onboarding").select(ONBOARDING_COLUMNS).in("user_id", ids),
    db.from("signup_onboarding").select("user_id, entry_point").in("user_id", ids),
    db.from("purchases").select("user_id").in("user_id", ids).in("product_name", [PricingPlan.CLASSIFY_STARTER, PricingPlan.CLASSIFY_PRO]),
  ])
  const entries = new Map((entryRows ?? []).map((r) => [r.user_id as string, r.entry_point as string | null]))
  const classifyPlans = new Set((classifyRows ?? []).map((r) => r.user_id as string))
  // Unreadable (before its migration): null, and Duty Guard sequence counts from sign-up
  const onboardingFor = (id: string): OnboardingRow | null | undefined =>
    onboardingError ? null : ((onboardingRows ?? []) as OnboardingRow[]).find((r) => r.user_id === id)
  const imports = new Map((catalogs ?? []).map((c) => [c.user_id as string, realItems(readCatalog(JSON.stringify(c.items)) ?? []).length]))
  const sentKeys = new Map<string, Set<string>>()
  const lastSent = new Map<string, number>()
  for (const r of sentRows ?? []) {
    sentKeys.set(r.user_id, (sentKeys.get(r.user_id) ?? new Set()).add(r.email_key))
    if (paces(r.email_key)) lastSent.set(r.user_id, Math.max(lastSent.get(r.user_id) ?? 0, new Date(r.queued_at).getTime()))
  }

  const { recent } = await recentActions(db, 1)
  const picks: { account: Account; key: string; message: OutboxMessage }[] = []
  for (const account of accounts) {
    const subscriber = subscribers.get(account.id)
    if (!reachable(subscriber)) continue
    const snapshot = snapshots.get(account.id)
    const onboarding = onboardingFor(account.id)
    const pick = pickEmail({ account, snapshot, imports: imports.get(account.id) ?? 0, sent: sentKeys.get(account.id) ?? new Set(), now, scoped, onboarding, entry: entries.get(account.id), classifyPlan: classifyPlans.has(account.id) })
    if (!pick) continue
    if (now.getTime() - (lastSent.get(account.id) ?? 0) < waitBefore(pick.kind)) continue
    const footer = subscriberFooter(subscriber, ACCOUNT_REASON)
    const base = { channel: "email" as const, recipient: account.email, userId: account.id, subscriberId: subscriber.id }
    const message: OutboxMessage =
      pick.kind === "first_look"
        ? { ...base, template: "tracker_findings", props: { imports: snapshot!.products, footer } }
        : pick.kind === "classify"
          ? { ...base, template: "classify_onboarding", props: { step: Number(pick.key.slice(-1)), footer } }
          : pick.kind === "intro"
            ? { ...base, template: "tracker_intro", props: { footer } }
            : pick.kind === "tour"
              ? { ...base, template: "product_tour", props: { step: Number(pick.key.slice(-1)), latest: recent[0] ?? null, footer } }
              : { ...base, template: "onboarding", props: { step: Number(pick.key.slice(-1)) || 3, reminder: pick.kind === "reminder", footer } }
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

// ---------- The reverse trial ----------

const TRIAL_PAGE = 1000

const chunks = <T,>(list: T[], size = 200) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size))

// An account on the trial: when it started (its first real imports, tracker_onboarding)
type TrialAccount = Account & { trial_started_at: string }

// Accounts whose trial started in [from, to), a page at a time
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
    if (error) throw new Error(`Loading trials: ${error.message}`)
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
  if (daysLeft <= -14) return daysLeft > -17 && !sent.has("trial_winback_14") ? { key: "trial_winback_14", daysLeft } : null
  if (daysLeft <= -7) return daysLeft > -10 && !sent.has("trial_winback_7") ? { key: "trial_winback_7", daysLeft } : null
  if (daysLeft <= 0) return daysLeft > -3 && !sent.has("trial_ended") ? { key: "trial_ended", daysLeft } : null
  if (daysLeft <= 1) return sent.has("trial_ending_1") ? null : { key: "trial_ending_1", daysLeft }
  // The lessons, on the week-long trial: day 2, day 3, and day 5 after the first "ending" email
  const lessons = trialLengthFrom(startedAt) === REVERSE_TRIAL.days
  const day = Math.floor((now.getTime() - Date.parse(startedAt!)) / DAY)
  if (daysLeft <= 3) {
    if (!sent.has("trial_ending_3") && !sent.has("trial_ending_1")) return { key: "trial_ending_3", daysLeft }
    return lessons && daysLeft === 2 && !sent.has("trial_lesson_audits") ? { key: "trial_lesson_audits", daysLeft } : null
  }
  if (lessons && day >= 3 && !sent.has("trial_lesson_savings")) return { key: "trial_lesson_savings", daysLeft }
  if (lessons && day >= 2 && day < 3 && !sent.has("trial_lesson_alerts")) return { key: "trial_lesson_alerts", daysLeft }
  // Existing accounts with imports, in the first days of their fresh trial
  const existing = Date.parse(createdAt) < fresh && Date.parse(startedAt!) < fresh + DAY
  if (existing && now.getTime() >= fresh && daysLeft > REVERSE_TRIAL.legacyDays - 4 && !sent.has("trial_unlocked")) return { key: "trial_unlocked", daysLeft }
  return null
}

// The day's trial emails, as one outbox batch. Returns how many were queued.
export const queueTrialEmails = async (db: Db, now = new Date(), { onlyUserIds }: TestScope = {}) => {
  const today = now.toISOString().slice(0, 10)
  const fresh = Date.parse(`${REVERSE_TRIAL.freshStartOn}T00:00:00Z`)
  // Accounts mid-trial, or whose trial ended up to 17 days ago (trials are a week, or two for those
  // started before REVERSE_TRIAL.shortFrom: the window covers both), and, in the first days of the
  // fresh start, those whose trial started with it (existing accounts with imports)
  const recentFrom = new Date(now.getTime() - REVERSE_TRIAL.legacyDays * DAY - 17 * DAY).toISOString()
  const recentTo = now.toISOString()
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
      db.from("purchases").select("user_id").in("user_id", part).in("product_name", OWNED_PLAN_NAMES).gte("expires_at", since),
      db.from("lifecycle_emails").select("user_id, email_key, queued_at").in("user_id", part),
      db.from("tracker_snapshots").select("user_id, products, changes_12m, products_hit_12m").in("user_id", part),
      db.from("tracker_catalogs").select("user_id, items").in("user_id", part),
    ])
    for (const r of plans ?? []) paid.add(r.user_id)
    for (const r of sentRows ?? []) {
      sentKeys.set(r.user_id, (sentKeys.get(r.user_id) ?? new Set()).add(r.email_key))
      if (paces(r.email_key)) lastSent.set(r.user_id, Math.max(lastSent.get(r.user_id) ?? 0, new Date(r.queued_at).getTime()))
    }
    for (const r of snaps ?? []) snapshots.set(r.user_id, r)
    for (const c of catalogs ?? []) imports.set(c.user_id as string, realItems(readCatalog(JSON.stringify(c.items)) ?? []).length)
  }

  const due = accounts.flatMap((account) => {
    if (paid.has(account.id)) return []
    // Trials start at the first imports: an account that has since removed them all hears no more
    if (!(imports.get(account.id) ?? snapshots.get(account.id)?.products)) return []
    // One email a day at most
    if (now.getTime() - (lastSent.get(account.id) ?? 0) < 20 * 60 * 60 * 1000) return []
    const pick = pickTrialEmail({ startedAt: account.trial_started_at, createdAt: account.created_at, sent: sentKeys.get(account.id) ?? new Set(), now })
    return pick ? [{ account, ...pick }] : []
  })
  if (!due.length) return { queued: 0 }
  const subscribers = await subscribersFor(db, due.map((d) => d.account))
  const { thisMonth } = await recentActions(db, 1)
  const endsOn = (startedAt: string) => new Date(trialEndsAt(startedAt)!).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })

  const picks = due.flatMap(({ account, key, daysLeft }) => {
    const subscriber = subscribers.get(account.id)
    if (!reachable(subscriber)) return []
    const snap = snapshots.get(account.id)
    const count = imports.get(account.id) ?? snap?.products ?? 0
    const plan = planFitting("audits", count)
    const footer = subscriberFooter(subscriber, ACCOUNT_REASON)
    const base = { channel: "email" as const, recipient: account.email, userId: account.id, subscriberId: subscriber.id }
    const message: OutboxMessage = key.startsWith("trial_lesson_")
      ? {
          ...base,
          template: "trial_education",
          props: { lesson: key.slice("trial_lesson_".length), imports: count, changes12m: snap?.changes_12m ?? 0, productsHit12m: snap?.products_hit_12m ?? 0, daysLeft, footer },
        }
      : {
          ...base,
          template: "trial",
          props: {
            variant: key === "trial_unlocked" ? "unlocked" : key === "trial_ended" ? "ended" : key.startsWith("trial_winback") ? "winback" : "ending",
            daysLeft,
            endsOn: endsOn(account.trial_started_at),
            imports: count,
            actionsThisMonth: thisMonth,
            changes12m: snap?.changes_12m ?? 0,
            productsHit12m: snap?.products_hit_12m ?? 0,
            plan: plan ? { name: plan.plan, imports: plan.maxPairs, price: plan.price } : null,
            footer,
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

// ---------- Duty Guard Pro upsell, for Duty Guard Essentials subscribers ----------

const UPSELL_DAYS = [
  { key: "audits_upsell_2", step: 2, day: 20 },
  { key: "audits_upsell_1", step: 1, day: 10 },
]

// The step an alerts subscriber is due: the latest reached and not sent, days after the first purchase
export const pickUpsell = (firstPurchasedAt: string, sent: Set<string>, now: Date) => {
  const days = (now.getTime() - Date.parse(firstPurchasedAt)) / DAY
  const step = UPSELL_DAYS.find((s) => days >= s.day)
  return step && !sent.has(step.key) ? step : null
}

// The day's upsell emails, as one outbox batch. Returns how many were queued.
export const queueAuditsUpsell = async (db: Db, now = new Date(), { onlyUserIds }: TestScope = {}) => {
  const today = now.toISOString().slice(0, 10)
  const since = new Date(now.getTime() - RENEWAL_GRACE_DAYS * DAY).toISOString()
  const { data, error } = await db.from("purchases").select("user_id, product_name, created_at, expires_at").in("product_name", OWNED_PLAN_NAMES).order("created_at", { ascending: true })
  if (error) throw new Error(`Loading plans: ${error.message}`)
  const rows = (data ?? []) as { user_id: string; product_name: PricingPlan; created_at: string; expires_at: string }[]
  const alertNames = new Set<string>(ALERT_PLANS.map((p) => p.plan))
  const active = rows.filter((r) => r.expires_at >= since)
  const holders = new Set(active.filter((r) => alertNames.has(r.product_name)).map((r) => r.user_id))
  for (const r of active) if (!alertNames.has(r.product_name)) holders.delete(r.user_id)
  let ids = [...holders]
  if (onlyUserIds) ids = ids.filter((id) => onlyUserIds.includes(id))
  if (!ids.length) return { queued: 0 }

  const picks: { account: Account; key: string; message: OutboxMessage }[] = []
  for (const part of chunks(ids)) {
    const [{ data: users }, { data: sentRows }, { data: catalogs }] = await Promise.all([
      db.from("users").select("id, email, created_at").in("id", part),
      db.from("lifecycle_emails").select("user_id, email_key, queued_at").in("user_id", part),
      db.from("tracker_catalogs").select("user_id, items").in("user_id", part),
    ])
    const accounts = ((users ?? []) as Account[]).filter((a) => a.email)
    const subscribers = await subscribersFor(db, accounts)
    for (const account of accounts) {
      const subscriber = subscribers.get(account.id)
      if (!reachable(subscriber)) continue
      const mine = (sentRows ?? []).filter((r) => r.user_id === account.id)
      if (mine.some((r) => now.getTime() - new Date(r.queued_at).getTime() < MIN_DAYS_BETWEEN * DAY)) continue
      const first = rows.find((r) => r.user_id === account.id && alertNames.has(r.product_name))!
      const step = pickUpsell(first.created_at, new Set(mine.map((r) => r.email_key)), now)
      if (!step) continue
      const current = active.filter((r) => r.user_id === account.id).pop()
      const tier = ALERT_PLANS.find((p) => p.plan === current?.product_name)
      const audits = AUDIT_PLANS.find((p) => p.maxPairs === tier?.maxPairs)
      const catalog = (catalogs ?? []).find((c) => c.user_id === account.id)
      const count = catalog ? realItems(readCatalog(JSON.stringify(catalog.items)) ?? []).length : 0
      picks.push({
        account,
        key: step.key,
        message: {
          channel: "email",
          recipient: account.email,
          userId: account.id,
          subscriberId: subscriber.id,
          template: "audits_upsell",
          props: { step: step.step, imports: count, plan: audits ? { name: audits.plan, price: audits.price } : null, footer: subscriberFooter(subscriber, ACCOUNT_REASON) },
        },
      })
    }
  }
  if (!picks.length) return { queued: 0 }
  const batchId = await createBatch(db, {
    kind: "lifecycle",
    title: `Duty Guard Pro upsell · ${today} · ${picks.length} email${picks.length === 1 ? "" : "s"}`,
    ref: { date: today, kind: "audits_upsell" },
    dedupeKey: `audits_upsell:${today}`,
    autoSend: true,
    messages: picks.map((p) => p.message),
  })
  if (!batchId) return { queued: 0 }
  await db.from("lifecycle_emails").insert(picks.map((p) => ({ user_id: p.account.id, email_key: p.key, batch_id: batchId })))
  return { queued: picks.length }
}

// ---------- The Duty Guard launch, once, to every existing account ----------

const LAUNCH_KEY = "duty_guard_launch"

// Every account with an email that hasn't had the launch email and hasn't opted out of these
// emails, as one batch held for review in /email-outbox. dryRun counts them and writes nothing.
export const queueDutyGuardLaunch = async (db: Db, { dryRun = false, onlyUserIds }: { dryRun?: boolean } & TestScope = {}) => {
  const accounts: Account[] = []
  for (let page = 0; ; page++) {
    let query = db.from("users").select("id, email, created_at").order("created_at").range(page * TRIAL_PAGE, (page + 1) * TRIAL_PAGE - 1)
    if (onlyUserIds) query = query.in("id", onlyUserIds)
    const { data, error } = await query
    if (error) throw new Error(`Loading accounts: ${error.message}`)
    accounts.push(...((data ?? []) as Account[]).filter((a) => a.email))
    if (!data || data.length < TRIAL_PAGE) break
  }

  // Not twice, and never to an address that unsubscribed or turned these emails off
  const done = new Set<string>()
  const optedOut = new Set<string>()
  for (const part of chunks(accounts.map((a) => a.id))) {
    const [{ data: sent }, { data: subs }] = await Promise.all([
      db.from("lifecycle_emails").select("user_id").eq("email_key", LAUNCH_KEY).in("user_id", part),
      db.from("email_subscribers").select(SUBSCRIBER_COLUMNS).in("user_id", part),
    ])
    for (const r of sent ?? []) done.add(r.user_id)
    for (const s of (subs ?? []) as Subscriber[]) if (!s.lifecycle || s.unsubscribed_at) optedOut.add(s.user_id!)
  }
  const todo = accounts.filter((a) => !done.has(a.id) && !optedOut.has(a.id))
  const counts = { accounts: accounts.length, alreadySent: done.size, optedOut: optedOut.size }
  if (dryRun || !todo.length) return { queued: 0, wouldQueue: todo.length, ...counts }

  const picks: { account: Account; message: OutboxMessage }[] = []
  for (const part of chunks(todo)) {
    const subscribers = await subscribersFor(db, part)
    for (const account of part) {
      const s = subscribers.get(account.id)
      if (!reachable(s)) continue
      picks.push({
        account,
        message: { channel: "email", recipient: account.email, userId: account.id, subscriberId: s.id, template: LAUNCH_KEY, props: { footer: subscriberFooter(s, ACCOUNT_REASON) } },
      })
    }
  }
  if (!picks.length) return { queued: 0, wouldQueue: 0, ...counts }
  const batchId = await createBatch(db, {
    kind: "lifecycle",
    title: `Duty Guard launch · ${picks.length} account${picks.length === 1 ? "" : "s"}`,
    ref: { email_key: LAUNCH_KEY },
    dedupeKey: `${LAUNCH_KEY}:${new Date().toISOString().slice(0, 10)}`,
    // Every account at once: reviewed and approved in /email-outbox first
    autoSend: false,
    messages: picks.map((p) => p.message),
  })
  if (!batchId) return { queued: 0, wouldQueue: picks.length, ...counts }
  for (const part of chunks(picks, 500)) {
    await db.from("lifecycle_emails").insert(part.map((p) => ({ user_id: p.account.id, email_key: LAUNCH_KEY, batch_id: batchId })))
  }
  return { queued: picks.length, wouldQueue: picks.length, ...counts }
}
