// An arrival from one of the one-click ways in: the HTS pages' "Get Alerts" box (watch) or the
// calculator's "Stop Overpaying for This Import" (track). Their links to the import in the Tracker
// carry `from=`, through sign-up and back, so its first visit can be a quiet one: the arrival panel
// on the import (ArrivalPanel), no tour opening by itself (TourTriggers) and the sidebar folded
// (TrackerShell), without saving any of that for later visits.

export type ArrivalSource = "watch" | "track";

const PARAM = "from";

// The import's address in the Tracker, marked as an arrival
export const withArrival = (url: string, source: ArrivalSource) => `${url}${url.includes("?") ? "&" : "?"}${PARAM}=${source}`;

// Read once, on the first call in the browser, so it holds for the whole visit after the panel
// takes the marker out of the address
let read = false;
let source: ArrivalSource | null = null;
export const arrivalSource = (): ArrivalSource | null => {
  if (typeof window === "undefined") return null;
  if (!read) {
    read = true;
    const value = new URL(window.location.href).searchParams.get(PARAM);
    source = value === "watch" || value === "track" ? value : null;
  }
  return source;
};

// "Explore the Tracker" on the arrival panel: the sidebar, folded for the arrival, opens
export const EXPAND_SIDEBAR_EVENT = "hts-hero:expand-sidebar";

// Takes the marker out of the address, so a reload or a shared link isn't an arrival again
export const clearArrivalParam = () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(PARAM)) return;
  url.searchParams.delete(PARAM);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
};
