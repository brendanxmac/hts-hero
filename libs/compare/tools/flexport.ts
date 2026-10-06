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
    "Free with no registration. Pro is unlocked by signing in with a Flexport Client App account, and no separate price is published.",
  features: {
    freeToTry: { support: "yes", note: "No registration needed" },
    selfServe: { support: "partial", note: "Free tool is self-serve; Pro needs a Flexport client account" },
    publishedPricing: { support: "no", note: "Pro has no published price" },
    fullStack: { support: "yes", note: "Results broken down by tariff type" },
    tradePreferences: { support: "yes", note: "Applied automatically when eligible" },
    adjustments: { support: "yes", note: "Steel and aluminum content, when prompted" },
    entryDate: { support: "yes", note: "Rates back to January 1, 2025, per its FAQ" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "gated", note: "Pro email alerts, for Flexport clients" },
    countryCompare: { support: "gated", note: "Pro, for Flexport clients" },
    csvUpload: { support: "gated", note: "Pro, up to 500 rows" },
    classification: { support: "partial", note: "HTS search by product name or code" },
    api: { support: "unknown" },
    changelog: { support: "yes" },
  },
  strengths: [
    "Well-known brand with a polished interface and trade map",
    "Free with no registration",
    "Entry-date rates back to January 1, 2025",
    "Applies trade agreements such as USMCA automatically",
    "Public changelog of calculation updates",
    "Free IEEPA tariff refund calculator",
  ],
  limitations: [
    "Bulk upload, alerts and country comparison require becoming a Flexport client",
    "No published price for Pro",
    "One calculation at a time on the free tool",
    "Built as a funnel for Flexport's freight and customs business",
  ],
  sources: [
    { title: "Flexport Tariff Simulator", url: "https://www.flexport.com/tariff-sim/" },
    { title: "Flexport Fall 2025 product release", url: "https://www.flexport.com/technology/product-release/fall-2025" },
    { title: "Flexport Tariff Simulator FAQ", url: "https://tariffs.flexport.com/faq" },
  ],
  checkedAt: "2026-10-06",
  vs: {
    verdict:
      "Flexport's simulator is a solid free tool for one-off estimates, with trade agreements and entry-date rates. HTS Hero is the better fit once you need catalog alerts, bulk tools, country comparison or an API without moving your freight to Flexport.",
    chooseHtsHero: [
      "You want catalog alerts, bulk upload and country comparison without becoming a freight customer",
      "You want to see how a product's duty changed revision by revision, with the heading behind each change",
      "You want tariff results in your ERP, TMS or AI tools through an API or MCP",
      "You want to know the price before you sign up, and to pay monthly with no contract",
    ],
    chooseThem: [
      "You already ship with Flexport and want everything in one account",
      "You need a quick estimate for a handful of codes and nothing more",
      "You need entry-date rates for 2025, which Flexport keeps back to January 1, 2025",
      "You want Flexport's IEEPA refund calculator for 2025 entries",
    ],
    differences: [
      {
        title: "Who gets the advanced features",
        body: "Flexport's free simulator covers single lookups. Its Pro features, including bulk upload, email alerts and country comparison, are unlocked by signing in with a Flexport client account, so they come with a freight relationship. On HTS Hero every plan is self-serve: pick one on the pricing page and start.",
      },
      {
        title: "History and auditing",
        body: "Both tools calculate duty for a past entry date. Flexport's FAQ says its rates go back to January 1, 2025; HTS Hero's verified history starts in April 2026. Where HTS Hero goes further is showing the history: Duty Over Time charts every change to a product's duty, with the HTS revision and Chapter 99 heading behind each one.",
      },
      {
        title: "Your own systems",
        body: "HTS Hero delivers tariff results by API and MCP, so the same calculation can run inside your ERP, TMS, internal tools or an AI assistant. We didn't find a public API for Flexport's simulator.",
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
          "Yes, with no registration. Its Pro features, such as bulk upload and alerts, require a Flexport Client App account, which means being a Flexport customer.",
      },
      {
        question: "What's the best Flexport tariff simulator alternative?",
        answer:
          "HTS Hero is a strong alternative if you need more than single lookups without a freight relationship: it adds Duty Over Time, tariff change alerts for your catalog, bulk CSV upload, country comparison and API and MCP access, on self-serve monthly plans with published prices.",
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
