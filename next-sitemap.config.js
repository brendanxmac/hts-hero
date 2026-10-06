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
  ],
  additionalPaths: async (config) => {
    const { codes, revisionDate } = await getHtsCodes();
    const lastmod = new Date(revisionDate).toISOString();
    return codes.map((code) => ({
      loc: `/hts/${code}`,
      changefreq: "monthly",
      priority: 0.7,
      lastmod,
    }));
  },
  // A lastmod only where we know when the page last changed: a blog post's updatedAt. A build
  // time on every URL tells search engines nothing, so they learn to ignore it.
  transform: async (config, path) => {
    const slug = path.startsWith("/blog/") ? path.slice("/blog/".length) : null;
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: slug ? blogPostDates()[slug] : undefined,
    };
  },
};
