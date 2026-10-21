import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"

export const dynamic = "force-dynamic"
// Supabase reads go through fetch: never from Next's data cache (the lookups set their own HTTP caching)
export const fetchCache = "force-no-store"

// The AI budget per month of notices (/adcvd)
export async function PATCH(req: NextRequest) {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { monthly_budget_usd } = (await req.json().catch(() => ({}))) as { monthly_budget_usd?: number }
  const budget = Number(monthly_budget_usd)
  if (!Number.isFinite(budget) || budget < 0 || budget > 500) return NextResponse.json({ error: "The budget must be between $0 and $500" }, { status: 400 })
  const { error } = await db.from("adcvd_settings").upsert({ id: true, monthly_budget_usd: budget, updated_at: new Date().toISOString() })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ monthly_budget_usd: budget })
}
