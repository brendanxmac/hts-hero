"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatRate } from "../formatRate";
import { wholeDollars } from "../insights/teasers";
import { Saving, SavingKind } from "../insights/savings";
import { TrackedProduct } from "../report";

// Every saving across the catalog, biggest first: the product, what to do, and what it's worth
// on one shipment. A row opens the product, where the saving can be checked and applied.

const KIND_LABELS: Record<SavingKind, string> = {
  program: "Trade program",
  exemption: "Exemption",
  origin: "Sourcing",
};

const PAGE = 50;

export interface SavingRow {
  saving: Saving;
  product: TrackedProduct;
}

export const SavingsTable = ({ rows, onOpen }: { rows: SavingRow[]; onOpen: (key: string) => void }) => {
  const [shown, setShown] = useState(PAGE);
  return (
    <div className={ui.card}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-base-200">
            <tr>
              <th scope="col" className={`${ui.label} px-5 py-2.5 text-left sm:px-6`}>Product</th>
              <th scope="col" className={`${ui.label} px-4 py-2.5 text-left`}>Opportunity</th>
              <th scope="col" className={`${ui.label} px-4 py-2.5 text-right`}>Rate now</th>
              <th scope="col" className={`${ui.label} px-4 py-2.5 text-right`}>Could lower by</th>
              <th scope="col" className={`${ui.label} px-4 py-2.5 text-right`}>Up to, per shipment</th>
              <th scope="col" className="px-5 py-2.5 sm:px-6">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, shown).map(({ saving, product }, i) => (
              <tr
                key={`${saving.productKey}-${saving.kind}-${i}`}
                className="cursor-pointer border-t border-base-300 hover:bg-base-200/60"
                onClick={() => onOpen(product.key)}
              >
                <th scope="row" className="px-5 py-3 text-left font-normal sm:px-6">
                  <span className={`${mono.className} block text-sm font-semibold text-base-content`}>{product.entry.element.htsno}</span>
                  <span className="block text-xs text-base-content/60">
                    {product.entry.country.flag} {product.entry.country.name}
                  </span>
                </th>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span className={ui.badge(saving.kind === "origin" ? "neutral" : "success")}>{KIND_LABELS[saving.kind]}</span>
                    <span className="font-medium text-base-content">
                      {saving.country ? `${saving.country.flag} ` : ""}
                      {saving.title}
                    </span>
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs text-base-content/60" title={saving.detail}>
                    {saving.detail}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{formatRate(product.totalPct)}</td>
                <td className="px-4 py-3 text-right font-semibold text-success">−{formatRate(saving.pts)}</td>
                <td className="px-4 py-3 text-right font-semibold text-base-content">
                  {wholeDollars(saving.usd)}
                  {saving.kind === "exemption" && <span className="block text-xs font-normal text-base-content/60">If it applies</span>}
                </td>
                <td className="px-5 py-3 text-right sm:px-6">
                  <button
                    type="button"
                    className={ui.button({ variant: "ghost", size: "sm", icon: true })}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(product.key);
                    }}
                  >
                    <ChevronRightIcon className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Open {product.entry.element.htsno}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > shown && (
        <div className={`${ui.cardFooter} flex justify-center`}>
          <button type="button" className={ui.button({ size: "sm" })} onClick={() => setShown((n) => n + PAGE)}>
            Show more ({(rows.length - shown).toLocaleString("en-US")} left)
          </button>
        </div>
      )}
    </div>
  );
};
