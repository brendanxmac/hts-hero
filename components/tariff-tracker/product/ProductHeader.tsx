"use client";

import { ReactNode } from "react";
import { ArrowLeftIcon, ArrowPathIcon, TrashIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { TabBar } from "@/components/ui/TabBar";
import { TrackedProduct } from "../report";
import { ProductTab, ProductView } from "../sections";
import { useInsights } from "../insights/InsightsContext";
import { wholeDollars } from "../insights/teasers";
import { AlertsToggle } from "./AlertsToggle";
import { AdcvdChip } from "@/components/adcvd/AdcvdChip";
import { useAdcvdFlagged } from "@/components/adcvd/AdcvdTeasers";
import { useNewsCount } from "@/components/duty-calculator/news/NewsTab";

// The top of one of the user's imports (DESIGN_SYSTEM.md §15): one light panel holding everything
// about the import that isn't one of its views. The way back and its actions (alerts on or off,
// reset, remove) along the top, then what it is (flag, HTS code, country of origin, description)
// with, on the calculator's views, the fields that can change (value, date, mode) beside it, then
// its views as one row of tabs along the bottom edge, each with what's waiting on it. It scrolls away with the page, so it
// never takes up room while reading a view. Duty, Compare and History are the calculator's own
// tabs, so the calculator shows none of its own here.

// What a savings check found on it, or would find: the most one option takes off a shipment
const useBestSaving = (key: string) => {
  const insights = useInsights();
  if (insights.unlocked.has(key)) return Math.max(0, ...(insights.savings.get(key) ?? []).map((s) => s.usd));
  return insights.lockedBest.get(key) ?? 0;
};

export const ProductHeader = ({
  row,
  tab,
  onTab,
  onBack,
  onRemove,
  onReset,
  inputs,
  actions,
  historyChanges = 0,
}: {
  row: TrackedProduct;
  tab: ProductView;
  onTab: (tab: ProductTab) => void;
  onBack: () => void;
  onRemove: () => void;
  // Clears what's been set on it (value, mode, program, answers); only when something has been
  onReset?: () => void;
  // The fields that can change (value, date, mode), beside what it is, on the calculator's views
  inputs?: ReactNode;
  // Before alerts and remove (Share)
  actions?: ReactNode;
  // How many times its rates changed, on the History tab
  historyChanges?: number;
}) => {
  const { entry } = row;
  const saving = useBestSaving(row.key);
  const adcvd = useAdcvdFlagged(entry.element.htsno, entry.country.code);
  const news = useNewsCount(entry.element.htsno, entry.country.code);
  // Each view, with what's waiting on it: AD/CVD on Duty (it's duty too), the changes and news on
  // Changes, savings found (always "up to"); Audits marked Beta
  const tabs: { id: ProductView; label: string; count?: number; badge?: string; badgeTone?: "success" | "warning" | "neutral" }[] = [
    { id: "overview", label: "Overview" },
    { id: "duty", label: "Duty", badge: adcvd ? "AD/CVD may apply" : undefined, badgeTone: "warning" },
    { id: "compare", label: "Compare" },
    { id: "changes", label: "Changes", count: historyChanges + (news ?? 0) || undefined },
    { id: "savings", label: "Savings", badge: saving > 0.005 ? `Up to ${wholeDollars(saving)}` : undefined, badgeTone: "success" },
    { id: "audit", label: "Audits", badge: "Beta", badgeTone: "warning" },
  ];
  return (
    <header className={`${tt.panel} flex flex-col`} aria-label={`${entry.element.htsno} from ${entry.country.name}`}>
      <div className="flex flex-col gap-4 px-5 pb-4 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-base-content/70 hover:text-base-content">
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Back
          </button>
          <div className="flex items-center gap-2">
            {actions}
            <AlertsToggle productKey={row.key} />
            {onReset && (
              <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={onReset} title="Clear the value, mode, program and answers set on it">
                <ArrowPathIcon className="h-4 w-4" aria-hidden />
                Reset
              </button>
            )}
            <button type="button" className={`${ui.button({ variant: "ghost", size: "sm" })} hover:text-error`} onClick={onRemove}>
              <TrashIcon className="h-4 w-4" aria-hidden />
              Remove
            </button>
          </div>
        </div>

        {/* What it is, and the fields that can change beside it */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tt-soft text-2xl" aria-hidden>
              {entry.country.flag}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className={`${mono.className} m-0 text-2xl font-semibold leading-none tracking-tight text-base-content`}>{entry.element.htsno}</h1>
                <span className="text-sm font-medium text-base-content/70">From {entry.country.name}</span>
                <AdcvdChip code={entry.element.htsno} country={entry.country.code} />
              </div>
              <p className="m-0 line-clamp-1 max-w-3xl text-sm text-base-content/60" title={row.description}>
                {row.description}
              </p>
            </div>
          </div>
          {inputs && <div className="w-full lg:w-auto lg:min-w-120 lg:max-w-160 lg:flex-1">{inputs}</div>}
        </div>
      </div>
      {/* Its views, as pills at the foot of the header card */}
      <div className="px-5 pb-4 sm:px-6">
        <TabBar label="This import" options={tabs} value={tab} onChange={onTab} />
      </div>
    </header>
  );
};
