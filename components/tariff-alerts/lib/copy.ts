import {
  ALERT_TIERS,
  ANNUAL_DISCOUNT,
  formatPrice,
  perImportPrice,
} from "@/components/pricing-calculator/lib/pricing"

// The words /tariff-alerts is built on. The FAQ text is also the page's FAQPage schema, so it's
// plain text and matches what's on screen exactly. Prices come from ALERT_TIERS (PRICING.md's value
// ladder); rate changes are always shown in %, never in dollars.

// The answer-first definition under the hero, for readers, crawlers and AI assistants alike
export const DEFINITION =
  "And see how you're affected as early as possible, so you can talk to suppliers, adjust prices, or ship early or later."

// The money-back promise on the plans (honored in full on request: FTC 16 CFR 239)
export const GUARANTEE_DAYS = 30
export const GUARANTEE = `${GUARANTEE_DAYS}-day money-back guarantee`
export const GUARANTEE_DETAIL = `If Tariff Alerts isn't worth it, email us within ${GUARANTEE_DAYS} days of your first payment and we'll refund it in full.`

export const LOWEST_ALERT_PER_IMPORT = Math.min(
  ...ALERT_TIERS.map(perImportPrice),
)

const tierList = ALERT_TIERS.map(
  (t) =>
    `Tariff Alerts ${t.name}, ${formatPrice(t.price)} a month for up to ${t.maxPairs} products`,
).join("; ")

const FIRST_TEAMS_PLAN = ALERT_TIERS.find((t) => t.teams)

// The short promises under the main buttons. Every plan is paid, with no trial (2026-10-28): the
// lowest price does the reassuring
export const PROMISES = [
  `From ${formatPrice(ALERT_TIERS[0].price)} a month`,
  "Set up in 30 seconds",
  "Cancel anytime",
]

const LARGEST_ALERT_PLAN = ALERT_TIERS[ALERT_TIERS.length - 1].maxPairs

// Ordered the way a buyer's questions come: what it is and what it covers, how to start, what it
// costs, then working with brokers. Each question is one
// people search for, answered in its first sentence.
export const ALERTS_FAQS: { question: string; answer: string }[] = [
  {
    question: "What are tariff alerts?",
    answer:
      "Tariff alerts tell you when a new US tariff affects one of your products. Each alert names the products it hits, the total duty rate before and after (for example 10% → 35%), the change in %, and links to the official source. You add the HTS codes and countries of origin you import, and HTS Hero checks every new tariff action against them.",
  },
  {
    question: "How do I know if a new tariff affects my products?",
    answer:
      "Add your products to HTS Hero and we check every new US tariff action against them automatically. When one hits, you get an alert with each affected product and its duty before and after. When nothing hits, you don't hear from us.",
  },
  {
    question: "How early will I hear about a new tariff?",
    answer:
      "As early as it's public. Most tariff changes are proposed or announced weeks before they take effect. We alert you when an action that may affect your products is first proposed or announced, and again when it's published with the exact rates, so you have time to talk to suppliers, adjust prices or ship early.",
  },
  {
    question: "Which tariffs do you cover?",
    answer:
      "Every new US tariff action: Section 301, Section 232, IEEPA and other presidential tariffs, Section 122, antidumping and countervailing duty (AD/CVD) orders, exclusions and exemptions, and every revision to the Harmonized Tariff Schedule. Alerts cover tariff cuts too, not just increases.",
  },
  {
    question: "Which sources do you watch?",
    answer:
      "The official ones, around the clock: USTR, the White House, the Federal Register (including documents on public inspection before they're published), CBP's Cargo Systems Messaging Service, every HTS revision from the US International Trade Commission, and AD/CVD notices from Commerce. Every alert links to its source.",
  },
  {
    question: "What counts as a product?",
    answer:
      "One HTS code from one country of origin. Screws under 7318.15.80 from China and from Vietnam are two products, but 40 sizes of the same screw from China are one. Most catalogs have far fewer products than SKUs.",
  },
  {
    question: "How do I add my products?",
    answer:
      "Upload a spreadsheet or paste your HTS codes and countries of origin. HTS Hero reads the columns, checks each code and shows the duty on every product. It takes about 30 seconds, and alerts switch on automatically.",
  },
  {
    question: "Where do I find my HTS codes?",
    answer:
      "On your entry summaries (CBP Form 7501), which list the HTS code and country of origin for every line, or ask your customs broker for a list of what you import.",
  },
  {
    question: "How much do tariff alerts cost?",
    answer: `Plans are priced by how many products you track: ${tierList}. That's as low as ${formatPrice(LOWEST_ALERT_PER_IMPORT)} per product, per month, and annual billing takes ${ANNUAL_DISCOUNT * 100}% off.`,
  },
  {
    question: `What if I have more than ${LARGEST_ALERT_PLAN} products?`,
    answer: `Book a short demo and we'll quote volume pricing for your catalog. Plans on this page cover up to ${LARGEST_ALERT_PLAN} products.`,
  },
  {
    question: "Can I cancel anytime?",
    answer: `Yes. There's no contract: cancel anytime from your account. Every plan also comes with a ${GUARANTEE_DAYS}-day money-back guarantee.`,
  },
  {
    question: "Why pay every month if a new tariff doesn't hit me every month?",
    answer:
      "For the same reason you insure a shipment you hope never gets damaged. Most months nothing changes for your products, and HTS Hero stays quiet. The month a new tariff does hit, you hear about it as early as it's public, with exactly which products it affects and by how much, so you can act before it costs you.",
  },
  {
    question: "Where do alerts arrive?",
    answer: `By email and in the Tariff Tracker. On Tariff Alerts ${FIRST_TEAMS_PLAN?.name ?? "Pro"} and up, in Slack or Microsoft Teams too, if you connect them.`,
  },
  {
    question: "Can I share an alert with my customs broker?",
    answer:
      "Yes. Every alert opens the impact in the Tariff Tracker: the action, its source and every affected product with its rate before and after. Share it with your broker or your team.",
  },
  {
    question:
      "I'm a customs broker, 3PL or freight forwarder. Can I monitor my clients' products?",
    answer:
      "Yes. Book a short demo and we'll set you up to monitor every importer client's tariffs from one account and send them alerts when new tariffs affect them.",
  },
  {
    question: "Does HTS Hero file anything with CBP?",
    answer:
      "No. HTS Hero isn't a customs broker. We find and flag what a tariff change means for your products; you decide what to do from there.",
  },
]
