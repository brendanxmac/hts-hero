// Small helpers for reading feeds and pages: fetching, a minimal RSS reader, HTML to text, dates.

const USER_AGENT = "Mozilla/5.0 (compatible; HTSHeroTariffUpdates/1.0; +https://htshero.com/tariff-updates)"

// The page's text, or null for a 404 (paging past the end of an archive)
export const fetchText = async (url: string): Promise<string | null> => {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  return response.text()
}

export const fetchJson = async <T>(url: string): Promise<T> => {
  const text = await fetchText(url)
  if (text === null) throw new Error(`${url} answered 404`)
  return JSON.parse(text) as T
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }

export const decodeEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : match
    }
    return ENTITIES[code.toLowerCase()] ?? match
  })

const unwrapCdata = (text: string) => text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")

export const htmlToText = (html: string) =>
  decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(style|script|head)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim()

// At most `max` characters, cut at a word
export const clip = (text: string | null | undefined, max = 600) => {
  if (!text) return null
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 40))}…`
}

export interface RssItem {
  title: string
  link: string
  guid: string
  pubDate: string
  // HTML
  description: string
  content: string
  categories: string[]
}

const tag = (xml: string, name: string) => {
  const match = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`))
  return match ? unwrapCdata(match[1]).trim() : ""
}

// Enough RSS 2.0 for the feeds we read (WordPress, Drupal, GovDelivery)
export const parseRss = (xml: string): RssItem[] =>
  Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)).map(([, item]) => ({
    title: decodeEntities(htmlToText(tag(item, "title"))),
    link: decodeEntities(tag(item, "link")),
    guid: decodeEntities(tag(item, "guid")),
    pubDate: tag(item, "pubDate"),
    description: decodeEntities(tag(item, "description")),
    content: tag(item, "content:encoded"),
    categories: Array.from(item.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/g)).map(([, c]) =>
      decodeEntities(unwrapCdata(c)).trim()
    ),
  }))

// "2026-10-14" → 10:00 UTC that day (see SourceItem.publishedAt)
export const dateOnly = (isoDate: string) => `${isoDate}T10:00:00.000Z`

// "9/30/2026" or "09/30/2026" → "2026-09-30"
export const usDateToIso = (usDate: string) => {
  const [month, day, year] = usDate.split("/")
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

export const toIso = (date: string) => {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) throw new Error(`Unreadable date: ${date}`)
  return parsed.toISOString()
}

export const isoDay = (date: Date) => date.toISOString().slice(0, 10)

// Runs `fn` over `items`, `limit` at a time
export const mapLimit = async <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> => {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}
