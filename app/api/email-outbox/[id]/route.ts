import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { REVISION_DIFF_ADMIN_EMAIL } from "@/libs/hts-revision-diff/constants"
import { sendApproved } from "@/libs/email/outbox"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// One batch and its messages, for review
export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const [batch, messages] = await Promise.all([
    db.from("email_batches").select("*").eq("id", params.id).single(),
    db.from("email_messages").select("id, channel, recipient, subject, status, error, sent_at, user_id, subscriber_id").eq("batch_id", params.id).order("created_at").limit(5000),
  ])
  if (batch.error) return NextResponse.json({ error: batch.error.message }, { status: 404 })
  return NextResponse.json({ batch: batch.data, messages: messages.data ?? [] })
}

// The note at the top of every message in the batch
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { note } = await req.json()
  const { error } = await db
    .from("email_batches")
    .update({ note: typeof note === "string" && note.trim() ? note.trim() : null })
    .eq("id", params.id)
    .eq("status", "pending")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// { action: "approve" } sends it now (what's left goes with the next cron run); "skip" drops it;
// "reopen" puts a skipped batch back for review
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { action } = await req.json()
  const now = new Date().toISOString()
  const change =
    action === "approve"
      ? { from: "pending", to: { status: "approved", approved_at: now, approved_by: REVISION_DIFF_ADMIN_EMAIL } }
      : action === "skip"
        ? { from: "pending", to: { status: "skipped", finished_at: now } }
        : action === "reopen"
          ? { from: "skipped", to: { status: "pending", finished_at: null } }
          : null
  if (!change) return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  const { data, error } = await db.from("email_batches").update(change.to).eq("id", params.id).eq("status", change.from).select("id")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data?.length) return NextResponse.json({ error: `This batch isn't ${change.from} any more` }, { status: 409 })
  const result = action === "approve" ? await sendApproved(db, { deadline: Date.now() + 45_000 }) : null
  return NextResponse.json({ ok: true, result })
}
