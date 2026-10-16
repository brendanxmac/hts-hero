import { HtsSection } from "../../../../interfaces/hts";
import { addDays } from "../../../../tariffs/engine-v2/history";
import { IsoDate } from "../../../../tariffs/engine-v2/types";
import { signedRate } from "../../impact/format";
import { formatRate } from "../../formatRate";
import { ProductHistory, segmentOn } from "../../insights/catalogHistory";
import { BASE_PART, RatePart, shortProgram, TrackedProduct } from "../../report";

// The Insights tab's numbers: the catalog cut by country, tariff program, HTS chapter and more,
// today, twelve months ago and over time. Plain data, so every insight shares one set of
// sums and the components only draw them.
//
// Every figure is a duty rate (a % of the customs value), never dollars: rates are true for every
// importer, while dollars depend on values most people haven't entered. The one exception is the
// share of duty, which weighs each import by its value ($10,000 until the user sets one).

// How big the catalog is: what's worth showing changes with it. A few imports are each worth a
// look; dozens are worth grouping; hundreds are worth ranking and concentrating.
export type CatalogScale = "few" | "some" | "many";

export const catalogScale = (count: number): CatalogScale => (count < 5 ? "few" : count < 50 ? "some" : "many");

export const SCALE_NOTES: Record<CatalogScale, string> = {
  few: "With a handful of imports, Insights explains each one: what its rate is made of and how it moved.",
  some: "With dozens of imports, Insights groups them: where your duty comes from and what moved it.",
  many: "With a large catalog, Insights ranks and concentrates: the few countries, chapters and imports that drive your duty.",
};

// What the sums need beyond the imports
export interface InsightsInput {
  products: TrackedProduct[];
  histories: Map<string, ProductHistory>;
  // Chapter names
  sections: HtsSection[];
  // Imports with alerts on
  trackedKeys: Set<string>;
  today: IsoDate;
}

// A rate and its parts on a date: from the import's history when it's been worked out, else today's
export const rateOn = (product: TrackedProduct, histories: Map<string, ProductHistory>, date: IsoDate) => {
  const history = histories.get(product.key);
  if (!history?.length) return { pct: product.totalPct, parts: product.parts };
  const s = segmentOn(history, date);
  return { pct: s.pct, parts: s.parts };
};

export const yearAgo = (today: IsoDate) => addDays(today, -365);

// Rates within a hundredth of a percent are the same rate
const same = (a: number, b: number) => Math.abs(a - b) < 0.005;

// ── Dimensions: what the catalog can be grouped by ──

// One group an import belongs to, and the part of its rate that belongs to the group: all of it,
// except for a tariff program, which counts only what that program adds
export interface Member {
  key: string;
  label: string;
  part: (parts: RatePart[], total: number) => number;
}

export type DimensionId = "all" | "country" | "program" | "chapter" | "band" | "alerts" | "movement";

export interface Dimension {
  id: DimensionId;
  label: string;
  // "by country"
  by: string;
  members: (product: TrackedProduct, input: InsightsInput) => Member[];
}

const whole = (_parts: RatePart[], total: number) => total;

export const chapterOf = (product: TrackedProduct) => String(Number(product.entry.element.chapter)).padStart(2, "0");

export const chapterName = (chapter: string, sections: HtsSection[]) =>
  sections.flatMap((s) => s.chapters).find((c) => c.number === Number(chapter))?.description;

// Bands of duty rate, lowest first
export const RATE_BANDS = [
  { key: "free", label: "Duty free", max: 0.005 },
  { key: "low", label: "Under 5%", max: 5 },
  { key: "mid", label: "5–15%", max: 15 },
  { key: "high", label: "15–30%", max: 30 },
  { key: "higher", label: "30–60%", max: 60 },
  { key: "highest", label: "60%+", max: Infinity },
];

export const bandOf = (pct: number) => RATE_BANDS.find((b) => pct < b.max) ?? RATE_BANDS[RATE_BANDS.length - 1];

// "Section 301 – China…" stays whole as a key; labels are short
const programLabel = (key: string) => (key === BASE_PART ? BASE_PART : shortProgram(key));

