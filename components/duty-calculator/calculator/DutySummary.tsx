"use client";

import { useState } from "react";
import { SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { formatMoney, formatPct } from "../lib/format";
import { summarySections } from "../lib/summary";
import { TariffFinder } from "../lib/useTariffFinder";
import { useCanSeeWhy } from "./WhyGate";

// The duty breakdown explained in plain English, in its own full-width box between the totals and
// the breakdown: what's
// owed, then section by section (summarySections) every charge and why, every exemption at work
// and what it switches off, the user's own adjustments, what was ruled out and what could change it. It all takes a free account (the "why" is the product's edge), and isn't
// rendered for anyone signed out: "Explain this", in the card's heading, opens the pitch instead.

const pct = (n: number) => formatPct(Math.round(n * 100) / 100);

// The first three sections show; the rest open on request, to keep the box short
const SHOWN = 3;

export const DutySummary = ({
  f,
  result,
  bestSaving,
}: {
  f: TariffFinder;
  result: CalculationResult;
  bestSaving: number;
}) => {
  const { canSee, loading } = useCanSeeWhy();
  const [all, setAll] = useState(false);
  if (loading || !canSee) return null;
  const sections = summarySections(f, result, bestSaving);
  const visible = all ? sections : sections.slice(0, SHOWN);
  const rate =
    f.customsValue > 0 ? (result.totalDuty / f.customsValue) * 100 : 0;
  const lead = `${f.country?.name ?? "These"} goods under ${result.htsCode} owe ${formatMoney(result.totalDuty)} in duty on ${formatMoney(f.customsValue)} (${pct(rate)}), plus ${formatMoney(result.totalFees)} in customs fees: ${formatMoney(result.totalDuty + result.totalFees)} due at entry.`;
  return (
    <section
      className={`${ui.card} flex flex-col gap-3 px-5 py-4 sm:px-6`}
      aria-labelledby="duty-summary-title"
    >
      <h3
        id="duty-summary-title"
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary"
      >
        <SparklesIcon className="h-3.5 w-3.5" aria-hidden />
        In plain English
      </h3>
      <p className="text-sm font-medium leading-relaxed text-base-content">
        {lead}
      </p>
      {/* Full width: the sections side by side, so the box stays short */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((section) => (
          <div key={section.title} className="flex min-w-0 flex-col gap-1">
            <h5 className="text-xs font-semibold text-base-content/60">
              {section.title}
            </h5>
            <ul className="flex list-disc flex-col gap-1 pl-4 text-sm leading-relaxed text-base-content marker:text-base-content/30">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {sections.length > SHOWN && (
        <button
          type="button"
          className="self-start text-xs font-semibold text-primary hover:underline"
          aria-expanded={all}
          onClick={() => setAll((x) => !x)}
        >
          {all
            ? "Show less"
            : `Show the full explanation (${sections
                .slice(SHOWN)
                .map((x) => x.title.toLowerCase())
                .join(", ")})`}
        </button>
      )}
    </section>
  );
};
