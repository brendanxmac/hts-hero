// Whether a revision's heading pages hold every subchapter III heading (9903.xx.xx) in
// that revision, according to USITC's archived Chapter 99 PDF (`npm run ch99:archive`,
// tariffs/engine-v2/data/ch99-first-seen.json). When both revisions' pages are complete,
// a comparison can diff every subchapter III heading, including added and removed ones,
// as it does with Chapter 99 JSON.

import archive from "../../tariffs/engine-v2/data/ch99-first-seen.json"
import type { HeadingCoverage, HtsRow } from "./types"

const SUBCHAPTER_III = /^9903\.\d\d\.\d\d$/
const MAX_LISTED = 100

// The subchapter III headings in a revision's tariff tables, or null if the archive
// doesn't cover the revision
export const archivedHeadings = (revision: string): Set<string> | null => {
  const i = archive.revisions.indexOf(revision)
  if (i < 0) return null
  const headings = new Set<string>()
  const entries = archive.headings as Record<string, { first: string; last: string; missingFrom?: string[] }>
  for (const [code, seen] of Object.entries(entries)) {
    const first = archive.revisions.indexOf(seen.first)
    const last = archive.revisions.indexOf(seen.last)
    if (first <= i && i <= last && !seen.missingFrom?.includes(revision)) headings.add(code)
  }
  return headings
}

// The heading a row belongs to: its own number without a statistical suffix, or for a
// description-only row, the heading above it
export const headingOf = (row: Pick<HtsRow, "htsno" | "parentHtsno">) =>
  (row.htsno || row.parentHtsno || "").split(".").slice(0, 3).join(".")

export const isSubchapterIII = (code: string) => SUBCHAPTER_III.test(code)

// Compares the subchapter III headings in a revision's rows with the archive's list
export const headingCoverage = (revision: string, rows: HtsRow[]): HeadingCoverage | null => {
  const expected = archivedHeadings(revision)
  if (!expected) return null
  const present = new Set(rows.filter((r) => r.htsno).map(headingOf).filter(isSubchapterIII))
  const missing = Array.from(expected).filter((c) => !present.has(c)).sort()
  const unexpected = Array.from(present).filter((c) => !expected.has(c)).sort()
  return {
    expected: expected.size,
    complete: missing.length === 0,
    missingCount: missing.length,
    missing: missing.slice(0, MAX_LISTED),
    unexpected: unexpected.slice(0, MAX_LISTED),
  }
}
