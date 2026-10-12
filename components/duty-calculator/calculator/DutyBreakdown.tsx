"use client";

import { ReactNode } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { Statement } from "../results";
import { sameBasis } from "../results/Statement";
import { formatDate, formatMoney } from "../lib/format";
import { LineChanges } from "../lib/useLineChanges";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { TariffFinder } from "../lib/useTariffFinder";

// The duty lines as one tight row each, or with their program, dates and legal text
export type LinesDetail = "compact" | "full";

// Each duty and fee on the entry, in a card with a Compact / Full toggle
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
  onLinesDetailChange: (detail: LinesDetail) => void;
  // Inside the card, between its heading and the lines (In plain English)
  summary?: ReactNode;
  // In the heading, beside Compact / Full (the calculator's "Explain this", signed out)
  headerAction?: ReactNode;
  // Inside the card, under the lines (the headings checked but not applied)
  footer?: ReactNode;
  // What the last answer or trade program changed: summed up over the lines and marked in them
  changes?: LineChanges | null;
  onClearChanges?: () => void;
  // Signed out: the plain-English why on each line is locked
  lockWhy?: boolean;
}) => (
  <section
    className={ui.card}
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
        {headerAction}
        <SegmentedControl<LinesDetail>
          label="Line detail"
          size="sm"
          options={[
            { id: "compact", label: "Compact" },
            { id: "full", label: "Full" },
          ] as const}
          value={linesDetail}
          onChange={onLinesDetailChange}
        />
        </div>
      </div>
    </div>
    {summary}
    {/* {changes && <ChangeSummary result={result} changes={changes} onClear={onClearChanges} />} */}
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

// One line over the table saying what the last change did, in money and in lines
const ChangeSummary = ({
  result,
  changes,
  onClear,
}: {
  result: NonNullable<TariffFinder["result"]>;
  changes: LineChanges;
  onClear?: () => void;
}) => {
  const diff = result.totalDuty - changes.totalDutyBefore;
  const added = Object.values(changes.byCode).filter((c) => c.kind === "added").length;
  const moved = Object.values(changes.byCode).filter((c) => c.kind === "changed").length;
  const removed = changes.removed.length;
  const parts = [
    removed && `${removed} ${removed === 1 ? "line" : "lines"} removed`,
    added && `${added} added`,
    moved && `${moved} changed`,
  ].filter(Boolean);
  const lower = diff < -0.005;
  return (
    <div
      role="status"
      className={`mx-5 sm:mx-6 mb-3 mt-2 flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm ${lower ? "bg-success/10" : Math.abs(diff) < 0.005 ? "bg-base-200" : "bg-error/10"}`}
    >
      <span className="text-base-content">
        Your last change{" "}
        {Math.abs(diff) < 0.005 ? (
          "didn't change the total duty"
        ) : (
          <>
            {lower ? "lowered" : "raised"} the total duty by{" "}
            <b className={lower ? "text-success" : "text-error"}>{formatMoney(Math.abs(diff))}</b>
          </>
        )}
        {parts.length > 0 && <span className="text-base-content/70"> · {parts.join(", ")}, highlighted below</span>}
      </span>
      {onClear && (
        <button type="button" className="rounded p-1 text-base-content/50 hover:bg-base-300 hover:text-base-content" aria-label="Hide the changes" onClick={onClear}>
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
