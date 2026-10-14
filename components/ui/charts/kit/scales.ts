import { bisector } from "d3-array";
import { scaleBand, scaleLinear, scaleUtc } from "d3-scale";

// The maths behind every chart, on d3 (d3-scale, d3-array): values to pixels, readable ticks,
// calendar dates and categories. The kit's own small API wraps it, so charts never import d3
// directly and a scale stays a plain function of a number.

export interface Scale {
  (value: number): number;
  domain: [number, number];
  range: [number, number];
  // Round values across the domain, about `count` of them
  ticks: (count?: number) => number[];
  invert: (pixel: number) => number;
}

// Round values from min to max, about `count` of them (1, 2 or 5 times a power of ten)
export const niceTicks = (min: number, max: number, count = 4) => (max > min ? scaleLinear().domain([min, max]).ticks(count) : [min]);

// The domain's top raised to the next round tick, so the highest mark never touches the edge
export const niceMax = (max: number, count = 4) => (max > 0 ? scaleLinear().domain([0, max]).nice(count).domain()[1] : 1);

export const linearScale = (domain: [number, number], range: [number, number]): Scale => {
  const d3 = scaleLinear().domain(domain).range(range);
  const scale = ((value: number) => d3(value)) as Scale;
  scale.domain = domain;
  scale.range = range;
  scale.ticks = (count = 4) => d3.ticks(count);
  scale.invert = (pixel: number) => d3.invert(pixel);
  return scale;
};

// Calendar dates ("2026-04-09"), in UTC so a date never shifts with the viewer's time zone
export const time = (isoDate: string) => Date.parse(`${isoDate}T00:00:00Z`);

const isoOf = (date: Date) => date.toISOString().slice(0, 10);

export type TimeScale = Scale & {
  // The pixel for a calendar date
  at: (isoDate: string) => number;
  // Round dates across the range (month or year starts), for a date axis
  dateTicks: (count?: number) => string[];
};

export const timeScale = (from: string, to: string, range: [number, number]): TimeScale => {
  const start = time(from);
  const end = Math.max(time(to), start + 1);
  const d3 = scaleUtc().domain([new Date(start), new Date(end)]).range(range);
  const scale = ((value: number) => d3(new Date(value))) as TimeScale;
  scale.domain = [start, end];
  scale.range = range;
  scale.ticks = (count = 4) => d3.ticks(count).map((d) => d.getTime());
  scale.invert = (pixel: number) => d3.invert(pixel).getTime();
  scale.at = (isoDate: string) => d3(new Date(time(isoDate)));
  scale.dateTicks = (count = 4) => d3.ticks(count).map(isoOf);
  return scale;
};

// A band per category (bars), with the gap between them as a share of the band
export const bandScale = (categories: string[], range: [number, number], gap = 0.3) => {
  const d3 = scaleBand<string>().domain(categories).range(range).paddingInner(gap).paddingOuter(gap / 2);
  return {
    step: d3.step(),
    bandwidth: d3.bandwidth(),
    at: (category: string) => d3(category) ?? range[0],
  };
};

// The step in force at x: the last of the (sorted) step starts at or before it, else the first
const stepBisector = bisector((x: number) => x);
export const stepIndexAt = (starts: number[], x: number) => Math.max(0, stepBisector.right(starts, x) - 1);
