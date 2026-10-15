import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"

export const dynamic = "force-dynamic"

// Edits an update from /tariff-sources: its title and summary (kept from then on), whether it's
// published, and its review flag
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const body = await req.json()
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim()
  if (typeof body.summary === "string" && body.summary.trim()) patch.summary = body.summary.trim()
  if (patch.title || patch.summary) patch.edited = true
  if (body.status === "published" || body.status === "hidden") patch.status = body.status
  if (typeof body.needs_review === "boolean") patch.needs_review = body.needs_review
  if (body.needs_review === false) patch.review_notes = null
  const { error } = await db.from("tariff_updates").update(patch).eq("id", params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTariffUpdates()
  return NextResponse.json({ ok: true })
}
