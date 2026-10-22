// Writes the golden snapshots testing/engine-v2/rate-parsing.test.ts checks against: what the
// base-rate parser returns for every distinct general/special/other string in the given USITC
// HTS exports, and the base duty for every line, column and trade program.
//
//   npx tsx scripts/engine-v2/snapshot-rate-parsing.ts <export.json> [<export.json> …]
//
// Pass every export there is (all chapters, including 98). Re-run only when a change to a result
// is intended, and review the diff: the snapshots are what the parser and engine did before.
import { readFileSync, writeFileSync } from "fs"
import path from "path"
import * as current from "../../tariffs/engine-v2/base-rates"
import { buildSnapshots } from "../../testing/engine-v2/rate-snapshot"

const sources = process.argv.slice(2)
if (!sources.length) {
  console.error("Usage: npx tsx scripts/engine-v2/snapshot-rate-parsing.ts <hts.json> [<hts.json> …]")
  process.exit(1)
}

// Silence the parser's per-failure console.error while snapshotting
const error = console.error
console.error = () => {}
const { parsing, base } = buildSnapshots(
  sources.map((source) => JSON.parse(readFileSync(source, "utf8"))),
  current,
)
console.error = error

const dir = path.join(__dirname, "../../testing/engine-v2/fixtures")
writeFileSync(path.join(dir, "rate-parsing-snapshot.json"), JSON.stringify(parsing) + "\n")
writeFileSync(path.join(dir, "base-duty-snapshot.json"), JSON.stringify(base) + "\n")
console.log(`Wrote ${parsing.length} rate strings and ${base.length} base calculations to ${dir}`)
