"use client";

import { ReactNode, useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { SERIES_COLORS } from "@/components/ui/theme";
import { useInsights } from "../insights/InsightsContext";
import { formatRate } from "../formatRate";
import { signedRate } from "../impact/format";
import { BarList, changeColor, Columns, Datum, Donut, StepLines } from "./charts";
import {
  breakdown,
  chapterName,
  chapterOf,
  DimensionId,
  DIMENSIONS,
  GROUPINGS,
  GroupRow,
  importMoves,
  importSeries,
  InsightsInput,
  MetricId,
  METRIC_ORDER,
  METRICS,
  sortRows,
  takeaway,
  topRows,
  trendSeries,
  yearAgo,
} from "./lib/data";
import { groupColors, Lesson, ShowAll } from "./shared";

// Build your own chart from the catalog: what to see (a breakdown, a trend over time, or imports
// compared), the measure, what to group by, the chart, and which imports to include. Every chart
// gets a title and a one-line lesson worked out from what it shows. Not saved yet: the owner
// wants to see how it's used first.

type Mode = "breakdown" | "trend" | "compare";
type ChartKind = "bars" | "columns" | "donut" | "table";
type Window = "12m" | "all";

export interface ChartSpec {
  mode: Mode;
  metric: MetricId;
  groupBy: DimensionId;
  chart: ChartKind;
  window: Window;
  country: string;
  chapter: string;
  top: number;
  // Compare: the imports picked (keys)
  imports: string[];
}

const DEFAULT_SPEC: ChartSpec = {
  mode: "breakdown",
  metric: "dutyShare",
  groupBy: "program",
  chart: "bars",
  window: "12m",
  country: "all",
  chapter: "all",
  top: 10,
  imports: [],
};

// Ideas to start from, each a whole chart
const IDEAS: { label: string; spec: Partial<ChartSpec> }[] = [
  { label: "Duty by tariff", spec: { mode: "breakdown", metric: "dutyShare", groupBy: "program", chart: "donut" } },
  { label: "Average rate by country", spec: { mode: "breakdown", metric: "avgRate", groupBy: "country", chart: "bars" } },
  { label: "12-month change by chapter", spec: { mode: "breakdown", metric: "change", groupBy: "chapter", chart: "bars" } },
  { label: "Imports by rate band", spec: { mode: "breakdown", metric: "imports", groupBy: "band", chart: "columns" } },
  { label: "Tariffs over time", spec: { mode: "trend", metric: "avgRate", groupBy: "program", window: "all" } },
  { label: "Countries over time", spec: { mode: "trend", metric: "avgRate", groupBy: "country", window: "12m" } },
  { label: "Compare my top imports", spec: { mode: "compare", window: "all", imports: [] } },
];

const TREND_METRICS: MetricId[] = ["avgRate", "maxRate", "imports"];
const TREND_GROUPS: DimensionId[] = ["all", ...GROUPINGS.filter((g) => g !== "band" && g !== "movement")];

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold text-base-content/70">{label}</span>
    {children}
  </label>
);

