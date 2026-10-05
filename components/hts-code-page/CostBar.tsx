"use client";

// Where the money goes in a quick estimate: base duty and each tariff in chart order, fees last
import type { MicroEstimate } from "@/libs/hts-micro-estimate";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { formatMoney } from "@/components/duty-calculator/lib/format";
import { CHART_COLORS, FEES_COLOR } from "@/components/ui/theme";

export const CostBar = ({ slices }: { slices: MicroEstimate["slices"] }) => (
  <StackedBar
    size="sm"
    className="px-5 py-3"
    formatValue={formatMoney}
    parts={slices.map((s, i) => ({
      ...s,
      color: s.label === "Customs fees" ? FEES_COLOR : CHART_COLORS[i % CHART_COLORS.length],
    }))}
  />
);
