// Company rates and exclusions for live orders, from the notice that set each order's rates (no
// re-reading of anything else). Stops before --max of AD/CVD AI spend.
//
//   npm run adcvd:companies -- --max 120

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { summarizeNotice } from "../../libs/adcvd/claude"
import { saveCompanyRates } from "../../libs/adcvd/companies"
import { documentMeta, noticeText } from "../../libs/adcvd/fr"
import type { CaseRow } from "../../libs/adcvd/types"
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
  const cases: Pick<CaseRow, "case_number" | "rates">[] = []
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from("adcvd_cases").select("case_number, rates").in("status", ["order", "suspended", "investigation"]).not("rates", "is", null).range(from, from + 999)
    cases.push(...((data ?? []) as Pick<CaseRow, "case_number" | "rates">[]))
    if ((data ?? []).length < 1000) break
  }
  const { data: done } = await db.from("adcvd_company_rates").select("case_number")
  const have = new Set((done ?? []).map((r) => r.case_number))
  // The notice behind each case's rates, with every case it set rates for
  const byDoc = new Map<string, string[]>()
  for (const c of cases.filter((c) => !have.has(c.case_number) && c.rates?.doc)) byDoc.set(c.rates!.doc, [...(byDoc.get(c.rates!.doc) ?? []), c.case_number])
  log(`${byDoc.size} notices for ${cases.length - have.size} cases; starting at $${(await totalSpent()).toFixed(2)} of AD/CVD AI`)
  const budget = await budgetTracker(db, monthOf(new Date()))
  let saved = 0
  let i = 0
  for (const [doc, numbers] of Array.from(byDoc)) {
    if (i++ % 25 === 0 && (await totalSpent()) >= max - 2) {
      log(`Stopping at the $${max} ceiling`)
      break
    }
    if (budget.reached) {
      log("This month's AD/CVD budget is spent; raise it on /adcvd to continue")
      break
    }
    try {
      const meta = await documentMeta(doc)
      const text = meta ? await noticeText(meta.raw_text_url) : null
      if (!meta || !text) continue
      const result = await summarizeNotice({ title: meta.title, event: "Notice that sets rates", cases: numbers, text })
      await budget.record(result.usage, "companies", doc)
      saved += await saveCompanyRates(db, { documentNumber: doc, publishedOn: meta.publication_date, title: meta.title, cases: numbers, companies: result.companies ?? [] })
    } catch (e) {
      log(`  ✗ ${doc}: ${e instanceof Error ? e.message : String(e)}`)
    }
    if (i % 50 === 0) log(`${i} notices, ${saved} company rates`)
  }
  log(`Done: ${saved} company rates; AD/CVD AI now $${(await totalSpent()).toFixed(2)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
