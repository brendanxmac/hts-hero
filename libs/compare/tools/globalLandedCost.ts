import type { Tool } from "../types";

// Landed-cost and duty platforms built for cross-border ecommerce checkouts and global trade,
// rather than for a US importer's own duty bill

export const AVALARA: Tool = {
  slug: "avalara",
  name: "Avalara AvaTax Cross-Border",
  vendor: "Avalara",
  url: "https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html",
  kind: "Cross-border duty and tax API for ecommerce",
  summary:
    "Avalara AvaTax Cross-Border calculates or estimates customs duty and import tax in online shopping carts, with HS-6 or HS-10 classification, for retailers selling across borders. It's built into stores and marketplaces rather than used as a standalone calculator.",
  bestFor: "Retailers that need duty and tax at checkout, in many countries",
  price: "Contact Avalara",
  priceDetail: "We didn't find published prices for Avalara's cross-border products.",
  features: {
    freeToTry: { support: "partial", note: "Developer playground with sample scenarios; no public calculator", evidence: { url: "https://developer.avalara.com/products/crossborder/scenarios/", checkedAt: "2026-10-23", quote: "Run scenarios with sample data and production tax logic. No setup required." } },
    selfServe: { support: "no", note: "Cross-border is enabled by Avalara, after a demo", evidence: { url: "https://developer.avalara.com/products/crossborder/integration-guides/avatax-for-cdit/rdc3502519609140/", checkedAt: "2026-10-23", quote: "If you're an API client, contact your account manager if the Customs duty tab isn’t available." } },
    publishedPricing: { support: "no", evidence: { url: "https://www.avalara.com/us/en/products/pricing.html", checkedAt: "2026-10-23", quote: "Talk to an expert for a full quote based on your specific business profile." } },
    fullStack: { support: "unknown", searched: { urls: ["https://developer.avalara.com/products/crossborder/integration-guides/avatax-for-cdit/idg1093146173187/", "https://developer.avalara.com/products/crossborder/integration-guides/avatax-for-cdit/mys3721688487379/", "https://developer.avalara.com/products/crossborder/scenarios/"], checkedAt: "2026-10-23" } },
    adcvd: { support: "unknown", searched: { urls: ["https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html", "https://developer.avalara.com/products/crossborder/", "https://developer.avalara.com/products/crossborder/scenarios/", "https://developer.avalara.com/products/trade-and-tariff-library/", "https://developer.avalara.com/products/trade-compliance/"], checkedAt: "2026-10-23" } },
    tradePreferences: { support: "yes", note: "Claimed with its preferred-program parameter", evidence: { url: "https://developer.avalara.com/products/crossborder/integration-guides/avatax-for-cdit/zqq5461686645432/", checkedAt: "2026-10-23", quote: "Learn how to specify transactions as part of a preferred program trade agreement using Avalara parameters." } },
    adjustments: { support: "unknown", searched: { urls: ["https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html", "https://developer.avalara.com/products/crossborder/integration-guides/avatax-for-cdit/fdg2958619642979/", "https://developer.avalara.com/products/crossborder/integration-guides/avatax-for-cdit/kjh7825821132417/"], checkedAt: "2026-10-23" } },
    entryDate: { support: "partial", note: "Backdated transactions need an HS-10 code", evidence: { url: "https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html", checkedAt: "2026-10-23", quote: "any backdated transactions will need an accurate HS-10 code to produce a calculation." } },
    rateHistory: { support: "unknown", searched: { urls: ["https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html", "https://developer.avalara.com/products/crossborder/", "https://developer.avalara.com/products/trade-and-tariff-library/"], checkedAt: "2026-10-23" } },
    catalogImpact: { support: "unknown", searched: { urls: ["https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html", "https://developer.avalara.com/products/trade-and-tariff-library/", "https://developer.avalara.com/products/trade-compliance/"], checkedAt: "2026-10-23" } },
    countryCompare: { support: "unknown", searched: { urls: ["https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html", "https://developer.avalara.com/products/crossborder/"], checkedAt: "2026-10-23" } },
    csvUpload: { support: "gated", note: "Bulk upload by API, FTP or UI, for classification", evidence: { url: "https://www.avalara.com/us/en/products2/global-commerce-offerings/item-classification.html", checkedAt: "2026-10-23", quote: "Multiple input formats (API, FTP, direct uploads to UI, etc.)" } },
    classification: { support: "gated", note: "AI and managed classification, custom pricing", evidence: { url: "https://www.avalara.com/us/en/products2/global-commerce-offerings/item-classification.html", checkedAt: "2026-10-23", quote: "sold as a managed service with custom pricing" } },
    api: { support: "gated", note: "REST API and MCP servers, for customers", evidence: { url: "https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html", checkedAt: "2026-10-23", quote: "Connect to your ecommerce or ERP systems with our prebuilt integrations, or through our API." } },
    changelog: { support: "unknown", searched: { urls: ["https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html", "https://developer.avalara.com/products/crossborder/", "https://developer.avalara.com/products/trade-and-tariff-library/"], checkedAt: "2026-10-23" } },
  },
  strengths: ["Duty and tax at checkout for many countries", "Large ecommerce and marketplace integrations", "HS classification services"],
  limitations: [
    "Designed for checkout estimates across many countries; US Chapter 99 itemization isn't documented",
    "No published prices found",
  ],
  sources: [
    {
      title: "Avalara AvaTax Cross-Border",
      url: "https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html",
    },
    {
      title: "Avalara and eBay partner on cross-border compliance (Business Wire)",
      url: "https://www.businesswire.com/news/home/20230427005209/en/Avalara-and-eBay-Partner-to-Solve-Cross-Border-Compliance-for-Global-Sellers",
    },
  ],
  checkedAt: "2026-10-23",
  vs: {
    verdict:
      "Avalara and HTS Hero solve different problems. Avalara estimates duty and tax at a store's checkout across many countries; HTS Hero tells a US importer exactly what each import owes, tariff by tariff, and how that changed over time.",
    chooseHtsHero: [
      "You import into the US and need the exact duty on each entry",
      "You need every Chapter 99 tariff itemized, with exemptions",
      "You want to audit past entries and track your catalog's duty over time",
      "You want to start today for free, with published prices",
    ],
    chooseThem: [
      "You sell cross-border to consumers in many countries and need duty at checkout",
      "You already use Avalara for sales tax and want one vendor",
    ],
    differences: [
      {
        title: "Checkout estimates versus an importer's duty bill",
        body: "Avalara's cross-border tools are designed to show a shopper the landed cost before they buy. A US importer of record needs something narrower and deeper: the base rate plus each Section 232, Section 301 and other Chapter 99 tariff that applies to a specific HTS code, country and entry date. That's what HTS Hero is built for.",
      },
      {
        title: "Getting started",
        body: "We didn't find published prices for Avalara's cross-border products. HTS Hero's calculator is free, its monthly prices are published, and you can start in a couple of minutes.",
      },
    ],
    faqs: [
      {
        question: "Does Avalara calculate US Section 301 and 232 tariffs?",
        answer:
          "Avalara calculates customs duty for cross-border sales, but its public pages we reviewed don't detail how it itemizes US Chapter 99 tariffs such as Section 301 and 232. HTS Hero shows each of them as its own line with its legal source.",
      },
    ],
  },
  alternatives: {
    slug: "avalara-landed-cost-alternatives",
    title: "Best Avalara Landed Cost Alternatives for US Importers",
    intro:
      "Avalara's cross-border tools are made for ecommerce checkouts in many countries. US importers often want something more specific: the exact duty on each entry, with every Chapter 99 tariff shown.",
    reasons: [
      "You import into the US and don't need checkout integration",
      "You need Section 232, 301 and other tariffs itemized",
      "You want published prices and a self-serve start",
    ],
    faqs: [
      {
        question: "What's a simpler alternative to Avalara for US import duty?",
        answer:
          "HTS Hero is a free, self-serve US tariff calculator. It shows the base rate and each Chapter 99 tariff for an HTS code, country and entry date.",
      },
    ],
  },
};

