import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { moveItem, setItemCategory } from "@/libs/tariff-updates/process"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"
import { CATEGORIES, type Category } from "@/libs/tariff-updates/types"

export const dynamic = "force-dynamic"

// Fixes a source item from /tariff-sources: { updateId } moves it to that update (null: an update
// of its own); { category } re-sorts it, so it's read and grouped again on the next run
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const body = await req.json()
  try {
    if ("updateId" in body) {
      const updateId = await moveItem(db, params.id, typeof body.updateId === "string" ? body.updateId : null)
      revalidateTariffUpdates()
      return NextResponse.json({ updateId })
    }
    if (body.category in CATEGORIES) {
      await setItemCategory(db, params.id, body.category as Category)
      revalidateTariffUpdates()
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: "Send updateId or category" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
