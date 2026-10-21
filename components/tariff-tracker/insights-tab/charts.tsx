"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { NavArrow, NavArrowSpace } from "./shared";
import {
  Bar,
  bandScale,
  barWidth,
  Baseline,
  BottomAxis,
  ChartFrame,
  Crosshair,
  Dot,
  HitArea,
  Legend,
  linearScale,
  niceMax,
  StepLine,
  stepIndexAt,
  time,
  timeScale,
  Tooltip,
  TooltipRow,
  useHovered,
  ValueAxis,
} from "@/components/ui/charts/kit";
import { shortDate } from "../../duty-calculator/rate-history/format";
import { formatDate } from "../../duty-calculator/lib/format";
import { Series } from "./lib/data";

// The Insights tab's charts, on the shared chart kit: bars across (the default: long labels read
// best), columns, and step lines for rates over time (a rate holds
// until a tariff changes it, so never a smoothed curve). Colors come from the caller (the theme's
// series and program colors).

export interface Datum {
  key: string;
  label: ReactNode;
  // Plain text, for tooltips and screen readers
  text: string;
  value: number;
  display: string;
  color: string;
  // A second figure after the value
  note?: string;
  onClick?: () => void;
  // What clicking does, on hover
  hint?: string;
}

// A chart that grows to fill the room its panel has, so panels side by side end flush (the
// taller one sets the row's height): the space left is measured, never below `min`
export const Fill = ({ min, children }: { min: number; children: (height: number) => ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(min);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setHeight(Math.max(min, Math.floor(entry.contentRect.height))));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [min]);
  return (
    // Runtime minimum (DESIGN_SYSTEM §10: a size the design depends on)
    <div ref={ref} className="relative flex-1" style={{ minHeight: min }}>
      <div className="absolute inset-x-0 top-0">{children(height)}</div>
    </div>
  );
};

