"use client";

import { useMemo, useState } from "react";
import { addDays } from "@/tariffs/engine-v2/history";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { formatDate, formatMoney, formatPct } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";
import { ChangeTimeline } from "./ChangeTimeline";
import { shortDate } from "./format";
import { LayerLegend } from "./LayerLegend";
import { layersFor } from "./layers";
import { RateHistoryChart } from "./RateHistoryChart";
import { RateHistoryHeadline } from "./RateHistoryHeadline";
import { Metric } from "./types";

// "Duty Over Time": the selected entry's duty on every verified revision, as a stacked step
// chart with one layer per program (colored like the Cost Breakdown), and what changed when.
export const RateHistoryCard = ({
  f,
  sliceColors,
  highlight,
  onHighlight,
}: {
  f: TariffFinder;
  // Colors of the Cost Breakdown slices, so the same program has the same color here
  sliceColors: Record<string, string>;
  highlight?: string | null;
  onHighlight?: (label: string | null) => void;
}) => {
  const { history, historyRange, customsValue, entryDate } = f;
  const [metric, setMetric] = useState<Metric>("pct");

  const layers = useMemo(() => layersFor(history, sliceColors), [history, sliceColors]);

  if (history.length === 0) return null;

  const value = (amount: number) =>
    metric === "usd" ? amount : customsValue > 0 ? (amount / customsValue) * 100 : 0;
  const show = (amount: number) =>
    metric === "usd" ? formatMoney(amount) : formatPct(Math.round(value(amount) * 100) / 100);

  const inRange = entryDate >= historyRange.from && entryDate < historyRange.to;
  const entryIndex = inRange
    ? history.findIndex((s) => s.from <= entryDate && entryDate < s.to)
    : -1;
  const current = history[entryIndex >= 0 ? entryIndex : history.length - 1];
  // The last day there's data for
  const lastDate = addDays(historyRange.to, -1);

  const pickDate = (date: string, source: string) => f.setEntryDate(date, source);

  return (
    <section className={`${ui.card} p-5 flex flex-col gap-4`} aria-labelledby="rate-history-title">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="rate-history-title" className={ui.cardTitle}>
            Duty Over Time
          </h3>
          <p className={`${ui.caption} mt-0.5`}>
            {shortDate(historyRange.from)} – {formatDate(lastDate)}
          </p>
        </div>
        <SegmentedControl<Metric>
          label="Show duty as"
          size="sm"
          options={[
            { id: "pct", label: "%", title: "Percent of value" },
            { id: "usd", label: "$", title: "Dollars" },
          ] as const}
          value={metric}
          onChange={setMetric}
        />
      </div>

      <RateHistoryHeadline
        history={history}
        current={current}
        label={entryIndex >= 0 ? "Duty on your entry date" : `Duty on ${formatDate(lastDate)}`}
        metric={metric}
        value={value}
        show={show}
      />

      <RateHistoryChart
        history={history}
        layers={layers}
        from={historyRange.from}
        to={historyRange.to}
        entryDate={inRange ? entryDate : null}
        value={value}
        show={show}
        metric={metric}
        highlight={highlight}
        onPick={(date) => pickDate(date, "rate_history_chart")}
      />

      {layers.length > 1 && (
        <LayerLegend layers={layers} highlight={highlight} onHighlight={onHighlight} />
      )}

      <ChangeTimeline
        history={history}
        entryIndex={entryIndex}
        lastDate={lastDate}
        metric={metric}
        value={value}
        show={show}
        onPick={(date) => pickDate(date, "rate_history_list")}
      />

      <p className="text-xs leading-snug text-base-content/60 border-t border-base-300 pt-3">
        Your value, quantity, trade preference and answers, on every date. Base rates are from the
        current HTS; customs fees aren&apos;t included.
        {!inRange && entryDate >= historyRange.to && (
          <>
            {" "}
            Tariff changes after {formatDate(lastDate)} aren&apos;t entered yet, so they
            aren&apos;t shown.
          </>
        )}
      </p>
    </section>
  );
};
