"use client";

import { useMemo, useState } from "react";
import { ChartFrame, linearScale, niceTicks, Tooltip, TooltipRow } from "@/components/ui/charts/kit";
import { Module } from "@/components/ui/Module";
import { MUTED_MARK, PRIMARY_MARK } from "@/components/ui/theme";
import * as tt from "@/components/ui/styles/tracker";
import { rate, share, usd, usdThousands } from "./bits";
import { ChartDialog, DataTable, ExpandButton } from "./ChartDialog";
import { SourcingRow } from "./model";

// Every realistic option on two axes: what it costs to land (duty plus freight) across, and how
// much of it the country exports to the world up (a log scale: exports run from thousands to
// billions). Bubbles are sized by what the US already buys from it. Cheap and proven sits top
// left, shaded as the sweet spot (left of the typical landed cost, above the typical exporter).

const HEIGHT = 380;
const MARGIN = { top: 16, right: 20, bottom: 40, left: 64 };
const LABELS = 12;

// Round ends a little past the values: ticks' step, from the tick at or below the lowest (never
// below zero) to the one at or above the highest
const fitRange = (lo: number, hi: number): [number, number] => {
  const pad = Math.max(hi - lo, 0.5) * 0.08;
  const ticks = niceTicks(Math.max(0, lo - pad), hi + pad, 6);
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
  return [Math.max(0, Math.floor((lo - pad) / step) * step), Math.ceil((hi + pad) / step) * step];
};

// Ticks on a log scale (log10 of thousands of USD): 1, 2 and 5 of each power of ten in range, or
// only the powers of ten when that would crowd the axis
const logTicks = (lo: number, hi: number) => {
  const all: number[] = [];
  for (let n = Math.floor(lo); n <= Math.ceil(hi); n++) [1, 2, 5].forEach((m) => all.push(n + Math.log10(m)));
  const inRange = all.filter((t) => t >= lo && t <= hi);
  return inRange.length > 7 ? inRange.filter((t) => Number.isInteger(Math.round(t * 1e9) / 1e9)) : inRange;
};

