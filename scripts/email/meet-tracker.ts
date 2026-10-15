// Queues the one-time "Meet the Tariff Tracker" email for every account from before onboarding
// emails started (libs/email/lifecycle.ts ONBOARDING_FROM) that hasn't had it, as one batch in
// /email-outbox, sent with the next outbox run (every 5 minutes) without review.
//
//   npm run email:meet-tracker

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const { queueMeetTracker } = await import("../../libs/email/lifecycle")
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { queued } = await queueMeetTracker(db)
  console.log(queued ? `Queued ${queued} emails; they send with the next outbox run.` : "Nothing to queue: every existing account has had it.")
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
