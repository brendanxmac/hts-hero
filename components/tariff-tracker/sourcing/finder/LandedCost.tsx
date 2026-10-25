"use client";

import { useMemo, useState } from "react";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { Module } from "@/components/ui/Module";
import { FEES_COLOR } from "@/components/ui/theme";
import * as tt from "@/components/ui/styles/tracker";
import { programColors } from "../../programColors";
import { CountryName, rate } from "./bits";
import { ChartDialog, DataTable, ExpandButton } from "./ChartDialog";
import { SourcingRow } from "./model";

// What it costs to land a shipment from the largest producers, as a share of its value: each tariff in
// the calculator's colors, then freight and insurance, on one scale. Its dialog has every country
// that makes or ships it.

const SHOWN = 8;
const FREIGHT = "Freight & insurance";

// The bars, cheapest to land first, for any set of countries
const Bars = ({ rows, selected, onSelect }: { rows: SourcingRow[]; selected: string | null; onSelect: (code: string) => void }) => {
  const colors = useMemo<Record<string, string>>(() => ({ ...programColors(rows), [FREIGHT]: FEES_COLOR }), [rows]);
  const max = Math.max(...rows.map((r) => r.landedPct), 0.01);
  const keys = Array.from(new Set(rows.flatMap((r) => [...r.parts.map((p) => p.key), ...(r.freightUsed > 0 ? [FREIGHT] : [])])));
  return (
    <>
      <ul className="m-0 mb-4 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs text-base-content/70" aria-label="What the bars are made of">
        {keys.map((key) => (
          <li key={key} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: colors[key] }} aria-hidden />
            {key}
          </li>
        ))}
      </ul>
      <ol className="m-0 flex list-none flex-col gap-1 p-0">
        {rows.map((r) => (
          <li key={r.country.code}>
            <button
              type="button"
              onClick={() => onSelect(r.country.code)}
              className={`grid w-full grid-cols-[minmax(0,10rem)_minmax(0,1fr)_4.5rem] items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors ${selected === r.country.code ? "bg-primary/5" : "hover:bg-tt-soft"}`}
            >
              <span className="flex min-w-0 flex-col">
                <CountryName row={r} strong={false} />
                {r.dutyNote && <span className={`truncate text-[11px] ${r.dutyIncomplete ? "text-warning" : "text-success"}`} title={r.dutyNote}>{r.dutyNote}</span>}
              </span>
              <StackedBar
                parts={[...r.parts.map((p) => ({ label: p.key, amount: p.pct, color: colors[p.key] })), ...(r.freightUsed > 0 ? [{ label: FREIGHT, amount: r.freightUsed, color: FEES_COLOR }] : [])]}
                formatValue={rate}
                size="sm"
                shape="pill"
                legend={false}
                fill={r.landedPct / max}
              />
              <span className="text-right font-semibold tabular-nums text-base-content">
                {rate(r.landedPct)}
                {r.dutyIncomplete && <span className="text-warning">+</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </>
  );
};

export const LandedCost = ({ rows, selected, onSelect }: { rows: SourcingRow[]; selected: string | null; onSelect: (code: string) => void }) => {
  const [open, setOpen] = useState(false);
  const candidates = useMemo(() => rows.filter((r) => r.candidate), [rows]);
  // The largest producers (rows come most capacity first), cheapest to land first
  const shown = useMemo(() => candidates.slice(0, SHOWN).sort((a, b) => a.landedPct - b.landedPct), [candidates]);
  const all = useMemo(() => [...candidates].sort((a, b) => a.landedPct - b.landedPct), [candidates]);
  const table: DataTable = {
    columns: ["Country", "Landed cost", "Duty", "Freight & insurance", "Trade agreement", ...Array.from(new Set(all.flatMap((r) => r.parts.map((p) => p.key))))],
    rows: all.map((r) => {
      const parts = Array.from(new Set(all.flatMap((x) => x.parts.map((p) => p.key))));
      return [
        r.country.name,
        rate(r.landedPct),
        rate(r.dutyPct),
        r.byLand ? "by land" : `${rate(r.freightUsed)}${r.freightEstimated ? " (typical)" : ""}`,
        r.agreement?.name ?? "—",
        ...parts.map((k) => {
          const part = r.parts.find((p) => p.key === k);
          return part ? rate(part.pct) : "—";
        }),
      ];
    }),
  };
  return (
    <Module
      title="Landed Cost"
      subtitle="Duty and freight on this product as a share of its value, for its largest producers."
      actions={<ExpandButton onClick={() => setOpen(true)} label="Every country" />}
    >
      <Bars rows={shown} selected={selected} onSelect={onSelect} />
      <p className={`${tt.caption} mt-3`}>
        A bar of freight alone is a duty-free origin (often through a trade agreement, whose rules of origin the goods must meet). A &ldquo;+&rdquo; means the tariff engine
        couldn&apos;t price this code&apos;s base rate from there, so the duty shown leaves it out. Freight is what Census records for this code by sea and air from each
        country over the last 12 months; where too little came that way it&apos;s the typical share for this code. Canada and Mexico ship mostly by land, which Census records
        almost no charges for.
      </p>
      <ChartDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Landed Cost of This Product, Every Country"
        subtitle="Every country that makes it or ships it to the US, cheapest to land first, with each tariff and freight."
        source="Duty: HTS Hero's tariff engine, today's rates, on a standard shipment. Freight and insurance: U.S. Census Bureau import charges for this code, last 12 months (the typical share where too little came by sea or air)."
        chart={<Bars rows={all} selected={selected} onSelect={onSelect} />}
        table={table}
      />
    </Module>
  );
};