export const ZONOS: Tool = {
  slug: "zonos",
  name: "Zonos Landed Cost",
  vendor: "Zonos",
  url: "https://zonos.com/landed-cost",
  kind: "Landed cost at checkout for cross-border ecommerce",
  summary:
    "Zonos calculates and can guarantee landed cost at checkout for cross-border ecommerce, across 200+ countries and territories, with plugins for the major store platforms.",
  bestFor: "Cross-border stores that want guaranteed landed cost at checkout",
  price: "$2 per order + 10% of duties and taxes",
  priceDetail: "Its docs list a fee of $2 per order plus 10% of duties, taxes and import fees. Its pricing page offers a demo rather than plans, and outside Shopify you start through sales.",
  features: {
    freeToTry: { support: "partial", note: "Demo calculator on its Landed Cost page; Item Quoter for Zonos customers", evidence: { url: "https://zonos.com/landed-cost", checkedAt: "2026-10-23", quote: "Try our calculator above to see it in action." } },
    selfServe: { support: "partial", note: "Self-serve on Shopify; otherwise through sales", evidence: { url: "https://zonos.com/docs/global-ecommerce/registration-and-setup/create-a-zonos-account", checkedAt: "2026-10-23", quote: "If your store is on Shopify, you can self-register and finish setup without waiting on a sales conversation." } },
    publishedPricing: { support: "partial", note: "$2 per order + 10% of duties and taxes, in its docs", evidence: { url: "https://zonos.com/docs/global-ecommerce/landed-cost/pricing", checkedAt: "2026-10-23", quote: "Zonos charges 2 USD and 10% of duties, taxes, and other import fees" } },
    fullStack: { support: "no", note: "One duty entry per item in its API", evidence: { url: "https://zonos.com/docs/supply-chain/landed-cost/calculate-landed-cost---graphql/duties", checkedAt: "2026-10-23", quote: "Duty rates are returned on a per-item basis with descriptions for the duty rates." } },
    adcvd: { support: "partial", note: "Flags affected items; AD/CVD left out of totals", evidence: { url: "https://zonos.com/docs/guides/country-guides/united-states/antidumping-countervailing-duties/how-zonos-handles-ad-cvd", checkedAt: "2026-10-23", quote: "AD/CVD duties will not be included in any totals." } },
    tradePreferences: { support: "partial", note: "Preferential rates by origin; other agreements on request", evidence: { url: "https://zonos.com/docs/supply-chain/landed-cost/calculate-landed-cost---graphql/duties", checkedAt: "2026-10-23", quote: "By default, other trade agreements are not enabled." } },
    adjustments: { support: "partial", note: "Section 232 and FTA questions in the Zonos app, for postal shipments", evidence: { url: "https://zonos.com/docs/postal/tools-for-shippers/zonos-prepay/fta-and-section-232", checkedAt: "2026-10-23", quote: "Answer free trade agreement and Section 232 questions when you prepay duties in the Zonos app." } },
    entryDate: { support: "unknown", searched: { urls: ["https://zonos.com/docs/supply-chain/landed-cost/calculate-landed-cost---graphql/duties", "https://zonos.com/docs/landed-cost/import-duty", "https://zonos.com/docs/global-ecommerce/landed-cost/calculate", "https://zonos.com/landed-cost"], checkedAt: "2026-10-23" } },
    rateHistory: { support: "unknown", searched: { urls: ["https://zonos.com/landed-cost", "https://zonos.com/docs/guides/us-tariff-changes", "https://zonos.com/docs/account/whats-new"], checkedAt: "2026-10-23" } },
    catalogImpact: { support: "unknown", searched: { urls: ["https://zonos.com/docs/guides/us-tariff-changes", "https://zonos.com/us-tariff-updates", "https://zonos.com/landed-cost"], checkedAt: "2026-10-23" } },
    countryCompare: { support: "unknown", searched: { urls: ["https://zonos.com/landed-cost", "https://zonos.com/docs/landed-cost/import-duty", "https://zonos.com/docs/postal/tools-for-shippers/dashboard-lite/item-quoter"], checkedAt: "2026-10-23" } },
    csvUpload: { support: "gated", note: "Bulk classification, after a demo", evidence: { url: "https://zonos.com/classify", checkedAt: "2026-10-23", quote: "Bulk upload your product data via CSV or connect through our API" } },
    classification: { support: "yes", note: "Zonos Classify, included with Landed Cost", evidence: { url: "https://zonos.com/landed-cost", checkedAt: "2026-10-23", quote: "Get accurate HS code classification included at no extra cost when you use our guaranteed landed cost." } },
    api: { support: "onRequest", note: "GraphQL API; non-Shopify accounts start with sales", evidence: { url: "https://zonos.com/docs/global-ecommerce/registration-and-setup/create-a-zonos-account", checkedAt: "2026-10-23", quote: "Onboarding will commence once your account agreement is in place." } },
    changelog: { support: "partial", note: "Product changelog and US tariff timeline; no rate-data log", evidence: { url: "https://zonos.com/docs/account/whats-new", checkedAt: "2026-10-23", quote: "Here are the latest updates and improvements Zonos has made." } },
  },
  strengths: ["Guaranteed landed cost at checkout", "200+ countries and territories", "Store platform plugins"],
  limitations: [
    "Designed for store checkouts, with no documented US Chapter 99 breakdown",
    "Priced per order, as a share of the duties and taxes, rather than as plans",
  ],
  sources: [{ title: "Zonos Landed Cost", url: "https://zonos.com/landed-cost" }, { title: "How Zonos handles AD/CVD", url: "https://zonos.com/docs/guides/country-guides/united-states/antidumping-countervailing-duties/how-zonos-handles-ad-cvd" }],
  checkedAt: "2026-10-23",
  vs: {
    verdict:
      "Zonos is a checkout tool for cross-border stores. HTS Hero is a duty tool for US importers: every tariff on every entry, past entry dates, and catalog-wide impact when tariffs change.",
    chooseHtsHero: [
      "You're the importer of record and need the exact US duty per entry",
      "You want Section 232, 301 and other tariffs itemized",
      "You want a self-serve plan without booking a demo",
    ],
    chooseThem: ["You run a store selling internationally and want landed cost guaranteed at checkout"],
    differences: [
      {
        title: "What it's for",
        body: "Zonos shows shoppers a landed cost at checkout across many countries. HTS Hero shows a US importer the full duty on an import, tariff by tariff, with the Chapter 99 heading and legal note behind each one.",
      },
      {
        title: "Pricing",
        body: "Zonos's pricing page offers a demo; its docs list a fee of $2 per order plus 10% of duties and taxes. HTS Hero publishes every plan's price, and its calculator is free.",
      },
    ],
    faqs: [
      {
        question: "Is Zonos a good tariff calculator for US importers?",
        answer:
          "Zonos is built for cross-border checkout. For US importers who need each Chapter 99 tariff on an entry, a US-specific calculator such as HTS Hero is a closer fit.",
      },
    ],
  },
  alternatives: {
    slug: "zonos-alternatives",
    title: "Best Zonos Alternatives for US Import Duty",
    intro:
      "Zonos is a strong checkout product for cross-border stores. If you're a US importer working out duty on your own entries, you probably need a different kind of tool.",
    reasons: [
      "You need US Chapter 99 tariffs itemized for each entry",
      "You want self-serve plans without booking a demo",
      "You don't need checkout integration",
    ],
    faqs: [
      {
        question: "What's a Zonos alternative for US importers?",
        answer:
          "HTS Hero calculates the full US duty for an HTS code, country and entry date, with each Chapter 99 tariff itemized, on self-serve plans with published prices.",
      },
    ],
  },
};

