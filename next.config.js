const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseDomain = new URL(supabaseUrl).hostname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      // NextJS <Image> component needs to whitelist domains for src={}
      {
        protocol: "https",
        hostname: supabaseDomain,
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      // The old tariff calculator landing page; /duty-calculator replaced it and targets the same
      // searches, so its signals go there
      { source: "/about/tariffs", destination: "/duty-calculator", permanent: true },
      // Tariff Tracker was rebranded Duty Guard (2026-11-01)
      { source: "/tariff-tracker", destination: "/duty-guard", permanent: true },
      // The audit sales page was renamed (2026-11-01)
      { source: "/tariff-audit", destination: "/duty-audit", permanent: true },
      // Duty Guard's old landing page; /tariff-alerts sells the same thing now (2026-10-31)
      { source: "/tariff-monitor", destination: "/tariff-alerts", permanent: true },
      // The old pending tariff announcements page; /tariff-updates follows every tariff action now
      { source: "/tariffs/pending", destination: "/tariff-updates", permanent: true },
      // Blog categories retired in the 2026 blog redesign
      { source: "/blog/category/feature", destination: "/blog/category/product", permanent: true },
      { source: "/blog/category/tutorial", destination: "/blog", permanent: true },
      // The Social Studio was renamed the Content Studio
      { source: "/social-studio", destination: "/content-studio", permanent: true },
      // The Tariff Watcher tab on the calculator is now Duty Guard
      {
        source: "/duty-calculator",
        has: [{ type: "query", key: "tool", value: "watcher" }],
        destination: "/duty-guard",
        permanent: true,
      },
    ];
  },
  // The HTS code pages read the Census import figures from these files on the server
  outputFileTracingIncludes: {
    "/hts/[code]": ["./public/data/us-imports/**"],
    "/api/mcp": ["./public/data/us-imports/**"],
    // Duty Guard snapshots work out origin savings from the same Census files
    "/api/cron/tracker-snapshots": ["./public/data/us-imports/**"],
    "/api/cron/tariff-updates": ["./public/data/us-imports/**"],
    "/api/tariff-updates/[id]": ["./public/data/us-imports/**"],
    // The Content Studio's posts and ideas read them too
    "/api/social-studio/**": ["./public/data/us-imports/**"],
  },
  // Keep the optional native canvas package out of the bundles (PDF libraries reach for it)
  turbopack: {
    resolveAlias: {
      canvas: "./libs/empty-module.js",
    },
  },
};

module.exports = nextConfig;
