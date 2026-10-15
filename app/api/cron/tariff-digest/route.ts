import { NextRequest, NextResponse } from "next/server"
import { produceWeeklyDigest } from "@/libs/email/news-producer"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 120

// Mondays at 13:00 UTC (9am Eastern; vercel.json): the week's digest, as one batch in the outbox
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  return NextResponse.json(await produceWeeklyDigest(createAdminClient()))
}
