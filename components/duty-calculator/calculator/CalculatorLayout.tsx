"use client";

import { ReactNode, useState } from "react";
import * as ui from "@/components/ui/styles";
import { CompareView } from "../results";
import { slices } from "../results";
import { RateHistoryCard } from "../rate-history";
import { SimpleSummary } from "../results";
import { VerifiedNotice } from "../notices/VerifiedNotice";
import { MAX_COMPARE, TariffFinder } from "../lib/useTariffFinder";
import { DetailedResults } from "./DetailedResults";
import { LinesDetail } from "./DutyBreakdown";
import { EmptyState } from "./EmptyState";
import { EntryRail } from "./EntryRail";
import { ResultsHeader } from "./ResultsHeader";
import { ResultsSkeleton } from "./ResultsSkeleton";
import { useStickyColumn } from "./useStickyColumn";

// Two columns, 30/70: the entry details with, in the detailed view, the duty over time below them;
// and the results, with the possible adjustments between the duty lines and the headings that
// were checked but don't apply. The results move with the page while the left column is taller.
// Phones get one column: entry details, results, duty over time.
// fixedProduct: the code and origin come from the host, so the rail only edits the shipment
export const CalculatorLayout = ({
  f,
  fixedProduct = false,
  railTitle = "Entry Details",
  railDescription = "Enter the details of your import to get a duty estimate",
  resultActions,
}: {
  f: TariffFinder;
  fixedProduct?: boolean;
  railTitle?: string;
  railDescription?: string;
  // Beside Copy and Share in the results' heading
  resultActions?: ReactNode;
}) => {
  const { result, selectedElement, country } = f;
  // The "Where the money goes" slice being hovered, in the chart or the statement
  const [highlight, setHighlight] = useState<string | null>(null);
  // Kept here, so it survives switching views
  const [linesDetail, setLinesDetail] = useState<LinesDetail>("compact");
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
          <EntryRail f={f} title={railTitle} description={railDescription} fixedProduct={fixedProduct} />
        </div>

        {/* Results, with their heading. They move with the page; before there are any, the
            prompt matches the entry details' height */}
        <div
          ref={resultsRef}
          className={`min-w-0 flex flex-col gap-4 lg:col-start-2 lg:row-start-1 ${ready ? "lg:row-span-3 lg:sticky" : "lg:self-stretch"}`}
          style={ready ? { top: resultsTop } : undefined}
        >
          {ready && result && selectedElement && country && (
            <ResultsHeader
              f={f}
              result={result}
              selectedElement={selectedElement}
              country={country}
              allowCompare={!fixedProduct}
              actions={resultActions}
            />
          )}
          {f.loading ? (
            <ResultsSkeleton />
          ) : !ready || !result || !country ? (
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
                <div className={ui.card}>
                  <SimpleSummary
                    result={result}
                    customsValue={f.customsValue}
                    openQuestions={f.openQuestions}
                    onShowDetails={() => f.changeView("detailed")}
                  />
                </div>
              ) : (
                <DetailedResults
                  f={f}
                  result={result}
                  country={country}
                  showAdjustments={hasAdjustments}
                  sliceColors={sliceColors}
                  highlight={highlight}
                  onHighlight={setHighlight}
                  linesDetail={linesDetail}
                  onLinesDetailChange={setLinesDetail}
                />
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
