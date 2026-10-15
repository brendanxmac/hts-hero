import { notFound } from "next/navigation"
import { NextResponse } from "next/server"
import { createAdminClient, createClient } from "../../app/api/supabase/server"
import { REVISION_DIFF_ADMIN_EMAIL } from "../hts-revision-diff/constants"

// Admin tools that run on the live site as well as locally (/tariff-sources, /email-outbox):
// open to the admin's account only, with no HTS_REVISION_TOOL_ENABLED flag (that one keeps the
// revision checker, which does heavy local work, to local development). Everyone else gets a 404.

export const isAdmin = async () => {
  const {
    data: { user },
  } = await createClient().auth.getUser()
  return user?.email === REVISION_DIFF_ADMIN_EMAIL
}

export const guardAdmin = async () => {
  if (!(await isAdmin())) notFound()
}

export type AdminDb = ReturnType<typeof createAdminClient>

// For API routes: a service-role client, or a 404 to send
export const requireAdmin = async (): Promise<{ db: AdminDb; denied: null } | { db: null; denied: NextResponse }> => {
  if (!(await isAdmin())) return { db: null, denied: NextResponse.json({ error: "Not found" }, { status: 404 }) }
  return { db: createAdminClient(), denied: null }
}
