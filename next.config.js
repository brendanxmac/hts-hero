/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      // TODO: see what can be removed here...
      "lh3.googleusercontent.com",
      // "pbs.twimg.com",
      // "images.unsplash.com",
      // "logos-world.net",
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
