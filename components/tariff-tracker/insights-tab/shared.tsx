"use client";

import { ReactNode, useMemo } from "react";
import { ArrowRightIcon, LightBulbIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CHART_COLORS, PRIMARY_MARK, SERIES_COLORS, MUTED_MARK } from "@/components/ui/theme";
import { useHtsSections } from "@/contexts/HtsSectionsContext";
import { todayIso } from "../../duty-calculator/lib/format";
import { useInsights } from "../insights/InsightsContext";
import { FilterState } from "../filters";
import { programColors } from "../programColors";
import { BASE_PART, shortProgram } from "../report";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { chapterOf, DimensionId, GroupRow, InsightsInput } from "./lib/data";

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
  // Past the five series colors (everything shown at once), the chart colors, then a quiet gray
  const palette = [...SERIES_COLORS, ...CHART_COLORS];
  return Object.fromEntries(rows.map((r, i) => [r.key, distinct ? (palette[i] ?? MUTED_MARK) : PRIMARY_MARK]));
};

// Under a chart that shows only the biggest few: the rest, drawn in the same chart, or back to
// the few
// `more` says what's hidden: "8 more countries"
export const ShowAll = ({ more, open, onToggle }: { more: string; open: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={open}
    className="self-start rounded-full text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
  >
    {open ? "Show fewer" : `Show ${more}`}
  </button>
);

// ── Into Your Imports ──

// The imports table's filters that pick out one group's imports (imports/importColumns.tsx: the
// country, chapter, tariff and alerts columns), or null where the table has no such filter (base
// duty, rate bands, 12-month change)
export const importsFilter = (dimension: DimensionId, key: string): FilterState | null => {
  switch (dimension) {
    case "country":
      return { country: [key] };
    case "chapter":
      return { chapter: [key] };
    case "program":
      // The table's tariff filter goes by short name, base duty aside
      return key === BASE_PART ? null : { tariffs: [shortProgram(key)] };
    case "alerts":
      return { alerts: [key] };
    default:
      return null;
  }
};

// Opens Your Imports with only these filters on
export const useShowInImports = () => {
  const { replaceFilters } = useTracker();
  const nav = useTrackerNav();
  return (filters: FilterState) => {
    replaceFilters(filters);
    nav.openTab("catalog");
  };
};

// Every group's filters together (a chapter and a tariff), or null if any has none
export const combineFilters = (...parts: (FilterState | null)[]): FilterState | null =>
  parts.some((p) => !p) ? null : Object.assign({}, ...parts);

// How many imports the table will show with these filters (a short tariff name can match two
// tariffs: two Section 301 actions)
const useMatchCount = (filters: FilterState | null) => {
  const { products, trackedKeys } = useTracker();
  if (!filters) return 0;
  return products.filter(
    (p) =>
      (!filters.country || filters.country.includes(p.entry.country.code)) &&
      (!filters.chapter || filters.chapter.includes(chapterOf(p))) &&
      (!filters.tariffs || p.parts.some((part) => part.key !== BASE_PART && filters.tariffs.includes(shortProgram(part.key)))) &&
      (!filters.alerts || filters.alerts.includes(trackedKeys.has(p.key) ? "on" : "off"))
  ).length;
};

// The button that opens a group's imports: "Show these 7 imports"
export const ShowInImports = ({ filters }: { filters: FilterState | null }) => {
  const show = useShowInImports();
  const count = useMatchCount(filters);
  if (!filters || count < 1) return null;
  return (
    <button type="button" className={`${ui.button({ variant: "secondary", size: "sm" })} shrink-0 gap-1.5`} onClick={() => show(filters)}>
      {count === 1 ? "Show this import" : `Show these ${count.toLocaleString("en-US")} imports`}
      <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
};

// One insight: a panel with a title, what it shows, an optional control on the right, and the
// lesson in one line at the foot
export const InsightPanel = ({
  id,
  title,
  subtitle,
  action,
  lesson,
  lessonAction,
  className = "",
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
  lesson?: ReactNode;
  // Beside the lesson: the imports it's about, in Your Imports
  lessonAction?: ReactNode;
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
    {lesson && <Lesson action={lessonAction}>{lesson}</Lesson>}
  </section>
);

// What a chart teaches, in a sentence
export const Lesson = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className={`${tt.tile} mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm text-base-content`}>
    <p className="m-0 flex min-w-0 flex-1 basis-64 items-start gap-2.5">
      <LightBulbIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <span>{children}</span>
    </p>
    {action}
  </div>
);

// A number inside a sentence
export const Num = ({ children, tone = "primary" }: { children: ReactNode; tone?: "primary" | "error" | "success" | "neutral" }) => (
  <b className={`${tt.numberChip(tone)} whitespace-nowrap tabular-nums`}>{children}</b>
);
