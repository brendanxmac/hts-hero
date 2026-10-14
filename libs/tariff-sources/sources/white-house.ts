import type { Collector, SourceItem } from "../types"
import { clip, fetchText, htmlToText, parseRss, toIso } from "../text"

// Presidential actions (proclamations, executive orders, memoranda) from the White House's
// WordPress feed: usually the first official word of a tariff action, the day it's signed.
// The feed holds the latest 30; `?paged=N` pages back through older ones.

const FEED = "https://www.whitehouse.gov/presidential-actions/feed/"
const MAX_PAGES = 60

export const whiteHouse: Collector = {
  id: "white_house",
  collect: async ({ since, backfill }) => {
    const items: SourceItem[] = []
    for (let page = 1; page <= (backfill ? MAX_PAGES : 1); page++) {
      const xml = await fetchText(page === 1 ? FEED : `${FEED}?paged=${page}`)
      if (!xml) break
      const entries = parseRss(xml)
      if (!entries.length) break
      for (const entry of entries) {
        const publishedAt = toIso(entry.pubDate)
        if (new Date(publishedAt) < since) continue
        items.push({
          source: "white_house",
          externalId: entry.guid || entry.link,
          title: entry.title,
          url: entry.link,
          publishedAt,
          summary: clip(htmlToText(entry.description)),
          // Every item is "Presidential Actions"; the other category says what kind
          docType: entry.categories.find((c) => c !== "Presidential Actions") ?? null,
          raw: { categories: entry.categories },
        })
      }
      if (new Date(toIso(entries[entries.length - 1].pubDate)) < since) break
    }
    return items
  },
}
