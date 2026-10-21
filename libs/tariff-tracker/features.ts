// What the Tariff Tracker sells right now (see MVP_TRIM.md). The Tracker MVP (2026-10-16) ships
// tracking, alerts, impact checks, rate history and exports. Savings (savings checks, the
// qualification check) and audits (entry audit, refund check) stay in the code but are switched
// off, and come back soon as their own subscription. Flip these to bring them back, then follow
// MVP_TRIM.md for the copy.

export const SAVINGS_ENABLED = false;
export const AUDITS_ENABLED = false;

// The marketing pages show savings detection and auditing in full (the homepage's scan passes and
// blocks, their visuals) ahead of the Tracker: while a feature is off it carries
// SAVINGS_AUDITS_LABEL and its self-serve buttons read "Coming soon". The Tracker's tabs, pages and
// checks stay on SAVINGS_ENABLED / AUDITS_ENABLED.
export const SAVINGS_AUDITS_MARKETED = true;
export const MARKET_SAVINGS = SAVINGS_ENABLED || SAVINGS_AUDITS_MARKETED;
export const MARKET_AUDITS = AUDITS_ENABLED || SAVINGS_AUDITS_MARKETED;

// Tracker plans are monthly only for now (Classification and Managed keep annual billing)
export const TRACKER_ANNUAL_ENABLED = false;

// The label on every mention of savings detection and automatic auditing until they're on
export const SAVINGS_AUDITS_LABEL = "Coming Oct 2026";

// The one line that tells people savings and audits are on their way
export const SAVINGS_AUDITS_SOON = "Automatic savings detection and automatic auditing are coming Oct 2026, included in every Tracker plan.";
