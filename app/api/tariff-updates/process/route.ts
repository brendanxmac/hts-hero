import { NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { processTariffUpdates } from "@/libs/tariff-updates/process"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// "Process now" in /tariff-sources: one run of the tariff updates cron, on demand
export async function POST() {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const result = await processTariffUpdates(db, { deadline: Date.now() + 100_000 })
  if (result.grouped) revalidateTariffUpdates()
  return NextResponse.json(result)
}
