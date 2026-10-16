// What the Tariff Tracker sells right now (see MVP_TRIM.md). The Tracker MVP (2026-10-16) ships
// tracking, alerts, impact checks, rate history and exports. Savings (savings checks, the
// qualification check) and audits (entry audit, refund check) stay in the code but are switched
// off, and come back soon as their own subscription. Flip these to bring them back, then follow
// MVP_TRIM.md for the copy.

export const SAVINGS_ENABLED = false;
export const AUDITS_ENABLED = false;

// Tracker plans are monthly only for now (Classification and Managed keep annual billing)
export const TRACKER_ANNUAL_ENABLED = false;

// The one line that tells people savings and audits are on their way
export const SAVINGS_AUDITS_SOON = "Savings and audits are coming soon, as their own plan.";
