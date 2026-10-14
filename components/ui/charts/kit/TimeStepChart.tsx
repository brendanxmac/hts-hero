"use client";

import { PRIMARY_MARK } from "@/components/ui/theme";
import { BottomAxis, ValueAxis } from "./Axis";
import { ChartFrame } from "./ChartFrame";
import { Crosshair, HitArea, Tooltip, TooltipRow, useHovered } from "./hover";
import { Dot, StepLine } from "./marks";
import { linearScale, niceMax, time, timeScale } from "./scales";

// A value that holds until it changes, over time (a duty rate across tariff revisions), with
// optional points on it (entries at the rate they paid) and the hover layer: the kit's parts put
// together, as Rate over time, the catalog's average rate and the audit timeline would use it.
// A sketch of the API; nothing uses it yet.

export interface Step {
  date: string;
  value: number;
}

export interface Point {
  date: string;
  value: number;
  color: string;
  label: string;
  hollow?: boolean;
}

export const TimeStepChart = ({
  steps,
  to,
  points = [],
  format,
  formatDate,
  height = 220,
  color = PRIMARY_MARK,
  label,
}: {
  steps: Step[];
  // The last step runs to here (today)
  to: string;
  points?: Point[];
  format: (value: number) => string;
  formatDate: (date: string) => string;
  height?: number;
  color?: string;
  label: string;
}) => {
  const hover = useHovered();
  if (!steps.length) return null;
  const max = niceMax(Math.max(...steps.map((s) => s.value), ...points.map((p) => p.value)));

  return (
    <ChartFrame
      height={height}
      label={label}
      onLeave={hover.clear}
      overlay={(size) => {
        if (hover.index === null) return null;
        const x = timeScale(steps[0].date, to, [0, size.innerWidth]);
        const y = linearScale([0, max], [size.innerHeight, 0]);
        const step = steps[hover.index];
        return (
          <Tooltip x={x.at(step.date)} y={y(step.value)}>
            <p className="m-0 mb-1 font-semibold text-base-content">From {formatDate(step.date)}</p>
            <TooltipRow color={color} label="Rate" value={format(step.value)} />
          </Tooltip>
        );
      }}
    >
      {({ innerWidth, innerHeight }) => {
        const x = timeScale(steps[0].date, to, [0, innerWidth]);
        const y = linearScale([0, max], [innerHeight, 0]);
        const xs = steps.map((s) => x.at(s.date));
        // The step under the pointer: the last one that starts at or before it
        const onMove = (px: number) => hover.set(xs.reduce((best, sx, j) => (sx <= px ? j : best), 0));
        const active = hover.index === null ? null : steps[hover.index];
        return (
          <>
            <ValueAxis ticks={y.ticks(4)} y={y} format={format} />
            <BottomAxis
              labels={[
                { x: 0, text: formatDate(steps[0].date), anchor: "start" },
                { x: innerWidth, text: "Today", anchor: "end" },
              ]}
            />
            <StepLine points={steps.map((s) => ({ x: time(s.date), y: s.value }))} x={x} y={y} to={time(to)} color={color} />
            {points.map((p) => (
              <Dot key={`${p.date}-${p.label}`} cx={x.at(p.date)} cy={y(p.value)} color={p.color} hollow={p.hollow} />
            ))}
            {active && (
              <>
                <Crosshair x={x.at(active.date)} />
                <Dot cx={x.at(active.date)} cy={y(active.value)} color={color} active />
              </>
            )}
            <HitArea onMove={onMove} />
          </>
        );
      }}
    </ChartFrame>
  );
};
