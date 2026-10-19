// Rebuilds the AD/CVD entries on /tariff-updates for a range of months (no AI): significant events,
// including petitions not yet linked to cases, grouped into one update per proceeding.
//
//   npm run adcvd:updates -- --from 2025-11 --to 2026-10

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { updateMonth } from "../../libs/adcvd/updates"

const args = process.argv.slice(2)
const arg = (name: string) => args[args.indexOf(`--${name}`) + 1]

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  for (const d = new Date(`${arg("to")}-15T12:00:00Z`); d.toISOString().slice(0, 7) >= arg("from"); d.setUTCMonth(d.getUTCMonth() - 1)) {
    const month = d.toISOString().slice(0, 7)
    const r = await updateMonth(db, month)
    console.log(`${month}: ${r.updates} updates`)
  }
  const { count } = await db.from("tariff_updates").select("*", { count: "exact", head: true }).eq("authority", "ad_cvd")
  console.log(`AD/CVD updates now: ${count}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