export const SIMPLY_DUTY: Tool = {
  slug: "simplyduty",
  name: "SimplyDuty",
  url: "https://www.simplyduty.com/import-calculator",
  kind: "Global duty calculator and API",
  summary:
    "A global import duty calculator and API covering 100+ destinations. Free use needs registration and is capped at 5 calculations a day; paid plans are priced by API calls.",
  bestFor: "Developers who need cheap duty estimates for many countries",
  price: "From £9.99/mo",
  priceDetail:
    "5 free calculations a day after registering. Basic £9.99/mo (100 API calls), Start-up £49.99, Professional £99.99, Enterprise £499.99, or £0.10 per call.",
  features: {
    freeToTry: { support: "partial", note: "5 calculations a day, registration required", evidence: { url: "https://www.simplyduty.com/import-calculator/", checkedAt: "2026-10-23", quote: "You only need to upgrade if you want more than 5 calculations per day." } },
    selfServe: { support: "yes", evidence: { url: "https://www.simplyduty.com/pricing/", checkedAt: "2026-10-23", quote: "We currently have four payment plans which you can access via the 'Subscription Plans' tab in your account section." } },
    publishedPricing: { support: "yes", note: "In GBP", evidence: { url: "https://www.simplyduty.com/pricing/", checkedAt: "2026-10-23", quote: "Basic £9.99 ... Start-up £49.99 ... Professional £99.99 ... Enterprise £499.99" } },
    fullStack: { support: "no", note: "US additional tariffs as one on/off layer", evidence: { url: "https://www.simplyduty.com/2025-reciprocal-us-tariffs/", checkedAt: "2026-10-23", quote: "We have updated the system with all these additional tariffs via the TempTariff object in the API calls" } },
    adcvd: { support: "unknown", searched: { urls: ["https://www.simplyduty.com/", "https://www.simplyduty.com/import-calculator/", "https://www.simplyduty.com/2025-reciprocal-us-tariffs/", "https://www.simplyduty.com/api-tools/", "https://www.simplyduty.com/get-import-rates/", "https://www.simplyduty.com/glossary/"], checkedAt: "2026-10-23" } },
    tradePreferences: { support: "unknown", searched: { urls: ["https://www.simplyduty.com/2025-reciprocal-us-tariffs/", "https://www.simplyduty.com/import-calculator/", "https://www.simplyduty.com/api-tools/", "https://www.simplyduty.com/"], checkedAt: "2026-10-23" } },
    adjustments: { support: "no", evidence: { url: "https://www.simplyduty.com/2025-reciprocal-us-tariffs/", checkedAt: "2026-10-23", quote: "There is no option to switch off these additional tariffs via the online calculator" } },
    entryDate: { support: "unknown", searched: { urls: ["https://www.simplyduty.com/import-calculator/", "https://www.simplyduty.com/api-tools/", "https://www.simplyduty.com/pricing/"], checkedAt: "2026-10-23" } },
    rateHistory: { support: "unknown", searched: { urls: ["https://www.simplyduty.com/", "https://www.simplyduty.com/import-calculator/", "https://www.simplyduty.com/get-import-rates/", "https://www.simplyduty.com/api-tools/"], checkedAt: "2026-10-23" } },
    catalogImpact: { support: "unknown", searched: { urls: ["https://www.simplyduty.com/", "https://www.simplyduty.com/pricing/", "https://www.simplyduty.com/api-tools/", "https://www.simplyduty.com/2025-reciprocal-us-tariffs/"], checkedAt: "2026-10-23" } },
    countryCompare: { support: "unknown", searched: { urls: ["https://www.simplyduty.com/import-calculator/", "https://www.simplyduty.com/", "https://www.simplyduty.com/api-tools/"], checkedAt: "2026-10-23" } },
    csvUpload: { support: "paid", note: "Classification file upload, per API call", evidence: { url: "https://www.simplyduty.com/get-hs-codes/", checkedAt: "2026-10-23", quote: "Use your API Key to import product descriptions and with in seconds the associated HS Codes will be added to your data set." } },
    classification: { support: "paid", note: "£0.10 per call", evidence: { url: "https://www.simplyduty.com/pricing/", checkedAt: "2026-10-23", quote: "Product Classification API: £0.10 per API call" } },
    api: { support: "paid", note: "From £9.99/mo", evidence: { url: "https://www.simplyduty.com/pricing/", checkedAt: "2026-10-23", quote: "You can use your subscription allowance on both the online duty calculator and the hs code classification and calculation APIs" } },
    changelog: { support: "partial", note: "Last US update May 29, 2025", evidence: { url: "https://www.simplyduty.com/2025-reciprocal-us-tariffs/", checkedAt: "2026-10-23", quote: "Last Updated: 29/05/2025" } },
  },
  strengths: ["Global coverage", "Inexpensive API pricing", "Published prices"],
  limitations: [
    "Registration needed even for free use, capped at 5 a day",
    "US additional tariffs come back as one layer, with no Chapter 99 breakdown",
    "Its US tariff update log was last updated May 29, 2025",
  ],
  sources: [
    { title: "SimplyDuty pricing", url: "https://www.simplyduty.com/pricing/" },
    { title: "SimplyDuty import calculator", url: "https://www.simplyduty.com/import-calculator" },
  ],
  checkedAt: "2026-10-23",
  vs: {
    verdict:
      "SimplyDuty is a handy global API at a low price. For US imports, HTS Hero gives you the detail that matters: every Chapter 99 tariff itemized, past entry dates and Duty Over Time.",
    chooseHtsHero: [
      "Your imports come into the US and you need each tariff itemized",
      "You want to audit past entries and see duty across revisions",
    ],
    chooseThem: ["You need duty estimates for many destination countries through an API"],
    differences: [
      {
        title: "US depth versus global breadth",
        body: "SimplyDuty covers 100+ destinations. HTS Hero covers one, the US, in depth: the base rate plus each Section 232, Section 301 and other Chapter 99 tariff, with exemptions and fees.",
      },
    ],
    faqs: [
      {
        question: "Is SimplyDuty free?",
        answer: "Registered users get 5 free calculations a day. Paid plans start at £9.99 a month for 100 API calls.",
      },
    ],
  },
  alternatives: {
    slug: "simplyduty-alternatives",
    title: "Best SimplyDuty Alternatives for US Imports",
    intro:
      "SimplyDuty is a low-cost global duty API. US importers often look for something built around the US tariff stack instead.",
    reasons: [
      "Free use needs registration and is capped at 5 calculations a day",
      "You need Section 232, 301 and other US tariffs itemized",
      "You want history and auditing for past entries",
    ],
    faqs: [
      {
        question: "What's a SimplyDuty alternative for US import duty?",
        answer: "HTS Hero is built for US imports: every Chapter 99 tariff itemized, past entry dates and Duty Over Time, with a free calculator.",
      },
    ],
  },
};

