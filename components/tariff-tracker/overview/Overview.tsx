"use client";

import { useMemo } from "react";
import * as ui from "@/components/ui/styles";
import { TableStandIn } from "@/components/ui/stand-ins";
import { todayIso } from "../../duty-calculator/lib/format";
import { time } from "@/components/ui/charts/kit";
import { PRIMARY_MARK } from "@/components/ui/theme";
import { addDays } from "../../../tariffs/engine-v2/history";
import { AccountGate } from "../access/AccountGate";
import { formatRate } from "../formatRate";
import { averageRateSeries } from "../insights/catalogHistory";
import { useInsights } from "../insights/InsightsContext";
import { changesTeaser } from "../insights/teasers";
import { BeyondPlanTeaser } from "../plan";
import { shortProgram } from "../report";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { EmptyOverview } from "./EmptyOverview";
import { ExposureMap } from "./ExposureMap";
import { LatestChanges } from "./LatestChanges";
import { averageRate, changesLastYear, countryCount, dutyPerShipment, monthlyChanges, productsToLookAt } from "./lib/metrics";
import { Metric, MetricTiles } from "./MetricTiles";
import { NewsTape } from "./NewsTape";
import { NextStep } from "./NextStep";
import { OriginDistribution } from "./OriginDistribution";
import { ProductTiles } from "./ProductTiles";
import { PulseEvent, RatePulse } from "./RatePulse";
import { TariffHealth } from "./TariffHealth";

// The Overview (DESIGN_SYSTEM.md §15): the Tracker's home. A rotating line about the catalog, the
// path to lower duty on a strip of its own, then the numbers, potential savings, the rate pulse, where the catalog comes
// from, its exposure, the latest changes and the products to look at first. Before there are
// products, the empty overview asks for them.

// The value on a date in a series of steps
// A cell of a side-by-side row: its panel fills the cell, so the row's panels are one height
const ROW = "flex flex-col [&>*]:flex-1";

const valueOn = <T extends { date: string }>(series: T[], date: string) => [...series].reverse().find((p) => p.date <= date) ?? series[0];

