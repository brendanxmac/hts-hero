"use client";

import { ReactNode } from "react";
import { MUTED_MARK, PRIMARY_MARK } from "@/components/ui/theme";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AllRatesTable } from "./AllRatesTable";
import { AverageByCountryChart } from "./AverageByCountryChart";
import { ProductComparisonChart } from "./ProductComparisonChart";
import { axis } from "./scale";
import { CountryRates, Product } from "./types";
import { useCountrySlots } from "./useCountrySlots";
import { useMarkers } from "./useMarkers";

// The rates-by-country charts and table on /duty-calculator: the products' total duty for up to
// five chosen countries side by side, every country's average, and every rate. Choosing a country
// anywhere picks it everywhere; it keeps its color while it's chosen. Countries show as colored
// markers, or as their flags.


export const CountryRateCharts = ({
  products,
  rows,
  footnote,
}: {
  products: Product[];
  rows: CountryRates[];
  // Under the table: what the rates include
  footnote?: ReactNode;
}) => {
  const { colorOf, toggle, chosen } = useCountrySlots(rows);
  const [markers, setMarkers] = useMarkers();
  const flags = markers === "flags";

  // A chosen country's bars: its own color, or with flags marking it, the primary
  const barOf = (code: string) => (colorOf(code) ? (flags ? PRIMARY_MARK : colorOf(code)!) : MUTED_MARK);

  // The same scale for every choice and for the table, so marks only move when the data does
  const { top, ticks } = axis(
    Math.max(...rows.flatMap((r) => r.values.filter((v): v is number => v !== null)), 1),
  );
  const x = (v: number) => `${(v / top) * 100}%`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ProductComparisonChart
          products={products}
          rows={rows}
          chosen={chosen}
          ticks={ticks}
          x={x}
          flags={flags}
          colorOf={colorOf}
          toggle={toggle}
          markerSwitch={
            <SegmentedControl
              label="Show countries as"
              size="sm"
              options={[
                { id: "colors", label: "Colors" },
                { id: "flags", label: "Flags" },
              ] as const}
              value={markers}
              onChange={setMarkers}
            />
          }
        />

        <AverageByCountryChart
          rows={rows}
          productCount={products.length}
          colorOf={colorOf}
          barOf={barOf}
          toggle={toggle}
        />
      </div>

      <AllRatesTable
        products={products}
        rows={rows}
        x={x}
        flags={flags}
        colorOf={colorOf}
        barOf={barOf}
        toggle={toggle}
        footnote={footnote}
      />
    </div>
  );
};
