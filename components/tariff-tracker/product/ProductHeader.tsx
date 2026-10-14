"use client";

import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as tt from "@/components/ui/styles/tracker";
import { TrackedProduct } from "../report";
import { PRODUCT_TABS, ProductTab } from "../sections";
import { AlertsToggle } from "./AlertsToggle";

// The top of one of the user's imports (DESIGN_SYSTEM.md §15): a page header rather than one more
// box. It sits on the page itself, edge to edge of the section, and sticks to the top while the
// tab's content scrolls under it: the way back, what it is (HTS code, country of origin,
// description), its actions (alerts on or off, remove) and the tabs (the calculator's own
// control). The Summary tab, where the view opens, has the rest.

const TAB_LABELS: Record<ProductTab, string> = { summary: "Summary", duty: "Duty", savings: "Savings", audit: "Audit" };

export const ProductHeader = ({
  row,
  tab,
  onTab,
  onBack,
  onRemove,
}: {
  row: TrackedProduct;
  tab: ProductTab;
  onTab: (tab: ProductTab) => void;
  onBack: () => void;
  onRemove: () => void;
}) => {
  const { entry } = row;
  return (
    // Out to the edges of SectionPage's padding, so the header spans the section and its bottom
    // rule runs edge to edge; sticky inside the shell's one scroller (TrackerShell's main)
    <header data-sticky-header className="sticky top-0 z-20 -mx-4 -mt-6 flex flex-col gap-4 border-b border-base-300 bg-base-200 px-4 pb-4 pt-5 sm:-mx-6 sm:px-6 lg:-mx-2 lg:-mt-1 lg:px-2 lg:pt-3">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-base-content/70 hover:text-base-content">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Your imports
        </button>
        <div className="flex items-center gap-2">
          <AlertsToggle productKey={row.key} />
          <button type="button" className={`${tt.button("ghost", "sm")} hover:text-error`} onClick={onRemove}>
            <TrashIcon className="h-4 w-4" aria-hidden />
            Remove
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-base-100 text-2xl ring-1 ring-base-300" aria-hidden>
            {entry.country.flag}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className={`${mono.className} m-0 text-2xl font-semibold leading-none tracking-tight text-base-content`}>{entry.element.htsno}</h1>
              <span className="text-sm text-base-content/70">From {entry.country.name}</span>
            </div>
            <p className="m-0 line-clamp-1 max-w-3xl text-sm text-base-content/70" title={row.description}>
              {row.description}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-[28rem]">
          <SegmentedControl<ProductTab>
            label="Import"
            options={PRODUCT_TABS.map((id) => ({ id, label: TAB_LABELS[id], badge: id === "audit" ? "Beta" : undefined }))}
            value={tab}
            onChange={onTab}
            size="sm"
            fullWidth
            tone="accent"
          />
        </div>
      </div>
    </header>
  );
};
