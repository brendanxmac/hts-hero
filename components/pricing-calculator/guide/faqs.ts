import {
  ANNUAL_DISCOUNT,
  CLASSIFY_LICENSE_PRICE,
  CLASSIFY_PLANS,
  TEAM_BREAK_EVEN_SEATS,
  TEAM_MIN_CLASSIFICATIONS,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  TRIAL_ALLOWANCE,
  formatPrice,
} from "../lib/pricing";
import { TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";

// The page's questions. Shown in the FAQ and in its FAQPage schema, so they always match.
export const PRICING_FAQS = [
  {
    question: "Is the Tariff Calculator really free?",
    answer: "Yes. Look up the full US duty on any HTS code and country of origin as often as you like, with no account and no sign-up, including how its duty changed over time. A free account adds the plain-English why behind every result (why each tariff applies and why others don't, with the legal text), and Analysis (the duty from every country of origin). It's also available to AI assistants through the HTS Hero MCP server. You only pay when you want HTS Hero tracking more of your own imports with the Tariff Tracker.",
  },
  {
    question: "How do I start the Tariff Tracker free?",
    answer: `Create a free account, with no credit card and nothing to start. Every account tracks ${TRIAL_ALLOWANCE.alertImports} imports free, with alerts and impact checks on each one, and it never expires. To track more imports, pick a paid plan; you can upgrade at any time.`,
  },
  {
    question: "What counts as an import?",
    answer: `An import is one HTS code from one country of origin (an HTS code + country pair). Tracking 6110.20.20 from China and from Vietnam is two imports. Tariff Tracker plans cover up to ${TRACKER_TIERS.map((t) => t.maxPairs).join(", ")} imports.`,
  },
  {
    question: "What's free in the Tariff Tracker?",
    answer: `Upload your whole catalog, with every tariff on each import, its rate history, Tariff News and exports to CSV or Excel, free. Every account also tracks ${TRIAL_ALLOWANCE.alertImports} imports: an alert when a tariff change hits one, and impact checks that show exactly how any tariff action affects it. Paid plans start at ${formatPrice(TRACKER_TIERS[0].price)} a month to track up to ${TRACKER_TIERS[0].maxPairs} imports.`,
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
