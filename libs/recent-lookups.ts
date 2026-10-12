// The products someone looked up in the calculator, newest first, kept on this device. The
// Tariff Tracker offers them as a head start for a new catalog ("start from your recent lookups").
// Signing up keeps them: they're read from the same device afterward.

export interface RecentLookup {
  // 8 or 10 digits, no dots
  code: string;
  // The code as the HTS writes it, for display
  htsno: string;
  // Two-letter country code
  country: string;
  // The total duty as a percent of the value looked up
  pct: number;
  // ISO date-time
  at: string;
}

const KEY = "hts-hero-recent-lookups";
const MAX = 20;

export const readRecentLookups = (): RecentLookup[] => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((l) => l && typeof l.code === "string" && typeof l.country === "string")
      : [];
  } catch {
    return [];
  }
};

// Newest first, one entry per code and country
export const recordLookup = (lookup: Omit<RecentLookup, "at">) => {
  try {
    const rest = readRecentLookups().filter((l) => !(l.code === lookup.code && l.country === lookup.country));
    const next = [{ ...lookup, at: new Date().toISOString() }, ...rest].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Unavailable (private mode): nothing to remember
  }
};

export const clearRecentLookups = () => {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear
  }
};
