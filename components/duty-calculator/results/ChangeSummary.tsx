"use client";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { formatMoney } from "../lib/format";
import { LineChanges } from "../lib/useLineChanges";
import { TariffFinder } from "../lib/useTariffFinder";

// What the last change did, in money and in lines: under the adjustment that was changed in
// Possible Adjustments (or over the duty lines, when that isn't known). The lines it names are
// marked in the Duty Breakdown.
export const ChangeSummary = ({
  result,
  changes,
  onClear,
  where,
  className = "",
}: {
  result: NonNullable<TariffFinder["result"]>;
  changes: LineChanges;
  onClear?: () => void;
  // Where the marked lines are, from here
  where: "below" | "breakdown";
  className?: string;
}) => {
  const diff = result.totalDuty - changes.totalDutyBefore;
  const lower = diff < -0.005;
  return (
    <div
      role="status"
      className={`${className} flex items-start justify-between gap-3 rounded-lg px-4 py-2.5 text-sm ${lower ? "bg-success/10" : Math.abs(diff) < 0.005 ? "bg-base-200" : "bg-error/10"}`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-base-content">
          {where === "below" && <>{changes.cause ?? "Your last change"} </>}
          {where === "breakdown" ? (Math.abs(diff) < 0.005 ? "Didn't change the total duty" : lower ? "Lowered the total duty by " : "Raised the total duty by ") : Math.abs(diff) < 0.005 ? "didn't change the total duty" : lower ? "lowered the total duty by " : "raised the total duty by "}
          {Math.abs(diff) >= 0.005 && <b className={lower ? "text-success" : "text-error"}>{formatMoney(Math.abs(diff))}</b>}
          {changes.details.length > 0 && (
            <span className="text-base-content/60"> ({where === "below" ? "highlighted below" : "highlighted in the Duty Breakdown"}):</span>
          )}
        </span>
        {changes.details.length > 0 && (
          <ul className="flex list-disc flex-col gap-0.5 pl-4 text-xs text-base-content/80 marker:text-base-content/30">
            {changes.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </div>
      {onClear && (
        <button type="button" className="rounded p-1 text-base-content/50 hover:bg-base-300 hover:text-base-content" aria-label="Hide the changes" onClick={onClear}>
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
