"use client";

import { ArrowDownRightIcon, ArrowUpRightIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { formatDate } from "../../duty-calculator/lib/format";
import { formatRate } from "../formatRate";
import { CatalogChange } from "../insights/catalogHistory";

// The latest tariff changes on the user's products, newest first, as soft rows with a round
// icon in the color of the change
export const LatestChanges = ({ changes, onOpen, onAll }: { changes: CatalogChange[]; onOpen: (key: string) => void; onAll: () => void }) => (
  <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-3`} aria-labelledby="tt-latest">
    <div className="flex items-center justify-between gap-3">
      <h2 id="tt-latest" className={tt.title}>
        Changes on Your Products
      </h2>
      <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={onAll}>
        Rate history
      </button>
    </div>
    {changes.length === 0 ? (
      <p className={`${tt.tile} m-0 p-4 text-sm text-base-content/70`}>No rate on your tracked products changed in the last 12 months.</p>
    ) : (
      <ul className="flex flex-col gap-2">
        {changes.slice(0, 5).map((c) => {
          const up = c.deltaPct > 0;
          return (
            <li key={`${c.product.key}-${c.date}`}>
              <button
                type="button"
                className={`${tt.tile} flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-base-300/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40`}
                onClick={() => onOpen(c.product.key)}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${up ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}>
                  {up ? <ArrowUpRightIcon className="h-4 w-4" aria-hidden /> : <ArrowDownRightIcon className="h-4 w-4" aria-hidden />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold text-base-content">
                    <span className={mono.className}>{c.product.entry.element.htsno}</span> · {c.product.entry.country.name}
                  </span>
                  <span className="truncate text-xs text-base-content/60">
                    {formatDate(c.date)} · {c.after.changes.map((l) => l.name).join(", ")}
                  </span>
                </span>
                <span className={`text-sm font-bold tabular-nums ${up ? "text-error" : "text-success"}`}>
                  {up ? "+" : "−"}
                  {formatRate(Math.abs(c.deltaPct))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);
