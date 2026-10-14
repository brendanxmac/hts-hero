"use client";

import { ChartFrame, timeScale } from "@/components/ui/charts/kit";
import { PROGRAM } from "@/components/ui/marketing";
import { TIMELINE_EVENTS } from "./timelineEvents";

// The refundable tariffs on a timeline, Feb 2025 to Oct 2026: when IEEPA and Section 122 duties
// applied, the rulings and refund milestones, and the span HTS Hero has verified rates for.
// Dates are from the refund research (tariffs/engine-v2/REFUNDS.md, checked Oct 10, 2026). On the
// chart kit: drawn at its real width, so its text stays the same size on every screen, and a bar
// too short for its label has the label beside it. The bars keep the marketing layer's program
// colors (PROGRAM).

const HEIGHT = 210;
const MARGIN = { top: 30, right: 20, bottom: 24, left: 20 };
const START = "2025-02-01";
const END = "2026-10-31";

const BARS = [
  { label: "IEEPA tariffs", from: "2025-02-04", to: "2026-02-24", y: 30, color: PROGRAM.IEEPA },
  { label: "Section 122 surcharge", from: "2026-02-24", to: "2026-07-24", y: 74, color: PROGRAM["Section 122"] },
];
const BAR_HEIGHT = 28;
// The axis, under the bars
const AXIS_Y = 130;

const TICKS = ["2025-04-01", "2025-07-01", "2025-10-01", "2026-01-01", "2026-04-01", "2026-07-01", "2026-10-01"];
const tickLabel = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });

// About how wide a label is at 13px bold
const labelWidth = (text: string) => text.length * 7.6 + 24;

export const RefundTimeline = ({ verifiedFrom }: { verifiedFrom: string }) => (
  <ChartFrame
    height={HEIGHT}
    margin={MARGIN}
    initialWidth={1000}
    label="IEEPA tariffs applied from Feb 4, 2025 to Feb 23, 2026 and are being refunded; the Section 122 surcharge applied from Feb 24 to Jul 24, 2026 and its refund is under appeal"
  >
    {({ innerWidth }) => {
      const x = timeScale(START, END, [0, innerWidth]);
      // Ticks every quarter, or every half year when they'd crowd
      const ticks = innerWidth < 560 ? TICKS.filter((_, i) => i % 2 === 1) : TICKS;
      return (
        <>
          {/* Theme and marketing colors at runtime positions (DESIGN_SYSTEM §10, §14) */}
          <rect x={x.at(verifiedFrom)} y={0} width={Math.max(0, innerWidth - x.at(verifiedFrom))} height={110} rx={10} style={{ fill: "oklch(var(--p) / 0.08)" }} />
          <text x={x.at(verifiedFrom) + 10} y={-8} className="fill-primary text-xs font-bold">
            Verified by HTS Hero from{" "}
            {new Date(`${verifiedFrom}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
          </text>
          {BARS.map((b) => {
            const left = x.at(b.from);
            const width = x.at(b.to) - left;
            const inside = labelWidth(b.label) <= width;
            return (
              <g key={b.label}>
                <rect x={left} y={b.y} width={width} height={BAR_HEIGHT} rx={8} style={{ fill: b.color }} />
                <text
                  x={inside ? left + 12 : x.at(b.to) + 8 > innerWidth - labelWidth(b.label) ? left - 8 : x.at(b.to) + 8}
                  y={b.y + 19}
                  textAnchor={!inside && x.at(b.to) + 8 > innerWidth - labelWidth(b.label) ? "end" : "start"}
                  className={`text-[13px] font-bold ${inside ? "fill-base-100" : "fill-base-content"}`}
                >
                  {b.label}
                </text>
              </g>
            );
          })}
          <line x1={0} x2={innerWidth} y1={AXIS_Y} y2={AXIS_Y} className="stroke-base-300" />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={x.at(t)} x2={x.at(t)} y1={AXIS_Y - 4} y2={AXIS_Y + 4} className="stroke-base-300" />
              <text x={x.at(t)} y={AXIS_Y + 30} textAnchor="middle" className="fill-base-content/60 text-[11px]">
                {tickLabel(t)}
              </text>
            </g>
          ))}
          {TIMELINE_EVENTS.map((e, i) => (
            <g key={e.at}>
              <line x1={x.at(e.at)} x2={x.at(e.at)} y1={10} y2={AXIS_Y - 10} className="stroke-base-content" strokeDasharray="2 3" />
              <circle cx={x.at(e.at)} cy={AXIS_Y} r={10} className="fill-base-content" />
              <text x={x.at(e.at)} y={AXIS_Y + 4} textAnchor="middle" className="fill-base-100 text-[11px] font-bold">
                {i + 1}
              </text>
            </g>
          ))}
        </>
      );
    }}
  </ChartFrame>
);
