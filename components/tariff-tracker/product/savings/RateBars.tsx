import { MUTED_MARK } from "@/components/ui/theme";
import { formatRate } from "../../formatRate";
import { programColors } from "../../programColors";
import { RatePart, shortProgram } from "../../report";

// Rates as bars on one scale, each split into its base duty and tariffs, so a lower rate is a
// shorter bar and what it drops is plain to see. Colors follow the catalog's (programColors), with
// a legend of every part. Each segment names itself on hover.

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
          {/* Runtime widths and series colors (DESIGN_SYSTEM §10) */}
          <div className="flex h-3.5 w-full gap-0.5 overflow-hidden rounded-full" style={{ background: MUTED_MARK }}>
            <div className="flex h-full gap-0.5" style={{ width: `${(bar.pct / max) * 100}%` }}>
              {bar.parts.map((p) => (
                <div
                  key={p.key}
                  className="h-full min-w-1 first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${(p.pct / Math.max(bar.pct, 0.01)) * 100}%`, background: colors[p.key] }}
                  title={`${shortProgram(p.key)}: ${formatRate(p.pct)}`}
                />
              ))}
            </div>
          </div>
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
