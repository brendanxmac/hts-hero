import { notFound } from "next/navigation"
import { NextResponse } from "next/server"
import { createAdminClient, createClient } from "../../app/api/supabase/server"
import { REVISION_DIFF_ADMIN_EMAIL } from "../hts-revision-diff/constants"

// The Content Studio (/content-studio) is for the admin only, on the live site as well as locally: unlike the
// revision checker it needs no HTS_REVISION_TOOL_ENABLED flag, since it runs nothing heavy on
// the server (posts render in the browser). Everyone else gets a 404.

const isAdmin = async () => {
  const {
    data: { user },
  } = await createClient().auth.getUser()
  return user?.email === REVISION_DIFF_ADMIN_EMAIL
}

export const guardSocialStudio = async () => {
  if (!(await isAdmin())) notFound()
}

// For API routes: a service-role client, or a 404 to send
export const requireSocialStudio = async (): Promise<
  { db: ReturnType<typeof createAdminClient>; denied: null } | { db: null; denied: NextResponse }
> => {
  if (!(await isAdmin())) return { db: null, denied: NextResponse.json({ error: "Not found" }, { status: 404 }) }
  return { db: createAdminClient(), denied: null }
}
