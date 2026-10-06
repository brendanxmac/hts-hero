// The countries that get a "[Country] to US tariff calculator" page. Only those with evidence a
// dedicated page can rank: Search Console impressions for "[country] to us tariff calculator" and
// country-specific pages ranking for it (Oct 2026). Add a country only with the same evidence.
// The slug is the page's address: /duty-calculator/<slug>.

export interface CountryPage {
  slug: string;
  code: string;
  name: string;
}

export const COUNTRY_PAGES: CountryPage[] = [
  { slug: "china", code: "CN", name: "China" },
  { slug: "japan", code: "JP", name: "Japan" },
];

export const countryPageBySlug = (slug: string) => COUNTRY_PAGES.find((c) => c.slug === slug);

// "the United Kingdom" → "The United Kingdom", for the start of a sentence or a title
export const capitalized = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
