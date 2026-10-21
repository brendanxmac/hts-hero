import {
  LOWEST_PER_IMPORT,
  REVERSE_TRIAL,
  TRACKER_TIERS,
  formatPrice,
  perImportPrice,
} from "@/components/pricing-calculator/lib/pricing";
import { AUTO_AUDITING, COMING_LOWER, FREE_FOREVER_SHORT, SAVINGS_AUDITS_COMING, SAVINGS_DETECTION } from "@/components/ui/marketing/comingSoon";

// The monitoring page's fixed copy. The FAQ is shown on the page and in its FAQPage schema, so
// the two always match. Prices come from the price list (PRICING.md).

const from = formatPrice(TRACKER_TIERS[0].price);
// The lowest per-import price, per month ("$0.30")
const lowestPerImport = formatPrice(LOWEST_PER_IMPORT);

// The one-sentence answer to "what is it?", written so it can be quoted on its own
export const DEFINITION =
  "HTS Hero's Tariff Tracker monitors the US duty on every HTS code and country of origin you import, and alerts you by email, in the app, or in Slack or Microsoft Teams when a new tariff, exemption or HTS revision changes it.";

export const STEPS = [
  {
    title: "Add your products",
    text: "Paste HTS codes and countries of origin, or upload a CSV with customs value and quantity. Each code and country is one pair.",
  },
  {
    title: "See today's duty on each one",
    text: "Every product gets its full US duty: the base rate, each Chapter 99 tariff with its legal source, exemptions and fees.",
  },
  {
    title: "Get alerted when it changes",
    text: "When a tariff is announced, and again when it reaches the HTS, you see which products it hits, the old and new rate, and the change in %.",
  },
];

export const SOURCES = [
  { name: "HTS revisions", detail: "USITC" },
  { name: "Presidential actions", detail: "Proclamations, executive orders" },
  { name: "Federal Register notices", detail: "USTR, Commerce" },
  { name: "CSMS messages", detail: "CBP" },
];

// short: the line under each channel in the alert diagram, where space is tight
export const CHANNELS = [
  { name: "Email", detail: "One message per change, listing every product it hits", short: "Every product it hits" },
  { name: "In-app", detail: "An alerts feed beside your catalog", short: "Beside your catalog" },
  { name: "Slack", detail: "Posted to the channel your team picks", short: "Your team's channel" },
  { name: "Microsoft Teams", detail: "Posted to the channel your team picks", short: "Your team's channel" },
];

// coming: not live yet (libs/tariff-tracker/features.ts), shown with the SAVINGS_AUDITS_LABEL chip
export const FEATURES: { title: string; text: string; href?: string; linkText?: string; coming?: boolean }[] = [
  {
    title: "Tariff Alerts by HTS Code",
    text: "Alerts only for changes that touch your codes and countries, with the old rate, the new rate, the change in % and the date it takes effect.",
  },
  {
    title: "Early Warning on Announcements",
    text: "A heads-up when a proclamation, Federal Register notice or CSMS message announces a tariff, before it reaches the Harmonized Tariff Schedule.",
  },
  {
    title: "Rate History for Every Product",
    text: "Every change to each product's duty, revision by revision, with the program behind it. Compare any two dates side by side.",
  },
  {
    title: "Impact Checks",
    text: "Pick any tariff action and see exactly how it affects each of your imports, with the rate before and after.",
  },
  {
    title: "AD/CVD Alerts",
    text: "A flag when a tracked import may fall under an antidumping or countervailing duty case, with the range of rates Commerce set and links to the case, so you and your broker can check it.",
  },
  {
    title: "Insights Across Your Catalog",
    text: "Where your duty comes from, what moved it, and which imports and countries are most exposed, across every product you track.",
  },
  {
    title: "Sourcing Intelligence",
    text: "The duty on the same product from every country of origin, as insights, a globe, a table and a chart, to see where it could cost less.",
  },
  {
    title: "Export to CSV or Excel",
    text: "Export every tariff on every import, with each one's rate history, to share or work with in your own tools.",
  },
  {
    title: "Built for Teams",
    text: "Upload your catalog as CSV, route alerts to the right Slack or Teams channel, and share exports with your team.",
  },
  {
    title: SAVINGS_DETECTION.title,
    text: `${SAVINGS_DETECTION.text} Included in the trial and every plan at no extra cost when it launches.`,
    coming: true,
  },
  {
    title: AUTO_AUDITING.title,
    text: `${AUTO_AUDITING.text} Included in the trial and every plan at no extra cost when it launches.`,
    coming: true,
  },
];

// How the Tracker compares with the usual ways of keeping up. Each value is short enough to
// read in a table cell.
export const COMPARISON_COLUMNS = ["Tariff Tracker", "Federal Register emails", "CBP CSMS messages", "Spreadsheet + broker"];

