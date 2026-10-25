import { Countries } from "@/constants/countries";
import type { SourcingRow } from "./model";
import type { AdcvdCase } from "./useSourcing";

// How much the US figures for a code can tell you (the Sourcing tab's coverage check), and the
// AD/CVD cases on it as events for its charts. Plain functions; DataCoverage draws them.

// Thin with this many US supplying countries or fewer
export const FEW_SUPPLIERS = 3;
// World exporters this high up (rank and share of world exports) are expected in US imports
const BIG_EXPORTER_RANK = 5;
const BIG_EXPORTER_SHARE = 0.03;
// A supplier counts as stopped when its last 12 months are under this share of its first 12
// shown, from at least this much
const STOPPED_SHARE = 0.25;
const STOPPED_FROM = 500_000;

// "2022-03-03" → "Mar 2022"
export const monthYear = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

// The AD/CVD cases on this product as events on a monthly chart: those that began inside it as
// markers ("Orders: China"), the ones from before it as words for its subtitle. Only a country's
// own cases when one is given.
export const caseEvents = (cases: AdcvdCase[], months: string[], country?: string) => {
  const own = cases.filter((c) => !country || c.country === country || c.third_countries?.includes(country));
  const byStart = new Map<string, Set<string>>();
  own.forEach((c) => {
    const start = c.order_on ?? c.initiated_on;
    if (!start) return;
    byStart.set(start.slice(0, 7), new Set([...(byStart.get(start.slice(0, 7)) ?? []), c.country]));
  });
  const markers: { index: number; label: string }[] = [];
  const earlier: string[] = [];
  byStart.forEach((countries, month) => {
    const names = Array.from(countries).map((c) => Countries.find((x) => x.code === c)?.name ?? c);
    const index = months.indexOf(month);
    if (index >= 0) markers.push({ index, label: `AD/CVD: ${names.join(", ")}` });
    else if (month < (months[0] ?? "")) earlier.push(`${names.join(", ")} since ${monthYear(`${month}-01`)}`);
  });
  return { markers, earlier };
};

export interface Coverage {
  thin: boolean;
  suppliers: number;
  // Big world exporters with no US imports of this code in the last 12 months
  missing: SourcingRow[];
  // Suppliers that fell away: [row, first 12 months shown, last 12]
  stopped: [SourcingRow, number, number][];
}

export const coverageOf = (rows: SourcingRow[]): Coverage => {
  const suppliers = rows.filter((r) => (r.us?.value ?? 0) > 0).length;
  const missing = rows
    .filter((r) => r.world && r.world.rank <= BIG_EXPORTER_RANK && r.world.share >= BIG_EXPORTER_SHARE && !((r.us?.value ?? 0) > 0))
    .sort((a, b) => a.world!.rank - b.world!.rank);
  const stopped = rows
    .map((r): [SourcingRow, number, number] => [r, r.us ? r.us.monthly.slice(0, 12).reduce((a, b) => a + b, 0) : 0, r.us?.value ?? 0])
    .filter(([, first, last]) => first >= STOPPED_FROM && last < first * STOPPED_SHARE)
    .sort((a, b) => b[1] - a[1]);
  return { thin: suppliers <= FEW_SUPPLIERS || missing.length > 0 || stopped.length > 0, suppliers, missing, stopped };
};


// ── Confidence ──
// How much to lean on the US figures for this code: thin with 3 countries or fewer, under $1M a
// year, or shipments in fewer than 6 of the last 12 months; limited with 8 countries or fewer or
// under $10M; good otherwise. Said beside every US figure that rests on it.

export type Confidence = "good" | "limited" | "thin";

const THIN_COUNTRIES = 3;
const THIN_VALUE = 1_000_000;
const THIN_MONTHS = 6;
const LIMITED_COUNTRIES = 8;
const LIMITED_VALUE = 10_000_000;

export interface UsConfidence {
  level: Confidence;
  // Countries that shipped it in the last 12 months
  countries: number;
  value: number;
  // Months of the last 12 with any shipments
  months: number;
}

export const usConfidence = (trade: { total: { last: { value: number }; monthly: number[] }; countries: Record<string, { last: { value: number } }> } | null): UsConfidence => {
  if (!trade) return { level: "thin", countries: 0, value: 0, months: 0 };
  const countries = Object.values(trade.countries).filter((c) => c.last.value > 0).length;
  const value = trade.total.last.value;
  const months = trade.total.monthly.slice(-12).filter((v) => v > 0).length;
  const level: Confidence =
    countries <= THIN_COUNTRIES || value < THIN_VALUE || months < THIN_MONTHS ? "thin" : countries <= LIMITED_COUNTRIES || value < LIMITED_VALUE ? "limited" : "good";
  return { level, countries, value, months };
};

// The first 12 of the months shown against the last 12: [first, last], for a long fall or rise
export const longRun = (monthly: number[]): [number, number] => [monthly.slice(0, 12).reduce((a, b) => a + b, 0), monthly.slice(-12).reduce((a, b) => a + b, 0)];
