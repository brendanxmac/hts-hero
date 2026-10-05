"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalculatorIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { Country } from "../constants/countries";
import { HtsElement } from "../interfaces/hts";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import { TariffWatcher } from "./tariff-watcher/TariffWatcher";
import { CompareView } from "./duty-calculator/Compare";
import { EntryRail } from "./duty-calculator/EntryRail";
import { formatDate } from "./duty-calculator/format";
import { mono } from "./ui/font";
import { CostBar, slices } from "./duty-calculator/MoneyBreakdown";
import { RateHistoryCard } from "./duty-calculator/RateHistory";
import {
  NotAppliedPanel,
  PreferenceClaim,
  QuestionsPanel,
  SimpleSummary,
  Statement,
  SummaryStats,
} from "./duty-calculator/Results";
import {
  EMPTY_STEPS,
  emptyTitle,
  ExampleButtons,
  ShareButtons,
  VerifiedNotice,
  ViewSwitch,
} from "./duty-calculator/shared";
import { Disclaimer, ExploreModal } from "./duty-calculator/shared";
import {
  MAX_COMPARE,
  TariffFinder,
  useTariffFinder,
} from "./duty-calculator/useTariffFinder";
import styles from "./ui/theme.module.css";
import { SegmentedControl } from "./ui/SegmentedControl";
import * as ui from "./ui/styles";

type Tool = "calculator" | "watcher";

const TOOLS: { id: Tool; label: string; note: string; Icon: typeof CalculatorIcon }[] = [
  { id: "calculator", label: "Tariff Calculator", note: "Duty on one shipment", Icon: CalculatorIcon },
  { id: "watcher", label: "Tariff Watcher", note: "Rates for all your products", Icon: EyeIcon },
];

// The Tariff Watcher tab is hidden while it moves to a page of its own; the calculator shows alone
const SHOW_TOOL_TABS = false;

// Kept on this device until watch lists are saved to accounts
const WATCH_LIST_KEY = "hts-hero-tariff-watch-list";

export const TariffFinderPage = () => {
  const f = useTariffFinder();
  const searchParams = useSearchParams();
  const [selectedTool, setTool] = useState<Tool>(() =>
    searchParams.get("tool") === "watcher" ? "watcher" : "calculator",
  );
  const tool: Tool = SHOW_TOOL_TABS ? selectedTool : "calculator";
  const [watchList, setWatchList] = useState("");

  // Follow ?tool= when it changes, e.g. from the links in the hero
  const toolParam = searchParams.get("tool");
  useEffect(() => {
    setTool(toolParam === "watcher" ? "watcher" : "calculator");
  }, [toolParam]);


  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WATCH_LIST_KEY);
      if (saved) setWatchList(saved);
    } catch {
      // Storage can be unavailable (private mode); the list starts empty
    }
  }, []);

  const changeWatchList = (text: string) => {
    setWatchList(text);
    try {
      window.localStorage.setItem(WATCH_LIST_KEY, text);
    } catch {
      // Not critical
    }
  };

  const changeTool = (next: Tool) => {
    setTool(next);
    trackEvent(MixpanelEvent.TARIFF_TOOL_CHANGED, { tool: next });
    // null state: Next.js then keeps its router in sync with the new address
    const url = new URL(window.location.href);
    if (next === "watcher") url.searchParams.set("tool", "watcher");
    else url.searchParams.delete("tool");
    window.history.replaceState(null, "", url.toString());
  };

  // A product from the watch list, in full, in the calculator
  const openInCalculator = (element: HtsElement, country: Country) => {
    f.selectElement(element, "tariff_watcher");
    f.changeCountries([country]);
    f.changeView("detailed");
    changeTool("calculator");
    trackEvent(MixpanelEvent.TARIFF_WATCHER_OPENED_IN_CALCULATOR, {
      hts_code: element.htsno,
      country_code: country.code,
    });
    document.getElementById("tariff-tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={`${styles.root} w-full pb-20`}>
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
        {SHOW_TOOL_TABS && <ToolTabs tool={tool} onChange={changeTool} />}
        <div
          {...(SHOW_TOOL_TABS
            ? {
              role: "tabpanel",
              id: `tool-panel-${tool}`,
              "aria-labelledby": `tool-tab-${tool}`,
            }
            : {})}
        >
          {tool === "watcher" ? (
            <TariffWatcher
              f={f}
              text={watchList}
              onTextChange={changeWatchList}
              onOpenInCalculator={openInCalculator}
            />
          ) : (
            <Layout f={f} />
          )}
        </div>
        <Disclaimer />
      </div>
      <ExploreModal f={f} />
    </div>
  );
};

