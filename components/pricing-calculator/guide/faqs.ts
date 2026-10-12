import {
  ANNUAL_DISCOUNT,
  CLASSIFY_LICENSE_PRICE,
  CLASSIFY_PLANS,
  FREE_TRACKED_PAIRS,
  TEAM_BREAK_EVEN_SEATS,
  TEAM_MIN_CLASSIFICATIONS,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  TRIAL_DAYS,
  TRIAL_PAIRS,
  formatPrice,
} from "../lib/pricing";

// The page's questions. Shown in the FAQ and in its FAQPage schema, so they always match.
export const PRICING_FAQS = [
  {
    question: "Is the Tariff Calculator really free?",
    answer: "Yes. Look up the full US duty on any HTS code and country of origin as often as you like, with no account and no sign-up, including how its duty changed over time. A free account adds Analysis, the duty from every country of origin. It's also available to AI assistants through the HTS Hero MCP server. You only pay when you want HTS Hero watching, auditing and finding savings on your own products with the Tariff Tracker.",
  },
  {
    question: "How does the Tariff Tracker free trial work?",
    answer: `Every account starts on the free plan. Whenever you're ready, start a ${TRIAL_DAYS}-day trial of the full Tariff Tracker: up to ${TRIAL_PAIRS} pairs with alerts, rate history, entry audit and savings. No credit card. If you don't pick a plan by the end, your account goes back to the free plan: monitoring and alerts for ${FREE_TRACKED_PAIRS} pairs. Your other products stay in your catalog, and upgrading turns their tracking back on.`,
  },
  {
    question: "What counts as an HTS code + country pair?",
    answer: `A pair is one HTS code imported from one country of origin. Tracking 6110.20.20 from China and from Vietnam is two pairs. Tariff Tracker plans cover up to ${TRACKER_TIERS.map((t) => t.maxPairs).join(", ")} pairs.`,
  },
  {
    question: "What's included on the free plan?",
    answer: `Monitoring and alerts for ${FREE_TRACKED_PAIRS} pairs, free. Rate history, entry audit and savings discovery come with a paid Tariff Tracker plan, from ${formatPrice(TRACKER_TIERS[0].price)} a month for up to ${TRACKER_TIERS[0].maxPairs} pairs.`,
  },
  {
    question: `What if I need to track more than ${TRACKER_MAX_LISTED_PAIRS} pairs?`,
    answer: `Talk to us. Catalogs over ${TRACKER_MAX_LISTED_PAIRS} pairs get a plan priced to their size, and we'll help you load your catalog.`,
  },
  {
    question: "How does annual billing work?",
    answer: `Pay for a year up front and every paid plan costs ${ANNUAL_DISCOUNT * 100}% less per month. The pricing calculator shows both the monthly rate and the yearly total.`,
  },
  {
    question: "Should my team get the Team plan or separate licenses?",
    answer: `Separate licenses give each person their own Classify account for ${formatPrice(CLASSIFY_LICENSE_PRICE)} a month. The Team plan (${formatPrice(CLASSIFY_PLANS.team.price)} a month) adds a shared workspace where your team reviews and approves each other's work, plus onboarding and training. It's for teams classifying at least ${TEAM_MIN_CLASSIFICATIONS} products a month, and from ${TEAM_BREAK_EVEN_SEATS} people it costs less than licenses.`,
  },
];
