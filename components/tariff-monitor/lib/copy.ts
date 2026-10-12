import {
  FREE_TRACKED_PAIRS,
  TRACKER_TIERS,
  TRIAL_DAYS,
  TRIAL_PAIRS,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing";

// The monitoring page's fixed copy. The FAQ is shown on the page and in its FAQPage schema, so
// the two always match. Prices come from the price list (PRICING.md).

const from = formatPrice(TRACKER_TIERS[0].price);

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
    text: "When a tariff is announced, and again when it reaches the HTS, you see which products it hits, the old and new rate, and what it costs.",
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

export const FEATURES: { title: string; text: string; href?: string; linkText?: string }[] = [
  {
    title: "Tariff alerts by HTS code",
    text: "Alerts only for changes that touch your codes and countries, with the old rate, the new rate, the date it takes effect and the cost per product.",
  },
  {
    title: "Early warning on announcements",
    text: "A heads-up when a proclamation, Federal Register notice or CSMS message announces a tariff, before it reaches the Harmonized Tariff Schedule.",
  },
  {
    title: "Rate history for every product",
    text: "Every change to each product's duty, revision by revision, with the program behind it. Compare any two dates side by side.",
  },
  {
    title: "Entry audit",
    text: "Log your entries and see the duty that applied on each entry date, so overpaid and underpaid duty stands out.",
    href: "/tariff-audit",
    linkText: "How tariff audits work",
  },
  {
    title: "Savings discovery",
    text: "The rate on each product from every other country of origin, plus the trade programs and exemptions that could lower it.",
  },
  {
    title: "Built for teams",
    text: "Upload your catalog as CSV, route alerts to the right Slack or Teams channel, and export reports to share.",
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
    label: "Rate history and entry audit",
    values: ["Yes", "No", "No", "No"],
    win: true,
  },
  {
    label: "Cost",
    values: [`Free for ${FREE_TRACKED_PAIRS}, then from ${from}/mo`, "Free", "Free", "Your team's time"],
  },
];

export const MONITOR_FAQS = [
  {
    question: "What is tariff tracking software?",
    answer: `Tariff tracking software watches the US duty on the products you import and tells you when it changes. ${DEFINITION} Each alert lists the products affected, the old and new rate, the date it takes effect and what it costs.`,
  },
  {
    question: "How do I get alerts when tariffs change on my products?",
    answer: `Create a free HTS Hero account, add your products as HTS code and country of origin pairs (paste them or upload a CSV), and choose where alerts go: email, the in-app feed, Slack or Microsoft Teams. From then on, any tariff change that touches one of your pairs sends an alert.`,
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
      "The base rate and every Chapter 99 tariff: Section 232 (steel, aluminum, copper, autos, wood, pharmaceuticals, semiconductors, drones and more), Section 301 (China, Brazil, forced labor), Section 201 safeguards, Section 338 on Canada, country trade deals and quotas, plus trade preferences like USMCA and the MPF and HMF fees. Antidumping and countervailing duties aren't included, since they're set for specific producers.",
  },
  {
    question: "How much does the Tariff Tracker cost?",
    answer: `It's free for ${FREE_TRACKED_PAIRS} HTS code and country pairs, with monitoring and alerts. You can try the full Tracker for up to ${TRIAL_PAIRS} pairs free for ${TRIAL_DAYS} days, no credit card. Paid plans start at ${from} a month for ${TRACKER_TIERS[0].maxPairs} pairs and add rate history, entry audit and savings discovery.`,
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
