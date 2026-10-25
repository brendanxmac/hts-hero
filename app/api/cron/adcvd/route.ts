import { NextRequest, NextResponse } from "next/server"
import { runNew } from "@/libs/adcvd/process"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
// Supabase reads go through fetch: never from Next's data cache (the lookups set their own HTTP caching)
export const fetchCache = "force-no-store"
export const maxDuration = 300

// Every hour (vercel.json), a few minutes after the sources are collected: reads new
// Commerce and ITC notices into AD/CVD cases (libs/adcvd/process.ts), within this month's AI
// budget. Stops starting new work 40 seconds before the limit; the next run picks up the rest.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const db = createAdminClient()
  const run = await runNew(db, { deadline: Date.now() + (maxDuration - 40) * 1000 })
  if (run.results.some((r) => r.log.some((line) => /^Wrote [1-9]/.test(line)))) revalidateTariffUpdates()
  return NextResponse.json(run)
}
