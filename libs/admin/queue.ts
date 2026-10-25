import type { SupabaseClient } from "@supabase/supabase-js"
import { NEWS_ALERTS_FROM } from "../email/news-producer"
import { STALE_HOURS as ADCVD_STALE_HOURS } from "../adcvd/health"
import { SOURCES, type SourceId } from "../tariff-sources/types"

// What needs the admin, from every admin tool, ranked: the /admin home and the 7 a.m. Bangkok
// email (/api/cron/admin-digest) both read this. Three groups:
// - "blocking": nothing moves until the admin acts (updates in review hold back their news email
//   and alerts; impact checks hold back import alerts; digests and trial emails wait in the outbox)
// - "health": something broke (a source failing, a cron stopped, emails failing to send)
// - "whenever": worth doing, but nothing waits on it (old updates in review, today's post ideas)
// An item leaves once it's dealt with; an empty list means nothing needs the admin.

type Db = SupabaseClient

export type QueueGroup = "blocking" | "health" | "whenever"
export type QueueTone = "error" | "warning" | "primary" | "neutral"
// Which tool an item is dealt with in: the admin sidebar's counts
export type AdminArea = "updates" | "outbox" | "adcvd" | "studio"

export interface QueueEntry {
  label: string
  href: string
  meta?: string
}

export interface QueueItem {
  id: string
  group: QueueGroup
  tone: QueueTone
  area: AdminArea
  title: string
  // One line: what happens if it waits, or what's wrong
  detail: string
  action: string
  href: string
  count: number
  // The first few things it's about, each opening straight onto it
  entries?: QueueEntry[]
}

export interface AdminQueue {
  generatedAt: string
  items: QueueItem[]
  // Blocking and health items per tool, for the sidebar
  counts: Record<AdminArea, number>
}

// Sources are collected every hour: this long without a good run is a problem
const SOURCE_STALE_HOURS = 3
const FAILED_EMAIL_DAYS = 7
const SHOWN = 5

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`
const hoursSince = (iso: string, now: Date) => (now.getTime() - new Date(iso).getTime()) / 3_600_000
// "Oct 23", with the year when it isn't this year's
const day = (iso: string) => {
  const d = new Date(iso)
  const thisYear = d.getUTCFullYear() === new Date().getUTCFullYear()
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(thisYear ? {} : { year: "numeric" }), timeZone: "UTC" })
}
const must = <T>(result: { data: T | null; error: { message: string } | null }, what: string): T => {
  if (result.error) throw new Error(`${what}: ${result.error.message}`)
  return (result.data ?? []) as T
}

const updateHref = (id: string) => `/tariff-sources?update=${id}`

// Updates flagged for review. From launch on they hold back their news email and alerts; older
// ones only affect the site's history.
const reviewItems = async (db: Db): Promise<QueueItem[]> => {
  const rows = must<{ id: string; title: string; last_activity_at: string; status: string }[]>(
    await db.from("tariff_updates").select("id, title, last_activity_at, status").eq("needs_review", true).order("last_activity_at", { ascending: false }).limit(500),
    "Loading updates in review"
  )
  const from = NEWS_ALERTS_FROM.slice(0, 10)
  const live = rows.filter((u) => u.last_activity_at >= from)
  const history = rows.filter((u) => u.last_activity_at < from)
  const entries = (list: typeof rows) =>
    list.slice(0, SHOWN).map((u) => ({ label: u.title, href: updateHref(u.id), meta: `${day(u.last_activity_at)}${u.status === "hidden" ? " · hidden" : ""}` }))
  const items: QueueItem[] = []
  if (live.length)
    items.push({
      id: "updates-review",
      group: "blocking",
      tone: "warning",
      area: "updates",
      title: `${plural(live.length, "tariff update")} to review`,
      detail: "No news email or import alerts go out for these until you clear them.",
      action: "Review",
      href: "/tariff-sources?view=review",
      count: live.length,
      entries: entries(live),
    })
  if (history.length)
    items.push({
      id: "updates-review-history",
      group: "whenever",
      tone: "neutral",
      area: "updates",
      title: `${plural(history.length, "older update")} flagged for review`,
      detail: "From before alerts started: they only affect the site's history, never an email.",
      action: "Review",
      href: "/tariff-sources?view=review",
      count: history.length,
      entries: entries(history),
    })
  return items
}

// Published updates from launch on whose impact check hasn't been approved, with imports it
// affects or likely affects: those accounts get no alert until it is. Also /tariff-sources' Review.
export const impactChecksWaiting = async (db: Db) => {
  const updates = must<{ id: string; title: string; last_activity_at: string }[]>(
    await db
      .from("tariff_updates")
      .select("id, title, last_activity_at")
      .eq("status", "published")
      .eq("needs_review", false)
      .neq("kind", "hts_revision")
      .is("impact_approved_at", null)
      .gte("last_activity_at", NEWS_ALERTS_FROM.slice(0, 10))
      .order("last_activity_at", { ascending: false }),
    "Loading impact checks"
  )
  if (!updates.length) return []
  const accounts = new Map<string, Set<string>>()
  for (let from = 0; ; from += 1000) {
    const page = must<{ update_id: string; user_id: string }[]>(
      await db
        .from("tariff_update_impacts")
        .select("update_id, user_id")
        .in("update_id", updates.map((u) => u.id))
        .neq("level", "possible")
        .range(from, from + 999),
      "Loading impacts"
    )
    for (const r of page) accounts.set(r.update_id, (accounts.get(r.update_id) ?? new Set()).add(r.user_id))
    if (page.length < 1000) break
  }
  return updates
    .filter((u) => accounts.get(u.id)?.size)
    .map((u) => ({ ...u, accounts: Array.from(accounts.get(u.id) ?? []) }))
}

const impactItems = async (db: Db): Promise<QueueItem[]> => {
  const waiting = await impactChecksWaiting(db)
  if (!waiting.length) return []
  const people = new Set(waiting.flatMap((u) => u.accounts))
  return [
    {
      id: "impact-checks",
      group: "blocking",
      tone: "warning",
      area: "updates",
      title: `${plural(waiting.length, "impact check")} to approve`,
      detail: `${plural(people.size, "account")} won't get import alerts until you check and approve.`,
      action: "Check and approve",
      href: updateHref(waiting[0].id),
      count: waiting.length,
      entries: waiting.slice(0, SHOWN).map((u) => ({
        label: u.title,
        href: updateHref(u.id),
        meta: `${plural(u.accounts.length, "account")} · ${day(u.last_activity_at)}`,
      })),
    },
  ]
}

