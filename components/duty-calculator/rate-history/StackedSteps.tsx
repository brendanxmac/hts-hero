import { HistorySegment } from "@/tariffs/engine-v2/history";
import { TREND_STROKE, trendOf } from "./trend";
import { Layer } from "./types";

// The chart's data: stacked layers (one rectangle per segment, each with a crisp top edge),
// the total stepping at each change, and a marker where the duty changed
export const StackedSteps = ({
  history,
  stacks,
  layers,
  hovered,
  highlight,
  value,
  x,
  y,
}: {
  history: HistorySegment[];
  // Amount per layer, per segment
  stacks: Map<string, number>[];
  layers: Layer[];
  // The hovered segment, or -1
  hovered: number;
  highlight?: string | null;
  value: (amount: number) => number;
  x: (iso: string) => number;
  y: (v: number) => number;
}) => (
  <>
    {/* Stacked layers, one rectangle per segment */}
    {history.map((s, i) => {
      let stacked = 0;
      const faded = hovered >= 0 && hovered !== i;
      return (
        <g
          key={s.from}
          style={{ opacity: faded ? 0.55 : 1, transition: "opacity 150ms ease" }}
        >
          {layers.map((layer) => {
            const amount = value(stacks[i].get(layer.label) ?? 0);
            if (amount <= 0) return null;
            const top = y(stacked + amount);
            const bottom = y(stacked);
            stacked += amount;
            const dim = highlight && highlight !== layer.label;
            return (
              <rect
                key={layer.label}
                x={x(s.from)}
                y={top}
                width={Math.max(x(s.to) - x(s.from), 0.5)}
                height={Math.max(bottom - top, 0)}
                fill={layer.color}
                style={{
                  opacity: dim ? 0.12 : 0.26,
                  transition: "opacity 150ms ease",
                }}
              />
            );
          })}
          {/* A crisp top edge for each layer */}
          {(() => {
            let edge = 0;
            return layers.map((layer) => {
              const amount = value(stacks[i].get(layer.label) ?? 0);
              if (amount <= 0) return null;
              edge += amount;
              const dim = highlight && highlight !== layer.label;
              return (
                <line
                  key={layer.label}
                  x1={x(s.from)}
                  x2={x(s.to)}
                  y1={y(edge)}
                  y2={y(edge)}
                  stroke={layer.color}
                  strokeWidth={1.25}
                  style={{ opacity: dim ? 0.25 : 0.9, transition: "opacity 150ms ease" }}
                />
              );
            });
          })()}
        </g>
      );
    })}

    {/* The total, stepping at each change */}
    <path
      d={history
        .map((s, i) => {
          const yy = y(value(s.result.totalDuty));
          return `${i === 0 ? `M${x(s.from)},${yy}` : `V${yy}`} H${x(s.to)}`;
        })
        .join(" ")}
      fill="none"
      className="stroke-base-content"
      strokeWidth={2}
      strokeLinejoin="round"
    />

    {/* Markers where the duty changed */}
    {history.slice(1).map((s, i) => {
      const change = s.result.totalDuty - history[i].result.totalDuty;
      return (
        <circle
          key={s.from}
          cx={x(s.from)}
          cy={y(value(s.result.totalDuty))}
          r={4}
          className={`fill-base-100 ${TREND_STROKE[trendOf(change)]}`}
          strokeWidth={2}
        />
      );
    })}
  </>
);
