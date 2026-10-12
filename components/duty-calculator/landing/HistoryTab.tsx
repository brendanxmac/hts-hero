"use client";

import { ChartStandIn } from "@/components/ui/stand-ins";
import * as tt from "@/components/ui/styles/tracker";
import { HistorySegment } from "@/tariffs/engine-v2/history";
import { formatDate, formatMoney, formatPct, todayIso } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";
import { Teaser } from "./Teaser";
import { thisPageWith } from "./redirect";

// The Duty Over Time tab: a few plain facts about how this import's duty has moved (worked out on
// the page, free), then the Tracker's full history chart, teased. If it paid more in the past
// than today, the refund angle leads: past entries may be worth a look.

const pct = (n: number) => formatPct(Math.round(n * 100) / 100);


const Stat = ({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "warning" | "success" }) => (
  <div className={`${tt.tile} flex flex-col gap-1 px-5 py-4`}>
    <span className="text-xs font-bold text-base-content/60">{label}</span>
    <span className={`${tt.display} text-2xl font-semibold tabular-nums ${tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-base-content"}`}>
      {value}
    </span>
    <span className="text-xs text-base-content/60">{note}</span>
  </div>
);

export const HistoryTab = ({ f }: { f: TariffFinder }) => {
  const segments = f.history;
  if (!segments.length || f.customsValue <= 0) return null;

  const rateOf = (s: HistorySegment) => (s.result.totalDuty / f.customsValue) * 100;
  const now = todayIso();
  const current = segments.find((s) => s.from <= now && now < s.to) ?? segments[segments.length - 1];
  const yearAgo = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
  const then = segments.find((s) => s.from <= yearAgo && yearAgo < s.to) ?? segments[0];
  const past = segments.filter((s) => s.from <= now);
  const peak = past.reduce((a, b) => (rateOf(b) > rateOf(a) ? b : a), past[0] ?? current);
  const low = past.reduce((a, b) => (rateOf(b) < rateOf(a) ? b : a), past[0] ?? current);
  const changes = past.filter((s) => s.changes.length > 0).length;
  const yearChange = rateOf(current) - rateOf(then);
  // The same change in dollars on this import
  const yearChangeAmount = current.result.totalDuty - then.result.totalDuty;
  const overToday = rateOf(peak) - rateOf(current);
  // What this entry would have paid at the peak, over today
  const overpaid = peak.result.totalDuty - current.result.totalDuty;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className={`${tt.title} m-0`}>How the duty on this import has changed</h2>
        <p className={`${tt.subtitle} m-0`}>
          The same import, value and answers, recalculated on every date a tariff started or stopped since {formatDate(f.historyRange.from)}.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Today" value={pct(rateOf(current))} note={`${formatMoney(current.result.totalDuty)} on this import`} />
        <Stat
          label={`Since ${formatDate(yearAgo < then.from ? then.from : yearAgo)}`}
          value={
            Math.abs(yearChange) < 0.005
              ? "No change"
              : rateOf(then) > 0
                ? `${yearChange > 0 ? "+" : "−"}${Math.round((Math.abs(yearChange) / rateOf(then)) * 100)}%`
                : `+${pct(rateOf(current))}`
          }
          note={
            Math.abs(yearChange) < 0.005
              ? `${pct(rateOf(current))} throughout`
              : `${pct(rateOf(then))} → ${pct(rateOf(current))} · ${yearChangeAmount > 0 ? "+" : "−"}${formatMoney(Math.abs(yearChangeAmount))} on this import`
          }
          tone={yearChange > 0.005 ? "warning" : yearChange < -0.005 ? "success" : undefined}
        />
        <Stat label="Highest" value={pct(rateOf(peak))} note={`from ${formatDate(peak.from)}`} tone={overToday > 0.005 ? "warning" : undefined} />
        <Stat label="Lowest" value={pct(rateOf(low))} note={`from ${formatDate(low.from)}`} />
      </div>
      <Teaser
        feature="duty-over-time"
        tone={overToday > 0.005 ? "warning" : "primary"}
        title={overToday > 0.005 ? "See if you qualify for a refund" : "See every change on a chart"}
        teaser={
          overToday > 0.005 ? (
            <>
              At its peak this import paid <span className={tt.numberChip("warning")}>{formatMoney(overpaid)}</span> more than today. Entries made then may
              qualify for a refund.
            </>
          ) : (
            <>
              The duty on this import changed {changes} {changes === 1 ? "time" : "times"} since {formatDate(f.historyRange.from)}. See when, which tariff and by
              how much.
            </>
          )
        }
        points={["Every change: when, which tariff, how much", "What past entries could have paid", "Alerts when it changes again"]}
        cta={overToday > 0.005 ? "Check for a refund free" : "See the full history free"}
        redirect={() => thisPageWith({ view: "history" })}
        preview={<ChartStandIn />}
      />
    </div>
  );
};
