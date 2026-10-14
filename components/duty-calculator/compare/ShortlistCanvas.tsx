"use client";

import { useMemo, useState } from "react";
import { BottomAxis, ChartFrame, Crosshair, Dot, HitArea, StepBand, StepLine, Tooltip, TooltipRow, ValueAxis, barWidth, linearScale, niceMax, time, timeScale } from "@/components/ui/charts/kit";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { rateAt } from "@/components/tariff-tracker/product/analysis/history";
import { formatRate } from "@/components/tariff-tracker/formatRate";
import { BASE_PART, shortProgram } from "@/components/tariff-tracker/report";
import { shortDate } from "../rate-history/format";
import { formatImportValue } from "../lib/usImports";
import { todayIso } from "../lib/format";
import { CompareOption, optionLabel, segmentsFor } from "./options";
import { Origins } from "./useOrigins";

// The shortlist charted, under Side by Side: one view at a time, each option in its country's
// color (an agreement option dashed). Over time: each option's rate as a line, over a quiet band
// holding the middle 80% of every other origin on each date. Duty today: what each pays, tariff
// by tariff, on one scale. US imports: how much the US imports from each country (Census) and the
// trend. With `field` off (signed out), the shortlist alone.

type View = "time" | "today" | "imports";

const VIEWS: { id: View; label: string }[] = [
  { id: "time", label: "Over time" },
  { id: "today", label: "Duty today" },
  { id: "imports", label: "US imports" },
];

const isoOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// The field behind the shortlist: quiet, so the options being compared stand out
const BAND = "oklch(var(--bc) / 0.08)";

