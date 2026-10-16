import config from "@/config";
import { sectionUrl } from "@/components/tariff-tracker";
import { AUDITS_ENABLED } from "@/libs/tariff-tracker/features";

// Where the audit page's calls to action go. A self-audit runs in the Tracker's Entries section,
// which spends the account's free audit checks, then needs a paid plan (PRICING.md); signing up
// lands there. Audits are off for the Tracker MVP (features.ts): the Entries section is hidden, so
// every self-serve path shows "Coming soon" (SELF_AUDIT_LIVE) and the page steers to the request
// form or to tracking imports instead.
export const SELF_AUDIT_LIVE = AUDITS_ENABLED;
export const SELF_AUDIT_URL = sectionUrl("entries");
export const SIGN_UP_TO_AUDIT = `${config.auth.loginUrl}?sign-up=true&redirect=${encodeURIComponent(SELF_AUDIT_URL)}`;
// While self-serve audits are coming soon: a free account that tracks imports
export const SIGN_UP_TO_TRACK = `${config.auth.loginUrl}?sign-up=true&redirect=${encodeURIComponent(sectionUrl("catalog"))}`;
export const REQUEST_ANCHOR = "#request";
