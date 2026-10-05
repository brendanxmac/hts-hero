"use client";

import {
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDownRightIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/20/solid";
import {
  addDays,
  HistorySegment,
  lastDay,
  LineChange,
} from "../../tariffs/engine-v2/history";
import { getVerifiedRevisions } from "../../tariffs/engine-v2/revisions";
import { formatDate, formatMoney, formatPct } from "./format";
import { mono } from "../ui/font";
import { CHART } from "./MoneyBreakdown";
import { BASE_SLICE, sliceForProgram } from "./Results";
import { TariffFinder } from "./useTariffFinder";

// "Duty Over Time": the selected entry's duty on every verified revision, as a stacked step
// chart with one layer per program (colored like the Cost Breakdown), and what changed when.

type Metric = "usd" | "pct";

interface Layer {
  label: string;
  color: string;
}

// Changes shown before "Show all"
const COLLAPSED_CHANGES = 3;

const DAY_MS = 24 * 60 * 60 * 1000;
const dayNumber = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / DAY_MS;

// "Apr 8", or "Apr 8, 2026" when asked
const shortDate = (iso: string, withYear = false) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });

const dateRange = (segment: HistorySegment) => {
  const end = lastDay(segment);
  return end === segment.from
    ? formatDate(segment.from)
    : `${shortDate(segment.from)} – ${formatDate(end)}`;
};

// Amount per layer: base duty, then each program, the way the Cost Breakdown groups them
const amountsBySlice = (segment: HistorySegment) => {
  const amounts = new Map<string, number>([[BASE_SLICE, segment.result.base.amount]]);
  segment.charged
    .filter((l) => l.code !== "BASE")
    .forEach((l) => {
      const slice = sliceForProgram(l.program);
      amounts.set(slice, (amounts.get(slice) ?? 0) + l.amount);
    });
  return amounts;
};

// Rounds up to 1, 2, 2.5 or 5 times a power of ten, for axis steps
const niceStep = (raw: number) => {
  if (raw <= 0) return 1;
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * power >= raw) ?? 10;
  return step * power;
};

