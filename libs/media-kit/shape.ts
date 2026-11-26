import type { Row, SearchWeek, Totals } from "./types";

// Shaping Search Console rows the same way for the live API and the snapshot built from exports

// Monday of the week a day falls in (UTC, YYYY-MM-DD)
export const weekOf = (day: string) => {
  const d = new Date(`${day}T00:00:00Z`);
  const back = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0, 10);
};

// Daily rows into weeks, oldest first. Weeks before the first click are dropped (nothing to show),
// and a last week with fewer than 7 days is marked partial.
export const toWeeks = (days: { date: string; clicks: number; impressions: number }[]): SearchWeek[] => {
  const weeks = new Map<string, SearchWeek & { days: number }>();
  for (const d of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    const key = weekOf(d.date);
    const w = weeks.get(key) ?? { week: key, clicks: 0, impressions: 0, days: 0 };
    w.clicks += d.clicks;
    w.impressions += d.impressions;
    w.days += 1;
    weeks.set(key, w);
  }
  const list = Array.from(weeks.values());
  const first = list.findIndex((w) => w.clicks > 0);
  return list.slice(Math.max(first, 0)).map(({ days, ...w }) => (days < 7 ? { ...w, partial: true } : w));
};

// Totals over the days from `from` to `to` (inclusive)
export const totalsBetween = (
  days: { date: string; clicks: number; impressions: number; position?: number }[],
  from: string,
  to: string
): Totals => {
  const inRange = days.filter((d) => d.date >= from && d.date <= to);
  const clicks = inRange.reduce((s, d) => s + d.clicks, 0);
  const impressions = inRange.reduce((s, d) => s + d.impressions, 0);
  // Average position weighted by impressions, as Search Console reports it
  const weighted = inRange.reduce((s, d) => s + (d.position ?? 0) * d.impressions, 0);
  return { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position: impressions ? weighted / impressions : 0 };
};

export const shiftDay = (day: string, by: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + by);
  return d.toISOString().slice(0, 10);
};

// Searches for our own name don't show reach, so they're left out of the top searches
export const isBrandQuery = (q: string) => /hts\s*hero|htshero/i.test(q);

// What kind of page a URL is, as a sponsor would think of it
export const pageGroup = (url: string) => {
  const path = url.replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0] || "/";
  if (path === "/") return "Home page";
  if (/^\/duty-calculator\/(faq|changelog|countries)/.test(path)) return "Calculator guides";
  if (path.startsWith("/duty-calculator/")) return "Country tariff calculators";
  if (path === "/duty-calculator") return "US tariff calculator";
  if (path.startsWith("/hts/99")) return "Chapter 99 tariff headings";
  if (path.startsWith("/hts/")) return "HTS code pages";
  if (path.startsWith("/tariffs")) return "Tariff program guides";
  if (path.startsWith("/tariff-updates")) return "Tariff news";
  if (path.startsWith("/blog") || path.startsWith("/compare")) return "Guides and comparisons";
  return "Other pages";
};

export const pathOf = (url: string) => url.replace(/^https?:\/\/[^/]+/, "") || "/";

// Rows summed by a key, most clicks first
export const groupRows = (rows: Row[], keyOf: (label: string) => string): Row[] => {
  const groups = new Map<string, Row>();
  for (const r of rows) {
    const key = keyOf(r.label);
    const g = groups.get(key) ?? { label: key, clicks: 0, impressions: 0 };
    g.clicks += r.clicks;
    g.impressions += r.impressions;
    groups.set(key, g);
  }
  return Array.from(groups.values()).sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
};
