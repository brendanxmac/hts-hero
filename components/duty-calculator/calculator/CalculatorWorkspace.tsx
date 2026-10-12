"use client";

import {
  ReactNode,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { useHts } from "@/contexts/HtsContext";
import { Question } from "@/tariffs/engine-v2/types";
import * as ui from "@/components/ui/styles";
import { GatedAnalysis } from "@/components/tariff-tracker/product/analysis/GatedAnalysis";
import { productFromFinder } from "@/components/tariff-tracker/report";
import { Segmented } from "../fields/Segmented";
import { whatClaimingDoes, whatItWouldDo } from "../lib/explain";
import { formatMoney } from "../lib/format";
import { plainReasons } from "../lib/plainReason";
import { sortBySpecificity } from "../lib/questions";
import { useLineChanges } from "../lib/useLineChanges";
import { MAX_COMPARE, TariffFinder } from "../lib/useTariffFinder";
import { ProhibitedNotice } from "../notices/ProhibitedNotice";
import { VerifiedNotice } from "../notices/VerifiedNotice";
import { RateHistoryCard } from "../rate-history";
import {
  CompareView,
  CostBar,
  NotAppliedPanel,
  PreferenceClaim,
  QuestionsPanel,
  slices,
  SummaryStats,
} from "../results";
import { DutyBreakdown, LinesDetail } from "./DutyBreakdown";
import { EmptyState } from "./EmptyState";
import { EntryBar } from "./EntryBar";
import { QualifyLink, QualifyTeaser, RefundTeaser } from "./PremiumTeasers";
import { DutySummary } from "./DutySummary";
import { AccountCta } from "./AccountCta";
import { ResultsHeader } from "./ResultsHeader";
import { useCanSeeWhy, WhyLocked } from "./WhyGate";
import { ResultsSkeleton } from "./ResultsSkeleton";
import { useStickyColumn } from "./useStickyColumn";

// The Tariff Calculator, as on /duty-calculator, the country pages and the Tariff Tracker's
// Calculator tab. The entry details run across the top; the results below have three tabs:
// - Duty: the totals full width, then the duty breakdown (with the headings checked but not
//   applied at its foot) beside the possible adjustments (and the Tracker's qualification check,
//   teased), which move with the page. What the
//   last answer changed is marked in the breakdown.
// - Duty Over Time: the rate history, full width, free; then the Tracker's refund check, teased
// - Compare: other origins side by side, then the Analysis: this import's duty from every origin
//   (a free account)

type ResultsTab = "duty" | "history" | "compare";

const TABS: { id: ResultsTab; label: string }[] = [
  { id: "duty", label: "Duty" },
  { id: "history", label: "Duty Over Time" },
  { id: "compare", label: "Compare" },
];

export const CalculatorWorkspace = ({
  f,
  actions,
  empty,
  page,
}: {
  f: TariffFinder;
  // Beside Share in the results' heading (Add to catalog, Track this import)
  actions?: ReactNode;
  // In place of the results before there are any (the default prompt otherwise)
  empty?: ReactNode;
  // For analytics: where the account gates sit
  page: "calculator" | "tracker_calculator";
}) => {
  const { htsElements } = useHts();
  const searchParams = useSearchParams();
  const { result, selectedElement, country } = f;

  // Compare is the finder's own view (so a shared link opens on it); Duty Over Time is this
  // page's. `view=analysis` (links from the MCP server) opens on Compare, where the Analysis is.
  const [historyOpen, setHistoryOpen] = useState(
    () => searchParams.get("view") === "history",
  );
  const tab: ResultsTab = historyOpen
    ? "history"
    : f.view === "compare"
      ? "compare"
      : "duty";
  useEffect(() => {
    if (searchParams.get("view") === "analysis") f.changeView("compare");
    // Once, on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const changeTab = (next: ResultsTab) => {
    setHistoryOpen(next === "history");
    // The address says Compare only while it's open
    f.changeView(next === "compare" ? "compare" : "detailed");
  };

  // Kept here, so they survive switching tabs
  const [highlight, setHighlight] = useState<string | null>(null);
  const [linesDetail, setLinesDetail] = useState<LinesDetail>("compact");
  const [adjustmentsRef, adjustmentsTop] = useStickyColumn();
  // What the last answer or trade program changed, marked in the breakdown until the next change
  const lineChanges = useLineChanges(
    result,
    JSON.stringify([
      f.selectedElement?.htsno,
      f.country?.code,
      f.customsValue,
      f.quantity,
      f.entryDate,
      f.transportMode,
    ]),
  );

  // The Analysis is worked out only while Compare is open, and only when an input changes (a beat
  // behind typing): the same product keeps the same identity, so it isn't redone needlessly
  const inputsKey = useDeferredValue(
    JSON.stringify([
      f.selectedElement?.htsno,
      f.country?.code,
      f.customsValue,
      f.quantity,
      f.entryDate,
      f.transportMode,
      f.claimedPreference,
      f.answers,
    ]),
  );
  const product = useMemo(
    () => (tab === "compare" ? productFromFinder(f, htsElements) : null),
    // The inputs, through their key
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, inputsKey, htsElements],
  );

  const ready = Boolean(result && selectedElement && country && !f.loading);
  const sliceColors = result
    ? slices(result)
        .filter((s) => s.amount > 0)
        .reduce<Record<string, string>>(
          (colors, s) => ({ ...colors, [s.label]: s.color }),
          {},
        )
    : {};

  // The possible adjustments hold still while answering: every question the entry had before any
  // answer, plus any an answer brings up, in one order, each with what it would do in plain English
  const unadjusted = f.unadjustedResult;
  const stableQuestions = useMemo(() => {
    if (!result) return [];
    const byId = new Map<string, Question>();
    [...(unadjusted?.questions ?? []), ...result.questions].forEach((q) =>
      byId.set(
        q.input.id,
        result.questions.find((r) => r.input.id === q.input.id) ?? q,
      ),
    );
    return sortBySpecificity(Array.from(byId.values()), result.asOf);
  }, [result, unadjusted]);
  const questionNotes = useMemo(
    () =>
      result
        ? Object.fromEntries(
            stableQuestions.map((q) => [
              q.input.id,
              whatItWouldDo(q, result, unadjusted ?? null) ?? "",
            ]),
          )
        : {},
    [stableQuestions, result, unadjusted],
  );
  const preferences =
    (unadjusted?.availablePreferences.length ? unadjusted : result)
      ?.availablePreferences ?? [];
  // A claimed program has no live amount (the engine says what unclaimed ones would do): it keeps
  // showing what claiming it did
  const rememberedPrefs = useRef<Record<string, number>>({});
  Object.entries(f.preferenceChanges).forEach(([symbol, v]) => {
    if (Math.abs(v) >= 0.005) rememberedPrefs.current[symbol] = v;
  });
  const prefImpacts = f.claimedPreference
    ? {
        ...f.preferenceChanges,
        [f.claimedPreference]: rememberedPrefs.current[f.claimedPreference],
      }
    : f.preferenceChanges;
  // Possible Adjustments in three tiers: anyone sees each adjustment and what it could change the
  // total by; a free account adds what each would change (WhyGate: signed out, one locked line for
  // the whole panel); the Tracker's guided check works out which should (QualifyLink, QualifyTeaser)
  const { canSee: canSeeWhy, loading: whyLoading } = useCanSeeWhy();
  // Shown while there's anything to adjust, before or after answering
  const hasAdjustments = stableQuestions.length > 0 || preferences.length > 0;
  const explainReason = useMemo(
    () =>
      result ? plainReasons(result, unadjusted?.questions) : (r: string) => r,
    [result, unadjusted],
  );
  // Under the total: the most one adjustment could take off (a trade program, or confirming the
  // goods qualify for an exemption), or how many could change it. Savings are only ever "could".
  const bestSaving = Math.min(
    0,
    ...Object.values(f.preferenceChanges),
    ...Object.entries(f.impacts)
      .filter(([id]) => id.startsWith("confirm:") && !f.answers[id])
      .map(([, v]) => v),
  );
  const openAdjustments =
    f.openQuestions +
    (result && result.availablePreferences.length > 0 && !f.claimedPreference
      ? 1
      : 0);
  const toAdjustments = () =>
    document
      .getElementById("possible-adjustments")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  const totalNote =
    bestSaving < -0.005 ? (
      <button
        type="button"
        onClick={toAdjustments}
        className="mt-2 inline-flex rounded-md bg-success/10 px-2 py-1 text-left text-xs font-semibold text-success hover:bg-success/15"
      >
        Could be up to {formatMoney(Math.abs(bestSaving))} lower if your goods
        qualify →
      </button>
    ) : openAdjustments > 0 ? (
      <button
        type="button"
        onClick={toAdjustments}
        className="mt-2 inline-flex rounded-md bg-primary/10 px-2 py-1 text-left text-xs font-semibold text-primary hover:bg-primary/15"
      >
        {openAdjustments} possible{" "}
        {openAdjustments === 1 ? "adjustment" : "adjustments"} could change this
        →
      </button>
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <EntryBar
        f={f}
        title="Entry Details"
        description="Enter the details of your import to get a duty estimate"
      />

      {f.loading ? (
        <ResultsSkeleton />
      ) : !ready || !result || !selectedElement || !country ? (
        (empty ?? <EmptyState f={f} />)
      ) : (
        <section
          className="flex flex-col gap-4"
          aria-labelledby="results-heading"
          aria-live="polite"
        >
          <ResultsHeader
            f={f}
            result={result}
            selectedElement={selectedElement}
            country={country}
            actions={actions}
            viewSwitch={
              <div className="w-full min-w-0 basis-full sm:w-96 sm:basis-auto">
                <Segmented
                  label="Results"
                  options={TABS}
                  value={tab}
                  onChange={changeTab}
                  compact
                />
              </div>
            }
          />
          <VerifiedNotice f={f} />
          {/* A ban is about this country's goods; the comparison shows several countries */}
          {tab !== "compare" && (
            <ProhibitedNotice prohibitions={result.prohibitions} />
          )}

          {tab === "duty" && (
            <>
              <AccountCta f={f} result={result} bestSaving={bestSaving} page={page} />
              <div className={ui.card}>
                <SummaryStats
                  result={result}
                  customsValue={f.customsValue}
                  standalone
                  note={totalNote}
                />
                <CostBar
                  result={result}
                  highlight={highlight}
                  onHighlight={setHighlight}
                  className="border-t border-base-300 px-5 py-4 sm:px-6"
                />
              </div>
              {result.warnings.length > 0 && (
                <ul className={`${ui.notice("warning")} flex flex-col gap-1.5`}>
                  {result.warnings.map((w) => (
                    <li key={w} className={`${ui.bodySm} flex gap-2`}>
                      <ExclamationTriangleIcon
                        className="mt-px h-4 w-4 shrink-0 text-warning"
                        aria-hidden
                      />
                      {w}
                    </li>
                  ))}
                </ul>
              )}
              <div
                className={
                  hasAdjustments
                    ? "grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
                    : ""
                }
              >
                <div className="min-w-0">
                  <DutyBreakdown
                    result={result}
                    customsValue={f.customsValue}
                    unitLabel={f.unitLabel}
                    sliceColors={sliceColors}
                    highlight={highlight}
                    onHighlight={setHighlight}
                    linesDetail={linesDetail}
                    onLinesDetailChange={setLinesDetail}
                    summary={<DutySummary f={f} result={result} bestSaving={bestSaving} />}
                    footer={
                      <NotAppliedPanel
                        lines={result.lines}
                        bare
                        explain={explainReason}
                        lockedReason={canSeeWhy ? undefined : <WhyLocked label="See why it doesn't apply" where="not_applied" />}
                      />
                    }
                    lockWhy={!canSeeWhy}
                    changes={lineChanges.changes}
                    onClearChanges={lineChanges.clear}
                  />
                </div>
                {hasAdjustments && (
                  // Beside the duty lines, so an answer's effect shows in them; it moves with the
                  // page while the breakdown is taller
                  <aside
                    id="possible-adjustments"
                    ref={adjustmentsRef}
                    className="min-w-0 scroll-mt-4 lg:sticky"
                    style={{ top: adjustmentsTop }}
                    aria-label="Possible adjustments"
                  >
                    <QuestionsPanel
                      questions={result.questions}
                      stableQuestions={stableQuestions}
                      notes={canSeeWhy ? questionNotes : {}}
                      notice={
                        !whyLoading && !canSeeWhy ? (
                          <div className="flex flex-col gap-1 rounded-lg bg-base-200/70 px-3 py-2.5">
                            <WhyLocked label="See what each adjustment would change, in plain English" where="adjustments" bars={false} className="text-sm" />
                            <span className={ui.caption}>Free account, takes less than 30 seconds.</span>
                          </div>
                        ) : undefined
                      }
                      qualifyLink={<QualifyLink page={page} />}
                      answers={f.answers}
                      impacts={f.impacts}
                      lines={[...result.lines, ...(unadjusted?.lines ?? [])]}
                      onAnswer={f.answer}
                      asOf={result.asOf}
                      htsCode={result.htsCode}
                      preference={
                        preferences.length > 0 ? (
                          <PreferenceClaim
                            options={preferences}
                            value={f.preferences[country.code] ?? ""}
                            onChange={(symbol) =>
                              f.setPreference(country.code, symbol)
                            }
                            impacts={prefImpacts}
                            stable
                            notes={canSeeWhy ? Object.fromEntries(preferences.map((p) => [p.symbol, whatClaimingDoes(p.name)])) : {}}
                            qualifyLink={<QualifyLink page={page} />}
                          />
                        ) : undefined
                      }
                    />
                    <div className="mt-4">
                      <QualifyTeaser page={page} bestSaving={bestSaving} />
                    </div>
                  </aside>
                )}
              </div>
            </>
          )}

          {tab === "history" && (
            // Free for everyone; checking past entries for a refund is the Tracker's
            <>
              <RateHistoryCard
                f={f}
                sliceColors={sliceColors}
                highlight={highlight}
                onHighlight={setHighlight}
              />
              <RefundTeaser
                page={page}
                history={f.history}
                customsValue={f.customsValue}
              />
            </>
          )}

          {tab === "compare" && (
            <>
              <CompareView
                entries={f.compareEntries}
                countries={f.countries}
                max={MAX_COMPARE}
                onAdd={(added) => f.changeCountries([...f.countries, added])}
                customsValue={f.customsValue}
                onRemove={f.removeCountry}
                onPreferenceChange={f.setPreference}
                onViewDetails={(c) => {
                  setHistoryOpen(false);
                  f.viewCountryDetails(c);
                }}
              />
              {product && <GatedAnalysis product={product} page={page} />}
            </>
          )}
        </section>
      )}
    </div>
  );
};
