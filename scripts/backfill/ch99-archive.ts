// Reads USITC's archived Chapter 99 PDF for each HTS revision and lists the
// subchapter III headings (9903.xx.xx) in its tariff tables. Independent of the
// revision checker's uploads: a second source for backfilling (HowTariffsWork.md §17.13).
//
//   npm run ch99:archive                          every revision since 2025: writes data/ch99-first-seen.json
//   npm run ch99:archive -- --step 2026HTSRev4    headings added and removed between 2026HTSRev4 and the next revision
//
// PDFs are cached in node_modules/.cache/hts-archive/.
// Source: https://hts.usitc.gov/reststop/file?release=<revision>&filename=Chapter 99
//
// A heading is in a revision if its number starts a row of the tariff table:
// on a table page (one with the "Heading/" and "Article Description" column
// headers), right after leader dots or a footnote marker ("1/"), or at the start
// of a line. Numbers mentioned in descriptions don't count, and neither do the
// notes, which name headings before and after they exist. Checked against the
// coverage checker's count of 9903 headings for 2026HTSRev20 (637).
//
// It sees headings only. Changes made only in the notes (lists, wording) need the
// change record and the notes diff.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { extractText, getDocumentProxy } from "unpdf"
import { HtsRevisions } from "../../tariffs/engine-v2/revisions"

const CACHE = join("node_modules", ".cache", "hts-archive")
const OUTPUT = join("tariffs", "engine-v2", "data", "ch99-first-seen.json")
const FIRST = "2025HTSBasic"
const HEADING = String.raw`9903\.\d\d\.\d\d`

const fail = (message: string): never => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

const pdfUrl = (revision: string) =>
  `https://hts.usitc.gov/reststop/file?release=${encodeURIComponent(revision)}&filename=${encodeURIComponent("Chapter 99")}`

const loadPdf = async (revision: string) => {
  const path = join(CACHE, `${revision}-ch99.pdf`)
  if (existsSync(path)) return new Uint8Array(readFileSync(path))
  const response = await fetch(pdfUrl(revision))
  const bytes = new Uint8Array(await response.arrayBuffer())
  // USITC answers unknown releases with an HTML page
  if (!response.ok || String.fromCharCode(...Array.from(bytes.slice(0, 5))) !== "%PDF-") {
    fail(`USITC didn't return a PDF for ${revision} (HTTP ${response.status})`)
  }
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(path, bytes)
  return bytes
}

export const headingsInTables = (pages: string[]) => {
  const found = new Set<string>()
  const afterMarker = new RegExp(String.raw`(?:\.{2,}|\d/)\s*(${HEADING})(?!\d)`, "g")
  const lineStart = new RegExp(String.raw`^\s*(?:\d+/)?(${HEADING})(?![\d,])`, "gm")
  for (const page of pages) {
    if (!page.includes("Heading/") || !page.includes("Article Description")) continue
    for (const pattern of [afterMarker, lineStart]) {
      for (const match of Array.from(page.matchAll(pattern))) found.add(match[1])
    }
  }
  return found
}

const headingsFor = async (revision: string) => {
  const pdf = await getDocumentProxy(await loadPdf(revision))
  const { text } = await extractText(pdf, { mergePages: false })
  return headingsInTables(text as string[])
}

const byCode = (a: string, b: string) => a.localeCompare(b)

const step = async (fromName: string) => {
  const i = HtsRevisions.findIndex((r) => r.name === fromName)
  if (i < 0 || i === HtsRevisions.length - 1) fail(`${fromName} isn't a revision with a next one`)
  const toName = HtsRevisions[i + 1].name
  const [before, after] = await Promise.all([headingsFor(fromName), headingsFor(toName)])
  const added = Array.from(after).filter((c) => !before.has(c)).sort(byCode)
  const removed = Array.from(before).filter((c) => !after.has(c)).sort(byCode)
  console.log(`\n${fromName} → ${toName}: ${before.size} → ${after.size} subchapter III headings`)
  console.log(`  Added in ${toName} (${added.length}): ${added.join(", ") || "none"}`)
  console.log(`  Removed in ${toName} (${removed.length}): ${removed.join(", ") || "none"}`)
  console.log("\n  Headings only; check note changes against the change record.\n")
}

const all = async () => {
  const start = HtsRevisions.findIndex((r) => r.name === FIRST)
  const revisions = HtsRevisions.slice(start).map((r) => r.name)
  const sets: Set<string>[] = []
  for (const revision of revisions) {
    sets.push(await headingsFor(revision))
    process.stdout.write(`  ${revision}: ${sets[sets.length - 1].size}\n`)
  }
  const codes = Array.from(new Set(sets.flatMap((s) => Array.from(s)))).sort(byCode)
  const headings: Record<string, { first: string; last: string; missingFrom?: string[] }> = {}
  for (const code of codes) {
    const present = revisions.filter((_, i) => sets[i].has(code))
    const first = revisions.indexOf(present[0])
    const last = revisions.indexOf(present[present.length - 1])
    const missingFrom = revisions.slice(first, last + 1).filter((_, i) => !sets[first + i].has(code))
    headings[code] = { first: present[0], last: present[present.length - 1], ...(missingFrom.length ? { missingFrom } : {}) }
  }
  writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        about:
          "Subchapter III headings in the tariff tables of USITC's archived Chapter 99 PDF for each revision. `first` is evidence of when a heading entered the HTS, not its legal effective date. Generated by `npm run ch99:archive`.",
        revisions,
        headings,
      },
      null,
      1
    ) + "\n"
  )
  console.log(`\n✓ Wrote ${OUTPUT}: ${codes.length} headings across ${revisions.length} revisions\n`)
}

const main = async () => {
  const args = process.argv.slice(2)
  const i = args.indexOf("--step")
  if (i >= 0) return step(args[i + 1] ?? fail("Usage: npm run ch99:archive -- --step <older revision>"))
  return all()
}

main().catch((error) => fail((error as Error).message))
