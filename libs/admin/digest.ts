import type { SupabaseClient } from "@supabase/supabase-js"
import { sendTransactional } from "../email/outbox"
import { REVISION_DIFF_ADMIN_EMAIL } from "../hts-revision-diff/constants"
import { loadAdminQueue } from "./queue"

// The admin's morning email: what needs them today (libs/admin/queue.ts), sent at 7 a.m. Bangkok
// by /api/cron/admin-digest, or at once from /admin's "Email me this". Sent every day, empty or
// not, so a missing email means the cron itself has stopped.

export const ADMIN_TIME_ZONE = "Asia/Bangkok"

export const sendAdminDigest = async (db: SupabaseClient, now = new Date()) => {
  const queue = await loadAdminQueue(db, now)
  const day = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: ADMIN_TIME_ZONE })
  await sendTransactional(db, {
    recipient: REVISION_DIFF_ADMIN_EMAIL,
    template: "admin_digest",
    props: {
      day,
      items: queue.items.map(({ group, tone, title, detail, action, href, entries }) => ({ group, tone, title, detail, action, href, entries })),
    },
  })
  return { items: queue.items.length }
}
