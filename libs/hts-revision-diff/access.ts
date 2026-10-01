import { NextResponse } from "next/server"
import { createAdminClient, createClient } from "../../app/api/supabase/server"
import { isRevisionToolEnabled, REVISION_DIFF_ADMIN_EMAIL } from "./constants"

// True when the tool is enabled here and the signed-in user is the admin
export const canUseRevisionTool = async () => {
  if (!isRevisionToolEnabled()) return false
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.email === REVISION_DIFF_ADMIN_EMAIL
}

// For API routes: returns a service-role client, or a 404 response to send.
// 404 (not 403) so the routes look like they don't exist to anyone else.
export const requireRevisionTool = async () => {
  if (!(await canUseRevisionTool())) {
    return {
      db: null,
      denied: NextResponse.json({ error: "Not found" }, { status: 404 }),
    }
  }
  return { db: createAdminClient(), denied: null }
}

export type RevisionDb = ReturnType<typeof createAdminClient>
