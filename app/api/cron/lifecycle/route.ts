import { NextRequest, NextResponse } from "next/server"
import { queueAuditsUpsell, queueDailyOnboarding, queueTrialEmails } from "@/libs/email/lifecycle"
import { sendTrialEvents } from "@/libs/tariff-tracker/trialEvents"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 120

// Daily at 12:00 UTC (8am Eastern in summer, 7am in winter; vercel.json): the day's onboarding
// emails, as one batch in the outbox, sent with the next outbox run (no review). Onboarding goes
// first: an account in the trial has imports, so all it can get there is first_look, and that wins
// the day over a trial email, which goes the next morning (one email a day)
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const db = createAdminClient()
  const onboarding = await queueDailyOnboarding(db)
  const trial = await queueTrialEmails(db)
  const upsell = await queueAuditsUpsell(db)
  // Trial Started / Trial Ended in Mixpanel (they have no browser moment to send from)
  const trialEvents = await sendTrialEvents(db).catch((e: Error) => ({ error: e.message }))
  return NextResponse.json({ trial, onboarding, upsell, trialEvents })
}
