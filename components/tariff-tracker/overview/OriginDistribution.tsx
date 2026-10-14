"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as tt from "@/components/ui/styles/tracker";
import { CHART_COLORS, SUCCESS_MARK } from "@/components/ui/theme";
import { TrackedProduct } from "../report";
import { originDistribution } from "./lib/metrics";

// Where the catalog comes from: share of products, or of value. Value is an estimate (products
// without a value of their own count at $10,000) until the user enters their own.

// Cobalt, sky, green, amber, red, slate (the Tracker's chart variables, reordered)
const BAR_COLORS = [CHART_COLORS[1], CHART_COLORS[2], SUCCESS_MARK, CHART_COLORS[3], CHART_COLORS[4], CHART_COLORS[0]];

export const OriginDistribution = ({ products }: { products: TrackedProduct[] }) => {
  const [byValue, setByValue] = useState(false);
  const { rows, estimated } = originDistribution(products, byValue);
  const max = Math.max(...rows.map((r) => r.share), 0.01);
  const estimatedNote = estimated > 0 ? " · est." : "";

  return (
    <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`} aria-labelledby="tt-origins">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="tt-origins" className={tt.title}>
            Origin distribution
          </h2>
          <p className={tt.subtitle}>Where your imports come from</p>
        </div>
        <SegmentedControl<"products" | "value">
          label="Measure"
          options={[
            { id: "products", label: "Products" },
            { id: "value", label: `Value${estimatedNote}` },
          ]}
          value={byValue ? "value" : "products"}
          onChange={(v) => setByValue(v === "value")}
          size="sm"
          tone="accent"
        />
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <li key={r.code} className="grid grid-cols-[8rem_minmax(0,1fr)_5rem] items-center gap-3 text-sm">
            <span className="truncate text-base-content">
              {r.flag} {r.name}
            </span>
            <span className="h-4 overflow-hidden rounded-full bg-tt-soft">
              {/* Runtime width and theme chart color (DESIGN_SYSTEM §10) */}
              <span className="block h-full rounded-full" style={{ width: `${(r.share / max) * 100}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
            </span>
            <span className="text-right tabular-nums">
              <b className="text-base-content">{Math.round(r.share * 100)}%</b>{" "}
              <span className="text-xs text-base-content/60">{byValue ? `$${Math.round(r.value / 1000).toLocaleString("en-US")}k` : r.products}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="m-0 text-xs text-base-content/60">
        {byValue
          ? estimated > 0
            ? `Estimated: ${estimated.toLocaleString("en-US")} of ${products.length.toLocaleString("en-US")} products use the $10,000 default until you enter their values.`
            : "By the shipment values you entered."
          : "By number of products (an HTS code from one country is one product)."}
      </p>
    </section>
  );
};
