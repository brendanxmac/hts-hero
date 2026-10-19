"use client";

import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { ERROR_MARK, PRIMARY_MARK } from "@/components/ui/theme";
import { formatRate } from "../formatRate";
import { CatalogChange, ProductHistory } from "../insights/catalogHistory";
import { Saving } from "../insights/savings";
import { wholeDollars } from "../insights/teasers";
import { TrackedProduct } from "../report";
import { Sparkline, time } from "@/components/ui/charts/kit";
import { todayIso } from "../../duty-calculator/lib/format";

// The products to look at first: the biggest potential savings and the latest increases, each
// with its rate over time
export interface ProductPick {
  product: TrackedProduct;
  reason: "saving" | "increase";
  saving?: Saving;
  change?: CatalogChange;
}

export const ProductTiles = ({
  picks,
  histories,
  onOpen,
  onAll,
  total,
}: {
  picks: ProductPick[];
  histories: Map<string, ProductHistory>;
  onOpen: (key: string) => void;
  onAll: () => void;
  total: number;
}) => (
  <section className="flex flex-col gap-3" aria-labelledby="tt-look">
    <div className="flex items-baseline justify-between px-1">
      <h2 id="tt-look" className={tt.title}>
        Products to Look at First
      </h2>
      <button type="button" className="text-sm font-semibold text-primary hover:underline" onClick={onAll}>
        All {total.toLocaleString("en-US")} →
      </button>
    </div>
    {/* Across the page: as many columns as tiles (up to four), so a row is never left part-empty */}
    <div className={`grid gap-4 sm:grid-cols-2 ${["xl:grid-cols-1", "xl:grid-cols-2", "xl:grid-cols-3", "xl:grid-cols-4"][Math.min(picks.length, 4) - 1] ?? ""}`}>
      {picks.map(({ product, reason, saving, change }) => {
        const history = histories.get(product.key) ?? [];
        const increase = reason === "increase";
        return (
          <button
            key={product.key}
            type="button"
            onClick={() => onOpen(product.key)}
            className={`${tt.panel} flex flex-col gap-2.5 p-5 text-left transition-colors hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className={`${mono.className} text-sm font-bold text-base-content`}>{product.entry.element.htsno}</span>
              <span className={tt.chip(increase ? "error" : "success")}>{increase ? "Changed" : "Potential"}</span>
            </span>
            <span className="truncate text-sm text-base-content/60">
              {product.entry.country.flag} {product.entry.country.name} · {product.description}
            </span>
            <Sparkline
              points={history.map((seg) => ({ x: time(seg.from), y: seg.pct }))}
              color={increase ? ERROR_MARK : PRIMARY_MARK}
              step
              to={time(todayIso())}
              height={40}
            />
            <span className="flex items-baseline justify-between gap-2">
              <span className={`${tt.display} text-2xl font-semibold tabular-nums text-base-content`}>{formatRate(product.totalPct)}</span>
              <span className={`text-sm font-semibold ${increase ? "text-error" : "text-success"}`}>
                {increase && change ? `+${Math.round(change.deltaPct * 100) / 100}%` : saving ? `Could save ${wholeDollars(saving.usd)}` : ""}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  </section>
);
