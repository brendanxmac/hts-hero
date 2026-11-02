// Queues the one-time "Duty Guard is Live!" email for every account that hasn't had it (skipping
// anyone who unsubscribed or turned these emails off), as one batch held for review in
// /email-outbox. Nothing sends until the batch is approved there.
//
//   npm run email:duty-guard-launch -- --dry-run   how many would get it, writes nothing
//   npm run email:duty-guard-launch                queue it
//
// Uses the Supabase project in .env.local: point it at production to send to production.

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const dryRun = process.argv.includes("--dry-run")
  const { queueDutyGuardLaunch } = await import("../../libs/email/lifecycle")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const r = await queueDutyGuardLaunch(db, { dryRun })
  console.log(`Project: ${url}`)
  console.log(`${r.accounts} accounts with an email · ${r.alreadySent} already had it · ${r.optedOut} opted out`)
  if (dryRun) console.log(`Dry run: ${r.wouldQueue} would get it. Nothing was written.`)
  else if (r.queued) console.log(`Queued ${r.queued} emails in one batch. Review and approve it in /email-outbox to send.`)
  else console.log("Nothing queued: everyone has had it, or a batch was already queued today.")
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
