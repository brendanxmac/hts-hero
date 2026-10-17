// Summary figures: total duty and effective rate, fees, duty + fees, landed cost, each saying
// which customs value the dollars are for (the entered one, or the default)
import React from "react";
import { StatStrip } from "@/components/ui/StatStrip";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { formatMoney, formatPct } from "../lib/format";
import { valueLabel } from "../lib/valueBasis";

export const SummaryStats = ({
  result,
  customsValue,
  note,
}: {
  result: CalculationResult;
  customsValue: number;
  // Under the total (what the possible adjustments could do)
  note?: React.ReactNode;
}) => {
  const effectiveRate =
    customsValue > 0 ? (result.totalDuty / customsValue) * 100 : 0;
  const dutyAndFees = result.totalDuty + result.totalFees;
  return (
    <StatStrip
      framed={false}
      lead
      stats={[
        {
          label: "Total duty",
          value: formatMoney(result.totalDuty),
          note: `${formatPct(Math.round(effectiveRate * 100) / 100)} of the ${valueLabel(customsValue)} value`,
          extra: note,
        },
        { label: "Fees", value: formatMoney(result.totalFees), note: result.fees.map((f) => f.id.toUpperCase()).join(" + ") || "None" },
        { label: "Duty + fees", value: formatMoney(dutyAndFees), note: "Payable to CBP" },
        { label: "Landed cost", value: formatMoney(customsValue + dutyAndFees), note: `On ${valueLabel(customsValue)} value`, wide: true },
      ]}
    />
  );
};
