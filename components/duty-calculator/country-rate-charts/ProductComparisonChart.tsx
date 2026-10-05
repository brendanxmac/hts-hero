"use client";

import { ReactNode, useState } from "react";
import { SERIES_COLORS } from "@/components/ui/theme";
import * as ui from "@/components/ui/styles";
import { ChartCaption } from "./ChartCaption";
import { CountryChip } from "./CountryChip";
import { ProductRateRow } from "./ProductRateRow";
import { figureCard } from "./scale";
import { CountryRates, Product } from "./types";

// Products, side by side for the chosen countries: a chip per country to choose, then a row
// per product with a marker for each chosen country, and the scale underneath
export const ProductComparisonChart = ({
  products,
  rows,
  chosen,
  ticks,
  x,
  flags,
  colorOf,
  toggle,
  markerSwitch,
}: {
  products: Product[];
  rows: CountryRates[];
  chosen: { slot: number; row: CountryRates }[];
  ticks: number[];
  x: (v: number) => string;
  flags: boolean;
  colorOf: (code: string) => string | undefined;
  toggle: (code: string) => void;
  // The colors/flags switch, in the caption
  markerSwitch: ReactNode;
}) => {
  const [hover, setHover] = useState<{ product: number; code: string } | null>(null);
  return (
    <figure className={figureCard}>
      <ChartCaption title="Compare countries, product by product" action={markerSwitch}>
        Total duty for each product, for up to {SERIES_COLORS.length} countries. Choosing another
        replaces the earliest.
      </ChartCaption>
      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Countries to compare">
        {rows.map((row) => (
          <CountryChip
            key={row.code}
            row={row}
            color={colorOf(row.code)}
            flags={flags}
            onToggle={() => toggle(row.code)}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-col tabular-nums">
        {products.map((product, p) => (
          <ProductRateRow
            key={product.code}
            product={product}
            index={p}
            chosen={chosen}
            ticks={ticks}
            x={x}
            flags={flags}
            colorOf={colorOf}
            hovered={hover?.product === p ? hover.code : null}
            onHover={(code) => setHover(code ? { product: p, code } : null)}
          />
        ))}
        {/* The scale */}
        <div className="grid grid-cols-1 gap-x-4 border-t border-base-300 pt-1.5 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
          <span className="hidden sm:block" />
          <div className="relative mx-2 h-4">
            {ticks.map((t) => (
              <span key={t} className={`${ui.caption} absolute -translate-x-1/2`} style={{ left: x(t) }}>
                {t}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
};
