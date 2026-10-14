"use client";

import { ReactNode, useState } from "react";
import { useChart } from "./ChartFrame";

// The hover layer every chart gets (dataviz: "ship a crosshair and tooltip by default"): a hit
// area over the plot that finds the nearest point to the pointer, a crosshair at it, and a
// tooltip in HTML that stays inside the chart.

// The index of the point nearest x, among points at xs
export const nearestIndex = (xs: number[], x: number) =>
  xs.reduce((best, value, i) => (Math.abs(value - x) < Math.abs(xs[best] - x) ? i : best), 0);

// Which point is under the pointer: set from the plot (where the scales are), cleared on leave
export const useHovered = () => {
  const [index, setIndex] = useState<number | null>(null);
  return { index, set: setIndex, clear: () => setIndex(null) };
};

// Transparent, over the whole plot: reports the pointer's x (mouse, pen or touch), in plot
// coordinates
export const HitArea = ({ onMove }: { onMove: (x: number) => void }) => {
  const { innerWidth, innerHeight } = useChart();
  return (
    <rect
      width={innerWidth}
      height={innerHeight}
      fill="transparent"
      style={{ touchAction: "pan-y" }}
      onPointerMove={(e) => {
        const box = (e.currentTarget as SVGRectElement).getBoundingClientRect();
        onMove(e.clientX - box.left);
      }}
      onPointerDown={(e) => {
        const box = (e.currentTarget as SVGRectElement).getBoundingClientRect();
        onMove(e.clientX - box.left);
      }}
    />
  );
};

export const Crosshair = ({ x }: { x: number }) => {
  const { innerHeight } = useChart();
  return <line x1={x} x2={x} y1={0} y2={innerHeight} stroke="oklch(var(--bc) / 0.3)" strokeWidth={1} strokeDasharray="3 3" pointerEvents="none" />;
};

// The tooltip, beside the point (left of it past the middle), in plot coordinates
export const Tooltip = ({ x, y, children }: { x: number; y: number; children: ReactNode }) => {
  const { margin, innerWidth } = useChart();
  const flip = x > innerWidth / 2;
  return (
    <div
      className="pointer-events-none absolute z-10 min-w-36 rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-xs shadow-lg"
      // Runtime position (DESIGN_SYSTEM §10)
      style={{
        left: margin.left + x + (flip ? -12 : 12),
        top: margin.top + y,
        transform: `translate(${flip ? "-100%" : "0"}, -50%)`,
      }}
    >
      {children}
    </div>
  );
};

// One line of a tooltip: the series' color, its name, its value
export const TooltipRow = ({ color, label, value }: { color?: string; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 py-0.5">
    <span className="inline-flex items-center gap-1.5 text-base-content/70">
      {color && <span className="h-2 w-2 rounded-sm" style={{ background: color }} aria-hidden />}
      {label}
    </span>
    <span className="font-semibold tabular-nums text-base-content">{value}</span>
  </div>
);
