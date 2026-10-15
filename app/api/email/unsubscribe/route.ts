import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/app/api/supabase/server"
import { appUrl, unsubscribe } from "@/libs/email/subscribers"

export const dynamic = "force-dynamic"

// The unsubscribe link in every email: stops everything for that address, then shows its page,
// where it can be turned back on
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? ""
  const s = await unsubscribe(createAdminClient(), token)
  return NextResponse.redirect(s ? appUrl(`/tariff-updates/subscription?token=${token}&unsubscribed=1`) : appUrl("/tariff-updates?subscription=invalid"))
}

// One-click unsubscribe from the inbox itself (RFC 8058, List-Unsubscribe-Post)
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? ""
  await unsubscribe(createAdminClient(), token)
  return new NextResponse("Unsubscribed", { status: 200 })
}
