// Sorts collected tariff source items, reads the tariff actions and groups them into updates,
// the same as the cron, but keeps going until nothing is left (for a backfill).
//
//   npm run tariff-updates:process
//   npm run tariff-updates:process -- --retry-errors   # clear failed items' errors first
//   npm run tariff-updates:process -- --sort 50 --read 10 --group 10   # one small sample run, to see costs
//
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ANTHROPIC_API_KEY (.env.local).

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { MODELS } from "../../libs/tariff-updates/claude"
import { processTariffUpdates, type StepCosts, type StepLimits } from "../../libs/tariff-updates/process"

const fail = (message: string): never => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

const args = process.argv.slice(2)
const numberArg = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? Number(args[i + 1]) : undefined
}

const usd = (n: number) => `$${n.toFixed(4)}`

const printCosts = (costs: StepCosts, asked: StepCosts) => {
  for (const step of ["sort", "read", "group"] as const) {
    const per = asked[step] ? `, ${usd(costs[step] / asked[step])} per item` : ""
    console.log(`  ${step.padEnd(5)} ${MODELS[step].padEnd(18)} ${String(asked[step]).padStart(4)} items  ${usd(costs[step])}${per}`)
  }
  console.log(`  total ${usd(costs.sort + costs.read + costs.group)}`)
}

// Asks the running site (BASE_URL) to rebuild /tariff-updates, whose pages are cached for 15 minutes
const refreshPublicPages = async () => {
  const base = process.env.BASE_URL
  if (!base || !process.env.CRON_SECRET) return console.log("Set BASE_URL and CRON_SECRET to refresh /tariff-updates right away.")
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/api/tariff-updates/revalidate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })
    console.log(response.ok ? `Refreshed ${base}/tariff-updates` : `Couldn't refresh /tariff-updates (${response.status})`)
  } catch {
    console.log(`Couldn't reach ${base} to refresh /tariff-updates; it refreshes within 15 minutes.`)
  }
}

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (.env.local).")
  const db = createClient(url, key)

  if (process.argv.includes("--retry-errors")) {
    const { error } = await db.from("tariff_source_items").update({ process_error: null }).not("process_error", "is", null)
    if (error) fail(error.message)
  }

  const limits: StepLimits = { sort: numberArg("sort"), read: numberArg("read"), group: numberArg("group") }
  const sample = Object.values(limits).some((n) => n !== undefined)
  const total = { sort: 0, read: 0, group: 0 }
  const asked = { sort: 0, read: 0, group: 0 }

  for (let round = 1; ; round++) {
    const r = await processTariffUpdates(db, {
      deadline: Date.now() + 10 * 60 * 1000,
      // A sample run skips the steps it wasn't given a number for
      limits: sample ? { sort: limits.sort ?? 0, read: limits.read ?? 0, group: limits.group ?? 0 } : undefined,
    })
    for (const step of ["sort", "read", "group"] as const) {
      total[step] += r.costs[step]
      asked[step] += r.asked[step]
    }
    console.log(`Round ${round}: sorted ${r.sorted}, read ${r.read}, grouped ${r.grouped} (${r.created} new updates), ${r.errors} errors`)
    printCosts(r.costs, r.asked)
    if (sample || !r.remaining) break
    if (!r.sorted && !r.read && !r.grouped) fail("No progress this round; see the errors above and process_error on the items.")
  }
  await refreshPublicPages()
  if (!sample) {
    console.log("\nAll rounds:")
    printCosts(total, asked)
  }
  const { count } = await db.from("tariff_source_items").select("id", { count: "exact", head: true }).not("process_error", "is", null)
  if (count) console.log(`${count} items failed; rerun with --retry-errors to try them again.`)
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
