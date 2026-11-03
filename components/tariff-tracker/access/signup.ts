// The sign-up page (/signup, its own route so sign-ups are tracked apart from sign-ins), coming
// back to `redirect` (a path on this site) once the account exists. `reason` is what they reached
// for, when the page should say so
export const SIGNUP_PATH = "/signup";
export const signupHref = (redirect: string, reason?: "adcvd") =>
  `${SIGNUP_PATH}?redirect=${encodeURIComponent(redirect)}${reason ? `&for=${reason}` : ""}`;

// Where a new account from a "Try it free" button starts: Duty Guard, on adding its imports
// (ImportTakeover's ?setup=add), so the first thing they do is the thing the trial is for
export const TRACKER_START = "/duty-guard?setup=add";

// Every Duty Guard "Try it free" button on the marketing and reference pages: the sign-up form
// (never the sign-in form), then straight into Duty Guard
export const TRY_FREE_HREF = signupHref(TRACKER_START);

// Set on every request from a signed-in account (proxy.ts), so a signed-out visit to Duty Guard
// knows whether to open the sign-in form (they've had an account here) or the sign-up form
export const KNOWN_ACCOUNT_COOKIE = "hts-hero-known-account";

// The page as it is now, to come back to after signing up
export const currentPath = () =>
  typeof window === "undefined" ? "/duty-guard" : `${window.location.pathname}${window.location.search}`;
