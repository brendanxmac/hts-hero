// Import onboarding, shared by the server and the browser: where a sign-up came from (it picks
// the email sequence, libs/email/lifecycle.ts) and why someone skipped adding their imports.

export type SignupSource = "generic" | "calculator" | "tracker" | "classify";

// Where a generic sign-up lands: the home page, with every product on it
export const SIGNUP_HOME = "/?welcome=1";

// The sign-up's source, from where it was headed after the auth callback. Calculator CTAs come back
// to the calculator, Tracker asks to the Tracker; anything else is a generic sign-up.
export const signupSourceFor = (redirect: string | null | undefined): SignupSource => {
  const path = (redirect ?? "").split(/[?#]/)[0];
  if (path.startsWith("/duty-calculator") || path.startsWith("/tariffs") || path.startsWith("/hts/")) return "calculator";
  if (path.startsWith("/tariff-tracker") || path.startsWith("/tariff-monitor") || path.startsWith("/tariff-audit") || path.startsWith("/tariff-updates")) return "tracker";
  if (path.startsWith("/classify") || path.startsWith("/classifications") || path.startsWith("/c/")) return "classify";
  return "generic";
};

// Why "Skip for now" was pressed on the import takeover (tracker_onboarding.skip_reason)
export const SKIP_REASONS = [
  { id: "no_list", label: "I don't have my list right now" },
  { id: "looking", label: "I'm just looking around first" },
  { id: "someone_else", label: "Someone else handles our customs" },
  { id: "what_is_import", label: "I'm not sure what counts as an import" },
  { id: "other", label: "Something else" },
] as const;

// "Remind me tomorrow" in "I don't have my list handy" is a skip too
export type SkipReason = (typeof SKIP_REASONS)[number]["id"] | "remind_me";
export const isSkipReason = (x: unknown): x is SkipReason =>
  x === "remind_me" || SKIP_REASONS.some((r) => r.id === x);
