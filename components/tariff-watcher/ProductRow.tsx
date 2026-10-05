"use client";

import { ChevronDownIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatRate } from "./formatRate";
import { ProductDetails } from "./ProductDetails";
import { BASE_PART, shortProgram, WatchRow } from "./report";

// Product, origin, tariffs, duty rate and the chevron. Shared with ProductList's headings.
export const ROW_GRID =
  "md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,1.7fr)_6rem_1.75rem] md:gap-5 md:items-center";

// One product on the report: its rate and the tariffs that make it up. Opens to its details.
export const ProductRow = ({
  row,
  colors,
  maxPct,
  open,
  onToggle,
  onOpenInCalculator,
}: {
  row: WatchRow;
  colors: Record<string, string>;
  maxPct: number;
  open: boolean;
  onToggle: () => void;
  onOpenInCalculator: () => void;
}) => {
  const { entry } = row;
  const detailsId = `tw-row-${entry.line}`;
  // Scaled to the highest rate on the list, with a sliver for any rate above zero
  const barWidth = Math.max((row.totalPct / maxPct) * 100, row.totalPct > 0 ? 2 : 0);

  return (
    <li>
      <button
        type="button"
        className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 ${ROW_GRID} px-5 py-4 text-left text-base-content transition-colors hover:bg-base-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
          open ? "bg-base-200" : ""
        }`}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={detailsId}
      >
        {/* Product */}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={`${mono.className} text-sm font-semibold text-base-content`}>{entry.element.htsno}</span>
          <span className="line-clamp-2 text-xs leading-snug text-base-content/60" title={row.description}>
            {row.description}
          </span>
        </span>

        {/* Duty rate, beside the product on phones */}
        <span className="flex flex-col items-end gap-1 md:order-4 md:self-center">
          <span className="text-xl font-semibold leading-none tracking-tight tabular-nums">
            {formatRate(row.totalPct)}
          </span>
          {row.bestSavingPct > 0.005 && (
            <span className={`${ui.badge("success")} gap-1 whitespace-nowrap`}>
              <SparklesIcon className="h-3 w-3" aria-hidden />
              Could be lower
            </span>
          )}
        </span>

        {/* Origin */}
        <span className="col-span-2 flex min-w-0 items-center gap-2 text-sm md:order-2 md:col-span-1">
          <span className="text-lg leading-none" aria-hidden>
            {entry.country.flag}
          </span>
          <span className="truncate">{entry.country.name}</span>
        </span>

        {/* Tariffs: a bar scaled to the highest rate on the list, and the rate of each part */}
        <span className="col-span-2 flex min-w-0 flex-col gap-2 md:order-3 md:col-span-1">
          <span className="flex h-2.5 w-full overflow-hidden rounded-full bg-base-300" aria-hidden>
            <span className="flex h-full" style={{ width: `${barWidth}%` }}>
              {row.parts.map((p) => (
                <span
                  key={p.key}
                  className="h-full"
                  style={{ width: `${(p.pct / row.totalPct) * 100}%`, background: colors[p.key] }}
                />
              ))}
            </span>
          </span>
          <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/70">
            {row.parts.length === 0 ? (
              <span className="text-base-content/60">Duty free</span>
            ) : (
              row.parts.map((p) => (
                <span key={p.key} className="inline-flex items-center gap-1.5 whitespace-nowrap" title={p.key}>
                  <span className="h-2 w-2 rounded-sm" style={{ background: colors[p.key] }} aria-hidden />
                  {p.key === BASE_PART ? "Base" : shortProgram(p.key)}
                  <span className="font-semibold tabular-nums text-base-content">{formatRate(p.pct)}</span>
                </span>
              ))
            )}
          </span>
        </span>

        <ChevronDownIcon
          className={`hidden h-5 w-5 justify-self-end text-base-content/60 transition-transform md:order-5 md:block ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <div id={detailsId} className="bg-base-200 px-5 pb-5 pt-1">
          <ProductDetails row={row} onOpenInCalculator={onOpenInCalculator} />
        </div>
      )}
    </li>
  );
};
