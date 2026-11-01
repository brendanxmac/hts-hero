import {
  ALERT_TIERS,
  ANNUAL_DISCOUNT,
  AUDIT_TIERS,
  CLASSIFY_LICENSE_PRICE,
  CLASSIFY_PLANS,
  formatPrice,
  perImportPrice,
  REVERSE_TRIAL,
  TEAM_BREAK_EVEN_SEATS,
  TEAM_MIN_CLASSIFICATIONS,
  TRACKER_MAX_LISTED_PAIRS,
} from "../lib/pricing";

// The words on /pricing-calculator. Every price and limit comes from pricing.ts; the offers are in
// PRICING.md. A product is one HTS code from one country of origin.

export const MAIN_CTA = "Start Free Trial";

export const PROMISES = [`Free for ${REVERSE_TRIAL.days} days`, "No credit card required", "Cancel anytime"];

const prices = (tiers: readonly { maxPairs: number; price: number }[]) => tiers.map((t) => `${formatPrice(t.price)} for up to ${t.maxPairs}`).join(", ");

export const LOWEST_PER_PRODUCT = Math.min(...ALERT_TIERS.map(perImportPrice));

// The page's questions, in the FAQ and in its FAQPage schema, so they always match
export const PRICING_FAQS = [
  {
    question: "Is the Duty Calculator really free?",
    answer:
      "Yes. Look up the full US duty on any HTS code and country of origin as often as you like, with no account. A free account adds how its duty changed over time, the plain-English why behind every result, the duty from every country of origin, the tariff news on it, and AD/CVD checks on any product.",
  },
  {
    question: "Is tracking my products free too?",
    answer:
      "Yes. A free account can track every product you import, with no limit: each one's current duty, every tariff on it, its rate history and exports to CSV or Excel. When a new tariff action hits your products, we'll send you a heads-up. Duty Guard Essentials adds which products were hit, the rate before and after, and the official source.",
  },
  {
    question: "How does the free trial work?",
    answer: `Every new account gets Duty Guard free for ${REVERSE_TRIAL.days} days, with no credit card required. The trial starts when you add your first products, so every day is spent on your own imports.`,
  },
  {
    question: "What happens when my trial ends?",
    answer: `Pick a plan to keep what you've been using, or do nothing and your account stays free. You're never charged unless you choose a plan. Nothing is deleted: your whole catalog stays, with its current duty, rate history and exports. Alerts, impact checks, savings detection and audits stop until you pick a plan.`,
  },
  {
    question: "What's the difference between Duty Guard?",
    answer:
      "Duty Guard Essentials tells you when a new tariff hits your products and how: the rate before and after on each one, with the official source. Duty Guard Pro includes all of that, then checks your entries against the duty in force on their dates, flags possible over and underpayments, and finds savings your products may qualify for.",
  },
  {
    question: "What does Duty Guard Essentials cost?",
    answer: `${prices(ALERT_TIERS)} products a month, and a quote above ${TRACKER_MAX_LISTED_PAIRS}. Annual billing is ${ANNUAL_DISCOUNT * 100}% off. Every plan has a 30-day money-back guarantee.`,
  },
  {
    question: "What does Duty Guard Pro cost?",
    answer: `${prices(AUDIT_TIERS)} products a month, and a quote above ${TRACKER_MAX_LISTED_PAIRS}. Annual billing is ${ANNUAL_DISCOUNT * 100}% off. Each plan includes the Duty Guard Essentials plan of the same name, and you keep 100% of what you recover: no contingency fee. If you do 10 audits within 30 days and aren't satisfied, we'll refund you in full.`,
  },
  {
    question: "What counts as a product?",
    answer:
      "One HTS code from one country of origin. Most catalogs have far fewer products than SKUs: 40 SKUs of the same screw from China is 1 product, and the same screw from China and Vietnam is 2.",
  },
  {
    question: "Do I need a credit card to start?",
    answer: "No. Create a free account and add your products. You only add a card if you decide to subscribe.",
  },
  {
    question: `What if I have more than ${TRACKER_MAX_LISTED_PAIRS} products?`,
    answer: `Talk to us. Catalogs over ${TRACKER_MAX_LISTED_PAIRS} products get volume pricing, and we'll help you load your catalog.`,
  },
  {
    question: "How does annual billing work?",
    answer: `Pay for a year up front and every Duty Guard plan costs ${ANNUAL_DISCOUNT * 100}% less per month, rounded down to the dollar. You can change or cancel your plan anytime. Classification plans are billed monthly.`,
  },
  {
    question: "Should my team get the Team plan or separate licenses?",
    answer: `Separate licenses give each person their own Classify account for ${formatPrice(CLASSIFY_LICENSE_PRICE)} a month. The Team plan (${formatPrice(CLASSIFY_PLANS.team.price)} a month) adds a shared workspace where your team reviews and approves each other's work, plus onboarding and training. It's for teams classifying at least ${TEAM_MIN_CLASSIFICATIONS} products a month, and from ${TEAM_BREAK_EVEN_SEATS} people it costs less than licenses.`,
  },
];

// What each level has, for the comparison. true is a check, false a dash, text says how much.
export const COMPARE: { label: string; free: string | boolean; alerts: string | boolean; audits: string | boolean }[] = [
  { label: "Duty lookups", free: "Unlimited", alerts: "Unlimited", audits: "Unlimited" },
  { label: "Products in your catalog", free: "Unlimited", alerts: "Unlimited", audits: "Unlimited" },
  { label: "Current duty, rate history and exports", free: true, alerts: true, audits: true },
  { label: "AD/CVD check on any product", free: true, alerts: true, audits: true },
  { label: "Tariff News emails", free: true, alerts: true, audits: true },
  { label: "Heads-up when a tariff hits your products", free: true, alerts: true, audits: true },
  { label: "Which products were hit, rate before and after", free: false, alerts: true, audits: true },
  { label: "Impact checks on any tariff action", free: "A count only", alerts: true, audits: true },
  { label: "AD/CVD alerts and updates", free: false, alerts: true, audits: true },
  { label: "Slack and Microsoft Teams alerts", free: false, alerts: "100+ products", audits: "100+ products" },
  { label: "Entry audits, over and underpayments flagged", free: false, alerts: false, audits: "Unlimited" },
  { label: "Savings detection", free: false, alerts: false, audits: true },
  { label: "Sourcing", free: true, alerts: true, audits: true },
  { label: "Money-back guarantee", free: false, alerts: "30 days", audits: "10 audits in 30 days" },
];