// The chart itself, at any height: in its module, and full size in its dialog
const Scatter = ({ points, height, selected, onSelect }: { points: SourcingRow[]; height: number; selected: string | null; onSelect: (code: string) => void }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const costs = points.map((p) => p.landedPct).sort((a, b) => a - b);
  // Both axes fit the countries shown, not zero: landed cost from just under the cheapest to just
  // over the dearest 95% (round ticks at each end), world exports from just under the smallest
  // exporter to just over the largest
  const xRange = fitRange(costs[0], costs[Math.floor(costs.length * 0.95)] ?? costs[costs.length - 1]);
  const [xLo, xMax] = xRange;
  const clipped = costs.some((c) => c > xMax);
  const logs = points.map((p) => Math.log10(p.world!.exports));
  const yPad = Math.max(0.15, (Math.max(...logs) - Math.min(...logs)) * 0.06);
  const yLo = Math.min(...logs) - yPad;
  const yHi = Math.max(...logs) + yPad;
  const medianCost = costs[Math.floor(costs.length / 2)];
  const medianLog = [...logs].sort((a, b) => a - b)[Math.floor(logs.length / 2)];
  const maxUs = Math.max(...points.map((p) => p.us?.value ?? 0), 1);
  const radius = (p: SourcingRow) => 4 + Math.sqrt((p.us?.value ?? 0) / maxUs) * 18;
  // Flags on the largest producers and the largest US suppliers
  const labelled = new Set([
    ...[...points].sort((a, b) => b.scores.capacity - a.scores.capacity).slice(0, LABELS),
    ...[...points].sort((a, b) => (b.us?.value ?? 0) - (a.us?.value ?? 0)).slice(0, 5),
  ].map((p) => p.country.code));
  const hover = points.find((p) => p.country.code === hovered);

  return (
    <>
      <ChartFrame
        height={height}
        margin={MARGIN}
        label="Each country's landed cost against its exports of the 6-digit group to all countries"
        onLeave={() => setHovered(null)}
        overlay={({ innerWidth, innerHeight }) => {
          if (!hover) return null;
          const x = linearScale(xRange, [0, innerWidth])(Math.min(hover.landedPct, xMax));
          const y = linearScale([yLo, yHi], [innerHeight, 0])(Math.log10(hover.world!.exports));
          return (
            <Tooltip x={x} y={y}>
              <div className="mb-1 font-semibold text-base-content">
                {hover.country.flag} {hover.country.name}
              </div>
              <TooltipRow label="Landed cost" value={rate(hover.landedPct)} />
              <TooltipRow label={`Exports of ${hover.world!.group}, all countries`} value={`${usdThousands(hover.world!.exports)} · ${share(hover.world!.share)}`} />
              <TooltipRow label="US imports of it, 12 mo" value={hover.us ? usd(hover.us.value) : "None"} />
            </Tooltip>
          );
        }}
      >
        {({ innerWidth, innerHeight }) => {
          const x = linearScale(xRange, [0, innerWidth]);
          const y = linearScale([yLo, yHi], [innerHeight, 0]);
          const xTicks = x.ticks(6);
          const yTicks = logTicks(yLo, yHi);
          // Decimals when the countries all land within a few percent of each other
          const digits = xMax - xLo < 5 ? 1 : 0;
          return (
            <>
              {/* The sweet spot: cheaper than typical, exports more than typical */}
              <rect x={0} y={0} width={Math.max(0, x(medianCost))} height={Math.max(0, y(medianLog))} rx={12} fill="color-mix(in oklab, var(--color-success) 9%, transparent)" />
              <text x={8} y={16} className="fill-success text-[11px] font-semibold">
                Cheaper and proven
              </text>
              {yTicks.map((t) => (
                <g key={t} transform={`translate(0,${y(t)})`}>
                  <line x1={0} x2={innerWidth} stroke="color-mix(in oklab, var(--color-base-content) 8%, transparent)" />
                  <text x={-10} dy="0.32em" textAnchor="end" className="fill-base-content/60 text-[11px] tabular-nums">
                    {usdThousands(10 ** t)}
                  </text>
                </g>
              ))}
              {xTicks.map((t) => (
                <text key={t} x={x(t)} y={innerHeight + 18} textAnchor="middle" className="fill-base-content/60 text-[11px] tabular-nums">
                  {t.toFixed(digits)}%
                </text>
              ))}
              <text x={innerWidth} y={innerHeight + 34} textAnchor="end" className="fill-base-content/60 text-[11px]">
                Landed cost of this product (duty + freight) →
              </text>
              <text transform={`translate(${-52},${0}) rotate(-90)`} textAnchor="end" className="fill-base-content/60 text-[11px]">
                Exports of the 6-digit group, all countries →
              </text>
              {[...points]
                .sort((a, b) => radius(b) - radius(a))
                .map((p) => {
                  const cx = x(Math.min(p.landedPct, xMax));
                  const cy = y(Math.log10(p.world!.exports));
                  const active = selected === p.country.code || hovered === p.country.code;
                  return (
                    <g key={p.country.code} className="cursor-pointer" onMouseEnter={() => setHovered(p.country.code)} onClick={() => onSelect(p.country.code)}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius(p)}
                        fill={active ? "color-mix(in oklab, var(--color-primary) 45%, transparent)" : "color-mix(in oklab, var(--color-primary) 18%, transparent)"}
                        stroke={active ? PRIMARY_MARK : MUTED_MARK}
                        strokeWidth={active ? 2 : 1}
                      />
                      {labelled.has(p.country.code) && (
                        <text x={cx} y={cy} dy="0.35em" textAnchor="middle" className="pointer-events-none text-[13px]">
                          {p.country.flag}
                        </text>
                      )}
                    </g>
                  );
                })}
            </>
          );
        }}
      </ChartFrame>
      <p className={`${tt.caption} mt-3`}>
        Both axes fit the countries shown, so they don&apos;t start at zero.{clipped ? ` Countries landing above ${xMax.toFixed(0)}% sit on the right edge.` : ""}
      </p>
    </>
  );
};

export const CostCapacityChart = ({ rows, selected, onSelect }: { rows: SourcingRow[]; selected: string | null; onSelect: (code: string) => void }) => {
  const points = useMemo(() => rows.filter((r) => r.candidate && r.world && r.world.exports > 0), [rows]);
  const [open, setOpen] = useState(false);
  if (points.length < 3) return null;
  const table: DataTable = {
    columns: ["Country", "Landed cost", "Duty", "Freight & insurance", "Exports of the 6-digit group, all countries", "US imports of this code, 12 mo"],
    rows: [...points]
      .sort((a, b) => a.landedPct - b.landedPct)
      .map((p) => [p.country.name, rate(p.landedPct), rate(p.dutyPct), p.byLand ? "by land" : `${rate(p.freightUsed)}${p.freightEstimated ? " (typical)" : ""}`, usdThousands(p.world!.exports), p.us ? usd(p.us.value) : "—"]),
  };
  return (
    <Module
      title="Cost vs. Capacity"
      subtitle="Left lands this code for less; higher exports more of its 6-digit group to all countries; bigger bubbles ship more of this code to the US today."
      actions={<ExpandButton onClick={() => setOpen(true)} />}
      padded
    >
      <Scatter points={points} height={HEIGHT} selected={selected} onSelect={onSelect} />
      <ChartDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Cost vs. Capacity"
        subtitle="Each country's landed cost of this product against its exports of it to the world."
        source="Landed cost: HTS Hero's tariff engine plus U.S. Census freight and insurance, last 12 months. Exports: Harvard Growth Lab, Atlas of Economic Complexity (2024). US imports: U.S. Census Bureau, last 12 months."
        chart={<Scatter points={points} height={520} selected={selected} onSelect={onSelect} />}
        table={table}
      />
    </Module>
  );
};
