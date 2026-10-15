import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/app/api/supabase/server"
import { parsePreferences, updatePreferences } from "@/libs/email/subscribers"

export const dynamic = "force-dynamic"

// The manage page's save: the token from the email link is the key
export async function PATCH(req: NextRequest) {
  const body: Record<string, unknown> | null = await req.json().catch((): null => null)
  if (!body || typeof body.token !== "string") return NextResponse.json({ error: "Bad request" }, { status: 400 })
  const s = await updatePreferences(createAdminClient(), body.token, parsePreferences(body))
  if (!s) return NextResponse.json({ error: "This link isn't valid any more." }, { status: 404 })
  return NextResponse.json({ ok: true })
}
