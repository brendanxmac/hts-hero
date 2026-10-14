"use client";

import { barWidth } from "@/components/ui/charts/kit";
import { SUCCESS_MARK, WARNING_MARK } from "@/components/ui/theme";
import * as tt from "@/components/ui/styles/tracker";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { formatMoney } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";
import { Adjustments } from "./Adjustments";
import { DeltaChip, useTotalDelta } from "./totalDelta";

// The Possible Adjustments tab. On top, pinned while scrolling: the total with the adjustments,
// how much they could save (or add), and one bar showing the total with the part they take off
// striped, against the total before any adjustment (with a chip for the last answer). Below, the trade preference and the questions, answered in place.
export const AdjustmentsTab = ({ f, result }: { f: TariffFinder; result: CalculationResult }) => {
  const delta = useTotalDelta(result.totalDuty);
  const before = f.unadjustedResult?.totalDuty ?? result.totalDuty;
  const after = result.totalDuty;
  const change = after - before;
  const changed = Math.abs(change) >= 0.005;
  const scale = Math.max(before, after, 0.01);
  const pctChange = before > 0 ? Math.round((Math.abs(change) / before) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-20 z-10 -mx-2 rounded-2xl border border-base-300 bg-base-100/95 px-6 py-5 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-base-content/60">Total duty with your adjustments</span>
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className={`${tt.display} text-4xl font-semibold leading-none tabular-nums text-base-content`}>{formatMoney(after)}</span>
              {changed && <span className="text-base tabular-nums text-base-content/40 line-through decoration-base-content/30">{formatMoney(before)}</span>}
              <DeltaChip delta={delta} />
            </span>
          </div>
          <div aria-live="polite" className="text-right">
            {changed ? (
              <span className={`inline-flex items-baseline gap-2 rounded-2xl px-4 py-2 ${change < 0 ? "bg-success/10" : "bg-warning/10"}`}>
                <span className={`${tt.display} text-2xl font-semibold tabular-nums ${change < 0 ? "text-success" : "text-warning"}`}>
                  {change < 0 ? "−" : "+"}
                  {formatMoney(Math.abs(change))}
                </span>
                <span className="text-sm text-base-content/70">
                  {change < 0 ? "could be saved" : "added"}
                  {pctChange !== null && ` · ${pctChange}%`}
                </span>
              </span>
            ) : (
              <span className="text-sm text-base-content/60">No adjustments yet. Check any that apply below.</span>
            )}
          </div>
        </div>

        {/* One bar on one scale (runtime widths, DESIGN_SYSTEM §10): the total with adjustments,
            then the part they take off (striped) or add */}
        <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-tt-soft" aria-hidden>
          <span className="h-full bg-primary transition-[width] duration-500 ease-out" style={{ width: barWidth(Math.min(before, after), scale) }} />
          <span
            className="h-full transition-[width] duration-500 ease-out"
            style={{
              width: barWidth(Math.abs(change), scale),
              backgroundImage: `repeating-linear-gradient(-45deg, ${change < 0 ? SUCCESS_MARK : WARNING_MARK} 0 4px, transparent 4px 8px)`,
              backgroundColor: `color-mix(in oklch, ${change < 0 ? SUCCESS_MARK : WARNING_MARK} 18%, transparent)`,
            }}
          />
        </div>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs text-base-content/60">
          <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden />
              With adjustments <b className="font-semibold tabular-nums text-base-content">{formatMoney(after)}</b>
            </span>
            {changed && (
              <span className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-sm ${change < 0 ? "bg-success/60" : "bg-warning/60"}`} aria-hidden />
                {change < 0 ? "Could be saved" : "Added"} <b className="font-semibold tabular-nums text-base-content">{formatMoney(Math.abs(change))}</b>
              </span>
            )}
          </span>
          <span>
            Before adjustments <b className="font-semibold tabular-nums text-base-content">{formatMoney(before)}</b>
          </span>
        </div>
      </div>
      {result.questions.length || result.availablePreferences.length ? (
        <Adjustments f={f} result={result} />
      ) : (
        <p className="m-0 text-sm text-base-content/70">
          <b className="text-base-content">No adjustments for this import.</b> No trade program or exemption question changes this total.
        </p>
      )}
    </div>
  );
};
