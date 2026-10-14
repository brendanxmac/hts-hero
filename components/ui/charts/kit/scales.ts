// The maths behind every chart: values to pixels, and readable ticks. No dependencies; the same
// shape as d3-scale's linear scale, so swapping it in later changes nothing at the call sites.

export interface Scale {
  (value: number): number;
  domain: [number, number];
  range: [number, number];
  // Round values across the domain, about `count` of them
  ticks: (count?: number) => number[];
  invert: (pixel: number) => number;
}

// 1, 2 or 5 times a power of ten: the steps people read easily
const niceStep = (span: number, count: number) => {
  const raw = span / Math.max(count, 1);
  const power = 10 ** Math.floor(Math.log10(raw || 1));
  const fraction = raw / power;
  return (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * power;
};

export const niceTicks = (min: number, max: number, count = 4) => {
  if (max <= min) return [min];
  const step = niceStep(max - min, count);
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
};

// The domain's top raised to the next round tick, so the highest mark never touches the edge
export const niceMax = (max: number, count = 4) => {
  if (max <= 0) return 1;
  const step = niceStep(max, count);
  return Math.ceil(max / step) * step;
};

export const linearScale = (domain: [number, number], range: [number, number]): Scale => {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const scale = ((v: number) => r0 + ((v - d0) / span) * (r1 - r0)) as Scale;
  scale.domain = domain;
  scale.range = range;
  scale.ticks = (count = 4) => niceTicks(d0, d1, count);
  scale.invert = (px: number) => d0 + ((px - r0) / (r1 - r0 || 1)) * span;
  return scale;
};

// Calendar dates ("2026-04-09") on a linear scale of their time
export const time = (isoDate: string) => Date.parse(`${isoDate}T00:00:00Z`);

export type TimeScale = Scale & { at: (isoDate: string) => number };

export const timeScale = (from: string, to: string, range: [number, number]): TimeScale => {
  // The scale itself stays callable: `at` is added to it, not spread into a copy
  const scale = linearScale([time(from), Math.max(time(to), time(from) + 1)], range) as TimeScale;
  scale.at = (isoDate: string) => scale(time(isoDate));
  return scale;
};

// A band per category (bars), with the gap between them as a share of the band
export const bandScale = (categories: string[], range: [number, number], gap = 0.3) => {
  const [r0, r1] = range;
  const step = (r1 - r0) / Math.max(categories.length, 1);
  return {
    step,
    bandwidth: step * (1 - gap),
    at: (category: string) => r0 + categories.indexOf(category) * step + (step * gap) / 2,
  };
};
