import { NextRequest, NextResponse } from "next/server"
import { produceInstantNews } from "@/libs/email/news-producer"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 120

// Every 15 minutes (vercel.json), after updates are processed: a batch in the outbox for each new
// tariff update event that instant subscribers want, sent with the next outbox run.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  return NextResponse.json(await produceInstantNews(createAdminClient()))
}
