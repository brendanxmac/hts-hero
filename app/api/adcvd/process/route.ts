import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { resetMonth, runMonth } from "@/libs/adcvd/process"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"

export const dynamic = "force-dynamic"
// Supabase reads go through fetch: never from Next's data cache (the lookups set their own HTTP caching)
export const fetchCache = "force-no-store"
export const maxDuration = 300

// "Process" on /adcvd: one run of a month (about 100 seconds). The page calls again while the
// result says there's more to do. { month, reset: true } marks the month's notices unread first.
export async function POST(req: NextRequest) {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { month, reset } = (await req.json().catch(() => ({}))) as { month?: string; reset?: boolean }
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return NextResponse.json({ error: "month must be YYYY-MM" }, { status: 400 })
  if (reset) await resetMonth(db, month)
  const result = await runMonth(db, month, { deadline: Date.now() + 100_000, restart: !!reset })
  if (result.status === "done") revalidateTariffUpdates()
  return NextResponse.json(result)
}
