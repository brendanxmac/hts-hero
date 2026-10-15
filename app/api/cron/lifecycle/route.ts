import { NextRequest, NextResponse } from "next/server"
import { queueDailyOnboarding } from "@/libs/email/lifecycle"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 120

// Daily at 12:00 UTC (8am Eastern in summer, 7am in winter; vercel.json): the day's onboarding
// emails, as one batch in the outbox for review
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  return NextResponse.json(await queueDailyOnboarding(createAdminClient()))
}
