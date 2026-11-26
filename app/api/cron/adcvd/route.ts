import { NextRequest, NextResponse } from "next/server"
import { runNew } from "@/libs/adcvd/process"
import { progressLog, runClient, withHardStop } from "@/libs/adcvd/run"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
// Supabase reads go through fetch: never from Next's data cache (the lookups set their own HTTP caching)
export const fetchCache = "force-no-store"
// Vercel's limit (Fluid compute's most on Pro). The run itself is done long before: this is room
// for anything slow, so the function is never killed partway.
export const maxDuration = 800

// No new work starts after this (each step checks it; outside requests stop at it)
const WORK_MS = 260_000
// Anything still going is cut off here (libs/adcvd/run.ts) and the route answers
const HARD_STOP_MS = 330_000

// Every hour (vercel.json), a few minutes after the sources are collected: reads new
// Commerce and ITC notices into AD/CVD cases (libs/adcvd/process.ts), within this month's AI
// budget. Whatever a run doesn't finish, the next run picks up.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const started = Date.now()
  const progress = progressLog(started)
  const run = await withHardStop(HARD_STOP_MS, (stop) => runNew(runClient(stop), { deadline: started + WORK_MS, progress }))

  if (!run) {
    // Cut short. Saved beside the last full run (last_cron_at stays as it was, so runs that keep
    // getting cut short still raise the "cron stopped" email after a few hours).
    console.warn(`[adcvd] Hard stop after ${Math.round((Date.now() - started) / 1000)}s: ${progress.lines.join(" · ")}`)
    const db = createAdminClient()
    const { data } = await db.from("adcvd_settings").select("last_cron").eq("id", true).maybeSingle()
    const stoppedEarly = { at: new Date(started).toISOString(), progress: progress.lines }
    await db
      .from("adcvd_settings")
      .update({ last_cron: { ...((data?.last_cron as Record<string, unknown> | null) ?? {}), stopped_early: stoppedEarly } })
      .eq("id", true)
    return NextResponse.json({ stoppedEarly })
  }

  if (run.results.some((r) => r.log.some((line) => /^Wrote [1-9]/.test(line)))) revalidateTariffUpdates()
  return NextResponse.json(run)
}
