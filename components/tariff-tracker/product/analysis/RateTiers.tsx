"use client";

import { useState } from "react";
import { ChartCaption } from "@/components/duty-calculator/country-rate-charts/ChartCaption";
import { figureCard } from "@/components/duty-calculator/country-rate-charts/scale";
import { formatRate } from "../../formatRate";
import { BASE_PART, shortProgram } from "../../report";
import { RateTier } from "./analysis";

// Every distinct rate, lowest first: the tariffs that make it up as a bar on one scale, and the
// flag of every origin that pays it. Ties read at a glance here, however many countries share
// a rate. Selecting a flag selects that origin.

const FLAGS_SHOWN = 24;

export const RateTiers = ({
  tiers,
  colors,
  selected,
  onSelect,
}: {
  tiers: RateTier[];
  colors: Record<string, string>;
  selected: string | null;
  onSelect: (code: string) => void;
}) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const max = Math.max(...tiers.map((t) => t.pct), 1);
  return (
    <figure className={figureCard}>
      <ChartCaption title="Rate tiers">
        {tiers.length} different rates across every origin, lowest first.
      </ChartCaption>
      <ol className="mt-4 flex flex-col divide-y divide-base-300 tabular-nums">
        {tiers.map((tier) => {
          const open = expanded[tier.pct];
          const shown = open ? tier.origins : tier.origins.slice(0, FLAGS_SHOWN);
          const yours = tier.origins.some((o) => o.isOrigin);
          return (
            <li key={tier.pct} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 py-3 md:grid-cols-[4.5rem_minmax(0,14rem)_minmax(0,1fr)] md:items-center">
              <div className="flex flex-col">
                <span className={`text-lg font-semibold ${yours ? "text-primary" : "text-base-content"}`}>
                  {formatRate(tier.pct)}
                </span>
                <span className="text-xs text-base-content/60">
                  {tier.origins.length} {tier.origins.length === 1 ? "origin" : "origins"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="flex h-2.5 overflow-hidden rounded-full bg-base-300" aria-hidden>
                  <span className="flex h-full" style={{ width: `${(tier.pct / max) * 100}%` }}>
                    {tier.parts.map((p) => (
                      <span key={p.key} className="h-full" style={{ width: `${(p.pct / tier.pct) * 100}%`, background: colors[p.key] }} />
                    ))}
                  </span>
                </span>
                <span className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-xs text-base-content/70">
                  {tier.parts.length === 0
                    ? "Duty free"
                    : tier.parts.map((p) => (
                        <span key={p.key} className="inline-flex items-center gap-1 whitespace-nowrap">
                          <span className="h-2 w-2 rounded-sm" style={{ background: colors[p.key] }} aria-hidden />
                          {p.key === BASE_PART ? "Base" : shortProgram(p.key)}
                        </span>
                      ))}
                </span>
              </div>
              <div className="col-span-2 flex flex-wrap items-center gap-1 md:col-span-1">
                {shown.map((o) => (
                  <button
                    key={o.country.code}
                    type="button"
                    title={`${o.country.name}${o.isOrigin ? " (your origin)" : ""}`}
                    aria-label={o.country.name}
                    aria-pressed={selected === o.country.code}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-base leading-none transition-colors hover:bg-base-200 ${
                      o.isOrigin ? "ring-2 ring-primary" : selected === o.country.code ? "ring-2 ring-success" : ""
                    }`}
                    onClick={() => onSelect(o.country.code)}
                  >
                    {o.country.flag}
                  </button>
                ))}
                {tier.origins.length > FLAGS_SHOWN && (
                  <button
                    type="button"
                    className="rounded-full bg-base-200 px-2 py-0.5 text-xs font-medium text-base-content/70 transition-colors hover:text-base-content"
                    onClick={() => setExpanded((e) => ({ ...e, [tier.pct]: !open }))}
                  >
                    {open ? "Show fewer" : `+${tier.origins.length - FLAGS_SHOWN} more`}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </figure>
  );
};
