// Reads ITA's case pages (libs/adcvd/ita.ts) and merges their codes into the cases, without waiting
// for the cron's 30 a run: the first fill, or a few cases again. One request a second (about 16
// minutes for every live case); Sonnet sorts the scopes that name "may also" or excluded codes,
// charged to this month's AD/CVD budget.
//
//   npm run adcvd:ita                          # every live case never read or read over 30 days ago
//   npm run adcvd:ita -- --case A-570-137,A-570-121
//   npm run adcvd:ita -- --limit 50            # stop after 50 cases
//   npm run adcvd:ita -- --merge-only          # no pages read: every case's codes merged again
//                                              # (after a change to codes.ts or checks.ts)

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { checkCases } from "../../libs/adcvd/checks"
import { refreshItaPages } from "../../libs/adcvd/ita"
import { budgetTracker, monthOf } from "../../libs/adcvd/usage"

const args = process.argv.slice(2)
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const log = (line: string) => console.log(`${new Date().toISOString().slice(11, 19)} ${line}`)

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const caseNumbers = arg("case")?.split(",").map((c) => c.trim()).filter(Boolean)
  if (args.includes("--merge-only")) {
    const all: string[] = []
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db.from("adcvd_cases").select("case_number").range(from, from + 999)
      if (error) throw new Error(error.message)
      all.push(...(data ?? []).map((r) => r.case_number as string))
      if ((data ?? []).length < 1000) break
    }
    const r = await checkCases(db, caseNumbers ?? all)
    log(`Merged and checked ${r.checked} cases (${r.withProblems} with notes)`)
    return
  }
  const limit = Number(arg("limit") ?? Infinity)
  const budget = await budgetTracker(db, monthOf(new Date()))
  log(`AD/CVD AI this month: $${budget.spent.toFixed(2)} of $${budget.budget.toFixed(2)}`)
  let read = 0
  let sorted = 0
  for (;;) {
    const batch = Math.min(50, limit - read)
    if (batch <= 0) break
    const r = await refreshItaPages(db, { deadline: Date.now() + 600_000, budget, limit: batch, caseNumbers })
    read += r.read
    sorted += r.sorted
    for (const e of r.errors) log(`✗ ${e}`)
    log(`${read} pages read, ${sorted} scopes sorted, AI $${budget.spent.toFixed(2)}`)
    if (caseNumbers || !r.remaining || !r.read) break
  }
  if (budget.reached) log("The month's AI budget is spent: scopes still to check stay on their regex sort until it's raised.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
