// Scores the broker's answers on the AD/CVD review sample (scripts/adcvd/review-sample.ts): joins
// the filled-in sheet with its key and reports, per group, how often our flags were right.
//
//   npm run adcvd:review-score -- adcvd-review/review-2026-10-23.csv
//
//   likely     precision: share answered Yes (Depends shown apart: the code alone can't settle it)
//   possible   share Yes, Depends and No: "possible" should be mostly Yes or Depends
//   ita        precision of flags resting only on ITA's case page codes
//   near_miss  miss rate: share of unflagged imports the broker says are in scope
// Each also weighted by the import's 2025 value, which is closer to what importers are exposed to.

import { readFileSync } from "fs"

const parse = (text: string) => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ",") {
      row.push(cell)
      cell = ""
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++
      row.push(cell)
      if (row.some((c) => c !== "")) rows.push(row)
      row = []
      cell = ""
    } else cell += ch
  }
  if (cell || row.length) rows.push([...row, cell])
  const [header, ...body] = rows
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])))
}

const answerOf = (raw: string) => (/^y/i.test(raw) ? "yes" : /^n/i.test(raw) ? "no" : /^d/i.test(raw) ? "depends" : null)
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "n/a")

const sheetPath = process.argv[2]
if (!sheetPath) {
  console.error("Usage: npm run adcvd:review-score -- <filled-in review CSV>")
  process.exit(1)
}
const answers = parse(readFileSync(sheetPath, "utf8"))
const key = new Map(parse(readFileSync(sheetPath.replace(/\.csv$/, "-key.csv"), "utf8")).map((r) => [r.id, r]))

const groups = new Map<string, { yes: number; no: number; depends: number; blank: number; yesUsd: number; answeredUsd: number }>()
for (const a of answers) {
  const k = key.get(a.id)
  if (!k) continue
  const g = groups.get(k.group) ?? { yes: 0, no: 0, depends: 0, blank: 0, yesUsd: 0, answeredUsd: 0 }
  const answer = answerOf(a.in_scope)
  const usd = Number(k.us_imports_2025_usd) || 0
  if (!answer) g.blank++
  else {
    g[answer]++
    g.answeredUsd += usd
    if (answer === "yes") g.yesUsd += usd
  }
  groups.set(k.group, g)
}

const label: Record<string, string> = {
  likely: "likely flags in scope (precision)",
  possible: "possible flags in scope",
  ita: "ITA-only flags in scope (precision)",
  near_miss: "unflagged imports in scope (miss rate)",
}
for (const [group, g] of groups) {
  const answered = g.yes + g.no + g.depends
  console.log(`\n${group}: ${answered} answered, ${g.blank} blank`)
  console.log(`  ${label[group] ?? group}: ${pct(g.yes, answered)} yes · ${pct(g.depends, answered)} depends · ${pct(g.no, answered)} no`)
  console.log(`  by 2025 import value: ${pct(g.yesUsd, g.answeredUsd)} yes`)
}
console.log("\nRows answered No on a likely flag, and Yes on a near miss, are the ones to read first: run the golden test after fixing them.")
