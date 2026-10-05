// Adds a draft entry to the tariff calculator changelog (/duty-calculator/changelog).
// Drafts are only visible to the admin, who publishes them once the change is deployed.
//
//   npm run changelog:draft -- --type revision --revision 2026HTSRev7 \
//     --title "HTS Revision 7 (2026)" --summary "Verified tariff data now covers…"
//   npm run changelog:draft -- --type fix --title "…" --summary "…" [--date 2026-10-02]
//
// Types: revision | fix | improvement. Date defaults to today.

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { parseChangelogInput } from "../libs/supabase/tariff-changelog"

const fail = (message: string): never => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

const arg = (name: string) => {
  const args = process.argv.slice(2)
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

const main = async () => {
  const { input, error } = parseChangelogInput({
    entry_date: arg("date") ?? new Date().toLocaleDateString("en-CA"),
    type: arg("type"),
    title: arg("title"),
    summary: arg("summary"),
    revision: arg("revision"),
    status: "draft",
  })
  if (error) fail(error)
  if (input.type === "revision" && !input.revision) fail("--revision is required for type revision.")

  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (.env.local).")

  const db = createClient(url!, key!, { auth: { persistSession: false } })
  const { data, error: dbError } = await db.from("tariff_changelog").insert(input).select().single()
  if (dbError) fail(`Couldn't save the draft: ${dbError.message}`)

  console.log(`\n✓ Draft changelog entry added (${data.entry_date}, ${data.type}): ${data.title}`)
  console.log("  Publish it at /duty-calculator/changelog once the change is deployed.\n")
}

main()
