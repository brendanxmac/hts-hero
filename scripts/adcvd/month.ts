// Processes one month of Commerce and ITC notices into AD/CVD cases, the same as "Process" on
// /adcvd, running until the month is done (or paused at its AI budget).
//
//   npm run adcvd:month -- 2026-09            # pick up where the month stopped
//   npm run adcvd:month -- 2026-09 --reset    # read every notice again
//
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ANTHROPIC_API_KEY (.env.local).

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { resetMonth, runMonth } from "../../libs/adcvd/process"

const fail = (message: string): never => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

const args = process.argv.slice(2)

const main = async () => {
  const month = args.find((a) => /^\d{4}-\d{2}$/.test(a)) ?? fail("Give a month: npm run adcvd:month -- 2026-09")
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (.env.local).")
  const db = createClient(url!, key!)
  if (args.includes("--reset")) await resetMonth(db, month)
  for (let round = 1; ; round++) {
    const result = await runMonth(db, month, { deadline: Date.now() + 240_000, restart: round === 1 && args.includes("--reset") })
    for (const line of result.log) console.log(`  ${line}`)
    for (const error of result.errors.slice(0, 10)) console.log(`  ✗ ${error}`)
    console.log(`${month}: ${result.status}${result.step ? ` at ${result.step}` : ""}, AI cost so far $${result.cost_usd.toFixed(2)}`)
    if (!result.remaining) {
      if (result.status === "error") process.exit(1)
      return
    }
  }
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
