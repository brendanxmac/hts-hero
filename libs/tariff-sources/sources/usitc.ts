import type { Collector, SourceItem } from "../types"
import { fetchJson, toIso, usDateToIso } from "../text"

// USITC's HTS releases: the "In the HTS" stage. The release list has every revision with the date
// USITC posted it and the date it takes effect. The same list feeds `npm run sync-revisions`.

const RELEASE_LIST = "https://hts.usitc.gov/reststop/releaseList"

interface UsitcRelease {
  name: string // "2026HTSRev21"
  title: string // "Revision 21 (2026)"
  date: string // posted, "10/07/2026"
  time: string // "11:55:13"
  releaseStartDate: string | null
  releaseEndDate: string | null
  status: string
}

const changeRecordUrl = (name: string) =>
  `https://hts.usitc.gov/reststop/file?release=${encodeURIComponent(name)}&filename=${encodeURIComponent("Change Record")}`

export const usitc: Collector = {
  id: "usitc",
  collect: async ({ since }) => {
    const releases = await fetchJson<UsitcRelease[]>(RELEASE_LIST)
    return releases
      .filter((r) => /^\d{4}HTS/.test(r.name) && r.date)
      .map((r): SourceItem => {
        const effective = r.releaseStartDate ? usDateToIso(r.releaseStartDate) : null
        return {
          source: "usitc",
          externalId: r.name,
          title: r.name.includes("Basic") ? `HTS Basic Edition ${r.title}` : `HTS ${r.title}`,
          url: changeRecordUrl(r.name),
          // Posted time is US Eastern
          publishedAt: toIso(`${usDateToIso(r.date)}T${r.time || "12:00:00"}-04:00`),
          summary: effective ? `In effect from ${effective}.` : null,
          docType: "HTS revision",
          agencies: ["U.S. International Trade Commission"],
          raw: { effective_from: effective, effective_to: r.releaseEndDate ? usDateToIso(r.releaseEndDate) : null, status: r.status },
        }
      })
      .filter((item) => new Date(item.publishedAt) >= since)
  },
}
