import { NextRequest, NextResponse } from "next/server"
import { getHtsElementsServer } from "@/libs/hts-server"
import { refreshSnapshots } from "@/libs/tariff-tracker/snapshot"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Daily at 11:00 UTC, an hour before the onboarding batch (vercel.json): every catalog's numbers,
// worked out on the server (libs/tariff-tracker/snapshot.ts). Anything left over is done on the
// next run.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const htsElements = await getHtsElementsServer()
  return NextResponse.json(await refreshSnapshots(createAdminClient(), htsElements, { deadline: Date.now() + (maxDuration - 40) * 1000 }))
}