export const DESCARTES: Tool = {
  slug: "descartes-customsinfo",
  name: "Descartes CustomsInfo",
  vendor: "Descartes",
  url: "https://www.customsinfo.com",
  kind: "Enterprise classification and tariff research",
  summary:
    "Enterprise trade content for classification and tariff research: duty and tariff data for 152 countries and territories and 600,000 US and EU binding rulings, used by brokers, forwarders and large compliance teams.",
  bestFor: "Large compliance teams researching tariffs in many countries",
  price: "From about $750 per user",
  priceDetail: "Software directories list it from about US$750 per user. Descartes doesn't publish prices on its site.",
  features: {
    freeToTry: { support: "partial", note: "14-day trial, business email, 1 to 2 day wait", evidence: { url: "https://www.customsinfo.com/free-trial/", checkedAt: "2026-10-23", quote: "You should receive your access credentials within 24-48 hours." } },
    selfServe: { support: "no", note: "Demo or contact form", evidence: { url: "https://www.descartes.com/resources/knowledge-center/descartes-customsinfo-catalog", checkedAt: "2026-10-23", quote: "Please contact us to choose which options best meet your business requirements." } },
    publishedPricing: { support: "no", evidence: { url: "https://www.descartes.com/resources/knowledge-center/descartes-customsinfo-catalog", checkedAt: "2026-10-23", quote: "Please contact us to choose which options best meet your business requirements." } },
    fullStack: { support: "partial", note: "Chapter 99 data, for customers", evidence: { url: "https://www.customsinfo.com/industry-updates/october-9th-update-notice/", checkedAt: "2026-10-23", quote: "US Technical correction for 9903.85.67 and 68 - applicable countries should be ALL, not just RU." } },
    adcvd: { support: "gated", note: "AD/CVD orders, scope decisions and a lookup tool, for subscribers", evidence: { url: "https://www.descartes.com/resources/knowledge-center/descartes-customsinfo-catalog", checkedAt: "2026-10-23", quote: "U.S. Anti-Dumping Duty/ Countervailing Duty (AD/CVD) and Scope Decisions" } },
    tradePreferences: { support: "gated", note: "FTAs on one screen, for subscribers", evidence: { url: "https://www.customsinfo.com/solutions/customs-info-reference/", checkedAt: "2026-10-23", quote: "access FTAs from a single screen to determine landed costs and leverage favorable tariff treatments efficiently" } },
    adjustments: { support: "unknown", searched: { urls: ["https://www.customsinfo.com/solutions/customs-info-reference/", "https://www.descartes.com/resources/knowledge-center/descartes-customsinfo-catalog", "https://www.descartes.com/lp/track-tariff-changes-customsinfo-reference", "https://customsinfo.com/hts-and-import-tariff-classification-software"], checkedAt: "2026-10-23" } },
    entryDate: { support: "unknown", searched: { urls: ["https://www.customsinfo.com/solutions/customs-info-reference/", "https://www.descartes.com/resources/knowledge-center/descartes-customsinfo-catalog"], checkedAt: "2026-10-23" } },
    rateHistory: { support: "partial", note: "U.S. HTS archives, for subscribers", evidence: { url: "https://www.descartes.com/resources/knowledge-center/descartes-customsinfo-catalog", checkedAt: "2026-10-23", quote: "U.S. HTS Archives" } },
    catalogImpact: { support: "partial", note: "Tariff change tracking; no per-product alerts described", evidence: { url: "https://www.descartes.com/lp/track-tariff-changes-customsinfo-reference", checkedAt: "2026-10-23", quote: "Track tariff adjustments and stay updated on harmonized codes, tariff schedules, and trade programs." } },
    countryCompare: { support: "gated", note: "Duties by market and origin, for subscribers", evidence: { url: "https://www.descartes.com/lp/track-tariff-changes-customsinfo-reference", checkedAt: "2026-10-23", quote: "find suppliers in countries with lower tariff rates" } },
    csvUpload: { support: "gated", note: "Import wizard and template uploads in CustomsInfo Manager", evidence: { url: "https://www.descartes.com/resources/download-center/descartes-customsinfotm-manager-standard", checkedAt: "2026-10-23", quote: "With a pre-defined import data wizard and template-driven upload functionality" } },
    classification: { support: "gated", note: "AI-assisted classification, for subscribers", evidence: { url: "https://www.customsinfo.com", checkedAt: "2026-10-23", quote: "Automate HTS/HS code classification with AI to ensure accuracy, compliance, and speed." } },
    api: { support: "onRequest", note: "ERP and GTM data feeds", evidence: { url: "https://www.customsinfo.com", checkedAt: "2026-10-23", quote: "Descartes CustomsInfo integrates with your ERP, ecommerce, and other business systems." } },
    changelog: { support: "yes", note: "Weekly update notices", evidence: { url: "https://www.customsinfo.com/resources/industry-updates/", checkedAt: "2026-10-23", quote: "This page catalogs updates from customs authorities from around the world" } },
  },
  strengths: ["Duty data for 152 countries and territories", "600,000 US and EU binding rulings", "Established with brokers and enterprises"],
  limitations: ["Enterprise pricing, from about $750 per user", "Built for many countries, more than most US importers need"],
  sources: [
    { title: "Descartes CustomsInfo product information (PDF)", url: "https://www.descartes.com/sites/default/files/documents/pi_descartes_customs_info.pdf" },
    { title: "Descartes CustomsInfo on Capterra", url: "https://www.capterra.co.za/software/220216/descartes-customsinfo" },
    { title: "Descartes CustomsInfo catalog", url: "https://www.descartes.com/resources/knowledge-center/descartes-customsinfo-catalog" },
  ],
  checkedAt: "2026-10-23",
  alternatives: {
    slug: "descartes-customsinfo-alternatives",
    title: "Best Descartes CustomsInfo Alternatives",
    intro:
      "Descartes CustomsInfo is a deep enterprise research tool for trade content in many countries. Teams focused on US imports often want something faster to start and much cheaper per seat.",
    reasons: [
      "Pricing starts around $750 per user",
      "You only need US duty, done thoroughly",
      "You want to be up and running this week",
    ],
    faqs: [
      {
        question: "Is there a cheaper alternative to Descartes CustomsInfo for US imports?",
        answer:
          "Yes. HTS Hero covers US duty in depth on self-serve monthly plans with published prices, and you can start free.",
      },
    ],
  },
};

