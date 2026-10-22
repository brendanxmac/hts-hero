// Writes what the base-rate parser returns for every distinct general/special/other string in
// a USITC HTS export, so testing/engine-v2/rate-parsing.test.ts can check that parser changes
// don't alter results for strings that already parse.
//
//   npx tsx scripts/engine-v2/snapshot-rate-parsing.ts <path to HTS export .json>
//
// Re-run only when a change to a result is intended, and review the diff.
import { readFileSync, writeFileSync } from "fs"
import path from "path"
import { parseRateColumnWithFailures } from "../../tariffs/engine-v2/base-rates"

const source = process.argv[2]
if (!source) {
  console.error("Usage: npx tsx scripts/engine-v2/snapshot-rate-parsing.ts <hts.json>")
  process.exit(1)
}

const elements: { general?: string; special?: string; other?: string }[] =
  JSON.parse(readFileSync(source, "utf8"))

const raws = new Set<string>()
for (const e of elements) {
  for (const field of ["general", "special", "other"] as const) {
    const value = e[field]
    if (value && value.trim()) raws.add(value)
  }
}

// Silence the parser's per-failure console.error while snapshotting
const error = console.error
console.error = () => {}
const snapshot = Array.from(raws)
  .sort()
  .map((raw) => ({ raw, ...parseRateColumnWithFailures(raw) }))
console.error = error

const out = path.join(__dirname, "../../testing/engine-v2/fixtures/rate-parsing-snapshot.json")
writeFileSync(out, JSON.stringify(snapshot) + "\n")
console.log(`Wrote ${snapshot.length} strings to ${out}`)
