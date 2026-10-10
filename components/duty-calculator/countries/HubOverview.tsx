"use client";

import { StackedBar } from "@/components/ui/charts/StackedBar";
import { CHART_COLORS, FEES_COLOR } from "@/components/ui/theme";
import * as ui from "@/components/ui/styles";
import type { HubSummary } from "@/libs/country-pages/allCountries";

// The hub at a glance: four counts (each a link to its group below) and one bar showing how all
// countries split by the most their goods face.

// Tier colors in the bar's order; "no added tariff" is the neutral last part, like fees elsewhere
const TIER_COLORS = [CHART_COLORS[2], CHART_COLORS[0], CHART_COLORS[3], CHART_COLORS[1], CHART_COLORS[4]];

export function HubOverview({
  summary,
  tiers,
  groupIds,
}: {
  summary: HubSummary;
  tiers: { label: string; count: number }[];
  // Anchors of the groups the stats link to
  groupIds: { forcedLabor: string; own: string; agreements: string; none: string };
}) {
  const stats = [
    { value: summary.forcedLabor.count, label: "Forced-labor tariff", note: "Section 301, since July 24, 2026", href: `#${groupIds.forcedLabor}` },
    { value: summary.countrySpecific.length + summary.column2.length, label: "Own tariffs or Column 2", note: [...summary.countrySpecific.map((r) => r.name), ...summary.column2].join(", "), href: `#${groupIds.own}` },
    { value: summary.withPreferences, label: "Trade agreements", note: "Agreements and preference programs", href: `#${groupIds.agreements}` },
    { value: summary.none.length, label: "No added tariff", note: "Base rate and Section 232 only", href: `#${groupIds.none}` },
  ];
  const parts = tiers.map((t, i) => ({
    label: t.label,
    amount: t.count,
    // Chart colors are runtime values from the theme (DESIGN_SYSTEM §10)
    color: t.label === "No added tariff" ? FEES_COLOR : TIER_COLORS[i % TIER_COLORS.length],
  }));

  return (
    <div className={ui.card}>
      {/* 1px gaps over the border color draw the dividers at every breakpoint */}
      <div className="grid grid-cols-2 gap-px bg-base-300 border-b border-base-300">
        {stats.map((s) => (
          <a key={s.label} href={s.href} className="group bg-base-100 p-5 transition-colors hover:bg-base-200/60">
            <div className={ui.label}>{s.label}</div>
            <div className={`${ui.metric.primaryCompact} mt-1.5 group-hover:text-primary`}>{s.value}</div>
            <div className={`${ui.caption} mt-1 line-clamp-1`}>{s.note}</div>
          </a>
        ))}
      </div>
      <div className="flex flex-col gap-3 p-5">
        <h2 className={ui.cardTitle}>All {summary.total} countries by the most their goods face</h2>
        <StackedBar parts={parts} formatValue={(n) => `${n} ${n === 1 ? "country" : "countries"}`} size="sm" />
      </div>
    </div>
  );
}
