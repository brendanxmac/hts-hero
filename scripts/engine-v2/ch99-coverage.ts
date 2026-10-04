// Compares the Chapter 99 headings in the current HTS revision with the headings the
// duty calculator (engine-v2) models as tariffs:
//   npm run ch99:coverage
//   npm run ch99:coverage -- --file ../hts-data-processing/2026-20.json   (use a saved export)
//
// Expired, terminated and FTZ-suspended headings are listed in ch99-status.ts and are kept
// out of "missing". Coverage is measured against the headings still in effect.
//
// Output: tariffs/ch99-coverage/ (replaced on each run)
//   SUMMARY.md          counts, overall and by subchapter / heading group
//   missing.csv         headings in effect with no tariff record in the engine
//   missing/<99NN>.csv  missing.csv, split by the first 4 digits
//   covered.csv         headings with a tariff record in the engine (any status)
//   expired.csv         headings on the expired list
//   ftz-suspended.csv   headings whose duties are suspended except on certain FTZ goods
//   stale.csv           tariff records whose heading isn't in the current HTS

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs"
import { join } from "path"
import { fetchCh99Export, getCurrentReleaseName } from "../../libs/hts-revision-diff/usitc"
import { AllRules } from "../../tariffs/engine-v2/data"
import { isEffectiveOn, todayIsoDate } from "../../tariffs/engine-v2/dates"
import type { Tariff } from "../../tariffs/engine-v2/types"
import { expired, ftzSuspended, matches, Matcher, needsReview, parseEntry } from "./ch99-status"

const OUTPUT_DIR = join("tariffs", "ch99-coverage")
const HEADING = /^99\d\d\.\d\d\.\d\d$/
const HEADING_ANYWHERE = /\b99\d\d\.\d\d\.\d\d\b/g

interface HtsRow {
  htsno?: string | null
  description?: string | null
  general?: string | null
}

// Heading 99NN is in subchapter NN of chapter 99. Only the subchapters the calculator works
// with are described; the rest are labeled by number.
const SUBCHAPTER_NAMES: Record<string, string> = {
  "9902": "Temporary duty reductions (MTB)",
  "9903": "Temporary modifications (232, 301, 122, IEEPA, 201, 338, …)",
  "9904": "Section 22 quantitative limitations",
}
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII"]
const subchapterLabel = (prefix: string) => {
  const name = SUBCHAPTER_NAMES[prefix]
  return `Subchapter ${ROMAN[Number(prefix.slice(2))] ?? prefix.slice(2)}${name ? ` – ${name}` : ""}`
}

const csvCell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)
const toCsv = (header: string[], rows: string[][]) =>
  [header, ...rows].map((r) => r.map((c) => csvCell(c ?? "")).join(",")).join("\n") + "\n"

const clean = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, " ").trim()

const parseArgs = () => {
  const args = process.argv.slice(2)
  const i = args.indexOf("--file")
  return { file: i >= 0 ? args[i + 1] : null }
}

const loadHts = async (file: string | null) => {
  if (file) {
    const rows = JSON.parse(readFileSync(file, "utf8")) as HtsRow[]
    return { source: file, rows }
  }
  const [release, rows] = await Promise.all([getCurrentReleaseName(), fetchCh99Export()])
  return { source: `USITC export (${release ?? "current release"})`, rows: rows as HtsRow[] }
}

type Status = "active" | "expired" | "ftz-suspended"
const STATUS_LABEL: Record<Status, string> = {
  active: "in effect",
  expired: "expired",
  "ftz-suspended": "FTZ-suspended",
}

interface Counts {
  total: number
  expired: number
  ftz: number
  active: number
  covered: number // modeled and in effect
}
const emptyCounts = (): Counts => ({ total: 0, expired: 0, ftz: 0, active: 0, covered: 0 })

