import type { SupabaseClient } from "@supabase/supabase-js"
import config from "../../config"
import { MARKETING_PREFIX, MARKETING_PREVIEW_FOOTER } from "../../emails/kit/marketing"
import { MARKETING_EMAILS } from "../../emails/marketing/manifest.generated"
import { renderEmail } from "../../emails/registry"
import { ACCOUNT_REASON, reachable, subscribersFor } from "./lifecycle"
import { createBatch, resend, sendApproved, type OutboxMessage } from "./outbox"
import { SUBSCRIBER_COLUMNS, subscriberFooter, type Subscriber } from "./subscribers"

// Marketing emails from the Content Studio: the files under emails/marketing/, who can get them,
// and sending one. A send is an outbox batch (kind "marketing"), approved at once and sent right
// away (what's left goes with the next outbox cron), so it shows in /email-outbox like every other.
// Nobody gets the same marketing email twice: whoever already has it (sent or on its way) is left
// out, so sending it again only reaches people who joined since.

type Db = SupabaseClient

// users: every account with an email, minus only those who unsubscribed (the unsubscribe link in
// every email sets that, so they're never sent another). Accounts with no subscription row yet
// (most of those from before subscriptions existed) get one as it sends, for their unsubscribe link.
// accounts: the same, also minus anyone who turned account emails off (as the Duty Guard launch).
// news: confirmed tariff-news subscribers. everyone: all users and news subscribers, once per address.
export type Audience = "users" | "accounts" | "news" | "everyone"
export const AUDIENCES: Audience[] = ["users", "accounts", "news", "everyone"]

const NEWS_REASON = "You're getting this because you subscribed to US tariff updates from HTS Hero."
const PAGE = 1000

export interface MarketingEmailInfo {
  file: string
  campaign: string
  name: string
  subject: string
  preview: string
}

export const listMarketingEmails = (): MarketingEmailInfo[] =>
  Object.entries(MARKETING_EMAILS).map(([file, mod]) => {
    const parts = file.split("/")
    return {
      file,
      campaign: parts.length > 1 ? parts.slice(0, -1).join("/") : "",
      name: parts[parts.length - 1],
      subject: mod.subject ?? "",
      preview: mod.preview ?? "",
    }
  })

export const isMarketingFile = (file: unknown): file is string => typeof file === "string" && file in MARKETING_EMAILS

const templateOf = (file: string) => `${MARKETING_PREFIX}${file}`

interface Recipient {
  email: string
  userId: string | null
  // null only when counting: an account whose row sending would make
  subscriber: Subscriber | null
  reason: string
}

const pages = async <T,>(load: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>, what: string) => {
  const all: T[] = []
  for (let page = 0; ; page++) {
    const { data, error } = await load(page * PAGE, (page + 1) * PAGE - 1)
    if (error) throw new Error(`${what}: ${error.message}`)
    all.push(...(data ?? []))
    if (!data || data.length < PAGE) return all
  }
}

// Accounts that can get it. Sending (create) makes the missing subscription rows; counting
// doesn't, and counts an account with no row yet as one that will get it (a new row is on).
interface Account {
  id: string
  email: string
  created_at: string
}

// Every account: the users table, plus any Supabase sign-in (auth.users) missing from it, so a
// failed sign-up trigger never keeps someone off the list. Auth-only sign-ins count once their
// email is confirmed (an unconfirmed address may not be theirs, or may bounce).
const allAccounts = async (db: Db): Promise<Account[]> => {
  const rows = await pages<{ id: string; email: string | null; created_at: string }>((a, b) => db.from("users").select("id, email, created_at").order("created_at").range(a, b), "Loading accounts")
  const byId = new Map<string, Account>()
  for (const r of rows) if (r.email) byId.set(r.id, { id: r.id, email: r.email, created_at: r.created_at })
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: PAGE })
    if (error) throw new Error(`Loading sign-ins: ${error.message}`)
    for (const u of data.users) {
      if (!byId.has(u.id) && u.email && u.email_confirmed_at) byId.set(u.id, { id: u.id, email: u.email, created_at: u.created_at })
    }
    if (data.users.length < PAGE) break
  }
  return Array.from(byId.values())
}

const accountRecipients = async (db: Db, mode: "users" | "accounts", create: boolean) => {
  const accounts = await allAccounts(db)
  const allowed = (s: Subscriber) => (mode === "users" ? !s.unsubscribed_at : reachable(s))
  const out: Recipient[] = []
  for (let i = 0; i < accounts.length; i += 200) {
    const part = accounts.slice(i, i + 200)
    let subs: Map<string, Subscriber>
    if (create) subs = await subscribersFor(db, part)
    else {
      const { data, error } = await db.from("email_subscribers").select(SUBSCRIBER_COLUMNS).in("user_id", part.map((a) => a.id))
      if (error) throw new Error(`Loading subscriptions: ${error.message}`)
      subs = new Map(((data ?? []) as Subscriber[]).map((s) => [s.user_id!, s]))
    }
    for (const a of part) {
      const s = subs.get(a.id)
      if (s ? allowed(s) : !create) out.push({ email: a.email, userId: a.id, subscriber: s ?? null, reason: ACCOUNT_REASON })
    }
  }
  return out
}

