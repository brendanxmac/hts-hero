import { NextRequest, NextResponse } from "next/server"
import { queueDailyOnboarding, queueTrialEmails } from "@/libs/email/lifecycle"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 120

// Daily at 12:00 UTC (8am Eastern in summer, 7am in winter; vercel.json): the day's onboarding
// emails, as one batch in the outbox, sent with the next outbox run (no review). The free trial's
// emails go first, so on a day both are due the trial's wins (one email a day)
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const db = createAdminClient()
  const trial = await queueTrialEmails(db)
  const onboarding = await queueDailyOnboarding(db)
  return NextResponse.json({ trial, onboarding })
}
