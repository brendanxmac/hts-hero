import config from "@/config";
import { authorBySlug } from "@/libs/blog/catalog";
import { getPosts } from "@/libs/blog/posts";

// The blog's RSS feed, for readers and for crawlers that discover new posts through feeds
export const dynamic = "force-static";

const SITE = `https://${config.domainName}`;

const escapeXml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const rfc822 = (isoDate: string) => new Date(`${isoDate}T12:00:00Z`).toUTCString();

export function GET() {
  const posts = getPosts();
  const items = posts
    .map((post) => {
      const url = `${SITE}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${rfc822(post.publishedAt)}</pubDate>
      <dc:creator>${escapeXml(authorBySlug(post.author)?.name ?? config.appName)}</dc:creator>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>HTS Hero Blog</title>
    <link>${SITE}/blog</link>
    <description>US tariff guides, tariff updates and HTS revision breakdowns from HTS Hero.</description>
    <language>en-us</language>
    <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
