import { signupHref } from "@/components/tariff-tracker/access/signup";
import { sectionUrl } from "@/components/tariff-tracker";

// Where the audit page's calls to action go. A self-audit runs in the Tracker's Entries section,
// free during the account's 14-day trial, then on a paid plan (PRICING.md); signing up
// lands there.
export const SELF_AUDIT_URL = sectionUrl("entries");
export const SIGN_UP_TO_AUDIT = signupHref(SELF_AUDIT_URL);
export const REQUEST_ANCHOR = "#request";
