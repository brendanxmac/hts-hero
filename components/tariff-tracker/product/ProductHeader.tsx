"use client";

import { ArrowLeftIcon, ArrowPathIcon, TrashIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { TabBar } from "@/components/ui/TabBar";
import { TrackedProduct } from "../report";
import { ProductTab } from "../sections";
import { AlertsToggle } from "./AlertsToggle";

// The top of one of the user's imports (DESIGN_SYSTEM.md §15): one light panel holding everything
// about the import that isn't one of its views. The way back and its actions (alerts on or off,
// reset, remove) along the top, then what it is (flag, HTS code, country of origin, description),
// then its views as one row of tabs along the bottom edge. It scrolls away with the page, so it
// never takes up room while reading a view. Duty, Compare and History are the calculator's own
// tabs, so the calculator shows none of its own here.

// Its views, in order; Duty is where it opens
const TABS: { id: ProductTab; label: string; badge?: string }[] = [
  { id: "duty", label: "Duty" },
  { id: "compare", label: "Compare" },
  { id: "history", label: "History" },
  { id: "savings", label: "Savings" },
  { id: "audit", label: "Audit", badge: "Beta" },
];

export const ProductHeader = ({
  row,
  tab,
  onTab,
  onBack,
  onRemove,
  onReset,
}: {
  row: TrackedProduct;
  tab: ProductTab;
  onTab: (tab: ProductTab) => void;
  onBack: () => void;
  onRemove: () => void;
  // Clears what's been set on it (value, mode, program, answers); only when something has been
  onReset?: () => void;
}) => {
  const { entry } = row;
  return (
    <header className={`${tt.panel} flex flex-col`} aria-label={`${entry.element.htsno} from ${entry.country.name}`}>
      <div className="flex flex-col gap-4 px-5 pb-4 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-base-content/70 hover:text-base-content">
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Your imports
          </button>
          <div className="flex items-center gap-2">
            <AlertsToggle productKey={row.key} />
            {onReset && (
              <button type="button" className={tt.button("ghost", "sm")} onClick={onReset} title="Clear the value, mode, program and answers set on it">
                <ArrowPathIcon className="h-4 w-4" aria-hidden />
                Reset
              </button>
            )}
            <button type="button" className={`${tt.button("ghost", "sm")} hover:text-error`} onClick={onRemove}>
              <TrashIcon className="h-4 w-4" aria-hidden />
              Remove
            </button>
          </div>
        </div>

        {/* What it is */}
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tt-soft text-2xl" aria-hidden>
            {entry.country.flag}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className={`${mono.className} m-0 text-2xl font-semibold leading-none tracking-tight text-base-content`}>{entry.element.htsno}</h1>
              <span className="text-sm font-medium text-base-content/70">From {entry.country.name}</span>
            </div>
            <p className="m-0 line-clamp-1 max-w-3xl text-sm text-base-content/60" title={row.description}>
              {row.description}
            </p>
          </div>
        </div>
      </div>
      {/* Its views, along the header's bottom edge */}
      <div className="border-t border-base-300 px-5 sm:px-6">
        <TabBar label="This import" options={TABS} value={tab} onChange={onTab} />
      </div>
    </header>
  );
};
