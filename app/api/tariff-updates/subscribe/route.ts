import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/app/api/supabase/server"
import { isEmail, parsePreferences, subscribe } from "@/libs/email/subscribers"

export const dynamic = "force-dynamic"

// The subscribe form on /tariff-updates: saves the choices and sends a confirmation (or, for an
// address already subscribed, a link to change its choices)
export async function POST(req: NextRequest) {
  const body: Record<string, unknown> | null = await req.json().catch((): null => null)
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 })
  // The hidden field only bots fill in: answer as if it worked
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ status: "confirm_sent" })
  if (!isEmail(body.email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  const source = typeof body.source === "string" ? body.source.slice(0, 60) : "tariff-updates"
  try {
    const status = await subscribe(createAdminClient(), { email: body.email, prefs: parsePreferences(body), source })
    return NextResponse.json({ status })
  } catch (e) {
    console.error("Subscribing to tariff updates:", e)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
