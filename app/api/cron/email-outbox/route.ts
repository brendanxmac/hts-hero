import { NextRequest, NextResponse } from "next/server"
import { sendApproved } from "@/libs/email/outbox"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Every 15 minutes (vercel.json): sends what's been approved in the outbox and isn't sent yet
// (big batches finish across runs; approval itself sends the first ones right away)
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  return NextResponse.json(await sendApproved(createAdminClient(), { deadline: Date.now() + (maxDuration - 30) * 1000 }))
}
