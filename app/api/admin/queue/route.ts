import { NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { sendAdminDigest } from "@/libs/admin/digest"
import { loadAdminQueue } from "@/libs/admin/queue"

export const dynamic = "force-dynamic"

// What needs the admin (libs/admin/queue.ts): the admin sidebar's counts. Everyone else gets a 404.
export async function GET() {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  return NextResponse.json(await loadAdminQueue(db))
}

// "Email me this": the morning email, now
export async function POST() {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  try {
    return NextResponse.json(await sendAdminDigest(db))
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Couldn't send it" }, { status: 500 })
  }
}
