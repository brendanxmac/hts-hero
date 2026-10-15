import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"

export const dynamic = "force-dynamic"

// Which of the users' imports the update may affect (tariff_update_impacts), for its review
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { data, error } = await db.from("tariff_update_impacts").select("user_id, product_key, level, delta_usd, computed_at").eq("update_id", params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = data ?? []
  const levels = { confirmed: 0, likely: 0, possible: 0 }
  for (const r of rows) levels[r.level as keyof typeof levels]++
  const accounts = (level?: string) => new Set(rows.filter((r) => !level || r.level === level).map((r) => r.user_id)).size
  return NextResponse.json({
    levels,
    accounts: accounts(),
    alertable: new Set(rows.filter((r) => r.level !== "possible").map((r) => r.user_id)).size,
    deltaUsd: rows.filter((r) => r.level === "confirmed").reduce((sum, r) => sum + Number(r.delta_usd ?? 0), 0),
    computedAt: rows.reduce((latest: string | null, r) => (!latest || r.computed_at > latest ? r.computed_at : latest), null),
  })
}

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
