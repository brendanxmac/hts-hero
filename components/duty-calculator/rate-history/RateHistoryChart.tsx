"use client";

import { KeyboardEvent, MouseEvent, PointerEvent, useState } from "react";
import { addDays, HistorySegment } from "@/tariffs/engine-v2/history";
import { ChartAxes } from "./ChartAxes";
import { ChartTooltip } from "./ChartTooltip";
import { dayNumber, HEIGHT, niceStep, PAD } from "./chartGeometry";
import { dateRange } from "./format";
import { amountsBySlice } from "./layers";
import { StackedSteps } from "./StackedSteps";
import { Layer, Metric } from "./types";
import { useWidth } from "./useWidth";

// The stacked step chart of duty over time. Hover (or the arrow keys) shows a day's details;
// clicking picks that day as the entry date.
export const RateHistoryChart = ({
  history,
  layers,
  from,
  to,
  entryDate,
  value,
  show,
  metric,
  highlight,
  onPick,
}: {
  history: HistorySegment[];
  layers: Layer[];
  from: string;
  to: string;
  entryDate: string | null;
  value: (amount: number) => number;
  show: (amount: number) => string;
  metric: Metric;
  highlight?: string | null;
  onPick: (date: string) => void;
}) => {
  const { ref, width } = useWidth();
  // The day under the pointer (or chosen with the keyboard)
  const [hoverDay, setHoverDay] = useState<string | null>(null);
  const [finePointer, setFinePointer] = useState(true);

  const plotW = Math.max(width - PAD.left - PAD.right, 1);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const start = dayNumber(from);
  const days = Math.max(dayNumber(to) - start, 1);
  const x = (iso: string) => PAD.left + ((dayNumber(iso) - start) / days) * plotW;

  const stacks = history.map((s) => amountsBySlice(s));
  const maxTotal = Math.max(...history.map((s) => value(s.result.totalDuty)), 0);
  const step = niceStep((maxTotal || 1) / 3);
  const yMax = Math.max(step * Math.ceil((maxTotal * 1.08) / step), step);
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH;

  const hovered = hoverDay
    ? history.findIndex((s) => s.from <= hoverDay && hoverDay < s.to)
    : -1;

  const dayAt = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return null;
    const fraction = (clientX - rect.left - PAD.left) / plotW;
    const offset = Math.min(Math.max(Math.floor(fraction * days), 0), days - 1);
    return addDays(from, offset);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    setFinePointer(e.pointerType === "mouse" || e.pointerType === "pen");
    setHoverDay(dayAt(e.clientX));
  };

  // Clicking picks that day as the entry date; a tap only shows the details
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!finePointer) return;
    const day = dayAt(e.clientX);
    if (day) onPick(day);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = hovered >= 0 ? hovered : Math.max(history.findIndex((s) => entryDate && s.from <= entryDate && entryDate < s.to), 0);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = Math.min(Math.max(index + (e.key === "ArrowRight" ? 1 : -1), 0), history.length - 1);
      setHoverDay(history[next].from);
    } else if (e.key === "Enter" && hovered >= 0) {
      onPick(history[hovered].from);
    } else if (e.key === "Escape") {
      setHoverDay(null);
    }
  };

  return (
    <div
      ref={ref}
      className="relative select-none outline-none rounded-md focus-visible:ring-2 focus-visible:ring-primary"
      style={{ height: HEIGHT, cursor: finePointer ? "crosshair" : undefined, touchAction: "pan-y" }}
      tabIndex={0}
      role="group"
      aria-label={`Duty over time chart. ${history
        .map((s) => `${dateRange(s)}: ${show(s.result.totalDuty)}`)
        .join("; ")}. Use the arrow keys to step through changes and Enter to use that date.`}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerMove}
      onPointerLeave={() => setHoverDay(null)}
      onBlur={() => setHoverDay(null)}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {width > 0 && (
        <svg width={width} height={HEIGHT} className="block overflow-visible" aria-hidden>
          <ChartAxes
            width={width}
            plotW={plotW}
            plotH={plotH}
            from={from}
            to={to}
            yMax={yMax}
            step={step}
            metric={metric}
            x={x}
            y={y}
          />

          <StackedSteps
            history={history}
            stacks={stacks}
            layers={layers}
            hovered={hovered}
            highlight={highlight}
            value={value}
            x={x}
            y={y}
          />

          {/* The entry date */}
          {entryDate && (
            <g>
              <line
                x1={x(entryDate)}
                x2={x(entryDate)}
                y1={PAD.top - 4}
                y2={PAD.top + plotH}
                className="stroke-primary"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <circle cx={x(entryDate)} cy={PAD.top - 4} r={3} className="fill-primary" />
            </g>
          )}

          {/* Hover crosshair */}
          {hoverDay && hovered >= 0 && (
            <line
              x1={x(hoverDay)}
              x2={x(hoverDay)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              className="stroke-base-content/70"
              strokeWidth={1}
            />
          )}
        </svg>
      )}

      {hovered >= 0 && (
        <ChartTooltip
          segment={history[hovered]}
          amounts={stacks[hovered]}
          layers={layers}
          show={show}
          // Beside the crosshair, on whichever side has more room
          crosshairX={hoverDay ? x(hoverDay) : 0}
          width={width}
          pickDay={finePointer ? hoverDay : null}
        />
      )}
    </div>
  );
};
