"use client";

// The simple view: what you'll pay in plain language, then one line per program
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { formatMoney, formatPct } from "../lib/format";
import { programName } from "./labels";

export const SimpleSummary = ({
  result,
  customsValue,
  openQuestions,
  onShowDetails,
}: {
  result: CalculationResult;
  customsValue: number;
  openQuestions: number;
  // Leave out to hide the "questions could change this" button (the page has its own)
  onShowDetails?: () => void;
}) => {
  const dutyAndFees = result.totalDuty + result.totalFees;
  const effectiveRate =
    customsValue > 0 ? (dutyAndFees / customsValue) * 100 : 0;

  // One line per program, in plain language
  const byProgram = new Map<string, number>();
  result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .forEach((l) =>
      byProgram.set(
        programName(l.program),
        (byProgram.get(programName(l.program)) ?? 0) + l.amount,
      ),
    );
  const rows: [string, number][] = [
    ["Base duty", result.base.amount],
    ...Array.from(byProgram),
    ["Customs fees (MPF, HMF)", result.totalFees],
  ];

  return (
    <div className="p-6 sm:p-10 flex flex-col items-center text-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className={ui.label}>You&apos;ll pay about</div>
        <div className={ui.metric.hero}>{formatMoney(dutyAndFees)}</div>
        <p className="text-base text-base-content/70 max-w-md">
          in duties and fees on {formatMoney(customsValue)} of goods,{" "}
          <span className="tabular-nums font-semibold text-base-content">
            {formatPct(Math.round(effectiveRate * 100) / 100)}
          </span>{" "}
          of their value. Landed cost{" "}
          <span className="tabular-nums font-semibold text-base-content">
            {formatMoney(customsValue + dutyAndFees)}
          </span>
          .
        </p>
      </div>

      <dl className="w-full max-w-md divide-y divide-base-300 border-y border-base-300 text-left">
        {rows.map(([label, amount]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <dt className="text-base text-base-content/70">{label}</dt>
            <dd className="tabular-nums text-base font-semibold">
              {formatMoney(amount)}
            </dd>
          </div>
        ))}
      </dl>

      {openQuestions > 0 && onShowDetails && (
        <button
          type="button"
          className={ui.button({ size: "sm" })}
          onClick={onShowDetails}
        >
          <InformationCircleIcon className="w-4 h-4 text-primary" />
          {openQuestions === 1
            ? "1 question could change this amount"
            : `${openQuestions} questions could change this amount`}
        </button>
      )}
    </div>
  );
};
