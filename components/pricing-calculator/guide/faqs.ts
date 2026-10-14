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

// The page's questions. Shown in the FAQ and in its FAQPage schema, so they always match.
export const PRICING_FAQS = [
  {
    question: "Is the Tariff Calculator really free?",
    answer: "Yes. Look up the full US duty on any HTS code and country of origin as often as you like, with no account and no sign-up, including how its duty changed over time. A free account adds the plain-English why behind every result (why each tariff applies and why others don't, with the legal text), and Analysis (the duty from every country of origin). It's also available to AI assistants through the HTS Hero MCP server. You only pay when you want HTS Hero watching, auditing and finding savings on your own products with the Tariff Tracker.",
  },
  {
    question: "How does the Tariff Tracker free trial work?",
    answer: `It's based on what you use, not on time. Every account is on it from sign-up, with no credit card and nothing to start: check ${TRIAL_ALLOWANCE.savingsChecks} imports for savings, run ${TRIAL_ALLOWANCE.auditChecks} audit checks on past entries and get alerts on up to ${TRIAL_ALLOWANCE.alertImports} imports. These allowances never expire or reset. When one runs out, that feature needs a paid plan, and you can upgrade at any time.`,
  },
  {
    question: "What counts as an import?",
    answer: `An import is one HTS code from one country of origin (an HTS code + country pair). Tracking 6110.20.20 from China and from Vietnam is two imports. Tariff Tracker plans cover up to ${TRACKER_TIERS.map((t) => t.maxPairs).join(", ")} imports.`,
  },
  {
    question: "What's free in the Tariff Tracker?",
    answer: `Upload your whole catalog, with the current duty on each import, plus Overview insights, rate history and sourcing across all of it, free. Every account also gets savings checks on ${TRIAL_ALLOWANCE.savingsChecks} imports, ${TRIAL_ALLOWANCE.auditChecks} audit checks and alerts on ${TRIAL_ALLOWANCE.alertImports} imports. Paid plans start at ${formatPrice(TRACKER_TIERS[0].price)} a month for up to ${TRACKER_TIERS[0].maxPairs} imports, with alerts and savings on each one and unlimited audit checks.`,
  },
  {
    question: `What if I need to track more than ${TRACKER_MAX_LISTED_PAIRS} imports?`,
    answer: `Talk to us. Catalogs over ${TRACKER_MAX_LISTED_PAIRS} imports get a plan priced to their size, and we'll help you load your catalog.`,
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
