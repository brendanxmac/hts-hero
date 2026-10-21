"use client";

import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { shortDate } from "../../../duty-calculator/rate-history/format";
import { formatRate } from "../../formatRate";
import { signedRate } from "../../impact/format";
import { useInsights } from "../../insights/InsightsContext";
import { shortProgram } from "../../report";
import { useTrackerNav } from "../../shell/TrackerNav";
import { relativeDays } from "../../impact/format";
import { InsightsInput } from "../lib/data";
import { InsightPanel, NavArrow } from "../shared";

// The imports most recently hit by a tariff change, newest first: when, what, and the rate
// before and after

export const RecentlyHit = ({ input, count = 8 }: { input: InsightsInput; count?: number }) => {
  const { changes, range } = useInsights();
  const nav = useTrackerNav();
  const keys = new Set(input.products.map((p) => p.key));
  const recent = changes.filter((c) => keys.has(c.product.key) && c.date <= input.today).slice(0, count);
  const latest = recent[0];
  const sameDay = latest ? recent.filter((c) => c.date === latest.date).length : 0;

  return (
    <InsightPanel
      id="ti-recent"
      title="Most Recently Affected"
      subtitle="The latest tariff changes on your imports, newest first"
      lesson={
        latest ? (
          <>
            Your last change was {relativeDays(latest.date, input.today)}: {sameDay === 1 ? "one import" : `${sameDay} imports`} moved on {shortDate(latest.date, true)}
            {latest.after.changes[0] ? <>, from <b>{shortProgram(latest.after.changes[0].name)}</b></> : null}.
          </>
        ) : undefined
      }
    >
      {recent.length === 0 ? (
        <p className="m-0 text-sm text-base-content/70">No rate on your imports has changed since {shortDate(range.from, true)}.</p>
      ) : (
        <ul className="-mx-2 m-0 flex list-none flex-col p-0">
          {recent.map((c) => (
            <li key={`${c.product.key}-${c.date}`}>
              <button
                type="button"
                onClick={() => nav.openProduct(c.product.key)}
                className="group grid w-full grid-cols-[4.5rem_minmax(0,1fr)_auto_1rem] items-center gap-3 rounded-xl px-2 py-2 text-left text-sm hover:bg-tt-soft focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="text-xs tabular-nums text-base-content/60">{shortDate(c.date, true)}</span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className={`${mono.className} font-semibold text-base-content`}>{c.product.entry.element.htsno}</span>
                    <span className="truncate text-base-content">
                      {c.product.entry.country.flag} {c.product.entry.country.name}
                    </span>
                  </span>
                  {c.after.changes[0] && <span className="block truncate text-xs text-base-content/60">{c.after.changes.map((l) => shortProgram(l.name)).filter((v, i, a) => a.indexOf(v) === i).join(", ")}</span>}
                </span>
                <span className="flex items-center gap-2 tabular-nums">
                  <span className="text-xs text-base-content/60">
                    {formatRate(c.before.pct)} → <b className="text-base-content">{formatRate(c.after.pct)}</b>
                  </span>
                  <span className={tt.chip(c.deltaPct > 0 ? "error" : "success")}>{signedRate(c.deltaPct)}</span>
                </span>
                <NavArrow />
              </button>
            </li>
          ))}
        </ul>
      )}
    </InsightPanel>
  );
};
