"use client";

import { ReactNode } from "react";
import { Menu } from "@headlessui/react";
import { EllipsisHorizontalIcon, ExclamationTriangleIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { DateNotice } from "../duty-calculator/notices/DateNotice";
import * as ui from "@/components/ui/styles";
import { itemKey } from "./catalog";
import { downloadReport } from "./export";
import { ExportMenu } from "./ExportMenu";
import { ImportsTable } from "./imports/ImportsTable";
import { TrackedProduct } from "./report";
import { ReportSummary } from "./ReportSummary";
import { sectionBySlug } from "./sections";
import { SectionHeader } from "./shell/SectionPage";
import { useTracker } from "./TrackerContext";

// The report on the user's imports: the section's header with its actions (the date, export,
// adding products), a summary, then the imports table (ImportsTable: search, filters, sorting by heading, bulk actions), with a summary
// of the imports showing. The summary and the export cover what the search and filters let through,
// in the order shown.
export const TariffReport = ({
  rows,
  onAdd,
  onOpen,
  tabs,
}: {
  rows: TrackedProduct[];
  // Your Imports' views (Imports, Insights), under the title
  tabs?: ReactNode;
  onAdd: () => void;
  onOpen: (row: TrackedProduct) => void;
}) => {
  const { entryDate, setEntryDate, clearFilters, missing, items, removeProducts, clearCatalog } = useTracker();

  return (
    <section className="flex flex-col gap-5" aria-label="Your imports">
      <ImportsTable
        rows={rows}
        onOpen={onOpen}
        header={(table) => (
          <>
            <SectionHeader
              section={sectionBySlug("catalog")!}
              tabs={tabs}
              actions={
                <>
                  <label className="flex h-9 items-center gap-2 rounded-full border border-base-300 bg-base-100 pl-3.5 pr-2 text-xs font-semibold text-base-content/70">
                    Rates as of
                    <input
                      id="tt-date"
                      type="date"
                      className="h-7 rounded-full bg-transparent px-1 text-sm font-semibold tabular-nums text-base-content outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                    />
                  </label>
                  <ExportMenu
                    onExport={(format) => {
                      const shown = table.getRowModel().rows.map((row) => row.original);
                      downloadReport(shown, entryDate, format);
                      trackEvent(MixpanelEvent.TARIFF_TRACKER_EXPORTED, {
                        products: shown.length,
                        filtered: shown.length < rows.length,
                        format,
                      });
                    }}
                  />
                  <Menu as="div" className="relative">
                    <Menu.Button className={`${ui.button({ variant: "secondary" }).replace("px-5", "")} w-10`}>
                      <EllipsisHorizontalIcon className="h-4 w-4" aria-hidden />
                      <span className="sr-only">More import actions</span>
                    </Menu.Button>
                    <Menu.Items className={`${ui.popover} absolute right-0 z-30 mt-2 w-56 rounded-2xl p-2 focus:outline-hidden`}>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm text-error ${active ? "bg-tt-soft" : ""}`}
                            onClick={() => {
                              const count = items.length.toLocaleString("en-US");
                              if (window.confirm(`Remove all ${count} imports? Their adjustments are kept.`)) {
                                clearCatalog();
                                clearFilters();
                              }
                            }}
                          >
                            <TrashIcon className="h-4 w-4" aria-hidden />
                            Remove all imports
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                  <button type="button" className={ui.button({ variant: "primary" })} onClick={onAdd}>
                    <PlusIcon className="h-4 w-4" aria-hidden />
                    Add imports
                  </button>
                </>
              }
            />
          {missing.length > 0 && (
            <div role="status" className={`${ui.notice("warning")} flex flex-col gap-3 rounded-2xl sm:flex-row sm:items-center`}>
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
                className={ui.button({ variant: "secondary", size: "sm" })}
                onClick={() => removeProducts(missing.map(itemKey))}
              >
                Remove {missing.length === 1 ? "it" : "them"}
              </button>
            </div>
          )}

          <DateNotice entryDate={entryDate} onUseVerified={(date) => setEntryDate(date, "verified_notice")} />
          </>
        )}
        summary={(table) => <ReportSummary rows={table.getRowModel().rows.map((row) => row.original)} />}
      />
    </section>
  );
};
