import type { MicroEstimate } from "@/libs/hts-micro-estimate";
import { formatMoney, formatPct } from "@/components/duty-calculator/lib/format";
import * as ui from "@/components/ui/styles";

// A quick estimate's headline figures, as in the calculator
export const EstimateStats = ({ estimate, customsValue }: { estimate: MicroEstimate; customsValue: number }) => {
  const dutyAndFees = estimate.totalDuty + estimate.totalFees;
  const effectiveRate = (estimate.totalDuty / customsValue) * 100;
  return (
    // 1px gaps over the border color draw the dividers at every breakpoint
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.45fr_1fr_1fr_1fr] gap-px bg-base-300 border-b border-base-300">
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 px-5 py-3 bg-base-100">
        <div className={ui.label}>Total duty</div>
        <div className={`${ui.metric.primaryCompact} mt-1`}>
          {formatMoney(estimate.totalDuty)}
        </div>
        <div className="mt-1 text-sm tabular-nums text-base-content/70">
          {formatPct(Math.round(effectiveRate * 100) / 100)} effective rate
        </div>
      </div>
      <Stat label="Fees" value={formatMoney(estimate.totalFees)} note={estimate.fees} />
      <Stat label="Duty + fees" value={formatMoney(dutyAndFees)} note="Payable to CBP" />
      <Stat
        label="Landed cost"
        value={formatMoney(customsValue + dutyAndFees)}
        note={`On ${formatMoney(customsValue)} customs value`}
        className="col-span-2 sm:col-span-1"
      />
    </div>
  );
};

const Stat = ({ label, value, note, className = "" }: { label: string; value: string; note: string; className?: string }) => (
  <div className={`px-5 py-3 bg-base-100 ${className}`}>
    <div className={ui.label}>{label}</div>
    <div className={`${ui.metric.secondaryCompact} mt-1`}>{value}</div>
    <div className={`${ui.caption} mt-1`}>{note}</div>
  </div>
);
