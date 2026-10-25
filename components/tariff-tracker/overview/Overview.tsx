"use client";

import { useMemo } from "react";
import * as ui from "@/components/ui/styles";
import { TableStandIn } from "@/components/ui/stand-ins";
import { todayIso } from "../../duty-calculator/lib/format";
import { time } from "@/components/ui/charts/kit";
import { addDays } from "../../../tariffs/engine-v2/history";
import { AccountGate } from "../access/AccountGate";
import { formatRate } from "../formatRate";
import { averageRateSeries } from "../insights/catalogHistory";
import { useInsights } from "../insights/InsightsContext";
import { changesTeaser } from "../insights/teasers";
import { shortProgram } from "../report";
import { SectionHeader } from "../shell/SectionPage";
import { useTrackerNav } from "../shell/TrackerNav";
import { SECTIONS } from "../sections";
import { useTracker } from "../TrackerContext";
import { EmptyOverview } from "./EmptyOverview";
import { LatestChanges } from "./LatestChanges";
import { averageRate, changesLastYear, dutyPerShipment, monthlyChanges, productsToLookAt } from "./lib/metrics";
import { Metric, MetricTiles } from "./MetricTiles";
import { AttentionList } from "./AttentionList";
import { PulseEvent, RatePulse } from "./RatePulse";
import { NewsSummary } from "./SummaryBoxes";
import { TariffHealth } from "./TariffHealth";

// Home (DESIGN_SYSTEM.md §15 "Home"): the header card with the three numbers that sum up the
// imports (with their 12-month lines), what needs the user, ranked (AttentionList), how their
// average rate moved over the year, and what changed, on their imports and in tariffs at large. Where the duty comes from (exposure, origins)
// is in Your Imports' Insights. Before there are products, the empty Home asks for them.

// The value on a date in a series of steps
const OVERVIEW = SECTIONS.find((s) => s.slug === "overview")!;

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

  // Rows never pair cards of different heights: a card is full width, or the row has a fixed height
  // its cards fill (DESIGN_SYSTEM.md §15 "Home")
  return (
    <div className="flex flex-col gap-module">
      {/* The page's header card, with the three numbers that sum up the imports under the title */}
      <SectionHeader
        section={OVERVIEW}
        summary={`${new Date(`${today}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · ${t.items.length.toLocaleString("en-US")} ${t.items.length === 1 ? "import" : "imports"}`}
      >
        <MetricTiles metrics={data.metrics} framed={false} />
      </SectionHeader>

      <AttentionList />

      {/* The year's rate beside Tariff Health, one height: the row is at least 26rem, grows with
          Tariff Health if it needs to, and the chart fills what its card leaves it */}
      <div className="grid gap-module xl:min-h-[26rem] xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <RatePulse series={data.rateSeries} from={data.yearAgo} to={today} rise={data.rise} drop={data.drop} />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <TariffHealth />
        </div>
      </div>

      {/* What changed: on the user's imports, and in tariffs at large; one height, each list cut to fit */}
      <div className="grid gap-module xl:h-[26rem] xl:grid-cols-2">
        <AccountGate
          feature="history"
          page="tracker"
          title="What Changed on Your Imports"
          teaser={changesTeaser(insights) ?? "Going through your products' history…"}
          preview={<TableStandIn columns={["Product", "Origin", "Change", "Date"]} />}
          minHeight="min-h-96"
        >
          <LatestChanges changes={data.lastYearChanges} onOpen={open} onAll={() => nav.openTab("history")} />
        </AccountGate>
        <NewsSummary />
      </div>
    </div>
  );
};
