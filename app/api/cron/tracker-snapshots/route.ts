import { NextRequest, NextResponse } from "next/server"
import { getHtsElementsServer } from "@/libs/hts-server"
import { refreshSnapshots } from "@/libs/tariff-tracker/snapshot"
import { refreshImpacts } from "@/libs/tariff-updates/impacts"
import { sendConfirmations } from "@/libs/tariff-updates/alerts"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Daily at 11:00 UTC, an hour before the onboarding batch (vercel.json): every catalog's numbers
// (libs/tariff-tracker/snapshot.ts), then which imports each recent tariff update may affect
// (libs/tariff-updates/impacts.ts), then alerts for imports those now confirm after an earlier
// "may apply" alert (libs/tariff-updates/alerts.ts). Anything left over is done on the next run.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const db = createAdminClient()
  const htsElements = await getHtsElementsServer()
  const end = Date.now() + (maxDuration - 40) * 1000
  // Snapshots get two thirds of the time, impacts the rest
  const snapshots = await refreshSnapshots(db, htsElements, { deadline: Date.now() + ((end - Date.now()) * 2) / 3 })
  const impacts = await refreshImpacts(db, htsElements, { deadline: end - 30_000 })
  const confirmations = await sendConfirmations(db, htsElements, { deadline: end })
  return NextResponse.json({ snapshots, impacts, confirmations })
}