export const EASYSHIP: Tool = {
  slug: "easyship",
  name: "Easyship Duties & Taxes Calculator",
  vendor: "Easyship",
  url: "https://www.easyship.com/en-ca/duties-and-taxes-calculator/usa",
  kind: "Free estimator from a shipping platform",
  summary:
    "A free duties and taxes estimator from the shipping platform Easyship. It estimates by product category rather than by HTS code.",
  bestFor: "Small parcel shippers who want a quick ballpark",
  price: "Free",
  priceDetail: "The web estimator is free with no sign-up. Its tax and duty API comes with the shipping platform's paid plans, from $29 a month.",
  features: {
    freeToTry: { support: "yes", note: "Category estimate free, no email; HS-code quotes with a free account", evidence: { url: "https://www.easyship.com/en-ca/duties-and-taxes-calculator/usa", checkedAt: "2026-10-23", quote: "Use the free CA import duty calculator to estimate your taxes and duties when shipping to the US" } },
    selfServe: { support: "yes", evidence: { url: "https://www.easyship.com/plans", checkedAt: "2026-10-23", quote: "Get started for free. No credit card required. Simple set-up in 3 minutes" } },
    publishedPricing: { support: "partial", note: "Shipping plans $29 to $99/mo; enterprise by chat", evidence: { url: "https://www.easyship.com/plans", checkedAt: "2026-10-23", quote: "Plus $29/mo ... Premier $69/mo ... Scale $99/mo" } },
    fullStack: { support: "partial", note: "Web calculator shows one duty figure; the API can list extra duties", evidence: { url: "https://developers.easyship.com/docs/how-to-calculate-taxes-and-duties", checkedAt: "2026-10-23", quote: "When import_duty_details is present, it explains each line: the HS code actually applied, the rate type ... and any extra duties." } },
    adcvd: { support: "unknown", searched: { urls: ["https://www.easyship.com/en-ca/duties-and-taxes-calculator/usa", "https://www.easyship.com/taxes-and-duties", "https://developers.easyship.com/docs/how-to-calculate-taxes-and-duties"], checkedAt: "2026-10-23" } },
    tradePreferences: { support: "no", note: "No program input in the calculator or the API", evidence: { url: "https://developers.easyship.com/docs/how-to-calculate-taxes-and-duties", checkedAt: "2026-10-23" } },
    adjustments: { support: "no", note: "No exemption inputs in the calculator or the API", evidence: { url: "https://developers.easyship.com/docs/how-to-calculate-taxes-and-duties", checkedAt: "2026-10-23" } },
    entryDate: { support: "no", note: "No date field in the calculator or the API", evidence: { url: "https://developers.easyship.com/docs/how-to-calculate-taxes-and-duties", checkedAt: "2026-10-23" } },
    rateHistory: { support: "unknown", searched: { urls: ["https://www.easyship.com/en-ca/duties-and-taxes-calculator/usa", "https://www.easyship.com/taxes-and-duties", "https://www.easyship.com/plans"], checkedAt: "2026-10-23" } },
    catalogImpact: { support: "unknown", searched: { urls: ["https://www.easyship.com/taxes-and-duties", "https://www.easyship.com/plans", "https://www.easyship.com/feature-list"], checkedAt: "2026-10-23" } },
    countryCompare: { support: "partial", note: "Change the origin by hand", evidence: { url: "https://www.easyship.com/en-ca/duties-and-taxes-calculator/usa", checkedAt: "2026-10-23" } },
    csvUpload: { support: "yes", note: "Catalog upload, free account", evidence: { url: "https://www.easyship.com/hs-tariff-code-lookup", checkedAt: "2026-10-23", quote: "Upload your product catalogue to auto-classify in bulk." } },
    classification: { support: "yes", note: "HS code lookup with AI, free account", evidence: { url: "https://www.easyship.com/hs-tariff-code-lookup", checkedAt: "2026-10-23", quote: "Built directly into our free app, use Easyship's HS tariff code lookup tool to quickly find the correct HTS codes" } },
    api: { support: "paid", note: "Tax and duty API, paid plans", evidence: { url: "https://developers.easyship.com/docs/how-to-calculate-taxes-and-duties", checkedAt: "2026-10-23", quote: "Plan: Paid plans only" } },
    changelog: { support: "no", note: "API changelog has no tariff updates", evidence: { url: "https://developers.easyship.com/reference/changelog.md", checkedAt: "2026-10-23" } },
  },
  strengths: ["Free and quick, with no sign-up", "HS code lookup and catalog upload on a free account", "Part of a shipping platform"],
  limitations: [
    "The web estimator works from product categories, so the HTS code isn't used",
    "One duty figure, without each Section 232 or 301 tariff on its own line",
    "No entry date, trade agreement or exemption inputs",
  ],
  sources: [
    { title: "Easyship duties and taxes calculator (to the USA)", url: "https://www.easyship.com/en-ca/duties-and-taxes-calculator/usa" },
    { title: "Easyship plans", url: "https://www.easyship.com/plans" },
    { title: "Easyship taxes and duties API", url: "https://developers.easyship.com/docs/how-to-calculate-taxes-and-duties" },
  ],
  checkedAt: "2026-10-23",
  alternatives: {
    slug: "easyship-duty-calculator-alternatives",
    title: "Best Easyship Duty Calculator Alternatives",
    intro:
      "Easyship's estimator is quick, but it works from product categories. Once you know your HTS code, you can get the exact US duty instead of a category average.",
    reasons: [
      "It estimates by product category rather than HTS code",
      "Its web estimator shows one duty figure rather than each Section 232 or 301 tariff",
      "You need a number you can price or file against",
    ],
    faqs: [
      {
        question: "Why doesn't my Easyship estimate match my customs bill?",
        answer:
          "Easyship estimates duty from a product category. The duty CBP charges depends on the exact HTS code, the country of origin and every Chapter 99 tariff in force on the entry date, which a category average can't capture.",
      },
    ],
  },
};

