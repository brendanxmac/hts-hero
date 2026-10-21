import type { SupabaseClient } from "@supabase/supabase-js"
import type { UpdateSummary } from "../../emails/kit/parts"
import { STAGE_ORDER, STAGES, type Stage } from "../tariff-updates/types"
import { createBatch, type OutboxMessage } from "./outbox"
import { SUBSCRIBER_COLUMNS, subscriberFooter, type Subscriber } from "./subscribers"
import { newsEmailProps, UPDATE_EMAIL_COLUMNS, updateSummary, type UpdateRowForEmail } from "./tariff-news"

// Turns tariff updates into outbox batches for subscribers. Instant alerts send on their own; the
// weekly digest waits for review in /email-outbox.
//
// An update's events are the stages its sources reached, each at its earliest source's date. A
// subscriber on "every step" gets every event; one on "new actions" gets the update's first event
// and the moment it becomes law (its first signed or published event). Instant subscribers get a
// batch per update each time it reaches new stages (stages that arrive together, or while it waits
// for review, go as one email); weekly ones a digest every Monday of the week's updates.

type Db = SupabaseClient

// Events before this aren't sent: subscriptions started here, so the backlog stays on the page
export const NEWS_ALERTS_FROM = "2026-10-21T00:00:00Z"
// How far back an event is still news
const INSTANT_WINDOW_DAYS = 7

const LAW_STAGES: Stage[] = ["signed", "published"]

interface UpdateEvent {
  stage: Stage
  at: string
  // Sent to "new actions" subscribers too
  isAction: boolean
}

type UpdateRow = UpdateRowForEmail & { last_activity_at: string }

// The stages an update reached, oldest first
const eventsOf = (sources: { stage: Stage | null; published_at: string }[]): UpdateEvent[] => {
  const first = new Map<Stage, string>()
  for (const s of sources) {
    if (!s.stage) continue
    const at = first.get(s.stage)
    if (!at || s.published_at < at) first.set(s.stage, s.published_at)
  }
  const events = Array.from(first, ([stage, at]) => ({ stage, at })).sort(
    (a, b) => a.at.localeCompare(b.at) || STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
  )
  const firstLaw = events.find((e) => LAW_STAGES.includes(e.stage))
  return events.map((e, i) => ({ ...e, isAction: i === 0 || e === firstLaw }))
}

// An update matches a subscriber's laws and countries (empty: all). An all-countries update
// matches every country; one naming no country only matches subscribers with no country filter.
// AD/CVD news (many notices a week) goes only to readers who picked it.
export const matchesPreferences = (u: Pick<UpdateRowForEmail, "authority" | "countries">, s: Pick<Subscriber, "news_authorities" | "news_countries">) =>
  (u.authority === "ad_cvd" ? s.news_authorities.includes("ad_cvd") : !s.news_authorities.length || s.news_authorities.includes(u.authority)) &&
  (!s.news_countries.length || u.countries.includes("ALL") || u.countries.some((c) => s.news_countries.includes(c)))

const activeSubscribers = async (db: Db, frequency: "instant" | "weekly") => {
  const { data, error } = await db
    .from("email_subscribers")
    .select(SUBSCRIBER_COLUMNS)
    .eq("news_frequency", frequency)
    .not("confirmed_at", "is", null)
    .is("unsubscribed_at", null)
  if (error) throw new Error(`Loading subscribers: ${error.message}`)
  return (data ?? []) as Subscriber[]
}

// Account holders' Slack and Teams webhooks, and whether they want email
const channelSettings = async (db: Db, userIds: string[]) => {
  if (!userIds.length) return new Map<string, { email_enabled: boolean; slack_webhook: string | null; teams_webhook: string | null }>()
  const { data } = await db.from("tracker_alert_settings").select("user_id, email_enabled, slack_webhook, teams_webhook").in("user_id", userIds)
  return new Map((data ?? []).map((r) => [r.user_id as string, r]))
}

