// Writes tariffs/engine-v2/BASE_RATES_NOT_COVERED.md: every HTS line whose base rate the
// calculator can't fully work out, grouped by why, with example codes and calculator links.
//
//   npx tsx scripts/engine-v2/base-rate-coverage.ts <export.json>
//
// Pass the current revision's USITC export (e.g. hts-data-processing/2026-20.json). It runs the
// engine on every line, in General, Column 2 and each trade program, with the HTS available to
// look codes up (as the calculator has) and no answers given.
import { readFileSync, writeFileSync } from "fs"
import path from "path"
import { calculate } from "../../tariffs/engine-v2/calculate"
import { AllRules } from "../../tariffs/engine-v2/data"
import { parseRateColumnParts } from "../../tariffs/engine-v2/base-rates"
import { BaseRates, DutyColumn } from "../../tariffs/engine-v2/types"

const source = process.argv[2]
if (!source) {
  console.error("Usage: npx tsx scripts/engine-v2/base-rate-coverage.ts <hts.json>")
  process.exit(1)
}

interface Line {
  htsno: string
  indent: string | number
  description: string
  units?: string[]
  general?: string | null
  special?: string | null
  other?: string | null
}
const lines: Line[] = JSON.parse(readFileSync(source, "utf8"))

// Each line's rates come from the nearest line above it (or itself) that has any
const carrierOf = new Map<string, Line>()
const stack: Line[] = []
for (const line of lines) {
  while (stack.length && Number(stack[stack.length - 1].indent) >= Number(line.indent)) stack.pop()
  stack.push(line)
  const carrier = [...stack].reverse().find((l) => [l.general, l.special, l.other].some((v) => v && v.trim()))
  if (carrier) carrierOf.set(line.htsno, carrier)
}
const ratesOf = (l: Line): BaseRates => ({ general: l.general ?? null, special: l.special ?? null, other: l.other ?? null })
const byDigits = new Map(lines.map((l) => [l.htsno.replace(/\D/g, ""), l]))
const lookupBaseRates = (code: string) => {
  const line = byDigits.get(code.replace(/\D/g, ""))
  const carrier = line && carrierOf.get(line.htsno)
  return carrier ? ratesOf(carrier) : null
}

// A country each trade program covers, to claim it from (programs with none listed are skipped)
const countryFor = (program: string) => {
  const countries = AllRules.preferences.find((p) => p.symbol === program)?.countries ?? []
  return typeof countries[0] === "string" ? countries[0] : undefined
}

type Kind = "notCalculated" | "asks" | "caveat"
interface Finding {
  kind: Kind
  group: string
  column: DutyColumn
  program?: string
  rate: string
  why: string
  codes: Set<string>
  country: string
}
const findings = new Map<string, Finding>()
const add = (f: Omit<Finding, "codes">, code: string) => {
  const key = JSON.stringify([f.kind, f.group, f.column, f.program, f.rate, f.why])
  const found = findings.get(key) ?? { ...f, codes: new Set<string>() }
  found.codes.add(code)
  findings.set(key, found)
}

