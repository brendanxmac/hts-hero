import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/app/api/supabase/server"
import { appUrl, subscriberByToken } from "@/libs/email/subscribers"

export const dynamic = "force-dynamic"

// "Yes, send me the digest" in the Meet the Tariff Tracker email: one click turns the weekly
// digest on (the click is the consent), then shows the subscription page to fine-tune it
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? ""
  const db = createAdminClient()
  const s = await subscriberByToken(db, token)
  if (!s) return NextResponse.redirect(appUrl("/tariff-updates?subscription=invalid"))
  await db
    .from("email_subscribers")
    .update({
      news_frequency: s.news_frequency === "off" ? "weekly" : s.news_frequency,
      confirmed_at: s.confirmed_at ?? new Date().toISOString(),
      unsubscribed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", s.id)
  return NextResponse.redirect(appUrl(`/tariff-updates/subscription?token=${token}&confirmed=1`))
}
