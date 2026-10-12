"use client";

import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { formatMoney, formatPct } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";
import { slices } from "../results/slices";
import { DutyTable } from "./DutyTable";
import { DeltaChip, useTotalDelta } from "./totalDelta";

// The answer: the total duty on this import and its key numbers, where the money goes, then how
// it adds up (DutyTable)

const rate = (pct?: number) => (pct === undefined ? "—" : formatPct(Math.round(pct * 100) / 100));

// A supporting figure beside the total: plain text, so the total stays the one big number
const Stat = ({ label, value, note }: { label: string; value: string; note?: string }) => (
  <div className="flex min-w-0 flex-col gap-1 border-l border-base-300 pl-5">
    <span className="text-xs font-medium text-base-content/60">{label}</span>
    <span className={`${tt.display} text-2xl font-semibold tabular-nums text-base-content xl:text-[1.75rem]`}>{value}</span>
    {note && <span className="truncate text-xs text-base-content/50">{note}</span>}
  </div>
);

// The Results tab: one full-width box. The effective duty rate (the one big number) and the
// dollar figures across the top, where the
// money goes as a bar, every line with its share, and a nudge to the Possible Adjustments tab.
// adjustments: how many open adjustments could change the total; the nudge opens their tab
export const AnswerCard = ({
  f,
  result,
  adjustments,
  onOpenAdjustments,
}: {
  f: TariffFinder;
  result: CalculationResult;
  adjustments: number;
  onOpenAdjustments: () => void;
}) => {
  const delta = useTotalDelta(result.totalDuty);
  // The trade program claimed, if any
  const preference = result.claimedPreference ? result.availablePreferences.find((p) => p.symbol === result.claimedPreference) : undefined;
  const dutyParts = slices(result).filter((s) => s.amount > 0 && s.label !== "Customs fees");
  const pct = f.customsValue > 0 ? (result.totalDuty / f.customsValue) * 100 : 0;
  const total = result.totalDuty + result.totalFees;

  return (
    <div aria-live="polite" className="flex flex-col gap-7">
      <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:gap-12">
        <div className="flex flex-col gap-2">
          <span id="dc-total" className="text-sm font-semibold text-base-content/70">
            Effective duty rate on this import
          </span>
          <span className={`${tt.display} text-5xl font-semibold leading-none tracking-tight text-base-content tabular-nums lg:text-6xl`}>
            {rate(pct)}
          </span>
          <span className="flex flex-wrap items-center gap-2">
            {preference && (
              <span className={`${tt.chip("success")} gap-1`}>
                <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden />
                {preference.symbol} · {preference.name} applied
              </span>
            )}
            <DeltaChip delta={delta} />
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
          <Stat label="Total duty" value={formatMoney(result.totalDuty)} note={`on ${formatMoney(f.customsValue)} customs value`} />
          <Stat label="Customs fees" value={formatMoney(result.totalFees)} note={result.fees.length ? result.fees.map((fee) => fee.id.toUpperCase()).join(" + ") : "none on this entry"} />
          <Stat label="Duty + fees" value={formatMoney(total)} note="due at entry" />
          <Stat label="Landed cost" value={formatMoney(f.customsValue + total)} note="goods, duty and fees" />
        </div>
      </div>

      {dutyParts.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
            {dutyParts.map((s) => (
              // Runtime width and theme chart color (DESIGN_SYSTEM §10)
              <span key={s.label} className="h-full" style={{ width: `${(s.amount / result.totalDuty) * 100}%`, background: s.color }} />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-base-content/60">
            {dutyParts.map((s) => (
              <li key={s.label} className="flex items-center gap-1.5">
                {/* Theme chart color (DESIGN_SYSTEM §10) */}
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
                {s.label} <b className="tabular-nums font-semibold text-base-content/80">{Math.round((s.amount / result.totalDuty) * 100)}%</b>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DutyTable result={result} customsValue={f.customsValue} extraQuestions={f.unadjustedResult?.questions} />

      {adjustments > 0 && (
        <button
          type="button"
          onClick={onOpenAdjustments}
          className="flex items-center justify-between gap-3 rounded-2xl bg-primary/5 px-5 py-3.5 text-left text-sm transition-colors hover:bg-primary/10"
        >
          <span className="text-base-content">
            <b>
              {adjustments} possible {adjustments === 1 ? "adjustment" : "adjustments"}
            </b>{" "}
            could change this total.
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary">
            Review
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </span>
        </button>
      )}
    </div>
  );
};