const OverTime = ({ options, colors, origins, field, asOf }: { options: CompareOption[]; colors: Record<string, string>; origins: Origins; field: boolean; asOf?: string }) => {
  const { histories, range, ready, progress } = origins;
  const today = todayIso();
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const codes = Array.from(new Set(options.map((o) => o.origin.country.code)));
  const lines = options.map((o) => ({ option: o, segments: segmentsFor(o, histories.get(o.origin.country.code)) })).filter((l) => l.segments.length > 0);
  const rateOn = (l: (typeof lines)[number], date: string) => (l.segments.find((s) => s.from <= date && date < s.to) ?? l.segments[l.segments.length - 1]).pct;

  // The middle 80% (10th to 90th percentile) of every other origin's standard rate on each date
  const band = useMemo(() => {
    if (!field || !ready) return [];
    const others = Array.from(histories.values()).filter((h) => !codes.includes(h.code));
    const dates = Array.from(new Set(others.flatMap((h) => h.standard.map((s) => s.from)))).sort();
    return dates.map((date) => {
      const pcts = others.map((h) => rateAt(h, date, "standard").pct).sort((a, b) => a - b);
      const at = (q: number) => pcts[Math.min(pcts.length - 1, Math.max(0, Math.round(q * (pcts.length - 1))))];
      return { x: time(date), low: at(0.1), high: at(0.9) };
    });
    // The shortlist's codes, through the joined key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, ready, histories, codes.join()]);

  if (!lines.length) return <div className={`${ui.skeleton} h-72 w-full`} aria-label="Working out every rate's history" />;
  const top = niceMax(Math.max(...lines.flatMap((l) => l.segments.map((s) => s.pct)), ...band.map((b) => b.high), 1));
  const scales = (innerWidth: number, innerHeight: number) => ({ x: timeScale(range.from, today, [0, innerWidth]), y: linearScale([0, top], [innerHeight, 0]) });

  return (
    <div className="flex flex-col gap-3">
      <ChartFrame
        height={300}
        margin={{ top: 12, right: 16, bottom: 28, left: 44 }}
        label={`The rate for ${lines.map((l) => optionLabel(l.option)).join(", ")} since ${shortDate(range.from, true)}`}
        onLeave={() => setHoverDate(null)}
        overlay={({ innerWidth, innerHeight }) => {
          if (!hoverDate) return null;
          const { x, y } = scales(innerWidth, innerHeight);
          return (
            <Tooltip x={x.at(hoverDate)} y={y(rateOn(lines[0], hoverDate))}>
              <p className="m-0 mb-1 font-semibold text-base-content">{shortDate(hoverDate, true)}</p>
              {lines.map((l) => (
                <TooltipRow key={l.option.key} color={colors[l.option.origin.country.code]} label={optionLabel(l.option)} value={formatRate(rateOn(l, hoverDate))} />
              ))}
            </Tooltip>
          );
        }}
      >
        {({ innerWidth, innerHeight }) => {
          const { x, y } = scales(innerWidth, innerHeight);
          return (
            <>
              <ValueAxis ticks={y.ticks(4)} y={y} format={formatRate} />
              <BottomAxis
                labels={[
                  { x: 0, text: shortDate(range.from, true), anchor: "start" },
                  ...x
                    .dateTicks(5)
                    .filter((d) => x.at(d) > 70 && x.at(d) < innerWidth - 50)
                    .map((d) => ({ x: x.at(d), text: shortDate(d) })),
                  { x: innerWidth, text: "Today", anchor: "end" },
                ]}
              />
              {band.length > 0 && <StepBand points={band} x={x} y={y} to={time(today)} fill={BAND} />}
              {lines.map((l) => (
                <StepLine
                  key={l.option.key}
                  points={l.segments.map((s) => ({ x: time(s.from), y: s.pct }))}
                  x={x}
                  y={y}
                  to={time(today)}
                  color={colors[l.option.origin.country.code]}
                  dashed={Boolean(l.option.agreement)}
                />
              ))}
              {lines.map((l) => (
                <Dot key={l.option.key} cx={innerWidth} cy={y(l.segments[l.segments.length - 1].pct)} color={colors[l.option.origin.country.code]} hollow={Boolean(l.option.agreement)} />
              ))}
              {/* The control bar's date */}
              {asOf && (
                <>
                  <line x1={x.at(asOf)} x2={x.at(asOf)} y1={0} y2={innerHeight} stroke="oklch(var(--p))" strokeWidth={1.5} />
                  <text x={x.at(asOf) + 4} y={10} className="fill-primary text-[11px] font-semibold">
                    {shortDate(asOf)}
                  </text>
                </>
              )}
              {hoverDate && (
                <>
                  <Crosshair x={x.at(hoverDate)} />
                  {lines.map((l) => (
                    <Dot key={l.option.key} cx={x.at(hoverDate)} cy={y(rateOn(l, hoverDate))} color={colors[l.option.origin.country.code]} active />
                  ))}
                </>
              )}
              <HitArea onMove={(px) => setHoverDate(isoOf(x.invert(Math.max(0, Math.min(px, innerWidth)))))} />
            </>
          );
        }}
      </ChartFrame>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-base-content/70">
        {lines.map((l) => (
          <span key={l.option.key} className="inline-flex items-center gap-1.5">
            <svg width="16" height="4" aria-hidden>
              <line x1="0" x2="16" y1="2" y2="2" stroke={colors[l.option.origin.country.code]} strokeWidth="2" strokeDasharray={l.option.agreement ? "3 2" : undefined} />
            </svg>
            {optionLabel(l.option)} <span className="font-semibold tabular-nums text-base-content">{formatRate(l.option.pct)}</span>
          </span>
        ))}
        {band.length > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm" style={{ background: BAND }} aria-hidden />
            Most other origins
          </span>
        )}
      </div>
      <p className={`${ui.caption} m-0`}>
        {field
          ? ready
            ? `Dashed: with the trade agreement. The gray band holds the middle 80% of the other ${histories.size - codes.length} origins' standard rates on each date.`
            : `Working out every other origin's history… ${Math.round(progress * 100)}%`
          : "Dashed: with the trade agreement. Create a free account to see the range of every other origin behind your shortlist."}
      </p>
    </div>
  );
};

const DutyToday = ({ options, colors, partColors }: { options: CompareOption[]; colors: Record<string, string>; partColors: Record<string, string> }) => {
  const top = Math.max(...options.map((o) => o.pct), 0.01);
  return (
    <ul className="m-0 flex list-none flex-col gap-4 p-0">
      {options.map((o) => (
        <li key={o.key} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex items-center gap-2 font-semibold text-base-content">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[o.origin.country.code], opacity: o.agreement ? 0.6 : 1 }} aria-hidden />
              <span aria-hidden>{o.origin.country.flag}</span>
              {optionLabel(o)}
            </span>
            <span className={`${ui.metric.secondary} text-base`}>{formatRate(o.pct)}</span>
          </div>
          <StackedBar
            parts={o.parts.map((p) => ({ label: p.key === BASE_PART ? "Base duty" : shortProgram(p.key), amount: p.pct, color: partColors[p.key] }))}
            formatValue={formatRate}
            size="sm"
            shape="pill"
            fill={o.pct > 0 ? Math.max(o.pct / top, 0.02) : 0}
            legend={false}
          />
          <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/70">
            {o.parts.length === 0
              ? "Duty free"
              : o.parts.map((p) => (
                  <span key={p.key} className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ background: partColors[p.key] }} aria-hidden />
                    {p.key === BASE_PART ? "Base" : shortProgram(p.key)} <span className="font-semibold tabular-nums text-base-content">{formatRate(p.pct)}</span>
                  </span>
                ))}
          </span>
        </li>
      ))}
    </ul>
  );
};

