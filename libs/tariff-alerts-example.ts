import { unstable_cache } from "next/cache";
import { AllRules } from "../tariffs/engine-v2/data";
import { addDays, calculateHistory } from "../tariffs/engine-v2/history";
import { findRateElement } from "./hts-duty-summary";
import { getHtsElementByCode, getHtsElementParentsServer, getHtsElementsServer } from "./hts-server";
import { MICRO_CUSTOMS_VALUE, microInput } from "./hts-micro-estimate";

// The alert on /tariff-alerts: a real tariff action (Section 301 on products of Brazil, 25% from
// Jul 22, 2026, heading 9903.05.01) landing on an example catalog. The catalog is made up; every
// rate is the engine's total duty (base plus tariffs, % of value) on the day before the action and
// on the day it took effect, so the before → after is real.

const ACTION = {
  program: "Section 301" as const,
  title: "Products of Brazil",
  heading: "9903.05.01",
  effective: "2026-07-22",
  source: "Federal Register",
  // When it went public, from the update's sources in the feed (tariff_source_items): USTR's
  // hearing notice on the proposed action, USTR's announcement, the Federal Register notice, and
  // the day the duty started
  milestones: { proposed: "2026-07-02", announced: "2026-07-15", published: "2026-07-20", effective: "2026-07-22" },
};

// Five imports it hit and three it didn't, in the order a catalog lists them, each at its full
// 10-digit statistical code (the rate comes from its 8-digit subheading)
const CATALOG = [
  { name: "Wooden dining chairs", code: "9401.61.60.11", country: "BR" },
  { name: "Oak bookcases", code: "9403.60.80.93", country: "BR" },
  { name: "Leather boots", code: "6403.99.90.65", country: "BR" },
  { name: "Pendant lights", code: "9405.42.84.40", country: "BR" },
  { name: "Plastic storage bins", code: "3926.90.99.89", country: "BR" },
  { name: "Oak bookcases", code: "9403.60.80.93", country: "VN" },
  { name: "Plastic storage bins", code: "3926.90.99.89", country: "CN" },
  { name: "Pendant lights", code: "9405.42.84.40", country: "MX" },
];

const COUNTRY_NAMES: Record<string, string> = { BR: "Brazil", VN: "Vietnam", CN: "China", MX: "Mexico" };

// Tariffs come down too: Brazilian farm goods the US exempted from its 40% duty on Brazil from
// Nov 13, 2025. Real codes and dates; the rates are the engine's, before and after, like the rest.
const RELIEF = {
  effective: "2025-11-13",
  items: [
    { name: "Arabica coffee beans", code: "0901.11.00.25", country: "BR" },
    { name: "Frozen beef loin cuts", code: "0202.30.50.45", country: "BR" },
  ],
};

export interface AlertExampleRow {
  name: string;
  htsno: string;
  country: string;
  beforePct: number;
  afterPct: number;
}

export interface AlertExample {
  program: typeof ACTION.program;
  title: string;
  heading: string;
  effective: string;
  source: string;
  milestones: typeof ACTION.milestones;
  rows: AlertExampleRow[];
  // Imports whose duty went down, from another real action (RELIEF)
  relief: AlertExampleRow[];
  // The catalog's average total duty, before and after
  averageBeforePct: number;
  averageAfterPct: number;
}

const pct = (amount: number) => Math.round((amount / MICRO_CUSTOMS_VALUE) * 1000) / 10;

// One import's total duty the day before an action and the day it took effect
const rowFor = (
  item: { name: string; code: string; country: string },
  effective: string,
  elements: Awaited<ReturnType<typeof getHtsElementsServer>>
): AlertExampleRow | null => {
  const element = getHtsElementByCode(item.code.slice(0, 10), elements);
  if (!element) return null;
  const rate = findRateElement(element, getHtsElementParentsServer(element, elements));
  const input = microInput({
    htsCode: element.htsno,
    baseRates: { general: rate.general, special: rate.special, other: rate.other },
    country: item.country,
    asOf: effective,
  });
  const segments = calculateHistory(AllRules, input, addDays(effective, -1), addDays(effective, 1));
  const before = segments[0];
  const after = segments[segments.length - 1];
  if (!before || !after) return null;
  return {
    name: item.name,
    htsno: item.code,
    country: COUNTRY_NAMES[item.country],
    beforePct: pct(before.result.totalDuty),
    afterPct: pct(after.result.totalDuty),
  };
};

const build = async (): Promise<AlertExample | null> => {
  const elements = await getHtsElementsServer();
  const rows: AlertExampleRow[] = [];
  for (const item of CATALOG) {
    const row = rowFor(item, ACTION.effective, elements);
    if (!row) return null;
    rows.push(row);
  }
  // The example only works if the action really moved the Brazilian rows
  if (!rows.some((r) => r.afterPct > r.beforePct)) return null;
  // Only the relief rows that really went down
  const relief = RELIEF.items
    .map((item) => rowFor(item, RELIEF.effective, elements))
    .filter((r): r is AlertExampleRow => r !== null && r.afterPct < r.beforePct);
  const average = (key: "beforePct" | "afterPct") => Math.round((rows.reduce((sum, r) => sum + r[key], 0) / rows.length) * 10) / 10;
  return { ...ACTION, rows, relief, averageBeforePct: average("beforePct"), averageAfterPct: average("afterPct") };
};

// Cached for a day: the action is in the past, so the rates only change with the tariff data
export const getAlertExample = unstable_cache(build, ["tariff-alerts-example-v4"], { revalidate: 86400 });
