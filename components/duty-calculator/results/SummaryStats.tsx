// Summary figures: total duty and effective rate, fees, duty + fees, landed cost
import * as ui from "@/components/ui/styles";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { formatMoney, formatPct } from "../lib/format";

export const SummaryStats = ({
  result,
  customsValue,
  standalone,
}: {
  result: CalculationResult;
  customsValue: number;
  // In a card of its own, rather than above the statement
  standalone?: boolean;
}) => {
  const effectiveRate =
    customsValue > 0 ? (result.totalDuty / customsValue) * 100 : 0;
  const dutyAndFees = result.totalDuty + result.totalFees;
  return (
    // 1px gaps over the border color draw the dividers at every breakpoint
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.45fr_1fr_1fr_1fr] gap-px bg-base-300 ${standalone ? "" : "border-b border-base-300"}`}
    >
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 p-5 sm:p-6 bg-base-100">
        <div className={ui.label}>Total duty</div>
        <div className={`${ui.metric.primary} mt-2`}>
          {formatMoney(result.totalDuty)}
        </div>
        <div className="tabular-nums mt-2 text-sm text-base-content/70">
          {formatPct(Math.round(effectiveRate * 100) / 100)} effective rate
        </div>
      </div>
      <Stat
        label="Fees"
        value={formatMoney(result.totalFees)}
        note={result.fees.map((f) => f.id.toUpperCase()).join(" + ") || "None"}
      />
      <Stat
        label="Duty + fees"
        value={formatMoney(dutyAndFees)}
        note="Payable to CBP"
      />
      <Stat
        label="Landed cost"
        value={formatMoney(customsValue + dutyAndFees)}
        note={`On ${formatMoney(customsValue)} customs value`}
        className="col-span-2 sm:col-span-1"
      />
    </div>
  );
};

const Stat = ({
  label,
  value,
  note,
  className = "",
}: {
  label: string;
  value: string;
  note: string;
  className?: string;
}) => (
  <div className={`p-5 sm:p-6 bg-base-100 ${className}`}>
    <div className={ui.label}>{label}</div>
    <div className={`${ui.metric.secondary} mt-2`}>{value}</div>
    <div className="mt-2 text-sm text-base-content/60">{note}</div>
  </div>
);
