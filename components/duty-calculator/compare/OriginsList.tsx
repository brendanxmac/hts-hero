"use client";

import { useMemo, useState } from "react";
import { MapPinIcon } from "@heroicons/react/20/solid";
import { MapPinIcon as MapPinOutline } from "@heroicons/react/24/outline";
import { ColumnDef } from "@tanstack/react-table";
import { barWidth, Sparkline, time } from "@/components/ui/charts/kit";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { DataTable, TableToolbar, useDataTable } from "@/components/ui/table";
import { MUTED_MARK } from "@/components/ui/theme";
import { SUMMARY_COUNTRY_CODES } from "@/libs/hts-duty-summary";
import { rateKey } from "@/components/tariff-tracker/product/analysis/analysis";
import { OriginHistory, RateSegment, volatility } from "@/components/tariff-tracker/product/analysis/history";
import { formatRate } from "@/components/tariff-tracker/formatRate";
import { formatImportValue } from "../lib/usImports";
import { todayIso } from "../lib/format";
import { CompareOption, optionsFor, ProgramMode, segmentsFor, shortAgreement } from "./options";
import { RateDots } from "./RateDots";
import { Origins } from "./useOrigins";

// Every origin as one ranked list, under the shortlist: each chart is a column (the rate on one
// scale, the difference from yours, US imports from Census, the trend since the verified data
// starts, how much it has swung), so the whole field reads at a glance and sorts like a
// spreadsheet, or as one chart (RateDots: every option as a dot at its rate), the same search
// and filter applying to both. Pin a country to put it on the shortlist (or take it off); shortlisted rows carry
// their color. A country that can claim a trade agreement has a second row (with both choices of
// the control bar), the agreement applied, named as a tag so the row reads on its own. Search, and filter to the countries that already ship it, are cheaper, are
// agreement options or are top US sources.

type Tag = "suppliers" | "cheaper" | "agreements" | "sources";

const TAG_LABELS: Record<Tag, string> = {
  suppliers: "Already ship it to the US",
  cheaper: "Cheaper than yours",
  agreements: "With a trade agreement",
  sources: "Top 20 US import sources",
};
const TAG_ORDER: Tag[] = ["suppliers", "cheaper", "agreements", "sources"];

interface Row {
  option: CompareOption;
  origin: CompareOption["origin"];
  pct: number;
  diff: number;
  imports: number;
  history?: OriginHistory;
  segments: RateSegment[];
  swing: number | null;
  changes: number | null;
  tags: Tag[];
}

