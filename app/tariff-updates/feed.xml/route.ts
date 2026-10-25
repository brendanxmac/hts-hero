import config from "@/config"
import { getPublishedUpdates } from "@/libs/tariff-updates/public"

// The tariff updates as RSS, newest activity first, for readers and for crawlers that find new
// pages through feeds. Refreshed with the page.
export const revalidate = 3600

const SITE = `https://${config.domainName}`

const escapeXml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

export async function GET() {
  const updates = (await getPublishedUpdates()).slice(0, 100)
  const items = updates
    .map((u) => {
      const url = `${SITE}/tariff-updates/${u.slug}`
      return `    <item>
      <title>${escapeXml(u.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(u.summary)}</description>
      <pubDate>${new Date(u.first_seen_at).toUTCString()}</pubDate>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Latest US Tariff Updates | HTS Hero</title>
    <link>${SITE}/tariff-updates</link>
    <description>Every new US tariff action from the White House, Federal Register, CBP and USTR, in plain English.</description>
    <language>en-us</language>
    <atom:link href="${SITE}/tariff-updates/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } })
}
