"use client";

import { useState } from "react";
import { BottomAxis, ChartFrame, linearScale, niceMax, Tooltip, TooltipRow } from "@/components/ui/charts/kit";
import * as tt from "@/components/ui/styles/tracker";
import { MUTED_MARK } from "@/components/ui/theme";
import { formatRate } from "../formatRate";
import { compactMoney, GROUP_ORDER, GROUPS, money, type ImpactGroup } from "./format";

// The Tariff impact tab's charts (DESIGN_SYSTEM §15: few marks, round ends, no gridlines)

// ── Rate before and after ──
// One row per import whose duty the update changes: a quiet hollow dot at the rate before, a
// filled one in the change's color at the rate after, joined by a round line. Biggest change
// in dollars first. Hovering a row shows its numbers.

export interface ShiftRow {
  key: string;
  label: string;
  sub: string;
  before: number;
  after: number;
  deltaUsd: number;
  group: ImpactGroup;
}

const ROW = 34;
const MAX_ROWS = 12;

export const RateShift = ({ rows, onPick }: { rows: ShiftRow[]; onPick?: (key: string) => void }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = rows.slice(0, MAX_ROWS);
  const max = niceMax(Math.max(1, ...shown.flatMap((r) => [r.before, r.after])));
  const margin = { top: 8, right: 56, bottom: 28, left: 172 };
  const height = margin.top + margin.bottom + shown.length * ROW;
  return (
    <div className="flex flex-col gap-2">
      <ChartFrame
        height={height}
        margin={margin}
        label={`Duty rate before and after, for ${shown.length} imports`}
        onLeave={() => setHovered(null)}
        overlay={({ innerWidth }) => {
          if (hovered === null) return null;
          const r = shown[hovered];
          const x = linearScale([0, max], [0, innerWidth])(r.after);
          return (
            <Tooltip x={x} y={hovered * ROW + ROW / 2}>
              <p className="mb-1 font-semibold text-base-content">{r.label}</p>
              <TooltipRow color={MUTED_MARK} label="Before" value={formatRate(r.before)} />
              <TooltipRow color={GROUPS[r.group].mark} label="After" value={formatRate(r.after)} />
              <TooltipRow label="Per shipment" value={money(r.deltaUsd, true)} />
            </Tooltip>
          );
        }}
      >
        {({ innerWidth }) => {
          const x = linearScale([0, max], [0, innerWidth]);
          return (
            <>
              {shown.map((r, i) => {
                const y = i * ROW + ROW / 2;
                const color = GROUPS[r.group].mark;
                const active = hovered === i;
                return (
                  <g
                    key={r.key}
                    onMouseEnter={() => setHovered(i)}
                    onClick={() => onPick?.(r.key)}
                    className={onPick ? "cursor-pointer" : undefined}
                    opacity={hovered === null || active ? 1 : 0.45}
                  >
                    <rect x={-margin.left} y={i * ROW} width={innerWidth + margin.left + margin.right} height={ROW} fill={active ? "oklch(var(--bc) / 0.04)" : "transparent"} rx={10} />
                    <text x={-12} y={y - 3} textAnchor="end" className="fill-base-content text-[12px] font-semibold">
                      {r.label.length > 22 ? `${r.label.slice(0, 21)}…` : r.label}
                    </text>
                    <text x={-12} y={y + 11} textAnchor="end" className="fill-base-content/60 font-mono text-[10.5px]">
                      {r.sub}
                    </text>
                    <line x1={x(r.before)} x2={x(r.after)} y1={y} y2={y} stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
                    <circle cx={x(r.before)} cy={y} r={5} fill="oklch(var(--b1))" stroke={MUTED_MARK} strokeWidth={2.5} />
                    <circle cx={x(r.after)} cy={y} r={active ? 7 : 6} fill={color} stroke="oklch(var(--b1))" strokeWidth={2} />
                    <text x={Math.max(x(r.before), x(r.after)) + 12} y={y + 4} className="fill-base-content text-[12px] font-semibold tabular-nums">
                      {formatRate(r.after)}
                    </text>
                  </g>
                );
              })}
              <BottomAxis labels={x.ticks(4).map((t) => ({ x: x(t), text: formatRate(t) }))} />
            </>
          );
        }}
      </ChartFrame>
      {rows.length > MAX_ROWS && <p className="text-xs text-base-content/60">The {MAX_ROWS} biggest changes of {rows.length}; every one is in the list below.</p>}
    </div>
  );
};

// ── Your imports, by what it does to them ──
// One bar across the whole catalog, a segment per group, unaffected imports a quiet gray

export const CatalogShare = ({ counts, total }: { counts: Record<ImpactGroup, number>; total: number }) => {
  const unaffected = Math.max(0, total - GROUP_ORDER.reduce((sum, g) => sum + counts[g], 0));
  const parts = [...GROUP_ORDER.filter((g) => counts[g]).map((g) => ({ id: g, n: counts[g], color: GROUPS[g].mark, label: GROUPS[g].label })), { id: "none", n: unaffected, color: "oklch(var(--bc) / 0.1)", label: "Not affected" }].filter((p) => p.n);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex h-3 w-full gap-[3px] overflow-hidden rounded-full" role="img" aria-label={parts.map((p) => `${p.label}: ${p.n}`).join(", ")}>
        {parts.map((p) => (
          <span key={p.id} className="h-full rounded-full first:rounded-l-full" style={{ width: `${(p.n / Math.max(1, total)) * 100}%`, minWidth: 6, background: p.color }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/70">
        {parts.map((p) => (
          <li key={p.id} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} aria-hidden />
            {p.label} <span className="font-semibold tabular-nums text-base-content">{p.n.toLocaleString("en-US")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── Where it lands ──
// Each country of origin it hits: a round bar of its imports by group, and what the confirmed
// changes add (or take off) per shipment

export interface OriginRow {
  code: string;
  name: string;
  flag: string;
  counts: Partial<Record<ImpactGroup, number>>;
  deltaUsd: number;
}

export const OriginBars = ({ rows, onPick }: { rows: OriginRow[]; onPick?: (country: string) => void }) => {
  const total = (r: OriginRow) => GROUP_ORDER.reduce((sum, g) => sum + (r.counts[g] ?? 0), 0);
  const max = Math.max(1, ...rows.map(total));
  return (
    <ul className="flex flex-col gap-1">
      {rows.slice(0, 8).map((r) => (
        <li key={r.code}>
          <button
            type="button"
            onClick={() => onPick?.(r.code)}
            className="grid w-full grid-cols-[8.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-tt-soft"
          >
            <span className="truncate text-sm text-base-content">
              <span aria-hidden>{r.flag}</span> {r.name}
            </span>
            <span className="flex h-2.5 gap-[2px]" aria-label={`${total(r)} imports`}>
              {GROUP_ORDER.filter((g) => r.counts[g]).map((g) => (
                <span key={g} className="h-full rounded-full" style={{ width: `${((r.counts[g] ?? 0) / max) * 100}%`, minWidth: 6, background: GROUPS[g].mark }} />
              ))}
            </span>
            <span className={`text-right text-xs font-semibold tabular-nums ${r.deltaUsd > 0.5 ? "text-error" : r.deltaUsd < -0.5 ? "text-success" : "text-base-content/60"}`}>
              {Math.abs(r.deltaUsd) > 0.5 ? compactMoney(r.deltaUsd, true) : `${total(r)}`}
            </span>
          </button>
        </li>
      ))}
      {rows.length > 8 && <li className={`${tt.eyebrow()} px-2 pt-1`}>and {rows.length - 8} more countries</li>}
    </ul>
  );
};
