import { NextRequest, NextResponse } from "next/server"
import { sendApproved } from "@/libs/email/outbox"
import { sendPendingWelcomes } from "@/libs/email/welcome"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Every 15 minutes (vercel.json): welcome emails that are due, and what's been approved in the
// outbox and isn't sent yet
// (big batches finish across runs; approval itself sends the first ones right away)
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const db = createAdminClient()
  const welcomes = await sendPendingWelcomes(db).catch((e) => {
    console.error("Failed to send pending welcome emails:", e)
    return { sent: 0 }
  })
  return NextResponse.json({ ...(await sendApproved(db, { deadline: Date.now() + (maxDuration - 30) * 1000 })), welcomes })
}
