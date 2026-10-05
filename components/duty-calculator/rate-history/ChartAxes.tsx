import { getVerifiedRevisions } from "@/tariffs/engine-v2/revisions";
import { compactMoney } from "./format";
import { HEIGHT, MONTH_LABEL_WIDTH, monthTicks, PAD } from "./chartGeometry";
import { Metric } from "./types";

// The chart's frame: gridlines with y labels, a faint line at each HTS revision, and months
// along the bottom
export const ChartAxes = ({
  width,
  plotW,
  plotH,
  from,
  to,
  yMax,
  step,
  metric,
  x,
  y,
}: {
  width: number;
  plotW: number;
  plotH: number;
  from: string;
  to: string;
  yMax: number;
  step: number;
  metric: Metric;
  x: (iso: string) => number;
  y: (v: number) => number;
}) => {
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);
  const tickLabel = (v: number) =>
    metric === "usd" ? compactMoney(v) : `${Math.round(v * 10) / 10}%`;

  return (
    <>
      {/* Gridlines and y labels */}
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={y(t)}
            y2={y(t)}
            className="stroke-base-300"
            strokeDasharray={t === 0 ? undefined : "2 3"}
          />
          <text
            x={PAD.left - 8}
            y={y(t)}
            dy="0.32em"
            textAnchor="end"
            className="fill-base-content/60 text-xs tabular-nums"
          >
            {tickLabel(t)}
          </text>
        </g>
      ))}

      {/* Where the rules changed: a faint line at each HTS revision */}
      {getVerifiedRevisions()
        .filter((r) => r.from > from && r.from < to)
        .map((r) => (
          <line
            key={r.name}
            x1={x(r.from)}
            x2={x(r.from)}
            y1={PAD.top}
            y2={PAD.top + plotH}
            className="stroke-base-300"
          />
        ))}

      {/* Months along the bottom, as many as fit */}
      {monthTicks(from, to, Math.max(Math.floor(plotW / MONTH_LABEL_WIDTH), 1)).map((month) => (
        <g key={month.date}>
          <line
            x1={x(month.date)}
            x2={x(month.date)}
            y1={PAD.top + plotH}
            y2={PAD.top + plotH + 4}
            className="stroke-base-content/20"
          />
          <text
            x={x(month.date)}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-base-content/60 text-xs"
          >
            {month.label}
          </text>
        </g>
      ))}
    </>
  );
};
