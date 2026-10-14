"use client";

import { useState } from "react";
import * as ui from "@/components/ui/styles";
import { MUTED_MARK, PRIMARY_MARK } from "@/components/ui/theme";
import { formatDate } from "../../duty-calculator/lib/format";
import { shortDate } from "../../duty-calculator/rate-history/format";
import { IsoDate } from "../../../tariffs/engine-v2/types";
import { formatRate } from "../formatRate";

// The catalog's average duty rate as a step line from the first verified revision to today,
// with each step's date and rate on hover
const W = 800;
const H = 220;
const PAD = { top: 12, right: 12, bottom: 24, left: 44 };

const time = (d: IsoDate) => Date.parse(`${d}T00:00:00Z`);

export const CatalogRateChart = ({ series, to }: { series: { date: IsoDate; pct: number }[]; to: IsoDate }) => {
  const [hover, setHover] = useState<number | null>(null);
  if (series.length === 0) return null;
  const t0 = time(series[0].date);
  const t1 = Math.max(time(to), t0 + 1);
  const max = Math.max(...series.map((p) => p.pct), 1) * 1.15;
  const x = (d: IsoDate) => PAD.left + ((time(d) - t0) / (t1 - t0)) * (W - PAD.left - PAD.right);
  const y = (pct: number) => PAD.top + (1 - pct / max) * (H - PAD.top - PAD.bottom);
  const path = series
    .map((p, i) => {
      const nextX = i + 1 < series.length ? x(series[i + 1].date) : x(to);
      return `${i === 0 ? "M" : "L"}${x(p.date)},${y(p.pct)} L${nextX},${y(p.pct)}`;
    })
    .join(" ");
  const ticks = [0, max / 2, max].map((v) => Math.round(v));
  const active = hover === null ? series[series.length - 1] : series[hover];

  return (
    <section className={`${ui.card} p-5`} aria-labelledby="tt-avg-rate">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="tt-avg-rate" className={ui.cardTitle}>
            Average duty rate across your imports
          </h3>
          <p className={`${ui.caption} mt-0.5`}>
            {shortDate(series[0].date, true)} – {formatDate(to)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold leading-none tracking-tight tabular-nums text-primary">{formatRate(active.pct)}</p>
          <p className={`${ui.caption} mt-1`}>{hover === null ? "Today" : `From ${formatDate(active.date)}`}</p>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-56 w-full" onMouseLeave={() => setHover(null)} role="img" aria-label="Average duty rate over time">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={MUTED_MARK} strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-base-content/60 text-xs">
              {t}%
            </text>
          </g>
        ))}
        <text x={PAD.left} y={H - 4} className="fill-base-content/60 text-xs">
          {shortDate(series[0].date, true)}
        </text>
        <text x={W - PAD.right} y={H - 4} textAnchor="end" className="fill-base-content/60 text-xs">
          Today
        </text>
        {/* Chart geometry and theme marks (DESIGN_SYSTEM §10) */}
        <path d={path} fill="none" stroke={PRIMARY_MARK} strokeWidth={2.5} />
        {series.map((p, i) => {
          const nextX = i + 1 < series.length ? x(series[i + 1].date) : x(to);
          return (
            <rect
              key={p.date}
              x={x(p.date)}
              y={PAD.top}
              width={Math.max(nextX - x(p.date), 1)}
              height={H - PAD.top - PAD.bottom}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          );
        })}
        {hover !== null && <circle cx={x(active.date)} cy={y(active.pct)} r={5} fill={PRIMARY_MARK} />}
      </svg>
    </section>
  );
};
