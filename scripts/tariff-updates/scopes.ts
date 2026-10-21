// Reads the full scope of tariff actions from their PDFs (libs/tariff-updates/scope.ts) and works
// out the users' matches again, the same as the 15-minute cron, but for as many as you ask: for
// updates from before the reader existed.
//
//   npm run tariff-updates:scopes -- --limit 10
//   npm run tariff-updates:scopes -- --method datalab --from 2025-11-01 --before 2025-12-01 --limit 50   # a backfill period
//
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ANTHROPIC_API_KEY (.env.local).

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const { processScopes } = await import("../../libs/tariff-updates/scope")
  const { refreshImpacts } = await import("../../libs/tariff-updates/impacts")
  const { getHtsElementsServer } = await import("../../libs/hts-server")
  const { knownCodes } = await import("../../libs/tariff-updates/scope-datalab")
  const args = process.argv.slice(2)
  const arg = (name: string) => {
    const i = args.indexOf(`--${name}`)
    return i >= 0 ? args[i + 1] : undefined
  }
  const limit = Number(arg("limit") ?? 10)
  const method = arg("method") === "datalab" ? ("datalab" as const) : arg("method") === "pdf" ? ("pdf" as const) : undefined
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const htsElements = await getHtsElementsServer()
  const scopes = await processScopes(db, {
    deadline: Date.now() + 60 * 60 * 1000,
    limit,
    method,
    from: arg("from"),
    before: arg("before"),
    knownCode: knownCodes(htsElements.map((e) => e.htsno).filter(Boolean)),
  })
  console.log(
    `Read ${scopes.read.length} scopes for $${scopes.cost.toFixed(2)}${scopes.pages ? ` and ${scopes.pages} datalab pages` : ""}, ` +
      `${scopes.flagged.length} flagged for review, ${scopes.failed} failed, ${scopes.remaining} left in this batch.`
  )
  if (scopes.read.length) {
    const impacts = await refreshImpacts(db, htsElements, { deadline: Date.now() + 30 * 60 * 1000, updateIds: scopes.read })
    console.log(`Matches worked out again: ${impacts.impacts} across ${impacts.accounts} accounts.`)
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