const compactMoney = (amount: number) => {
  if (amount === 0) return "$0";
  if (Math.abs(amount) >= 1000) {
    const k = amount / 1000;
    return `$${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `$${Math.round(amount)}`;
};

const signedMoney = (amount: number) =>
  `${amount > 0 ? "+" : amount < 0 ? "−" : ""}${formatMoney(Math.abs(amount))}`;

const signedPct = (pct: number) =>
  `${pct > 0 ? "+" : pct < 0 ? "−" : ""}${formatPct(Math.abs(Math.round(pct * 100) / 100))}`;

// An increase reads as an error, a decrease as a saving
type Trend = "up" | "down" | "flat";
const trendOf = (delta: number): Trend =>
  delta > 0.005 ? "up" : delta < -0.005 ? "down" : "flat";

const TREND_TEXT: Record<Trend, string> = {
  up: "text-error",
  down: "text-success",
  flat: "text-base-content/60",
};
const TREND_PILL: Record<Trend, string> = {
  up: "bg-error/10 text-error",
  down: "bg-success/10 text-success",
  flat: "bg-base-200 text-base-content/60",
};
const TREND_DOT: Record<Trend, string> = {
  up: "bg-error ring-error/15",
  down: "bg-success ring-success/15",
  flat: "bg-base-content/60 ring-base-200",
};
const TREND_STROKE: Record<Trend, string> = {
  up: "stroke-error",
  down: "stroke-success",
  flat: "stroke-base-content/60",
};

// The width of an element, kept up to date
const useWidth = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
};

export const RateHistoryCard = ({
  f,
  sliceColors,
  highlight,
  onHighlight,
}: {
  f: TariffFinder;
  // Colors of the Cost Breakdown slices, so the same program has the same color here
  sliceColors: Record<string, string>;
  highlight?: string | null;
  onHighlight?: (label: string | null) => void;
}) => {
  const { history, historyRange, customsValue, entryDate } = f;
  const [metric, setMetric] = useState<Metric>("usd");
  const [showAll, setShowAll] = useState(false);

  // Layers in the order they first appear, base duty at the bottom
  const layers: Layer[] = useMemo(() => {
    const labels: string[] = [];
    history.forEach((s) =>
      amountsBySlice(s).forEach((amount, label) => {
        if (!labels.includes(label) && amount > 0) labels.push(label);
      }),
    );
    const used = new Set(Object.values(sliceColors));
    const spare = CHART.filter((c) => !used.has(c));
    let next = 0;
    return labels.map((label) => ({
      label,
      color:
        sliceColors[label] ??
        (label === BASE_SLICE ? CHART[0] : spare[next++ % Math.max(spare.length, 1)] ?? CHART[1]),
    }));
  }, [history, sliceColors]);

  if (history.length === 0) return null;

  const value = (amount: number) =>
    metric === "usd" ? amount : customsValue > 0 ? (amount / customsValue) * 100 : 0;
  const show = (amount: number) =>
    metric === "usd" ? formatMoney(amount) : formatPct(Math.round(value(amount) * 100) / 100);

  const inRange = entryDate >= historyRange.from && entryDate < historyRange.to;
  const entryIndex = inRange
    ? history.findIndex((s) => s.from <= entryDate && entryDate < s.to)
    : -1;
  const current = history[entryIndex >= 0 ? entryIndex : history.length - 1];
  // The last day there's data for
  const lastDate = addDays(historyRange.to, -1);
  const first = history[0];
  const latest = history[history.length - 1];
  // Compared with the start; or, when the entry date is at the start, with the latest revision
  const looksAhead = current === first && history.length > 1;
  const compared = looksAhead ? latest : current;
  const delta = compared.result.totalDuty - first.result.totalDuty;
  const deltaPct =
    first.result.totalDuty > 0 ? (delta / first.result.totalDuty) * 100 : null;
  const deltaWhen = looksAhead
    ? `by ${shortDate(latest.from)}`
    : `since ${shortDate(first.from)}`;
  const totals = history.map((s) => s.result.totalDuty);
  const changes = history.length - 1;

  const pickDate = (date: string, source: string) => f.setEntryDate(date, source);

  return (
    <section
      className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm flex flex-col gap-4"
      aria-labelledby="rate-history-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="rate-history-title" className="text-base font-semibold text-base-content">
            Duty Over Time
          </h3>
          <p className="mt-0.5 text-xs text-base-content/60">
            {shortDate(historyRange.from)} – {formatDate(lastDate)}
          </p>
        </div>
        <div
          className="join shrink-0"
          role="radiogroup"
          aria-label="Show duty as"
        >
          {(
            [
              ["usd", "$", "Dollars"],
              ["pct", "%", "Percent of value"],
            ] as const
          ).map(([id, label, title]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={metric === id}
              title={title}
              onClick={() => setMetric(id)}
              className={`btn btn-sm join-item ${metric === id ? "btn-active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Headline: duty on the entry date, and how it compares with the start */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
          {entryIndex >= 0 ? "Duty on your entry date" : `Duty on ${formatDate(lastDate)}`}
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
          <span
            className="text-3xl font-semibold tracking-tight leading-none tabular-nums text-base-content"
          >
            {show(current.result.totalDuty)}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${TREND_PILL[trendOf(delta)]}`}
          >
            {Math.abs(delta) < 0.005 ? (
              <>No change since {shortDate(first.from)}</>
            ) : (
              <>
                {delta > 0 ? (
                  <ArrowUpRightIcon className="w-3.5 h-3.5" aria-hidden />
                ) : (
                  <ArrowDownRightIcon className="w-3.5 h-3.5" aria-hidden />
                )}
                {metric === "usd" ? signedMoney(delta) : signedPct(value(delta))}
                {deltaPct !== null && metric === "usd" && ` (${signedPct(deltaPct)})`}
                <span className="font-medium opacity-80">{deltaWhen}</span>
              </>
            )}
          </span>
        </div>
        {changes > 0 && (
          <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
            {[
              ["Low", show(Math.min(...totals))],
              ["High", show(Math.max(...totals))],
              ["Changes", String(changes)],
            ].map(([term, detail]) => (
              <div
                key={term}
                className="rounded-md bg-base-200 px-2.5 py-1.5"
              >
                <dt className="text-base-content/60">{term}</dt>
                <dd className="font-semibold tabular-nums text-base-content">
                  {detail}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <HistoryChart
        history={history}
        layers={layers}
        from={historyRange.from}
        to={historyRange.to}
        entryDate={inRange ? entryDate : null}
        value={value}
        show={show}
        metric={metric}
        highlight={highlight}
        onPick={(date) => pickDate(date, "rate_history_chart")}
      />

      {/* Legend: hovering a layer highlights it here, in the donut and in the statement */}
      {layers.length > 1 && (
        <ul className="flex flex-wrap gap-x-3 gap-y-1.5 -mt-1">
          {layers.map((layer) => (
            <li
              key={layer.label}
              className={`flex items-center gap-1.5 text-xs text-base-content/70 cursor-default transition-opacity ${
                highlight && highlight !== layer.label ? "opacity-40" : ""
              }`}
              onMouseEnter={() => onHighlight?.(layer.label)}
              onMouseLeave={() => onHighlight?.(null)}
            >
              <span
                className="h-2.5 w-2.5 rounded shrink-0"
                style={{ background: layer.color }}
                aria-hidden
              />
              {layer.label}
            </li>
          ))}
        </ul>
      )}

      {/* What changed, latest first */}
      {changes === 0 ? (
        <p className="flex gap-2 rounded-md bg-base-200 px-3.5 py-3 text-sm leading-snug text-base-content/70">
          <CheckCircleIcon className="w-4 h-4 shrink-0 mt-0.5 text-success" aria-hidden />
          <span>
            No tariff changes affected this entry from {shortDate(first.from)} to{" "}
            {formatDate(lastDate)}.
          </span>
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/60">What changed</h4>
          <ol className="flex flex-col">
            {history
              .map((segment, i) => ({ segment, i }))
              .slice(1)
              .reverse()
              .slice(0, showAll ? undefined : COLLAPSED_CHANGES)
              .map(({ segment, i }) => (
                <ChangeItem
                  key={segment.from}
                  segment={segment}
                  previous={history[i - 1]}
                  isEntry={i === entryIndex}
                  metric={metric}
                  value={value}
                  onPick={() => pickDate(segment.from, "rate_history_list")}
                />
              ))}
            <li className="relative pl-5 pt-1">
              <span
                className="absolute left-0.5 top-2 h-2 w-2 rounded-full border-2 border-base-content/20 bg-base-100"
                aria-hidden
              />
              <div className="flex items-baseline justify-between gap-3 text-xs text-base-content/60">
                <span>
                  {formatDate(first.from)} · Starting point
                </span>
                <span className="font-semibold tabular-nums text-base-content/70">
                  {show(first.result.totalDuty)}
                </span>
              </div>
            </li>
          </ol>
          {changes > COLLAPSED_CHANGES && (
            <button
              type="button"
              className="link link-primary link-hover self-start text-sm font-semibold"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show fewer" : `Show all ${changes} changes`}
            </button>
          )}
        </div>
      )}

      <p className="text-xs leading-snug text-base-content/60 border-t border-base-300 pt-3">
        Your value, quantity, trade preference and answers, on every date. Base rates are from the
        current HTS; customs fees aren&apos;t included.
        {!inRange && entryDate >= historyRange.to && (
          <>
            {" "}
            Tariff changes after {formatDate(lastDate)} aren&apos;t entered yet, so they
            aren&apos;t shown.
          </>
        )}
      </p>
    </section>
  );
};

// ── Chart ──

const HEIGHT = 176;
const PAD = { top: 14, right: 6, bottom: 24, left: 48 };
// Room each month label needs
const MONTH_LABEL_WIDTH = 48;
// Tooltip width, w-52
const TOOLTIP_WIDTH = 208;

// The first of each month after `from` and before `to`, thinned to at most `max` evenly spaced
// ones. "Jan" months, and the first label, carry the year: "Jan '27".
const monthTicks = (from: string, to: string, max: number) => {
  const months: string[] = [];
  const [year, month] = from.split("-").map(Number);
  for (let i = 1; ; i++) {
    const d = new Date(Date.UTC(year, month - 1 + i, 1)).toISOString().slice(0, 10);
    if (d >= to) break;
    months.push(d);
  }
  const every = Math.ceil(months.length / max);
  return months
    .filter((_, i) => i % every === 0)
    .map((date, i) => {
      const d = new Date(`${date}T00:00:00`);
      const name = d.toLocaleDateString("en-US", { month: "short" });
      const withYear = i === 0 || d.getMonth() === 0;
      return { date, label: withYear ? `${name} '${String(d.getFullYear()).slice(2)}` : name };
    });
};

