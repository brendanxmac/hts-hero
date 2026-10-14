import type { Collector, SourceItem } from "../types"
import { clip, dateOnly, decodeEntities, fetchText, htmlToText, mapLimit, parseRss, toIso } from "../text"

// USTR press releases: Section 301 actions, trade deals, exclusions. The RSS feed holds the latest
// 10. A backfill reads the monthly press release listings, then each release for its date (the
// listings don't show one).

const FEED = "https://ustr.gov/rss.xml"
const BASE = "https://ustr.gov"
const LISTING = `${BASE}/about/policy-offices/press-office/press-releases`

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
const DATE = new RegExp(`\\b(${MONTHS.join("|")}) (\\d{1,2}), (\\d{4})\\b`, "i")

// The description starts with the title again, then the author and time ("pbrouillette Tue,
// 10/13/2026 - 15:03")
const summaryOf = (descriptionHtml: string, title: string) => {
  const text = htmlToText(descriptionHtml)
  const body = text.startsWith(title) ? text.slice(title.length).trim() : text
  return clip(body.replace(/^\S+ \w{3}, \d{2}\/\d{2}\/\d{4} - \d{2}:\d{2}\s*/, ""))
}

const fromFeed = async (since: Date) => {
  const xml = await fetchText(FEED)
  return parseRss(xml ?? "")
    .filter((entry) => entry.link.includes("/press-releases/"))
    .map(
      (entry): SourceItem => ({
        source: "ustr",
        externalId: new URL(entry.link).pathname,
        title: entry.title,
        url: entry.link,
        publishedAt: toIso(entry.pubDate),
        summary: summaryOf(entry.description, entry.title),
        docType: "Press release",
        agencies: ["Office of the U.S. Trade Representative"],
      })
    )
    .filter((item) => new Date(item.publishedAt) >= since)
}

// Each month from `since` through this one
const monthsSince = (since: Date) => {
  const months: { year: number; month: number }[] = []
  const now = new Date()
  for (const d = new Date(Date.UTC(since.getUTCFullYear(), since.getUTCMonth(), 1)); d <= now; d.setUTCMonth(d.getUTCMonth() + 1)) {
    months.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() })
  }
  return months
}

const fromListings = async (since: Date) => {
  const links = new Map<string, string>()
  for (const { year, month } of monthsSince(since)) {
    const html = await fetchText(`${LISTING}/${year}/${MONTHS[month]}`)
    const pattern = new RegExp(`href="(/about/policy-offices/press-office/press-releases/${year}/${MONTHS[month]}/[^"]+)"[^>]*title="([^"]*)"`, "g")
    for (const [, path, title] of Array.from((html ?? "").matchAll(pattern))) links.set(path, decodeEntities(title))
  }
  const items = await mapLimit(Array.from(links), 4, async ([path, title]): Promise<SourceItem | null> => {
    const html = await fetchText(`${BASE}${path}`)
    const match = html && htmlToText(html).match(DATE)
    if (!match) return null
    const [, monthName, day, year] = match
    const date = `${year}-${String(MONTHS.indexOf(monthName.toLowerCase()) + 1).padStart(2, "0")}-${day.padStart(2, "0")}`
    return {
      source: "ustr",
      externalId: path,
      title,
      url: `${BASE}${path}`,
      publishedAt: dateOnly(date),
      docType: "Press release",
      agencies: ["Office of the U.S. Trade Representative"],
    }
  })
  return items.filter((item): item is SourceItem => !!item && new Date(item.publishedAt) >= since)
}

export const ustr: Collector = {
  id: "ustr",
  collect: async ({ since, backfill }) => {
    const feed = await fromFeed(since)
    if (!backfill) return feed
    // The feed's copy has a summary and the exact time, so it wins
    const seen = new Set(feed.map((item) => item.externalId))
    return [...feed, ...(await fromListings(since)).filter((item) => !seen.has(item.externalId))]
  },
}
