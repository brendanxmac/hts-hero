// The independent accuracy check of AD/CVD detection: a random sample of real imports and the cases
// the matcher flags (or nearly flags) on them, for a licensed customs broker to judge. The broker sees
// the import, the case, its scope sentence and links, never our answer; the answers are scored by
// scripts/adcvd/review-score.ts. Real imports: every 10-digit code × country with US imports of at
// least $100,000 in public/data/us-imports (Census, 2025), from a country a live case covers.
//
//   npm run adcvd:review-sample -- [--seed 1] [--out adcvd-review]
//
// Writes, in --out:
//   review-<date>.csv      for the broker: one row per import and case, answer columns blank
//   review-<date>-key.csv  ours: each row's group, our level and why (don't send this)
//   REVIEWING.md           what to do, for the broker
// Groups (sampled without overlap, ITA first):
//   ita        60 flags whose matched code comes only from ITA's case page (are they right?)
//   likely     60 "likely" flags (how often is "likely" in scope?)
//   possible   60 "possible" flags (how often is "possible" in scope?)
//   near_miss  40 imports not flagged, in a heading a live case lists a code in (what do we miss?)

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { createClient } from "@supabase/supabase-js"
import { getHtsElementsServer } from "../../libs/hts-server"
import { htsLines } from "../../libs/adcvd/hts-lines"
import { itaUrl } from "../../libs/adcvd/ita"
import { evidenceSentence, matchCases, type CaseMatch } from "../../libs/adcvd/match"
import { LIVE_STATUSES, type CaseRow } from "../../libs/adcvd/types"

const args = process.argv.slice(2)
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const SIZES = { ita: 60, likely: 60, possible: 60, near_miss: 40 }
const MIN_IMPORTS_KUSD = 100

// A seeded shuffle, so the same seed draws the same sample
const shuffle = <T,>(list: T[], seed: number) => {
  let s = seed >>> 0
  const random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const csv = (rows: Record<string, string | number>[]) => {
  const columns = Object.keys(rows[0] ?? {})
  const cell = (v: string | number) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))
  return [columns.join(","), ...rows.map((r) => columns.map((c) => cell(r[c] ?? "")).join(","))].join("\n") + "\n"
}

