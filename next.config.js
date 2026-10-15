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
      // The old pending tariff announcements page; /tariff-updates follows every tariff action now
      { source: "/tariffs/pending", destination: "/tariff-updates", permanent: true },
      // Blog categories retired in the 2026 blog redesign
      { source: "/blog/category/feature", destination: "/blog/category/product", permanent: true },
      { source: "/blog/category/tutorial", destination: "/blog", permanent: true },
      // The Tariff Watcher tab on the calculator is now the Tariff Tracker
      {
        source: "/duty-calculator",
        has: [{ type: "query", key: "tool", value: "watcher" }],
        destination: "/tariff-tracker",
        permanent: true,
      },
    ];
  },
  // The HTS code pages read the Census import figures from these files on the server
  experimental: {
    outputFileTracingIncludes: {
      "/hts/[code]": ["./public/data/us-imports/**"],
      "/api/mcp": ["./public/data/us-imports/**"],
      // Tracker snapshots work out origin savings from the same Census files
      "/api/cron/tracker-snapshots": ["./public/data/us-imports/**"],
      "/api/cron/tariff-updates": ["./public/data/us-imports/**"],
      "/api/tariff-updates/[id]": ["./public/data/us-imports/**"],
      // The social studio's posts and daily ideas read them too
      "/api/social-studio/**": ["./public/data/us-imports/**"],
      "/api/cron/social-ideas": ["./public/data/us-imports/**"],
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
