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
const resend = () => {
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

const emailOptions = async (m: MessageRow, note: string | null, batchKind: string, batchSubject?: string | null): Promise<CreateEmailOptions> => {
  const { subject, html, text } = await renderEmail(m.template, m.props, note, batchSubject)
  const unsubscribe = unsubscribeUrlOf(m.props)
  return {
    from: config.resend.fromAdmin,
    to: m.recipient,
    replyTo: config.resend.supportEmail,
    subject,
    html,
    text,
    tags: [
      { name: "template", value: m.template },
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

// Sends approved batches' pending messages until `deadline`; batches with nothing left become sent
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
    const messages = must<MessageRow[]>(
      await db.from("email_messages").select("id, batch_id, channel, recipient, template, props").eq("batch_id", batch.id).eq("status", "pending").limit(1000),
      "Loading messages to send"
    )
    // Email in chunks through Resend's batch endpoint; Slack and Teams one by one
    const emails = messages.filter((m) => m.channel === "email")
    for (let i = 0; i < emails.length && Date.now() < deadline; i += EMAIL_CHUNK) {
      const chunk = emails.slice(i, i + EMAIL_CHUNK)
      await db.from("email_messages").update({ status: "sending" }).in("id", chunk.map((m) => m.id))
      try {
        const options = await Promise.all(chunk.map((m) => emailOptions(m, batch.note, batch.kind, batch.subject)))
        const { data, error } = await resend().batch.send(options)
        if (error) throw new Error(error.message)
        await Promise.all(chunk.map((m, j) => markSent(db, m.id, data?.data?.[j]?.id, options[j].subject)))
        sent += chunk.length
      } catch (e) {
        await Promise.all(chunk.map((m) => markFailed(db, m.id, e)))
        failed += chunk.length
      }
    }
    for (const m of messages.filter((m) => m.channel !== "email")) {
      if (Date.now() > deadline) break
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
    const { count } = await db.from("email_messages").select("id", { count: "exact", head: true }).eq("batch_id", batch.id).in("status", ["pending", "sending"])
    if (!count) await db.from("email_batches").update({ status: "sent", finished_at: new Date().toISOString() }).eq("id", batch.id)
  }
  return { sent, failed }
}

// Sends one message now (confirmations, receipts, internal notices: they can't wait for review)
// and records it. `replyTo` overrides support@ (an internal notice replies to the person).
export const sendTransactional = async (db: Db, message: Omit<OutboxMessage, "channel">, { replyTo }: { replyTo?: string } = {}) => {
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
    const options = await emailOptions(row, null, "transactional")
    const { data, error } = await resend().emails.send(replyTo ? { ...options, replyTo } : options)
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
