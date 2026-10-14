"use client";

// Where the money goes in a quick estimate: base duty and each tariff, fees last, each in its
// color everywhere (partColors)
import type { MicroEstimate } from "@/libs/hts-micro-estimate";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { formatMoney } from "@/components/duty-calculator/lib/format";
import { partColors } from "@/components/ui/charts/partColors";

export const CostBar = ({ slices }: { slices: MicroEstimate["slices"] }) => {
  const colors = partColors(slices.map((s) => s.label));
  return <StackedBar size="sm" className="px-6 py-4" formatValue={formatMoney} parts={slices.map((s) => ({ ...s, color: colors[s.label] }))} />;
};
