import type { Tool } from "../types";

export const FLEXPORT: Tool = {
  slug: "flexport",
  name: "Flexport Tariff Simulator",
  vendor: "Flexport",
  url: "https://tariffs.flexport.com",
  kind: "Free calculator from a freight forwarder",
  summary:
    "The best-known free tariff calculator, run by the freight forwarder Flexport. The free tool handles single lookups; bulk upload, alerts and its other Pro features are for Flexport customers.",
  bestFor: "Quick one-off estimates, and Flexport freight customers",
  price: "Free; Pro for Flexport clients",
  priceDetail:
    "Free for up to 10 HTS codes without an account. Pro is unlocked by signing in with a Flexport Client App account, and no separate price is published.",
  features: {
    freeToTry: { support: "yes", note: "Up to 10 HTS codes with no login" },
    selfServe: { support: "partial", note: "Free tool is self-serve; Pro needs a Flexport client account" },
    publishedPricing: { support: "no", note: "Pro has no published price" },
    fullStack: { support: "yes", note: "Results broken down by tariff type" },
    entryDate: { support: "unknown" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "gated", note: "Pro email alerts, for Flexport clients" },
    countryCompare: { support: "gated", note: "Pro, for Flexport clients" },
    csvUpload: { support: "gated", note: "Pro, up to 500 rows" },
    classification: { support: "partial", note: "HTS search by product name or code" },
    changelog: { support: "yes" },
  },
  strengths: [
    "Well-known brand with a polished interface and trade map",
    "Free with no login for up to 10 codes",
    "Public changelog of calculation updates",
    "Free IEEPA tariff refund calculator",
  ],
  limitations: [
    "Bulk upload, alerts and country comparison require becoming a Flexport client",
    "No published price for Pro",
    "Built as a funnel for Flexport's freight and customs business",
  ],
  sources: [
    { title: "Flexport Tariff Simulator", url: "https://www.flexport.com/tariff-sim/" },
    { title: "Flexport Fall 2025 product release", url: "https://www.flexport.com/technology/product-release/fall-2025" },
  ],
  checkedAt: "2026-10-06",
  vs: {
    verdict:
      "Flexport's simulator is a fine free tool for a quick estimate. HTS Hero is the better fit once you need to audit past entries, track a catalog or use bulk tools without moving your freight to Flexport.",
    chooseHtsHero: [
      "You want catalog alerts, bulk upload and country comparison without becoming a freight customer",
      "You need the duty for a past entry date to check what you paid",
      "You want to see how a product's duty changed revision by revision",
      "You want to know the price before you sign up, and to pay monthly with no contract",
    ],
    chooseThem: [
      "You already ship with Flexport and want everything in one account",
      "You need a quick estimate for a handful of codes and nothing more",
      "You want Flexport's IEEPA refund calculator for 2025 entries",
    ],
    differences: [
      {
        title: "Who gets the advanced features",
        body: "Flexport's free simulator covers single lookups. Its Pro features, including bulk upload, email alerts and country comparison, are unlocked by signing in with a Flexport client account, so they come with a freight relationship. On HTS Hero every plan is self-serve: pick one on the pricing page and start.",
      },
      {
        title: "Auditing past entries",
        body: "HTS Hero calculates the duty for any entry date it has verified data for, using the HTS revision in force that day, and its Duty Over Time view shows each change to a product's duty. That's what you need to check an entry summary against what the law said at the time. We couldn't find an entry-date option documented on Flexport's public pages.",
      },
      {
        title: "Pricing you can see",
        body: "Flexport doesn't publish a price for Pro. HTS Hero's prices are on its pricing page, every plan is monthly, and annual billing takes 10% off. There's no demo to book and no contract to sign.",
      },
    ],
    faqs: [
      {
        question: "Is Flexport's tariff simulator free?",
        answer:
          "Yes, for up to 10 HTS codes without an account. Its Pro features, such as bulk upload and alerts, require a Flexport Client App account, which means being a Flexport customer.",
      },
      {
        question: "What's the best Flexport tariff simulator alternative?",
        answer:
          "HTS Hero is a strong alternative if you need more than single lookups without a freight relationship: it adds entry audits by date, Duty Over Time, tariff change alerts for your catalog and bulk CSV upload, on self-serve monthly plans with published prices.",
      },
      {
        question: "Can I use HTS Hero if I'm a customs broker?",
        answer:
          "Yes. HTS Hero sells to importers and brokers alike, and you don't need to ship with anyone in particular to use any plan.",
      },
    ],
  },
  alternatives: {
    slug: "flexport-tariff-simulator-alternatives",
    title: "Best Flexport Tariff Simulator Alternatives",
    intro:
      "Flexport's Tariff Simulator is often the first tariff calculator people try. Most go looking for an alternative when they need more than a quick lookup and find that the advanced features come with a Flexport account.",
    reasons: [
      "Bulk upload, alerts and country comparison are Pro features for Flexport clients",
      "There's no published price for Pro",
      "Teams that ship with another forwarder want a neutral tool",
    ],
    faqs: [
      {
        question: "Why look for a Flexport tariff simulator alternative?",
        answer:
          "Usually because the features you need next, like bulk upload, alerts and comparing countries, are Pro features that require a Flexport client account. An independent tool lets you use them without changing forwarders.",
      },
      {
        question: "Is there a free alternative to Flexport's tariff simulator?",
        answer:
          "Yes. HTS Hero has a free plan with the full line-by-line duty breakdown, and several other free calculators are listed on this page.",
      },
    ],
  },
};