// The messages for one subscriber: email unless an account turned it off, plus its webhooks
const messagesFor = (
  s: Subscriber,
  settings: Map<string, { email_enabled: boolean; slack_webhook: string | null; teams_webhook: string | null }>,
  template: string,
  props: Record<string, unknown>
): OutboxMessage[] => {
  const own = s.user_id ? settings.get(s.user_id) : undefined
  const base = { userId: s.user_id, subscriberId: s.id, template, props }
  return [
    ...(own?.email_enabled === false ? [] : [{ ...base, channel: "email" as const, recipient: s.email }]),
    ...(own?.slack_webhook ? [{ ...base, channel: "slack" as const, recipient: own.slack_webhook }] : []),
    ...(own?.teams_webhook ? [{ ...base, channel: "teams" as const, recipient: own.teams_webhook }] : []),
  ]
}

const loadUpdatesWithEvents = async (db: Db, since: string) => {
  const { data: updates, error } = await db
    .from("tariff_updates")
    .select(`${UPDATE_EMAIL_COLUMNS}, last_activity_at`)
    .eq("status", "published")
    .eq("needs_review", false)
    .gte("last_activity_at", since)
  if (error) throw new Error(`Loading updates: ${error.message}`)
  const rows = (updates ?? []) as UpdateRow[]
  if (!rows.length) return []
  const { data: sources } = await db
    .from("tariff_source_items")
    .select("update_id, stage, published_at")
    .in("update_id", rows.map((u) => u.id))
  return rows.map((u) => ({
    update: u,
    events: eventsOf((sources ?? []).filter((s) => s.update_id === u.id) as { stage: Stage | null; published_at: string }[]),
  }))
}

const stageName = (stage: Stage) => STAGES[stage].replace(" in the Federal Register", "")

// What a follow-up alert says happened, ahead of the title ("Published in the Federal Register: …")
const STEP_LABELS: Record<Stage, string> = {
  announced: "Announced",
  signed: "Signed",
  filed: "Filed with the Federal Register",
  published: "Published in the Federal Register",
  cbp_guidance: "CBP guidance out",
  in_hts: "Now in the HTS",
}

// The stages each update has already had an alert for (a batch covers every stage in ref.stages)
const alertedStages = async (db: Db, updateIds: string[]) => {
  const alerted = new Map<string, Set<string>>()
  if (!updateIds.length) return alerted
  const { data, error } = await db.from("email_batches").select("ref").eq("kind", "tariff_news").in("ref->>update_id", updateIds)
  if (error) throw new Error(`Loading sent alerts: ${error.message}`)
  for (const { ref } of (data ?? []) as { ref: { update_id: string; stage: string; stages?: string[] } }[]) {
    const stages = alerted.get(ref.update_id) ?? new Set<string>()
    for (const stage of [ref.stage, ...(ref.stages ?? [])]) stages.add(stage)
    alerted.set(ref.update_id, stages)
  }
  return alerted
}

// One batch per update with new events, for instant subscribers whose choices they match. Several
// new stages at once (a backlog, or an update cleared after review) make one alert, not one each.
// `from` overrides the start (tests and previews; the cron never passes it)
export const produceInstantNews = async (db: Db, { from }: { from?: string } = {}) => {
  const since = from ?? new Date(Math.max(new Date(NEWS_ALERTS_FROM).getTime(), Date.now() - INSTANT_WINDOW_DAYS * 86_400_000)).toISOString()
  const [updates, subscribers] = await Promise.all([loadUpdatesWithEvents(db, since), activeSubscribers(db, "instant")])
  const [settings, alerted] = await Promise.all([
    channelSettings(db, subscribers.flatMap((s) => (s.user_id ? [s.user_id] : []))),
    alertedStages(db, updates.map(({ update }) => update.id)),
  ])
  let batches = 0
  for (const { update, events } of updates) {
    const before = alerted.get(update.id)
    const fresh = events.filter((e) => e.at >= since && !before?.has(e.stage))
    if (!fresh.length) continue
    const latest = fresh[fresh.length - 1]
    const recipients = subscribers.filter((s) => matchesPreferences(update, s) && (s.news_scope === "all_steps" || fresh.some((e) => e.isAction)))
    if (!recipients.length) continue
    const base = await newsEmailProps(db, update, { reason: "" })
    const messages = recipients.flatMap((s) =>
      messagesFor(s, settings, "tariff_news", {
        ...base,
        // An update that's been alerted before says what's new
        step: before ? STEP_LABELS[latest.stage] : null,
        signedIn: !!s.user_id,
        footer: subscriberFooter(s, "You're getting this because you subscribed to US tariff updates from HTS Hero."),
      } as unknown as Record<string, unknown>)
    )
    const id = await createBatch(db, {
      kind: "tariff_news",
      title: `${update.title} · ${stageName(latest.stage)}`,
      ref: { update_id: update.id, stage: latest.stage, stages: fresh.map((e) => e.stage), slug: update.slug },
      dedupeKey: `tariff_news:${update.id}:${latest.stage}`,
      // Sent without review: the update itself was published with confidence (or reviewed)
      autoSend: true,
      messages,
    })
    if (id) batches++
  }
  return { batches }
}