const UsImports = ({ options, colors, origins }: { options: CompareOption[]; colors: Record<string, string>; origins: Origins }) => {
  const { imports } = origins;
  if (!imports) return <p className={ui.bodySm}>The Census Bureau has no US import figures for this code.</p>;
  const countries = Array.from(new Map(options.map((o) => [o.origin.country.code, o.origin.country])).values());
  const ranked = Array.from(imports.byCountry.entries())
    .filter(([, v]) => v.value > 0)
    .sort((a, b) => b[1].value - a[1].value)
    .map(([code]) => code);
  const top = Math.max(...countries.map((c) => imports.byCountry.get(c.code)?.value ?? 0), 1);
  return (
    <div className="flex flex-col gap-3">
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {countries.map((c) => {
          const row = imports.byCountry.get(c.code);
          const value = row?.value ?? 0;
          const trend = row && row.prior > 0 ? (row.value - row.prior) / row.prior : null;
          return (
            <li key={c.code} className="grid grid-cols-[10rem_minmax(0,1fr)_8rem] items-center gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-semibold text-base-content">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colors[c.code] }} aria-hidden />
                <span className="truncate">{c.name}</span>
              </span>
              <span className="h-3 overflow-hidden rounded-full bg-base-200" aria-hidden>
                <span className="block h-full rounded-full" style={{ width: barWidth(value, top), background: colors[c.code] }} />
              </span>
              <span className="flex flex-col items-end">
                <span className="font-semibold tabular-nums text-base-content">{value > 0 ? formatImportValue(value) : "None"}</span>
                <span className="text-xs text-base-content/60">
                  {value > 0 ? `#${ranked.indexOf(c.code) + 1} supplier` : "Not a supplier"}
                  {trend !== null && (
                    <span className={trend >= 0 ? "text-success" : ""}>
                      {" "}
                      · {trend >= 0 ? "+" : "−"}
                      {Math.abs(Math.round(trend * 100))}%
                    </span>
                  )}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className={`${ui.caption} m-0`}>
        US general imports of {imports.level === 10 ? "this product" : `products in its ${imports.level}-digit group`} in {imports.year}, and the change from {imports.prior}. Source: U.S.
        Census Bureau.
      </p>
    </div>
  );
};

export const ShortlistCanvas = ({
  options,
  colors,
  origins,
  field,
  asOf,
}: {
  options: CompareOption[];
  colors: Record<string, string>;
  origins: Origins;
  field: boolean;
  // The control bar's date, marked on Over time
  asOf?: string;
}) => {
  const [view, setView] = useState<View>("time");
  return (
    <section className={`${ui.card} flex min-w-0 flex-col gap-4 p-5 sm:p-6`} aria-label="Your shortlist, charted">
      <SegmentedControl<View> label="Chart" options={VIEWS} value={view} onChange={setView} size="sm" tone="accent" />
      {view === "time" && <OverTime options={options} colors={colors} origins={origins} field={field} asOf={asOf} />}
      {view === "today" && <DutyToday options={options} colors={colors} partColors={origins.colors} />}
      {view === "imports" && <UsImports options={options} colors={colors} origins={origins} />}
    </section>
  );
};
