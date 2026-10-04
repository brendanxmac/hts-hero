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
import { mono } from "./duty-calculator/font";
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
import styles from "./duty-calculator/theme.module.css";

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
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 flex flex-col gap-4">
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
    className="grid grid-cols-2 gap-1 self-start w-full sm:w-auto rounded-[10px] border border-[var(--dc-border)] bg-[var(--dc-surface-2)] p-1.5 scroll-mt-4"
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
          className={`flex items-center gap-3 rounded-lg px-3 sm:px-4 py-2.5 text-left transition-[background-color,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dc-accent)] ${active
            ? "bg-[var(--dc-surface)] shadow-[0_1px_2px_rgba(15,18,23,0.12),0_0_0_1px_var(--dc-border)]"
            : "hover:bg-[var(--dc-surface-3)]"
            }`}
        >
          <span
            className={`hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${active
              ? "bg-[var(--dc-accent-soft)] text-[var(--dc-accent)]"
              : "bg-[var(--dc-surface-3)] text-[var(--dc-text-3)]"
              }`}
            aria-hidden
          >
            <Icon className="w-[18px] h-[18px]" />
          </span>
          <span className="flex flex-col min-w-0">
            <span className={`text-[14.5px] font-semibold ${active ? "text-[var(--dc-text)]" : "text-[var(--dc-text-2)]"}`}>
              {label}
            </span>
            <span className="text-[12.5px] text-[var(--dc-text-3)] truncate">{note}</span>
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
                  className="text-[22px] font-semibold tracking-tight"
                >
                  Duty Estimate
                </h2>
                <p className="mt-1 text-[14px] text-[var(--dc-text-2)]">
                  <span
                    className={`${mono.className} font-semibold text-[var(--dc-text)]`}
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
                <div className={styles.card}>
                  <SimpleSummary
                    result={result}
                    customsValue={f.customsValue}
                    openQuestions={f.openQuestions}
                    onShowDetails={() => f.changeView("detailed")}
                  />
                </div>
              ) : (
                <>
                  <div className={`${styles.card} overflow-hidden`}>
                    <SummaryStats
                      result={result}
                      customsValue={f.customsValue}
                      standalone
                    />
                    <CostBar
                      result={result}
                      highlight={highlight}
                      onHighlight={setHighlight}
                      className="px-5 sm:px-6 py-4 border-t border-[var(--dc-border)]"
                    />
                  </div>
                  <section
                    className={`${styles.card} overflow-hidden`}
                    aria-labelledby="duty-breakdown-title"
                  >
                    <div className="px-5 sm:px-6 pt-5 pb-3 sm:pb-1 border-b border-[var(--dc-border)] sm:border-b-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 id="duty-breakdown-title" className="text-[16px] font-semibold">
                            Duty Breakdown
                          </h3>
                          <p className="mt-0.5 text-[12.5px] text-[var(--dc-text-3)]">
                            Each duty and fee on this entry for {formatDate(result.asOf)}
                            {linesDetail === "full"
                              ? ", with the reason it applies and its legal text"
                              : ""}
                          </p>
                        </div>
                        <div
                          className={`${styles.segmented} !h-8 shrink-0`}
                          role="radiogroup"
                          aria-label="Line detail"
                        >
                          {(
                            [
                              ["compact", "Compact"],
                              ["full", "Full"],
                            ] as const
                          ).map(([id, label]) => (
                            <button
                              key={id}
                              type="button"
                              role="radio"
                              aria-checked={linesDetail === id}
                              onClick={() => setLinesDetail(id)}
                              className={`${styles.segment} !text-[13px] px-2.5 ${linesDetail === id ? styles.segmentActive : ""}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
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
                    <ul className="flex flex-col gap-1.5 rounded-lg border border-[var(--dc-warning-border)] bg-[var(--dc-warning-soft)] px-4 py-3">
                      {result.warnings.map((w) => (
                        <li
                          key={w}
                          className="flex gap-2 text-[13px] leading-snug text-[var(--dc-warning)]"
                        >
                          <ExclamationTriangleIcon
                            className="w-4 h-4 shrink-0 mt-px"
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
    className={`${styles.card} p-5 flex flex-col gap-3`}
    aria-busy="true"
    aria-label="Loading HTS data"
  >
    <div className={`${styles.skeleton} h-7 w-48`} />
    <div className={`${styles.skeleton} h-24 w-full`} />
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className={`${styles.skeleton} h-10 w-full`} />
    ))}
  </div>
);

const EmptyState = ({ f }: { f: TariffFinder }) => (
  <section className={`${styles.card} p-6 sm:p-10 h-full flex flex-col justify-center`}>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10 items-center">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight">
          {emptyTitle(f)}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--dc-text-2)]">
          You&apos;ll get a line-by-line statement: the base rate, every Chapter
          99 tariff and exemption in effect on your entry date, and customs
          fees, each with the reason it applies.
        </p>
        <ol className="mt-6 flex flex-col gap-3">
          {EMPTY_STEPS.map((step, i) => (
            <li
              key={step}
              className="flex items-start gap-3 text-[14.5px] text-[var(--dc-text)]"
            >
              <span
                className={`${styles.num} flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--dc-accent-soft)] border border-[var(--dc-accent-border)] text-[12px] font-semibold text-[var(--dc-accent)]`}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className={styles.eyebrow}>Try an example</div>
        <ExampleButtons onExample={f.selectExample} />
      </div>
    </div>
  </section>
);
