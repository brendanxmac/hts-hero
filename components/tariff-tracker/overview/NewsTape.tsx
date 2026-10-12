"use client";

import { useMemo } from "react";
import { todayIso } from "../../duty-calculator/lib/format";
import { shortDate } from "../../duty-calculator/rate-history/format";
import { tariffNews } from "./lib/news";

// The latest tariff news across the schedule: tariffs added, coming and ended, and HTS
// revisions, as pills with a colored dot
const DOTS = { error: "bg-error", success: "bg-success", warning: "bg-warning", primary: "bg-primary" };

export const NewsTape = () => {
  const items = useMemo(() => tariffNews(todayIso()), []);
  if (!items.length) return null;
  return (
    <div aria-label="Tariff news" className="flex items-center gap-2 overflow-x-auto px-1 pb-1">
      <span className="shrink-0 pr-1 text-xs font-bold uppercase tracking-wider text-base-content/60">Tariff news</span>
      {items.map((n) => (
        <span key={`${n.tag}-${n.date}`} className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3.5 text-sm">
          <span className={`h-2 w-2 rounded-full ${DOTS[n.tone]}`} aria-hidden />
          <b className="font-semibold text-base-content">{n.tag}</b>
          <span className="text-base-content/70">
            {n.text} · {shortDate(n.date, n.date.slice(0, 4) !== todayIso().slice(0, 4))}
          </span>
        </span>
      ))}
    </div>
  );
};
