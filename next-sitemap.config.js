module.exports = {
  // REQUIRED:
  siteUrl: process.env.SITE_URL || "https://htshero.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  // use this to exclude routes from the sitemap (i.e. a user dashboard). By default, NextJS app router metadata files are excluded (https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
  exclude: ["/twitter-image.*", "/opengraph-image.*", "/icon.*"],
  transform: async (config, path) => {
    if (path.startsWith("/hts/")) {
      return {
        loc: path,
        changefreq: "monthly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      };
    }
    if (path === "/duty-calculator") {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
