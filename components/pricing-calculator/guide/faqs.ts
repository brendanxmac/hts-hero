import {
  ANNUAL_DISCOUNT,
  CLASSIFY_LICENSE_PRICE,
  CLASSIFY_PLANS,
  LOWEST_PER_IMPORT,
  REVERSE_TRIAL,
  TEAM_BREAK_EVEN_SEATS,
  TEAM_MIN_CLASSIFICATIONS,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  formatPrice,
  launchPricingActive,
  perImportPrice,
} from "../lib/pricing";
import { TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";
import { COMING_LOWER, LAUNCH_PITCH } from "@/components/ui/marketing/comingSoon";

// The page's questions. Shown in the FAQ and in its FAQPage schema, so they always match.
export const PRICING_FAQS = [
  {
    question: "Is the Tariff Calculator really free?",
    answer: "Yes. Look up the full US duty on any HTS code and country of origin as often as you like, with no account and no sign-up, including how its duty changed over time. A free account adds the plain-English why behind every result (why each tariff applies and why others don't, with the legal text) and sourcing intelligence (the duty from every country of origin, as insights, a globe, a table and a chart). It's also available to AI assistants through the HTS Hero MCP server. You only pay when you want the Tariff Tracker watching your own imports after its free trial.",
  },
  {
    question: "Is there a free trial of the Tariff Tracker?",
    answer: `Yes. Every new account gets the whole Tariff Tracker free for ${REVERSE_TRIAL.days} days, with no credit card and nothing to start: everything it does, on up to ${REVERSE_TRIAL.imports} imports. That's alerts when a tariff change hits an import (AD/CVD alerts included), impact checks, Insights across your catalog, Tariff News, rate history and exports. The trial starts on its own when you add your first imports, so every one of the 14 days is spent on your own products.`,
  },
  {
    question: "What happens when my trial ends?",
    answer: `If you don't pick a plan, your account moves to the free plan. Alerts and impact checks on your own imports stop, but you keep Tariff News alerts (every new US tariff action, by email), sourcing insights on any import, and your whole catalog with its current duty, rate history and exports, free, forever. Nothing is deleted, and you're never charged unless you choose a plan. To keep alerts, impact checks and AD/CVD checks on your imports, plans start at ${formatPrice(TRACKER_TIERS[0].price)} a month for up to ${TRACKER_TIERS[0].maxPairs} imports.`,
  },
  {
    question: "Do I need a credit card to start?",
    answer: `No. Create a free account and the ${REVERSE_TRIAL.days}-day Tariff Tracker trial starts on its own. You only add a card if you decide to subscribe.`,
  },
  {
    question: "What counts as an import?",
    answer: `An import is one HTS code from one country of origin (an HTS code + country pair). Tracking 6110.20.20 from China and from Vietnam is two imports. Tariff Tracker plans cover up to ${TRACKER_TIERS.map((t) => t.maxPairs).join(", ")} imports.`,
  },
  {
    question: "What's free in the Tariff Tracker, forever?",
    answer: `Tariff News alerts (an email on every new US tariff action), sourcing intelligence (the duty from every country of origin, as insights, a globe, a table and a chart), and your whole catalog with every tariff on each import, its current duty, rate history and exports to CSV or Excel. The Tariff Calculator stays free and unlimited too. Alerts, impact checks and AD/CVD checks on your own imports are part of the ${REVERSE_TRIAL.days}-day trial and the paid plans, which start at ${formatPrice(TRACKER_TIERS[0].price)} a month to track up to ${TRACKER_TIERS[0].maxPairs} imports.`,
  },
  {
    question: "What does a paid Tariff Tracker plan cost?",
    answer: `Plans are priced by the number of imports you track, billed monthly: ${TRACKER_TIERS.map((t) => `${formatPrice(t.price)} for up to ${t.maxPairs}`).join(", ")}, and a quote above ${TRACKER_MAX_LISTED_PAIRS}. That comes to ${TRACKER_TIERS.map((t) => formatPrice(perImportPrice(t))).join(", ")} per import, per month, as low as ${formatPrice(LOWEST_PER_IMPORT)} on the largest plan. You can try everything free for ${REVERSE_TRIAL.days} days first.${launchPricingActive() ? ` ${LAUNCH_PITCH}` : ""}`,
  },
  {
    question: "Are savings detection and auditing included?",
    answer: `Yes, when they launch: automatic savings detection and automatic auditing are ${COMING_LOWER}, and they'll be part of the ${REVERSE_TRIAL.days}-day trial and every paid Tariff Tracker plan at no extra cost. Savings detection checks every import for trade programs, exemptions and lower-duty origins you may qualify for. Auditing checks every entry against the duty in force on its date and flags possible over- and underpayments for you and your broker to review. Neither is live yet.`,
  },
  {
    question: `What if I need to track more than ${TRACKER_MAX_LISTED_PAIRS} imports?`,
    answer: `Talk to us. Catalogs over ${TRACKER_MAX_LISTED_PAIRS} imports get a plan priced to their size, and we'll help you load your catalog.`,
  },
  {
    question: "How does annual billing work?",
    answer: TRACKER_ANNUAL_ENABLED
      ? `Pay for a year up front and every paid plan costs ${ANNUAL_DISCOUNT * 100}% less per month. The pricing calculator shows both the monthly rate and the yearly total.`
      : `Pay for a year of Classify up front and it costs ${ANNUAL_DISCOUNT * 100}% less per month. Tariff Tracker plans are billed monthly. The pricing calculator shows both the monthly rate and the yearly total.`,
  },
  {
    question: "Should my team get the Team plan or separate licenses?",
    answer: `Separate licenses give each person their own Classify account for ${formatPrice(CLASSIFY_LICENSE_PRICE)} a month. The Team plan (${formatPrice(CLASSIFY_PLANS.team.price)} a month) adds a shared workspace where your team reviews and approves each other's work, plus onboarding and training. It's for teams classifying at least ${TEAM_MIN_CLASSIFICATIONS} products a month, and from ${TEAM_BREAK_EVEN_SEATS} people it costs less than licenses.`,
  },
];
