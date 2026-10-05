"use client";

import { useMemo, useState } from "react";
import { Country } from "../../constants/countries";
import { HtsElement } from "../../interfaces/hts";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { formatDate } from "../duty-calculator/lib/format";
import { VerifiedNotice } from "../duty-calculator/notices";
import { TariffFinder } from "../duty-calculator/lib/useTariffFinder";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { downloadReport } from "./export";
import { ExportMenu } from "./ExportMenu";
import { ProductList } from "./ProductList";
import { WatchRow } from "./report";
import { ReportSummary } from "./ReportSummary";

type Sort = "list" | "highest" | "country";
const SORTS: { id: Sort; label: string }[] = [
  { id: "list", label: "List order" },
  { id: "highest", label: "Highest rate" },
  { id: "country", label: "Country" },
];

// The report for a watch list: a summary, then every product's rate, sortable and exportable
export const TariffReport = ({
  f,
  rows,
  skipped,
  onOpenInCalculator,
}: {
  f: TariffFinder;
  rows: WatchRow[];
  skipped: number;
  onOpenInCalculator: (element: HtsElement, country: Country) => void;
}) => {
  const [sort, setSort] = useState<Sort>("list");

  const sorted = useMemo(() => {
    const copy = rows.slice();
    if (sort === "highest") copy.sort((a, b) => b.totalPct - a.totalPct);
    if (sort === "country") copy.sort((a, b) => a.entry.country.name.localeCompare(b.entry.country.name));
    return copy;
  }, [rows, sort]);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="tw-report-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id="tw-report-heading" className="text-xl font-semibold tracking-tight text-base-content">
            Tariff report
          </h2>
          <p className="mt-1 text-sm text-base-content/70">
            {rows.length} {rows.length === 1 ? "product" : "products"} · Rates as of {formatDate(f.entryDate)}
            {skipped > 0 && (
              <span className="text-warning">
                {" "}
                · {skipped} {skipped === 1 ? "line" : "lines"} skipped
              </span>
            )}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          <div className="w-full whitespace-nowrap sm:w-96">
            <SegmentedControl
              label="Sort products"
              options={SORTS}
              value={sort}
              onChange={(next) => {
                setSort(next);
                trackEvent(MixpanelEvent.TARIFF_WATCHER_SORTED, { sort: next });
              }}
              size="sm"
              fullWidth
            />
          </div>
          <ExportMenu
            onExport={(format) => {
              downloadReport(sorted, f.entryDate, format);
              trackEvent(MixpanelEvent.TARIFF_WATCHER_EXPORTED, { products: sorted.length, format });
            }}
          />
        </div>
      </div>

      <VerifiedNotice f={f} />

      <ReportSummary rows={rows} />

      <ProductList rows={rows} sorted={sorted} onOpenInCalculator={onOpenInCalculator} />
    </section>
  );
};
