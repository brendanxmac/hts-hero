"use client";

import { ReactNode } from "react";
import * as tt from "@/components/ui/styles/tracker";

// The calculator's four views, as plain tabs along the top of its one box. A tab can carry a
// count (adjustments to check, duty changes) as a small badge, or a short hint in quiet text, so
// the next click looks worth making without shouting.
export type CalculatorTab = "results" | "adjustments" | "compare" | "history";

export interface TabInfo {
  id: CalculatorTab;
  label: string;
  hint?: string;
  badge?: number;
}

// actions: the import's own buttons, at the right end of the bar
export const CalculatorTabs = ({
  tabs,
  value,
  onChange,
  actions,
}: {
  tabs: TabInfo[];
  value: CalculatorTab;
  onChange: (tab: CalculatorTab) => void;
  actions?: ReactNode;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-base-300 px-4 lg:px-6">
    <div
      role="tablist"
      aria-label="Calculator views"
      className="flex flex-wrap gap-1"
    >
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`dc-tab-${t.id}`}
            aria-selected={active}
            aria-controls={`dc-panel-${t.id}`}
            onClick={() => onChange(t.id)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 pb-3.5 pt-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              active
                ? "border-primary text-base-content"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            <span className={`${tt.display} text-[0.95rem] font-semibold`}>
              {t.label}
            </span>
            {t.badge !== undefined && t.badge > 0 && (
              <span
                className={`min-w-5 rounded-full px-1.5 text-center text-[0.7rem] font-bold leading-5 tabular-nums ${
                  active ? "bg-primary text-primary-content" : "bg-primary/10 text-primary"
                }`}
              >
                {t.badge}
              </span>
            )}
            {t.hint && (
              <span
                className={`text-xs ${active ? "text-base-content/60" : "text-base-content/50"}`}
              >
                {t.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
    {actions && <div className="flex items-center gap-2 py-2">{actions}</div>}
  </div>
);
