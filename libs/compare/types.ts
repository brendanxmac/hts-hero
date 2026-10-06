// The shapes behind /compare. Every tool is one record; the "vs", "alternatives" and roundup
// pages are all built from these records, so a fact about a competitor changes in one place.

import type { Faq, Source } from "@/libs/blog/types";

// How well a tool covers a feature, as found on its public site on the date it was checked
export type Support =
  // Included, self-serve
  | "yes"
  // Part of it, or with a catch (see the note)
  | "partial"
  // On a paid plan anyone can buy
  | "paid"
  // Only for the vendor's customers, or after a demo or a sales call
  | "gated"
  // Offered, set up with the vendor's team (an API, an integration)
  | "onRequest"
  // Checked, and it isn't offered
  | "no"
  // Not on the vendor's public site: we don't count it either way
  | "unknown";

export type FeatureKey =
  | "freeToTry"
  | "selfServe"
  | "publishedPricing"
  | "fullStack"
  | "tradePreferences"
  | "adjustments"
  | "entryDate"
  | "rateHistory"
  | "catalogImpact"
  | "countryCompare"
  | "csvUpload"
  | "classification"
  | "api"
  | "changelog";

export interface FeatureValue {
  support: Support;
  note?: string;
}

export interface VsContent {
  // One or two sentences: the honest bottom line, shown at the top of the page
  verdict: string;
  chooseHtsHero: string[];
  chooseThem: string[];
  // The few differences that matter most, each a short heading and a paragraph
  differences: { title: string; body: string }[];
  faqs: Faq[];
}

export interface AlternativesContent {
  intro: string;
  // Why people look for something else
  reasons: string[];
  faqs: Faq[];
}

export interface Tool {
  slug: string;
  name: string;
  // Who makes it, when that isn't obvious from the name
  vendor?: string;
  url: string;
  // What kind of tool it is, in a few words
  kind: string;
  summary: string;
  bestFor: string;
  // Starting price as a short phrase ("Free", "From $99/mo", "Contact sales")
  price: string;
  priceDetail: string;
  features: Record<FeatureKey, FeatureValue>;
  strengths: string[];
  limitations: string[];
  sources: Source[];
  // YYYY-MM-DD: when its public pages were last checked
  checkedAt: string;
  vs?: VsContent;
  alternatives?: AlternativesContent & { slug: string; title: string };
}
