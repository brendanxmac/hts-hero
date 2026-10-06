import { htsCodeDigitsOnly } from "../../../libs/hts-code";

// Where duty results are shown and where visits to the Tariff Calculator come from, for analytics

// Where a duty result was shown: the calculator page, or an estimate embedded elsewhere
export type ResultSurface = "calculator" | "explorer" | "explorer_modal" | "classification" | "hts_code_page";

// The pages that link into the calculator with a code
export type CalculatorLinkSource = Exclude<ResultSurface, "calculator">;

// Over the calculator, the explorer is the calculator's own search modal
export const estimateSurface = (surface: "explorer" | "classification"): CalculatorLinkSource =>
  surface === "explorer" && window.location.pathname.startsWith("/duty-calculator") ? "explorer_modal" : surface;

const HANDOFF_KEY = "hts-hero-calculator-handoff";
// Older than this, a handoff belongs to some earlier click that never arrived
const HANDOFF_MAX_AGE_MS = 60_000;

// Pages that open a code in the calculator note it just before leaving, so the calculator can
// tell them apart from people arriving on a shared or external link
export const markCalculatorHandoff = (code: string, source: CalculatorLinkSource) => {
  try {
    window.sessionStorage.setItem(
      HANDOFF_KEY,
      JSON.stringify({ code: htsCodeDigitsOnly(code), source, at: Date.now() })
    );
  } catch {
    // Storage can be unavailable (private mode); the visit then counts as a plain link
  }
};

// The page that sent this code to the calculator, if one did. Each handoff is used once.
export const takeCalculatorHandoff = (code: string): CalculatorLinkSource | null => {
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(HANDOFF_KEY);
    const handoff = JSON.parse(raw);
    return handoff.code === htsCodeDigitsOnly(code) && Date.now() - handoff.at < HANDOFF_MAX_AGE_MS
      ? handoff.source
      : null;
  } catch {
    return null;
  }
};

// How a visit to the calculator began: from another site (or typed, or bookmarked), from one
// of our own pages, or by reloading or going back to it
export type Arrival = "external" | "internal" | "reload" | "back_forward";

// Only the page the browser loaded can be a reload or come from another site. Remembered so
// React's development double-mount sees the same answer.
let documentArrival: { href: string; arrival: Arrival } | null = null;

export const calculatorArrival = (): Arrival => {
  const href = window.location.href;
  if (documentArrival) return documentArrival.href === href ? documentArrival.arrival : "internal";
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  // The browser loaded some other page of ours, then the site navigated here
  const loadedHere = !nav || new URL(nav.name).pathname === window.location.pathname;
  const fromOurSite = (() => {
    try {
      return Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
    } catch {
      return false;
    }
  })();
  const arrival: Arrival = !loadedHere
    ? "internal"
    : nav?.type === "reload"
      ? "reload"
      : nav?.type === "back_forward"
        ? "back_forward"
        : fromOurSite
          ? "internal"
          : "external";
  documentArrival = { href, arrival };
  return arrival;
};