export const DIMENSIONS: Record<DimensionId, Dimension> = {
  all: {
    id: "all",
    label: "All imports",
    by: "",
    members: () => [{ key: "all", label: "All imports", part: whole }],
  },
  country: {
    id: "country",
    label: "Country of origin",
    by: "by Country",
    members: (p) => [{ key: p.entry.country.code, label: `${p.entry.country.flag} ${p.entry.country.name}`, part: whole }],
  },
  program: {
    id: "program",
    label: "Tariff",
    by: "by Tariff",
    // Every tariff on it today, or a year ago (one that stopped applying shows how far it fell)
    members: (p, input) => {
      const keys = new Set([...p.parts, ...rateOn(p, input.histories, yearAgo(input.today)).parts].map((part) => part.key));
      return Array.from(keys, (key) => ({
        key,
        label: programLabel(key),
        part: (parts: RatePart[]) => parts.filter((x) => x.key === key).reduce((sum, x) => sum + x.pct, 0),
      }));
    },
  },
  chapter: {
    id: "chapter",
    label: "HTS chapter",
    by: "by HTS Chapter",
    members: (p) => [{ key: chapterOf(p), label: `Ch. ${chapterOf(p)}`, part: whole }],
  },
  band: {
    id: "band",
    label: "Rate band",
    by: "by Rate Band",
    members: (p, input) => {
      const band = bandOf(rateOn(p, input.histories, input.today).pct);
      return [{ key: band.key, label: band.label, part: whole }];
    },
  },
  alerts: {
    id: "alerts",
    label: "Alerts on or off",
    by: "by Alerts",
    members: (p, input) =>
      input.trackedKeys.has(p.key) ? [{ key: "on", label: "Alerts On", part: whole }] : [{ key: "off", label: "Alerts Off", part: whole }],
  },
  movement: {
    id: "movement",
    label: "Change in 12 months",
    by: "by 12-Month Change",
    members: (p, input) => {
      const now = rateOn(p, input.histories, input.today).pct;
      const then = rateOn(p, input.histories, yearAgo(input.today)).pct;
      if (same(now, then)) return [{ key: "same", label: "No change", part: whole }];
      return now > then ? [{ key: "up", label: "Went up", part: whole }] : [{ key: "down", label: "Went down", part: whole }];
    },
  },
};

// ── Breakdowns: one row per group ──

export interface GroupRow {
  key: string;
  label: string;
  // Imports in the group
  imports: number;
  // Of all imports (a program's groups overlap, so these can add up past 100%)
  importShare: number;
  // The average and highest rate the group carries today (for a program: what it adds)
  avgRate: number;
  maxRate: number;
  // The average change in that rate over the last 12 months
  change: number;
  // Its share of the catalog's duty, weighing each import by its value
  dutyShare: number;
  // How many of its imports moved up and down in 12 months
  up: number;
  down: number;
  members: { product: TrackedProduct; member: Member }[];
}

export const breakdown = (input: InsightsInput, dimensionId: DimensionId, products = input.products): GroupRow[] => {
  const dimension = DIMENSIONS[dimensionId];
  const past = yearAgo(input.today);
  const rows = new Map<string, GroupRow & { sum: number; changeSum: number; duty: number }>();
  let totalDuty = 0;
  products.forEach((product) => {
    const now = rateOn(product, input.histories, input.today);
    const then = rateOn(product, input.histories, past);
    totalDuty += (now.pct / 100) * product.customsValue;
    dimension.members(product, input).forEach((member) => {
      const valueNow = member.part(now.parts, now.pct);
      const valueThen = member.part(then.parts, then.pct);
      const row = rows.get(member.key) ?? {
        key: member.key,
        label: member.label,
        imports: 0,
        importShare: 0,
        avgRate: 0,
        maxRate: 0,
        change: 0,
        dutyShare: 0,
        up: 0,
        down: 0,
        members: [],
        sum: 0,
        changeSum: 0,
        duty: 0,
      };
      row.imports += 1;
      row.sum += valueNow;
      row.maxRate = Math.max(row.maxRate, valueNow);
      row.changeSum += valueNow - valueThen;
      row.duty += (valueNow / 100) * product.customsValue;
      if (!same(valueNow, valueThen)) row[valueNow > valueThen ? "up" : "down"] += 1;
      row.members.push({ product, member });
      rows.set(member.key, row);
    });
  });
  // Two tariffs with one short name (two Section 301 actions) go by their full names
  const labels = Array.from(rows.values()).map((r) => r.label);
  return Array.from(rows.values()).map(({ sum, changeSum, duty, ...row }) => ({
    ...row,
    label: dimensionId === "program" && labels.filter((l) => l === row.label).length > 1 ? row.key : row.label,
    importShare: products.length ? row.imports / products.length : 0,
    avgRate: row.imports ? sum / row.imports : 0,
    change: row.imports ? changeSum / row.imports : 0,
    dutyShare: totalDuty > 0 ? duty / totalDuty : 0,
  }));
};

