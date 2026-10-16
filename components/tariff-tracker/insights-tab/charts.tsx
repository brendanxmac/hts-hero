"use client";

import { ReactNode, useState } from "react";
import { arc, pie } from "d3-shape";
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
import * as tt from "@/components/ui/styles/tracker";
import { ERROR_MARK, MUTED_MARK, SUCCESS_MARK } from "@/components/ui/theme";
import { shortDate } from "../../duty-calculator/rate-history/format";
import { formatDate } from "../../duty-calculator/lib/format";
import { Series } from "./lib/data";

// The Insights tab's charts, on the shared chart kit: bars across (the default: long labels read
// best), columns, a donut for shares of a whole, and step lines for rates over time (a rate holds
// until a tariff changes it, so never a smoothed curve). Colors come from the caller (the theme's
// series and program colors); changes are red going up and green going down.

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
}

// A change's color: red up, green down
export const changeColor = (value: number) => (value > 0.005 ? ERROR_MARK : value < -0.005 ? SUCCESS_MARK : MUTED_MARK);

// Bars across, one row each: the label, a round bar (from the middle when values go both ways),
// and the value
export const BarList = ({ data, signed = false, labelWidth = "11rem" }: { data: Datum[]; signed?: boolean; labelWidth?: string }) => {
  const max = Math.max(...data.map((d) => Math.abs(d.value)), 0.0001);
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {data.map((d) => {
        const row = (
          <>
            <span className="truncate text-left text-base-content">{d.label}</span>
            {signed ? (
              <span className="grid h-4 grid-cols-2 gap-0.5" aria-hidden>
                <span className="flex justify-end overflow-hidden rounded-l-full bg-tt-soft">
                  {/* Runtime width and theme color (DESIGN_SYSTEM §10) */}
                  {d.value < 0 && <span className="block h-full rounded-l-full" style={{ width: barWidth(-d.value, max, 2), background: d.color }} />}
                </span>
                <span className="overflow-hidden rounded-r-full bg-tt-soft">
                  {d.value > 0 && <span className="block h-full rounded-r-full" style={{ width: barWidth(d.value, max, 2), background: d.color }} />}
                </span>
              </span>
            ) : (
              <span className="h-4 overflow-hidden rounded-full bg-tt-soft" aria-hidden>
                {/* Runtime width and theme color (DESIGN_SYSTEM §10) */}
                <span className="block h-full rounded-full" style={{ width: barWidth(d.value, max, 1.5), background: d.color }} />
              </span>
            )}
            <span className="text-right tabular-nums">
              <b className="text-base-content">{d.display}</b>
              {d.note && <span className="ml-1.5 text-xs text-base-content/60">{d.note}</span>}
            </span>
          </>
        );
        const grid = "grid w-full items-center gap-3 text-sm";
        // Runtime label column (DESIGN_SYSTEM §10: a width the design depends on)
        const cols = { gridTemplateColumns: `${labelWidth} minmax(0,1fr) 7.5rem` };
        return (
          <li key={d.key}>
            {d.onClick ? (
              <button
                type="button"
                onClick={d.onClick}
                className={`${grid} rounded-xl px-1 py-0.5 hover:bg-tt-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
                style={cols}
              >
                {row}
              </button>
            ) : (
              <div className={`${grid} px-1`} style={cols}>
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

// A share of a whole: a ring with the total (or the biggest part) in the middle, and the parts
// listed beside it
export const Donut = ({ data, center, centerNote }: { data: Datum[]; center: string; centerNote: string }) => {
  const [active, setActive] = useState<string | null>(null);
  const size = 200;
  const radius = size / 2;
  const slices = pie<Datum>()
    .value((d) => Math.max(0, d.value))
    .sort(null)
    .padAngle(0.012)(data);
  const ring = arc<(typeof slices)[number]>()
    .innerRadius(radius * 0.62)
    .outerRadius(radius)
    .cornerRadius(4);
  const shown = data.find((d) => d.key === active);
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[12.5rem_minmax(0,1fr)]" onMouseLeave={() => setActive(null)}>
      <div className="relative mx-auto h-[12.5rem] w-[12.5rem]">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${centerNote}: ${data.map((d) => `${d.text} ${d.display}`).join(", ")}`}>
          <g transform={`translate(${radius},${radius})`}>
            {slices.map((s) => (
              <path
                key={s.data.key}
                d={ring(s) ?? ""}
                // Theme color (DESIGN_SYSTEM §10)
                fill={s.data.color}
                opacity={active && active !== s.data.key ? 0.25 : 1}
                onMouseEnter={() => setActive(s.data.key)}
                className="cursor-default transition-opacity"
              />
            ))}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span className={`${tt.display} text-2xl font-semibold tabular-nums text-base-content`}>{shown ? shown.display : center}</span>
          <span className="mt-0.5 line-clamp-2 text-xs text-base-content/60">{shown ? shown.text : centerNote}</span>
        </div>
      </div>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {data.map((d) => (
          <li
            key={d.key}
            className={`flex items-center justify-between gap-3 rounded-xl px-2 py-1 text-sm transition-opacity ${active && active !== d.key ? "opacity-50" : ""}`}
            onMouseEnter={() => setActive(d.key)}
          >
            <span className="flex min-w-0 items-center gap-2">
              {/* Theme color (DESIGN_SYSTEM §10) */}
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color }} aria-hidden />
              <span className="truncate text-base-content">{d.label}</span>
            </span>
            <span className="shrink-0 tabular-nums">
              <b className="text-base-content">{d.display}</b>
              {d.note && <span className="ml-1.5 text-xs text-base-content/60">{d.note}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
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
