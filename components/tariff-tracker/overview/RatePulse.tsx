"use client";

import { useId, useMemo } from "react";
import {
  BottomAxis,
  ChartFrame,
  Crosshair,
  Dot,
  HitArea,
  linearScale,
  niceMax,
  StepArea,
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
import { ERROR_MARK, PRIMARY_MARK, SUCCESS_MARK } from "@/components/ui/theme";
import { formatDate } from "../../duty-calculator/lib/format";
import { shortDate } from "../../duty-calculator/rate-history/format";
import { IsoDate } from "../../../tariffs/engine-v2/types";
import { formatRate } from "../formatRate";

// The average duty rate across the user's imports over the last year. A rate holds until a tariff
// changes it, so it's drawn as steps (never a smoothed curve, which would invent slopes and
// overshoot the real values), over a soft fill (the one gradient the design allows), from zero so
// a small change looks small. Its biggest rise and drop are marked with what caused them; hovering
// shows the rate in force on any day. Built on the shared chart kit (components/ui/charts/kit).

const HEIGHT = 240;
const MARGIN = { top: 40, right: 16, bottom: 28, left: 44 };

export interface PulseEvent {
  date: IsoDate;
  label: string;
}

export const RatePulse = ({
  series,
  from,
  to,
  rise,
  drop,
}: {
  series: { date: IsoDate; pct: number }[];
  from: IsoDate;
  to: IsoDate;
  rise?: PulseEvent;
  drop?: PulseEvent;
}) => {
  const gradientId = useId();
  const hover = useHovered();

  // The steps in the window: the rate in force on its first day (when it started earlier), then
  // each change, sorted and with one step per date
  const steps = useMemo(() => {
    const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));
    const start = sorted.filter((p) => p.date < from).pop();
    const inside = sorted.filter((p) => p.date >= from && p.date <= to);
    const all = start ? [{ date: from, pct: start.pct }, ...inside] : inside;
    return all.filter((p, i) => i === 0 || p.date !== all[i - 1].date);
  }, [series, from, to]);

  if (!steps.length) {
    return (
      <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`} aria-labelledby="tt-pulse">
        <h2 id="tt-pulse" className={tt.title}>
          Rate Pulse
        </h2>
        <div className="h-56 animate-pulse rounded-2xl bg-tt-soft" />
      </section>
    );
  }

  const today = steps[steps.length - 1];
  const low = steps.reduce((a, b) => (b.pct < a.pct ? b : a), steps[0]);
  const max = niceMax(Math.max(...steps.map((s) => s.pct), 1));
  const first = steps[0].date;
  // The step in force on a date
  const rateOn = (date: IsoDate) => [...steps].reverse().find((s) => s.date <= date) ?? steps[0];

  return (
    <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`} aria-labelledby="tt-pulse">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="tt-pulse" className={tt.title}>
            Rate Pulse
          </h2>
          <p className={tt.subtitle}>The average duty rate across your imports over the last 12 months</p>
        </div>
        <div className="flex gap-2.5">
          <div className={`${tt.tile} px-4 py-2`}>
            <span className="text-xs text-base-content/60">Today</span>
            <div className={`${tt.display} text-xl font-semibold tabular-nums`}>{formatRate(today.pct)}</div>
          </div>
          <div className={`${tt.tile} px-4 py-2`}>
            <span className="text-xs text-base-content/60">Low, {shortDate(low.date)}</span>
            <div className={`${tt.display} text-xl font-semibold tabular-nums`}>{formatRate(low.pct)}</div>
          </div>
        </div>
      </div>

      <ChartFrame
        height={HEIGHT}
        margin={MARGIN}
        label={`Average duty rate over the last 12 months, ${formatRate(today.pct)} today`}
        onLeave={hover.clear}
        overlay={({ innerWidth, innerHeight }) => {
          if (hover.index === null) return null;
          const x = timeScale(first, to, [0, innerWidth]);
          const y = linearScale([0, max], [innerHeight, 0]);
          const step = steps[hover.index];
          return (
            <Tooltip x={x.at(step.date)} y={y(step.pct)}>
              <p className="m-0 mb-1 font-semibold text-base-content">Since {formatDate(step.date)}</p>
              <TooltipRow color={PRIMARY_MARK} label="Average rate" value={formatRate(step.pct)} />
            </Tooltip>
          );
        }}
      >
        {({ innerWidth, innerHeight }) => {
          const x = timeScale(first, to, [0, innerWidth]);
          const y = linearScale([0, max], [innerHeight, 0]);
          const points = steps.map((s) => ({ x: time(s.date), y: s.pct }));
          const xs = steps.map((s) => x.at(s.date));
          const active = hover.index === null ? null : steps[hover.index];

          // A cause, marked on the line where it happened, with its label pinned to the top
          // (rises) or bottom (drops) of the plot, kept inside it
          const marker = (e: PulseEvent, tone: "up" | "down") => {
            // Only changes inside the window, kept on the plot
            if (e.date < first || e.date > to) return null;
            const color = tone === "up" ? ERROR_MARK : SUCCESS_MARK;
            const cx = Math.max(0, Math.min(innerWidth, x.at(e.date)));
            const cy = y(rateOn(e.date).pct);
            const text = `${shortDate(e.date)} · ${e.label}`;
            const w = Math.min(220, 18 + text.length * 6.6);
            const px = Math.max(0, Math.min(innerWidth - w, cx - w / 2));
            const py = tone === "up" ? -MARGIN.top + 6 : innerHeight - 30;
            return (
              <g key={e.date + tone} pointerEvents="none">
                {/* Theme marks at runtime positions (DESIGN_SYSTEM §10) */}
                <line x1={cx} x2={cx} y1={tone === "up" ? py + 24 : cy} y2={tone === "up" ? cy : py} stroke={color} strokeWidth={1} strokeDasharray="2 3" />
                <rect x={px} y={py} width={w} height={24} rx={12} fill={color} fillOpacity={0.12} />
                <text x={px + w / 2} y={py + 16} textAnchor="middle" fill={color} className="text-xs font-bold">
                  {text}
                </text>
                <Dot cx={cx} cy={cy} color={color} hollow />
              </g>
            );
          };

          return (
            <>
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" style={{ stopColor: PRIMARY_MARK, stopOpacity: 0.22 }} />
                  <stop offset="1" style={{ stopColor: PRIMARY_MARK, stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <ValueAxis ticks={y.ticks(3)} y={y} format={formatRate} />
              <BottomAxis
                labels={[
                  { x: 0, text: shortDate(first, true), anchor: "start" },
                  { x: innerWidth, text: "Today", anchor: "end" },
                ]}
              />
              <StepArea points={points} x={x} y={y} to={time(to)} y0={innerHeight} fill={`url(#${gradientId})`} />
              <StepLine points={points} x={x} y={y} to={time(to)} color={PRIMARY_MARK} />
              {drop && marker(drop, "down")}
              {rise && marker(rise, "up")}
              <Dot cx={innerWidth} cy={y(today.pct)} color={PRIMARY_MARK} active />
              {active && (
                <>
                  <Crosshair x={x.at(active.date)} />
                  <Dot cx={x.at(active.date)} cy={y(active.pct)} color={PRIMARY_MARK} active />
                </>
              )}
              <HitArea onMove={(px) => hover.set(stepIndexAt(xs, px))} />
            </>
          );
        }}
      </ChartFrame>
    </section>
  );
};
