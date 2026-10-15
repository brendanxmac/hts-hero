import type { MicroEstimate } from "@/libs/hts-micro-estimate";
import { formatMoney, formatPct } from "@/components/duty-calculator/lib/format";
import { StatStrip } from "@/components/ui/StatStrip";

// A quick estimate's headline figures, as in the calculator
export const EstimateStats = ({ estimate, customsValue }: { estimate: MicroEstimate; customsValue: number }) => {
  const dutyAndFees = estimate.totalDuty + estimate.totalFees;
  const effectiveRate = (estimate.totalDuty / customsValue) * 100;
  return (
    <StatStrip
      framed={false}
      lead
      className="border-b border-base-300"
      stats={[
        { label: "Total duty", value: formatMoney(estimate.totalDuty), note: `${formatPct(Math.round(effectiveRate * 100) / 100)} effective rate` },
        { label: "Fees", value: formatMoney(estimate.totalFees), note: estimate.fees },
        { label: "Duty + fees", value: formatMoney(dutyAndFees), note: "Payable to CBP" },
        { label: "Landed cost", value: formatMoney(customsValue + dutyAndFees), note: `On ${formatMoney(customsValue)} customs value`, wide: true },
      ]}
    />
  );
};
