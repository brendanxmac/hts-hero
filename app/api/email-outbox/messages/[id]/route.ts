import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { REVISION_DIFF_ADMIN_EMAIL } from "@/libs/hts-revision-diff/constants"
import { sendTestCopy } from "@/libs/email/outbox"
import { renderChat, renderEmail, slackPayload, teamsPayload } from "@/emails/registry"

export const dynamic = "force-dynamic"

// A message exactly as it will go out, with the batch's current note and subject: the email's subject and
// HTML, or the Slack / Teams payload
export async function GET(_req: NextRequest, props0: { params: Promise<{ id: string }> }) {
  const params = await props0.params;
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { data: m, error } = await db.from("email_messages").select("channel, recipient, template, props, batch_id").eq("id", params.id).single()
  if (error || !m) return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 })
  const { data: batch } = m.batch_id ? await db.from("email_batches").select("note, subject").eq("id", m.batch_id).single() : { data: null }
  try {
    if (m.channel === "email") {
      const { subject, html, text } = await renderEmail(m.template, m.props, batch?.note, batch?.subject)
      return NextResponse.json({ channel: m.channel, recipient: m.recipient, subject, html, text })
    }
    const chat = renderChat(m.template, m.props, batch?.note)
    return NextResponse.json({ channel: m.channel, recipient: m.recipient, chat, payload: m.channel === "slack" ? slackPayload(chat) : teamsPayload(chat) })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

// { action: "remove" | "restore" } takes one recipient out of a pending batch or back in;
// "test" sends the admin a copy of this exact email
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { action } = await req.json()
  try {
    if (action === "test") {
      await sendTestCopy(db, params.id, REVISION_DIFF_ADMIN_EMAIL)
      return NextResponse.json({ ok: true, to: REVISION_DIFF_ADMIN_EMAIL })
    }
    if (action !== "remove" && action !== "restore") return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    const [from, to] = action === "remove" ? ["pending", "removed"] : ["removed", "pending"]
    const { error } = await db.from("email_messages").update({ status: to }).eq("id", params.id).eq("status", from)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
