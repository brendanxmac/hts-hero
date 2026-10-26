import config from "@/config";

// The sign-up page, coming back to `redirect` (a path on this site) once the account exists
export const signupHref = (redirect: string) =>
  `${config.auth.loginUrl}?sign-up=true&redirect=${encodeURIComponent(redirect)}`;

// Where a new account from a "Try it free" button starts: the Tracker, on adding its imports
// (ImportTakeover's ?setup=add), so the first thing they do is the thing the trial is for
export const TRACKER_START = "/tariff-tracker?setup=add";

// Every Tariff Tracker "Try it free" button on the marketing and reference pages: the sign-up form
// (never the sign-in form), then straight into the Tracker
export const TRY_FREE_HREF = signupHref(TRACKER_START);

// Set on every request from a signed-in account (proxy.ts), so a signed-out visit to the Tracker
// knows whether to open the sign-in form (they've had an account here) or the sign-up form
export const KNOWN_ACCOUNT_COOKIE = "hts-hero-known-account";

// The page as it is now, to come back to after signing up
export const currentPath = () =>
  typeof window === "undefined" ? "/tariff-tracker" : `${window.location.pathname}${window.location.search}`;
