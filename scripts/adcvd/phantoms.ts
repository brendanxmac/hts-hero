// Cases made from typos in Federal Register notices (A-533-849 for Commodity Matchbooks, A-533-848;
// Türkiye's aluminum sheet printed with Taiwan's code, C-583-840): ITA has no case page for them
// and the Federal Register no docket. The readers no longer create them (notices.ts checks a new
// number's docket, parse.ts a list row's country and section); this removes the ones made before,
// with their events.
//
//   npm run adcvd:phantoms              # dry run: what would be removed, and why
//   npm run adcvd:phantoms -- --apply   # remove them

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { caseDocuments } from "../../libs/adcvd/fr"
import { fetchItaPage } from "../../libs/adcvd/ita"

const apply = process.argv.includes("--apply")

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  // Candidates: no ITA case page when last read, or never read (an ended case the cron skips)
  const { data, error } = await db.from("adcvd_cases").select("case_number, product, country, status, ita_found").or("ita_found.eq.false,ita_found.is.null")
  if (error) throw new Error(error.message)
  const phantoms: string[] = []
  for (const c of data ?? []) {
    // Both sources asked again now: a case ITA or the Federal Register knows is real
    const page = await fetchItaPage(c.case_number).catch((): null => null)
    if (!page || page.found) continue
    const docs = await caseDocuments(c.case_number).catch((): null => null)
    if (docs === null || docs.length) continue
    const { count } = await db.from("adcvd_events").select("id", { count: "exact", head: true }).eq("case_number", c.case_number)
    console.log(`${c.case_number} ${c.status} ${c.country ?? "?"} ${c.product ?? ""}: no ITA case page, no Federal Register docket (${count ?? 0} events)`)
    phantoms.push(c.case_number)
  }
  console.log(`\n${phantoms.length} case${phantoms.length === 1 ? "" : "s"} from typos${apply ? "" : " (dry run: --apply removes them)"}`)
  if (apply && phantoms.length) {
    const { error: deleteError } = await db.from("adcvd_cases").delete().in("case_number", phantoms)
    if (deleteError) throw new Error(deleteError.message)
    console.log("Removed, with their events.")
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
