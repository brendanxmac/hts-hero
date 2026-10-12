import config from "@/config";
import { sectionUrl } from "@/components/tariff-tracker";

// Where the audit page's calls to action go. A self-audit runs in the Tracker's Entries section,
// which needs the trial or a paid plan (PRICING.md); signing up lands there, on its trial offer.
export const SELF_AUDIT_URL = sectionUrl("entries");
export const SIGN_UP_TO_AUDIT = `${config.auth.loginUrl}?sign-up=true&redirect=${encodeURIComponent(SELF_AUDIT_URL)}`;
export const REQUEST_ANCHOR = "#request";