// ── Metrics: what a breakdown's bars measure ──

export type MetricId = "dutyShare" | "avgRate" | "maxRate" | "change" | "imports" | "importShare";

export interface Metric {
  id: MetricId;
  label: string;
  // "Average Rate" in a chart's title
  title: string;
  value: (row: GroupRow) => number;
  format: (value: number) => string;
  // Goes below zero (a change)
  signed?: boolean;
  // A share of a whole: a donut makes sense
  share?: boolean;
  // Works over time
  overTime?: boolean;
}

const percent = (share: number) => `${Math.round(share * 1000) / 10}%`;

export const METRICS: Record<MetricId, Metric> = {
  dutyShare: { id: "dutyShare", label: "Share of your duty", title: "Share of Your Duty", value: (r) => r.dutyShare, format: percent, share: true },
  avgRate: { id: "avgRate", label: "Average rate", title: "Average Rate", value: (r) => r.avgRate, format: formatRate, overTime: true },
  maxRate: { id: "maxRate", label: "Highest rate", title: "Highest Rate", value: (r) => r.maxRate, format: formatRate, overTime: true },
  change: { id: "change", label: "Average change, last 12 months", title: "12-Month Rate Change", value: (r) => r.change, format: signedRate, signed: true },
  imports: { id: "imports", label: "Number of imports", title: "Imports", value: (r) => r.imports, format: (v) => Math.round(v).toLocaleString("en-US"), overTime: true },
  importShare: { id: "importShare", label: "Share of imports", title: "Share of Imports", value: (r) => r.importShare, format: percent, share: true },
};

// The rows sorted for a metric: rate bands keep their order, everything else biggest first
export const sortRows = (rows: GroupRow[], metric: Metric, dimensionId: DimensionId) =>
  dimensionId === "band"
    ? [...rows].sort((a, b) => RATE_BANDS.findIndex((x) => x.key === a.key) - RATE_BANDS.findIndex((x) => x.key === b.key))
    : [...rows].sort((a, b) => (metric.signed ? Math.abs(metric.value(b)) - Math.abs(metric.value(a)) : metric.value(b) - metric.value(a)) || a.label.localeCompare(b.label));

// ── Over time ──

export interface Series {
  key: string;
  label: string;
  points: { date: IsoDate; value: number }[];
}

// The dates any of these imports' rates changed in the window, with its first day
const changeDates = (products: TrackedProduct[], histories: Map<string, ProductHistory>, from: IsoDate, to: IsoDate) => {
  const dates = new Set<IsoDate>([from]);
  products.forEach((p) => (histories.get(p.key) ?? []).forEach((s) => s.from > from && s.from <= to && dates.add(s.from)));
  return Array.from(dates).sort();
};

// A metric for each group, on every date a rate changed in the window: its average or highest
// rate, or how many imports carry it (a tariff starting or stopping changes that). Groups are
// the ones the imports belong to today.
export const trendSeries = (
  input: InsightsInput,
  dimensionId: DimensionId,
  metricId: MetricId,
  from: IsoDate,
  groups: GroupRow[]
): Series[] => {
  const dates = changeDates(input.products, input.histories, from, input.today);
  return groups.map((group) => ({
    key: group.key,
    label: group.label,
    points: dates.map((date) => {
      const values = group.members.map(({ product, member }) => {
        const r = rateOn(product, input.histories, date);
        return member.part(r.parts, r.pct);
      });
      const value =
        metricId === "maxRate"
          ? Math.max(0, ...values)
          : metricId === "imports"
            ? dimensionId === "program"
              ? values.filter((v) => v > 0.005).length
              : values.length
            : values.reduce((sum, v) => sum + v, 0) / (values.length || 1);
      return { date, value };
    }),
  }));
};

// Each import's own rate over the window, for comparing imports side by side
export const importSeries = (input: InsightsInput, products: TrackedProduct[], from: IsoDate): Series[] => {
  const dates = changeDates(products, input.histories, from, input.today);
  return products.map((p) => ({
    key: p.key,
    label: `${p.entry.element.htsno} · ${p.entry.country.name}`,
    points: dates.map((date) => ({ date, value: rateOn(p, input.histories, date).pct })),
  }));
};

