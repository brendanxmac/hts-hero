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

export const Sparkline = ({
  points,
  color,
  height = 32,
  step = false,
  to,
  label,
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
}) => {
  if (!points.length) return <div style={{ height }} aria-hidden />;
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const end = Math.max(to ?? sorted[sorted.length - 1].x, sorted[sorted.length - 1].x);
  // Run on to `to`, so one value that has held all along draws as a flat line
  const data = to !== undefined && end > sorted[sorted.length - 1].x ? [...sorted, { x: end, y: sorted[sorted.length - 1].y }] : sorted;
  if (data.length < 2) return <div style={{ height }} aria-hidden />;
  const ys = data.map((p) => p.y);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  // At least a tenth of the value tall, centred on the data
  const minSpan = Math.max(Math.abs(hi), Math.abs(lo), 1e-9) * 0.1;
  const pad = Math.max(0, (minSpan - (hi - lo)) / 2);

  return (
    <div aria-hidden={label ? undefined : true}>
      <ChartFrame height={height} margin={ZERO_MARGIN} label={label ?? "Trend"}>
        {({ innerWidth, innerHeight }) => {
          const x = linearScale([data[0].x, end], [0, innerWidth]);
          const y = linearScale([lo - pad, hi + pad], [innerHeight, 0]);
          const d = line<SparkPoint>()
            .x((p) => x(p.x))
            .y((p) => y(p.y))
            .curve(step ? curveStepAfter : curveLinear)(data);
          return <path d={d ?? ""} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
        }}
      </ChartFrame>
    </div>
  );
};