const dotted = (code: string) => (code.length === 10 ? `${code.slice(0, 4)}.${code.slice(4, 6)}.${code.slice(6, 8)}.${code.slice(8)}` : code)

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const seed = Number(arg("seed") ?? 1)
  const out = arg("out") ?? "adcvd-review"
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const cases: CaseRow[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("adcvd_cases").select("*").range(from, from + 999)
    if (error) throw new Error(error.message)
    cases.push(...((data ?? []) as CaseRow[]))
    if ((data ?? []).length < 1000) break
  }
  const byNumber = new Map(cases.map((c) => [c.case_number, c]))
  const live = cases.filter((c) => LIVE_STATUSES.includes(c.status))
  const covered = new Set(live.flatMap((c) => [c.country, ...c.third_countries]).filter(Boolean) as string[])
  const lines = htsLines(await getHtsElementsServer())

  // Real imports
  const imports: { code: string; country: string; kusd: number }[] = []
  for (const file of readdirSync("public/data/us-imports").filter((f) => /^\d{2}\.json$/.test(f))) {
    const { codes } = JSON.parse(readFileSync(join("public/data/us-imports", file), "utf8")) as { codes: Record<string, [string, number, number][]> }
    for (const [code, countries] of Object.entries(codes)) {
      for (const [country, kusd] of countries) if (kusd >= MIN_IMPORTS_KUSD && covered.has(country) && lines[code]) imports.push({ code, country, kusd })
    }
  }
  console.log(`${imports.length} real imports (code × country, ≥ $${MIN_IMPORTS_KUSD}k in 2025) from countries a live case covers`)

  type Flag = { code: string; country: string; kusd: number; match: CaseMatch }
  const flags: Flag[] = []
  const unflagged: { code: string; country: string; kusd: number }[] = []
  for (const item of imports) {
    const found = matchCases(cases, item).filter((m) => m.level !== "history")
    if (found.length) for (const match of found) flags.push({ ...item, match })
    else unflagged.push(item)
  }
  const source = (f: Flag) => (f.match.code ? byNumber.get(f.match.case_number)?.hts_sources?.[f.match.code] ?? [] : [])
  const itaOnly = (f: Flag) => {
    const s = source(f)
    return s.length > 0 && s.every((x) => x.startsWith("ita"))
  }
  console.log(`${flags.length} flags: ${flags.filter((f) => f.match.level === "likely").length} likely, ${flags.filter((f) => f.match.level === "possible").length} possible, ${flags.filter(itaOnly).length} on ITA-only codes`)

  // Near misses: not flagged, but a live case for the country lists a current code in the heading
  const nearMisses = unflagged
    .map((item) => {
      const near = live.find((c) => (c.country === item.country || c.third_countries.includes(item.country)) && [...c.hts_main, ...c.hts_also].some((s) => s.slice(0, 4) === item.code.slice(0, 4)))
      return near ? { ...item, caseNumber: near.case_number } : null
    })
    .filter((x): x is NonNullable<typeof x> => !!x)

  const taken = new Set<string>()
  const key = (code: string, country: string, caseNumber: string) => `${code}|${country}|${caseNumber}`
  const pick = <T,>(pool: T[], n: number, keyOf: (t: T) => string) => {
    const chosen: T[] = []
    for (const t of shuffle(pool, seed)) {
      if (chosen.length >= n) break
      if (taken.has(keyOf(t))) continue
      taken.add(keyOf(t))
      chosen.push(t)
    }
    return chosen
  }
  const flagKey = (f: Flag) => key(f.code, f.country, f.match.case_number)
  const groups: { group: keyof typeof SIZES; code: string; country: string; kusd: number; caseNumber: string; level: string; why: string; scopeCode: string; sources: string }[] = []
  const add = (group: keyof typeof SIZES, list: Flag[]) =>
    list.forEach((f) =>
      groups.push({
        group,
        code: f.code,
        country: f.country,
        kusd: f.kusd,
        caseNumber: f.match.case_number,
        level: f.match.level,
        why: f.match.reasons.join("+"),
        scopeCode: f.match.code ?? "",
        sources: source(f).join(" "),
      })
    )
  add("ita", pick(flags.filter(itaOnly), SIZES.ita, flagKey))
  add("likely", pick(flags.filter((f) => f.match.level === "likely"), SIZES.likely, flagKey))
  add("possible", pick(flags.filter((f) => f.match.level === "possible"), SIZES.possible, flagKey))
  for (const m of pick(nearMisses, SIZES.near_miss, (m) => key(m.code, m.country, m.caseNumber))) {
    groups.push({ group: "near_miss", code: m.code, country: m.country, kusd: m.kusd, caseNumber: m.caseNumber, level: "none", why: "", scopeCode: "", sources: "" })
  }

  // The broker's sheet: shuffled together, so the order says nothing about the group
  const sheet = shuffle(groups, seed + 1).map((g, i) => ({ ...g, id: `R${String(i + 1).padStart(3, "0")}` }))
  const date = new Date().toISOString().slice(0, 10)
  mkdirSync(out, { recursive: true })
  writeFileSync(
    join(out, `review-${date}.csv`),
    csv(
      sheet.map((g) => {
        const c = byNumber.get(g.caseNumber)!
        const quote = (c.scope_text && g.scopeCode && evidenceSentence(c.scope_text, g.scopeCode)) || (c.ita_scope && g.scopeCode && evidenceSentence(c.ita_scope, g.scopeCode)) || ""
        return {
          id: g.id,
          import_hts: dotted(g.code),
          import_description: lines[g.code] ?? "",
          country_of_origin: g.country,
          us_imports_2025_usd: g.kusd * 1000,
          case_number: g.caseNumber,
          case_product: c.product ?? "",
          case_country: c.country ?? "",
          // What the case covers, from its current scope (ITA's page, else the Federal Register's)
          scope_definition: (c.ita_scope ?? c.scope_text ?? "").replace(/\s+/g, " ").trim().slice(0, 600),
          scope_sentence: quote,
          ita_case_page: itaUrl(g.caseNumber),
          federal_register_scope: c.scope_doc ? `https://www.federalregister.gov/d/${c.scope_doc}` : "",
          in_scope: "",
          depends_on: "",
          notes: "",
        }
      })
    )
  )
  writeFileSync(
    join(out, `review-${date}-key.csv`),
    csv(sheet.map((g) => ({ id: g.id, group: g.group, our_level: g.level, why: g.why, scope_code: g.scopeCode, code_sources: g.sources, us_imports_2025_usd: g.kusd * 1000 })))
  )
  writeFileSync(
    join(out, "REVIEWING.md"),
    `# AD/CVD scope review

Each row is a real US import (an HTS code and country of origin) and an antidumping or
countervailing duty case. For each row, answer: **could goods imported under this HTS code from
this country be within this case's scope?**

- \`in_scope\`: **Yes** (goods normally entered under this code from this country are covered),
  **No** (they can't be: wrong product, excluded, wrong country, or the case has ended), or
  **Depends** (some goods under this code are covered and others aren't).
- \`depends_on\`: for Depends, the product detail that decides it (for example "intrinsic viscosity
  0.70–0.88 dl/g", "crystalline silicon vs thin film", "blend conforms to ASHRAE 34").
- \`notes\`: anything else, such as a better HTS code or a scope ruling.

Use the case's ITA page (scope, HTS list, scope rulings) and the Federal Register scope linked on
each row. The rows are in random order. Please don't look up how any tool flagged them.
`
  )
  console.log(`Wrote ${sheet.length} rows to ${out}/review-${date}.csv (key: review-${date}-key.csv)`)
  for (const [group, n] of Object.entries(SIZES)) console.log(`  ${group}: ${groups.filter((g) => g.group === group).length} of ${n}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
