"use client";

import { ReactNode } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useCardClass } from "@/components/ui/Card";
import * as ui from "@/components/ui/styles";
import { Statement } from "../results";
import { sameBasis } from "../results/Statement";
import { formatDate, formatMoney } from "../lib/format";
import { ChangeSummary } from "../results/ChangeSummary";
import { LineChanges } from "../lib/useLineChanges";
import { TariffFinder } from "../lib/useTariffFinder";

// The duty lines as one tight row each, or with their program, dates and legal text
export type LinesDetail = "compact" | "full";

// Each duty and fee on the entry, in a card with a Compact / Detailed toggle
export const DutyBreakdown = ({
  result,
  customsValue,
  unitLabel,
  sliceColors,
  highlight,
  onHighlight,
  linesDetail,
  onLinesDetailChange,
  summary,
  headerAction,
  footer,
  changes,
  onClearChanges,
  lockWhy,
}: {
  result: NonNullable<TariffFinder["result"]>;
  customsValue: number;
  unitLabel: string;
  sliceColors: Record<string, string>;
  highlight: string | null;
  onHighlight: (label: string | null) => void;
  linesDetail: LinesDetail;
  // Without it, no Compact / Detailed toggle (visitors get the one, detailed view)
  onLinesDetailChange?: (detail: LinesDetail) => void;
  // Inside the card, between its heading and the lines (In plain English)
  summary?: ReactNode;
  // In the heading, right of Compact / Detailed: "Explain this" (the plain-English explanation,
  // or the pitch for it signed out)
  headerAction?: ReactNode;
  // Inside the card, under the lines (the headings checked but not applied)
  footer?: ReactNode;
  // What the last answer or trade program changed: marked in the lines (summed up under the
  // adjustment in Possible Adjustments)
  changes?: LineChanges | null;
  onClearChanges?: () => void;
  // Signed out: the plain-English why on each line is locked
  lockWhy?: boolean;
}) => {
  const cardClass = useCardClass();
  return (
    <section
      className={cardClass}
      aria-labelledby="duty-breakdown-title"
    >
      <div className="px-5 sm:px-6 pt-5 pb-3 sm:pb-1 border-b border-base-300 sm:border-b-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id="duty-breakdown-title" className={ui.cardTitle}>
              Duty Breakdown
            </h3>
            <p className={`${ui.caption} mt-0.5`}>
              Each duty and fee on this entry for {formatDate(result.asOf)}
              {sameBasis(result, customsValue) ? `, all charged on ${formatMoney(customsValue)}` : ""}
              {linesDetail === "full"
                ? ", with the reason it applies and its legal text"
                : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
          {onLinesDetailChange && (
            <SegmentedControl<LinesDetail>
              label="Line detail"
              size="sm"
              options={[
                { id: "compact", label: "Compact" },
                { id: "full", label: "Detailed" },
              ] as const}
              value={linesDetail}
              onChange={onLinesDetailChange}
            />
          )}
          {headerAction}
          </div>
        </div>
      </div>
      {summary}
      {/* Under the adjustment that was changed, normally; here only when that isn't known */}
      {changes && !changes.source && (
        <ChangeSummary result={result} changes={changes} onClear={onClearChanges} where="below" className="mx-5 sm:mx-6 mb-3 mt-2" />
      )}
      <Statement
        changes={changes}
        lockWhy={lockWhy}
        result={result}
        customsValue={customsValue}
        unitLabel={unitLabel}
        sliceColors={sliceColors}
        highlight={highlight}
        onHighlight={onHighlight}
        compact={linesDetail === "compact"}
      />
      {footer}
    </section>
  );
};

