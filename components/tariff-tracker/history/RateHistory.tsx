"use client";

import { useMemo } from "react";
import * as ui from "@/components/ui/styles";
import { ChartStandIn } from "@/components/ui/stand-ins";
import { shortDate } from "../../duty-calculator/rate-history/format";
import { todayIso } from "../../duty-calculator/lib/format";
import { AccountGate } from "../access/AccountGate";
import { formatRate } from "../formatRate";
import { averageRateSeries, changeDays } from "../insights/catalogHistory";
import { useInsights } from "../insights/InsightsContext";
import { InsightsProgress } from "../insights/InsightsProgress";
import { changesTeaser } from "../insights/teasers";
import { sectionBySlug } from "../sections";
import { NeedsProducts } from "../shell/NeedsProducts";
import { StatStrip } from "@/components/ui/StatStrip";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { CatalogRateChart } from "./CatalogRateChart";
import { ChangeFeed } from "./ChangeFeed";
import { RatesSince } from "./RatesSince";

// The Rate history tab: how the rates on the catalog's products have moved over the verified
// tariff data, for each product's own shipment. The catalog's average, every change by day,
// and any past date against today.

const HistoryReport = () => {
  const insights = useInsights();
  const nav = useTrackerNav();
  const { products, histories, changes, range } = insights;
  const series = useMemo(() => averageRateSeries(products, histories), [products, histories]);
  const days = useMemo(() => changeDays(changes), [changes]);
  const affected = new Set(changes.map((c) => c.product.key)).size;
  const biggest = changes.reduce<(typeof changes)[number] | null>((top, c) => (!top || c.deltaPct > top.deltaPct ? c : top), null);
  const first = series[0]?.pct ?? 0;
  const last = series[series.length - 1]?.pct ?? 0;
  const open = (key: string) => nav.openProduct(key);

  return (
    <div className="flex flex-col gap-4">
      <InsightsProgress label="Going through the history of" />
      <StatStrip
        stats={[
          { label: "Rate changes", value: changes.length.toLocaleString("en-US"), note: `Since ${shortDate(range.from, true)}` },
          {
            label: "Products affected",
            value: affected.toLocaleString("en-US"),
            note: `Of ${products.length.toLocaleString("en-US")} in your imports`,
          },
          {
            label: "Average rate",
            value: formatRate(last),
            note: `${formatRate(first)} on ${shortDate(range.from, true)}`,
            tone: last > first + 0.005 ? "error" : last < first - 0.005 ? "success" : undefined,
          },
          biggest && biggest.deltaPct > 0
            ? {
                label: "Biggest increase",
                value: `+${formatRate(biggest.deltaPct)}`,
                note: `${biggest.product.entry.element.htsno} · ${biggest.product.entry.country.name}`,
                tone: "error" as const,
              }
            : { label: "Biggest increase", value: "None", note: "No rate went up" },
        ]}
      />
      <CatalogRateChart series={series} to={todayIso()} />
      {/* Side by side, one height: each card fills its cell */}
      <div className="grid gap-4 xl:grid-cols-2 *:h-full">
        <ChangeFeed days={days} onOpen={open} />
        <RatesSince products={products} histories={histories} from={range.from} onOpen={open} />
      </div>
    </div>
  );
};

export const RateHistory = () => {
  const { items, loading } = useTracker();
  const insights = useInsights();
  const section = sectionBySlug("history")!;
  if (loading) return <div className={`${ui.skeleton} h-80 w-full`} />;
  if (!items.length) {
    return (
      <NeedsProducts
        title="Add Products to See Their History"
        body="Rate history shows every tariff change that hit your products: when, which tariff, and by how much."
      />
    );
  }
  return (
    <AccountGate
      feature="history"
      page="tracker"
      title="See Every Tariff Change on Your Products"
      teaser={changesTeaser(insights) ?? "Going through your products' history…"}
      points={section.planned}
      preview={<ChartStandIn title="Average Duty Rate Across Your Imports" />}
      minHeight="min-h-112"
    >
      <HistoryReport />
    </AccountGate>
  );
};
