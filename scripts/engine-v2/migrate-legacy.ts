// One-time migration: converts the legacy tariff records (tariffs/*.ts) into draft
// engine-v2 heading files and code lists. The output is a starting point that was then
// reviewed and edited by hand; re-running it overwrites those edits.
//
//   npx tsx scripts/engine-v2/migrate-legacy.ts
import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import { execSync } from "child_process"
import { TariffsList } from "../../tariffs/tariffs"
import { TariffI } from "../../interfaces/tariffs"
import { EuropeanUnionCountries } from "../../constants/countries"
import * as metals from "../../tariffs/232-metals"
import * as lists from "../../tariffs/lists"
import { htsDigits } from "../../tariffs/engine-v2/codes"

const OUT = join(__dirname, "..", "..", "tariffs", "engine-v2", "data")
const REVISION = "2026HTSRev5"

// ── Named HTS code arrays from the legacy files ──

const named = new Map<string, string[]>()
for (const mod of [metals, lists]) {
  for (const [name, value] of Object.entries(mod)) {
    if (!Array.isArray(value) || value.length === 0) continue
    if (!value.every((v) => typeof v === "string")) continue
    if (value.some((v: string) => v.startsWith("9903"))) continue // heading lists, not HTS
    named.set(name, value as string[])
  }
}

const key = (codes: string[]) => Array.from(new Set(codes.map(htsDigits))).sort().join(",")
const namedByKey = new Map(Array.from(named).map(([name, codes]) => [key(codes), name]))

const usedLists = new Map<string, { codes: string[]; description: string }>()

// Returns list refs for a legacy code array: a named list, a union of named lists,
// or a new list named after the heading.
const listRefsFor = (codes: string[], fallbackId: string, description: string) => {
  const k = key(codes)
  const exact = namedByKey.get(k)
  if (exact) {
    usedLists.set(exact, { codes: named.get(exact), description: `Legacy list ${exact}` })
    return [exact]
  }

  // Union of named lists that are fully contained in this set
  const set = new Set(k.split(","))
  const contained = Array.from(named).filter(([, c]) => c.every((code: string) => set.has(htsDigits(code))))
  const maximal = contained.filter(
    ([name, c]) =>
      !contained.some(
        ([other, oc]) => other !== name && oc.length > c.length && c.every((x: string) => oc.includes(x)),
      ),
  )
  const union = new Set(maximal.flatMap(([, c]) => c.map(htsDigits)))
  if (maximal.length > 1 && union.size === set.size) {
    for (const [name, c] of maximal) {
      usedLists.set(name, { codes: c, description: `Legacy list ${name}` })
    }
    return maximal.map(([name]) => name)
  }

  usedLists.set(fallbackId, { codes, description })
  return [fallbackId]
}

// ── Programs ──

const programFor = (code: string) => {
  if (code.startsWith("9903.82") || code.startsWith("9903.85")) return "232-metals"
  if (code.startsWith("9903.03")) return "122"
  if (code.startsWith("9903.94")) return "232-autos"
  if (code.startsWith("9903.76")) return "232-wood"
  if (code.startsWith("9903.74")) return "232-mhdv"
  if (code.startsWith("9903.79")) return "232-semiconductors"
  if (/^9903\.(88|91|92)/.test(code)) return "301-china"
  if (code.startsWith("9903.96")) return "aircraft-agreements"
  if (["9903.02.19", "9903.02.20", "9903.02.74", "9903.02.75", "9903.02.76", "9903.02.77"].includes(code))
    return "deal-eu"
  if (["9903.02.72", "9903.02.73"].includes(code)) return "deal-jp"
  if (["9903.02.78", "9903.02.79", "9903.02.80", "9903.02.81"].includes(code)) return "deal-kr"
  throw new Error(`No program for ${code}`)
}

const FILE_FOR_PROGRAM: Record<string, string> = {
  "232-metals": "232-metals",
  "122": "122",
  "232-autos": "232-autos",
  "232-wood": "232-wood",
  "232-mhdv": "232-mhdv",
  "232-semiconductors": "232-semiconductors",
  "301-china": "301-china",
  "aircraft-agreements": "deals",
  "deal-eu": "deals",
  "deal-jp": "deals",
  "deal-kr": "deals",
}

// ── Countries ──

const EU = [...EuropeanUnionCountries].sort().join(",")

