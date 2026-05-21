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

module.exports = {
  siteUrl: process.env.SITE_URL || "https://htshero.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ["/twitter-image.*", "/opengraph-image.*", "/icon.*"],
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
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
