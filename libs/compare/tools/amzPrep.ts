import type { Tool } from "../types";

export const AMZ_PREP: Tool = {
  slug: "amz-prep",
  name: "AMZ Prep Tariff Calculator",
  vendor: "AMZ Prep",
  url: "https://amzprep.com/us-reciprocal-tariffs-calculator/",
  kind: "Free calculator from a 3PL",
  summary:
    "A simple free tariff calculator from AMZ Prep, a 3PL for Amazon sellers. Easy to use for a rough number, with a lighter breakdown than a full duty calculator.",
  bestFor: "Amazon sellers who want a rough estimate",
  price: "Free",
  priceDetail: "Free to use.",
  features: {
    freeToTry: { support: "yes" },
    selfServe: { support: "yes" },
    publishedPricing: { support: "yes", note: "Free" },
    fullStack: { support: "partial", note: "Flat country and sector rates; excludes the MFN base duty" },
    tradePreferences: { support: "partial", note: "USMCA and EU as country flags" },
    adjustments: { support: "partial", note: "Notes 22 exempt codes without changing the total" },
    entryDate: { support: "no" },
    rateHistory: { support: "no" },
    catalogImpact: { support: "no" },
    countryCompare: { support: "partial", note: "One country at a time" },
    csvUpload: { support: "no" },
    classification: { support: "no", note: "Its HTS lookup doesn't change the result" },
    api: { support: "no" },
    changelog: { support: "partial", note: "A dated update banner" },
  },
  strengths: ["Free and simple", "Written for Amazon and ecommerce sellers"],
  limitations: [
    "Its rates exclude the standard MFN duty, so you add the base rate yourself",
    "When we checked it listed a 10% China reciprocal tariff, though the IEEPA tariffs ended in February 2026",
    "Flat country rates: goods from China show 25% whatever the HTS code",
    "No history, bulk upload or alerts",
  ],
  sources: [{ title: "AMZ Prep US tariff calculator", url: "https://amzprep.com/us-reciprocal-tariffs-calculator/" }],
  checkedAt: "2026-10-06",
  vs: {
    verdict:
      "AMZ Prep's calculator is fine for a ballpark figure. If the number feeds a price, a margin or an audit, HTS Hero gives you the full stack, the base rate included, line by line.",
    chooseHtsHero: [
      "You need the exact total, base rate included",
      "You want to see each tariff with its Chapter 99 heading",
      "You sell many SKUs and want catalog-wide reports",
    ],
    chooseThem: ["You want a quick rough number and nothing else"],
    differences: [
      {
        title: "A complete total",
        body: "AMZ Prep's page says its rates exclude standard MFN duties, so the base rate is yours to look up and add. HTS Hero always starts from the HTS base rate and stacks every Chapter 99 tariff on top, with exemptions and fees.",
      },
      {
        title: "Current rates",
        body: "When we checked, AMZ Prep listed a 10% China reciprocal tariff. The IEEPA tariffs, reciprocal tariffs included, ended in February 2026. HTS Hero applies each HTS revision and logs it in a public changelog.",
      },
    ],
    faqs: [
      {
        question: "Is AMZ Prep's tariff calculator accurate?",
        answer:
          "It's useful for an estimate, but its page says its rates exclude standard MFN duties, and when we checked on October 6, 2026 it listed a 10% China reciprocal tariff. For an exact total, use a calculator that stacks the base rate and every Chapter 99 tariff.",
      },
    ],
  },
};
