// Regenerates tariffs/engine-v2/data/hts-revisions.json from the USITC release list.
// Run after USITC publishes a new revision: `npm run sync-revisions`
import { writeFileSync } from "fs"
import { join } from "path"

const RELEASE_LIST_URL = "https://hts.usitc.gov/reststop/releaseList"
// Earliest year we track. Revisions before this are ignored.
const FIRST_YEAR = 2025

interface UsitcRelease {
  name: string // "2026HTSRev20"
  title: string // "Revision 20 (2026)"
  releaseStartDate: string | null // "09/28/2026"
  releaseEndDate: string | null
  status: string
}

// "09/28/2026" -> "2026-09-28"
const toIsoDate = (usDate: string | null) => {
  if (!usDate) return undefined
  const [month, day, year] = usDate.split("/")
  return `${year}-${month}-${day}`
}

const main = async () => {
  const response = await fetch(RELEASE_LIST_URL)
  if (!response.ok) {
    throw new Error(`USITC release list request failed: ${response.status}`)
  }
  const releases: UsitcRelease[] = await response.json()

  const revisions = releases
    .filter((r) => Number(r.name.slice(0, 4)) >= FIRST_YEAR)
    .filter((r) => r.releaseStartDate)
    .map((r) => ({
      name: r.name,
      // USITC titles basic editions as just "(2026)"
      title: r.name.includes("Basic")
        ? `Basic Edition ${r.title}`
        : r.title,
      from: toIsoDate(r.releaseStartDate),
      to: toIsoDate(r.releaseEndDate),
    }))
    .sort((a, b) => a.from.localeCompare(b.from))

  const outputPath = join(__dirname, "..", "..", "tariffs", "engine-v2", "data", "hts-revisions.json")
  writeFileSync(outputPath, JSON.stringify(revisions, null, 2) + "\n")
  console.log(`Wrote ${revisions.length} revisions to ${outputPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