const newsRecipients = async (db: Db): Promise<Recipient[]> => {
  const subs = await pages<Subscriber>(
    (a, b) => db.from("email_subscribers").select(SUBSCRIBER_COLUMNS).not("confirmed_at", "is", null).is("unsubscribed_at", null).neq("news_frequency", "off").order("created_at").range(a, b),
    "Loading subscribers"
  )
  return subs.map((s) => ({ email: s.email, userId: s.user_id, subscriber: s, reason: NEWS_REASON }))
}

// Addresses that already have this email, sent or on its way (under its old template name too)
const alreadyHave = async (db: Db, file: string) => {
  const rows = await pages<{ recipient: string }>(
    (a, b) =>
      db
        .from("email_messages")
        .select("recipient")
        .in("template", [templateOf(file), ...(MARKETING_EMAILS[file].alsoSentAs ?? [])])
        .in("status", ["pending", "sending", "sent"])
        .range(a, b),
    "Loading who has it"
  )
  return new Set(rows.map((r) => r.recipient.toLowerCase()))
}

const audienceOf = async (db: Db, audience: Audience, file: string, create: boolean) => {
  const accountMode = audience === "accounts" ? "accounts" : "users"
  const [accounts, news, have] = await Promise.all([
    audience === "news" ? [] : accountRecipients(db, accountMode, create),
    audience === "news" || audience === "everyone" ? newsRecipients(db) : [],
    alreadyHave(db, file),
  ])
  // Accounts first, so someone with both is told it's for their account
  const seen = new Set<string>()
  const todo: Recipient[] = []
  let alreadySent = 0
  for (const r of [...accounts, ...news]) {
    const key = r.email.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    if (have.has(key)) alreadySent++
    else todo.push(r)
  }
  return { todo, alreadySent }
}

// How many each audience would reach now, and how many of it already have this email
export const audienceCounts = async (db: Db, file: string) => {
  const entries = await Promise.all(
    AUDIENCES.map(async (a) => {
      const { todo, alreadySent } = await audienceOf(db, a, file, false)
      return [a, { willGet: todo.length, alreadySent }] as const
    })
  )
  return Object.fromEntries(entries) as Record<Audience, { willGet: number; alreadySent: number }>
}

export interface Draft {
  file: string
  subject: string
  preview: string
}

const propsOf = (d: Draft, footer: unknown) => ({ footer, subject: d.subject, preview: d.preview })

export const renderMarketingPreview = (d: Draft) => renderEmail(templateOf(d.file), propsOf(d, MARKETING_PREVIEW_FOOTER))

// One copy to the admin, marked [Test], recorded nowhere
export const sendMarketingTest = async (d: Draft, to: string) => {
  const { subject, html, text } = await renderMarketingPreview(d)
  const { error } = await resend().emails.send({ from: config.resend.fromUpdates, to, replyTo: config.resend.replyTo, subject: `[Test] ${subject}`, html, text })
  if (error) throw new Error(error.message)
}

// Queues it for the whole audience as one approved outbox batch, then sends until `deadline`.
// Any size works: what's left when time runs out goes with the outbox cron (every 15 minutes,
// about four minutes of sending each run) until the batch is done.
export const sendMarketing = async (db: Db, d: Draft, audience: Audience, { deadline }: { deadline: number }) => {
  const { todo, alreadySent } = await audienceOf(db, audience, d.file, true)
  const ready = todo.filter((r): r is Recipient & { subscriber: Subscriber } => !!r.subscriber)
  if (!ready.length) return { queued: 0, alreadySent, sent: 0, failed: 0 }
  const messages: OutboxMessage[] = ready.map((r) => ({
    channel: "email",
    recipient: r.email,
    userId: r.userId,
    subscriberId: r.subscriber.id,
    template: templateOf(d.file),
    props: propsOf(d, subscriberFooter(r.subscriber, r.reason)),
  }))
  const batchId = await createBatch(db, {
    kind: "marketing",
    title: `${d.subject} · ${messages.length} ${messages.length === 1 ? "person" : "people"}`,
    ref: { file: d.file, audience },
    autoSend: true,
    messages,
  })
  await sendApproved(db, { deadline })
  // This batch's progress (the sender may also have finished other approved batches)
  const countOf = async (status: string) => {
    const { count } = await db.from("email_messages").select("id", { count: "exact", head: true }).eq("batch_id", batchId!).eq("status", status)
    return count ?? 0
  }
  const [sent, failed] = await Promise.all([countOf("sent"), countOf("failed")])
  return { queued: messages.length, alreadySent, sent, failed }
}
