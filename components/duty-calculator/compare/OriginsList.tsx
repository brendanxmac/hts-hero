"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Sparkline, time } from "@/components/ui/charts/kit";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import * as ui from "@/components/ui/styles";
import { DataTable, TableToolbar, useDataTable } from "@/components/ui/table";
import { PRIMARY_MARK } from "@/components/ui/theme";
import { SUMMARY_COUNTRY_CODES } from "@/libs/hts-duty-summary";
import { rateKey } from "@/components/tariff-tracker/product/analysis/analysis";
import { OriginHistory, RateSegment, volatility } from "@/components/tariff-tracker/product/analysis/history";
import { formatRate } from "@/components/tariff-tracker/formatRate";
import { formatImportValue } from "../lib/usImports";
import { formatMoney, todayIso } from "../lib/format";
import { CompareOption, optionsFor, ProgramMode, segmentsFor, shortAgreement } from "./options";
import { Origins } from "./useOrigins";
import { valueLabel } from "../lib/valueBasis";

// Every origin as one list that sorts like a spreadsheet, cheapest first. Columns: the country
// (yours marked and in the primary color); the duty rate, then a bar of the tariffs that make it
// up in the calculator's colors on one scale (the highest rate fills it; hover lists each tariff);
// with a customs value, the duty on it; the difference from yours (the rate difference, with its
// dollars under it when there's a value), green when cheaper; US imports from Census with the
// country's share of the total; the trend since the verified data starts; and how much it has
// swung. Trend and swing drop out on small screens. Read-only. A country that can claim a trade
// agreement has a second row (with both choices of the control bar), the agreement applied, named
// as a tag so the row reads on its own. Search, and filter to the countries that already ship it,
// are cheaper, are agreement options or are top US sources.

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
  // Duty a shipment at the customs value, when there is one
  duty: number | null;
  imports: number;
  history?: OriginHistory;
  segments: RateSegment[];
  swing: number | null;
  changes: number | null;
  tags: Tag[];
}

// The import's own origin at its own rate (not its agreement option)
const isYours = (r: Row) => r.origin.isOrigin && !r.option.agreement;

const money = (n: number) => formatMoney(Math.round(n)).replace(/\.00$/, "");
// "12%", or "<1%" for a sliver
const shareOf = (part: number, total: number) => {
  const pct = (part / total) * 100;
  return pct > 0 && pct < 1 ? "<1%" : `${Math.round(pct)}%`;
};

