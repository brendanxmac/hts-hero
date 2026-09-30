"use client";

import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { CompareView } from "../Compare";
import { EntryRail } from "../EntryRail";
import { formatDate, mono } from "../format";
import { BreakdownCard, slices } from "../MoneyBreakdown";
import {
  NotAppliedPanel,
  QuestionsPanel,
  SimpleSummary,
  Statement,
  SummaryStats,
} from "../Results";
import {
  EMPTY_STEPS,
  emptyTitle,
  ExampleButtons,
  ShareButtons,
  VerifiedNotice,
  ViewSwitch,
} from "../shared";
import { TariffFinder } from "../useTariffFinder";
import styles from "../theme.module.css";

// The original redesign's statement and panels, with the entry details in a rail beside them
export const ClassicDesign = ({ f }: { f: TariffFinder }) => {
  const { result, selectedElement, country } = f;
  // The "Where the money goes" slice being hovered, in the chart or the statement
  const [highlight, setHighlight] = useState<string | null>(null);
  const sliceColors = result
    ? slices(result)
        .filter((s) => s.amount > 0)
        .reduce<Record<string, string>>(
          (colors, s) => ({ ...colors, [s.label]: s.color }),
          {},
        )
    : {};
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[292px_minmax(0,1fr)] gap-5 items-start">
      <EntryRail
        f={f}
        title="Entry details"
        description="Results update as you type"
      />

      {/* Results */}
      <div className="min-w-0">
        {f.loading ? (
          <ResultsSkeleton />
        ) : !result || !selectedElement || !country ? (
          <EmptyState f={f} />
        ) : (
          <section
            className="flex flex-col gap-4"
            aria-labelledby="results-heading"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h2
                  id="results-heading"
                  className="text-[22px] font-semibold tracking-tight"
                >
                  Duty estimate
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
                <ViewSwitch
                  f={f}
                  className={
                    f.compareCountries.length
                      ? "basis-full sm:basis-auto"
                      : "flex-1"
                  }
                />
                <ShareButtons f={f} />
              </div>
            </div>

            <VerifiedNotice f={f} />

            {f.comparing ? (
              <CompareView
                entries={f.compareEntries}
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
              // Questions get their own column only when there's room beside the rail
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                <div className="xl:col-span-8 flex flex-col gap-4 min-w-0">
                  <div className={`${styles.card} overflow-hidden`}>
                    <SummaryStats
                      result={result}
                      customsValue={f.customsValue}
                    />
                    <Statement
                      result={result}
                      customsValue={f.customsValue}
                      unitLabel={f.unitLabel}
                      sliceColors={sliceColors}
                      highlight={highlight}
                      onHighlight={setHighlight}
                    />
                  </div>
                  {result.warnings.length > 0 && (
                    <ul className="flex flex-col gap-1.5 rounded-xl border border-[var(--dc-warning-border)] bg-[var(--dc-warning-soft)] px-4 py-3">
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
                  <NotAppliedPanel lines={result.lines} />
                </div>
                <aside className="xl:col-span-4 flex flex-col gap-4">
                  <BreakdownCard
                    f={f}
                    result={result}
                    layout="chart"
                    highlight={highlight}
                    onHighlight={setHighlight}
                  />
                  {result.questions.length > 0 && (
                    <QuestionsPanel
                      questions={result.questions}
                      answers={f.answers}
                      impacts={f.impacts}
                      lines={result.lines}
                      onAnswer={f.answer}
                    />
                  )}
                </aside>
              </div>
            )}
          </section>
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
  <section className={`${styles.card} p-6 sm:p-10`}>
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
