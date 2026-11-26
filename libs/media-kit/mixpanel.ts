import type { AudienceStats, AudienceWeek } from "./types";

// Mixpanel, live, for the media kit's audience numbers. Server only. Needs a Mixpanel service
// account (Organization settings → Service accounts, role Consumer, access to the project):
//   MIXPANEL_SERVICE_ACCOUNT_USERNAME, MIXPANEL_SERVICE_ACCOUNT_SECRET
//   MIXPANEL_PROJECT_ID   default 3768432 (production)
//   MIXPANEL_API_HOST     default https://mixpanel.com (https://eu.mixpanel.com for EU residency)
// Without them the media kit uses the snapshot.

// Bot traffic has been filtered out of Mixpanel since this week; earlier weeks overcount visitors
export const AUDIENCE_FROM = "2026-11-02";

const PAGE_VIEW = "$mp_web_page_view";
const CALCULATOR_RESULT = "Duty Calculator Results Viewed";

export const mixpanelConfigured = () => Boolean(process.env.MIXPANEL_SERVICE_ACCOUNT_USERNAME && process.env.MIXPANEL_SERVICE_ACCOUNT_SECRET);

type Values = Record<string, Record<string, number>>;

const segmentation = async (params: Record<string, string>): Promise<Values> => {
  const host = process.env.MIXPANEL_API_HOST || "https://mixpanel.com";
  const search = new URLSearchParams({ project_id: process.env.MIXPANEL_PROJECT_ID || "3768432", ...params });
  const auth = Buffer.from(`${process.env.MIXPANEL_SERVICE_ACCOUNT_USERNAME}:${process.env.MIXPANEL_SERVICE_ACCOUNT_SECRET}`).toString("base64");
  const res = await fetch(`${host}/api/query/segmentation?${search}`, { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`Mixpanel query failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { data: { values: Values } }).data.values;
};

const today = () => new Date().toISOString().slice(0, 10);

const daysBefore = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};

export const fetchMixpanel = async (): Promise<AudienceStats | null> => {
  if (!mixpanelConfigured()) return null;
  const to = today();
  const weekly = { from_date: AUDIENCE_FROM, to_date: to, unit: "week" };
  const [visitors, views, results, byCountry] = await Promise.all([
    segmentation({ event: PAGE_VIEW, type: "unique", ...weekly }),
    segmentation({ event: PAGE_VIEW, type: "general", ...weekly }),
    segmentation({ event: CALCULATOR_RESULT, type: "general", ...weekly }),
    // Page views by country over the last 28 days (unique visitors can't be summed across weeks)
    segmentation({ event: PAGE_VIEW, type: "general", unit: "month", from_date: daysBefore(to, 27), to_date: to, on: 'properties["mp_country_code"]' }),
  ]);

  const first = (v: Values) => Object.values(v)[0] ?? {};
  const weeks = Object.keys(first(visitors)).sort();
  const thisWeek = weeks[weeks.length - 1];
  // A week is partial until its Sunday has passed
  const isPartial = (week: string) => daysBefore(to, 6) < week;
  const audienceWeeks: AudienceWeek[] = weeks.map((week) => ({
    week: week.slice(0, 10),
    visitors: first(visitors)[week] ?? 0,
    pageViews: first(views)[week] ?? 0,
    calculatorResults: first(results)[week] ?? 0,
    ...(week === thisWeek && isPartial(week.slice(0, 10)) ? { partial: true } : {}),
  }));

  const names = new Intl.DisplayNames(["en"], { type: "region" });
  const countryTotals = Object.entries(byCountry)
    .map(([code, byMonth]) => ({ code, views: Object.values(byMonth).reduce((s, n) => s + n, 0) }))
    .filter((c) => c.code && c.code !== "undefined");
  const all = countryTotals.reduce((s, c) => s + c.views, 0);
  const countries = countryTotals
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map((c) => ({ label: (c.code.length === 2 && names.of(c.code.toUpperCase())) || c.code, share: all ? c.views / all : 0 }));

  return { source: "live", asOf: to, weekly: audienceWeeks, countries, countryBasis: "page views" };
};
