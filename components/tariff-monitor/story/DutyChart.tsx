"use client";

import { useId } from "react";
import { BottomAxis, ChartFrame, Dot, linearScale, StepArea, StepLine, time, timeScale, ValueAxis } from "@/components/ui/charts/kit";
import { PROGRAM } from "@/components/ui/marketing";

// An annotated step chart of one real product's duty: steel hardware (HTS 7326.90.86.88) from
// China, per the engine's verified history. 47.9% from Nov 17, 2025; 37.9% from Feb 24, 2026, when
// the IEEPA duties ended and Section 122 began; 77.9% from Apr 6, 2026, when Section 232 metals
// duty of 50% replaced Section 122. On the chart kit: drawn at its real width, so its text stays
// the same size on every screen. The notes keep the marketing layer's program colors (PROGRAM).

const HEIGHT = 300;
const MARGIN = { top: 28, right: 16, bottom: 30, left: 44 };
const START = "2025-11-17";
const END = "2026-10-10";

const STEPS = [
  { from: "2025-11-17", pct: 47.9 },
  { from: "2026-02-24", pct: 37.9 },
  { from: "2026-04-06", pct: 77.9 },
];

const NOTES = [
  { at: "2026-02-24", pct: 37.9, lines: ["Feb 24: IEEPA ends,", "Section 122 begins"], dy: 30, color: PROGRAM["Section 122"] },
  { at: "2026-04-06", pct: 77.9, lines: ["Apr 6: Section 232 metals +50%"], dy: -14, color: PROGRAM["Section 232"] },
];

const TICKS = [
  ["2025-12-01", "Dec"],
  ["2026-02-01", "Feb"],
  ["2026-04-01", "Apr"],
  ["2026-06-01", "Jun"],
  ["2026-08-01", "Aug"],
  ["2026-10-01", "Oct"],
] as const;

// Room a note's text needs to the right of its point before it flips to the left
const NOTE_WIDTH = 210;

export const DutyChart = () => {
  const gradientId = useId();
  return (
    <ChartFrame
      height={HEIGHT}
      margin={MARGIN}
      initialWidth={640}
      label="Duty on steel hardware from China: 47.9% from Nov 17, 2025, 37.9% from Feb 24, 2026, and 77.9% from Apr 6, 2026"
    >
      {({ innerWidth, innerHeight }) => {
        const x = timeScale(START, END, [0, innerWidth]);
        const y = linearScale([0, 100], [innerHeight, 0]);
        const points = STEPS.map((s) => ({ x: time(s.from), y: s.pct }));
        return (
          <>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: "oklch(var(--p))", stopOpacity: 0.22 }} />
                <stop offset="100%" style={{ stopColor: "oklch(var(--p))", stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <ValueAxis ticks={[0, 25, 50, 75, 100]} y={y} format={(v) => `${v}%`} />
            <BottomAxis labels={TICKS.map(([d, label]) => ({ x: x.at(d), text: label }))} />
            <StepArea points={points} x={x} y={y} to={time(END)} y0={innerHeight} fill={`url(#${gradientId})`} />
            <StepLine points={points} x={x} y={y} to={time(END)} color="oklch(var(--bc))" />
            {NOTES.map((n) => {
              const cx = x.at(n.at);
              const flip = cx + NOTE_WIDTH > innerWidth;
              return (
                <g key={n.at}>
                  <Dot cx={cx} cy={y(n.pct)} color={n.color} active />
                  {n.lines.map((t, i) => (
                    <text
                      key={t}
                      x={flip ? cx - 12 : cx + 12}
                      y={y(n.pct) + n.dy + i * 16}
                      textAnchor={flip ? "end" : "start"}
                      className="text-[13px] font-semibold"
                      style={{ fill: n.color }}
                    >
                      {t}
                    </text>
                  ))}
                </g>
              );
            })}
            <text x={x.at(STEPS[0].from) + 4} y={y(47.9) - 10} className="fill-base-content text-[13px] font-bold">
              47.9%
            </text>
            <text x={innerWidth - 4} y={y(77.9) - 10} textAnchor="end" className="fill-base-content text-[13px] font-bold">
              77.9%
            </text>
          </>
        );
      }}
    </ChartFrame>
  );
};
