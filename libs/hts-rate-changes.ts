import { AllRules } from "../tariffs/engine-v2/data";
import { addDays, calculateHistory } from "../tariffs/engine-v2/history";
import { getVerifiedRevisions } from "../tariffs/engine-v2/revisions";
import { IsoDate } from "../tariffs/engine-v2/types";
import { MICRO_CUSTOMS_VALUE, microInput, type MicroInput } from "./hts-micro-estimate";

// How often the duty on a code from one country has changed, over the dates our rates are verified
// for, on the /hts/[code] page's standard shipment: the "last changed" sentence under its heading.
// Server only: the history recalculates the entry on every date a rule starts or stops.

export interface CodeRateChanges {
  since: IsoDate; // the first verified date
  changes: number;
  // The latest change: the day it took effect and the total duty (base plus tariffs, % of value)
  // either side of it
  last: { date: IsoDate; beforePct: number; afterPct: number } | null;
}

const pct = (amount: number) => Math.round((amount / MICRO_CUSTOMS_VALUE) * 10000) / 100;

export const codeRateChanges = (input: MicroInput): CodeRateChanges | null => {
  const verified = getVerifiedRevisions();
  if (!verified.length) return null;
  const since = verified[0].from;
  const segments = calculateHistory(AllRules, microInput(input), since, addDays(input.asOf, 1));
  // A base rate we can't calculate makes every total partial, and a per-unit one makes the total
  // depend on the quantity, so there's nothing to say
  if (!segments.length || segments.some((s) => s.result.baseNotCalculated || s.result.requiresQuantity)) return null;
  // Only changes that moved the total: one tariff replacing another at the same rate isn't one
  const moves = segments.slice(1).flatMap((s, i) => {
    const beforePct = pct(segments[i].result.totalDuty);
    const afterPct = pct(s.result.totalDuty);
    return beforePct === afterPct ? [] : [{ date: s.from, beforePct, afterPct }];
  });
  return { since, changes: moves.length, last: moves[moves.length - 1] ?? null };
};
