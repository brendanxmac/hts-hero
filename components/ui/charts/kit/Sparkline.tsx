"use client";

import { curveLinear, curveStepAfter, line } from "d3-shape";
import { ChartFrame } from "./ChartFrame";
import { linearScale } from "./scales";

// A small trend line without axes, for a tile. Points sit where they are along x (dates as
// numbers, not evenly by index), a rate that holds until it changes draws as steps, and the y
// range never shrinks below a tenth of the value, so a tiny wobble doesn't look like a cliff.

export interface SparkPoint {
  x: number;
  y: number;
}

const ZERO_MARGIN = { top: 3, right: 3, bottom: 3, left: 3 };

// A series run on to `end`, so a value that has held since its last point reaches today
const runTo = (points: SparkPoint[], end: number | undefined) => {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const last = sorted[sorted.length - 1];
  return last && end !== undefined && end > last.x ? [...sorted, { x: end, y: last.y }] : sorted;
};

export const Sparkline = ({
  points,
  color,
  height = 32,
  step = false,
  to,
  label,
  also,
}: {
  points: SparkPoint[];
  color: string;
  height?: number;
  // Draw as steps (a rate that holds until it changes)
  step?: boolean;
  // Where the line ends along x (today), when it runs past the last point
  to?: number;
  // For screen readers; the tile around it usually says it already
  label?: string;
  // A second line on the same scale (Imports: the countries beside the imports)
  also?: { points: SparkPoint[]; color: string };
}) => {
  if (!points.length) return <div style={{ height }} aria-hidden />;
  const lastX = Math.max(...points.map((p) => p.x), ...(also?.points ?? []).map((p) => p.x));
  const end = Math.max(to ?? lastX, lastX);
  // Run on to the end, so one value that has held all along draws as a flat line
  const lines = [{ data: runTo(points, to !== undefined ? end : undefined), color }, ...(also?.points.length ? [{ data: runTo(also.points, end), color: also.color }] : [])];
  if (lines[0].data.length < 2) return <div style={{ height }} aria-hidden />;
  const ys = lines.flatMap((l) => l.data.map((p) => p.y));
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  // At least a tenth of the value tall, centred on the data
  const minSpan = Math.max(Math.abs(hi), Math.abs(lo), 1e-9) * 0.1;
  const pad = Math.max(0, (minSpan - (hi - lo)) / 2);
  const startX = Math.min(...lines.map((l) => l.data[0].x));

  return (
    <div aria-hidden={label ? undefined : true}>
      <ChartFrame height={height} margin={ZERO_MARGIN} label={label ?? "Trend"}>
        {({ innerWidth, innerHeight }) => {
          const x = linearScale([startX, end], [0, innerWidth]);
          const y = linearScale([lo - pad, hi + pad], [innerHeight, 0]);
          const path = line<SparkPoint>()
            .x((p) => x(p.x))
            .y((p) => y(p.y))
            .curve(step ? curveStepAfter : curveLinear);
          return (
            <>
              {lines.map((l, i) => (
                <path key={i} d={path(l.data) ?? ""} fill="none" stroke={l.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              ))}
            </>
          );
        }}
      </ChartFrame>
    </div>
  );
};