// Bars across, one row each: the label, a round bar and the value. A row with somewhere to go
// (its imports in Your Imports) is a button, with an arrow at its end.
// `spread`: the rows share the panel's spare height, so it ends flush with the one beside it
export const BarList = ({ data, labelWidth = "11rem", spread = false }: { data: Datum[]; labelWidth?: string; spread?: boolean }) => {
  const max = Math.max(...data.map((d) => d.value), 0.0001);
  const links = data.some((d) => d.onClick);
  // Runtime label column (DESIGN_SYSTEM §10: a width the design depends on)
  const cols = { gridTemplateColumns: `${labelWidth} minmax(0,1fr) 7.5rem${links ? " 1rem" : ""}` };
  const grid = "grid w-full items-center gap-3 px-1 py-0.5 text-sm";
  return (
    <ul className={`m-0 flex list-none flex-col gap-1.5 p-0 ${spread ? "flex-1 justify-between" : ""}`}>
      {data.map((d) => {
        const row = (
          <>
            <span className="truncate text-left text-base-content">{d.label}</span>
            <span className="h-4 overflow-hidden rounded-full bg-tt-soft" aria-hidden>
              {/* Runtime width and theme color (DESIGN_SYSTEM §10) */}
              <span className="block h-full rounded-full" style={{ width: barWidth(d.value, max, 1.5), background: d.color }} />
            </span>
            <span className="text-right tabular-nums">
              <b className="text-base-content">{d.display}</b>
              {d.note && <span className="ml-1.5 text-xs text-base-content/60">{d.note}</span>}
            </span>
            {links && (d.onClick ? <NavArrow /> : <NavArrowSpace />)}
          </>
        );
        return (
          <li key={d.key}>
            {d.onClick ? (
              <button
                type="button"
                onClick={d.onClick}
                title={d.hint}
                className={`${grid} group rounded-xl hover:bg-tt-soft focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40`}
                style={cols}
              >
                {row}
              </button>
            ) : (
              <div className={grid} style={cols}>
                {row}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// Columns up from the baseline, a band each, with the value on top
export const Columns = ({
  data,
  height = 240,
  format,
  label,
  integer = false,
}: {
  data: Datum[];
  height?: number;
  format: (v: number) => string;
  label: string;
  // Counts: whole-number gridlines only
  integer?: boolean;
}) => {
  const hover = useHovered();
  const max = niceMax(Math.max(...data.map((d) => d.value), 0.0001));
  const min = Math.min(0, ...data.map((d) => d.value));
  const lo = min < 0 ? -niceMax(-min) : 0;
  const margin = { top: 20, right: 8, bottom: 28, left: 44 };
  return (
    <ChartFrame
      height={height}
      margin={margin}
      label={label}
      onLeave={hover.clear}
      overlay={({ innerWidth, innerHeight }) => {
        if (hover.index === null) return null;
        const band = bandScale(data.map((d) => d.key), [0, innerWidth]);
        const y = linearScale([lo, max], [innerHeight, 0]);
        const d = data[hover.index];
        return (
          <Tooltip x={band.at(d.key) + band.bandwidth / 2} y={y(Math.max(d.value, 0))}>
            <TooltipRow color={d.color} label={d.text} value={d.display} />
            {d.note && <p className="m-0 mt-0.5 text-base-content/60">{d.note}</p>}
          </Tooltip>
        );
      }}
    >
      {({ innerWidth, innerHeight }) => {
        const band = bandScale(data.map((d) => d.key), [0, innerWidth]);
        const y = linearScale([lo, max], [innerHeight, 0]);
        // Labels under the columns while they fit; values on top while the columns are wide enough
        const narrow = band.step < 44;
        const thin = band.bandwidth < 20;
        return (
          <>
            <ValueAxis ticks={y.ticks(3).filter((t) => !integer || Number.isInteger(t))} y={y} format={format} />
            {lo < 0 && <Baseline y={y(0)} />}
            {data.map((d, i) => {
              const x = band.at(d.key);
              const down = d.value < 0;
              return (
                <g key={d.key} opacity={hover.index === null || hover.index === i ? 1 : 0.45}>
                  {down ? (
                    // Down from the baseline: the same bar, flipped
                    <g transform={`translate(0,${2 * y(0)}) scale(1,-1)`}>
                      <Bar x={x} width={band.bandwidth} y={(v) => y(-v)} value={-d.value} color={d.color} />
                    </g>
                  ) : (
                    <Bar x={x} width={band.bandwidth} y={y} value={d.value} color={d.color} />
                  )}
                  {!thin && (
                    <text x={x + band.bandwidth / 2} y={y(Math.max(d.value, 0)) - 6} textAnchor="middle" className="fill-base-content text-xs font-semibold tabular-nums">
                      {d.display}
                    </text>
                  )}
                </g>
              );
            })}
            <BottomAxis
              labels={
                narrow
                  ? []
                  : data.map((d) => ({ x: band.at(d.key) + band.bandwidth / 2, text: d.text.length > Math.floor(band.step / 7) ? `${d.text.slice(0, Math.max(3, Math.floor(band.step / 7) - 1))}…` : d.text }))
              }
            />
            <HitArea
              onMove={(px) => {
                const i = Math.floor((px - band.at(data[0].key) + (band.step - band.bandwidth) / 2) / band.step);
                hover.set(Math.max(0, Math.min(data.length - 1, i)));
              }}
            />
          </>
        );
      }}
    </ChartFrame>
  );
};

// Rates over time, one step line per series (five at most), with a legend and every series'
// value on the hovered date
export const StepLines = ({
  series,
  colors,
  to,
  format,
  height = 260,
  label,
}: {
  series: Series[];
  colors: Record<string, string>;
  // The last step runs to here (today)
  to: string;
  format: (v: number) => string;
  height?: number;
  label: string;
}) => {
  const hover = useHovered();
  const dates = series[0]?.points.map((p) => p.date) ?? [];
  if (!dates.length) return null;
  const first = dates[0];
  const max = niceMax(Math.max(...series.flatMap((s) => s.points.map((p) => p.value)), 0.01));
  const margin = { top: 12, right: 16, bottom: 28, left: 48 };
  const scales = (innerWidth: number, innerHeight: number) => ({
    x: timeScale(first, to, [0, innerWidth]),
    y: linearScale([0, max], [innerHeight, 0]),
  });
  return (
    <div className="flex flex-col gap-3">
      {series.length > 1 && <Legend items={series.map((s) => ({ label: s.label, color: colors[s.key], shape: "line" as const }))} />}
      <ChartFrame
        height={height}
        margin={margin}
        label={label}
        onLeave={hover.clear}
        overlay={({ innerWidth, innerHeight }) => {
          if (hover.index === null) return null;
          const { x, y } = scales(innerWidth, innerHeight);
          const date = dates[hover.index];
          const top = Math.max(...series.map((s) => s.points[hover.index!].value));
          return (
            <Tooltip x={x.at(date)} y={y(top)}>
              <p className="m-0 mb-1 font-semibold text-base-content">Since {formatDate(date)}</p>
              {[...series]
                .sort((a, b) => b.points[hover.index!].value - a.points[hover.index!].value)
                .map((s) => (
                  <TooltipRow key={s.key} color={colors[s.key]} label={s.label} value={format(s.points[hover.index!].value)} />
                ))}
            </Tooltip>
          );
        }}
      >
        {({ innerWidth, innerHeight }) => {
          const { x, y } = scales(innerWidth, innerHeight);
          const xs = dates.map((d) => x.at(d));
          return (
            <>
              <ValueAxis ticks={y.ticks(3)} y={y} format={format} />
              <BottomAxis
                labels={[
                  { x: 0, text: shortDate(first, true), anchor: "start" },
                  { x: innerWidth, text: "Today", anchor: "end" },
                ]}
              />
              {series.map((s) => (
                <StepLine key={s.key} points={s.points.map((p) => ({ x: time(p.date), y: p.value }))} x={x} y={y} to={time(to)} color={colors[s.key]} />
              ))}
              {series.map((s) => (
                <Dot key={s.key} cx={innerWidth} cy={y(s.points[s.points.length - 1].value)} color={colors[s.key]} />
              ))}
              {hover.index !== null && (
                <>
                  <Crosshair x={xs[hover.index]} />
                  {series.map((s) => (
                    <Dot key={s.key} cx={xs[hover.index!]} cy={y(s.points[hover.index!].value)} color={colors[s.key]} active />
                  ))}
                </>
              )}
              <HitArea onMove={(px) => hover.set(stepIndexAt(xs, px))} />
            </>
          );
        }}
      </ChartFrame>
    </div>
  );
};
