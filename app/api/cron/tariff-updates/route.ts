import { NextRequest, NextResponse } from "next/server"
import { processTariffUpdates } from "@/libs/tariff-updates/process"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Every 15 minutes (vercel.json), after the sources are collected: sort new items, read tariff
// actions and group them into updates. Stops starting new work 40 seconds before the limit;
// whatever is left is picked up by the next run.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const result = await processTariffUpdates(createAdminClient(), { deadline: Date.now() + (maxDuration - 40) * 1000 })
  if (result.grouped) revalidateTariffUpdates()
  return NextResponse.json(result)
}
