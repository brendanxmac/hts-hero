import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/app/api/supabase/server"
import { appUrl, confirmSubscriber, parsePreferences } from "@/libs/email/subscribers"

export const dynamic = "force-dynamic"

// The confirmation link: turns the subscription on (which sends the welcome email), then lands on
// the welcome page: they're subscribed, and the next step, Tariff Alerts. An account turning the
// news on carries its choices in the link.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams
  const token = q.get("token") ?? ""
  const list = (key: string) => (q.get(key) ?? "").split(",").filter(Boolean)
  const prefs = q.has("frequency")
    ? parsePreferences({ frequency: q.get("frequency"), scope: q.get("scope"), authorities: list("authorities"), countries: list("countries") })
    : undefined
  const s = await confirmSubscriber(createAdminClient(), token, prefs)
  if (!s) return NextResponse.redirect(appUrl("/tariff-updates?subscription=invalid"))
  const frequency = prefs?.frequency ?? s.news_frequency
  return NextResponse.redirect(appUrl(`/tariff-digest/welcome?s=confirmed${frequency === "instant" || frequency === "both" ? `&f=${frequency}` : ""}`))
}
