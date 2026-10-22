// Summary figures: the effective duty rate leads (true at any value), then total duty, fees and
// landed cost, each dollar figure saying which customs value it's for. Duty + fees is left to
// the breakdown table below.
import React from "react";
import { StatStrip } from "@/components/ui/StatStrip";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { formatMoney, formatPct } from "../lib/format";
import { valueAmount } from "../lib/valueBasis";

export const SummaryStats = ({
  result,
  customsValue,
  note,
}: {
  result: CalculationResult;
  customsValue: number;
  // Under the rate (what the possible adjustments could do)
  note?: React.ReactNode;
}) => {
  const effectiveRate =
    customsValue > 0 ? (result.totalDuty / customsValue) * 100 : 0;
  return (
    <StatStrip
      framed={false}
      lead
      // Four equal columns: the rate is short ("36.5%") while the dollars grow with the value, so
      // the rate's column gives them room
      columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      stats={[
        {
          label: "Duty rate",
          value: formatPct(Math.round(effectiveRate * 100) / 100),
          tone: "primary",
          note: "Of the customs value",
          extra: note,
        },
        { label: "Total duty", value: formatMoney(result.totalDuty), note: `On ${valueAmount(customsValue)} customs value` },
        { label: "Fees", value: formatMoney(result.totalFees), note: result.fees.map((f) => f.id.toUpperCase()).join(" + ") || "None" },
        {
          label: "Landed cost",
          value: formatMoney(customsValue + result.totalDuty + result.totalFees),
          note: `On ${valueAmount(customsValue)} customs value`,
          wide: true,
        },
      ]}
    />
  );
};
