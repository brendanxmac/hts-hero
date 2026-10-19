"use client";

import { ReactNode, useMemo } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { addDays } from "../../../../tariffs/engine-v2/history";
import { shortDate } from "../../../duty-calculator/rate-history/format";
import { formatRate } from "../../formatRate";
import { signedRate } from "../../impact/format";
import { useInsights } from "../../insights/InsightsContext";
import { FilterState } from "../../filters";
import { shortProgram } from "../../report";
import { importsFilter, useShowInImports } from "../shared";
import {
  averageMove,
  breakdown,
  CatalogScale,
  concentration,
  importMoves,
  InsightsInput,
  topTenthShare,
} from "../lib/data";

// What stands out about the catalog, in four plain facts: the average rate and how it moved,
// the tariff behind most of the duty, then what matters at the catalog's size (the one import
// that pays most, where most imports come from, or how few imports carry the duty), and the
// latest change

type Tone = "primary" | "error" | "success" | "neutral";

interface Fact {
  eyebrow: string;
  value: string;
  tone: Tone;
  text: ReactNode;
  // The imports it's about, in Your Imports
  filters?: FilterState | null;
}

const percent = (share: number) => `${Math.round(share * 100)}%`;

export const Takeaways = ({ input, scale }: { input: InsightsInput; scale: CatalogScale }) => {
  const { changes } = useInsights();
  const show = useShowInImports();
  const facts = useMemo((): Fact[] => {
    const moves = importMoves(input);
    const avg = averageMove(moves);
    const programs = breakdown(input, "program").sort((a, b) => b.dutyShare - a.dutyShare);
    const driver = programs[0];
    const list: Fact[] = [
      {
        eyebrow: "Average rate",
        value: formatRate(avg.now),
        tone: avg.change > 0.005 ? "error" : avg.change < -0.005 ? "success" : "primary",
        text:
          Math.abs(avg.change) < 0.005 ? (
            <>The same as a year ago, across your {moves.length.toLocaleString("en-US")} imports.</>
          ) : (
            <>
              {signedRate(avg.change)} from {formatRate(avg.then)} a year ago, across your{" "}
              {moves.length.toLocaleString("en-US")} imports.
            </>
          ),
      },
    ];
    if (driver) {
      list.push({
        eyebrow: "Biggest driver",
        value: percent(driver.dutyShare),
        tone: "primary",
        filters: importsFilter("program", driver.key),
        text: (
          <>
            of your duty comes from <b className="text-base-content">{driver.label}</b>
            {driver.key !== "Base duty" ? `, on ${driver.imports.toLocaleString("en-US")} of your imports` : ""}.
          </>
        ),
      });
    }
    if (scale === "few") {
      const top = [...moves].sort((a, b) => b.now - a.now)[0];
      if (top)
        list.push({
          eyebrow: "Highest rate",
          value: formatRate(top.now),
          tone: "neutral",
          text: (
            <>
              on {top.product.entry.element.htsno} from {top.product.entry.country.flag} {top.product.entry.country.name}.
            </>
          ),
        });
    } else {
      const origins = concentration(breakdown(input, "country"));
      if (origins.top && origins.top.importShare < 0.25)
        list.push({
          eyebrow: "Origins",
          value: origins.countries.toLocaleString("en-US"),
          tone: "neutral",
          text: (
            <>
              countries supply your imports, none more than {percent(origins.top.importShare)} ({origins.top.label}). A spread like this limits what one
              country&apos;s tariffs can do.
            </>
          ),
        });
      else if (origins.top)
        list.push({
          eyebrow: "Top origin",
          value: percent(origins.top.importShare),
          tone: "neutral",
          filters: importsFilter("country", origins.top.key),
          text: (
            <>
              of your imports come from {origins.top.label}. {origins.forEighty.toLocaleString("en-US")} of your{" "}
              {origins.countries.toLocaleString("en-US")} countries make up 80%.
            </>
          ),
        });
    }
    if (scale === "many") {
      const tenth = topTenthShare(input);
      list.push({
        eyebrow: "Concentration",
        value: percent(tenth.share),
        tone: "neutral",
        text: <>of your duty is carried by your top {tenth.count.toLocaleString("en-US")} imports, a tenth of your catalog.</>,
      });
    } else {
      const since = addDays(input.today, -90);
      const keys = new Set(input.products.map((p) => p.key));
      const recent = changes.filter((c) => keys.has(c.product.key) && c.date > since && c.date <= input.today);
      const hit = new Set(recent.map((c) => c.product.key)).size;
      const latest = recent[0];
      list.push({
        eyebrow: "Rate changes, last 90 days",
        value: hit.toLocaleString("en-US"),
        tone: hit ? "error" : "success",
        text: latest ? (
          <>
            The latest on {shortDate(latest.date, true)}
            {latest.after.changes[0] ? ` (${shortProgram(latest.after.changes[0].name)})` : ""}.
          </>
        ) : (
          <>imports had a rate change. Nothing has moved on your catalog in three months.</>
        ),
      });
    }
    return list;
  }, [input, scale, changes]);

  return (
    <section className={`${tt.panel} grid gap-px overflow-hidden bg-base-300 sm:grid-cols-2 xl:grid-cols-4`} aria-label="What stands out">
      {facts.map((f) => (
        <div key={f.eyebrow} className="flex flex-col gap-2 bg-base-100 px-6 py-5">
          <span className={tt.eyebrow(f.tone === "neutral" ? "primary" : f.tone)}>{f.eyebrow}</span>
          <span className={tt.metric}>{f.value}</span>
          <p className="m-0 text-sm text-base-content/70">{f.text}</p>
          {f.filters && (
            <button type="button" onClick={() => show(f.filters!)} className={`${ui.link} mt-auto inline-flex items-center gap-1 self-start text-sm`}>
              Show in Your Imports
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
      ))}
    </section>
  );
};
