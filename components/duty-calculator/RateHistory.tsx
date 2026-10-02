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
import { getVerifiedRevisions, HtsRevision } from "../../tariffs/engine-v2/revisions";
import { formatDate, formatMoney, formatPct } from "./format";
import { mono } from "./font";
import { CHART } from "./MoneyBreakdown";
import { BASE_SLICE, sliceForProgram } from "./Results";
import { TariffFinder } from "./useTariffFinder";
import styles from "./theme.module.css";

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

// "2026HTSRev7" -> "Rev 7"
const shortRevision = (revision?: HtsRevision) => {
  const number = revision?.name.match(/Rev(\d+)$/)?.[1];
  return number ? `Rev ${number}` : revision?.title ?? "";
};

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

// Revisions in force at any point in the segment
const revisionsIn = (segment: HistorySegment) => {
  const revisions = getVerifiedRevisions().filter(
    (r) => r.from < segment.to && (!r.to || r.to > segment.from),
  );
  if (revisions.length <= 1) return shortRevision(revisions[0] ?? segment.revision);
  return `${shortRevision(revisions[0])} – ${shortRevision(revisions[revisions.length - 1])}`;
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

const trendColor = (delta: number) =>
  delta > 0.005
    ? "var(--dc-negative)"
    : delta < -0.005
      ? "var(--dc-positive)"
      : "var(--dc-text-3)";

const trendSoft = (delta: number) =>
  delta > 0.005
    ? "var(--dc-negative-soft)"
    : delta < -0.005
      ? "var(--dc-positive-soft)"
      : "var(--dc-surface-2)";

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
  const lastRevision = getVerifiedRevisions().slice(-1)[0];
  const first = history[0];
  const latest = history[history.length - 1];
  // Compared with the start; or, when the entry date is at the start, with the latest revision
  const looksAhead = current === first && history.length > 1;
  const compared = looksAhead ? latest : current;
  const delta = compared.result.totalDuty - first.result.totalDuty;
  const deltaPct =
    first.result.totalDuty > 0 ? (delta / first.result.totalDuty) * 100 : null;
  const deltaWhen = looksAhead
    ? `by ${shortRevision(lastRevision)}`
    : `since ${shortDate(first.from)}`;
  const totals = history.map((s) => s.result.totalDuty);
  const changes = history.length - 1;

  const pickDate = (date: string, source: string) => f.setEntryDate(date, source);

  return (
    <section
      className={`${styles.card} p-5 flex flex-col gap-4`}
      aria-labelledby="rate-history-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="rate-history-title" className="text-[15px] font-semibold">
            Duty Over Time
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--dc-text-3)]">
            {shortRevision(first.revision)} – {shortRevision(lastRevision)} ·{" "}
            {shortDate(historyRange.from)} – {formatDate(addDays(historyRange.to, -1))}
          </p>
        </div>
        <div
          className={`${styles.segmented} !h-8 shrink-0`}
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
              className={`${styles.segment} !text-[13px] px-2.5 ${metric === id ? styles.segmentActive : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Headline: duty on the entry date, and how it compares with the start */}
      <div>
        <div className={styles.eyebrow}>
          {entryIndex >= 0 ? "Duty on your entry date" : `Duty at ${shortRevision(lastRevision)}`}
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
          <span
            className={`${styles.num} text-[26px] font-semibold tracking-tight leading-none`}
          >
            {show(current.result.totalDuty)}
          </span>
          <span
            className={`${styles.num} inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold`}
            style={{ color: trendColor(delta), background: trendSoft(delta) }}
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
          <dl className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
            {[
              ["Low", show(Math.min(...totals))],
              ["High", show(Math.max(...totals))],
              ["Changes", String(changes)],
            ].map(([term, detail]) => (
              <div
                key={term}
                className="rounded-lg bg-[var(--dc-surface-2)] px-2.5 py-1.5"
              >
                <dt className="text-[var(--dc-text-3)]">{term}</dt>
                <dd className={`${styles.num} font-semibold text-[var(--dc-text)]`}>
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
              className="flex items-center gap-1.5 text-[12px] text-[var(--dc-text-2)] cursor-default"
              style={{
                opacity: highlight && highlight !== layer.label ? 0.45 : 1,
                transition: "opacity 150ms ease",
              }}
              onMouseEnter={() => onHighlight?.(layer.label)}
              onMouseLeave={() => onHighlight?.(null)}
            >
              <span
                className="h-2.5 w-2.5 rounded-[3px] shrink-0"
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
        <p className="flex gap-2 rounded-xl bg-[var(--dc-surface-2)] px-3.5 py-3 text-[13px] leading-snug text-[var(--dc-text-2)]">
          <CheckCircleIcon className="w-4 h-4 shrink-0 mt-px text-[var(--dc-positive)]" aria-hidden />
          <span>
            No tariff changes affected this entry from {shortRevision(first.revision)} to{" "}
            {shortRevision(lastRevision)}.
          </span>
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <h4 className={styles.eyebrow}>What changed</h4>
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
                className="absolute left-[3px] top-[9px] h-2 w-2 rounded-full border-2 border-[var(--dc-border-strong)] bg-[var(--dc-surface)]"
                aria-hidden
              />
              <div className="flex items-baseline justify-between gap-3 text-[12.5px] text-[var(--dc-text-3)]">
                <span>
                  {formatDate(first.from)} · {shortRevision(first.revision)} · Starting point
                </span>
                <span className={`${styles.num} font-semibold text-[var(--dc-text-2)]`}>
                  {show(first.result.totalDuty)}
                </span>
              </div>
            </li>
          </ol>
          {changes > COLLAPSED_CHANGES && (
            <button
              type="button"
              className={`${styles.link} self-start text-[13px] font-semibold`}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show fewer" : `Show all ${changes} changes`}
            </button>
          )}
        </div>
      )}

      <p className="text-[11.5px] leading-snug text-[var(--dc-text-3)] border-t border-[var(--dc-border)] pt-3">
        Your value, quantity, trade preference and answers, on every date. Base rates are from the
        current HTS; customs fees aren&apos;t included.
        {!inRange && entryDate >= historyRange.to && (
          <>
            {" "}
            Revisions after {shortRevision(lastRevision)} aren&apos;t entered yet, so changes after{" "}
            {formatDate(addDays(historyRange.to, -1))} aren&apos;t shown.
          </>
        )}
      </p>
    </section>
  );
};

// ── Chart ──

const HEIGHT = 176;
const PAD = { top: 14, right: 6, bottom: 24, left: 42 };

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
      className="relative select-none outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--dc-accent)]"
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
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--dc-border-strong)" strokeWidth="1" />
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
                stroke="var(--dc-border)"
                strokeDasharray={t === 0 ? undefined : "2 3"}
              />
              <text
                x={PAD.left - 8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className={styles.num}
                fontSize={10.5}
                fill="var(--dc-text-3)"
              >
                {tickLabel(t)}
              </text>
            </g>
          ))}

          {/* Revision boundaries, labeled along the bottom */}
          {getVerifiedRevisions()
            .filter((r) => r.from >= from && r.from < to)
            .map((r, i, all) => {
              const left = x(r.from);
              const right = x(all[i + 1]?.from ?? to);
              return (
                <g key={r.name}>
                  {i > 0 && (
                    <line
                      x1={left}
                      x2={left}
                      y1={PAD.top}
                      y2={PAD.top + plotH}
                      stroke="var(--dc-border)"
                    />
                  )}
                  {right - left >= 22 && (
                    <text
                      x={(left + right) / 2}
                      y={HEIGHT - 8}
                      textAnchor="middle"
                      fontSize={10.5}
                      fill="var(--dc-text-3)"
                    >
                      {right - left >= 44 ? shortRevision(r) : `R${r.name.match(/Rev(\d+)$/)?.[1] ?? ""}`}
                    </text>
                  )}
                </g>
              );
            })}

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
            stroke="var(--dc-text)"
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
                fill="var(--dc-surface)"
                stroke={trendColor(change)}
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
                stroke="var(--dc-accent)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <circle cx={x(entryDate)} cy={PAD.top - 4} r={3} fill="var(--dc-accent)" />
            </g>
          )}

          {/* Hover crosshair */}
          {hoverDay && hovered >= 0 && (
            <line
              x1={x(hoverDay)}
              x2={x(hoverDay)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="var(--dc-text-2)"
              strokeWidth={1}
            />
          )}
        </svg>
      )}

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 w-[200px] rounded-xl border border-[var(--dc-border)] bg-[var(--dc-surface)] px-3 py-2.5 shadow-[var(--dc-shadow-pop)]"
          style={{
            top: PAD.top - 6,
            ...(tooltipOnRight
              ? { left: Math.min(crosshairX + 10, Math.max(width - 200, 0)) }
              : { right: Math.min(width - crosshairX + 10, Math.max(width - 200, 0)) }),
          }}
          role="status"
        >
          <div className="text-[11.5px] leading-snug text-[var(--dc-text-3)]">
            <div className="font-medium text-[var(--dc-text-2)]">{dateRange(tooltip)}</div>
            <div>{revisionsIn(tooltip)}</div>
          </div>
          <div className={`${styles.num} mt-1 text-[16px] font-semibold leading-none`}>
            {show(tooltip.result.totalDuty)}
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {layers
              .filter((l) => (stacks[hovered].get(l.label) ?? 0) > 0)
              .reverse()
              .map((l) => (
                <li key={l.label} className="grid grid-cols-[8px_1fr] gap-x-1.5 text-[11.5px] leading-tight">
                  <span className="mt-[3px] h-2 w-2 rounded-[2px]" style={{ background: l.color }} aria-hidden />
                  <span className="text-[var(--dc-text-2)]">{l.label}</span>
                  <span className={`${styles.num} col-start-2 font-semibold text-[var(--dc-text)]`}>
                    {show(stacks[hovered].get(l.label) ?? 0)}
                  </span>
                </li>
              ))}
          </ul>
          {finePointer && hoverDay && (
            <div className="mt-2 border-t border-[var(--dc-border)] pt-1.5 text-[11px] text-[var(--dc-accent)] font-medium">
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
      <span className="absolute left-[6px] top-[14px] bottom-0 w-px bg-[var(--dc-border)]" aria-hidden />
      <span
        className="absolute left-[2px] top-[5px] h-[9px] w-[9px] rounded-full"
        style={{ background: trendColor(delta), boxShadow: `0 0 0 3px ${trendSoft(delta)}` }}
        aria-hidden
      />
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0 text-[13px]">
          <span className="font-semibold text-[var(--dc-text)]">{formatDate(segment.from)}</span>
          <span className="text-[var(--dc-text-3)]"> · {shortRevision(segment.revision)}</span>
        </div>
        <span
          className={`${styles.num} shrink-0 text-[13px] font-semibold`}
          style={{ color: trendColor(delta) }}
        >
          {shown(delta)}
        </span>
      </div>
      <ul className="mt-1.5 flex flex-col gap-1.5">
        {segment.changes.map((c) => (
          <li
            key={`${c.kind}-${c.code}`}
            className="rounded-lg bg-[var(--dc-surface-2)] px-2.5 py-1.5 text-[12px] leading-snug"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 text-[var(--dc-text-3)]">
                <span className="font-medium">{KIND_LABEL[c.kind]}</span>{" "}
                {c.code !== "BASE" && (
                  <span className={`${mono.className} text-[11.5px] text-[var(--dc-text-2)]`}>
                    {c.code}
                  </span>
                )}
              </span>
              <span className={`${styles.num} shrink-0`} style={{ color: trendColor(c.delta) }}>
                {shown(c.delta)}
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between gap-2">
              <span className="min-w-0 text-[var(--dc-text)]">
                {c.code === "BASE" ? "Base duty" : c.name}
              </span>
              {rateText(c) && (
                <span className={`${styles.num} shrink-0 text-[var(--dc-text-3)]`}>{rateText(c)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2">
        {isEntry ? (
          <span className="inline-flex items-center rounded-full border border-[var(--dc-accent-border)] bg-[var(--dc-accent-soft)] px-2 py-0.5 text-[11.5px] font-medium text-[var(--dc-accent)]">
            Your entry date is in this period
          </span>
        ) : (
          <button
            type="button"
            className={`${styles.link} inline-flex items-center gap-1 text-[12.5px] font-semibold`}
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