export const OriginsList = ({
  origins,
  mode,
  customsValue,
}: {
  origins: Origins;
  // Trade programs: without, with (each country at its agreement rate), or both (the agreement
  // option as a row under its country)
  mode: ProgramMode;
  // The product's customs value, for the dollar columns (left out: rates only)
  customsValue?: number;
}) => {
  const { rates, imports, histories, colors } = origins;
  const yours = rates.find((r) => r.isOrigin);
  // Yours on the same footing: with its own agreement when the choice is "with"
  const yourPct = yours ? (mode === "with" && yours.agreement ? yours.agreement.pct : yours.pct) : 0;

  const rows = useMemo<Row[]>(() => {
    const options = rates.flatMap((r) => optionsFor(r, mode));
    return options.map((option) => {
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
        duty: customsValue && customsValue > 0 ? (pct / 100) * customsValue : null,
        imports: value,
        history,
        segments: segmentsFor(option, history),
        swing: v?.swing ?? null,
        changes: v?.changes ?? null,
        tags,
      };
    });
  }, [rates, mode, histories, imports, yourPct, customsValue]);
  const topPct = Math.max(...rows.map((r) => r.pct), 1);
  const totalImports = imports?.totalValue ?? 0;
  const today = time(todayIso());
  // Dollars only with a value to work them out from
  const value = customsValue && customsValue > 0 ? customsValue : null;

  const columns = useMemo<ColumnDef<Row, any>[]>(
    () => [
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
            <span className={isYours(r) ? "font-bold text-primary" : ""}>{r.origin.country.name}</span>
            {r.option.agreement && <span className={ui.badge("success")}>with {shortAgreement(r.option.agreement.name)}</span>}
            {isYours(r) && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-content">Yours</span>}
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
        // The rate first, then the tariffs that make it up in the calculator's colors, on one
        // scale (the highest rate in the table fills the track)
        id: "rate",
        accessorFn: (r) => r.pct,
        header: "Duty rate",
        meta: { width: "w-[26%]" },
        cell: ({ row: { original: r } }) => (
          <span className="flex items-center gap-3">
            <span className={`w-16 shrink-0 font-semibold tabular-nums ${isYours(r) ? "text-primary" : "text-base-content"}`}>{formatRate(r.pct)}</span>
            <span className="group relative hidden min-w-0 flex-1 py-2 sm:block">
              {/* What it's made of, on hover */}
              <span
                role="tooltip"
                className={`${ui.tooltip} invisible absolute left-0 top-full z-30 mt-1 flex w-72 flex-col gap-1.5 p-3 text-xs opacity-0 transition-opacity group-hover:visible group-hover:opacity-100`}
              >
                <span className="font-semibold text-base-content">
                  {r.origin.country.flag} {r.origin.country.name}
                  {r.option.agreement ? ` with ${shortAgreement(r.option.agreement.name)}` : ""}: {formatRate(r.pct)}
                </span>
                {r.option.parts.length ? (
                  r.option.parts.map((p) => (
                    <span key={p.key} className="flex items-center justify-between gap-3 text-base-content/80">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colors[p.key] }} aria-hidden />
                        <span className="truncate">{p.key}</span>
                      </span>
                      <span className="tabular-nums">{formatRate(p.pct)}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-base-content/70">Duty free</span>
                )}
              </span>
              <StackedBar
                parts={r.option.parts.map((p) => ({ label: p.key, amount: p.pct, color: colors[p.key] }))}
                formatValue={formatRate}
                size="xs"
                shape="pill"
                legend={false}
                fill={r.pct / topPct}
                className="pointer-events-none"
              />
            </span>
          </span>
        ),
      },
      ...(value
        ? [
            {
              id: "duty",
              accessorFn: (r: Row) => r.duty,
              header: `Duty on ${valueLabel(value)}`,
              meta: { align: "right" as const },
              cell: ({ row: { original: r } }: { row: { original: Row } }) => <span className="tabular-nums text-base-content">{money(r.duty ?? 0)}</span>,
            },
          ]
        : []),
      {
        // The rate difference, with its dollars on the shipment's value under it when there is one
        id: "diff",
        accessorFn: (r) => r.diff,
        header: "Vs yours",
        meta: { align: "right" },
        cell: ({ row: { original: r } }) => {
          if (isYours(r)) return <span className="text-base-content/60">—</span>;
          const same = Math.abs(r.diff) < 0.005;
          if (same) return <span className="text-base-content/60">Same</span>;
          const tone = r.diff < 0 ? "text-success" : "text-error";
          const sign = r.diff < 0 ? "−" : "+";
          const rate = `${sign}${formatRate(Math.abs(r.diff))}`;
          return value ? (
            <span className="tabular-nums">
              <span className={`font-semibold ${tone}`}>{rate}</span>
              <span className="block text-xs text-base-content/60">
                {sign}
                {money(Math.abs(r.diff / 100) * value)}
              </span>
            </span>
          ) : (
            <span className={`tabular-nums ${tone}`}>{rate}</span>
          );
        },
      },
      {
        // Census value with its share of everything the US imports of it
        id: "imports",
        accessorFn: (r) => r.imports,
        header: imports ? `US imports, ${imports.year}` : "US imports",
        sortDescFirst: true,
        meta: { align: "right" },
        cell: ({ row: { original: r } }) =>
          r.imports > 0 ? (
            <span className="tabular-nums">
              {formatImportValue(r.imports)}
              {totalImports > 0 && <span className="block text-xs text-base-content/60">{shareOf(r.imports, totalImports)} of imports</span>}
            </span>
          ) : (
            <span className="text-base-content/40">—</span>
          ),
      },
      {
        id: "trend",
        header: "Trend",
        enableSorting: false,
        meta: { width: "hidden w-28 lg:table-cell" },
        cell: ({ row: { original: r } }) =>
          r.segments.length ? (
            <Sparkline
              points={r.segments.map((s) => ({ x: time(s.from), y: s.pct }))}
              color={isYours(r) ? PRIMARY_MARK : "oklch(var(--bc) / 0.45)"}
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
        meta: { align: "right", width: "hidden lg:table-cell" },
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
    [topPct, totalImports, imports, today, colors, value]
  );

  const table = useDataTable<Row>({
    data: rows,
    columns,
    getRowId: (r) => r.option.key,
    searchText: (r) => `${r.origin.country.name} ${r.origin.country.code}`,
    hidden: ["show"],
    initialSorting: [{ id: "rate", desc: false }],
  });

  // No title: Compare's Table tab names it
  // Every tariff in any row, for the legend of the bars' colors
  const partKeys = Array.from(new Set(rows.flatMap((r) => r.option.parts.map((p) => p.key))));
  const toolbar = (
    <>
      <TableToolbar table={table} placeholder="Find a country" facets={["show"]} noun={["option", "options"]} />
      {partKeys.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-xs text-base-content/70" aria-label="What the duty rate bars are made of">
          <li className={ui.label}>Duty rate bars</li>
          {partKeys.map((key) => (
            <li key={key} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: colors[key] }} aria-hidden />
              {key}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <DataTable
      table={table}
      label="Every origin, ranked"
      estimateRowHeight={52}
      // Yours stands out as the list scrolls past it: a brand tint across the row and a brand bar
      // down its left edge
      rowClassName={(r) => (isYours(r) ? "!bg-primary/15 hover:!bg-primary/20 [&>*:first-child]:shadow-[inset_4px_0_0_0_oklch(var(--p))]" : "")}
      toolbar={toolbar}
      empty={<p className="text-sm text-base-content/70">No country matches.</p>}
    />
  );
};
