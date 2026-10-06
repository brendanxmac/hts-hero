"use client";

import { useMemo, useState } from "react";
import { Menu } from "@headlessui/react";
import { EllipsisHorizontalIcon, ExclamationTriangleIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { formatDate } from "../duty-calculator/lib/format";
import { DateNotice } from "../duty-calculator/notices/DateNotice";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { itemKey } from "./catalog";
import { downloadReport } from "./export";
import { ExportMenu } from "./ExportMenu";
import { FilterBar } from "./FilterBar";
import { applyFilters } from "./filters";
import { ProductList } from "./ProductList";
import { TrackedProduct } from "./report";
import { ReportSummary } from "./ReportSummary";
import { useTracker } from "./TrackerContext";

type Sort = "list" | "highest" | "country";
const SORTS: { id: Sort; label: string }[] = [
  { id: "list", label: "List order" },
  { id: "highest", label: "Highest rate" },
  { id: "country", label: "Country" },
];

// The report for a catalog: its toolbar (the date, sorting, export, adding products), filters,
// a summary, then every product's rate. The summary, the list and the export all cover the
// products the filters let through.
export const TariffReport = ({
  rows,
  onAdd,
  onOpen,
}: {
  rows: TrackedProduct[];
  onAdd: () => void;
  onOpen: (row: TrackedProduct) => void;
}) => {
  const { entryDate, setEntryDate, filters, clearFilters, missing, items, removeProducts, clearCatalog } = useTracker();
  const [sort, setSort] = useState<Sort>("list");

  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);

  const sorted = useMemo(() => {
    const copy = filtered.slice();
    if (sort === "highest") copy.sort((a, b) => b.totalPct - a.totalPct);
    if (sort === "country") copy.sort((a, b) => a.entry.country.name.localeCompare(b.entry.country.name));
    return copy;
  }, [filtered, sort]);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="tt-report-heading">
      <h2 id="tt-report-heading" className="sr-only">
        Tariff report, rates as of {formatDate(entryDate)}
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="tt-date" className={`${ui.label} whitespace-nowrap`}>
            Rates as of
          </label>
          {/* The input style is full width; this sets the width */}
          <div className="w-40">
            <input
              id="tt-date"
              type="date"
              className={`${ui.inputSm} tabular-nums`}
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            label="Sort products"
            options={SORTS}
            value={sort}
            onChange={(next) => {
              setSort(next);
              trackEvent(MixpanelEvent.TARIFF_TRACKER_SORTED, { sort: next });
            }}
            size="sm"
          />
          <ExportMenu
            onExport={(format) => {
              downloadReport(sorted, entryDate, format);
              trackEvent(MixpanelEvent.TARIFF_TRACKER_EXPORTED, {
                products: sorted.length,
                filtered: sorted.length < rows.length,
                format,
              });
            }}
          />
          <Menu as="div" className="relative">
            <Menu.Button className={ui.button({ size: "sm", icon: true })}>
              <EllipsisHorizontalIcon className="h-4 w-4" aria-hidden />
              <span className="sr-only">More catalog actions</span>
            </Menu.Button>
            <Menu.Items className={`${ui.popover} absolute right-0 z-30 mt-2 w-56 focus:outline-none`}>
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-error ${active ? "bg-base-200" : ""}`}
                    onClick={() => {
                      const count = items.length.toLocaleString("en-US");
                      if (window.confirm(`Remove all ${count} products from your catalog? Their adjustments are kept.`)) {
                        clearCatalog();
                        clearFilters();
                      }
                    }}
                  >
                    <TrashIcon className="h-4 w-4" aria-hidden />
                    Clear catalog
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
          <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={onAdd}>
            <PlusIcon className="h-4 w-4" aria-hidden />
            Add products
          </button>
        </div>
      </div>

      {missing.length > 0 && (
        <div role="status" className={`${ui.notice("warning")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-warning" aria-hidden />
          <p className={`${ui.bodySm} flex-1`}>
            <span className="font-semibold text-base-content">
              {missing.length} {missing.length === 1 ? "product isn't" : "products aren't"} in the current HTS
            </span>{" "}
            ({missing.slice(0, 3).map((m) => `${m.code}, ${m.country}`).join("; ")}
            {missing.length > 3 ? "…" : ""}), so {missing.length === 1 ? "it's" : "they're"} not shown. The code may
            have been replaced in a revision.
          </p>
          <button
            type="button"
            className={`${ui.button({ size: "sm" })} shrink-0`}
            onClick={() => removeProducts(missing.map(itemKey))}
          >
            Remove {missing.length === 1 ? "it" : "them"}
          </button>
        </div>
      )}

      <FilterBar products={rows} showing={filtered.length} />

      <DateNotice entryDate={entryDate} onUseVerified={(date) => setEntryDate(date, "verified_notice")} />

      {filtered.length === 0 ? (
        <div className={`${ui.card} flex flex-col items-start gap-3 p-6`}>
          <p className={ui.body}>No products match these filters.</p>
          <button type="button" className={ui.button({ size: "sm" })} onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <ReportSummary rows={filtered} />
          <ProductList rows={filtered} sorted={sorted} onOpen={onOpen} />
        </>
      )}
    </section>
  );
};