export const Builder = ({ input, preview = false }: { input: InsightsInput; preview?: boolean }) => {
  const { range } = useInsights();
  const [spec, setSpecState] = useState<ChartSpec>(DEFAULT_SPEC);
  const [search, setSearch] = useState("");
  // Every group drawn, not just the biggest few; back to the few whenever the chart changes
  const [all, setAll] = useState(false);
  const setSpec = (next: ChartSpec) => {
    setSpecState(next);
    setAll(false);
  };
  const set = (patch: Partial<ChartSpec>) => setSpec({ ...spec, ...patch });

  // The imports in play: the country and chapter filters
  const countries = useMemo(() => breakdown(input, "country").sort((a, b) => b.imports - a.imports), [input]);
  const chapters = useMemo(() => breakdown(input, "chapter").sort((a, b) => a.key.localeCompare(b.key)), [input]);
  const products = useMemo(
    () => input.products.filter((p) => (spec.country === "all" || p.entry.country.code === spec.country) && (spec.chapter === "all" || chapterOf(p) === spec.chapter)),
    [input.products, spec.country, spec.chapter]
  );
  const scoped = useMemo(() => ({ ...input, products }), [input, products]);
  const from = spec.window === "12m" ? yearAgo(input.today) : range.from;

  const metric = METRICS[spec.metric];
  const dimension = DIMENSIONS[spec.groupBy];
  // Tariffs that stopped applying in the last year only matter to the 12-month change
  const rows = useMemo(
    () =>
      spec.mode === "compare"
        ? []
        : sortRows(
            breakdown(scoped, spec.groupBy).filter((r) => spec.groupBy !== "program" || spec.metric === "change" || r.avgRate > 0.005),
            metric,
            spec.groupBy
          ),
    [scoped, spec.groupBy, spec.mode, spec.metric, metric]
  );

  // Compare: the picked imports, or the three highest-rate ones to start
  const moves = useMemo(() => importMoves(scoped).sort((a, b) => b.now - a.now), [scoped]);
  const picked = spec.imports.length ? moves.filter((m) => spec.imports.includes(m.product.key)) : moves.slice(0, 3);
  const pickedKeys = picked.map((m) => m.product.key);
  const toggleImport = (key: string) =>
    set({ imports: pickedKeys.includes(key) ? pickedKeys.filter((k) => k !== key) : pickedKeys.length >= 5 ? pickedKeys : [...pickedKeys, key] });

  const scope = [
    spec.country !== "all" ? countries.find((c) => c.key === spec.country)?.label : null,
    spec.chapter !== "all" ? `Chapter ${spec.chapter}` : null,
  ].filter(Boolean);
  const scopeText = `${products.length.toLocaleString("en-US")} ${products.length === 1 ? "import" : "imports"}${scope.length ? ` · ${scope.join(" · ")}` : ""}`;

  const chart = (() => {
    if (!products.length) return <p className="m-0 text-sm text-base-content/70">No imports match these filters.</p>;

    if (spec.mode === "compare") {
      const series = importSeries(scoped, picked.map((m) => m.product), from);
      const colors = Object.fromEntries(series.map((s, i) => [s.key, SERIES_COLORS[i]]));
      const widest = picked.reduce<(typeof picked)[number] | null>((a, m) => (!a || m.change > a.change ? m : a), null);
      return {
        title: "Your Imports Compared",
        body: (
          <div className="flex flex-col gap-4">
            <StepLines series={series} colors={colors} to={input.today} format={formatRate} label="The picked imports' rates over time" />
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-xs text-base-content/60">
                  <th className="py-1.5 text-left font-medium">Import</th>
                  <th className="py-1.5 text-right font-medium">A year ago</th>
                  <th className="py-1.5 text-right font-medium">Today</th>
                  <th className="py-1.5 text-right font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {picked.map((m, i) => (
                  <tr key={m.product.key} className="border-t border-base-300">
                    <td className="py-2">
                      {/* Series color (DESIGN_SYSTEM §10) */}
                      <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: SERIES_COLORS[i] }} aria-hidden />
                      <span className={`${mono.className} font-semibold`}>{m.product.entry.element.htsno}</span>{" "}
                      <span className="text-base-content/70">
                        {m.product.entry.country.flag} {m.product.entry.country.name}
                      </span>
                    </td>
                    <td className="py-2 text-right">{formatRate(m.then)}</td>
                    <td className="py-2 text-right font-semibold">{formatRate(m.now)}</td>
                    <td className="py-2 text-right">
                      <span className={tt.chip(m.change > 0.005 ? "error" : m.change < -0.005 ? "success" : "neutral")}>{signedRate(m.change)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
        lesson:
          widest && widest.change > 0.005
            ? `${widest.product.entry.element.htsno} from ${widest.product.entry.country.name} rose the most in 12 months: ${signedRate(widest.change)}.`
            : picked.length > 1
              ? `${picked[0].product.entry.element.htsno} from ${picked[0].product.entry.country.name} has the highest rate of these, ${formatRate(picked[0].now)}.`
              : null,
      };
    }

    if (spec.mode === "trend") {
      const trendMetric = TREND_METRICS.includes(spec.metric) ? spec.metric : "avgRate";
      const sorted = sortRows(rows, METRICS[trendMetric], spec.groupBy);
      const groups = all ? sorted : sorted.slice(0, 5);
      const series = trendSeries(scoped, spec.groupBy, trendMetric, from, groups);
      const colors = groupColors(groups, spec.groupBy, true);
      const format = METRICS[trendMetric].format;
      const moved = series
        .map((s) => ({ label: s.label, change: s.points[s.points.length - 1].value - s.points[0].value }))
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0];
      return {
        title: `${METRICS[trendMetric].title} Over Time${dimension.by ? ` ${dimension.by}` : ""}`,
        body: (
          <div className="flex flex-col gap-2">
            <StepLines series={series} colors={colors} to={input.today} format={format} label={`${METRICS[trendMetric].title} over time`} />
            {rows.length > 5 && <ShowAll more={`${rows.length - 5} more ${rows.length - 5 === 1 ? "line" : "lines"}`} open={all} onToggle={() => setAll(!all)} />}
          </div>
        ),
        lesson:
          moved && Math.abs(moved.change) > 0.005
            ? `${moved.label} moved the most in this period: ${trendMetric === "imports" ? `${moved.change > 0 ? "+" : "−"}${Math.abs(Math.round(moved.change))} imports` : signedRate(moved.change)}.`
            : "Nothing in these groups moved in this period.",
      };
    }

    const { rows: shown, rest } = topRows(rows, metric, all ? Infinity : spec.top);
    const distinct = spec.chart === "donut" || spec.groupBy === "program";
    const colors = groupColors(shown, spec.groupBy, distinct);
    const data: Datum[] = shown.map((r) => ({
      key: r.key,
      label: r.label,
      text: r.label,
      value: metric.value(r),
      display: metric.format(metric.value(r)),
      note: `${r.imports.toLocaleString("en-US")} ${r.imports === 1 ? "import" : "imports"}`,
      color: metric.signed ? changeColor(metric.value(r)) : colors[r.key],
    }));
    if (rest)
      data.push({
        key: "rest",
        label: <span className="text-primary">{rest.label}</span>,
        text: rest.label,
        value: rest.value,
        display: metric.format(rest.value),
        color: "oklch(var(--bc) / 0.18)",
        onClick: () => setAll(true),
      });
    const hidden = rows.length - spec.top;
    const kind = spec.chart === "donut" && !metric.share ? "bars" : spec.chart;
    return {
      title: `${metric.title} ${dimension.by}`,
      body:
        kind === "table" ? (
          <BreakdownTable rows={rows} sections={input.sections} groupBy={spec.groupBy} />
        ) : kind === "donut" ? (
          <Donut data={data} center={`${rows.length}`} centerNote={`${rows.length === 1 ? "group" : "groups"}, ${scopeText}`} />
        ) : kind === "columns" ? (
          <Columns data={data} format={metric.format} label={`${metric.title} ${dimension.by}`} integer={spec.metric === "imports"} />
        ) : (
          <BarList data={data} signed={metric.signed} />
        ),
      more:
        kind !== "table" && hidden > 0 ? <ShowAll more={`${hidden} more ${hidden === 1 ? "group" : "groups"}`} open={all} onToggle={() => setAll(!all)} /> : null,
      lesson: takeaway(rows, metric, spec.groupBy),
    };
  })();

  const filtered = moves.filter((m) => !search || `${m.product.entry.element.htsno} ${m.product.entry.country.name} ${m.product.description}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className={`${tt.panel} overflow-hidden`} aria-labelledby="ti-builder">
      <div className="flex flex-col gap-3 border-b border-base-300 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="ti-builder" className={tt.title}>
              Build Your Own Chart
            </h2>
            <p className={tt.subtitle}>Any measure, grouped any way, over any of your imports. Start from an idea or set it up yourself.</p>
          </div>
          <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => setSpec(DEFAULT_SPEC)} disabled={preview}>
            Start over
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {IDEAS.map((idea) => (
            <button
              key={idea.label}
              type="button"
              disabled={preview}
              onClick={() => setSpec({ ...DEFAULT_SPEC, country: spec.country, chapter: spec.chapter, ...idea.spec })}
              className="rounded-full border border-base-300 px-3 py-1 text-xs font-semibold text-base-content/80 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {idea.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 border-b border-base-300 bg-tt-soft/60 px-6 py-5 lg:border-b-0 lg:border-r">
          <Field label="What to see">
            <SegmentedControl<Mode>
              label="What to see"
              fullWidth
              size="sm"
              value={spec.mode}
              onChange={(mode) =>
                set({
                  mode,
                  metric: mode === "trend" && !TREND_METRICS.includes(spec.metric) ? "avgRate" : spec.metric,
                  groupBy: mode === "trend" && !TREND_GROUPS.includes(spec.groupBy) ? "program" : mode === "breakdown" && spec.groupBy === "all" ? "program" : spec.groupBy,
                })
              }
              options={[
                { id: "breakdown", label: "Breakdown" },
                { id: "trend", label: "Over time" },
                { id: "compare", label: "Compare" },
              ]}
            />
          </Field>
          {spec.mode !== "compare" && (
            <>
              <Field label="Measure">
                <select className={ui.selectSm} value={spec.metric} onChange={(e) => set({ metric: e.target.value as MetricId })}>
                  {(spec.mode === "trend" ? TREND_METRICS : METRIC_ORDER).map((id) => (
                    <option key={id} value={id}>
                      {METRICS[id].label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Group by">
                <select className={ui.selectSm} value={spec.groupBy} onChange={(e) => set({ groupBy: e.target.value as DimensionId })}>
                  {(spec.mode === "trend" ? TREND_GROUPS : GROUPINGS).map((id) => (
                    <option key={id} value={id}>
                      {id === "all" ? "Nothing (whole catalog)" : DIMENSIONS[id].label}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}
          {spec.mode === "breakdown" && (
            <>
              <Field label="Chart">
                <SegmentedControl<ChartKind>
                  label="Chart"
                  fullWidth
                  size="sm"
                  value={spec.chart === "donut" && !metric.share ? "bars" : spec.chart}
                  onChange={(chart) => set({ chart })}
                  options={[
                    { id: "bars", label: "Bars" },
                    { id: "columns", label: "Columns" },
                    ...(metric.share ? [{ id: "donut" as const, label: "Donut" }] : []),
                    { id: "table", label: "Table" },
                  ]}
                />
              </Field>
              <Field label="Show">
                <select className={ui.selectSm} value={spec.top} onChange={(e) => set({ top: Number(e.target.value) })}>
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      Top {n}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}
          {spec.mode !== "breakdown" && (
            <Field label="Period">
              <SegmentedControl<Window>
                label="Period"
                fullWidth
                size="sm"
                value={spec.window}
                onChange={(window) => set({ window })}
                options={[
                  { id: "12m", label: "12 months" },
                  { id: "all", label: "All history" },
                ]}
              />
            </Field>
          )}
          <Field label="Country of origin">
            <select className={ui.selectSm} value={spec.country} onChange={(e) => set({ country: e.target.value, imports: [] })}>
              <option value="all">All countries</option>
              {countries.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label} ({c.imports})
                </option>
              ))}
            </select>
          </Field>
          <Field label="HTS chapter">
            <select className={ui.selectSm} value={spec.chapter} onChange={(e) => set({ chapter: e.target.value, imports: [] })}>
              <option value="all">All chapters</option>
              {chapters.map((c) => (
                <option key={c.key} value={c.key}>
                  Ch. {c.key} {chapterName(c.key, input.sections)?.slice(0, 40) ?? ""} ({c.imports})
                </option>
              ))}
            </select>
          </Field>
          {spec.mode === "compare" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-base-content/70">Imports ({pickedKeys.length} of 5)</span>
              <label className="relative">
                <span className="sr-only">Find an import</span>
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/50" aria-hidden />
                <input className={`${ui.selectSm} !pl-8`} placeholder="Code, country or name" value={search} onChange={(e) => setSearch(e.target.value)} />
              </label>
              <ul className="m-0 flex max-h-64 list-none flex-col overflow-y-auto rounded-xl bg-base-100 p-1">
                {filtered.slice(0, 100).map((m) => {
                  const on = pickedKeys.includes(m.product.key);
                  return (
                    <li key={m.product.key}>
                      <label className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-tt-soft ${!on && pickedKeys.length >= 5 ? "opacity-50" : ""}`}>
                        <input type="checkbox" className="checkbox checkbox-primary checkbox-xs" checked={on} onChange={() => toggleImport(m.product.key)} disabled={!on && pickedKeys.length >= 5} />
                        <span className={`${mono.className} font-semibold`}>{m.product.entry.element.htsno}</span>
                        <span className="truncate text-base-content/70">
                          {m.product.entry.country.flag} {m.product.entry.country.name}
                        </span>
                        <span className="ml-auto tabular-nums text-base-content/60">{formatRate(m.now)}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-5 px-6 py-6 lg:px-7">
          {"title" in chart ? (
            <>
              <div>
                <h3 className={tt.title}>{chart.title}</h3>
                <p className={tt.subtitle}>
                  {spec.mode === "compare" ? `${picked.length} of ${scopeText}` : scopeText}
                  {spec.mode !== "breakdown" ? ` · ${spec.window === "12m" ? "last 12 months" : "all verified history"}` : ""}
                </p>
              </div>
              {chart.body}
              {"more" in chart && chart.more}
              {chart.lesson && <Lesson>{chart.lesson}</Lesson>}
            </>
          ) : (
            chart
          )}
        </div>
      </div>
    </section>
  );
};

// Every measure for every group, for reading the numbers themselves
const BreakdownTable = ({ rows, sections, groupBy }: { rows: GroupRow[]; sections: InsightsInput["sections"]; groupBy: DimensionId }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm tabular-nums">
      <thead>
        <tr className="text-xs text-base-content/60">
          <th className="py-1.5 pr-3 text-left font-medium">{DIMENSIONS[groupBy].label}</th>
          {METRIC_ORDER.map((id) => (
            <th key={id} className="px-2 py-1.5 text-right font-medium">
              {METRICS[id].label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} className="border-t border-base-300">
            <td className="max-w-[16rem] truncate py-2 pr-3 text-base-content" title={groupBy === "chapter" ? chapterName(r.key, sections) : r.label}>
              {r.label}
              {groupBy === "chapter" && <span className="text-base-content/60"> {chapterName(r.key, sections) ?? ""}</span>}
            </td>
            {METRIC_ORDER.map((id) => {
              const v = METRICS[id].value(r);
              return (
                <td key={id} className={`px-2 py-2 text-right ${METRICS[id].signed ? (v > 0.005 ? "text-error" : v < -0.005 ? "text-success" : "") : ""}`}>
                  {METRICS[id].format(v)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
