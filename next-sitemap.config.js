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
      ? pako.ungzip(u8, { to: "string" })
      : pako.inflate(u8, { to: "string" });
  const elements = JSON.parse(decompressed);

  const codes = elements
    .filter((el) => el.htsno && el.htsno.trim().length > 0)
    .map((el) => el.htsno);

  return { codes, revisionDate: revision.created_at };
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

// Server-rendered pages to list, with their priority
const KEY_PAGES = [
  ["/duty-calculator", 1.0],
  ["/duty-calculator/countries", 0.9],
  ...COUNTRY_PAGES.map((c) => [`/duty-calculator/${c.slug}`, 0.9]),
  ["/duty-calculator/faq", 0.7],
  ["/duty-calculator/changelog", 0.6],
  ["/pricing-calculator", 0.6],
  ["/explore", 0.5],
];

// How much each page matters to us, relative to the others. Bing reads it; Google ignores it,
// so what the sitemap includes matters far more.
function priorityOf(path) {
  const key = KEY_PAGES.find(([loc]) => loc === path);
  if (key) return key[1];
  if (path === "/") return 0.9;
  if (path === "/tariff-tracker") return 0.8;
  if (path === "/compare" || path.startsWith("/compare/")) return 0.8;
  if (path === "/blog") return 0.7;
  if (path.startsWith("/blog/category/") || path.startsWith("/blog/author/")) return 0.4;
  if (path.startsWith("/blog/")) return 0.7;
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
    "/sign-out",
    "/reset-password",
    "/settings*",
    // Feeds and machine-readable files aren't pages
    "/blog/feed.xml",
    "/llms.txt",
    // Retired or stale: the Tariff Impact Checker (being sunset; its tool stays up for existing
    // users), the old tariff coverage and pending-announcement pages, and /about/tariffs, which
    // redirects to /duty-calculator
    "/about/*",
    "/tariffs/*",
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
    const lastmod = new Date(revisionDate).toISOString();
    const pages = KEY_PAGES.map(([loc]) => ({ loc, changefreq: config.changefreq, priority: priorityOf(loc) }));
    return [
      ...pages,
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