const outboxItems = async (db: Db, now: Date): Promise<QueueItem[]> => {
  const [batches, failed] = await Promise.all([
    db.from("email_batches").select("id, title, kind, created_at").eq("status", "pending").order("created_at"),
    db
      .from("email_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("created_at", new Date(now.getTime() - FAILED_EMAIL_DAYS * 86_400_000).toISOString()),
  ])
  const pending = must<{ id: string; title: string; kind: string; created_at: string }[]>(batches, "Loading the outbox")
  const items: QueueItem[] = []
  // Test batches only ever reach the admin: worth clearing, but nothing waits on them
  const real = pending.filter((b) => b.kind !== "test")
  const tests = pending.filter((b) => b.kind === "test")
  const entries = (list: typeof pending) => list.slice(0, SHOWN).map((b) => ({ label: b.title, href: `/email-outbox?batch=${b.id}`, meta: day(b.created_at) }))
  if (real.length)
    items.push({
      id: "outbox",
      group: "blocking",
      tone: "warning",
      area: "outbox",
      title: `${plural(real.length, "email batch", "email batches")} to approve`,
      detail: "Weekly digests and trial emails wait here until you approve or skip them.",
      action: "Open the outbox",
      href: `/email-outbox?batch=${real[0].id}`,
      count: real.length,
      entries: entries(real),
    })
  if (tests.length)
    items.push({
      id: "outbox-tests",
      group: "whenever",
      tone: "neutral",
      area: "outbox",
      title: `${plural(tests.length, "test batch", "test batches")} left in the outbox`,
      detail: "Addressed to you only. Skip them to keep the outbox clear.",
      action: "Clear",
      href: `/email-outbox?batch=${tests[0].id}`,
      count: tests.length,
      entries: entries(tests),
    })
  if (failed.count)
    items.push({
      id: "outbox-failed",
      group: "health",
      tone: "error",
      area: "outbox",
      title: `${plural(failed.count, "message")} failed to send`,
      detail: `In the last ${FAILED_EMAIL_DAYS} days. Each one's error is on its row in the outbox.`,
      action: "See failures",
      href: "/email-outbox?view=failed",
      count: failed.count,
    })
  return items
}

const sourceItems = async (db: Db, now: Date): Promise<QueueItem[]> => {
  const [runsResult, errorsResult] = await Promise.all([
    db.from("tariff_source_runs").select("source, started_at, finished_at, error").order("started_at", { ascending: false }).limit(300),
    db.from("tariff_source_items").select("id", { count: "exact", head: true }).not("process_error", "is", null),
  ])
  const runs = must<{ source: SourceId; started_at: string; finished_at: string | null; error: string | null }[]>(runsResult, "Loading source runs")
  const failing: QueueEntry[] = []
  for (const source of Object.keys(SOURCES) as SourceId[]) {
    const own = runs.filter((r) => r.source === source)
    if (!own.length) continue
    const lastOk = own.find((r) => r.finished_at && !r.error)
    const label = SOURCES[source].label
    if (own[0].error) failing.push({ label, href: "/tariff-sources?view=sources", meta: `Last run failed: ${own[0].error.slice(0, 120)}` })
    else if (!lastOk || hoursSince(lastOk.finished_at!, now) > SOURCE_STALE_HOURS)
      failing.push({ label, href: "/tariff-sources?view=sources", meta: lastOk ? `No good run since ${day(lastOk.finished_at!)}` : "Never collected" })
  }
  const items: QueueItem[] = []
  if (failing.length)
    items.push({
      id: "sources",
      group: "health",
      tone: "error",
      area: "updates",
      title: `${plural(failing.length, "tariff source")} not collecting`,
      detail: "New tariff actions from these sources aren't reaching the site or alerts.",
      action: "Check sources",
      href: "/tariff-sources?view=sources",
      count: failing.length,
      entries: failing,
    })
  if (errorsResult.count)
    items.push({
      id: "source-errors",
      group: "health",
      tone: "error",
      area: "updates",
      title: `${plural(errorsResult.count, "source item")} failed processing`,
      detail: "They weren't read or grouped into an update. Re-sort them to try again.",
      action: "See items",
      href: "/tariff-sources?view=items&failed=1",
      count: errorsResult.count,
    })
  return items
}

const adcvdItems = async (db: Db, now: Date): Promise<QueueItem[]> => {
  const [settings, months] = await Promise.all([
    db.from("adcvd_settings").select("last_cron_at").eq("id", true).maybeSingle(),
    db.from("adcvd_months").select("month, status").in("status", ["error", "paused"]),
  ])
  const items: QueueItem[] = []
  const last = (settings.data as { last_cron_at: string | null } | null)?.last_cron_at
  if (last && hoursSince(last, now) > ADCVD_STALE_HOURS)
    items.push({
      id: "adcvd-cron",
      group: "health",
      tone: "error",
      area: "adcvd",
      title: `The AD/CVD cron hasn't run for ${Math.round(hoursSince(last, now))} hours`,
      detail: "New Commerce and ITC notices aren't being read. Check Vercel's cron logs.",
      action: "Open AD/CVD",
      href: "/adcvd",
      count: 1,
    })
  const stuck = must<{ month: string; status: string }[]>(months, "Loading AD/CVD months")
  if (stuck.length)
    items.push({
      id: "adcvd-months",
      group: "health",
      tone: stuck.some((m) => m.status === "error") ? "error" : "warning",
      area: "adcvd",
      title: `${plural(stuck.length, "AD/CVD month")} stopped part way`,
      detail: "Paused at the AI budget or stopped on an error. Continue them from the Months view.",
      action: "Continue",
      href: "/adcvd?view=months",
      count: stuck.length,
      entries: stuck.map((m) => ({ label: m.month, href: "/adcvd?view=months", meta: m.status === "error" ? "Error" : "Paused at budget" })),
    })
  return items
}

// The latest day's post ideas still unused
const studioItems = async (db: Db): Promise<QueueItem[]> => {
  const latest = await db.from("social_ideas").select("run_on").order("run_on", { ascending: false }).limit(1).maybeSingle()
  const runOn = (latest.data as { run_on: string } | null)?.run_on
  if (!runOn) return []
  const { count } = await db.from("social_ideas").select("id", { count: "exact", head: true }).eq("run_on", runOn).eq("status", "new")
  if (!count) return []
  return [
    {
      id: "studio-ideas",
      group: "whenever",
      tone: "primary",
      area: "studio",
      title: `${plural(count, "post idea")} from ${day(`${runOn}T12:00:00Z`)}`,
      detail: "Ready-made posts from the tariff data. Use one or skip them.",
      action: "Open Content Studio",
      href: "/content-studio",
      count,
    },
  ]
}

const GROUP_ORDER: QueueGroup[] = ["blocking", "health", "whenever"]

// Each tool's part is loaded on its own: one failing shows as a health item, not a broken page
export const loadAdminQueue = async (db: Db, now = new Date()): Promise<AdminQueue> => {
  const parts: [string, AdminArea, Promise<QueueItem[]>][] = [
    ["Tariff updates", "updates", reviewItems(db)],
    ["Impact checks", "updates", impactItems(db)],
    ["Outbox", "outbox", outboxItems(db, now)],
    ["Tariff sources", "updates", sourceItems(db, now)],
    ["AD/CVD", "adcvd", adcvdItems(db, now)],
    ["Content Studio", "studio", studioItems(db)],
  ]
  const settled = await Promise.allSettled(parts.map(([, , p]) => p))
  const items = settled.flatMap((r, i): QueueItem[] =>
    r.status === "fulfilled"
      ? r.value
      : [
          {
            id: `load-${i}`,
            group: "health",
            tone: "error",
            area: parts[i][1],
            title: `Couldn't check ${parts[i][0]}`,
            detail: r.reason instanceof Error ? r.reason.message : String(r.reason),
            action: "Open",
            href: "/admin",
            count: 1,
          },
        ]
  )
  items.sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group))
  const counts: Record<AdminArea, number> = { updates: 0, outbox: 0, adcvd: 0, studio: 0 }
  for (const item of items) if (item.group !== "whenever") counts[item.area] += item.count
  return { generatedAt: now.toISOString(), items, counts }
}
