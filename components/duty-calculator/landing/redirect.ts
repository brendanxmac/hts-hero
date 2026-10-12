// This page as it is now (its inputs are in the address), with extra parameters: where sign-up
// sends a visitor back to. Signed in, /duty-calculator forwards to the Tracker's calculator with
// the same parameters, so `view=analysis` opens straight onto the Analysis there.
export const thisPageWith = (extra: Record<string, string> = {}) => {
  const url = new URL(window.location.href);
  Object.entries(extra).forEach(([k, v]) => url.searchParams.set(k, v));
  return `${url.pathname}${url.search}`;
};