const HistoryChart = ({
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
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);
  const tickLabel = (v: number) =>
    metric === "usd" ? compactMoney(v) : `${Math.round(v * 10) / 10}%`;

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

  const tooltip = hovered >= 0 ? history[hovered] : null;
  // Beside the crosshair, on whichever side has more room
  const crosshairX = hoverDay ? x(hoverDay) : 0;
  const tooltipOnRight = crosshairX < width / 2;
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
          <defs>
            <pattern id="rate-history-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" className="stroke-base-content/20" strokeWidth="1" />
            </pattern>
          </defs>

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

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 w-52 rounded-md border border-base-300 bg-base-100 px-3 py-2.5 shadow-lg"
          style={{
            top: PAD.top - 6,
            ...(tooltipOnRight
              ? { left: Math.min(crosshairX + 10, Math.max(width - TOOLTIP_WIDTH, 0)) }
              : { right: Math.min(width - crosshairX + 10, Math.max(width - TOOLTIP_WIDTH, 0)) }),
          }}
          role="status"
        >
          <div className="text-xs leading-snug text-base-content/60">
            <div className="font-medium text-base-content/70">{dateRange(tooltip)}</div>
          </div>
          <div className="mt-1 text-base font-semibold leading-none tabular-nums text-base-content">
            {show(tooltip.result.totalDuty)}
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {layers
              .filter((l) => (stacks[hovered].get(l.label) ?? 0) > 0)
              .reverse()
              .map((l) => (
                <li key={l.label} className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-x-1.5 text-xs leading-tight">
                  <span className="mt-1 h-2 w-2 rounded" style={{ background: l.color }} aria-hidden />
                  <span className="text-base-content/70">{l.label}</span>
                  <span className="col-start-2 font-semibold tabular-nums text-base-content">
                    {show(stacks[hovered].get(l.label) ?? 0)}
                  </span>
                </li>
              ))}
          </ul>
          {finePointer && hoverDay && (
            <div className="mt-2 border-t border-base-300 pt-1.5 text-xs text-primary font-medium">
              Click to use {shortDate(hoverDay)} as the entry date
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Changes ──

const KIND_LABEL: Record<LineChange["kind"], string> = {
  added: "Added",
  removed: "Removed",
  changed: "Changed",
};

const rateText = (change: LineChange) => {
  const before = change.before?.ratePct;
  const after = change.after?.ratePct;
  if (change.kind === "added") return after !== undefined ? formatPct(after) : "";
  if (change.kind === "removed") return before !== undefined ? formatPct(before) : "";
  if (before !== undefined && after !== undefined && before !== after) {
    return `${formatPct(before)} → ${formatPct(after)}`;
  }
  return "";
};

const ChangeItem = ({
  segment,
  previous,
  isEntry,
  metric,
  value,
  onPick,
}: {
  segment: HistorySegment;
  previous: HistorySegment;
  isEntry: boolean;
  metric: Metric;
  value: (amount: number) => number;
  onPick: () => void;
}) => {
  const delta = segment.result.totalDuty - previous.result.totalDuty;
  const shown = (amount: number) =>
    metric === "usd" ? signedMoney(amount) : signedPct(value(amount));
  return (
    <li className="relative pl-5 pb-4">
      {/* The timeline */}
      <span className="absolute left-1.5 top-3.5 bottom-0 w-px bg-base-300" aria-hidden />
      <span
        className={`absolute left-0.5 top-1 h-2.5 w-2.5 rounded-full ring ${TREND_DOT[trendOf(delta)]}`}
        aria-hidden
      />
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0 text-sm">
          <span className="font-semibold text-base-content">{formatDate(segment.from)}</span>
        </div>
        <span
          className={`shrink-0 text-sm font-semibold tabular-nums ${TREND_TEXT[trendOf(delta)]}`}
        >
          {shown(delta)}
        </span>
      </div>
      <ul className="mt-1.5 flex flex-col gap-1.5">
        {segment.changes.map((c) => (
          <li
            key={`${c.kind}-${c.code}`}
            className="rounded-md bg-base-200 px-2.5 py-1.5 text-xs leading-snug"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 text-base-content/60">
                <span className="font-medium">{KIND_LABEL[c.kind]}</span>{" "}
                {c.code !== "BASE" && (
                  <span className={`${mono.className} text-xs text-base-content/70`}>
                    {c.code}
                  </span>
                )}
              </span>
              <span className={`shrink-0 tabular-nums ${TREND_TEXT[trendOf(c.delta)]}`}>
                {shown(c.delta)}
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between gap-2">
              <span className="min-w-0 text-base-content">
                {c.code === "BASE" ? "Base duty" : c.name}
              </span>
              {rateText(c) && (
                <span className="shrink-0 tabular-nums text-base-content/60">{rateText(c)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2">
        {isEntry ? (
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Your entry date is in this period
          </span>
        ) : (
          <button
            type="button"
            className="link link-primary link-hover inline-flex items-center gap-1 text-sm font-semibold"
            onClick={onPick}
          >
            See the duty from {shortDate(segment.from)}
            <ArrowRightIcon className="w-3.5 h-3.5" aria-hidden />
          </button>
        )}
      </div>
    </li>
  );
};
