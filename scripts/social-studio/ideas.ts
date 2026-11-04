// Finds social post ideas, the same as the studio's "Find ideas" button, and prints them.
// Nothing is stored.
//
//   npm run social:ideas
//   npm run social:ideas -- --count 12
//
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ANTHROPIC_API_KEY (.env.local).

import { existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import { findIdeas } from "../../libs/social-studio/ideas"

const args = process.argv.slice(2)
const countArg = args.indexOf("--count")

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (.env.local).")
  const started = Date.now()
  const result = await findIdeas({
    db: createClient(url, key),
    count: countArg >= 0 ? Number(args[countArg + 1]) : 8,
    log: (line) => console.log(`  ${line}`),
  })
  console.log(`\n${result.ideas.length} ideas from ${result.shortlisted} shortlisted of ${result.candidates} candidates, in ${Math.round((Date.now() - started) / 1000)}s`)
  if (result.usage) console.log(`Claude: ${result.usage.model}, $${result.usage.cost_usd}`)
  result.ideas.forEach((idea, i) => {
    const props = idea.props as unknown as Record<string, unknown>
    console.log(`\n${i + 1}. [${idea.kind} · ${idea.template}] ${props.headline ?? props.label ?? props.question}\n   ${idea.why}`)
  })
  result.warnings.forEach((w) => console.log(`\n⚠ ${w}`))
}

main().catch((e) => {
  console.error(`\n✗ ${(e as Error).message}\n`)
  process.exit(1)
})
