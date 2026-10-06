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
      // The Tariff Watcher tab on the calculator is now the Tariff Tracker
      {
        source: "/duty-calculator",
        has: [{ type: "query", key: "tool", value: "watcher" }],
        destination: "/tariff-tracker",
        permanent: true,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
