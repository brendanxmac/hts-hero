import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { REVISION_DIFF_ADMIN_EMAIL } from "@/libs/hts-revision-diff/constants"
import { draftTestNewsBatch } from "@/libs/email/tariff-news"

export const dynamic = "force-dynamic"

// The outbox's batches, newest first, with how many messages each holds and how they stand
export async function GET() {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { data: batches, error } = await db.from("email_batches").select("*").order("created_at", { ascending: false }).limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const ids = (batches ?? []).map((b) => b.id)
  const { data: messages } = ids.length
    ? await db.from("email_messages").select("batch_id, channel, status").in("batch_id", ids)
    : { data: [] }
  const counts = new Map<string, Record<string, number>>()
  for (const m of messages ?? []) {
    const c = counts.get(m.batch_id) ?? {}
    c[m.status] = (c[m.status] ?? 0) + 1
    c[`channel_${m.channel}`] = (c[`channel_${m.channel}`] ?? 0) + 1
    counts.set(m.batch_id, c)
  }
  return NextResponse.json({ batches: (batches ?? []).map((b) => ({ ...b, counts: counts.get(b.id) ?? {} })) })
}

// { action: "draft-test", updateId }: a news alert for that update, addressed to the admin only
export async function POST(req: NextRequest) {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const body = await req.json()
  if (body.action !== "draft-test" || typeof body.updateId !== "string") return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  try {
    const id = await draftTestNewsBatch(db, body.updateId, REVISION_DIFF_ADMIN_EMAIL)
    return NextResponse.json({ id })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