export const Overview = () => {
  const t = useTracker();
  const nav = useTrackerNav();
  const insights = useInsights();
  const today = todayIso();

  const data = useMemo(() => {
    const duty = dutyPerShipment(t.products);
    const rateSeries = averageRateSeries(insights.products, insights.histories);
    const yearAgo = addDays(today, -365);
    const quarterAgo = addDays(today, -90);
    const lastYear = changesLastYear(insights.changes, today);

    const rateThen = rateSeries.length ? valueOn(rateSeries, quarterAgo).pct : 0;
    const rateNow = averageRate(t.products);
    // How much the average rate has moved in a year, as a rate (never dollars: they depend on values)
    const rateYearAgo = rateSeries.length ? valueOn(rateSeries, yearAgo).pct : rateNow;
    const yearChange = rateNow - rateYearAgo;
    const yearTone = yearChange > 0.005 ? ("error" as const) : yearChange < -0.005 ? ("success" as const) : ("neutral" as const);
    const delta = (now: number, then: number, show: (n: number) => string) =>
      Math.abs(now - then) < 0.005 ? { note: "No change in 90 days", tone: "neutral" as const } : { note: `${now > then ? "▲" : "▼"} ${show(Math.abs(now - then))} in 90 days`, tone: now > then ? ("error" as const) : ("success" as const) };
    const rateDelta = delta(rateNow, rateThen, (n) => `${Math.round(n * 100) / 100}%`);
    // The last year of a step series as points along real dates, starting with the value in force
    // a year ago
    const lastYearOf = <T extends { date: string }>(s: T[], value: (p: T) => number) =>
      s.length ? [{ x: time(yearAgo), y: value(valueOn(s, yearAgo)) }, ...s.filter((p) => p.date > yearAgo).map((p) => ({ x: time(p.date), y: value(p) }))] : [];
    const stepSpark = { sparkStep: true, sparkTo: time(today) };

    // The catalog over the last year: each import, and its country, from the day it was added
    // (imports added before dates were kept count from the start)
    const importsSparks = (() => {
      const added = t.items.map((i) => ({ date: i.addedAt ? i.addedAt.slice(0, 10) : "", country: i.country }));
      const on = (date: string) => added.filter((a) => a.date <= date);
      const days = [yearAgo, ...Array.from(new Set(added.map((a) => a.date).filter((d) => d > yearAgo && d <= today))).sort()];
      return {
        spark: days.map((d) => ({ x: time(d), y: on(d).length })),
        spark2: days.map((d) => ({ x: time(d), y: new Set(on(d).map((a) => a.country)).size })),
      };
    })();

    const metrics: Metric[] = [
      {
        label: "Rate change, 12 months",
        value: `${yearChange > 0.005 ? "+" : yearChange < -0.005 ? "−" : ""}${formatRate(Math.abs(yearChange))}`,
        tone: yearTone === "neutral" ? undefined : yearTone,
        note: yearTone === "neutral" ? "Average rate unchanged" : `Average rate ${formatRate(rateYearAgo)} → ${formatRate(rateNow)}`,
        noteTone: "neutral",
        spark: lastYearOf(rateSeries, (p) => p.pct),
        sparkTone: yearTone === "error" ? "error" : "primary",
        ...stepSpark,
        info: (
          <>
            How much the average duty rate on your imports has moved since this day last year: today&apos;s average ({formatRate(rateNow)}) minus a year
            ago ({formatRate(rateYearAgo)}). The line is that average over the last 12 months; each step is a day a tariff change landed on one of your
            imports. Every import counts the same, whatever its value.
          </>
        ),
      },
      {
        label: "Average rate",
        value: formatRate(rateNow),
        note: rateDelta.note,
        noteTone: rateDelta.tone,
        spark: lastYearOf(rateSeries, (p) => p.pct),
        ...stepSpark,
        info: (
          <>
            The average total duty rate on your imports today, every tariff included (base duty, Section 301, Section 232, IEEPA and the rest), each
            import counted once. The note compares it with 90 days ago; the line shows the last 12 months.
          </>
        ),
      },
      {
        label: "Changes, last 12 months",
        value: lastYear.count.toLocaleString("en-US"),
        note: lastYear.count ? `Hit ${lastYear.products} of your products` : "None on your products",
        noteTone: "neutral",
        // Changes so far, month by month
        spark: monthlyChanges(insights.changes, today)
          .reduce<number[]>((acc, n) => [...acc, (acc[acc.length - 1] ?? 0) + n], [])
          .map((y, i) => ({ x: i, y })),
        sparkTone: "error",
        info: (
          <>
            How many times a tariff change moved the duty rate on one of your imports in the last 12 months (one import changing on one day counts
            once). The line adds them up month by month, so a steep stretch is a busy few months.
          </>
        ),
      },
      {
        label: "Imports",
        value: t.items.length.toLocaleString("en-US"),
        note: `From ${countryCount(t.products)} countries`,
        noteTone: "neutral",
        ...importsSparks,
        ...stepSpark,
        legend: [
          { label: `${t.items.length.toLocaleString("en-US")} imports`, color: PRIMARY_MARK },
          { label: `${countryCount(t.products)} countries`, color: "var(--tt-sky)" },
        ],
        info: "The imports in your catalog (each HTS code and country of origin) and the countries they come from. The lines are how many of each you've tracked over the last 12 months.",
      },
    ];

    // The rate pulse's biggest rise and drop in the last year, with the tariff behind each
    const steps = rateSeries.slice(1).map((p, i) => ({ date: p.date, diff: p.pct - rateSeries[i].pct })).filter((s) => s.date >= yearAgo);
    const event = (pick: (a: number, b: number) => boolean): PulseEvent | undefined => {
      const best = steps.reduce<(typeof steps)[number] | undefined>((top, s) => (!top || pick(s.diff, top.diff) ? s : top), undefined);
      if (!best || Math.abs(best.diff) < 0.005) return undefined;
      // The tariff that moved rates this way that day, on the most products
      const names = new Map<string, number>();
      insights.changes
        .filter((c) => c.date === best.date)
        .flatMap((c) => c.after.changes)
        .filter((l) => (best.diff > 0 ? l.delta > 0 : l.delta < 0))
        .forEach((l) => names.set(l.name, (names.get(l.name) ?? 0) + 1));
      const cause = Array.from(names).sort((a, b) => b[1] - a[1])[0]?.[0];
      return { date: best.date, label: cause ? shortProgram(cause) : best.diff > 0 ? "Rates up" : "Rates down" };
    };
    const rise = event((a, b) => a > b);
    const drop = event((a, b) => a < b);

    return {
      duty,
      metrics,
      rateSeries,
      yearAgo,
      rise: rise && rise.date ? rise : undefined,
      drop: drop && drop.date && drop.date !== rise?.date ? drop : undefined,
      picks: productsToLookAt(insights.products, insights.savings, insights.changes),
      lastYearChanges: insights.changes.filter((c) => c.date >= yearAgo),
    };
  }, [t.products, t.items.length, insights, today]);

  if (t.loading) return <div className={`${ui.skeleton} h-96 w-full`} />;
  if (!t.items.length) return <EmptyOverview />;

  const open = (key: string) => nav.openProduct(key);

  return (
    <div className="flex flex-col gap-4">
      {/* No visible title: the page opens on the tariff news */}
      <h1 className="sr-only">Overview</h1>
      <NewsTape />
      <NextStep />

      <TariffHealth />
      {/* On a plan: what the imports it doesn't cover could add */}
      <BeyondPlanTeaser compact />

      <MetricTiles metrics={data.metrics} />

      {/* Side by side, each row's panels stretch to the taller one, so no gaps open under them */}
      <div className="grid gap-4 xl:grid-cols-12">
        <div className={`${ROW} xl:col-span-8`}>
          <RatePulse series={data.rateSeries} from={data.yearAgo} to={today} rise={data.rise} drop={data.drop} />
        </div>
        <div className={`${ROW} xl:col-span-4`}>
          <OriginDistribution products={t.products} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className={`${ROW} xl:col-span-7`}>
          <ExposureMap products={t.products} onOpen={open} />
        </div>
        <div className={`${ROW} xl:col-span-5`}>
          <AccountGate
            feature="history"
            page="tracker"
            title="What changed on your products"
            teaser={changesTeaser(insights) ?? "Going through your products' history…"}
            preview={<TableStandIn columns={["Product", "Origin", "Change", "Date"]} />}
            minHeight="min-h-96"
          >
            <LatestChanges changes={data.lastYearChanges} onOpen={open} onAll={() => nav.openTab("history")} />
          </AccountGate>
        </div>
      </div>

      {data.picks.length > 0 && (
        <ProductTiles picks={data.picks} histories={insights.histories} onOpen={open} onAll={() => nav.openTab("catalog")} total={t.items.length} />
      )}
    </div>
  );
};