const ToolTabs = ({ tool, onChange }: { tool: Tool; onChange: (tool: Tool) => void }) => (
  <div
    id="tariff-tools"
    role="tablist"
    aria-label="Tariff tools"
    className="grid grid-cols-2 gap-1 self-start w-full sm:w-auto rounded-lg border border-base-300 bg-base-200 p-1.5 scroll-mt-4"
  >
    {TOOLS.map(({ id, label, note, Icon }) => {
      const active = id === tool;
      return (
        <button
          key={id}
          type="button"
          role="tab"
          id={`tool-tab-${id}`}
          aria-selected={active}
          aria-controls={`tool-panel-${id}`}
          onClick={() => onChange(id)}
          className={`flex items-center gap-3 rounded-md px-3 sm:px-4 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${active
            ? "bg-base-100 shadow-sm ring-1 ring-base-300"
            : "hover:bg-base-300"
            }`}
        >
          <span
            className={`hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${active
              ? "bg-primary/10 text-primary"
              : "bg-base-300 text-base-content/60"
              }`}
            aria-hidden
          >
            <Icon className="w-5 h-5" />
          </span>
          <span className="flex flex-col min-w-0">
            <span className={`text-base font-semibold ${active ? "text-base-content" : "text-base-content/70"}`}>
              {label}
            </span>
            <span className="text-xs text-base-content/60 truncate">{note}</span>
          </span>
        </button>
      );
    })}
  </div>
);

