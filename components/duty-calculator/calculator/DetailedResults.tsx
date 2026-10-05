"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { CostBar } from "../results";
import { NotAppliedPanel, PreferenceClaim, QuestionsPanel, SummaryStats } from "../results";
import { TariffFinder } from "../lib/useTariffFinder";
import { DutyBreakdown, LinesDetail } from "./DutyBreakdown";

// The detailed view: the totals and where the money goes, each duty line, warnings, the
// possible adjustments and the headings that were checked but don't apply
export const DetailedResults = ({
  f,
  result,
  country,
  showAdjustments,
  sliceColors,
  highlight,
  onHighlight,
  linesDetail,
  onLinesDetailChange,
}: {
  f: TariffFinder;
  result: NonNullable<TariffFinder["result"]>;
  country: NonNullable<TariffFinder["country"]>;
  showAdjustments: boolean;
  sliceColors: Record<string, string>;
  highlight: string | null;
  onHighlight: (label: string | null) => void;
  linesDetail: LinesDetail;
  onLinesDetailChange: (detail: LinesDetail) => void;
}) => (
  <>
    <div className={ui.card}>
      <SummaryStats
        result={result}
        customsValue={f.customsValue}
        standalone
      />
      <CostBar
        result={result}
        highlight={highlight}
        onHighlight={onHighlight}
        className="px-5 sm:px-6 py-4 border-t border-base-300"
      />
    </div>
    <DutyBreakdown
      result={result}
      customsValue={f.customsValue}
      unitLabel={f.unitLabel}
      sliceColors={sliceColors}
      highlight={highlight}
      onHighlight={onHighlight}
      linesDetail={linesDetail}
      onLinesDetailChange={onLinesDetailChange}
    />
    {result.warnings.length > 0 && (
      <ul className={`${ui.notice("warning")} flex flex-col gap-1.5`}>
        {result.warnings.map((w) => (
          <li
            key={w}
            className={`${ui.bodySm} flex gap-2`}
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
    {showAdjustments && (
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
);
