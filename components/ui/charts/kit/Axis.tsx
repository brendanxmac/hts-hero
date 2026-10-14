"use client";

import { MUTED_MARK } from "@/components/ui/theme";
import { useChart } from "./ChartFrame";

// Recessive axes: the value axis as light gridlines with labels at the left, the category or time
// axis as labels under the plot. No axis lines or tick marks: the gridlines carry the scale.

export const ValueAxis = ({
  ticks,
  y,
  format,
}: {
  ticks: number[];
  y: (value: number) => number;
  format: (value: number) => string;
}) => {
  const { innerWidth } = useChart();
  return (
    <g aria-hidden>
      {ticks.map((t) => (
        <g key={t} transform={`translate(0,${y(t)})`}>
          <line x1={0} x2={innerWidth} stroke={MUTED_MARK} strokeWidth={1} />
          <text x={-8} dy="0.32em" textAnchor="end" className="fill-base-content/60 text-xs tabular-nums">
            {format(t)}
          </text>
        </g>
      ))}
    </g>
  );
};

export const BottomAxis = ({ labels }: { labels: { x: number; text: string; anchor?: "start" | "middle" | "end" }[] }) => {
  const { innerHeight } = useChart();
  return (
    <g aria-hidden transform={`translate(0,${innerHeight + 18})`}>
      {labels.map((l) => (
        <text key={`${l.x}-${l.text}`} x={l.x} textAnchor={l.anchor ?? "middle"} className="fill-base-content/60 text-xs">
          {l.text}
        </text>
      ))}
    </g>
  );
};