// A column that moves with the page: one that fits below the gap stays there; a taller one scrolls
// until its end is in view, the gap below it, and stays there, so all of it can be reached without
// scrolling it on its own. Returns the ref setter and the sticky offset for the column.
const STICKY_GAP = 16;
const useStickyColumn = () => {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [top, setTop] = useState(STICKY_GAP);
  useEffect(() => {
    if (!el) return;
    const update = () =>
      setTop(
        el.offsetHeight + STICKY_GAP <= window.innerHeight
          ? STICKY_GAP
          : window.innerHeight - el.offsetHeight - STICKY_GAP,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [el]);
  return [setEl, top] as const;
};

// Two columns, 30/70: the entry details with, in the detailed view, the duty over time below them;
// and the results, with the possible adjustments between the duty lines and the headings that
// were checked but don't apply. The results move with the page while the left column is taller.
// Phones get one column: entry details, results, duty over time.
const Layout = ({ f }: { f: TariffFinder }) => {
  const { result, selectedElement, country } = f;
  // The "Where the money goes" slice being hovered, in the chart or the statement
  const [highlight, setHighlight] = useState<string | null>(null);
  // The duty lines as one tight row each, or with their program, dates and legal text
  const [linesDetail, setLinesDetail] = useState<"compact" | "full">("compact");
  const [resultsRef, resultsTop] = useStickyColumn();
  const sliceColors = result
    ? slices(result)
      .filter((s) => s.amount > 0)
      .reduce<Record<string, string>>(
        (colors, s) => ({ ...colors, [s.label]: s.color }),
        {},
      )
    : {};
  const ready = Boolean(result && selectedElement && country && !f.loading);
  const detailed = ready && !f.comparing && f.view === "detailed";
  const hasAdjustments =
    detailed &&
    result !== null &&
    (result.questions.length > 0 || result.availablePreferences.length > 0);

  return (
    <div className="flex flex-col gap-4">

      <div
        className="grid grid-cols-1 gap-x-6 gap-y-4 items-start lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:grid-rows-[auto_auto_1fr]"
      >
        {/* Stretches to the prompt beside it when there are no results yet */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-stretch">
          <EntryRail
            f={f}
            title="Entry Details"
            description="Enter the details of your import to get a duty estimate"
          />
        </div>

        {/* Results, with their heading. They move with the page; before there are any, the
            prompt matches the entry details' height */}
        <div
          ref={resultsRef}
          className={`min-w-0 flex flex-col gap-4 lg:col-start-2 lg:row-start-1 ${ready ? "lg:row-span-3 lg:sticky" : "lg:self-stretch"}`}
          style={ready ? { top: resultsTop } : undefined}
        >
          {ready && result && selectedElement && country && (
            <div
              id="duty-results"
              className="flex flex-wrap items-end justify-between gap-4 scroll-mt-4"
            >
              <div className="min-w-0">
                <h2
                  id="results-heading"
                  className="text-2xl font-semibold tracking-tight text-base-content"
                >
                  Duty Estimate
                </h2>
                <p className="mt-1 text-sm text-base-content/70">
                  <span
                    className={`${mono.className} font-semibold text-base-content`}
                  >
                    {selectedElement.htsno}
                  </span>
                  {" · "}
                  {f.comparing
                    ? f.compareEntries
                      .map((e) => `${e.country.flag} ${e.country.name}`)
                      .join(" vs ")
                    : `${country.flag} ${country.name}`}
                  {" · "}
                  {formatDate(result.asOf)}
                  {" · "}
                  {f.transportLabel}
                </p>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap w-full sm:w-auto items-center gap-2">
                <ViewSwitch f={f} className="basis-full sm:basis-auto" />
                <ShareButtons f={f} />
              </div>
            </div>
          )}
          {f.loading ? (
            <ResultsSkeleton />
          ) : !ready || !result ? (
            <EmptyState f={f} />
          ) : (
            <section
              className="flex flex-col gap-4"
              aria-labelledby="results-heading"
              aria-live="polite"
            >
              <VerifiedNotice f={f} />

              {f.comparing ? (
                <CompareView
                  entries={f.compareEntries}
                  countries={f.countries}
                  max={MAX_COMPARE}
                  onAdd={(added) => f.changeCountries([...f.countries, added])}
                  customsValue={f.customsValue}
                  onRemove={f.removeCountry}
                  onPreferenceChange={f.setPreference}
                  onViewDetails={f.viewCountryDetails}
                />
              ) : f.view === "simple" ? (
                <div className="rounded-lg border border-base-300 bg-base-100 shadow-sm">
                  <SimpleSummary
                    result={result}
                    customsValue={f.customsValue}
                    openQuestions={f.openQuestions}
                    onShowDetails={() => f.changeView("detailed")}
                  />
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
                    <SummaryStats
                      result={result}
                      customsValue={f.customsValue}
                      standalone
                    />
                    <CostBar
                      result={result}
                      highlight={highlight}
                      onHighlight={setHighlight}
                      className="px-5 sm:px-6 py-4 border-t border-base-300"
                    />
                  </div>
                  <section
                    className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm"
                    aria-labelledby="duty-breakdown-title"
                  >
                    <div className="px-5 sm:px-6 pt-5 pb-3 sm:pb-1 border-b border-base-300 sm:border-b-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 id="duty-breakdown-title" className="text-base font-semibold text-base-content">
                            Duty Breakdown
                          </h3>
                          <p className="mt-0.5 text-xs text-base-content/60">
                            Each duty and fee on this entry for {formatDate(result.asOf)}
                            {linesDetail === "full"
                              ? ", with the reason it applies and its legal text"
                              : ""}
                          </p>
                        </div>
                        <SegmentedControl<"compact" | "full">
                          label="Line detail"
                          size="sm"
                          options={[
                            { id: "compact", label: "Compact" },
                            { id: "full", label: "Full" },
                          ] as const}
                          value={linesDetail}
                          onChange={setLinesDetail}
                        />
                      </div>
                    </div>
                    <Statement
                      result={result}
                      customsValue={f.customsValue}
                      unitLabel={f.unitLabel}
                      sliceColors={sliceColors}
                      highlight={highlight}
                      onHighlight={setHighlight}
                      compact={linesDetail === "compact"}
                    />
                  </section>
                  {result.warnings.length > 0 && (
                    <ul className={`${ui.notice("warning")} flex flex-col gap-1.5`}>
                      {result.warnings.map((w) => (
                        <li
                          key={w}
                          className="flex gap-2 text-sm leading-snug text-base-content/70"
                        >
                          <ExclamationTriangleIcon
                            className="w-4 h-4 shrink-0 mt-px text-warning"
                            aria-hidden
                          />
                          {w}
                        </li>
                      ))}
                    </ul>
                  )}
                  {hasAdjustments && result && country && (
                    // Under the duty lines, so an answer's effect shows in the lines above it
                    <aside className="min-w-0" aria-label="Possible adjustments">
                      <QuestionsPanel
                        questions={result.questions}
                        answers={f.answers}
                        impacts={f.impacts}
                        lines={result.lines}
                        onAnswer={f.answer}
                        asOf={result.asOf}
                        htsCode={result.htsCode}
                        preference={
                          result.availablePreferences.length > 0 ? (
                            <PreferenceClaim
                              options={result.availablePreferences}
                              value={f.preferences[country.code] ?? ""}
                              onChange={(symbol) => f.setPreference(country.code, symbol)}
                              impacts={f.preferenceChanges}
                            />
                          ) : undefined
                        }
                      />
                    </aside>
                  )}
                  <NotAppliedPanel lines={result.lines} />
                </>
              )}
            </section>
          )}
        </div>

        {detailed && (
          <div className="min-w-0 lg:col-start-1">
            <RateHistoryCard
              f={f}
              sliceColors={sliceColors}
              highlight={highlight}
              onHighlight={setHighlight}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const ResultsSkeleton = () => (
  <div
    className="p-5 flex flex-col gap-3 rounded-lg border border-base-300 bg-base-100 shadow-sm"
    aria-busy="true"
    aria-label="Loading HTS data"
  >
    <div className={`${ui.skeleton} h-7 w-48`} />
    <div className={`${ui.skeleton} h-24 w-full`} />
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className={`${ui.skeleton} h-10 w-full`} />
    ))}
  </div>
);

const EmptyState = ({ f }: { f: TariffFinder }) => (
  <section className="p-6 sm:p-10 h-full flex flex-col justify-center rounded-lg border border-base-300 bg-base-100 shadow-sm">
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10 items-center">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-base-content">
          {emptyTitle(f)}
        </h2>
        <p className="mt-2 text-base leading-relaxed text-base-content/70">
          You&apos;ll get a line-by-line statement: the base rate, every Chapter
          99 tariff and exemption in effect on your entry date, and customs
          fees, each with the reason it applies.
        </p>
        <ol className="mt-6 flex flex-col gap-3">
          {EMPTY_STEPS.map((step, i) => (
            <li
              key={step}
              className="flex items-start gap-3 text-base text-base-content"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold tabular-nums text-primary"
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="text-xs font-semibold uppercase tracking-wider text-base-content/60">Try an example</div>
        <ExampleButtons onExample={f.selectExample} />
      </div>
    </div>
  </section>
);
