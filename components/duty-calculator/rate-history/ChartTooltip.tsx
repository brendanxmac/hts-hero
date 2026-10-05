import { HistorySegment } from "@/tariffs/engine-v2/history";
import { PAD, TOOLTIP_WIDTH } from "./chartGeometry";
import { dateRange, shortDate } from "./format";
import { Layer } from "./types";
import * as ui from "@/components/ui/styles";

// The hovered segment's total and its layers, beside the crosshair on whichever side has
// more room
export const ChartTooltip = ({
  segment,
  amounts,
  layers,
  show,
  crosshairX,
  width,
  pickDay,
}: {
  segment: HistorySegment;
  // Amount per layer in this segment
  amounts: Map<string, number>;
  layers: Layer[];
  show: (amount: number) => string;
  crosshairX: number;
  // The chart's width
  width: number;
  // The day a click would pick, when there's a pointer to click with
  pickDay: string | null;
}) => {
  const onRight = crosshairX < width / 2;
  return (
    <div
      className={`${ui.tooltip} absolute z-10 w-52 px-3 py-2.5`}
      style={{
        top: PAD.top - 6,
        ...(onRight
          ? { left: Math.min(crosshairX + 10, Math.max(width - TOOLTIP_WIDTH, 0)) }
          : { right: Math.min(width - crosshairX + 10, Math.max(width - TOOLTIP_WIDTH, 0)) }),
      }}
      role="status"
    >
      <div className="text-xs leading-snug text-base-content/60">
        <div className="font-medium text-base-content/70">{dateRange(segment)}</div>
      </div>
      <div className="mt-1 text-base font-semibold leading-none tabular-nums text-base-content">
        {show(segment.result.totalDuty)}
      </div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {layers
          .filter((l) => (amounts.get(l.label) ?? 0) > 0)
          .reverse()
          .map((l) => (
            <li key={l.label} className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-x-1.5 text-xs leading-tight">
              <span className="mt-1 h-2 w-2 rounded" style={{ background: l.color }} aria-hidden />
              <span className="text-base-content/70">{l.label}</span>
              <span className="col-start-2 font-semibold tabular-nums text-base-content">
                {show(amounts.get(l.label) ?? 0)}
              </span>
            </li>
          ))}
      </ul>
      {pickDay && (
        <div className="mt-2 border-t border-base-300 pt-1.5 text-xs text-primary font-medium">
          Click to use {shortDate(pickDay)} as the entry date
        </div>
      )}
    </div>
  );
};
