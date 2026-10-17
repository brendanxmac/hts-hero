"use client";

import { useMemo, useState } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { formatRate } from "../../formatRate";
import { BarList } from "../charts";
import { breakdown, concentration, InsightsInput } from "../lib/data";
import { groupColors, importsFilter, InsightPanel, ShowAll, ShowInImports, useShowInImports } from "../shared";

// How concentrated the catalog is by country of origin: each country's share of the imports and
// its average rate, the top one's share, and how few countries make up most of the catalog

const percent = (share: number) => `${Math.round(share * 100)}%`;

export const Origins = ({ input }: { input: InsightsInput }) => {
  const rows = useMemo(() => breakdown(input, "country").sort((a, b) => b.imports - a.imports || b.avgRate - a.avgRate), [input]);
  const { top, forEighty, countries } = concentration(rows);
  const colors = groupColors(rows, "country", true);
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, 8);
  const show = useShowInImports();
  const priciest = [...rows].filter((r) => r.imports >= Math.min(2, rows[0]?.imports ?? 1)).sort((a, b) => b.avgRate - a.avgRate)[0];

  return (
    <InsightPanel
      id="ti-origins"
      title="Origin Concentration"
      subtitle="Where your imports come from, and the average rate from each"
      lessonAction={top && <ShowInImports filters={importsFilter("country", (top.importShare < 0.25 && priciest ? priciest : top).key)} />}
      lesson={
        top && top.importShare < 0.25 ? (
          <>
            Your imports are spread out: no country supplies more than {percent(top.importShare)}, so one country&apos;s tariff action moves only part of your catalog.
            {priciest ? <> {priciest.label} has your highest average rate, {formatRate(priciest.avgRate)}.</> : null}
          </>
        ) : top ? (
          <>
            {percent(top.importShare)} of your imports come from {top.label}
            {top.importShare >= 0.5 ? ", so a tariff action on one country could move most of your catalog" : ""}.
            {priciest && priciest.key !== top.key ? (
              <>
                {" "}
                {priciest.label} has your highest average rate, {formatRate(priciest.avgRate)}.
              </>
            ) : null}
          </>
        ) : undefined
      }
    >
      <div className="grid grid-cols-3 gap-2.5">
        <div className={`${tt.tile} px-4 py-3`}>
          <span className="text-xs text-base-content/60">Countries</span>
          <div className={tt.metricSm}>{countries.toLocaleString("en-US")}</div>
        </div>
        <div className={`${tt.tile} px-4 py-3`}>
          <span className="text-xs text-base-content/60">Top country</span>
          <div className={tt.metricSm}>{top ? percent(top.importShare) : "—"}</div>
        </div>
        <div className={`${tt.tile} px-4 py-3`}>
          <span className="text-xs text-base-content/60">Make up 80%</span>
          <div className={tt.metricSm}>
            {forEighty.toLocaleString("en-US")} <span className="text-sm font-normal text-base-content/60">{forEighty === 1 ? "country" : "countries"}</span>
          </div>
        </div>
      </div>
      <BarList
        data={shown.map((r) => ({
          key: r.key,
          label: r.label,
          text: r.label,
          value: r.importShare,
          display: percent(r.importShare),
          note: `${formatRate(r.avgRate)} avg`,
          color: colors[r.key],
          onClick: () => show({ country: [r.key] }),
          hint: "Show these imports in Your Imports",
        }))}
        spread
      />
      {rows.length > 8 && <ShowAll more={`${rows.length - 8} more countries`} open={all} onToggle={() => setAll(!all)} />}
    </InsightPanel>
  );
};
