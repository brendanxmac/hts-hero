"use client";

import { area, curveStepAfter, line } from "d3-shape";
import { MUTED_MARK } from "@/components/ui/theme";
import { useChart } from "./ChartFrame";

// The marks charts are made of, to the design system's specs (DESIGN_SYSTEM §10, dataviz): 2px
// lines, bars with 4px-rounded data ends on the baseline and a 2px gap between neighbours, dots of
// at least 8px with a ring of the surface around them where they overlap other marks.

// Steps on d3-shape (curveStepAfter): each point holds until the next, and the last one runs on
// to `to`
const stepped = (points: { x: number; y: number }[], to: number) => [...points, { x: to, y: points[points.length - 1].y }];

// A rate that holds until it changes: a step from each point to the next, and on to `to`
export const StepLine = ({
  points,
  x,
  y,
  to,
  color,
  dashed = false,
}: {
  points: { x: number; y: number }[];
  x: (value: number) => number;
  y: (value: number) => number;
  // Where the last step ends, in x's units
  to: number;
  color: string;
  dashed?: boolean;
}) => {
  if (!points.length) return null;
  const d = line<{ x: number; y: number }>()
    .x((p) => x(p.x))
    .y((p) => y(p.y))
    .curve(curveStepAfter)(stepped(points, to));
  return <path d={d ?? ""} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeDasharray={dashed ? "4 4" : undefined} />;
};

// The range between a low and a high that each hold until they change (the lowest and highest
// rate of every other origin, behind the ones being compared), as one quiet step band
export const StepBand = ({
  points,
  x,
  y,
  to,
  fill = MUTED_MARK,
}: {
  points: { x: number; low: number; high: number }[];
  x: (value: number) => number;
  y: (value: number) => number;
  to: number;
  fill?: string;
}) => {
  if (!points.length) return null;
  const last = points[points.length - 1];
  const d = area<{ x: number; low: number; high: number }>()
    .x((p) => x(p.x))
    .y0((p) => y(p.low))
    .y1((p) => y(p.high))
    .curve(curveStepAfter)([...points, { ...last, x: to }]);
  return <path d={d ?? ""} fill={fill} />;
};

// The area under a step line, down to the baseline (y0): a soft fill under the rate. Pass a
// gradient's url as the fill for the one fade the design allows (DESIGN_SYSTEM §15)
export const StepArea = ({
  points,
  x,
  y,
  to,
  y0,
  fill,
}: {
  points: { x: number; y: number }[];
  x: (value: number) => number;
  y: (value: number) => number;
  to: number;
  // The baseline, in pixels
  y0: number;
  fill: string;
}) => {
  if (!points.length) return null;
  const d = area<{ x: number; y: number }>()
    .x((p) => x(p.x))
    .y0(y0)
    .y1((p) => y(p.y))
    .curve(curveStepAfter)(stepped(points, to));
  return <path d={d ?? ""} fill={fill} />;
};

// A vertical bar from the baseline, its top end rounded
export const Bar = ({ x, width, y, value, color, opacity = 1 }: { x: number; width: number; y: (value: number) => number; value: number; color: string; opacity?: number }) => {
  const top = y(Math.max(value, 0));
  const base = y(0);
  const h = Math.max(0, base - top);
  const r = Math.min(4, width / 2, h);
  // Rounded at the top only: the data end, never the baseline
  const d = `M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + width - r} Q${x + width},${top} ${x + width},${top + r} V${base} Z`;
  return <path d={d} fill={color} opacity={opacity} />;
};

// Bars side by side for each category, one per series, 2px apart
export const GroupedBars = ({
  categories,
  series,
  y,
  hovered,
}: {
  categories: string[];
  series: { key: string; color: string; values: Record<string, number> }[];
  y: (value: number) => number;
  // A category to bring forward; the others fade
  hovered?: string | null;
}) => {
  const { innerWidth } = useChart();
  const step = innerWidth / Math.max(categories.length, 1);
  const group = Math.min(step * 0.7, series.length * 22);
  const bar = Math.max(2, (group - (series.length - 1) * 2) / series.length);
  return (
    <g>
      {categories.map((c, i) => {
        const left = step * i + (step - group) / 2;
        return (
          <g key={c}>
            {series.map((s, j) => (
              <Bar key={s.key} x={left + j * (bar + 2)} width={bar} y={y} value={s.values[c] ?? 0} color={s.color} opacity={hovered && hovered !== c ? 0.4 : 1} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

// A point: at least 8px across, ringed in the surface so it reads over lines
export const Dot = ({ cx, cy, color, active = false, hollow = false }: { cx: number; cy: number; color: string; active?: boolean; hollow?: boolean }) => (
  <circle
    cx={cx}
    cy={cy}
    r={active ? 6 : 4.5}
    fill={hollow ? "oklch(var(--b1))" : color}
    stroke={hollow ? color : "oklch(var(--b1))"}
    strokeWidth={hollow ? 2.5 : 2}
  />
);

// The baseline, when the chart has no gridline at zero
export const Baseline = ({ y }: { y: number }) => {
  const { innerWidth } = useChart();
  return <line x1={0} x2={innerWidth} y1={y} y2={y} stroke={MUTED_MARK} strokeWidth={1} aria-hidden />;
};
