import type { MicroEstimate } from "@/libs/hts-micro-estimate";
import { formatMoney, formatPct } from "@/components/duty-calculator/lib/format";
import { StatStrip } from "@/components/ui/StatStrip";

// A quick estimate's headline figures as rates on the shipment's value (true at any value), with
// the dollars on the example shipment as notes; the landed cost stays in dollars
export const EstimateStats = ({ estimate, customsValue }: { estimate: MicroEstimate; customsValue: number }) => {
  const dutyAndFees = estimate.totalDuty + estimate.totalFees;
  const rate = (amount: number) => formatPct(Math.round((amount / customsValue) * 10000) / 100);
  return (
    <StatStrip
      framed={false}
      lead
      className="border-b border-base-300"
      stats={[
        { label: "Total duty", value: rate(estimate.totalDuty), note: `${formatMoney(estimate.totalDuty)} on this shipment` },
        { label: "Fees", value: rate(estimate.totalFees), note: `${estimate.fees} · ${formatMoney(estimate.totalFees)}` },
        { label: "Duty + fees", value: rate(dutyAndFees), note: "Payable to CBP" },
        { label: "Landed cost", value: formatMoney(customsValue + dutyAndFees), note: `On ${formatMoney(customsValue)} customs value`, wide: true },
      ]}
    />
  );
};
