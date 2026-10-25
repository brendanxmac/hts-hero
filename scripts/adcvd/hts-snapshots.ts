// Writes every HTS revision stored in Supabase (hts_revisions, oldest first) as the snapshots
// scripts/adcvd/build-successors.py reads after the Census files: each statistical line's code with
// its full description ("Furniture > Other metal furniture > … > Steel racks"). An 8-digit line
// with no statistical lines is written as its 10 digits ending in 00, the way Census writes it.
//
//   npx tsx scripts/adcvd/hts-snapshots.ts DIR      # → DIR/revisions.json

import { writeFileSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import { downloadHtsRevision } from "../../libs/hts-server"
import { htsLines } from "../../libs/adcvd/hts-lines"

config({ path: ".env.local", quiet: true })

const main = async () => {
  const dir = process.argv[2]
  if (!dir) throw new Error("Usage: npx tsx scripts/adcvd/hts-snapshots.ts DIR")
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await db.from("hts_revisions").select("name, created_at").order("created_at")
  if (error) throw new Error(error.message)
  const out: { name: string; codes: Record<string, string> }[] = []
  for (const { name } of data ?? []) {
    const { elements } = await downloadHtsRevision(name)
    out.push({ name, codes: htsLines(elements) })
    console.log(`${name}: ${Object.keys(out[out.length - 1].codes).length} lines`)
  }
  writeFileSync(`${dir}/revisions.json`, JSON.stringify(out))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
