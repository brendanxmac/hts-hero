"use client";

import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { formatRate } from "../formatRate";
import { TrackedProduct } from "../report";
import { exposure } from "./lib/metrics";
import { ExcludesBase } from "@/components/duty-calculator/results/ExcludesBase";

// What each tariff adds to the highest-duty products: a heat grid in one hue, cobalt, deeper
// for more. Empty cells stay soft.
const heat = (pct: number) => `color-mix(in srgb, var(--color-primary) ${Math.min(92, 14 + pct * 2.8)}%, transparent)`;

export const ExposureMap = ({ products, onOpen }: { products: TrackedProduct[]; onOpen: (key: string) => void }) => {
  const { columns, rows } = exposure(products);
  return (
    <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`} aria-labelledby="tt-exposure">
      <div>
        <h2 id="tt-exposure" className={tt.title}>
          Exposure Map
        </h2>
        <p className={tt.subtitle}>What each tariff adds to your highest-duty products. Deeper blue costs more.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1.5 text-sm tabular-nums">
          <thead>
            <tr>
              <th scope="col" className="text-left text-xs font-medium text-base-content/60">
                Product
              </th>
              {columns.map((c) => (
                <th key={c} scope="col" className="text-xs font-medium text-base-content/60">
                  {c}
                </th>
              ))}
              <th scope="col" className="text-right text-xs font-medium text-base-content/60">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, cells }) => (
              <tr key={product.key} className="cursor-pointer" onClick={() => onOpen(product.key)}>
                <th scope="row" className="whitespace-nowrap pr-2 text-left font-semibold text-base-content">
                  {product.entry.country.flag} <span className={mono.className}>{product.entry.element.htsno}</span>
                </th>
                {cells.map((pct, i) => (
                  <td
                    key={columns[i]}
                    className={`h-10 rounded-xl text-center text-xs font-semibold ${pct ? (pct > 14 ? "text-primary-content" : "text-base-content") : "bg-tt-soft text-base-content/50"}`}
                    // Runtime tint (DESIGN_SYSTEM §10)
                    style={pct ? { background: heat(pct) } : undefined}
                  >
                    {pct ? formatRate(pct) : "·"}
                  </td>
                ))}
                <td className={`${tt.display} pl-2 text-right font-semibold text-base-content`}>
                  {formatRate(product.totalPct)}
                  {product.baseNotCalculated && <ExcludesBase className="block font-sans" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