// "Oct 8 – Oct 14, 2026"
const periodLabel = (from: Date, to: Date) => {
  const day = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
  return `${day(from)} – ${day(to)}, ${to.getUTCFullYear()}`
}

// The weekly digest: the week (Monday to Sunday, UTC) before `until`, one batch for every weekly
// subscriber with at least one matching update. Run late in the week, it still makes last week's
// digest (and the dedupe key stops a second one). Events from the week before that the last digest
// didn't have (cleared after review, or found late) come along too, so none fall between weeks.
export const produceWeeklyDigest = async (db: Db, until = new Date(), { ignoreStartDate = false }: { ignoreStartDate?: boolean } = {}) => {
  const midnight = Date.UTC(until.getUTCFullYear(), until.getUTCMonth(), until.getUTCDate())
  const end = new Date(midnight - ((until.getUTCDay() + 6) % 7) * 86_400_000)
  const start = new Date(end.getTime() - 7 * 86_400_000)
  const previousStart = new Date(start.getTime() - 7 * 86_400_000)
  const floor = (d: Date) => new Date(ignoreStartDate ? d.getTime() : Math.max(d.getTime(), new Date(NEWS_ALERTS_FROM).getTime())).toISOString()
  const from = floor(start)
  const carryFrom = floor(previousStart)
  const { data: previous, error } = await db.from("email_batches").select("ref").eq("dedupe_key", `tariff_digest:${previousStart.toISOString().slice(0, 10)}`).maybeSingle()
  if (error) throw new Error(`Loading last week's digest: ${error.message}`)
  // The events last week's digest had. None made: all of them; one from before events were
  // recorded covered its whole week.
  const had = previous ? (previous.ref as { events?: string[] }).events : []
  const missedLastWeek = (key: string) => !!had && !had.includes(key)

  const [updates, subscribers] = await Promise.all([loadUpdatesWithEvents(db, carryFrom), activeSubscribers(db, "weekly")])
  const inDigest = (u: UpdateRow, e: UpdateEvent) =>
    e.at < end.toISOString() && (e.at >= from || (e.at >= carryFrom && missedLastWeek(`${u.id}:${e.stage}`)))
  const settings = await channelSettings(db, subscribers.flatMap((s) => (s.user_id ? [s.user_id] : [])))
  const period = periodLabel(start, new Date(end.getTime() - 86_400_000))

  const messages = subscribers.flatMap((s) => {
    const picked: UpdateSummary[] = updates
      .filter(({ update, events }) => matchesPreferences(update, s) && events.some((e) => inDigest(update, e) && (s.news_scope === "all_steps" || e.isAction)))
      .sort((a, b) => b.update.last_activity_at.localeCompare(a.update.last_activity_at))
      .map(({ update }) => updateSummary(update))
    if (!picked.length) return []
    return messagesFor(s, settings, "tariff_digest", {
      period,
      updates: picked,
      signedIn: !!s.user_id,
      footer: subscriberFooter(s, "You're getting this because you get the weekly US tariff digest from HTS Hero."),
    })
  })
  if (!messages.length) return { batches: 0 }
  const id = await createBatch(db, {
    kind: "tariff_digest",
    title: `Weekly tariff digest · ${period}`,
    // Every event this digest had, for next week's to leave out
    ref: { from, until: end.toISOString(), events: updates.flatMap(({ update, events }) => events.filter((e) => inDigest(update, e)).map((e) => `${update.id}:${e.stage}`)) },
    dedupeKey: `tariff_digest:${start.toISOString().slice(0, 10)}`,
    messages,
  })
  return { batches: id ? 1 : 0 }
}
