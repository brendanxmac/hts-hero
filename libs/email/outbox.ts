import type { SupabaseClient } from "@supabase/supabase-js"
import { CreateEmailOptions, Resend } from "resend"
import config from "../../config"
import { renderChat, renderEmail, slackPayload, subjectOf, teamsPayload } from "../../emails/registry"

// The outbox: every message's record, and the review queue for what needs one.
// - Producers call createBatch with every message they want sent. Batches the admin reviews (the
//   weekly digest) wait as "pending"; the rest (autoSend: instant news, onboarding, impact alerts
//   after their impact check is approved) start approved and go with the next send.
// - The admin reviews each rendered message in /email-outbox (and can set the batch's note and
//   subject), then approves or skips the batch.
// - sendApproved sends approved messages (the cron, and right after approval) and records the
//   result on each one.
// - sendTransactional sends at once (confirmations, sign-in links) and records it too.

type Db = SupabaseClient

export type Channel = "email" | "slack" | "teams"

export interface OutboxMessage {
  channel: Channel
  // An email address, or a Slack / Teams webhook URL
  recipient: string
  userId?: string | null
  subscriberId?: string | null
  template: string
  props: Record<string, unknown>
}

export interface NewBatch {
  kind: string
  title: string
  ref?: Record<string, unknown>
  // A producer never makes the same batch twice: "tariff_news:<update>:<stage>"
  dedupeKey?: string
  // Approved at once (no review): sent by the next sendApproved
  autoSend?: boolean
  messages: OutboxMessage[]
}

const must = <T>(result: { data: T | null; error: { message: string } | null }, what: string): T => {
  if (result.error) throw new Error(`${what}: ${result.error.message}`)
  return result.data as T
}

let resendClient: Resend | null = null
export const resend = () => {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set")
  return (resendClient ??= new Resend(process.env.RESEND_API_KEY))
}

// Returns the batch's id, or null when a batch with this dedupe key already exists
export const createBatch = async (db: Db, batch: NewBatch): Promise<string | null> => {
  if (batch.dedupeKey) {
    const existing = must<{ id: string } | null>(
      await db.from("email_batches").select("id").eq("dedupe_key", batch.dedupeKey).maybeSingle(),
      "Checking for an existing batch"
    )
    if (existing) return null
  }
  const created = must<{ id: string }>(
    await db
      .from("email_batches")
      .insert({
        kind: batch.kind,
        title: batch.title,
        ref: batch.ref ?? {},
        dedupe_key: batch.dedupeKey ?? null,
        ...(batch.autoSend ? { status: "approved", approved_at: new Date().toISOString(), approved_by: "auto" } : {}),
      })
      .select("id")
      .single(),
    "Creating a batch"
  )
  const rows = batch.messages.map((m) => ({
    batch_id: created.id,
    channel: m.channel,
    recipient: m.recipient,
    user_id: m.userId ?? null,
    subscriber_id: m.subscriberId ?? null,
    template: m.template,
    props: m.props,
    subject: subjectOf(m.template, m.props),
  }))
  for (let i = 0; i < rows.length; i += 500) {
    must(await db.from("email_messages").upsert(rows.slice(i, i + 500), { onConflict: "batch_id,channel,recipient", ignoreDuplicates: true }), "Adding messages")
  }
  return created.id
}

// A waiting batch's messages made again (the digest after the admin picks its updates): each
// recipient's message takes the new content and keeps its status (one taken out stays out); new
// recipients come in; pending ones no longer in it go (taken-out ones stay, so they stay out)
export const replaceMessages = async (db: Db, batchId: string, messages: OutboxMessage[]) => {
  const keyOf = (m: { channel: string; recipient: string }) => `${m.channel}|${m.recipient}`
  const keep = new Set(messages.map(keyOf))
  const existing = must<{ id: string; channel: string; recipient: string; status: string }[]>(
    await db.from("email_messages").select("id, channel, recipient, status").eq("batch_id", batchId).limit(10_000),
    "Loading the batch's messages"
  )
  const gone = existing.filter((m) => !keep.has(keyOf(m)) && m.status === "pending").map((m) => m.id)
  for (let i = 0; i < gone.length; i += 200) {
    must(await db.from("email_messages").delete().in("id", gone.slice(i, i + 200)), "Removing messages")
  }
  const rows = messages.map((m) => ({
    batch_id: batchId,
    channel: m.channel,
    recipient: m.recipient,
    user_id: m.userId ?? null,
    subscriber_id: m.subscriberId ?? null,
    template: m.template,
    props: m.props,
    subject: subjectOf(m.template, m.props),
  }))
  for (let i = 0; i < rows.length; i += 500) {
    must(await db.from("email_messages").upsert(rows.slice(i, i + 500), { onConflict: "batch_id,channel,recipient" }), "Updating messages")
  }
}

