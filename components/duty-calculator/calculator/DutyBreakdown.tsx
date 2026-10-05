"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { Statement } from "../results";
import { formatDate } from "../lib/format";
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
}: {
  result: NonNullable<TariffFinder["result"]>;
  customsValue: number;
  unitLabel: string;
  sliceColors: Record<string, string>;
  highlight: string | null;
  onHighlight: (label: string | null) => void;
  linesDetail: LinesDetail;
  onLinesDetailChange: (detail: LinesDetail) => void;
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
            {linesDetail === "full"
              ? ", with the reason it applies and its legal text"
              : ""}
          </p>
        </div>
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
    <Statement
      result={result}
      customsValue={customsValue}
      unitLabel={unitLabel}
      sliceColors={sliceColors}
      highlight={highlight}
      onHighlight={onHighlight}
      compact={linesDetail === "compact"}
    />
  </section>
);
