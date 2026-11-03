import type { SupabaseClient } from "@supabase/supabase-js"
import { sendTransactional } from "./outbox"

// The welcome email. It leads with what the account came for, which we learn when the sign-up
// onboarding starts (signup_onboarding.entry_point), so it's sent from there, moments after
// sign-up. Sign-ups that skip the onboarding get it from the 15-minute outbox job, 10 minutes on.
// Once per account: lifecycle_emails' "welcome" row is claimed before sending.

type Db = SupabaseClient

const KEY = "welcome"
const REASON = "You're getting this because you created an HTS Hero account with this email."
const WAIT_MS = 10 * 60 * 1000
const LOOK_BACK_MS = 2 * 24 * 60 * 60 * 1000

export const sendWelcome = async (db: Db, { userId, email, entry }: { userId: string; email: string; entry?: string | null }) => {
  const { error } = await db.from("lifecycle_emails").insert({ user_id: userId, email_key: KEY })
  // Already claimed: the other path got there first
  if (error) return false
  await sendTransactional(db, { recipient: email, userId, template: "welcome", props: { entry: entry ?? null, footer: { reason: REASON } } })
  return true
}

// Accounts from the last two days, past the wait, that never got one
export const sendPendingWelcomes = async (db: Db, now = new Date()) => {
  const { data: accounts, error } = await db
    .from("users")
    .select("id, email")
    .gte("created_at", new Date(now.getTime() - LOOK_BACK_MS).toISOString())
    .lte("created_at", new Date(now.getTime() - WAIT_MS).toISOString())
  if (error) throw new Error(`Loading new accounts: ${error.message}`)
  const ids = (accounts ?? []).map((a) => a.id as string)
  if (!ids.length) return { sent: 0 }
  // The old sign-up webhook's welcomes count too: nothing marks those but the email itself
  const [{ data: claimed }, { data: emailed }, { data: entries }] = await Promise.all([
    db.from("lifecycle_emails").select("user_id").eq("email_key", KEY).in("user_id", ids),
    db.from("email_messages").select("user_id").eq("template", "welcome").in("user_id", ids),
    db.from("signup_onboarding").select("user_id, entry_point").in("user_id", ids),
  ])
  const done = new Set([...(claimed ?? []), ...(emailed ?? [])].map((r) => r.user_id as string))
  const entry = new Map((entries ?? []).map((r) => [r.user_id as string, r.entry_point as string | null]))
  let sent = 0
  for (const account of accounts ?? []) {
    if (done.has(account.id) || !account.email) continue
    try {
      if (await sendWelcome(db, { userId: account.id, email: account.email, entry: entry.get(account.id) })) sent++
    } catch (e) {
      console.error("Failed to send a welcome email:", e)
    }
  }
  return { sent }
}
