// Processes a range of months of Commerce and ITC notices into AD/CVD cases, newest first, then
// makes the registry as complete as it can: each case's milestones from its full Federal Register
// history (no AI), another try at scope codes for every case still without, and the checks.
// Stops starting new work once the AD/CVD pipeline's total AI spend reaches --max.
//
//   npm run adcvd:backfill -- --from 2025-11 --to 2026-10 --max 120 [--reread 2026-09,2026-10]
//
// --reread: months already done to read again (free: summaries and checked codes are kept).

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { checkCases } from "../../libs/adcvd/checks"
import { fillHistory } from "../../libs/adcvd/history"
import { resetMonth, runMonth } from "../../libs/adcvd/process"
import { scopeCases } from "../../libs/adcvd/scope"
import type { CaseRow } from "../../libs/adcvd/types"
import { budgetTracker, monthOf } from "../../libs/adcvd/usage"
import { mapLimit } from "../../libs/tariff-sources/text"

const fail = (message: string): never => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}
const args = process.argv.slice(2)
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const log = (line: string) => console.log(`${new Date().toISOString().slice(11, 19)} ${line}`)

const monthsBetween = (from: string, to: string) => {
  const out: string[] = []
  for (const d = new Date(`${to}-15T12:00:00Z`); d.toISOString().slice(0, 7) >= from; d.setUTCMonth(d.getUTCMonth() - 1)) out.push(d.toISOString().slice(0, 7))
  return out
}

const main = async () => {
  const from = arg("from") ?? fail("--from YYYY-MM is required")
  const to = arg("to") ?? fail("--to YYYY-MM is required")
  const max = Number(arg("max") ?? fail("--max (US$) is required"))
  const reread = new Set((arg("reread") ?? "").split(",").filter(Boolean))
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
  // Leaves room for the round in flight (a few dollars at most) under the ceiling
  const MARGIN = 4
  const overBudget = async () => (await totalSpent()) >= max - MARGIN

  log(`Starting at $${(await totalSpent()).toFixed(2)} of AD/CVD AI spend; stopping before $${max}.`)

  // ---- 1. Months, newest first
  for (const month of monthsBetween(from, to)) {
    const { data: row } = await db.from("adcvd_months").select("status").eq("month", month).maybeSingle()
    const again = reread.has(month)
    if (row?.status === "done" && !again) {
      log(`${month}: already done`)
      continue
    }
    if (again) await resetMonth(db, month)
    for (let round = 0; ; round++) {
      if (await overBudget()) {
        log(`Stopping: AD/CVD AI spend is $${(await totalSpent()).toFixed(2)}, at the $${max} ceiling.`)
        return
      }
      const r = await runMonth(db, month, { deadline: Date.now() + 240_000, restart: again && round === 0 })
      for (const line of r.log) log(`${month}:   ${line}`)
      for (const e of r.errors.slice(0, 10)) log(`${month}:   ✗ ${e}`)
      log(`${month}: ${r.status}${r.step ? ` at ${r.step}` : ""}, month AI $${r.cost_usd.toFixed(2)}`)
      if (r.status === "paused") log(`${month}: paused at its monthly budget; moving on`)
      if (!r.remaining) break
    }
  }

  // ---- 2. Every case's milestones from its full history (no AI)
  const cases: CaseRow[] = []
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from("adcvd_cases").select("*").range(from, from + 999)
    cases.push(...((data ?? []) as CaseRow[]))
    if ((data ?? []).length < 1000) break
  }
  log(`History: reading ${cases.length} cases' Federal Register notices for their milestones`)
  let changed = 0
  // One at a time: the Federal Register blocks clients that ask too fast
  await mapLimit(cases, 1, async (c) => {
    try {
      const r = await fillHistory(db, c)
      if (r.changed.length) changed++
    } catch (e) {
      log(`  ✗ ${c.case_number}: ${e instanceof Error ? e.message : String(e)}`)
    }
  })
  log(`History: ${changed} cases gained dates or a status`)

  // ---- 3. Another try at scope codes for every case still without
  if (!(await overBudget())) {
    const budget = await budgetTracker(db, monthOf(new Date()))
    // Every case tried before this run's retry started, each once
    const triedBefore = new Date().toISOString()
    for (;;) {
      if (await overBudget()) break
      const r = await scopeCases(db, { deadline: Date.now() + 240_000, budget, limit: 50, triedBefore })
      log(`Scope retry: ${Object.entries(r.found).map(([k, v]) => `${v} ${k}`).join(", ") || "nothing left"}`)
      for (const e of r.errors.slice(0, 5)) log(`  ✗ ${e}`)
      if (r.unavailable) {
        log("Scope retry: the Federal Register isn't answering; stopping here (run again later)")
        break
      }
      if (!r.remaining) break
    }
  }

  // ---- 4. Checks on everything
  const numbers = cases.map((c) => c.case_number)
  const checked = await checkCases(db, numbers)
  log(`Checked ${checked.checked} cases, ${checked.withProblems} with notes`)
  log(`Done at $${(await totalSpent()).toFixed(2)} of AD/CVD AI spend.`)
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
