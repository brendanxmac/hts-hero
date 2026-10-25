// AD/CVD detection against hand-checked imports (scripts/adcvd/golden.json): runs the real matcher
// (libs/adcvd/match.ts) over every case in the database and grades each expected case per import.
// Every expected answer was set from the scope text and the HTS line's description, not from what
// the matcher said. Run it before and after any change to cases, scopes, codes or matching.
//
//   npm run adcvd:golden              # what's wrong, plus the totals
//   npm run adcvd:golden -- --all     # every import and case
//   npm run adcvd:golden -- --strict  # exit 1 on any miss or false "likely" (for a pre-deploy check)
//
// Expectations: likely (the case must flag as likely), flag (likely or possible), none (must not
// flag likely; possible counts as noise), any (whatever it says). An import with no expected cases
// must flag nothing at all.

import { readFileSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import { matchCases, type MatchableCase } from "../../libs/adcvd/match"

config({ path: ".env.local", quiet: true })

type Expect = "likely" | "flag" | "none" | "any"
type Grade = "ok" | "weak" | "noise" | "miss" | "false_alarm"
interface Golden {
  id: string
  code: string
  country: string
  group: string
  why: string
  expect: Record<string, Expect>
}

const args = process.argv.slice(2)
const showAll = args.includes("--all")
const strict = args.includes("--strict")

const grade = (expect: Expect, level: string): Grade => {
  if (expect === "any") return "ok"
  if (expect === "likely") return level === "likely" ? "ok" : level === "possible" ? "weak" : "miss"
  if (expect === "flag") return level === "likely" || level === "possible" ? "ok" : "miss"
  return level === "none" ? "ok" : level === "possible" ? "noise" : "false_alarm"
}

const LABEL: Record<Grade, string> = { ok: "", weak: " (weaker than expected)", noise: " (noise)", miss: " (MISSED)", false_alarm: " (FALSE ALARM)" }

;(async () => {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const cases: (MatchableCase & { product: string | null })[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("adcvd_cases")
      .select("case_number, kind, country, product, status, ended_on, third_countries, hts_main, hts_also, hts_excluded, hts_outdated, hts_successors")
      .range(from, from + 999)
    if (error) throw new Error(`Loading cases: ${error.message}`)
    cases.push(...(data as never[]))
    if (data.length < 1000) break
  }
  const product = new Map(cases.map((c) => [c.case_number, c.product ?? ""]))
  const golden: Golden[] = JSON.parse(readFileSync("scripts/adcvd/golden.json", "utf8"))

  const totals: Record<Grade, number> = { ok: 0, weak: 0, noise: 0, miss: 0, false_alarm: 0 }
  const byGroup: Record<string, Record<Grade, number>> = {}
  let unexpected = 0
  for (const g of golden) {
    const found = new Map(
      matchCases(cases, { code: g.code, country: g.country })
        .filter((m) => m.level !== "history")
        .map((m) => [m.case_number, m])
    )
    const lines: string[] = []
    for (const [caseNumber, expect] of Object.entries(g.expect)) {
      const m = found.get(caseNumber)
      const result = grade(expect, m?.level ?? "none")
      totals[result]++
      byGroup[g.group] ??= { ok: 0, weak: 0, noise: 0, miss: 0, false_alarm: 0 }
      byGroup[g.group][result]++
      if (showAll || result !== "ok") {
        const why = m ? ` [${m.reasons.filter((r) => r !== "country" && r !== "live").join("+")}]` : ""
        lines.push(`   ${caseNumber} ${product.get(caseNumber)?.slice(0, 36).padEnd(36)} expect ${expect.padEnd(6)} got ${m?.level ?? "none"}${why}${LABEL[result]}`)
      }
    }
    const others = Array.from(found.values()).filter((m) => !(m.case_number in g.expect))
    unexpected += others.length
    // No expected cases: anything at all is a false alarm (a country with no order)
    if (!Object.keys(g.expect).length && others.length) {
      totals.false_alarm += others.length
      lines.push(`   flags where no case applies: ${others.map((m) => `${m.case_number}=${m.level}`).join(", ")} (FALSE ALARM)`)
    } else if (showAll && others.length) {
      lines.push(`   also flags: ${others.map((m) => `${m.case_number} ${product.get(m.case_number)?.slice(0, 24)}=${m.level}`).join(", ")}`)
    }
    if (lines.length) console.log(`\n${g.id} ${g.code} ${g.country} (${g.group}): ${g.why}\n${lines.join("\n")}`)
  }

  const checks = Object.values(totals).reduce((a, b) => a + b, 0)
  console.log(`\n${golden.length} imports, ${checks} checks`)
  console.log(`  correct ${totals.ok} · missed ${totals.miss} · false "likely" ${totals.false_alarm} · weaker ${totals.weak} · "possible" noise ${totals.noise}`)
  for (const [group, t] of Object.entries(byGroup).sort()) {
    console.log(`  ${group.padEnd(10)} ok ${t.ok}, missed ${t.miss}, false ${t.false_alarm}, weaker ${t.weak}, noise ${t.noise}`)
  }
  console.log(`  flags on cases not in the expectations: ${unexpected} (check with --all)`)
  if (strict && (totals.miss || totals.false_alarm)) process.exit(1)
})()
