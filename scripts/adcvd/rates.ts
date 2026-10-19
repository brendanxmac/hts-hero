// Rates for live orders that have none yet (their latest rate-setting notice is older than the
// months processed), and clears stored rates that are all zeros. Stops before --max of AD/CVD AI.
//
//   npm run adcvd:rates -- --max 120

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { fillRates } from "../../libs/adcvd/rates"
import { ratesSet, type CaseRow } from "../../libs/adcvd/types"
import { budgetTracker, monthOf } from "../../libs/adcvd/usage"

const args = process.argv.slice(2)
const max = Number(args[args.indexOf("--max") + 1] ?? 120)
const log = (line: string) => console.log(`${new Date().toISOString().slice(11, 19)} ${line}`)

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const totalSpent = async () => {
    let sum = 0
    for (let from = 0; ; from += 1000) {
      const { data } = await db.from("ai_usage").select("cost_usd").eq("pipeline", "adcvd").range(from, from + 999)
      sum += (data ?? []).reduce((n, r) => n + Number(r.cost_usd), 0)
      if ((data ?? []).length < 1000) return sum
    }
  }
  const cases: CaseRow[] = []
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from("adcvd_cases").select("*").in("status", ["order", "suspended"]).range(from, from + 999)
    cases.push(...((data ?? []) as CaseRow[]))
    if ((data ?? []).length < 1000) break
  }
  // All-zero rates are no rates
  const zeros = cases.filter((c) => c.rates && !ratesSet(c.rates))
  for (const c of zeros) {
    await db.from("adcvd_cases").update({ rates: null }).eq("case_number", c.case_number)
    c.rates = null
  }
  log(`Cleared ${zeros.length} all-zero rates`)
  const todo = cases.filter((c) => !c.rates)
  log(`${todo.length} live orders without rates; starting at $${(await totalSpent()).toFixed(2)} of AD/CVD AI`)
  const budget = await budgetTracker(db, monthOf(new Date()))
  let found = 0
  for (let i = 0; i < todo.length; i++) {
    if (i % 25 === 0 && (await totalSpent()) >= max - 2) {
      log(`Stopping at the $${max} ceiling`)
      break
    }
    if (budget.reached) {
      log(`This month's AD/CVD budget is spent ($${budget.spent.toFixed(2)}); raise it on /adcvd to continue`)
      break
    }
    try {
      if (await fillRates(db, todo[i], budget)) found++
    } catch (e) {
      log(`  ✗ ${todo[i].case_number}: ${e instanceof Error ? e.message : String(e)}`)
    }
    if (i % 50 === 49) log(`${i + 1} done, ${found} with rates`)
  }
  log(`Done: ${found} of ${todo.length} got rates; AD/CVD AI now $${(await totalSpent()).toFixed(2)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