// ── Built-in insights ──

// One import's rate today and a year ago
export interface ImportMove {
  product: TrackedProduct;
  now: number;
  then: number;
  change: number;
  parts: RatePart[];
}

export const importMoves = (input: InsightsInput): ImportMove[] => {
  const past = yearAgo(input.today);
  return input.products.map((product) => {
    const now = rateOn(product, input.histories, input.today);
    const then = rateOn(product, input.histories, past).pct;
    return { product, now: now.pct, then, change: now.pct - then, parts: now.parts };
  });
};

// The catalog's average rate now and a year ago
export const averageMove = (moves: ImportMove[]) => {
  const n = moves.length || 1;
  const now = moves.reduce((s, m) => s + m.now, 0) / n;
  const then = moves.reduce((s, m) => s + m.then, 0) / n;
  return { now, then, change: now - then };
};

// How concentrated the catalog is by country: the top one's share, and how many countries
// make up 80% of the imports
export const concentration = (rows: GroupRow[]) => {
  const sorted = [...rows].sort((a, b) => b.imports - a.imports);
  let sum = 0;
  let count = 0;
  for (const row of sorted) {
    sum += row.importShare;
    count += 1;
    if (sum >= 0.8 - 1e-9) break;
  }
  return { top: sorted[0] ?? null, forEighty: count, countries: sorted.length };
};

// How much of the duty the top tenth of imports carry (at least one import)
export const topTenthShare = (input: InsightsInput) => {
  const duties = input.products.map((p) => (rateOn(p, input.histories, input.today).pct / 100) * p.customsValue).sort((a, b) => b - a);
  const total = duties.reduce((s, d) => s + d, 0);
  const count = Math.max(1, Math.round(duties.length / 10));
  return { count, share: total > 0 ? duties.slice(0, count).reduce((s, d) => s + d, 0) / total : 0 };
};

// Imports still on the default value, which the share of duty assumes
export const estimatedValues = (products: TrackedProduct[]) => products.filter((p) => p.adjustments.customsValue === undefined).length;

// The tariffs behind the last 12 months' changes: how many imports each moved, and by how much
// on average, biggest first
export const changeCauses = (input: InsightsInput) =>
  breakdown(input, "program")
    .filter((r) => r.up + r.down > 0)
    .map((r) => ({ key: r.key, label: r.label, moved: r.up + r.down, up: r.up, down: r.down, change: r.change * (r.imports / (r.up + r.down)) }))
    .sort((a, b) => b.moved - a.moved || Math.abs(b.change) - Math.abs(a.change));

// A short, plain sentence on what a breakdown shows, so every chart teaches something
export const takeaway = (rows: GroupRow[], metric: Metric, dimensionId: DimensionId): string | null => {
  if (!rows.length) return null;
  const sorted = sortRows(rows, metric, "country");
  const top = sorted[0];
  const v = metric.value(top);
  if (dimensionId === "band") {
    const biggest = [...rows].sort((a, b) => b.imports - a.imports)[0];
    return `Most of your imports (${biggest.imports.toLocaleString("en-US")}) sit in the ${biggest.label.toLowerCase()} band.`;
  }
  if (rows.length === 1) return `${top.label}: ${metric.format(v)}.`;
  const second = sorted[1];
  switch (metric.id) {
    case "dutyShare":
      return `${top.label} accounts for ${metric.format(v)} of your duty${second ? `, then ${second.label} at ${metric.format(metric.value(second))}` : ""}.`;
    case "avgRate":
    case "maxRate": {
      const low = sorted[sorted.length - 1];
      return `${top.label} has the ${metric.id === "avgRate" ? "highest average" : "highest"} rate, ${metric.format(v)}; ${low.label} the lowest, ${metric.format(metric.value(low))}.`;
    }
    case "change":
      if (Math.abs(v) < 0.005) return "No rate in these groups moved in the last 12 months.";
      return `${top.label} moved the most in 12 months: ${metric.format(v)} on average.`;
    case "imports":
    case "importShare":
      return `${top.label} has the most imports: ${top.imports.toLocaleString("en-US")} (${percent(top.importShare)}).`;
  }
};
