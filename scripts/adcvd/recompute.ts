// Works out every AD/CVD case's status and milestones again from scratch (no AI): reads the annual
// review lists again (so each case's "listed" evidence is recorded), then each case's full Federal
// Register history, then the checks. Prints the counts to compare with ITA's ADCVD Proceedings
// dashboard (orders, suspension agreements, investigations).
//
//   npm run adcvd:recompute -- [--since 2025-11-01]

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { checkCases } from "../../libs/adcvd/checks"
import { noticeText } from "../../libs/adcvd/fr"
import { fillHistory } from "../../libs/adcvd/history"
import { readNotice, type NoticeItem } from "../../libs/adcvd/notices"
import type { CaseRow } from "../../libs/adcvd/types"

const args = process.argv.slice(2)
const since = args[args.indexOf("--since") + 1] && args.includes("--since") ? args[args.indexOf("--since") + 1] : "2025-11-01"
const log = (line: string) => console.log(`${new Date().toISOString().slice(11, 19)} ${line}`)

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // ---- 1. The annual review lists, read again
  const { data: lists } = await db
    .from("tariff_source_items")
    .select("id, title, url, published_at, agencies, document_number, external_id, raw")
    .eq("source", "federal_register")
    .ilike("title", "%Opportunity To Request Administrative Review%")
    .gte("published_at", since)
    .order("published_at")
  for (const item of (lists ?? []) as NoticeItem[]) {
    const r = await readNotice(db, item, await noticeText(item.raw.raw_text_url))
    log(`List ${item.document_number} (${item.published_at.slice(0, 10)}): ${r.newCases} new cases${r.note ? `; ${r.note}` : ""}`)
  }

  // ---- 2. Every case's history, from scratch
  const cases: CaseRow[] = []
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from("adcvd_cases").select("*").range(from, from + 999)
    cases.push(...((data ?? []) as CaseRow[]))
    if ((data ?? []).length < 1000) break
  }
  log(`History: ${cases.length} cases`)
  let changed = 0
  let failed = 0
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i]
    try {
      const r = await fillHistory(db, c)
      if (r.changed.includes("status")) changed++
    } catch (e) {
      failed++
      log(`  ✗ ${c.case_number}: ${e instanceof Error ? e.message : String(e)}`)
    }
    if (i % 100 === 99) log(`History: ${i + 1} done`)
  }
  log(`History: ${changed} statuses changed, ${failed} failed`)

  // ---- 3. Checks, then the counts
  await checkCases(db, cases.map((c) => c.case_number))
  const counts: Record<string, number> = {}
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from("adcvd_cases").select("status").range(from, from + 999)
    for (const r of data ?? []) counts[r.status] = (counts[r.status] ?? 0) + 1
    if ((data ?? []).length < 1000) break
  }
  log(`Counts: ${JSON.stringify(counts)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
