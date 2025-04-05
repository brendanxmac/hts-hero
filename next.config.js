/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      // TODO: see what can be removed here...
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "logos-world.net",
    ],
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.node/,
      use: "raw-loader",
    });
    if (!isServer) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
