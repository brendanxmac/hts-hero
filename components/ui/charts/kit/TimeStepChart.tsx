"use client";

import { PRIMARY_MARK } from "@/components/ui/theme";
import { BottomAxis, ValueAxis } from "./Axis";
import { ChartFrame, DEFAULT_MARGIN, Margin } from "./ChartFrame";
import { Crosshair, HitArea, Tooltip, TooltipRow, useHovered } from "./hover";
import { Dot, StepLine } from "./marks";
import { linearScale, niceMax, stepIndexAt, time, timeScale } from "./scales";

// A value that holds until it changes, over time (a duty rate across tariff revisions): a step
// line from zero with a light value axis, an optional dot at today, and the hover layer (a
// crosshair at the step under the pointer and a tooltip with its value since that date). The
// catalog's average rate (Rate history) and an import's Rate over time (its Summary) use it.

export interface Step {
  date: string;
  value: number;
}

export const TimeStepChart = ({
  steps,
  to,
  format,
  formatDate,
  height = 220,
  margin = DEFAULT_MARGIN,
  color = PRIMARY_MARK,
  valueLabel = "Rate",
  axis = true,
  endDot = true,
  label,
}: {
  steps: Step[];
  // The last step runs to here (today)
  to: string;
  format: (value: number) => string;
  formatDate: (date: string) => string;
  height?: number;
  margin?: Margin;
  color?: string;
  // What the value is, in the tooltip
  valueLabel?: string;
  // The value axis and the first and last dates under the plot
  axis?: boolean;
  // A dot where the line ends, at today's value
  endDot?: boolean;
  label: string;
}) => {
  const hover = useHovered();
  if (!steps.length) return null;
  const sorted = [...steps].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0].date;
  const last = sorted[sorted.length - 1];
  const max = niceMax(Math.max(...sorted.map((s) => s.value), 0.01));
  const scales = (innerWidth: number, innerHeight: number) => ({
    x: timeScale(first, to, [0, innerWidth]),
    y: linearScale([0, max], [innerHeight, 0]),
  });

  return (
    <ChartFrame
      height={height}
      margin={margin}
      label={label}
      onLeave={hover.clear}
      overlay={({ innerWidth, innerHeight }) => {
        if (hover.index === null) return null;
        const { x, y } = scales(innerWidth, innerHeight);
        const step = sorted[hover.index];
        return (
          <Tooltip x={x.at(step.date)} y={y(step.value)}>
            <p className="m-0 mb-1 font-semibold text-base-content">Since {formatDate(step.date)}</p>
            <TooltipRow color={color} label={valueLabel} value={format(step.value)} />
          </Tooltip>
        );
      }}
    >
      {({ innerWidth, innerHeight }) => {
        const { x, y } = scales(innerWidth, innerHeight);
        const xs = sorted.map((s) => x.at(s.date));
        const active = hover.index === null ? null : sorted[hover.index];
        return (
          <>
            {axis && (
              <>
                <ValueAxis ticks={y.ticks(3)} y={y} format={format} />
                <BottomAxis
                  labels={[
                    { x: 0, text: formatDate(first), anchor: "start" },
                    { x: innerWidth, text: "Today", anchor: "end" },
                  ]}
                />
              </>
            )}
            <StepLine points={sorted.map((s) => ({ x: time(s.date), y: s.value }))} x={x} y={y} to={time(to)} color={color} />
            {endDot && <Dot cx={innerWidth} cy={y(last.value)} color={color} />}
            {active && (
              <>
                <Crosshair x={x.at(active.date)} />
                <Dot cx={x.at(active.date)} cy={y(active.value)} color={color} active />
              </>
            )}
            <HitArea onMove={(px) => hover.set(stepIndexAt(xs, px))} />
          </>
        );
      }}
    </ChartFrame>
  );
};
