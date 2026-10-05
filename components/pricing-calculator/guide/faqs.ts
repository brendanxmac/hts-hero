import {
  ANNUAL_DISCOUNT,
  CLASSIFY_LICENSE_PRICE,
  CLASSIFY_PLANS,
  TARIFF_CALCULATOR_PRICE,
  TEAM_BREAK_EVEN_SEATS,
  TEAM_MIN_CLASSIFICATIONS,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  formatPrice,
} from "../lib/pricing";

// The page's questions. Shown in the FAQ and in its FAQPage schema, so they always match.
export const PRICING_FAQS = [
  {
    question: "What counts as an HTS code + country pair?",
    answer: `A pair is one HTS code imported from one country of origin. Tracking 6110.20.20 from China and from Vietnam is two pairs. Tariff Tracker plans cover up to ${TRACKER_TIERS.map((t) => t.maxPairs).join(", ")} pairs.`,
  },
  {
    question: "Is the Tariff Calculator included with Tariff Tracker?",
    answer: `Yes. Every Tariff Tracker plan includes the Tariff Calculator, so you can look up the duty on any import as well as watch your catalog. On its own, the Tariff Calculator is ${formatPrice(TARIFF_CALCULATOR_PRICE)} a month.`,
  },
  {
    question: `What if I need to track more than ${TRACKER_MAX_LISTED_PAIRS} pairs?`,
    answer: `Talk to us. Catalogs over ${TRACKER_MAX_LISTED_PAIRS} pairs get a plan priced to their size, and we'll help you load your catalog.`,
  },
  {
    question: "How does annual billing work?",
    answer: `Pay for a year up front and every plan costs ${ANNUAL_DISCOUNT * 100}% less per month. The pricing calculator shows both the monthly rate and the yearly total.`,
  },
  {
    question: "Should my team get the Team plan or separate licenses?",
    answer: `Separate licenses give each person their own Classify account for ${formatPrice(CLASSIFY_LICENSE_PRICE)} a month. The Team plan (${formatPrice(CLASSIFY_PLANS.team.price)} a month) adds a shared workspace where your team reviews and approves each other's work, plus onboarding and training. It's for teams classifying at least ${TEAM_MIN_CLASSIFICATIONS} products a month, and from ${TEAM_BREAK_EVEN_SEATS} people it costs less than licenses.`,
  },
];
