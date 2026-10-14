"use client";

import * as tt from "@/components/ui/styles/tracker";
import { formatDate, todayIso } from "../../duty-calculator/lib/format";
import { TRACKER_PATH } from "../sections";

// The Overview's greeting and the date rates are worked out for
const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

// The catalog tab, with the Add products dialog open (ProductCatalog reads ?add=)
export const openAddProducts = (method: "paste" | "csv" = "paste") =>
  window.history.pushState(null, "", `${TRACKER_PATH}?tab=catalog&add=${method}`);

export const OverviewHeader = ({ title }: { title?: string }) => (
  <header className="flex flex-wrap items-center gap-3 px-1">
    <div className="flex min-w-56 flex-1 flex-col">
      <span className="text-sm text-base-content/60">Rates as of {formatDate(todayIso())}</span>
      <h1 className={`${tt.display} m-0 text-2xl font-semibold text-base-content`}>{title ?? greeting()}</h1>
    </div>
  </header>
);
