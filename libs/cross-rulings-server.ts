import { unstable_cache } from "next/cache";
import type { CrossRuling } from "../interfaces/cross-rulings";
import { parseRulingTariffs } from "./cross-rulings";

// CBP's CROSS rulings search, on the server: the /api/cross-rulings route, and the /hts/[code]
// pages, which put the rulings in their HTML so crawlers and answer engines see them.

export const CROSS_CACHE_TTL_SECONDS = 8 * 60 * 60; // 8 hours

// CBP put reCAPTCHA in front of its search API, so servers get a 403. Until that's sorted out we
// don't call it: rulings already in the cache are still served, anything else is "unavailable".
export const CROSS_SEARCH_ENABLED = false;

async function fetchRulingsFromCbp(term: string, signal?: AbortSignal): Promise<CrossRuling[]> {
  // Throw, never return []: that would replace the cached rulings with an empty list
  if (!CROSS_SEARCH_ENABLED) {
    throw new Error("CROSS search is disabled");
  }

  const url = `https://rulings.cbp.gov/api/search?term=${encodeURIComponent(term)}&sortBy=RELEVANCE`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`CBP API returned ${response.status}`);
  }

  const data = await response.json();
  const results: CrossRuling[] = data?.rulings ?? [];
  return results.filter(
    (item) =>
      item.categories && item.categories.toLowerCase().includes("classification")
  );
}

// The classification rulings for a search term, cached for CROSS_CACHE_TTL_SECONDS
export const getCachedRulings = (term: string, signal?: AbortSignal) => {
  const fetchRulings = () => fetchRulingsFromCbp(term, signal);
  // unstable_cache keys on the callback's source. Minified, that can change with any build, and CBP
  // can't refill the cache right now, so this holds the key the /hts pages' rulings are stored under.
  fetchRulings.toString = () => "()=>at(a,d)";
  return unstable_cache(fetchRulings, [`cross-rulings-search-${term}`], {
    revalidate: CROSS_CACHE_TTL_SECONDS,
  })();
};

// For a page render: the rulings that classify something under the page's code, or null when CBP
// doesn't answer within `ms` (the page then fetches them in the browser), so a slow CBP never
// holds up the page. CBP's search is full text, so "7318" also finds style numbers and CAS numbers;
// only rulings whose tariff codes start with the code's digits go in the page.
export async function rulingsForPage(term: string, ms = 1500): Promise<CrossRuling[] | null> {
  const digits = term.replace(/\D/g, "");
  try {
    const rulings = await getCachedRulings(term, AbortSignal.timeout(ms));
    return rulings.filter((r) => parseRulingTariffs(r.tariffs).some((code) => code.replace(/\D/g, "").startsWith(digits)));
  } catch {
    return null;
  }
}