export const COMPARISON_ROWS: { label: string; values: [string, string, string, string]; win?: boolean }[] = [
  {
    label: "Filtered to your products",
    values: ["Yes, by HTS code and country", "No, every notice", "No, every message", "Only if someone checks"],
    win: true,
  },
  {
    label: "New duty on each product",
    values: ["Calculated for you", "Read the notice", "Read the message", "Calculated by hand"],
    win: true,
  },
  {
    label: "Stacking and exemptions applied",
    values: ["Yes, line by line", "No", "No", "Depends on who does it"],
    win: true,
  },
  {
    label: "Warning before the HTS changes",
    values: ["Yes", "Yes", "Yes", "Sometimes"],
  },
  {
    label: "Rate history and impact checks",
    values: ["Yes", "No", "No", "No"],
    win: true,
  },
  {
    label: "Cost",
    values: [`Free for ${REVERSE_TRIAL.days} days, then from ${from}/mo (as low as ${lowestPerImport} per import)`, "Free", "Free", "Your team's time"],
  },
];

export const MONITOR_FAQS = [
  {
    question: "What is tariff tracking software?",
    answer: `Tariff tracking software watches the US duty on the products you import and tells you when it changes. ${DEFINITION} Each alert lists the products affected, the old and new rate, the change in % and the date it takes effect.`,
  },
  {
    question: "How do I get alerts when tariffs change on my products?",
    answer: `Create a free HTS Hero account, add your products as HTS code and country of origin pairs (paste them or upload a CSV), and choose where alerts go: email, the in-app feed, Slack or Microsoft Teams. From then on, any tariff change that touches one of your imports sends an alert. Every new account gets alerts on up to ${REVERSE_TRIAL.imports} imports free for ${REVERSE_TRIAL.days} days, with no credit card; after that, a paid plan keeps alerts on your imports, and ${FREE_FOREVER_SHORT} stay free, forever.`,
  },
  {
    question: "Which sources does the Tariff Tracker watch?",
    answer:
      "Every revision of the Harmonized Tariff Schedule published by the US International Trade Commission, plus the announcements that come before them: presidential proclamations and executive orders, Federal Register notices from USTR and the Commerce Department, and CBP's CSMS messages.",
  },
  {
    question: "How quickly will I hear about a tariff change?",
    answer:
      "You get a heads-up when a tariff is announced, and a rate alert when it reaches the HTS, usually within a day of USITC publishing the revision. The rate alert shows the exact duty on each affected product, with stacking and exemptions applied.",
  },
  {
    question: "Which tariffs does it cover?",
    answer:
      "The base rate and every Chapter 99 tariff: Section 232 (steel, aluminum, copper, autos, wood, pharmaceuticals, semiconductors, drones and more), Section 301 (China, Brazil, forced labor), Section 201 safeguards, Section 338 on Canada, country trade deals and quotas, plus trade preferences like USMCA and the MPF and HMF fees. Antidumping and countervailing duties are flagged rather than added to the duty, since they're set for specific producers: the Tracker flags imports that may fall under a case, with the range of rates and links to the source, so you and your broker can check.",
  },
  {
    question: "How much does the Tariff Tracker cost?",
    answer: `Every new account gets the whole Tariff Tracker free for ${REVERSE_TRIAL.days} days, with no credit card and nothing to start (the 14 days begin when you add your imports): alerts (AD/CVD alerts included), impact checks, Insights, Tariff News, rate history and exports, on up to ${REVERSE_TRIAL.imports} imports (an import is one HTS code from one country of origin). After the trial, ${FREE_FOREVER_SHORT} stay free, forever, and so do your whole catalog with its current duty, rate history and exports. Nothing is deleted. To keep alerts and impact checks on your imports, paid plans start at ${from} a month to track up to ${TRACKER_TIERS[0].maxPairs} imports, billed monthly. Per import, that's ${TRACKER_TIERS.map((t) => `${formatPrice(perImportPrice(t))} on the ${t.maxPairs}-import plan`).join(", ")}: as low as ${lowestPerImport} per import, per month. ${SAVINGS_AUDITS_COMING}`,
  },
  {
    question: "What happens when the free trial ends?",
    answer: `If you don't pick a plan, your account moves to the free plan on its own. Alerts, impact checks and AD/CVD checks on your own imports stop, but you keep Tariff News alerts (every new US tariff action, by email) and sourcing insights on any import, free, forever, and your whole catalog stays in your account with its current duty, rate history and exports. You're never charged unless you choose a plan.`,
  },
  {
    question: "Does the Tariff Tracker find savings or audit my entries?",
    answer: `Not yet: automatic savings detection and automatic auditing are ${COMING_LOWER}. Savings detection will check every import for trade programs, exemptions and lower-duty origins you may qualify for. Auditing will check every entry against the duty in force on its date and flag possible over- and underpayments, for you and your broker to review. Both will be included in the trial and every paid plan at no extra cost.`,
  },
  {
    question: "What's the difference between the Tariff Calculator and the Tariff Tracker?",
    answer:
      "The Tariff Calculator answers one question at a time: the duty on one import today, free and with no account. The Tariff Tracker keeps answering it for your whole catalog, every day, and tells you when the answer changes.",
  },
  {
    question: "Is HTS Hero a customs broker?",
    answer:
      "No. HTS Hero is software that calculates and monitors US duty from official sources. Filing entries, corrections and protests is done by a licensed customs broker or by the importer of record.",
  },
];
