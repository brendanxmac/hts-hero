"use client";

// Where the money goes in a quick estimate: base duty and each tariff, fees last, each in its
// color everywhere (partColors)
import type { MicroEstimate } from "@/libs/hts-micro-estimate";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { formatPct } from "@/components/duty-calculator/lib/format";
import { partColors } from "@/components/ui/charts/partColors";

// Each part as its rate on the shipment's value (rates, not dollars: true at any value)
export const CostBar = ({ slices, customsValue }: { slices: MicroEstimate["slices"]; customsValue: number }) => {
  const colors = partColors(slices.map((s) => s.label));
  const rate = (amount: number) => formatPct(Math.round((amount / customsValue) * 10000) / 100);
  return (
    <StackedBar size="sm" className="px-6 py-4" formatValue={rate} showShare={false} parts={slices.map((s) => ({ ...s, color: colors[s.label] }))} />
  );
};
