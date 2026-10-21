// The shared chart kit (proposal, Oct 2026): the parts every chart in the Tracker and the
// calculator is made of, so they all scale, label, hover and color the same way. Nothing uses it
// yet; charts move onto it one at a time. Maps keep their own code (d3-geo) and aren't part of it.
//
// The maths is d3's (d3-scale, d3-shape, d3-array), wrapped in scales.ts and marks.tsx, so
// charts use the kit's API and never import d3 themselves.
//
// A chart is a ChartFrame (size, margins, the hover overlay) holding scales (scales.ts), a value
// axis and bottom labels (Axis), marks (marks), the hover layer (hover) and a Legend outside it.
// Colors only ever come from the theme (CHART_COLORS, SERIES_COLORS, the *_MARK tokens).
export { ChartFrame, DEFAULT_MARGIN, useChart } from "./ChartFrame";
export type { ChartSize, Margin } from "./ChartFrame";
export { BottomAxis, ValueAxis } from "./Axis";
export { Bar, Baseline, Dot, GroupedBars, StepArea, StepBand, StepLine } from "./marks";
export { Crosshair, HitArea, nearestIndex, Tooltip, TooltipRow, useHovered } from "./hover";
export { TimeStepChart } from "./TimeStepChart";
export type { Step } from "./TimeStepChart";
export { Sparkline } from "./Sparkline";
export type { SparkPoint } from "./Sparkline";
export { Legend } from "./Legend";
export { bandScale, barWidth, linearScale, niceMax, niceTicks, stepIndexAt, time, timeScale } from "./scales";
export type { Scale, TimeScale } from "./scales";