const countriesFor = (countries: string[] | undefined) => {
  if (!countries || countries.length === 0 || countries.includes("*")) return "all"
  const sorted = [...countries].sort().join(",")
  if (sorted === EU) return [{ list: "eu-members" }]
  const others = countries.filter((c) => !EuropeanUnionCountries.includes(c))
  if (countries.length - others.length === EuropeanUnionCountries.length) {
    return [...others, { list: "eu-members" }]
  }
  return countries
}

// ── Rates ──

const rateFor = (pct: number | null | undefined) =>
  !pct ? { kind: "free" } : { kind: "adValorem", pct }

const convert = (t: TariffI) => {
  const scope: Record<string, unknown> = {}
  const inc = t.inclusions ?? {}
  const exc = t.exclusions ?? {}

  scope.countries = countriesFor(inc.countries)
  scope.codes =
    !inc.codes || inc.codes.length === 0 || inc.codes.includes("*")
      ? "all"
      : listRefsFor(inc.codes, t.code, `Codes covered by ${t.code} (${t.name})`).map((list) => ({ list }))
  if (exc.countries?.length) scope.excludeCountries = countriesFor(exc.countries)
  if (exc.codes?.length) {
    scope.excludeCodes = listRefsFor(
      exc.codes,
      `${t.code}:excluded`,
      `Codes excluded from ${t.code} (${t.name})`,
    ).map((list) => ({ list }))
  }
  if (inc.tariffs?.length) scope.whenApplies = { codes: inc.tariffs }

  const heading: Record<string, unknown> = {
    code: t.code,
    program: programFor(t.code),
    name: t.name,
    description: t.description,
    scope,
  }

  const exceptions = (t.exceptions ?? []).filter((e) => e.startsWith("9903"))
  if (exceptions.length) heading.exceptions = exceptions
  if (t.requiresReview) heading.requires = [`CONFIRM(${t.code})`]

  heading.rate = rateFor(t.general)
  const byColumn: Record<string, unknown> = {}
  if ((t.special ?? 0) !== (t.general ?? 0)) byColumn.special = rateFor(t.special)
  if ((t.other ?? 0) !== (t.general ?? 0)) byColumn.column2 = rateFor(t.other)
  if (Object.keys(byColumn).length) heading.rateByColumn = byColumn

  heading.effective = {}
  heading.source = { revision: REVISION }
  return heading
}

// ── Write files ──

const byFile = new Map<string, Record<string, unknown>[]>()
for (const t of TariffsList) {
  const heading = convert(t)
  const file = FILE_FOR_PROGRAM[heading.program as string]
  byFile.set(file, [...(byFile.get(file) ?? []), heading])
}

mkdirSync(join(OUT, "headings"), { recursive: true })
const written: string[] = []
for (const [file, headings] of Array.from(byFile)) {
  const body = JSON.stringify(headings, null, 2)
    .replace(/"CONFIRM\((.+?)\)"/g, 'confirm("$1")')
    // Keep small objects on one line so prettier doesn't expand them
    .replace(/\{\s*"list":\s*"([^"]+)"\s*\}/g, '{ list: "$1" }')
    .replace(/\{\s*"kind":\s*"free"\s*\}/g, '{ kind: "free" }')
    .replace(/\{\s*"kind":\s*"adValorem",\s*"pct":\s*([\d.]+)\s*\}/g, '{ kind: "adValorem", pct: $1 }')
    .replace(/\{\s*"revision":\s*"([^"]+)"\s*\}/g, '{ revision: "$1" }')
  const path = join(OUT, "headings", `${file}.ts`)
  writeFileSync(
    path,
    `// Migrated from the legacy tariff data (${REVISION}) by scripts/engine-v2/migrate-legacy.ts,\n` +
      `// then reviewed by hand. See HowTariffsWork.md §6.\n` +
      `import { Tariff } from "../../types"\n` +
      `import { confirm } from "../confirmations"\n\n` +
      `export const headings: Tariff[] = ${body}\n`,
  )
  written.push(path)
}

const codeLists = [
  {
    id: "eu-members",
    kind: "country",
    description: "European Union member states",
    versions: [{ codes: [...EuropeanUnionCountries], effective: {} }],
  },
  ...Array.from(usedLists).map(([id, { codes, description }]) => ({
    id,
    kind: "hts",
    description,
    versions: [{ codes, effective: {}, source: { revision: REVISION } }],
  })),
]
writeFileSync(join(OUT, "lists.generated.json"), JSON.stringify(codeLists, null, 1) + "\n")

execSync(`npx prettier --write --no-semi ${written.map((p) => `"${p}"`).join(" ")}`)
console.log(`Wrote ${written.length} heading files and ${codeLists.length} lists`)
