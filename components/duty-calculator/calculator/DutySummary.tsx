"use client";

import { SparklesIcon } from "@heroicons/react/20/solid";
import { CalculationResult } from "@/tariffs/engine-v2/types";

const pct = (n: number) => formatPct(Math.round(n * 100) / 100);
import { formatMoney, formatPct } from "../lib/format";
import { summarySentences } from "../lib/summary";
import { TariffFinder } from "../lib/useTariffFinder";
import { useCanSeeWhy, WhyLocked } from "./WhyGate";

// The duty breakdown in a few plain sentences, at the top of the Duty Breakdown card: what's owed,
// what it's made of, why the biggest tariff applies, what was ruled out, what could lower it, and
// how it's moved. It all takes a free account (the "why" is the product's edge), and none of it is
// rendered for anyone signed out: a short pitch takes its place (the full one is AccountCta,
// above the totals).

export const DutySummary = ({ f, result, bestSaving }: { f: TariffFinder; result: CalculationResult; bestSaving: number }) => {
  const { canSee, loading } = useCanSeeWhy();
  const rate = f.customsValue > 0 ? (result.totalDuty / f.customsValue) * 100 : 0;
  const lead = `${f.country?.name ?? "These"} goods under ${result.htsCode} owe ${formatMoney(result.totalDuty)} in duty on ${formatMoney(f.customsValue)} (${pct(rate)}), plus ${formatMoney(result.totalFees)} in customs fees: ${formatMoney(result.totalDuty + result.totalFees)} due at entry.`;
  return (
    <div className="mx-5 mb-3 mt-2 flex flex-col gap-1.5 rounded-lg bg-base-200/60 px-4 py-3 sm:mx-6" aria-labelledby="duty-summary-title">
      <h4 id="duty-summary-title" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
        <SparklesIcon className="h-3.5 w-3.5" aria-hidden />
        In plain English
      </h4>
      {loading ? null : canSee ? (
        <p className="text-sm leading-relaxed text-base-content">
          {lead} {summarySentences(f, result, bestSaving).join(" ")}
        </p>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-base-content">
            Fully understand this estimate, and discover ways you could lower your duty, with a free account. It takes less than 30 seconds.
          </p>
          <WhyLocked label="Explain my estimate, free" where="why-summary" />
        </>
      )}
    </div>
  );
};
