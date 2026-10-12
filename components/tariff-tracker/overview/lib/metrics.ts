import { Countries } from "../../../../constants/countries";
import { addDays } from "../../../../tariffs/engine-v2/history";
import { IsoDate } from "../../../../tariffs/engine-v2/types";
import { DEFAULT_VALUE } from "../../adjustments";
import { CatalogChange, ProductHistory, segmentOn } from "../../insights/catalogHistory";
import { bestSavings, Saving } from "../../insights/savings";
import { BASE_PART, shortProgram, TrackedProduct } from "../../report";

// The Overview's numbers, worked out from the catalog and its insights. Plain data: the
// components only draw it.

export const dutyPerShipment = (products: TrackedProduct[]) => products.reduce((sum, p) => sum + p.result.totalDuty, 0);

export const averageRate = (products: TrackedProduct[]) =>
  products.length ? products.reduce((sum, p) => sum + p.totalPct, 0) / products.length : 0;

export const countryCount = (products: TrackedProduct[]) => new Set(products.map((p) => p.entry.country.code)).size;

// Changes in the 365 days to today, and how many products they hit
export const changesLastYear = (changes: CatalogChange[], today: IsoDate) => {
  const since = addDays(today, -365);
  const recent = changes.filter((c) => c.date > since && c.date <= today);
  return { count: recent.length, products: new Set(recent.map((c) => c.product.key)).size, since };
};

// Changes per month over the last 12 months, oldest first: a sparkline's values
export const monthlyChanges = (changes: CatalogChange[], today: IsoDate) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() - (11 - i));
    return d.toISOString().slice(0, 7);
  });
  return months.map((m) => changes.filter((c) => c.date.startsWith(m)).length);
};

// The catalog's total duty per shipment on every date any product's duty changed, oldest first
export const dutySeries = (products: TrackedProduct[], histories: Map<string, ProductHistory>) => {
  const withHistory = products.filter((p) => histories.get(p.key)?.length);
  const dates = new Set<IsoDate>();
  withHistory.forEach((p) => histories.get(p.key)!.forEach((s) => dates.add(s.from)));
  return Array.from(dates)
    .sort()
    .map((date) => ({ date, usd: withHistory.reduce((sum, p) => sum + segmentOn(histories.get(p.key)!, date).usd, 0) }));
};

export interface OriginShare {
  code: string;
  name: string;
  flag: string;
  products: number;
  value: number;
  share: number;
}

// The catalog by country of origin, biggest first: the top five and the rest together.
// By value, products without a value of their own count at the default (an estimate).
export const originDistribution = (products: TrackedProduct[], byValue: boolean) => {
  const byCountry = new Map<string, { products: number; value: number }>();
  products.forEach((p) => {
    const row = byCountry.get(p.entry.country.code) ?? { products: 0, value: 0 };
    row.products += 1;
    row.value += p.customsValue;
    byCountry.set(p.entry.country.code, row);
  });
  const measure = (r: { products: number; value: number }) => (byValue ? r.value : r.products);
  const total = Array.from(byCountry.values()).reduce((sum, r) => sum + measure(r), 0) || 1;
  const rows = Array.from(byCountry, ([code, r]) => {
    const country = Countries.find((c) => c.code === code);
    return { code, name: country?.name ?? code, flag: country?.flag ?? "", ...r, share: measure(r) / total };
  }).sort((a, b) => b.share - a.share);
  const top: OriginShare[] = rows.slice(0, 5);
  const rest = rows.slice(5);
  if (rest.length) {
    top.push({
      code: "other",
      name: `${rest.length} more`,
      flag: "",
      products: rest.reduce((s, r) => s + r.products, 0),
      value: rest.reduce((s, r) => s + r.value, 0),
      share: rest.reduce((s, r) => s + r.share, 0),
    });
  }
  const estimated = products.filter((p) => p.adjustments.customsValue === undefined).length;
  return { rows: top, estimated, defaultValue: DEFAULT_VALUE };
};

// The highest-duty products, with what each tariff adds to them: the exposure map
export const exposure = (products: TrackedProduct[], count = 6) => {
  const top = [...products].sort((a, b) => b.totalPct - a.totalPct).slice(0, count);
  const columns: string[] = [];
  const label = (key: string) => (key === BASE_PART ? "Base" : shortProgram(key));
  top.forEach((p) => p.parts.forEach((part) => !columns.includes(label(part.key)) && columns.push(label(part.key))));
  const shown = columns.sort((a, b) => Number(b === "Base") - Number(a === "Base")).slice(0, 5);
  const rows = top.map((p) => ({
    product: p,
    cells: shown.map((col) => p.parts.filter((part) => label(part.key) === col).reduce((sum, part) => sum + part.pct, 0)),
  }));
  return { columns: shown, rows };
};

// The products to look at first: the biggest potential savings and the latest increases
export const productsToLookAt = (
  products: TrackedProduct[],
  savings: Map<string, Saving[]>,
  changes: CatalogChange[],
  count = 4
) => {
  const picks: { product: TrackedProduct; reason: "saving" | "increase"; saving?: Saving; change?: CatalogChange }[] = [];
  const has = (key: string) => picks.some((p) => p.product.key === key);
  const bySaving = products
    .map((p) => ({ product: p, saving: bestSavings(savings.get(p.key) ?? []).any }))
    .filter((x) => x.saving)
    .sort((a, b) => b.saving!.usd - a.saving!.usd);
  const increases = changes.filter((c) => c.deltaPct > 0);
  // Alternate: a saving, an increase, a saving, an increase
  for (let i = 0; picks.length < count && (i < bySaving.length || i < increases.length); i++) {
    const s = bySaving[i];
    if (s && !has(s.product.key)) picks.push({ product: s.product, reason: "saving", saving: s.saving });
    const c = increases[i];
    if (c && picks.length < count && !has(c.product.key)) picks.push({ product: c.product, reason: "increase", change: c });
  }
  return picks;
};
