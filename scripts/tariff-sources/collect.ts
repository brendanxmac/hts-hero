// Collects tariff source items (White House, Federal Register, CSMS, USTR, USITC) into
// tariff_source_items, the same as the cron, but reaching back as far as you ask.
//
//   npm run tariff-sources:collect -- --since 2026-07-01            # backfill from a date
//   npm run tariff-sources:collect -- --since 2026-07-01 --source csms --source ustr
//   npm run tariff-sources:collect -- --since 2026-10-01 --dry-run  # print, store nothing
//   npm run tariff-sources:collect -- --since 2025-11-01 --until 2025-11-30   # one period only
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (.env.local) unless --dry-run.

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { collectSources, COLLECTORS } from "../../libs/tariff-sources/collect"
import { matchTerms } from "../../libs/tariff-sources/terms"
import { SOURCE_IDS, type SourceId } from "../../libs/tariff-sources/types"

const fail = (message: string): never => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

const args = process.argv.slice(2)
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const all = (name: string) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []))

const main = async () => {
  const sinceArg = arg("since") ?? fail("--since YYYY-MM-DD is required.")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sinceArg)) fail("--since must be YYYY-MM-DD.")
  const since = new Date(`${sinceArg}T00:00:00Z`)
  const untilArg = arg("until")
  if (untilArg !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(untilArg)) fail("--until must be YYYY-MM-DD.")
  // Through the end of that day
  const until = untilArg ? new Date(`${untilArg}T23:59:59Z`) : undefined
  const sources = all("source") as SourceId[]
  const unknown = sources.filter((s) => !SOURCE_IDS.includes(s))
  if (unknown.length) fail(`Unknown source ${unknown.join(", ")}. Sources: ${SOURCE_IDS.join(", ")}`)

  if (args.includes("--dry-run")) {
    for (const collector of COLLECTORS.filter((c) => !sources.length || sources.includes(c.id))) {
      const items = (await collector.collect({ since, until, backfill: true })).filter((item) => !until || new Date(item.publishedAt) <= until)
      const tariffish = items.filter((item) => matchTerms(item.title, item.summary).length)
      console.log(`\n${collector.id}: ${items.length} items, ${tariffish.length} with tariff terms`)
      for (const item of items.slice(0, 5)) console.log(`  ${item.publishedAt.slice(0, 16)}  ${item.docType ?? ""}  ${item.title.slice(0, 100)}`)
    }
    return
  }

  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (.env.local).")

  const results = await collectSources(createClient(url, key), {
    since,
    until,
    backfill: true,
    trigger: "backfill",
    sources: sources.length ? sources : undefined,
  })
  for (const r of results) {
    console.log(`${r.error ? "✗" : "✓"} ${r.source.padEnd(20)} found ${String(r.found).padStart(5)}, added ${String(r.added).padStart(5)}${r.error ? `  ${r.error}` : ""}`)
  }
  if (results.some((r) => r.error)) process.exit(1)
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
