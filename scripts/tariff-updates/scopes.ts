// Reads the full scope of tariff actions from their PDFs (libs/tariff-updates/scope.ts) and works
// out the users' matches again, the same as the 15-minute cron, but for as many as you ask: for
// updates from before the reader existed.
//
//   npm run tariff-updates:scopes -- --limit 10
//
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ANTHROPIC_API_KEY (.env.local).

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const { processScopes } = await import("../../libs/tariff-updates/scope")
  const { refreshImpacts } = await import("../../libs/tariff-updates/impacts")
  const { getHtsElementsServer } = await import("../../libs/hts-server")
  const args = process.argv.slice(2)
  const i = args.indexOf("--limit")
  const limit = i >= 0 ? Number(args[i + 1]) : 10
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const scopes = await processScopes(db, { deadline: Date.now() + 60 * 60 * 1000, limit })
  console.log(`Read ${scopes.read.length} scopes for $${scopes.cost.toFixed(2)}, ${scopes.failed} failed, ${scopes.remaining} left in this batch.`)
  if (scopes.read.length) {
    const impacts = await refreshImpacts(db, await getHtsElementsServer(), { deadline: Date.now() + 30 * 60 * 1000, updateIds: scopes.read })
    console.log(`Matches worked out again: ${impacts.impacts} across ${impacts.accounts} accounts.`)
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
