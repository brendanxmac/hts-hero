import { NextRequest, NextResponse } from "next/server"
import { sendAdminDigest } from "@/libs/admin/digest"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Every day at 00:00 UTC, 7 a.m. in Bangkok (vercel.json): the admin's email of what needs them
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  return NextResponse.json(await sendAdminDigest(createAdminClient()))
}
