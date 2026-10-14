"use client";

import { useState } from "react";
import * as ui from "@/components/ui/styles";
import { ERROR_MARK, MUTED_MARK, PRIMARY_MARK, SUCCESS_MARK } from "@/components/ui/theme";
import { formatDate } from "../../../duty-calculator/lib/format";
import { IsoDate } from "../../../../tariffs/engine-v2/types";
import { formatRate } from "../../formatRate";
import { ProductHistory } from "../../insights/catalogHistory";
import { AuditVerdict } from "../entries";
import { money, VERDICTS } from "../EntriesTable";
import { AuditRow } from "../useAuditRows";

// One product's duty rate in force over time, as a step line, with each audited entry on it: a
// dot at the rate that was paid, joined to the rate owed that day. An entry paid at the old rate
// just after a change sits off the line, which is the refund (or the underpayment) to look at.
const W = 800;
const H = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 48 };

const time = (d: IsoDate) => Date.parse(`${d}T00:00:00Z`);

const DOT: Record<AuditVerdict, string> = { overpaid: SUCCESS_MARK, underpaid: ERROR_MARK, correct: PRIMARY_MARK };

export const RateTimeline = ({ history, rows, to }: { history: ProductHistory; rows: AuditRow[]; to: IsoDate }) => {
  const [hover, setHover] = useState<string | null>(null);
  const audited = rows.filter((r) => r.audit);
  if (!history.length) return null;

  const t0 = time(history[0].from);
  const t1 = Math.max(time(to), t0 + 1);
  const max = Math.max(...history.map((s) => s.pct), ...audited.flatMap((r) => [r.audit!.ratePaidPct, r.audit!.rateOwedPct]), 1) * 1.15;
  const x = (d: IsoDate) => PAD.left + ((Math.min(time(d), t1) - t0) / (t1 - t0)) * (W - PAD.left - PAD.right);
  const y = (pct: number) => PAD.top + (1 - pct / max) * (H - PAD.top - PAD.bottom);
  const path = history.map((s, i) => `${i === 0 ? "M" : "L"}${x(s.from)},${y(s.pct)} L${x(i + 1 < history.length ? history[i + 1].from : to)},${y(s.pct)}`).join(" ");
  const ticks = [0, max / 2, max].map((v) => Math.round(v));
  const active = audited.find((r) => r.entry.id === hover);

  return (
    <section className={`${ui.card} p-5`} aria-labelledby="tt-rate-timeline">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="tt-rate-timeline" className={ui.cardTitle}>
            Your entries against the rate in force
          </h3>
          <p className={`${ui.caption} mt-0.5`}>
            {active
              ? `${formatDate(active.entry.entryDate)}: paid ${formatRate(active.audit!.ratePaidPct)}, owed ${formatRate(active.audit!.rateOwedPct)} (${money(Math.abs(active.audit!.difference))} ${VERDICTS[active.audit!.verdict].label.toLowerCase()})`
              : "The line is the duty rate in force; each dot is an entry, at the rate you paid."}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-base-content/70">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-primary" aria-hidden />
            Rate in force
          </span>
          {(["overpaid", "underpaid", "correct"] as AuditVerdict[]).map((v) => (
            <span key={v} className="inline-flex items-center gap-1.5">
              {/* Theme marks (DESIGN_SYSTEM §10) */}
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: DOT[v] }} aria-hidden />
              {VERDICTS[v].label}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-64 w-full" onMouseLeave={() => setHover(null)} role="img" aria-label="Duty rate in force over time, with each audited entry">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={MUTED_MARK} strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-base-content/60 text-xs">
              {t}%
            </text>
          </g>
        ))}
        <text x={PAD.left} y={H - 6} className="fill-base-content/60 text-xs">
          {formatDate(history[0].from)}
        </text>
        <text x={W - PAD.right} y={H - 6} textAnchor="end" className="fill-base-content/60 text-xs">
          Today
        </text>
        {/* Chart geometry and theme marks (DESIGN_SYSTEM §10) */}
        <path d={path} fill="none" stroke={PRIMARY_MARK} strokeWidth={2} />
        {audited.map((r) => {
          const cx = x(r.entry.entryDate);
          const paidY = y(r.audit!.ratePaidPct);
          const owedY = y(r.audit!.rateOwedPct);
          const on = hover === r.entry.id;
          return (
            <g key={r.entry.id} onMouseEnter={() => setHover(r.entry.id)}>
              <line x1={cx} x2={cx} y1={paidY} y2={owedY} stroke={DOT[r.audit!.verdict]} strokeWidth={2} strokeDasharray="3 3" />
              <circle cx={cx} cy={paidY} r={on ? 7 : 5} fill={DOT[r.audit!.verdict]} stroke="oklch(var(--b1))" strokeWidth={2} />
              {/* A bigger target than the dot */}
              <circle cx={cx} cy={paidY} r={14} fill="transparent" />
            </g>
          );
        })}
      </svg>
    </section>
  );
};
