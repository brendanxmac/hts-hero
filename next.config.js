const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseDomain = new URL(supabaseUrl).hostname;

console.log("supabaseUrl", supabaseUrl);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      supabaseDomain,
      "lh3.googleusercontent.com",
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
