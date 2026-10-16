"use client";

import { useMemo, useState } from "react";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as tt from "@/components/ui/styles/tracker";
import { formatRate } from "../../formatRate";
import { BarList } from "../charts";
import { breakdown, chapterName, CatalogScale, DimensionId, estimatedValues, InsightsInput, METRICS, takeaway } from "../lib/data";
import { groupColors, InsightPanel, ShowAll } from "../shared";

// Where the catalog's duty comes from: the tariffs that make up its average rate, and each
// tariff's, country's or chapter's share of the duty. A handful of imports only splits by tariff.

type View = Extract<DimensionId, "program" | "country" | "chapter">;

const percent = (share: number) => `${Math.round(share * 1000) / 10}%`;

export const DutySources = ({ input, scale }: { input: InsightsInput; scale: CatalogScale }) => {
  const [view, setView] = useState<View>("program");
  const [all, setAll] = useState(false);
  const rows = useMemo(() => breakdown(input, view).filter((r) => r.dutyShare > 0 || r.avgRate > 0).sort((a, b) => b.dutyShare - a.dutyShare), [input, view]);
  const programs = useMemo(() => (view === "program" ? rows : breakdown(input, "program")), [input, view, rows]);
  const colors = groupColors(rows, view, false);
  const programColors = groupColors(programs, "program", false);
  const n = input.products.length || 1;
  // The catalog's average rate, split by what each tariff adds to it
  const average = programs
    .map((r) => ({ label: r.label, amount: (r.avgRate * r.imports) / n, color: programColors[r.key] }))
    .filter((p) => p.amount > 0.005)
    .sort((a, b) => b.amount - a.amount);
  const averageRate = average.reduce((s, p) => s + p.amount, 0);
  const estimated = estimatedValues(input.products);
  const shown = all ? rows : rows.slice(0, 8);

  return (
    <InsightPanel
      id="ti-sources"
      title="Where Your Duty Comes From"
      subtitle="The tariffs, countries and chapters behind what you pay"
      action={
        scale !== "few" ? (
          <SegmentedControl<View>
            label="Split by"
            size="sm"
            value={view}
            onChange={setView}
            options={[
              { id: "program", label: "Tariff" },
              { id: "country", label: "Country" },
              { id: "chapter", label: "Chapter" },
            ]}
          />
        ) : undefined
      }
      lesson={takeaway(rows, METRICS.dutyShare, view)}
    >
      {view === "program" && averageRate > 0 && (
        <div className={`${tt.tile} flex flex-col gap-3 px-4 py-4`}>
          <p className="m-0 text-sm text-base-content/70">
            Your average rate, <b className="text-base-content">{formatRate(averageRate)}</b>, is made of
          </p>
          <StackedBar parts={average} formatValue={formatRate} shape="pill" size="sm" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium text-base-content/60">
          <span>{view === "program" ? "Tariff" : view === "country" ? "Country" : "HTS chapter"}</span>
          <span>Share of duty</span>
        </div>
        <BarList
          data={shown.map((r) => ({
            key: r.key,
            label:
              view === "chapter" ? (
                <span title={chapterName(r.key, input.sections)}>
                  {r.label} <span className="text-base-content/60">{chapterName(r.key, input.sections) ?? ""}</span>
                </span>
              ) : (
                r.label
              ),
            text: r.label,
            value: r.dutyShare,
            display: percent(r.dutyShare),
            note: view === "program" ? `adds ${formatRate(r.avgRate)}` : `${formatRate(r.avgRate)} avg`,
            color: colors[r.key],
          }))}
          labelWidth={view === "chapter" ? "13rem" : "11rem"}
        />
        {rows.length > 8 && <ShowAll more={`${rows.length - 8} more with smaller shares`} open={all} onToggle={() => setAll(!all)} />}
      </div>
      <p className="m-0 text-xs text-base-content/60">
        {view === "program" ? "“Adds” is the rate the tariff adds where it applies. " : "“Avg” is the average rate. "}
        Shares weigh each import by its value
        {estimated > 0 ? `; ${estimated.toLocaleString("en-US")} of yours use the $10,000 default until you set one.` : "."}
      </p>
    </InsightPanel>
  );
};