interface MessageRow {
  id: string
  batch_id: string | null
  channel: Channel
  recipient: string
  template: string
  props: Record<string, unknown>
}

// The one-click unsubscribe link a message carries, if any (Gmail and Yahoo require it in the
// headers of bulk mail)
const unsubscribeUrlOf = (props: Record<string, unknown>) => {
  const footer = props.footer as { unsubscribeUrl?: string } | undefined
  return footer?.unsubscribeUrl
}

// Batch kinds sent from the updates domain (config.resend.fromUpdates). Everything else (impact
// alerts on someone's imports, confirmations, welcome, receipts) stays on the notify domain.
const UPDATES_KINDS = new Set(["lifecycle", "tariff_news", "tariff_digest", "marketing"])

const emailOptions = async (m: MessageRow, note: string | null, batchKind: string, batchSubject?: string | null): Promise<CreateEmailOptions> => {
  const { subject, html, text } = await renderEmail(m.template, m.props, note, batchSubject)
  const unsubscribe = unsubscribeUrlOf(m.props)
  return {
    from: UPDATES_KINDS.has(batchKind) ? config.resend.fromUpdates : config.resend.fromAdmin,
    to: m.recipient,
    replyTo: config.resend.replyTo,
    subject,
    html,
    text,
    tags: [
      // Resend tags take letters, numbers, _ and - only ("marketing:launch/Email" has more)
      { name: "template", value: m.template.replace(/[^a-zA-Z0-9_-]/g, "_") },
      { name: "kind", value: batchKind.replace(/[^a-zA-Z0-9_-]/g, "_") },
    ],
    ...(unsubscribe ? { headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } } : {}),
  }
}

const postJson = async (url: string, body: unknown) => {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error(`Webhook answered ${response.status}: ${(await response.text()).slice(0, 200)}`)
}

// `subject` records what went out when the batch's subject replaced the template's
const markSent = (db: Db, id: string, providerId?: string | null, subject?: string) =>
  db
    .from("email_messages")
    .update({ status: "sent", sent_at: new Date().toISOString(), provider_id: providerId ?? null, error: null, ...(subject ? { subject } : {}) })
    .eq("id", id)
const markFailed = (db: Db, id: string, error: unknown) =>
  db.from("email_messages").update({ status: "failed", error: (error instanceof Error ? error.message : String(error)).slice(0, 500) }).eq("id", id)

const EMAIL_CHUNK = 100

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// One chunk through Resend's batch endpoint, waiting out its per-second rate limit (a few tries)
// rather than failing 100 messages. The idempotency key keeps a retry from sending the chunk twice.
const sendChunk = async (options: CreateEmailOptions[], idempotencyKey: string) => {
  for (let attempt = 1; ; attempt++) {
    const { data, error } = await resend().batch.send(options, { idempotencyKey })
    if (!error) return data
    if (error.name !== "rate_limit_exceeded" || attempt >= 4) throw new Error(error.message)
    await pause(1000 * attempt)
  }
}

// Pending messages loaded per round; a batch of any size is worked through round by round
const PAGE = 1000

// Takes these messages for this sender: pending → sending, returning only the ones it got. The cron
// and an approval (or a studio send) can run at once; whichever claims a message sends it, so
// nobody gets it twice.
const claim = async (db: Db, ids: string[]) => {
  const rows = must<{ id: string }[]>(await db.from("email_messages").update({ status: "sending" }).in("id", ids).eq("status", "pending").select("id"), "Claiming messages")
  return new Set(rows.map((r) => r.id))
}

