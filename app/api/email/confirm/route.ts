import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/app/api/supabase/server"
import { appUrl, confirmSubscriber, parsePreferences } from "@/libs/email/subscribers"

export const dynamic = "force-dynamic"

// The confirmation link: turns the subscription on, then shows its page (with what to do next).
// An account turning the news on carries its choices in the link.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams
  const token = q.get("token") ?? ""
  const list = (key: string) => (q.get(key) ?? "").split(",").filter(Boolean)
  const prefs = q.has("frequency")
    ? parsePreferences({ frequency: q.get("frequency"), scope: q.get("scope"), authorities: list("authorities"), countries: list("countries") })
    : undefined
  const s = await confirmSubscriber(createAdminClient(), token, prefs)
  return NextResponse.redirect(s ? appUrl(`/tariff-updates/subscription?token=${token}&confirmed=1`) : appUrl("/tariff-updates?subscription=invalid"))
}
