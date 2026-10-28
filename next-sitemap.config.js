const { createClient } = require("@supabase/supabase-js");
const pako = require("pako");

async function getHtsCodes() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: revision, error: revError } = await supabase
    .from("hts_revisions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (revError) throw new Error(`Failed to get HTS revision: ${revError.message}`);

  const { data: blob, error: dlError } = await supabase.storage
    .from("hts-revisions")
    .download(`${revision.name}.json.gz`);

  if (dlError) throw new Error(`Failed to download HTS data: ${dlError.message}`);

  const arrayBuffer = await blob.arrayBuffer();
  const u8 = new Uint8Array(arrayBuffer);
  const decompressed =
    u8.length >= 2 && u8[0] === 0x1f && u8[1] === 0x8b
      ? pako.ungzip(u8, { toText: true })
      : pako.inflate(u8, { toText: true });
  const elements = JSON.parse(decompressed);

  const codes = elements
    .filter((el) => el.htsno && el.htsno.trim().length > 0)
    .map((el) => el.htsno);

  return { codes, revisionDate: revision.created_at };
}

// Published tariff updates (/tariff-updates/[slug]), each with its latest activity. Pages added
// after a build are found through the list page and its RSS feed until the next build.
async function getTariffUpdates() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from("tariff_updates")
    .select("id, slug, kind, last_activity_at")
    .eq("status", "published")
    .order("last_activity_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error(`Failed to get tariff updates: ${error.message}`);
  // An HTS revision's page is noindexed until the calculator changelog describes the revision
  // (app/tariff-updates/[slug]), so it stays out of the sitemap until then too
  const { data: releases } = await supabase.from("tariff_source_items").select("update_id, external_id").eq("source", "usitc").not("update_id", "is", null);
  const { data: entries } = await supabase.from("tariff_changelog").select("revision").eq("status", "published").eq("type", "revision");
  const described = new Set((entries || []).map((e) => e.revision));
  const releaseOf = new Map((releases || []).map((r) => [r.update_id, r.external_id]));
  return data.filter((u) => u.kind !== "hts_revision" || described.has(releaseOf.get(u.id)));
}

// Each blog post's last update, from its frontmatter
let postDates = null;
function blogPostDates() {
  if (postDates) return postDates;
  const fs = require("fs");
  const path = require("path");
  const matter = require("gray-matter");
  const dir = path.join(__dirname, "content/blog");
  postDates = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
    const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const date = data.updatedAt || data.publishedAt;
    if (date) postDates[file.replace(/\.mdx$/, "")] = new Date(date).toISOString();
  }
  return postDates;
}

// The "[Country] to US tariff calculator" pages, from the same list the pages are built from
const COUNTRY_PAGES = require("./libs/country-pages/countries.json");

// The /tariffs program pages, by the slugs in the list they're built from (a TypeScript file, read
// as text here)
function programHubSlugs() {
  const fs = require("fs");
  const path = require("path");
  const source = fs.readFileSync(path.join(__dirname, "libs/tariff-programs/hubs.ts"), "utf8");
  return Array.from(source.matchAll(/slug: "([a-z0-9-]+)"/g), (m) => m[1]);
}

// Server-rendered pages to list, with their priority
const KEY_PAGES = [
  ["/duty-calculator", 1.0],
  ["/duty-calculator/countries", 0.9],
  ...COUNTRY_PAGES.map((c) => [`/duty-calculator/${c.slug}`, 0.9]),
  ["/duty-calculator/faq", 0.7],
  ["/duty-calculator/changelog", 0.6],
  ["/tariff-alerts", 0.9],
  ["/tariff-monitor", 0.9],
  ["/tariff-audit", 0.9],
  ["/tariff-updates", 0.9],
  ["/tariffs", 0.8],
  ...programHubSlugs().map((slug) => [`/tariffs/${slug}`, 0.8]),
  ["/classify", 0.8],
  ["/pricing-calculator", 0.6],
  ["/explore", 0.5],
];

