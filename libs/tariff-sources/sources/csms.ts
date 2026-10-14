import type { Collector, SourceItem } from "../types"
import { clip, dateOnly, fetchText, htmlToText, parseRss, toIso, usDateToIso } from "../text"

// CBP's Cargo Systems Messaging Service: how CBP will apply a change (filing instructions, which
// Chapter 99 numbers to report, effective times). Messages go out through GovDelivery, whose topic
// feeds hold only the latest 25 (about three weeks of trade policy messages), so the cron has to
// keep up. A backfill reads CBP's CSMS archive PDFs (one row per message: number, title, date).

const TOPICS: Record<string, string> = {
  USDHSCBP_112: "Trade Policy Updates",
  USDHSCBP_3: "Automated Broker Interface",
}

const ARCHIVE_PAGE = "https://www.cbp.gov/document/publications/csms-archive"

// A message's page: GovDelivery bulletin ids are the CSMS number in hex
const bulletinUrl = (csmsNumber: string) =>
  `https://content.govdelivery.com/accounts/USDHSCBP/bulletins/${Number(csmsNumber).toString(16)}`

// "CSMS # 70165283 - Updated ACE…" → "Updated ACE…"
const stripNumber = (title: string) => title.replace(/^CSMS\s*#\s*\d+\s*[-–—]\s*/i, "").trim()

// The email's text, after its header (everything before the subject repeated in the body)
const messageText = (html: string, title: string) => {
  const text = htmlToText(html)
  const at = text.indexOf(title)
  return at >= 0 ? text.slice(at + title.length).trim() : text
}

const fromFeeds = async (since: Date) => {
  const byNumber = new Map<string, SourceItem>()
  for (const [topic, topicName] of Object.entries(TOPICS)) {
    const xml = await fetchText(`https://public.govdelivery.com/topics/${topic}/feed.rss`)
    for (const entry of parseRss(xml ?? "")) {
      const publishedAt = toIso(entry.pubDate)
      if (new Date(publishedAt) < since) continue
      const number = entry.guid
      const existing = byNumber.get(number)
      if (existing) {
        const topics = existing.raw.topics as string[]
        topics.push(topicName)
        continue
      }
      const title = stripNumber(entry.title)
      byNumber.set(number, {
        source: "csms",
        externalId: number,
        title,
        url: entry.link || bulletinUrl(number),
        publishedAt,
        summary: clip(messageText(entry.description, title)),
        docType: "CSMS message",
        agencies: ["U.S. Customs and Border Protection"],
        raw: { csms_number: number, topics: [topicName] },
      })
    }
  }
  return Array.from(byNumber.values())
}

// Rows of an archive PDF's text: "70054007 UPDATED GUIDANCE: Section 232 … 9/28/2026". Titles can
// wrap onto the next line, so rows are read from the joined text, each ending at its date.
const ROW = /(?:^|\s)(\d{8})\s+([\s\S]+?)\s+(\d{1,2}\/\d{1,2}\/\d{4})(?=\s+\d{8}\s|\s*$|\s+CSMS Archive)/g

const archiveRows = (text: string) =>
  Array.from(
    text
      .replace(/CSMS Archive\s+\S+ \d{1,2} to \S+ \d{1,2}, \d{4}/g, " ")
      .replace(/CSMS # Message Title Sent/g, " ")
      .replace(/\s+/g, " ")
      .matchAll(ROW)
  ).map(([, number, title, date]) => ({ number, title: title.trim(), date: usDateToIso(date) }))

const fromArchive = async (since: Date) => {
  const { extractText, getDocumentProxy } = await import("unpdf")
  const page = await fetchText(ARCHIVE_PAGE)
  // Newest first, as the page lists them
  const pdfs = Array.from(new Set(Array.from((page ?? "").matchAll(/href="([^"]*csms_archive[^"]*\.pdf)"/gi), ([, href]) => href)))
  const items: SourceItem[] = []
  for (const href of pdfs) {
    const response = await fetch(new URL(href, ARCHIVE_PAGE), { signal: AbortSignal.timeout(60_000) })
    if (!response.ok) throw new Error(`CSMS archive ${href} answered ${response.status}`)
    const pdf = await getDocumentProxy(new Uint8Array(await response.arrayBuffer()))
    const { text } = await extractText(pdf, { mergePages: true })
    const rows = archiveRows(text)
    for (const row of rows) {
      if (row.date < since.toISOString().slice(0, 10)) continue
      items.push({
        source: "csms",
        externalId: row.number,
        title: row.title,
        url: bulletinUrl(row.number),
        publishedAt: dateOnly(row.date),
        docType: "CSMS message",
        agencies: ["U.S. Customs and Border Protection"],
        raw: { csms_number: row.number, from_archive: true },
      })
    }
    // This archive already reaches back past `since`
    if (rows.some((row) => row.date < since.toISOString().slice(0, 10))) break
  }
  return items
}

export const csms: Collector = {
  id: "csms",
  collect: async ({ since, backfill }) => {
    const feed = await fromFeeds(since)
    if (!backfill) return feed
    // The feed's copy has the message text, so it wins over the archive's row
    const seen = new Set(feed.map((item) => item.externalId))
    const archive = (await fromArchive(since)).filter((item) => !seen.has(item.externalId))
    return [...feed, ...archive]
  },
}
