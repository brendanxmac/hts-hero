import { AllRules } from "../../../tariffs/engine-v2/data";
import { calculateHistory, LineChange } from "../../../tariffs/engine-v2/history";
import { IsoDate } from "../../../tariffs/engine-v2/types";
import { RatePart, rateParts, TrackedProduct } from "../report";

// How the rate on each catalog product has moved over the verified tariff data, worked out for
// the product's own shipment, answers and claimed program. Plain data for Rate history, the
// Overview and the teasers.

export interface RateSegment {
  from: IsoDate;
  // Exclusive
  to: IsoDate;
  pct: number;
  usd: number;
  parts: RatePart[];
  // What changed from the segment before; empty for the first
  changes: LineChange[];
}

export type ProductHistory = RateSegment[];

export const productHistory = (product: TrackedProduct, range: { from: IsoDate; to: IsoDate }): ProductHistory =>
  calculateHistory(
    AllRules,
    { ...product.input, answers: product.adjustments.answers ?? {} },
    range.from,
    range.to
  ).map((s) => ({
    from: s.from,
    to: s.to,
    pct: (s.result.totalDuty / product.customsValue) * 100,
    usd: s.result.totalDuty,
    parts: rateParts(s.result, product.customsValue),
    changes: s.changes,
  }));

// The rate on a date: the segment covering it, or the nearest one
export const segmentOn = (history: ProductHistory, date: IsoDate) =>
  history.find((s) => s.from <= date && date < s.to) ??
  (date < history[0].from ? history[0] : history[history.length - 1]);

// One product's rate moving on one date
export interface CatalogChange {
  date: IsoDate;
  product: TrackedProduct;
  before: RateSegment;
  after: RateSegment;
  // In points; positive is an increase
  deltaPct: number;
  deltaUsd: number;
}

// Rates within a hundredth of a point are the same rate
const moved = (a: number, b: number) => Math.abs(a - b) >= 0.005;

// Every rate change on the given products, newest first
export const catalogChanges = (products: TrackedProduct[], histories: Map<string, ProductHistory>): CatalogChange[] =>
  products
    .flatMap((product) => {
      const history = histories.get(product.key) ?? [];
      return history.slice(1).flatMap((after, i): CatalogChange[] => {
        const before = history[i];
        return after.changes.length && moved(before.pct, after.pct)
          ? [{ date: after.from, product, before, after, deltaPct: after.pct - before.pct, deltaUsd: after.usd - before.usd }]
          : [];
      });
    })
    .sort((a, b) => b.date.localeCompare(a.date) || Math.abs(b.deltaPct) - Math.abs(a.deltaPct));

// The changes grouped by the day they took effect, newest first
export interface ChangeDay {
  date: IsoDate;
  changes: CatalogChange[];
  up: number;
  down: number;
  // The tariffs behind them, most products first
  causes: { name: string; products: number }[];
}

export const changeDays = (changes: CatalogChange[]): ChangeDay[] => {
  const byDate = new Map<IsoDate, CatalogChange[]>();
  changes.forEach((c) => byDate.set(c.date, [...(byDate.get(c.date) ?? []), c]));
  return Array.from(byDate, ([date, list]) => {
    const causes = new Map<string, number>();
    list.forEach((c) => new Set(c.after.changes.map((l) => l.name)).forEach((name) => causes.set(name, (causes.get(name) ?? 0) + 1)));
    return {
      date,
      changes: list,
      up: list.filter((c) => c.deltaPct > 0).length,
      down: list.filter((c) => c.deltaPct < 0).length,
      causes: Array.from(causes, ([name, products]) => ({ name, products })).sort((a, b) => b.products - a.products),
    };
  }).sort((a, b) => b.date.localeCompare(a.date));
};

// The catalog's average rate on every date any product's rate changed, oldest first
export const averageRateSeries = (products: TrackedProduct[], histories: Map<string, ProductHistory>) => {
  const withHistory = products.filter((p) => histories.get(p.key)?.length);
  if (!withHistory.length) return [];
  const dates = new Set<IsoDate>();
  withHistory.forEach((p) => histories.get(p.key)!.forEach((s) => dates.add(s.from)));
  return Array.from(dates)
    .sort()
    .map((date) => ({
      date,
      pct: withHistory.reduce((sum, p) => sum + segmentOn(histories.get(p.key)!, date).pct, 0) / withHistory.length,
    }));
};
