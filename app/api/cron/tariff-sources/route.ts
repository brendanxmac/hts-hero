import { NextRequest, NextResponse } from "next/server"
import { checkAdcvdHealth } from "@/libs/adcvd/health"
import { collectSources } from "@/libs/tariff-sources/collect"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Every hour (vercel.json): collect the latest items from each tariff source. Looks back
// three days so a missed run or a late-posted item is still picked up; stored items are skipped.
// Also emails the admin if the AD/CVD cron has stopped (libs/adcvd/health.ts).
const LOOKBACK_DAYS = 3

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
  const db = createAdminClient()
  const results = await collectSources(db, { since, trigger: "cron" })
  // The AD/CVD cron's health, checked from here so its own failure can't hide it
  await checkAdcvdHealth(db).catch((e) => console.error("AD/CVD health check failed:", e))
  const failed = results.filter((r) => r.error)
  if (failed.length) console.error("Tariff sources failed:", failed)
  return NextResponse.json({ results }, { status: failed.length === results.length ? 500 : 200 })
}
