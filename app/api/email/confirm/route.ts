import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/app/api/supabase/server"
import { appUrl, confirmSubscriber } from "@/libs/email/subscribers"

export const dynamic = "force-dynamic"

// The confirmation link: turns the subscription on, then shows its page (with what to do next)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? ""
  const s = await confirmSubscriber(createAdminClient(), token)
  return NextResponse.redirect(s ? appUrl(`/tariff-updates/subscription?token=${token}&confirmed=1`) : appUrl("/tariff-updates?subscription=invalid"))
}
