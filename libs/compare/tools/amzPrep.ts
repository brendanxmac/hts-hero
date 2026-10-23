import type { Tool } from "../types";

export const AMZ_PREP: Tool = {
  slug: "amz-prep",
  name: "AMZ Prep Tariff Calculator",
  vendor: "AMZ Prep",
  url: "https://amzprep.com/us-reciprocal-tariffs-calculator/",
  kind: "Free calculator from a 3PL",
  summary:
    "A simple free tariff calculator from AMZ Prep, a 3PL for Amazon sellers. It lists the tariff layers by country, Section 232 sector and Section 301 list, and you enter the base rate yourself.",
  bestFor: "Amazon sellers who want a rough estimate",
  price: "Free",
  priceDetail: "Free to use.",
  features: {
    freeToTry: { support: "yes", evidence: { url: "https://amzprep.com/us-reciprocal-tariffs-calculator/", checkedAt: "2026-10-23", quote: "No signup, no email gate" } },
    selfServe: { support: "yes", evidence: { url: "https://amzprep.com/us-reciprocal-tariffs-calculator/", checkedAt: "2026-10-23", quote: "No signup, no email gate" } },
    publishedPricing: { support: "yes", note: "Free", evidence: { url: "https://amzprep.com/us-reciprocal-tariffs-calculator/", checkedAt: "2026-10-23", quote: "This free US import duty calculator covers:" } },
    fullStack: { support: "partial", note: "Layers by country, sector and Section 301 list; you enter the base rate yourself", evidence: { url: "https://amzprep.com/us-reciprocal-tariffs-calculator/", checkedAt: "2026-10-23", quote: "Needed for an accurate total and for the EU, Taiwan, Japan, Korea and Switzerland caps. Leave blank to see additional tariffs only." } },
    adcvd: { support: "no", note: "Not modeled, per the page", evidence: { url: "https://amzprep.com/us-reciprocal-tariffs-calculator/", checkedAt: "2026-10-23", quote: "antidumping and countervailing duties, quota, Chapter 98 provisions, excise taxes and product-specific exclusions are not modeled" } },
    tradePreferences: { support: "partial", note: "USMCA checkbox; other FTAs by typing a 0% base rate", evidence: { url: "https://amzprep.com/us-reciprocal-tariffs-calculator/", checkedAt: "2026-10-23", quote: "USMCA-qualifying goods are exempt from the Section 301 forced-labor duty and enter at 0% base duty." } },
    adjustments: { support: "partial", note: "Sector, Section 301 list, Section 338 and USMCA inputs; exemption check covers a sample of codes", evidence: { url: "https://amzprep.com/us-reciprocal-tariffs-calculator/", checkedAt: "2026-10-23", quote: "Enter the Harmonized Tariff Schedule code to check our sample list of common exemptions." } },
    entryDate: { support: "no", note: "No date input; rates as of the update date", evidence: { url: "https://amzprep.com/us-reciprocal-tariffs-calculator/", checkedAt: "2026-10-23", quote: "The rates are taken from published proclamations, USTR notices and CBP's fee notice as of October 15, 2026" } },
    rateHistory: { support: "unknown", searched: { urls: ["https://amzprep.com/us-reciprocal-tariffs-calculator/"], checkedAt: "2026-10-23" } },
    catalogImpact: { support: "unknown", searched: { urls: ["https://amzprep.com/us-reciprocal-tariffs-calculator/", "https://amzprep.com/integrations-and-apis/"], checkedAt: "2026-10-23" } },
    countryCompare: { support: "partial", note: "One country at a time", evidence: { url: "https://amzprep.com/us-reciprocal-tariffs-calculator/", checkedAt: "2026-10-23", quote: "need a landed-duty figure per SKU to set prices and compare suppliers in China, Vietnam, India, Mexico and the EU" } },
    csvUpload: { support: "unknown", searched: { urls: ["https://amzprep.com/us-reciprocal-tariffs-calculator/"], checkedAt: "2026-10-23" } },
    classification: { support: "partial", note: "Points to the USITC schedule and CROSS; broker classification with its freight service", evidence: { url: "https://amzprep.com/us-reciprocal-tariffs-calculator/", checkedAt: "2026-10-23", quote: "CBP's CROSS database shows how similar products have been classified in past rulings." } },
    api: { support: "unknown", searched: { urls: ["https://amzprep.com/us-reciprocal-tariffs-calculator/", "https://amzprep.com/integrations-and-apis/"], checkedAt: "2026-10-23" } },
    changelog: { support: "partial", note: "A dated update banner and a list of what the update covers", evidence: { url: "https://amzprep.com/us-reciprocal-tariffs-calculator/", checkedAt: "2026-10-23", quote: "Last updated: October 15, 2026" } },
  },
  strengths: ["Free and simple", "Written for Amazon and ecommerce sellers"],
  limitations: [
    "You look up and enter the MFN base rate yourself",
    "Rates as of its last update, with no entry date to choose",
    "Its exemption check covers a sample of common codes",
    "One product and one country at a time",
  ],
  sources: [{ title: "AMZ Prep US tariff calculator", url: "https://amzprep.com/us-reciprocal-tariffs-calculator/" }],
  checkedAt: "2026-10-23",
  vs: {
    verdict:
      "AMZ Prep's calculator is fine for a ballpark figure. If the number feeds a price, a margin or an audit, HTS Hero gives you the full stack, with the base rate looked up for you, line by line, on any entry date.",
    chooseHtsHero: [
      "You need the exact total, base rate included",
      "You want to see each tariff with its Chapter 99 heading",
      "You sell many SKUs and want catalog-wide reports",
    ],
    chooseThem: ["You want a quick rough number and nothing else"],
    differences: [
      {
        title: "A complete total",
        body: "AMZ Prep's calculator asks you to enter the MFN base rate yourself and lists the additional tariff layers on top. HTS Hero looks up the base rate in the HTS and stacks every Chapter 99 tariff on top, with exemptions and fees.",
      },
      {
        title: "Entry dates",
        body: "AMZ Prep's rates are as of its last update (October 15, 2026 when we checked), with no date to choose. HTS Hero calculates any entry date with the HTS revision in force that day, and logs each revision in a public changelog.",
      },
    ],
    faqs: [
      {
        question: "Is AMZ Prep's tariff calculator accurate?",
        answer:
          "It's useful for an estimate. You enter the MFN base rate yourself, its exemption check covers a sample of common codes, and its rates are as of its last update (October 15, 2026 when we checked on October 23). For an exact total on a given entry date, use a calculator that looks up the base rate and stacks every Chapter 99 tariff.",
      },
    ],
  },
};
