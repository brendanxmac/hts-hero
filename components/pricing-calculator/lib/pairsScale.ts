import { FREE_TRACKED_PAIRS, TRACKER_TIERS } from "./pricing";

// The Tariff Tracker slider gives the free plan and each tier an equal share of the track, so
// 1–30 pairs is as easy to set as 100–500. Each stop is [slider position 0–100, pairs].
const LAST_LISTED = TRACKER_TIERS[TRACKER_TIERS.length - 1].maxPairs;
export const PAIRS_SLIDER_MAX_PAIRS = 1000;

const LIMITS = [FREE_TRACKED_PAIRS, ...TRACKER_TIERS.map((tier) => tier.maxPairs)];

const STOPS: [number, number][] = [
  [0, 1],
  ...LIMITS.map((limit, i): [number, number] => [((i + 1) * 100) / (LIMITS.length + 1), limit]),
  [100, PAIRS_SLIDER_MAX_PAIRS],
];

export const pairsAt = (position: number) => {
  const i = Math.max(1, STOPS.findIndex(([p]) => p >= position));
  const [p0, n0] = STOPS[i - 1];
  const [p1, n1] = STOPS[i];
  const pairs = n0 + ((position - p0) / (p1 - p0)) * (n1 - n0);
  // Round to steps that feel natural at each scale
  const step = pairs > LAST_LISTED ? 50 : pairs > 100 ? 10 : pairs > 30 ? 5 : 1;
  return Math.max(1, Math.round(pairs / step) * step);
};

export const positionOf = (pairs: number) => {
  const clamped = Math.min(Math.max(pairs, 1), PAIRS_SLIDER_MAX_PAIRS);
  const i = Math.max(1, STOPS.findIndex(([, n]) => n >= clamped));
  const [p0, n0] = STOPS[i - 1];
  const [p1, n1] = STOPS[i];
  return p0 + ((clamped - n0) / (n1 - n0)) * (p1 - p0);
};
