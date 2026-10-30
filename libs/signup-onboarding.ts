import { sectionUrl, TRACKER_PATH } from "@/components/tariff-tracker/sections";
import { signupHref } from "@/components/tariff-tracker/access/signup";

// The sign-up onboarding (/onboarding): three questions right after signing up from the homepage,
// saved to signup_onboarding (supabase/migrations/signup_onboarding.sql) for founder follow-up,
// and where the visitor first came from.

export const ONBOARDING_PATH = "/onboarding";

// Where a finished onboarding goes, by the homepage section they started from (?from=, kept as
// signup_onboarding.entry_point). The Tracker reads ?welcome= (TourTriggers): "calculator" opens
// its calculator with no tour or popup; "imports" opens the tour and "alerts" opens it on its
// Alerts step, both ending in adding imports.
// /classifications reads ?welcome=tour (ClassifyTour) and ends on a new classification.
// Where a sign-up started (?from=, signup_onboarding.entry_point): a homepage section with a button,
// or one of the sales pages (/tariff-alerts, /duty-audits)
export const HOME_SECTIONS = ["hero", "audit", "alerts", "calculator", "savings", "classify", "closing"] as const;
export const ENTRY_POINTS = [...HOME_SECTIONS, "alerts_page", "audits_page"] as const;
export type HomeSection = (typeof HOME_SECTIONS)[number];
export type EntryPoint = (typeof ENTRY_POINTS)[number];
export const isEntryPoint = (v: unknown): v is EntryPoint => ENTRY_POINTS.includes(v as EntryPoint);

// Every sign-up button: sign up, then the onboarding, remembering where it started (?from=)
export const entryHref = (entry: EntryPoint) => signupHref(`${ONBOARDING_PATH}?from=${entry}`);

// Signed in, the same button opens the product itself instead of signing up again
export const ENTRY_SIGNED_IN_HREF: Record<EntryPoint, string> = {
  hero: TRACKER_PATH,
  audit: sectionUrl("entries"),
  alerts: sectionUrl("changes"),
  calculator: "/duty-calculator",
  savings: sectionUrl("savings"),
  classify: "/classifications",
  closing: TRACKER_PATH,
  alerts_page: sectionUrl("changes"),
  audits_page: sectionUrl("entries"),
};

export const TRACKER_WELCOME_PARAM = "welcome";
export const CLASSIFY_WELCOME = "/classifications?welcome=tour";
const withParam = (url: string, value: string) => `${url}${url.includes("?") ? "&" : "?"}${TRACKER_WELCOME_PARAM}=${value}`;
export const onboardingNext = (entryPoint: string | null | undefined): string => {
  if (entryPoint === "calculator") return withParam(sectionUrl("calculator"), "calculator");
  if (entryPoint === "classify") return CLASSIFY_WELCOME;
  // Alerts: the tour opens on Alerts, then into adding imports
  if (entryPoint === "alerts" || entryPoint === "alerts_page") return withParam(TRACKER_PATH, "alerts");
  // Savings and audits, and everything else (the hero, the closing button): the tour, into adding
  // imports, since everything in the Tracker runs on them
  return withParam(TRACKER_PATH, "imports");
};

export const COMPANY_TYPES = [
  { id: "customs_broker", label: "Customs Brokerage" },
  { id: "freight_forwarder", label: "Freight Forwarder" },
  { id: "ecommerce", label: "Ecommerce (Shopify, Amazon, etc)" },
  { id: "manufacturing", label: "Manufacturing" },
  { id: "3pl", label: "3PL" },
  { id: "other", label: "Other" },
] as const;

export const ROLES = [
  { id: "owner", label: "Owner" },
  { id: "director", label: "Director" },
  { id: "manager", label: "Manager" },
  { id: "employee", label: "Employee" },
] as const;

export type CompanyType = (typeof COMPANY_TYPES)[number]["id"];
export type Role = (typeof ROLES)[number]["id"];

export const isCompanyType = (v: unknown): v is CompanyType => COMPANY_TYPES.some((t) => t.id === v);
export const isRole = (v: unknown): v is Role => ROLES.some((r) => r.id === v);

// A website as typed ("acme.com", "https://www.acme.com/"), or null if it doesn't look like one
export const cleanWebsite = (raw: string): string | null => {
  const v = raw.trim().slice(0, 200);
  if (!/^(https?:\/\/)?[^\s/]+\.[^\s/]{2,}(\/\S*)?$/i.test(v)) return null;
  return v.replace(/\/+$/, "");
};

// The visitor's first visit to the site: where they came from and the page they landed on. Kept
// in this browser from the first page view (LayoutClient), and saved with the onboarding answers.
// Mixpanel keeps its own copy too ($initial_referrer, $initial_referring_domain).
export type FirstTouch = {
  referrer: string | null;
  referring_domain: string | null;
  landing_path: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  at: string;
};

const FIRST_TOUCH_KEY = "hts-hero-first-touch";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

// Kept once per browser: later visits never overwrite it
export const recordFirstTouch = () => {
  try {
    if (localStorage.getItem(FIRST_TOUCH_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    let domain: string | null = null;
    try {
      domain = document.referrer ? new URL(document.referrer).hostname : null;
    } catch {
      domain = null;
    }
    const touch: FirstTouch = {
      referrer: document.referrer || null,
      referring_domain: domain,
      landing_path: window.location.pathname,
      at: new Date().toISOString(),
    };
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) touch[key] = value.slice(0, 200);
    }
    localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch));
  } catch {
    // Storage blocked: no first touch for this browser
  }
};

export const readFirstTouch = (): FirstTouch | null => {
  try {
    const raw = localStorage.getItem(FIRST_TOUCH_KEY);
    return raw ? (JSON.parse(raw) as FirstTouch) : null;
  } catch {
    return null;
  }
};