export const OriginsList = ({
  origins,
  mode,
  shortlist,
  colors,
  onToggle,
}: {
  origins: Origins;
  // Trade programs: without, with (each country at its agreement rate), or both (the agreement
  // option as a row under its country)
  mode: ProgramMode;
  shortlist: ReadonlySet<string>;
  colors: Record<string, string>;
  onToggle: (code: string) => void;
}) => {
  const { rates, imports, histories } = origins;
  const yours = rates.find((r) => r.isOrigin);
  // Yours on the same footing: with its own agreement when the choice is "with"
  const yourPct = yours ? (mode === "with" && yours.agreement ? yours.agreement.pct : yours.pct) : 0;

  const rows = useMemo<Row[]>(
    () =>
      rates.flatMap((r) => optionsFor(r, mode)).map((option) => {
        const { origin, pct } = option;
        const history = histories.get(origin.country.code);
        const v = history ? volatility(history, option.agreement ? "agreements" : "standard") : null;
        const value = imports?.byCountry.get(origin.country.code)?.value ?? 0;
        const tags: Tag[] = [];
        if (value > 0) tags.push("suppliers");
        if (!(origin.isOrigin && !option.agreement) && rateKey(pct) < rateKey(yourPct)) tags.push("cheaper");
        if (option.agreement) tags.push("agreements");
        if (SUMMARY_COUNTRY_CODES.includes(origin.country.code)) tags.push("sources");
        return {
          option,
          origin,
          pct,
          diff: pct - yourPct,
          imports: value,
          history,
          segments: segmentsFor(option, history),
          swing: v?.swing ?? null,
          changes: v?.changes ?? null,
          tags,
        };
      }),
    [rates, mode, histories, imports, yourPct]
  );
  const topPct = Math.max(...rows.map((r) => r.pct), 1);
  const topImports = Math.max(...rows.map((r) => r.imports), 1);
  const today = time(todayIso());

  const columns = useMemo<ColumnDef<Row, any>[]>(
    () => [
      {
        id: "pin",
        header: () => <span className="sr-only">On your shortlist</span>,
        enableSorting: false,
        meta: { width: "w-10" },
        cell: ({ row: { original: r } }) => {
          const on = shortlist.has(r.origin.country.code);
          const Icon = on ? MapPinIcon : MapPinOutline;
          return r.origin.isOrigin ? (
            <span className="block h-5 w-5 rounded-full" style={{ background: colors[r.origin.country.code] }} title="Your origin" aria-label="Your origin" />
          ) : (
            <button
              type="button"
              onClick={() => onToggle(r.origin.country.code)}
              aria-pressed={on}
              aria-label={on ? `Take ${r.origin.country.name} off your shortlist` : `Add ${r.origin.country.name} to your shortlist`}
              title={on ? "On your shortlist: select to take it off" : "Add to your shortlist"}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-base-200 ${on ? "" : "text-base-content/40 hover:text-primary"}`}
              // A shortlisted pin wears the country's color (runtime color, DESIGN_SYSTEM §10)
              style={on ? { color: colors[r.origin.country.code] } : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </button>
          );
        },
      },
      {
        id: "country",
        accessorFn: (r) => r.origin.country.name,
        header: "Country",
        meta: { rowHeader: true },
        // Every row names its country, so it reads on its own in any order; an agreement option
        // carries the agreement as a tag
        cell: ({ row: { original: r } }) => (
          <span className="flex items-center gap-2 whitespace-nowrap text-base-content">
            <span aria-hidden>{r.origin.country.flag}</span>
            <span className={shortlist.has(r.origin.country.code) ? "font-semibold" : ""}>{r.origin.country.name}</span>
            {r.option.agreement && <span className={ui.badge("success")}>with {shortAgreement(r.option.agreement.name)}</span>}
            {r.origin.isOrigin && !r.option.agreement && <span className={ui.badge("primary")}>Yours</span>}
          </span>
        ),
      },
      {
        id: "show",
        accessorFn: (r) => r.tags,
        getUniqueValues: (r) => r.tags,
        header: "Show",
        filterFn: "facet",
        meta: {
          facet: {
            label: "Show",
            describe: (value: string) => ({ label: TAG_LABELS[value as Tag] ?? value }),
            compare: (a, b) => TAG_ORDER.indexOf(a.value as Tag) - TAG_ORDER.indexOf(b.value as Tag),
          },
        },
      },
      {
        id: "rate",
        accessorFn: (r) => r.pct,
        header: "Duty rate",
        meta: { align: "right", width: "w-[22%]" },
        cell: ({ row: { original: r } }) => (
          <span className="flex items-center justify-end gap-3">
            <span className="hidden h-2 flex-1 overflow-hidden rounded-full bg-base-200 sm:block" aria-hidden>
              <span
                className="block h-full rounded-full"
                style={{ width: barWidth(r.pct, topPct), background: shortlist.has(r.origin.country.code) ? colors[r.origin.country.code] : MUTED_MARK }}
              />
            </span>
            <span className="w-14 font-semibold">{formatRate(r.pct)}</span>
          </span>
        ),
      },
      {
        id: "diff",
        accessorFn: (r) => r.diff,
        header: "Vs yours",
        meta: { align: "right" },
        cell: ({ row: { original: r } }) => {
          const same = Math.abs(r.diff) < 0.005;
          return (
            <span className={(r.origin.isOrigin && !r.option.agreement) || same ? "text-base-content/50" : r.diff < 0 ? "text-success" : "text-error"}>
              {r.origin.isOrigin && !r.option.agreement ? "—" : same ? "Same" : `${r.diff < 0 ? "−" : "+"}${formatRate(Math.abs(r.diff))}`}
            </span>
          );
        },
      },
      {
        id: "imports",
        accessorFn: (r) => r.imports,
        header: imports ? `US imports, ${imports.year}` : "US imports",
        sortDescFirst: true,
        meta: { align: "right", width: "w-[18%]" },
        cell: ({ row: { original: r } }) =>
          r.imports > 0 ? (
            <span className="flex items-center justify-end gap-3">
              <span className="hidden h-2 flex-1 overflow-hidden rounded-full bg-base-200 sm:block" aria-hidden>
                <span className="block h-full rounded-full bg-base-content/30" style={{ width: barWidth(r.imports, topImports) }} />
              </span>
              <span className="w-16">{formatImportValue(r.imports)}</span>
            </span>
          ) : (
            <span className="text-base-content/40">—</span>
          ),
      },
      {
        id: "trend",
        header: "Trend",
        enableSorting: false,
        meta: { width: "w-28" },
        cell: ({ row: { original: r } }) =>
          r.segments.length ? (
            <Sparkline
              points={r.segments.map((s) => ({ x: time(s.from), y: s.pct }))}
              color={shortlist.has(r.origin.country.code) ? colors[r.origin.country.code] : "oklch(var(--bc) / 0.45)"}
              step
              to={today}
              height={24}
              label={`${r.origin.country.name}'s rate since the verified data starts`}
            />
          ) : (
            <span className={`${ui.skeleton} block h-6 w-full`} aria-hidden />
          ),
      },
      {
        id: "stability",
        accessorFn: (r) => r.swing ?? -1,
        header: "Swing",
        meta: { align: "right" },
        cell: ({ row: { original: r } }) =>
          r.swing === null ? (
            <span className="text-base-content/40">…</span>
          ) : r.changes === 0 ? (
            <span className="text-base-content/60">Steady</span>
          ) : (
            <span title={`${r.changes} ${r.changes === 1 ? "change" : "changes"}, ${formatRate(r.swing)} from lowest to highest`}>
              ±{formatRate(r.swing / 2)}
              <span className="block text-xs text-base-content/60">
                {r.changes} {r.changes === 1 ? "change" : "changes"}
              </span>
            </span>
          ),
      },
    ],
    [shortlist, colors, onToggle, topPct, topImports, imports, today]
  );

  const table = useDataTable<Row>({
    data: rows,
    columns,
    getRowId: (r) => r.option.key,
    searchText: (r) => `${r.origin.country.name} ${r.origin.country.code}`,
    hidden: ["show"],
    initialSorting: [{ id: "rate", desc: false }],
  });

  const [view, setView] = useState<"table" | "chart">("chart");
  const toolbar = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className={ui.cardTitle}>Every origin</h4>
          <p className={`${ui.caption} mt-0.5`}>
            All {rates.length} countries this could come from{mode === "both" ? ", each trade agreement option beside its country" : ""}. Select one to add it to
            your shortlist.
          </p>
        </div>
        <SegmentedControl<"table" | "chart">
          label="Show every origin as"
          options={[
            { id: "chart", label: "Chart" },
            { id: "table", label: "Table" },
          ]}
          value={view}
          onChange={setView}
          size="sm"
          tone="accent"
        />
      </div>
      <TableToolbar table={table} placeholder="Find a country" facets={["show"]} noun={["option", "options"]} />
    </>
  );

  // The chart draws what the table would show: the same search and filter
  if (view === "chart")
    return (
      <section className={`${ui.card} flex flex-col gap-4 px-5 py-4 sm:px-6`} aria-label="Every origin">
        {toolbar}
        <RateDots
          options={table.getRowModel().rows.map((r) => r.original.option)}
          yourPct={yourPct}
          shortlist={shortlist}
          colors={colors}
          imports={imports?.byCountry ?? null}
          onToggle={onToggle}
        />
      </section>
    );

  return (
    <DataTable
      table={table}
      label="Every origin, ranked"
      estimateRowHeight={52}
      toolbar={toolbar}
      empty={<p className="text-sm text-base-content/70">No country matches.</p>}
    />
  );
};
