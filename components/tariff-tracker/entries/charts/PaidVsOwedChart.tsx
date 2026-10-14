"use client";

import { useState } from "react";
import * as ui from "@/components/ui/styles";
import { MUTED_MARK, SERIES_COLORS } from "@/components/ui/theme";
import { formatDate } from "../../../duty-calculator/lib/format";
import { money, VERDICTS } from "../EntriesTable";
import { AuditRow } from "../useAuditRows";

// What was paid and what was owed on each audited entry, oldest first: a pair of bars per entry,
// with the entry's date, both amounts and the difference on hover. Paid and owed are two series
// in the chart palette's first two slots.
const W = 800;
const H = 240;
const PAD = { top: 12, right: 12, bottom: 28, left: 56 };
const PAID = SERIES_COLORS[0];
const OWED = SERIES_COLORS[1];

const Legend = () => (
  <div className="flex gap-4 text-xs text-base-content/70">
    {[
      { label: "Paid", color: PAID },
      { label: "Owed", color: OWED },
    ].map((s) => (
      <span key={s.label} className="inline-flex items-center gap-1.5">
        {/* Series color (DESIGN_SYSTEM §10) */}
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
        {s.label}
      </span>
    ))}
  </div>
);

export const PaidVsOwedChart = ({ rows }: { rows: AuditRow[] }) => {
  const [hover, setHover] = useState<number | null>(null);
  const audited = rows.filter((r) => r.audit).sort((a, b) => a.entry.entryDate.localeCompare(b.entry.entryDate));
  if (!audited.length) return null;

  const max = Math.max(...audited.flatMap((r) => [r.entry.dutyPaid, r.audit!.owed]), 1) * 1.1;
  const plotW = W - PAD.left - PAD.right;
  const slot = plotW / audited.length;
  const bar = Math.max(2, Math.min(18, slot * 0.32));
  const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
  const base = y(0);
  const ticks = [0, max / 2, max];
  const active = hover === null ? null : audited[hover];

  return (
    <section className={`${ui.card} p-5`} aria-labelledby="tt-paid-owed">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="tt-paid-owed" className={ui.cardTitle}>
            Paid against owed, entry by entry
          </h3>
          <p className={`${ui.caption} mt-0.5`}>
            {active
              ? `${formatDate(active.entry.entryDate)}: paid ${money(active.entry.dutyPaid)}, owed ${money(active.audit!.owed)} · ${VERDICTS[active.audit!.verdict].label}`
              : `${audited.length} audited ${audited.length === 1 ? "entry" : "entries"}, oldest first. Hover for each one.`}
          </p>
        </div>
        <Legend />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-60 w-full" onMouseLeave={() => setHover(null)} role="img" aria-label="Duty paid and owed on each audited entry">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={MUTED_MARK} strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-base-content/60 text-xs">
              {money(t).replace(/\.\d\d$/, "")}
            </text>
          </g>
        ))}
        {/* Chart geometry and theme marks (DESIGN_SYSTEM §10) */}
        {audited.map((r, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const dim = hover !== null && hover !== i;
          return (
            <g key={r.entry.id} opacity={dim ? 0.45 : 1}>
              <rect x={cx - bar - 1} y={y(r.entry.dutyPaid)} width={bar} height={Math.max(0, base - y(r.entry.dutyPaid))} rx={2} fill={PAID} />
              <rect x={cx + 1} y={y(r.audit!.owed)} width={bar} height={Math.max(0, base - y(r.audit!.owed))} rx={2} fill={OWED} />
              <rect x={PAD.left + slot * i} y={PAD.top} width={slot} height={H - PAD.top - PAD.bottom} fill="transparent" onMouseEnter={() => setHover(i)} />
            </g>
          );
        })}
        <text x={PAD.left} y={H - 6} className="fill-base-content/60 text-xs">
          {formatDate(audited[0].entry.entryDate)}
        </text>
        {audited.length > 1 && (
          <text x={W - PAD.right} y={H - 6} textAnchor="end" className="fill-base-content/60 text-xs">
            {formatDate(audited[audited.length - 1].entry.entryDate)}
          </text>
        )}
      </svg>
    </section>
  );
};