const main = async () => {
  const { file } = parseArgs()
  const today = todayIsoDate()
  const { source, rows } = await loadHts(file)

  // HTS headings, first row wins (the export has no duplicates, but a saved file might)
  const hts = new Map<string, HtsRow>()
  for (const row of rows) {
    const code = clean(row.htsno)
    if (HEADING.test(code) && !hts.has(code)) hts.set(code, row)
  }
  const codes = [...hts.keys()].sort((a, b) => a.localeCompare(b))

  // Status lists. Every entry must match at least one heading, so a typo can't hide.
  const expiredMatchers = expired.map(parseEntry)
  const ftzMatchers = ftzSuspended.map(parseEntry)
  const reviewMatchers = needsReview.map(parseEntry)
  const entryChecks = [
    ...expiredMatchers.map((m) => ({ list: "expired", m })),
    ...ftzMatchers.map((m) => ({ list: "FTZ-suspended", m })),
    ...reviewMatchers.map((m) => ({ list: "needs review", m })),
  ].map(({ list, m }) => ({
    list,
    codes: m.entry.codes,
    listed: "prefix" in m ? "prefix" : String(m.exact.length),
    inHts: codes.filter((c) => matches(m, c)).length,
  }))
  const unmatched = entryChecks.filter((e) => e.inHts === 0)
  for (const e of unmatched) console.warn(`⚠ ${e.list} entry ${e.codes} matches no heading in the HTS`)

  const firstMatch = (matchers: Matcher[], code: string) => matchers.find((m) => matches(m, code))
  const statusOf = new Map<string, { status: Status; note: string }>()
  for (const code of codes) {
    const exp = firstMatch(expiredMatchers, code)
    const ftz = firstMatch(ftzMatchers, code)
    if (exp && ftz) throw new Error(`${code} is on both the expired (${exp.entry.codes}) and FTZ-suspended lists`)
    if (exp) statusOf.set(code, { status: "expired", note: exp.entry.note })
    else if (ftz) statusOf.set(code, { status: "ftz-suspended", note: ftz.entry.note })
    else statusOf.set(code, { status: "active", note: firstMatch(reviewMatchers, code)?.entry.note ?? "" })
  }

  // Engine tariff records, grouped by heading (one heading can have several dated versions)
  const tariffsByCode = new Map<string, Tariff[]>()
  for (const t of AllRules.tariffs) {
    tariffsByCode.set(t.code, [...(tariffsByCode.get(t.code) ?? []), t])
  }

  // Headings named anywhere in the engine data (exceptions, interactions, conditions, …)
  const referenced = new Set(JSON.stringify(AllRules).match(HEADING_ANYWHERE) ?? [])

  const covered: string[][] = []
  const missing: string[][] = []
  const expiredRows: string[][] = []
  const ftzRows: string[][] = []
  const groupCounts = new Map<string, Counts>()
  const subchapterCounts = new Map<string, Counts>()
  const totals = emptyCounts()
  let modeledActiveToday = 0
  let modeledExpired = 0

  for (const code of codes) {
    const row = hts.get(code)!
    const { status, note } = statusOf.get(code)!
    const sub = code.slice(0, 4)
    const group = code.slice(0, 7) // "9903.88"
    const g = groupCounts.get(group) ?? emptyCounts()
    const s = subchapterCounts.get(sub) ?? emptyCounts()
    const records = tariffsByCode.get(code)
    const modeled = records ? "yes" : "no"

    for (const c of [g, s, totals]) {
      c.total++
      if (status === "expired") c.expired++
      else if (status === "ftz-suspended") c.ftz++
      else {
        c.active++
        if (records) c.covered++
      }
    }

    if (records) {
      const activeToday = records.some((t) => isEffectiveOn(t.effective, today))
      if (status === "active" && activeToday) modeledActiveToday++
      if (status === "expired") modeledExpired++
      covered.push([
        code,
        STATUS_LABEL[status],
        note,
        [...new Set(records.map((t) => t.program))].join("; "),
        [...new Set(records.map((t) => t.name))].join("; "),
        String(records.length),
        activeToday ? "yes" : "no",
        clean(row.general),
        clean(row.description),
      ])
    } else if (status === "active") {
      missing.push([
        code,
        subchapterLabel(sub),
        referenced.has(code) ? "yes" : "no",
        note,
        clean(row.general),
        clean(row.description),
      ])
    }
    if (status === "expired") expiredRows.push([code, note, modeled, clean(row.general), clean(row.description)])
    if (status === "ftz-suspended") ftzRows.push([code, note, modeled, clean(row.general), clean(row.description)])

    groupCounts.set(group, g)
    subchapterCounts.set(sub, s)
  }

  const stale = [...tariffsByCode]
    .filter(([code]) => !hts.has(code))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, records]) => {
      const last = records.map((t) => t.effective.to ?? "").sort().at(-1)
      return [
        code,
        [...new Set(records.map((t) => t.program))].join("; "),
        [...new Set(records.map((t) => t.name))].join("; "),
        records.some((t) => !t.effective.to) ? "open-ended" : last ?? "",
      ]
    })

  if (existsSync(OUTPUT_DIR)) rmSync(OUTPUT_DIR, { recursive: true })
  mkdirSync(join(OUTPUT_DIR, "missing"), { recursive: true })

  const missingHeader = ["heading", "subchapter", "referenced_in_engine", "review", "rate", "description"]
  const statusHeader = ["heading", "note", "modeled_in_engine", "rate", "description"]
  writeFileSync(join(OUTPUT_DIR, "missing.csv"), toCsv(missingHeader, missing))
  const missingBySub = new Map<string, string[][]>()
  for (const r of missing) missingBySub.set(r[0].slice(0, 4), [...(missingBySub.get(r[0].slice(0, 4)) ?? []), r])
  for (const [sub, list] of missingBySub) writeFileSync(join(OUTPUT_DIR, "missing", `${sub}.csv`), toCsv(missingHeader, list))
  writeFileSync(
    join(OUTPUT_DIR, "covered.csv"),
    toCsv(["heading", "status", "note", "program", "name", "records", `active_${today}`, "rate", "description"], covered)
  )
  writeFileSync(join(OUTPUT_DIR, "expired.csv"), toCsv(statusHeader, expiredRows))
  writeFileSync(join(OUTPUT_DIR, "ftz-suspended.csv"), toCsv(statusHeader, ftzRows))
  writeFileSync(join(OUTPUT_DIR, "stale.csv"), toCsv(["heading", "program", "name", "effective_to"], stale))

  const pct = (n: number, d: number) => (d ? `${((100 * n) / d).toFixed(1)}%` : "–")
  const referencedMissing = missing.filter((r) => r[2] === "yes").length
  const reviewMissing = missing.filter((r) => r[3]).length
  const countsRow = (c: Counts) =>
    `${c.total} | ${c.expired} | ${c.ftz} | ${c.active} | ${c.covered} | ${c.active - c.covered} | ${pct(c.covered, c.active)} |`
  const summary = [
    `# Chapter 99 coverage`,
    ``,
    `Generated ${today} by \`npm run ch99:coverage\`. HTS source: ${source}.`,
    `Expired and FTZ-suspended headings come from scripts/engine-v2/ch99-status.ts. ` +
      `Coverage is modeled ÷ in effect.`,
    ``,
    `| | Headings |`,
    `|---|---:|`,
    `| Chapter 99 headings in the HTS | ${totals.total} |`,
    `| Expired / terminated (expired.csv) | ${totals.expired} |`,
    `| FTZ-suspended (ftz-suspended.csv) | ${totals.ftz} |`,
    `| **In effect** | **${totals.active}** |`,
    `| **Modeled, in effect** | **${totals.covered} (${pct(totals.covered, totals.active)})** |`,
    `| …with an engine record in effect today | ${modeledActiveToday} |`,
    `| **Missing, in effect (missing.csv)** | **${missing.length}** |`,
    `| …named elsewhere in engine data (exceptions, interactions, conditions) | ${referencedMissing} |`,
    `| …flagged for review | ${reviewMissing} |`,
    `| Expired headings that are modeled (kept in covered.csv for past dates) | ${modeledExpired} |`,
    `| Engine tariff headings not in the current HTS (stale.csv) | ${stale.length} |`,
    ``,
    `## By subchapter`,
    ``,
    `| Prefix | Subchapter | In HTS | Expired | FTZ | In effect | Modeled | Missing | Coverage |`,
    `|---|---|---:|---:|---:|---:|---:|---:|---:|`,
    ...[...subchapterCounts]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sub, c]) => `| ${sub} | ${subchapterLabel(sub)} | ${countsRow(c)}`),
    ``,
    `## Missing, by first 4 digits`,
    ``,
    ...[...missingBySub]
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([sub, list]) => [
        `### ${sub} – ${subchapterLabel(sub)}: ${list.length} missing (missing/${sub}.csv)`,
        ``,
        `| Group | In effect | Modeled | Missing | Coverage |`,
        `|---|---:|---:|---:|---:|`,
        ...[...groupCounts]
          .filter(([group, c]) => group.startsWith(sub) && c.active > c.covered)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([group, c]) => `| ${group} | ${c.active} | ${c.covered} | ${c.active - c.covered} | ${pct(c.covered, c.active)} |`),
        ``,
      ]),
    `## By heading group`,
    ``,
    `| Group | In HTS | Expired | FTZ | In effect | Modeled | Missing | Coverage |`,
    `|---|---:|---:|---:|---:|---:|---:|---:|`,
    ...[...groupCounts]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, c]) => `| ${group} | ${countsRow(c)}`),
    ``,
    `## Status list check`,
    ``,
    `Headings each entry in ch99-status.ts lists, and how many of them are in the HTS.`,
    ``,
    `| List | Entry | Listed | In HTS |`,
    `|---|---|---:|---:|`,
    ...entryChecks.map((e) => `| ${e.list} | ${e.codes} | ${e.listed} | ${e.inHts}${e.inHts === 0 ? " ⚠" : ""} |`),
    ``,
  ].join("\n")
  writeFileSync(join(OUTPUT_DIR, "SUMMARY.md"), summary)

  console.log(summary)
  console.log(`Wrote ${OUTPUT_DIR}/`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
