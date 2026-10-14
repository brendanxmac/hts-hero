import { StackedBar } from "@/components/ui/charts/StackedBar";
import { formatRate } from "../../formatRate";
import { programColors } from "../../programColors";
import { RatePart, shortProgram } from "../../report";

// Rates as bars on one scale (StackedBar's fill), each split into its base duty and tariffs, so a
// lower rate is a shorter bar and what it drops is plain to see. Each tariff has its color from
// every other screen (programColors), with a legend of every part; segments name themselves on hover.

export interface RateBar {
  label: string;
  pct: number;
  parts: RatePart[];
}

export const RateBars = ({ bars }: { bars: RateBar[] }) => {
  const colors = programColors(bars);
  const max = Math.max(...bars.map((b) => b.pct), 0.01);
  const keys = Object.keys(colors).filter((k) => bars.some((b) => b.parts.some((p) => p.key === k)));
  return (
    <div className="flex flex-col gap-3">
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-base-content/70">{bar.label}</span>
            <span className="font-semibold tabular-nums text-base-content">{formatRate(bar.pct)}</span>
          </div>
          <StackedBar
            parts={bar.parts.map((p) => ({ label: shortProgram(p.key), amount: p.pct, color: colors[p.key] }))}
            formatValue={formatRate}
            size="sm"
            shape="pill"
            fill={bar.pct / max}
            legend={false}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-base-content/70">
        {keys.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[k] }} aria-hidden />
            {shortProgram(k)}
          </span>
        ))}
      </div>
    </div>
  );
};
