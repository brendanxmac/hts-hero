"use client";

import { ReactNode, useMemo } from "react";
import { LightBulbIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { PRIMARY_MARK, SERIES_COLORS, MUTED_MARK } from "@/components/ui/theme";
import { useHtsSections } from "@/contexts/HtsSectionsContext";
import { todayIso } from "../../duty-calculator/lib/format";
import { useInsights } from "../insights/InsightsContext";
import { programColors } from "../programColors";
import { useTracker } from "../TrackerContext";
import { DimensionId, GroupRow, InsightsInput } from "./lib/data";

// What every insight works from: the catalog, each import's history, chapter names, which imports
// have alerts, and today
export const useInsightsInput = (): InsightsInput & { ready: boolean } => {
  const { products, histories, historyReady } = useInsights();
  const { trackedKeys } = useTracker();
  const { sections } = useHtsSections();
  const today = useMemo(() => todayIso(), []);
  return useMemo(
    () => ({ products, histories, sections, trackedKeys, today, ready: historyReady }),
    [products, histories, sections, trackedKeys, today, historyReady]
  );
};

// A color per group: a tariff keeps its color from every other screen; countries and other
// categories compared side by side take the series colors by rank (five, then a quiet gray);
// a single measure across categories is one color
export const groupColors = (rows: GroupRow[], dimension: DimensionId, distinct: boolean): Record<string, string> => {
  if (dimension === "program") return programColors([{ parts: rows.map((r) => ({ key: r.key, pct: 1 })) }]);
  return Object.fromEntries(rows.map((r, i) => [r.key, distinct ? (SERIES_COLORS[i] ?? MUTED_MARK) : PRIMARY_MARK]));
};

// One insight: a panel with a title, what it shows, an optional control on the right, and the
// lesson in one line at the foot
export const InsightPanel = ({
  id,
  title,
  subtitle,
  action,
  lesson,
  className = "",
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
  lesson?: ReactNode;
  className?: string;
  children: ReactNode;
}) => (
  <section className={`${tt.panel} ${tt.panelPad} flex min-w-0 flex-col gap-5 ${className}`} aria-labelledby={id}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 id={id} className={tt.title}>
          {title}
        </h2>
        <p className={tt.subtitle}>{subtitle}</p>
      </div>
      {action}
    </div>
    {children}
    {lesson && <Lesson>{lesson}</Lesson>}
  </section>
);

// What a chart teaches, in a sentence
export const Lesson = ({ children }: { children: ReactNode }) => (
  <p className={`${tt.tile} m-0 mt-auto flex items-start gap-2.5 px-4 py-3 text-sm text-base-content`}>
    <LightBulbIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
    <span>{children}</span>
  </p>
);

// A number inside a sentence
export const Num = ({ children, tone = "primary" }: { children: ReactNode; tone?: "primary" | "error" | "success" | "neutral" }) => (
  <b className={`${tt.numberChip(tone)} whitespace-nowrap tabular-nums`}>{children}</b>
);