// Sends approved batches' pending messages until `deadline`; batches with nothing left become sent.
// Big batches finish across calls: whatever is still pending at the deadline waits for the next.
export const sendApproved = async (db: Db, { deadline }: { deadline: number }) => {
  const batches = must<{ id: string; kind: string; note: string | null; subject: string | null }[]>(
    await db.from("email_batches").select("id, kind, note, subject").in("status", ["approved", "sending"]).order("approved_at"),
    "Loading approved batches"
  )
  let sent = 0
  let failed = 0
  for (const batch of batches) {
    if (Date.now() > deadline) break
    await db.from("email_batches").update({ status: "sending" }).eq("id", batch.id)
    while (Date.now() < deadline) {
      const messages = must<MessageRow[]>(
        await db.from("email_messages").select("id, batch_id, channel, recipient, template, props").eq("batch_id", batch.id).eq("status", "pending").order("id").limit(PAGE),
        "Loading messages to send"
      )
      if (!messages.length) break
      // Email in chunks through Resend's batch endpoint; Slack and Teams one by one
      const emails = messages.filter((m) => m.channel === "email")
      for (let i = 0; i < emails.length && Date.now() < deadline; i += EMAIL_CHUNK) {
        const mine = await claim(db, emails.slice(i, i + EMAIL_CHUNK).map((m) => m.id))
        const chunk = emails.slice(i, i + EMAIL_CHUNK).filter((m) => mine.has(m.id))
        if (!chunk.length) continue
        try {
          const options = await Promise.all(chunk.map((m) => emailOptions(m, batch.note, batch.kind, batch.subject)))
          const data = await sendChunk(options, `outbox:${batch.id}:${chunk[0].id}:${chunk.length}`)
          await Promise.all(chunk.map((m, j) => markSent(db, m.id, data?.data?.[j]?.id, options[j].subject)))
          sent += chunk.length
        } catch (e) {
          await Promise.all(chunk.map((m) => markFailed(db, m.id, e)))
          failed += chunk.length
        }
      }
      for (const m of messages.filter((m) => m.channel !== "email")) {
        if (Date.now() > deadline) break
        if (!(await claim(db, [m.id])).size) continue
        try {
          const chat = renderChat(m.template, m.props, batch.note)
          await postJson(m.recipient, m.channel === "slack" ? slackPayload(chat) : teamsPayload(chat))
          await markSent(db, m.id)
          sent++
        } catch (e) {
          await markFailed(db, m.id, e)
          failed++
        }
      }
      if (messages.length < PAGE) break
    }
    const { count } = await db.from("email_messages").select("id", { count: "exact", head: true }).eq("batch_id", batch.id).in("status", ["pending", "sending"])
    if (!count) await db.from("email_batches").update({ status: "sent", finished_at: new Date().toISOString() }).eq("id", batch.id)
  }
  return { sent, failed }
}

// Sends one message now (confirmations, receipts, internal notices: they can't wait for review)
// and records it.
export const sendTransactional = async (db: Db, message: Omit<OutboxMessage, "channel">) => {
  const row = must<MessageRow>(
    await db
      .from("email_messages")
      .insert({
        batch_id: null,
        channel: "email",
        recipient: message.recipient,
        user_id: message.userId ?? null,
        subscriber_id: message.subscriberId ?? null,
        template: message.template,
        props: message.props,
        subject: subjectOf(message.template, message.props),
        status: "sending",
      })
      .select("id, batch_id, channel, recipient, template, props")
      .single(),
    "Recording a transactional email"
  )
  try {
    const { data, error } = await resend().emails.send(await emailOptions(row, null, "transactional"))
    if (error) throw new Error(error.message)
    await markSent(db, row.id, data?.id)
  } catch (e) {
    await markFailed(db, row.id, e)
    throw e
  }
}

// The admin's "send me this one": renders a waiting message exactly as it would go, to the admin
// only, marked [Test]. The message itself stays pending.
export const sendTestCopy = async (db: Db, messageId: string, to: string) => {
  const m = must<MessageRow & { batch_id: string | null }>(
    await db.from("email_messages").select("id, batch_id, channel, recipient, template, props").eq("id", messageId).single(),
    "Loading the message"
  )
  const batch = m.batch_id
    ? must<{ note: string | null; kind: string; subject: string | null }>(await db.from("email_batches").select("note, kind, subject").eq("id", m.batch_id).single(), "Loading the batch")
    : { note: null, kind: "test", subject: null }
  const options = await emailOptions({ ...m, recipient: to }, batch.note, batch.kind, batch.subject)
  const { error } = await resend().emails.send({ ...options, subject: `[Test → ${m.recipient}] ${options.subject}` })
  if (error) throw new Error(error.message)
}
