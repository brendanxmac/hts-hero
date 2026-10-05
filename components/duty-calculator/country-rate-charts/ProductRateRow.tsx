"use client";

import { CountryMarker } from "./CountryMarker";
import { CountryRates, Product } from "./types";
import * as ui from "@/components/ui/styles";

// One product on the comparison chart: its label, then a marker per chosen country on the
// shared scale. Hovering or focusing a marker shows its rate.
export const ProductRateRow = ({
  product,
  index,
  chosen,
  ticks,
  x,
  flags,
  colorOf,
  hovered,
  onHover,
}: {
  product: Product;
  // The product's position in each row's values
  index: number;
  chosen: { slot: number; row: CountryRates }[];
  ticks: number[];
  x: (v: number) => string;
  flags: boolean;
  colorOf: (code: string) => string | undefined;
  // The country whose marker is hovered in this row
  hovered: string | null;
  onHover: (code: string | null) => void;
}) => (
  <div className="grid grid-cols-1 gap-x-4 gap-y-1 border-t border-base-300 py-3 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-center">
    <div className="min-w-0 truncate text-sm font-medium text-base-content" title={product.label}>
      {product.label}
    </div>
    <div className="relative mx-2 h-12">
      {ticks.map((t) => (
        <span
          key={t}
          className={`absolute top-0 bottom-0 w-px ${t === 0 ? "bg-base-content/20" : "bg-base-300"}`}
          style={{ left: x(t) }}
          aria-hidden
        />
      ))}
      {chosen.map(({ row }) => {
        const value = row.values[index];
        if (value === null) return null;
        const active = hovered === row.code;
        // Countries on the same rate fan out vertically, so none hides behind another
        const same = chosen.filter((c) => c.row.values[index] === value);
        const offset =
          (same.findIndex((c) => c.row.code === row.code) - (same.length - 1) / 2) * (flags ? 9 : 7);
        return (
          <button
            key={row.code}
            type="button"
            className="absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            style={{ left: x(value), marginTop: offset, zIndex: active ? 20 : 10 }}
            onMouseEnter={() => onHover(row.code)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(row.code)}
            onBlur={() => onHover(null)}
            aria-label={`${row.name}, ${product.label}: ${row.labels[index]}`}
          >
            <span className={`transition-transform ${active ? "scale-125" : ""}`}>
              <CountryMarker row={row} size="plot" flags={flags} color={colorOf(row.code)} />
            </span>
            {active && (
              <span
                role="tooltip"
                className={`${ui.tooltip} absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap px-2 py-1 text-xs`}
              >
                {row.flag} {row.name} · <span className="font-semibold">{row.labels[index]}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);
