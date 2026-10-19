"use client";

import { useMemo, useState } from "react";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { mono } from "@/components/ui/font";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as tt from "@/components/ui/styles/tracker";
import { formatRate } from "../../formatRate";
import { signedRate } from "../../impact/format";
import { programColors } from "../../programColors";
import { shortProgram } from "../../report";
import { useTrackerNav } from "../../shell/TrackerNav";
import { CatalogScale, importMoves, InsightsInput } from "../lib/data";
import { InsightPanel, NavArrow } from "../shared";

// The imports most exposed to tariffs: the highest rates today, or the biggest rises in the last
// 12 months, each with what its rate is made of on one shared scale. With a handful of imports,
// every one of them, piece by piece.

type Order = "rate" | "rise";

export const MostExposed = ({ input, scale }: { input: InsightsInput; scale: CatalogScale }) => {
  const nav = useTrackerNav();
  const [order, setOrder] = useState<Order>("rate");
  const moves = useMemo(() => importMoves(input), [input]);
  const few = scale === "few";
  const sorted = [...moves].sort((a, b) => (order === "rate" ? b.now - a.now : b.change - a.change)).filter((m) => order === "rate" || m.change > 0.005);
  const shown = few ? sorted : sorted.slice(0, 8);
  const colors = programColors(shown);
  const max = Math.max(...shown.map((m) => m.now), 0.01);
  const top = shown[0];
  const label = (key: string) => shortProgram(key);

  return (
    <InsightPanel
      id="ti-exposed"
      title={few ? "Each Import, Piece by Piece" : "Most Exposed Imports"}
      subtitle={few ? "What makes up the rate on each of your imports, and how it moved in 12 months" : "The imports carrying the most duty, and what makes up each rate"}
      action={
        few ? undefined : (
          <SegmentedControl<Order>
            label="Rank by"
            size="sm"
            value={order}
            onChange={setOrder}
            options={[
              { id: "rate", label: "Highest rate" },
              { id: "rise", label: "Biggest rise" },
            ]}
          />
        )
      }
      lesson={
        top ? (
          order === "rate" ? (
            <>
              {top.product.entry.element.htsno} from {top.product.entry.country.name} pays the most, {formatRate(top.now)}
              {top.parts.length > 1 ? (
                <>
                  , {Math.round(((top.parts.reduce((a, b) => (b.pct > a.pct ? b : a)).pct || 0) / (top.now || 1)) * 100)}% of it from{" "}
                  <b>{label(top.parts.reduce((a, b) => (b.pct > a.pct ? b : a)).key)}</b>
                </>
              ) : null}
              .
            </>
          ) : (
            <>
              {top.product.entry.element.htsno} from {top.product.entry.country.name} rose the most in 12 months: {formatRate(top.then)} → {formatRate(top.now)} ({signedRate(top.change)}).
            </>
          )
        ) : order === "rise" ? (
          "No rate on your imports went up in the last 12 months."
        ) : undefined
      }
    >
      <ul className="-mx-2 m-0 flex list-none flex-col p-0">
        {shown.map((m) => (
          <li key={m.product.key}>
            <button
              type="button"
              onClick={() => nav.openProduct(m.product.key)}
              className="group grid w-full grid-cols-[minmax(0,15rem)_minmax(0,1fr)_9rem_1rem] items-center gap-4 rounded-xl px-2 py-2.5 text-left text-sm hover:bg-tt-soft focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className={`${mono.className} font-semibold text-base-content`}>{m.product.entry.element.htsno}</span>
                  <span className="truncate text-base-content/70">
                    {m.product.entry.country.flag} {m.product.entry.country.name}
                  </span>
                </span>
                <span className="block truncate text-xs text-base-content/60" title={m.product.description}>
                  {m.product.description}
                </span>
              </span>
              <StackedBar
                // Full names: one import can carry two tariffs with one short name (two Section 301 actions)
                parts={m.parts.map((p) => ({ label: p.key, amount: p.pct, color: colors[p.key] }))}
                formatValue={formatRate}
                size="sm"
                shape="pill"
                fill={m.now / max}
                legend={few}
                showShare={false}
              />
              <span className="flex items-center justify-end gap-2 tabular-nums">
                <b className={`${tt.display} text-base text-base-content`}>{formatRate(m.now)}</b>
                <span className={tt.chip(m.change > 0.005 ? "error" : m.change < -0.005 ? "success" : "neutral")}>{Math.abs(m.change) < 0.005 ? "No change" : signedRate(m.change)}</span>
              </span>
              <NavArrow />
            </button>
          </li>
        ))}
      </ul>
      {!few && <p className="m-0 text-xs text-base-content/60">Bars share one scale; the chip is the change in the last 12 months.</p>}
    </InsightPanel>
  );
};
