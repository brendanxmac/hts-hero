"use client";

import { useId, useMemo } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { ERROR_MARK, PRIMARY_MARK, SUCCESS_MARK } from "@/components/ui/theme";
import { shortDate } from "../../duty-calculator/rate-history/format";
import { IsoDate } from "../../../tariffs/engine-v2/types";
import { formatRate } from "../formatRate";
import { smoothPath } from "./lib/geometry";

// The catalog's average duty rate over the last year as a smooth line with a fading fill (the
// one gradient the design allows), its biggest drop and rise marked with what caused them
const W = 800;
const H = 230;
const PAD = { top: 56, bottom: 36 };

const time = (d: IsoDate) => Date.parse(`${d}T00:00:00Z`);

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
  const geometry = useMemo(() => {
    const shown = series.filter((p) => p.date >= from);
    const start = series.filter((p) => p.date < from).pop();
    const points = start ? [{ date: from, pct: start.pct }, ...shown] : shown;
    if (!points.length) return null;
    const all = [...points, { date: to, pct: points[points.length - 1].pct }];
    const t0 = time(from);
    const t1 = Math.max(time(to), t0 + 1);
    const max = Math.max(...all.map((p) => p.pct), 1);
    const min = Math.min(...all.map((p) => p.pct));
    const span = max - min || 1;
    const x = (d: IsoDate) => ((time(d) - t0) / (t1 - t0)) * W;
    const y = (pct: number) => PAD.top + (1 - (pct - min) / span) * (H - PAD.top - PAD.bottom);
    const xy = all.map((p) => ({ x: x(p.date), y: y(p.pct) }));
    const line = smoothPath(xy);
    const at = (d: IsoDate) => {
      const p = [...all].reverse().find((q) => q.date <= d) ?? all[0];
      return { x: x(d), y: y(p.pct) };
    };
    const low = all.reduce((a, b) => (b.pct < a.pct ? b : a), all[0]);
    return { line, area: `${line}L${W} ${H}L0 ${H}Z`, at, today: all[all.length - 1], low, last: xy[xy.length - 1] };
  }, [series, from, to]);

  const pill = (e: PulseEvent, tone: "up" | "down") => {
    if (!geometry) return null;
    const p = geometry.at(e.date);
    const text = `${shortDate(e.date)} · ${e.label}`;
    const w = Math.min(220, 18 + text.length * 6.6);
    const px = Math.max(0, Math.min(W - w, p.x - w / 2));
    const py = tone === "up" ? 8 : H - 30;
    const color = tone === "up" ? ERROR_MARK : SUCCESS_MARK;
    return (
      <g key={e.date + tone}>
        {/* Theme marks at runtime positions (DESIGN_SYSTEM §10) */}
        <circle cx={p.x} cy={p.y} r={6} className="fill-base-100" stroke={color} strokeWidth={3} />
        <rect x={px} y={py} width={w} height={24} rx={12} fill={color} fillOpacity={0.12} />
        <text x={px + w / 2} y={py + 16} textAnchor="middle" fill={color} className="text-xs font-bold">
          {text}
        </text>
      </g>
    );
  };

  return (
    <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`} aria-labelledby="tt-pulse">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="tt-pulse" className={tt.title}>
            Rate pulse
          </h2>
          <p className={tt.subtitle}>Your catalog&apos;s average duty rate over the last 12 months</p>
        </div>
        {geometry && (
          <div className="flex gap-2.5">
            <div className={`${tt.tile} px-4 py-2`}>
              <span className="text-xs text-base-content/60">Today</span>
              <div className={`${tt.display} text-xl font-semibold tabular-nums`}>{formatRate(geometry.today.pct)}</div>
            </div>
            <div className={`${tt.tile} px-4 py-2`}>
              <span className="text-xs text-base-content/60">Low, {shortDate(geometry.low.date)}</span>
              <div className={`${tt.display} text-xl font-semibold tabular-nums`}>{formatRate(geometry.low.pct)}</div>
            </div>
          </div>
        )}
      </div>
      {geometry ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Average duty rate, ${formatRate(geometry.today.pct)} today`}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" style={{ stopColor: PRIMARY_MARK, stopOpacity: 0.25 }} />
              <stop offset="1" style={{ stopColor: PRIMARY_MARK, stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={geometry.area} fill={`url(#${gradientId})`} />
          <path d={geometry.line} fill="none" stroke={PRIMARY_MARK} strokeWidth={3.5} strokeLinecap="round" />
          <circle cx={geometry.last.x} cy={geometry.last.y} r={7} fill={PRIMARY_MARK} />
          {drop && pill(drop, "down")}
          {rise && pill(rise, "up")}
        </svg>
      ) : (
        <div className="h-56 animate-pulse rounded-2xl bg-tt-soft" />
      )}
    </section>
  );
};
