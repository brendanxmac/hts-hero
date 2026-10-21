// One run of the AD/CVD cron (/api/cron/adcvd) from the command line, to check it end to end.
//
//   npm run adcvd:cron-once

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { runNew } from "../../libs/adcvd/process"

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const run = await runNew(db, { deadline: Date.now() + 260_000 })
  console.log(JSON.stringify(run, null, 1).slice(0, 4000))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
