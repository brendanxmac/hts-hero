import countries from "./countries.json";

// The countries that get a "[Country] to US tariff calculator" page: the largest sources of US
// imports by 2025 value (Census Bureau; see import-stats.json and `npm run sync-country-imports`),
// in that order. The list lives in countries.json so next-sitemap.config.js reads the same one.
// The slug is the page's address: /duty-calculator/<slug>. Names that take "the" carry it
// ("the United Kingdom"); titles drop it.

export interface CountryPage {
  slug: string;
  code: string;
  name: string;
}

export const COUNTRY_PAGES: CountryPage[] = countries;

export const countryPageBySlug = (slug: string) => COUNTRY_PAGES.find((c) => c.slug === slug);

export const countryPageByCode = (code: string) => COUNTRY_PAGES.find((c) => c.code === code);

// "the United Kingdom" → "The United Kingdom", for the start of a sentence or a title
export const capitalized = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