const groupOf = (rawText: string, why: string) => {
  const raw = rawText.replace(/\s+/g, " ")
  if (/^See 9/i.test(raw)) return "Special rates on a Chapter 98/99 line (\"See 9823…\")"
  if (/^See /i.test(raw)) return "Rates given as \"See … note\""
  if (/^\[?(the duty provided|no change|a duty of)|^100%\]$|^:$/i.test(raw)) return "Chapter 99 wording (not a base rate)"
  if (/^the (rate|duty rate|rate of duty) (applicable|provided)/i.test(raw) && /answer/i.test(why))
    return "Rates that are another code's rate (asks for the code)"
  if (/percent of the|^a duty (upon|equal|\(in lieu)|^the (rate|duty rate)/i.test(raw)) return "Chapter 98 formulas and references"
  return "Other wording"
}

const console_error = console.error
console.error = () => {}
for (const line of lines) {
  if (!/^\d{4}\.\d{2}\.\d{2}(\.\d{2})?$/.test(line.htsno)) continue
  const carrier = carrierOf.get(line.htsno)
  if (!carrier) continue
  // Only the line that carries the rates (its statistical suffixes share them)
  if (carrier.htsno !== line.htsno) continue
  const baseRates = ratesOf(carrier)
  const programs = new Set(parseRateColumnParts(baseRates.special).flatMap((t) => t.programs ?? []))
  const runs: { country: string; column: DutyColumn; program?: string; raw: string | null }[] = [
    { country: "CN", column: "general", raw: baseRates.general },
    { country: "RU", column: "column2", raw: baseRates.other },
    ...Array.from(programs).flatMap((program) => {
      const country = countryFor(program)
      return country ? [{ country, column: "special" as DutyColumn, program, raw: baseRates.special }] : []
    }),
  ]
  for (const run of runs) {
    if (!run.raw || !run.raw.trim()) continue
    const result = calculate(AllRules, {
      htsCode: line.htsno,
      country: run.country,
      asOf: "2026-10-22",
      customsValue: 10_000,
      quantity: 1000,
      quantityUnit: (line.units ?? [])[0],
      baseRates,
      lookupBaseRates,
      ...(run.program ? { claimedPreference: run.program } : {}),
    })
    // A program that isn't available falls back to General, which its own run covers
    if (result.column !== run.column) continue
    for (const part of result.baseParts) {
      const base = { column: run.column, ...(run.program ? { program: run.program } : {}), country: run.country }
      if (part.notCalculated) {
        const asks = Boolean(part.inputId?.startsWith("baseCode:"))
        add(
          {
            ...base,
            kind: asks ? "asks" : "notCalculated",
            group: groupOf(part.raw, part.notCalculated),
            rate: part.raw,
            why: part.notCalculated,
          },
          line.htsno,
        )
      } else if (part.note) {
        add(
          { ...base, kind: "caveat", group: /^See 9/.test(part.resolvedFrom?.raw ?? "") ? "Special rates on a Chapter 98/99 line (\"See 9823…\")" : "Calculated, with a caveat", rate: part.resolvedFrom?.raw ?? part.raw, why: part.note },
          line.htsno,
        )
      }
    }
  }
}
console.error = console_error

const all = Array.from(findings.values())
const link = (f: Finding, code: string) =>
  `[${code}](https://htshero.com/duty-calculator?code=${code}&country=${f.country}${f.program ? `&pref=${encodeURIComponent(f.program)}` : ""})`
const columnLabel = (f: Finding) => (f.column === "special" ? `Special (${f.program})` : f.column === "column2" ? "Column 2" : "General")
const escape = (text: string) => text.replace(/\|/g, "\\|")

const section = (kind: Kind, title: string, intro: string) => {
  const rows = all.filter((f) => f.kind === kind)
  const groups = Array.from(new Set(rows.map((f) => f.group))).sort()
  const lineCount = new Set(rows.flatMap((f) => Array.from(f.codes))).size
  return [
    `## ${title}`,
    "",
    `${intro} **${lineCount} rate lines.**`,
    "",
    ...groups.flatMap((group) => {
      const inGroup = rows.filter((f) => f.group === group).sort((a, b) => b.codes.size - a.codes.size || a.rate.localeCompare(b.rate))
      // One row per rate and reason; the columns and programs it shows up in, merged
      const merged = new Map<string, { rate: string; why: string; columns: Set<string>; codes: Set<string>; example: Finding }>()
      inGroup.forEach((f) => {
        const key = `${f.rate}|${f.why}`
        const m = merged.get(key) ?? { rate: f.rate, why: f.why, columns: new Set<string>(), codes: new Set<string>(), example: f }
        m.columns.add(columnLabel(f))
        f.codes.forEach((c) => m.codes.add(c))
        merged.set(key, m)
      })
      return [
        `### ${group}`,
        "",
        "| Rate in the HTS | Column | Why | Lines | Examples |",
        "| --- | --- | --- | --- | --- |",
        ...Array.from(merged.values())
          .sort((a, b) => b.codes.size - a.codes.size)
          .map((m) => {
            const codes = Array.from(m.codes).sort()
            const columns = Array.from(m.columns)
            return `| ${escape(m.rate.slice(0, 160))}${m.rate.length > 160 ? "…" : ""} | ${columns.length > 4 ? `${columns.slice(0, 4).join(", ")} +${columns.length - 4}` : columns.join(", ")} | ${escape(m.why)} | ${codes.length} | ${codes
              .slice(0, 3)
              .map((c) => link(m.example, c))
              .join(", ")}${codes.length > 3 ? ` +${codes.length - 3}` : ""} |`
          }),
        "",
      ]
    }),
  ].join("\n")
}

const out = [
  "# Base rates the calculator doesn't fully cover",
  "",
  `Generated by \`scripts/engine-v2/base-rate-coverage.ts\` from \`${path.basename(source)}\` on ${new Date().toISOString().slice(0, 10)}. Don't edit by hand; re-run it after an HTS revision or a parser change.`,
  "",
  "Each row is a base rate (General, Special or Column 2) and why the calculator can't work it out, or what it assumes. The engine never shows these as Free: a part it can't calculate is marked \"Not calculated\", the totals say they exclude base duty, and a warning gives the reason. Chapter 99 duties on top are calculated as usual. Example links open the calculator with that code and a country the column applies to.",
  "",
  section(
    "notCalculated",
    "Not calculated",
    "The base duty for these is left out of the total, with a reason. Nothing the user can answer changes that.",
  ),
  section(
    "asks",
    "Calculated once the user answers",
    "These are another code's rate. The calculator asks for that code under Questions About Your Goods and uses its rate; until then they're not calculated.",
  ),
  section(
    "caveat",
    "Calculated, with a caveat",
    "The duty is worked out, with a note the calculator shows alongside it.",
  ),
  "## Known limitations in rates that are calculated",
  "",
  "- **Rounding.** Amounts in cents read by the original patterns are rounded to 4 decimal places of a dollar, so \"3.6606¢/kg\" is charged as 3.66¢. The newer patterns keep them in full. Changing the old ones changes existing results.",
  "- **One quantity.** A rate with two per-unit parts (\"4.4¢/liter + 31.4¢/pf. liter\") or a per-unit rate in a unit other than the line's first (\"$1.70/m3\" on a line reported in m2 first, 4409.10.90) uses the single quantity entered.",
  "- **\"25¢/jewel\"** without \"over 7\" is charged per article (the quantity), not per jewel.",
  "- **Per thousand** (\"$6/1000\") divides by 1,000 only when the caller passes the line's unit (the calculator, embed, Tracker report, MCP and classification dashboard do). Other callers charge it as written.",
  "- **Code lookups** (\"Calculated once the user answers\" and Chapter 98/99 lines) need the HTS; callers that don't pass it leave those rates not calculated.",
  "",
].join("\n")

const target = path.join(__dirname, "../../tariffs/engine-v2/BASE_RATES_NOT_COVERED.md")
writeFileSync(target, out)
console.log(`Wrote ${target}: ${all.length} rows`)
