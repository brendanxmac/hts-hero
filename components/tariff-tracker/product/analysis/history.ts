import { AllRules } from "../../../../tariffs/engine-v2/data";
import { addDays, calculateHistory, LineChange } from "../../../../tariffs/engine-v2/history";
import { getVerifiedRevisions } from "../../../../tariffs/engine-v2/revisions";
import { CalculationInput, IsoDate } from "../../../../tariffs/engine-v2/types";
import { todayIso } from "../../../duty-calculator/lib/format";
import { RatePart, rateParts, TrackedProduct } from "../../report";
import { OriginRate, RateBasis, rateKey } from "./analysis";

// How each origin's rate on a product has moved over the verified tariff data: for the
// time-lapse (the rates on any date) and for stability (how much a rate has swung). Same window
// as the calculator's Duty Over Time: the first verified revision to today.

export interface RateSegment {
  from: IsoDate;
  // Exclusive
  to: IsoDate;
  pct: number;
  parts: RatePart[];
  // What changed from the segment before; empty for the first
  changes: LineChange[];
}

export interface OriginHistory {
  code: string;
  standard: RateSegment[];
  // With the trade agreement the origin can claim today, when it has one
  agreement?: RateSegment[];
}

export const historyRange = () => {
  const verified = getVerifiedRevisions();
  const last = verified[verified.length - 1];
  return { from: verified[0].from, to: last.to ?? addDays(todayIso(), 1) };
};

export const originHistory = (
  product: TrackedProduct,
  origin: OriginRate,
  range: { from: IsoDate; to: IsoDate }
): OriginHistory => {
  const input: CalculationInput = {
    ...product.input,
    country: origin.country.code,
    claimedPreference: undefined,
    answers: product.adjustments.answers ?? {},
  };
  const segments = (claimedPreference?: string) =>
    calculateHistory(AllRules, { ...input, claimedPreference }, range.from, range.to).map((s) => ({
      from: s.from,
      to: s.to,
      pct: (s.result.totalDuty / product.customsValue) * 100,
      parts: rateParts(s.result, product.customsValue),
      changes: s.changes,
    }));
  return {
    code: origin.country.code,
    standard: segments(),
    agreement: origin.agreement ? segments(origin.agreement.symbol) : undefined,
  };
};

const segmentsOf = (h: OriginHistory, basis: RateBasis) =>
  basis === "agreements" && h.agreement ? h.agreement : h.standard;

// The rate on a date: the segment covering it, or the nearest one
export const rateAt = (h: OriginHistory, date: IsoDate, basis: RateBasis) => {
  const segments = segmentsOf(h, basis);
  return segments.find((s) => s.from <= date && date < s.to) ?? (date < segments[0].from ? segments[0] : segments[segments.length - 1]);
};

export interface Volatility {
  // Times the rate changed in the window
  changes: number;
  // Highest minus lowest, in points
  swing: number;
  min: number;
  max: number;
}

export const volatility = (h: OriginHistory, basis: RateBasis): Volatility => {
  const segments = segmentsOf(h, basis);
  const pcts = segments.map((s) => s.pct);
  const min = Math.min(...pcts);
  const max = Math.max(...pcts);
  return { changes: segments.filter((s) => s.changes.length > 0).length, swing: max - min, min, max };
};

// ── The time-lapse's timeline ──

export interface ChangeSummary {
  code: string;
  name: string;
  kind: LineChange["kind"];
  // Origins it changed for
  countries: number;
}

export interface ChangeEvent {
  date: IsoDate;
  // Biggest first: the changes that hit the most origins
  changes: ChangeSummary[];
  // Origins whose rate went up, and down
  up: number;
  down: number;
}

// Every date some origin's rate changed, with what changed and for how many origins
export const changeEvents = (histories: OriginHistory[], basis: RateBasis): ChangeEvent[] => {
  const byDate = new Map<IsoDate, { summaries: Map<string, ChangeSummary>; up: number; down: number }>();
  histories.forEach((h) => {
    const segments = segmentsOf(h, basis);
    segments.forEach((s, i) => {
      if (i === 0 || s.changes.length === 0) return;
      const event = byDate.get(s.from) ?? { summaries: new Map(), up: 0, down: 0 };
      const delta = rateKey(s.pct) - rateKey(segments[i - 1].pct);
      if (delta > 0) event.up++;
      if (delta < 0) event.down++;
      s.changes.forEach((c) => {
        const key = `${c.code}:${c.kind}`;
        const summary = event.summaries.get(key) ?? { code: c.code, name: c.name, kind: c.kind, countries: 0 };
        summary.countries++;
        event.summaries.set(key, summary);
      });
      byDate.set(s.from, event);
    });
  });
  return Array.from(byDate, ([date, e]) => ({
    date,
    changes: Array.from(e.summaries.values()).sort((a, b) => b.countries - a.countries),
    up: e.up,
    down: e.down,
  })).sort((a, b) => a.date.localeCompare(b.date));
};

// The origins as they were on a date, for the swarm: each one's rate and parts then
export const ratesOn = (rates: OriginRate[], histories: Map<string, OriginHistory>, date: IsoDate): OriginRate[] =>
  rates.map((o) => {
    const h = histories.get(o.country.code);
    if (!h) return o;
    const standard = rateAt(h, date, "standard");
    const claimed = h.agreement ? rateAt(h, date, "agreements") : undefined;
    return {
      ...o,
      pct: standard.pct,
      parts: standard.parts,
      agreement:
        o.agreement && claimed && claimed.pct < standard.pct - 0.005
          ? { ...o.agreement, pct: claimed.pct, parts: claimed.parts }
          : undefined,
    };
  });

export const daysBetween = (from: IsoDate, to: IsoDate) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
