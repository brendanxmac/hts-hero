"use client";

import { useState } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { MUTED_MARK, PRIMARY_MARK } from "@/components/ui/theme";
import { formatDate, todayIso } from "../../../duty-calculator/lib/format";
import { addDays } from "../../../../tariffs/engine-v2/history";
import { formatRate } from "../../formatRate";
import { useInsights } from "../../insights/InsightsContext";
import { shortProgram, TrackedProduct } from "../../report";
import { SummaryCard } from "./SummaryCard";

// How the product's rate has moved: a step line over the verified tariff data with each step's
// rate and date on hover, how often it changed in the last year, and the latest change
const W = 600;
const H = 120;
const PAD = 6;
const time = (d: string) => Date.parse(`${d}T00:00:00Z`);

export const HistoryCard = ({ product, onOpen }: { product: TrackedProduct; onOpen: () => void }) => {
  const { histories, changes } = useInsights();
  const [hover, setHover] = useState<number | null>(null);
  const history = histories.get(product.key);
  const mine = changes.filter((c) => c.product.key === product.key);
  const today = todayIso();
  const lastYear = mine.filter((c) => c.date >= addDays(today, -365));
  const latest = mine[0];

  if (!history?.length) {
    return (
      <SummaryCard title="Rate over time">
        <div className="h-32 animate-pulse rounded-2xl bg-tt-soft" aria-busy="true" />
      </SummaryCard>
    );
  }
  const t0 = time(history[0].from);
  const t1 = Math.max(time(today), t0 + 1);
  const max = Math.max(...history.map((s) => s.pct), 1) * 1.15;
  const x = (d: string) => PAD + ((Math.min(time(d), t1) - t0) / (t1 - t0)) * (W - PAD * 2);
  const y = (pct: number) => PAD + (1 - pct / max) * (H - PAD * 2);
  const path = history.map((s, i) => `${i === 0 ? "M" : "L"}${x(s.from)},${y(s.pct)} L${x(i + 1 < history.length ? history[i + 1].from : today)},${y(s.pct)}`).join(" ");
  const active = hover === null ? history[history.length - 1] : history[hover];

  return (
    <SummaryCard title="Rate over time" link={{ label: "Recent changes", onClick: onOpen }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className={tt.metricSm}>{formatRate(active.pct)}</span>
          <span className="ml-2 text-xs text-base-content/60">{hover === null ? "today" : `from ${formatDate(active.from)}`}</span>
        </div>
        <span className="text-sm text-base-content/70">
          {lastYear.length ? `${lastYear.length} ${lastYear.length === 1 ? "change" : "changes"} in the last 12 months` : "No changes in the last 12 months"}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full" onMouseLeave={() => setHover(null)} role="img" aria-label={`Duty rate on ${product.entry.element.htsno} over time`}>
        <line x1={PAD} x2={W - PAD} y1={y(0)} y2={y(0)} stroke={MUTED_MARK} strokeWidth={1} />
        {/* Chart geometry and theme marks (DESIGN_SYSTEM §10) */}
        <path d={path} fill="none" stroke={PRIMARY_MARK} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        {history.map((s, i) => {
          const nextX = i + 1 < history.length ? x(history[i + 1].from) : x(today);
          return <rect key={s.from} x={x(s.from)} y={0} width={Math.max(nextX - x(s.from), 1)} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />;
        })}
        {hover !== null && <circle cx={x(active.from)} cy={y(active.pct)} r={4} fill={PRIMARY_MARK} />}
      </svg>
      {latest && (
        <p className="m-0 text-sm text-base-content/70">
          Latest: <span className={`font-semibold ${latest.deltaPct > 0 ? "text-error" : "text-success"}`}>{latest.deltaPct > 0 ? "▲" : "▼"} {formatRate(Math.abs(latest.deltaPct))}</span> on{" "}
          {formatDate(latest.date)}
          {latest.after.changes[0] ? ` · ${shortProgram(latest.after.changes[0].name)}` : ""}
        </p>
      )}
    </SummaryCard>
  );
};