export const AIRLIFT_USA: Tool = {
  slug: "airlift-usa",
  name: "Airlift USA Tariff Simulator",
  vendor: "Airlift USA",
  url: "https://airliftusa.com/tariff-simulator",
  kind: "Free calculator from a forwarder and broker",
  summary:
    "A free tariff simulator from a freight forwarder and customs broker, with each tariff as a separate line and an entry-date input. Single lookups, no account.",
  bestFor: "Free single lookups by entry date",
  price: "Free",
  priceDetail: "Free, with no account and no usage limits.",
  features: {
    freeToTry: { support: "yes", note: "No account, no limits", evidence: { url: "https://airliftusa.com/tariff-simulator", checkedAt: "2026-10-23", quote: "It is free, with no signup, no account and no limit on how many HTS codes or origins you check." } },
    selfServe: { support: "yes", evidence: { url: "https://airliftusa.com/tariff-simulator", checkedAt: "2026-10-23", quote: "A free US customs duty calculator ... No signup." } },
    publishedPricing: { support: "yes", note: "Free", evidence: { url: "https://airliftusa.com/tools/tariff-api", checkedAt: "2026-10-23", quote: "Free, with no key and no signup" } },
    fullStack: { support: "partial", note: "Itemized; pharma and semiconductor 232 as notes", evidence: { url: "https://airliftusa.com/tariff-simulator", checkedAt: "2026-10-23", quote: "Two Section 232 measures appear as a note rather than a duty row" } },
    adcvd: { support: "partial", note: "Separate order lookup with original-order rates; not in estimates", evidence: { url: "https://airliftusa.com/tools/ad-cvd", checkedAt: "2026-10-23", quote: "Search every Commerce case with an order or suspension agreement in force ... by product, country or case number" } },
    tradePreferences: { support: "partial", note: "Not evaluated on the web page; the API takes an FTA claim", evidence: { url: "https://airliftusa.com/tariff-simulator", checkedAt: "2026-10-23", quote: "Not included ... Free trade agreement or preference qualification, which needs origin documentation, not a rate lookup" } },
    adjustments: { support: "partial", note: "Four inputs on the web page; the API takes FTA and civil-aircraft flags", evidence: { url: "https://airliftusa.com/tools/tariff-api", checkedAt: "2026-10-23", quote: "civil_aircraft boolean No Entered under the civil-aircraft certification (General Note 6)" } },
    entryDate: { support: "yes", evidence: { url: "https://airliftusa.com/tariff-simulator", checkedAt: "2026-10-23", quote: "Every additional tariff is tested against this date" } },
    rateHistory: { support: "partial", note: "Dated comparisons on product pages", evidence: { url: "https://airliftusa.com/import-duty/9503.00.00/china", checkedAt: "2026-10-23", quote: "Priced with an entry date of 15 October 2025, the same shipment would have paid 0%" } },
    catalogImpact: { support: "partial", note: "Policy emails, not tied to your products", evidence: { url: "https://airliftusa.com/tariff-updates", checkedAt: "2026-10-23", quote: "Get an email when a tariff measure changes" } },
    countryCompare: { support: "partial", note: "Change the origin by hand", evidence: { url: "https://airliftusa.com/tariff-simulator", checkedAt: "2026-10-23", quote: "Change the origin or the date to compare." } },
    csvUpload: { support: "unknown", searched: { urls: ["https://airliftusa.com/tariff-simulator", "https://airliftusa.com/tools/tariff-api", "https://airliftusa.com/hts-code-finder"], checkedAt: "2026-10-23" } },
    classification: { support: "partial", note: "Keyword HTS search", evidence: { url: "https://airliftusa.com/hts-code-finder", checkedAt: "2026-10-23", quote: "This HTS code finder searches the Harmonized Tariff Schedule of the United States (HTSUS) by product description, by HTS code" } },
    api: { support: "yes", note: "Free public API", evidence: { url: "https://airliftusa.com/tools/tariff-api", checkedAt: "2026-10-23", quote: "It is the same engine that runs the Airlift USA tariff simulator, open over plain HTTP" } },
    changelog: { support: "yes", evidence: { url: "https://airliftusa.com/tariff-updates", checkedAt: "2026-10-23", quote: "Each entry gives the date it took effect, the Chapter 99 headings it is claimed under" } },
  },
  strengths: ["Free with no account or limits", "Entry dates and current 2026 programs", "Itemized tariff lines with a version stamp", "Free public API", "A searchable list of AD/CVD orders"],
  limitations: [
    "One product at a time, with no catalog or CSV upload",
    "Alerts are policy emails, not tied to your products",
    "Trade agreements and annex exemptions not evaluated on the web page",
    "AD/CVD isn't included in its estimates",
  ],
  sources: [{ title: "Airlift USA tariff simulator", url: "https://airliftusa.com/tariff-simulator" }, { title: "Airlift USA AD/CVD orders", url: "https://airliftusa.com/tools/ad-cvd" }],
  checkedAt: "2026-10-23",
};
