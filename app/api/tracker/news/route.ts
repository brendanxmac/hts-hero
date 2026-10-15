import { NextRequest, NextResponse } from "next/server"
import { createAdminClient, createClient } from "@/app/api/supabase/server"
import { accountSubscriber, parsePreferences } from "@/libs/email/subscribers"

export const dynamic = "force-dynamic"

const signedInUser = async () => {
  const {
    data: { user },
  } = await createClient().auth.getUser()
  return user?.email ? { userId: user.id, email: user.email } : null
}

// The signed-in user's tariff news choices, for the Tracker's Alerts section
export async function GET() {
  const user = await signedInUser()
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 })
  const s = await accountSubscriber(createAdminClient(), user)
  return NextResponse.json({
    frequency: s.unsubscribed_at ? "off" : s.news_frequency,
    scope: s.news_scope,
    authorities: s.news_authorities,
    countries: s.news_countries,
  })
}

export async function PATCH(req: NextRequest) {
  const user = await signedInUser()
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 })
  const body: Record<string, unknown> | null = await req.json().catch((): null => null)
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 })
  const db = createAdminClient()
  const s = await accountSubscriber(db, user)
  const p = parsePreferences(body)
  const { error } = await db
    .from("email_subscribers")
    .update({
      news_frequency: p.frequency,
      news_scope: p.scope,
      news_authorities: p.authorities,
      news_countries: p.countries,
      // Choosing updates here turns email back on after an unsubscribe
      unsubscribed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", s.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
