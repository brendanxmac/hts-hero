// Reads the same updates' scopes both ways (libs/tariff-updates/scope.ts: Claude reading the PDFs,
// and scope-datalab.ts: datalab markdown) and compares them: cost, time, and which lines of the
// current HTS each scope covers, against each other and against the saved scope. Nothing is saved.
//
//   npm run tariff-updates:compare-scopes -- <update id or id prefix> [...]
//   npm run tariff-updates:compare-scopes -- 38ebd5e4 afdc7585 --out compare.json
//   npm run tariff-updates:compare-scopes -- 38ebd5e4 --only datalab
//
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY and DATALAB_API_KEY (.env.local).

import { existsSync, writeFileSync } from "fs"
import { createClient } from "@supabase/supabase-js"

const args = process.argv.slice(2)
const outIndex = args.indexOf("--out")
const out = outIndex >= 0 ? args[outIndex + 1] : null
const wanted = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--out" && args[i - 1] !== "--only")
// --only datalab: just that method (compared with the saved scope)
const onlyIndex = args.indexOf("--only")
const only = onlyIndex >= 0 ? args[onlyIndex + 1] : null

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const { readUpdateScope } = await import("../../libs/tariff-updates/scope")
  const { knownCodes } = await import("../../libs/tariff-updates/scope-datalab")
  const { scopeOf, codeNamed } = await import("../../libs/tariff-updates/match")
  const { getHtsElementsServer } = await import("../../libs/hts-server")
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  if (!wanted.length) throw new Error("Name the updates to compare (ids or id prefixes).")

  const htsnos = (await getHtsElementsServer()).map((e) => e.htsno).filter(Boolean)
  const knownCode = knownCodes(htsnos)
  // Every statistical line of the current HTS
  const lines = Array.from(new Set(htsnos.map((h) => h.replace(/\D/g, "")).filter((d) => d.length === 10 && !d.startsWith("98") && !d.startsWith("99"))))

  const { data: all, error } = await db
    .from("tariff_updates")
    .select("id, title, scope_codes, scope_excluded_codes, scope_countries, scope_excluded_countries, scope_headings")
  if (error) throw new Error(error.message)
  const updates = wanted.map((w) => all!.find((u) => u.id.startsWith(w)) ?? (() => { throw new Error(`No update ${w}`) })())

  type Scope = { covered_codes: string[]; excluded_codes: string[]; countries: string[]; excluded_countries: string[]; headings: string[] }
  // The HTS lines a scope covers
  const coveredLines = (s: Scope) => {
    const scope = scopeOf({ hts_codes: [], countries: [], scope_codes: s.covered_codes, scope_excluded_codes: s.excluded_codes, scope_countries: s.countries, scope_excluded_countries: s.excluded_countries, scope_headings: s.headings })
    const excluded = (code: string) => scope.excludedCodes.some((p) => (p.includes("-") ? codeNamed(p, code) : code.startsWith(p)))
    return new Set(lines.filter((code) => !excluded(code) && (scope.allProducts || scope.codes.some((p) => codeNamed(p, code)))))
  }
  const diff = (a: Set<string>, b: Set<string>) => Array.from(a).filter((x) => !b.has(x))
  const same = (a: string[], b: string[]) => {
    const x = new Set(a.map((s) => s.toUpperCase()))
    const y = new Set(b.map((s) => s.toUpperCase()))
    return { onlyFirst: Array.from(x).filter((v) => !y.has(v)), onlySecond: Array.from(y).filter((v) => !x.has(v)) }
  }

  const report: unknown[] = []
  const totals = { pdf: { usd: 0, ms: 0 }, datalab: { usd: 0, ms: 0, pages: 0 } }
  for (const u of updates) {
    console.log(`\n━━ ${u.id.slice(0, 8)}  ${u.title}`)
    const run = async (method: "pdf" | "datalab") => {
      const started = Date.now()
      try {
        const result = await readUpdateScope(db, u.id, { force: true, save: false, method, knownCode })
        if (result.status !== "read") return { method, error: `status ${result.status}` }
        return { method, ms: Date.now() - started, ...result.read }
      } catch (e) {
        return { method, error: e instanceof Error ? e.message : String(e) }
      }
    }
    const skip = (method: "pdf" | "datalab") => ({ method, error: "skipped (--only)" })
    const [pdf, md] = await Promise.all([only === "datalab" ? skip("pdf") : run("pdf"), only === "pdf" ? skip("datalab") : run("datalab")])
    const saved: Scope = { covered_codes: u.scope_codes ?? [], excluded_codes: u.scope_excluded_codes ?? [], countries: u.scope_countries ?? [], excluded_countries: u.scope_excluded_countries ?? [], headings: u.scope_headings ?? [] }
    const entry: Record<string, unknown> = { id: u.id, title: u.title, saved }
    const sets: Record<string, Set<string>> = { saved: coveredLines(saved) }
    for (const r of [pdf, md]) {
      if ("error" in r) {
        console.log(`  ${r.method.padEnd(8)} ✗ ${r.error}`)
        entry[r.method] = r
        continue
      }
      sets[r.method] = coveredLines(r.data)
      const unknown = [...r.data.covered_codes, ...r.data.excluded_codes].filter((c) => /^\d{4}(\.\d{2}){0,3}$/.test(c) && !knownCode(c.replace(/\D/g, "")))
      const t = r.method === "pdf" ? totals.pdf : totals.datalab
      t.usd += r.usage.cost_usd
      t.ms += r.ms
      if (r.method === "datalab") totals.datalab.pages += r.pages ?? 0
      console.log(
        `  ${r.method.padEnd(8)} $${r.usage.cost_usd.toFixed(3)}  ${(r.ms / 1000).toFixed(0)}s${r.pages ? `  ${r.pages} pages` : ""}  ` +
          `${r.data.covered_codes.length} codes, ${r.data.excluded_codes.length} excluded, headings ${r.data.headings.join(" ") || "-"}, ` +
          `countries ${r.data.countries.join(" ") || "-"}${r.data.excluded_countries.length ? ` less ${r.data.excluded_countries.join(" ")}` : ""}, ` +
          `${sets[r.method].size} HTS lines${unknown.length ? `, ${unknown.length} codes not in the HTS` : ""}${r.data.complete ? "" : ", incomplete"}`
      )
      const conditional = r.data.conditional_exclusions ?? []
      if (conditional.length) console.log(`           may be exempt: ${conditional.map((c) => `${c.condition} (${c.codes.length})`).join("; ")}`)
      for (const item of r.data.review ?? []) console.log(`           review: ${item.slice(0, 220)}`)
      entry[r.method] = { ...r, unknown, lines: sets[r.method].size }
    }
    if (sets.pdf && sets.datalab) {
      const onlyPdf = diff(sets.pdf, sets.datalab)
      const onlyMd = diff(sets.datalab, sets.pdf)
      const both = sets.pdf.size - onlyPdf.length
      const headings = same((pdf as { data: Scope }).data.headings, (md as { data: Scope }).data.headings)
      const countries = same((pdf as { data: Scope }).data.countries, (md as { data: Scope }).data.countries)
      console.log(`  HTS lines: ${both} in both, ${onlyPdf.length} only pdf (${onlyPdf.slice(0, 6).join(" ")}), ${onlyMd.length} only datalab (${onlyMd.slice(0, 6).join(" ")})`)
      if (headings.onlyFirst.length || headings.onlySecond.length) console.log(`  headings: only pdf ${headings.onlyFirst.join(" ") || "-"}, only datalab ${headings.onlySecond.join(" ") || "-"}`)
      if (countries.onlyFirst.length || countries.onlySecond.length) console.log(`  countries: only pdf ${countries.onlyFirst.join(" ") || "-"}, only datalab ${countries.onlySecond.join(" ") || "-"}`)
      entry.compare = { both, onlyPdf, onlyDatalab: onlyMd, headings, countries }
    }
    for (const m of ["pdf", "datalab"]) {
      if (!sets[m]) continue
      const missing = diff(sets.saved, sets[m]).length
      const extra = diff(sets[m], sets.saved).length
      console.log(`  vs saved (${sets.saved.size} lines): ${m} misses ${missing}, adds ${extra}`)
    }
    report.push(entry)
  }
  console.log(`\nTotal: pdf $${totals.pdf.usd.toFixed(2)} in ${(totals.pdf.ms / 1000).toFixed(0)}s; datalab $${totals.datalab.usd.toFixed(2)} Claude + ${totals.datalab.pages} datalab pages in ${(totals.datalab.ms / 1000).toFixed(0)}s`)
  if (out) writeFileSync(out, JSON.stringify(report, null, 1))
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