// How much each page matters to us, relative to the others. Bing reads it; Google ignores it,
// so what the sitemap includes matters far more.
function priorityOf(path) {
  const key = KEY_PAGES.find(([loc]) => loc === path);
  if (key) return key[1];
  if (path === "/") return 0.9;
  if (path === "/compare" || path.startsWith("/compare/")) return 0.8;
  if (path === "/blog") return 0.7;
  if (path.startsWith("/blog/category/") || path.startsWith("/blog/author/")) return 0.4;
  if (path.startsWith("/blog/")) return 0.7;
  if (path.startsWith("/tariff-updates/")) return 0.6;
  if (path.startsWith("/hts/")) return 0.5;
  if (["/tos", "/privacy-policy"].includes(path)) return 0.2;
  return 0.6;
}

module.exports = {
  siteUrl: process.env.SITE_URL || "https://htshero.com",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      // Calculator links with inputs (?code=, ?country=…) all canonicalize to the calculator page;
      // keep crawlers on the page itself, not tens of thousands of parameter variants
      { userAgent: "*", allow: "/", disallow: ["/duty-calculator?", "/duty-calculator/*?", "/tariff-tracker?"] },
    ],
  },
  sitemapSize: 5000,
  exclude: [
    "/twitter-image.*",
    "/opengraph-image.*",
    "*/opengraph-image*",
    "/icon.*",
    "/apple-icon.*",
    "/revision-checker*",
    "/coverage-checker*",
    // Account pages: nothing for search engines here
    "/signin",
    // The Tariff Tracker app is noindexed; /tariff-monitor is its page
    "/tariff-tracker",
    // Local previews without sign-in (never committed or deployed)
    "/zz-*",
    "/sign-out",
    "/reset-password",
    "/settings*",
    // Feeds and machine-readable files aren't pages
    "/blog/feed.xml",
    "/tariff-updates/feed.xml",
    "/tariff-updates/subscription",
    "/llms.txt",
    // Retired or stale: the Tariff Impact Checker (being sunset; its tool stays up for existing
    // users), the old tariff coverage and pending-announcement pages, and /about/tariffs, which
    // redirects to /duty-calculator. The /tariffs program pages are listed in KEY_PAGES.
    "/about/*",
    "/tariffs/impact-checker*",
    "/tariffs/coverage*",
    "/tariffs/pending*",
    // HTS browsing hubs: still crawlable (they link down to the /hts pages) but not pages to
    // rank in their own right
    "/chapter/*",
    "/section/*",
    // Shared classifications and gated downloads
    "/c/*",
    "/playbook-download",
  ],
  // Pages rendered on each request aren't in the build output next-sitemap reads, so the ones we
  // want found are listed here: above all the calculator, which this whole sitemap supports
  additionalPaths: async (config) => {
    const { codes, revisionDate } = await getHtsCodes();
    const updates = await getTariffUpdates();
    const lastmod = new Date(revisionDate).toISOString();
    const pages = KEY_PAGES.map(([loc]) => ({ loc, changefreq: config.changefreq, priority: priorityOf(loc) }));
    return [
      ...pages,
      ...updates.map((u) => ({
        loc: `/tariff-updates/${u.slug}`,
        changefreq: "weekly",
        priority: priorityOf(`/tariff-updates/${u.slug}`),
        lastmod: new Date(u.last_activity_at).toISOString(),
      })),
      ...codes.map((code) => ({
        loc: `/hts/${code}`,
        changefreq: "monthly",
        priority: priorityOf(`/hts/${code}`),
        lastmod,
      })),
    ];
  },
  // A lastmod only where we know when the page last changed: a blog post's updatedAt. A build
  // time on every URL tells search engines nothing, so they learn to ignore it.
  transform: async (config, path) => {
    const slug = path.startsWith("/blog/") ? path.slice("/blog/".length) : null;
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priorityOf(path),
      lastmod: slug ? blogPostDates()[slug] : undefined,
    };
  },
};

// For tests
module.exports.KEY_PAGES = KEY_PAGES;
module.exports.priorityOf = priorityOf;
