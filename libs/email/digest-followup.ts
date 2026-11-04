import type { SupabaseClient } from "@supabase/supabase-js"
import type { AlertSampleProps } from "../../emails/kit/parts"
import { getAlertExample } from "../tariff-alerts-example"
import { createBatch } from "./outbox"
import { SUBSCRIBER_COLUMNS, subscriberFooter, type Subscriber } from "./subscribers"

// The digest's follow-up: one email offering Tariff Alerts on their own imports or their clients'
// (DigestAlertsEmail, CTA to /tariff-alerts), on the Tuesday after their first digest, so the
// digest itself always arrives first. Run by the daily lifecycle cron (12:00 UTC), which only
// queues it on Tuesdays. A subscriber is due once a digest has been sent to them (the digest goes
// out Mondays, after its review), or, in a run of quiet weeks with no digest, two weeks after they
// confirmed. Once per subscriber (its message in email_messages is the record), only to subscribers
// without an account (accounts get the onboarding emails instead), still on the news and not
// unsubscribed. Subscribers who confirmed before FOLLOWUP_FROM never get it.

type Db = SupabaseClient

export const FOLLOWUP_FROM = "2026-11-04T00:00:00Z"
const DAY = 86_400_000
const TUESDAY = 2
// No digest yet this long after confirming (weeks with no updates): send it anyway
const NO_DIGEST_DAYS = 14
// Confirmed longer ago than this and still not sent (the cron was down): let go rather than late
const UNTIL_DAYS = 35
const TEMPLATE = "digest_alerts"
const REASON = "You're getting this because you subscribed to the weekly US tariff digest from HTS Hero."

// The /tariff-alerts page's worked example, drawn small in the email; none if it can't be built
const exampleAlert = async (): Promise<AlertSampleProps | null> => {
  const example = await getAlertExample().catch((): null => null)
  const row = example?.rows[0]
  if (!example || !row) return null
  return {
    label: "Example alert",
    updateTitle: `${example.program}: ${example.title}`,
    code: row.htsno,
    country: row.country,
    description: row.name,
    beforePct: row.beforePct,
    afterPct: row.afterPct,
  }
}

// The subscribers among `ids` that a weekly digest has been sent to
const digestSent = async (db: Db, ids: string[]) => {
  const got = new Set<string>()
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await db
      .from("email_messages")
      .select("subscriber_id")
      .eq("template", "tariff_digest")
      .eq("status", "sent")
      .in("subscriber_id", ids.slice(i, i + 200))
    if (error) throw new Error(`Checking digests sent: ${error.message}`)
    for (const r of data ?? []) got.add(r.subscriber_id as string)
  }
  return got
}

export const queueDigestFollowups = async (db: Db, now = new Date()) => {
  if (now.getUTCDay() !== TUESDAY) return { queued: 0, skipped: "not Tuesday" }
  // Confirmed at least a day ago, so at least one Monday digest could have reached them
  const latest = new Date(now.getTime() - DAY).toISOString()
  const earliest = new Date(Math.max(Date.parse(FOLLOWUP_FROM), now.getTime() - UNTIL_DAYS * DAY)).toISOString()
  const { data, error } = await db
    .from("email_subscribers")
    .select(SUBSCRIBER_COLUMNS)
    .is("user_id", null)
    .is("unsubscribed_at", null)
    .neq("news_frequency", "off")
    .eq("lifecycle", true)
    .gte("confirmed_at", earliest)
    .lte("confirmed_at", latest)
    .limit(5000)
  if (error) throw new Error(`Loading digest subscribers: ${error.message}`)
  const candidates = (data ?? []) as Subscriber[]
  if (!candidates.length) return { queued: 0 }

  const sent = new Set<string>()
  for (let i = 0; i < candidates.length; i += 200) {
    const { data: rows, error: sentError } = await db
      .from("email_messages")
      .select("subscriber_id")
      .eq("template", TEMPLATE)
      .in("subscriber_id", candidates.slice(i, i + 200).map((s) => s.id))
    if (sentError) throw new Error(`Checking digest follow-ups sent: ${sentError.message}`)
    for (const r of rows ?? []) sent.add(r.subscriber_id as string)
  }
  const unsent = candidates.filter((s) => !sent.has(s.id))
  if (!unsent.length) return { queued: 0 }
  const hadDigest = await digestSent(db, unsent.map((s) => s.id))
  const quietSince = now.getTime() - NO_DIGEST_DAYS * DAY
  const due = unsent.filter((s) => hadDigest.has(s.id) || Date.parse(s.confirmed_at!) < quietSince)
  if (!due.length) return { queued: 0 }

  const example = await exampleAlert()
  const today = now.toISOString().slice(0, 10)
  const batchId = await createBatch(db, {
    kind: "lifecycle",
    title: `Digest follow-up · ${today} · ${due.length} email${due.length === 1 ? "" : "s"}`,
    ref: { date: today, kind: "digest_followup" },
    dedupeKey: `digest_followup:${today}`,
    autoSend: true,
    messages: due.map((s) => ({
      channel: "email",
      recipient: s.email,
      subscriberId: s.id,
      template: TEMPLATE,
      props: { example, footer: subscriberFooter(s, REASON) },
    })),
  })
  return { queued: batchId ? due.length : 0 }
}
