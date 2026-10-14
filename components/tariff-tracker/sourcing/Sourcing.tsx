"use client";

import { useMemo } from "react";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/20/solid";
import { ColumnDef } from "@tanstack/react-table";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { DataTable, TableToolbar, useDataTable } from "@/components/ui/table";
import { TableStandIn } from "@/components/ui/stand-ins";
import { CENSUS_NOTICE, formatImportValue, useUsImportsFor } from "@/components/duty-calculator/lib/usImports";
import { AccountGate } from "../access/AccountGate";
import { formatRate } from "../formatRate";
import { useInsights } from "../insights/InsightsContext";
import { InsightsProgress } from "../insights/InsightsProgress";
import { sourcingTeaser, wholeDollars } from "../insights/teasers";
import { BeyondPlanTeaser } from "../plan/BeyondPlanTeaser";
import { sectionBySlug } from "../sections";
import { NeedsProducts } from "../shell/NeedsProducts";
import { StatRow } from "../shell/StatRow";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { countryFacet, openColumn } from "../tableColumns";
import { CountryIdea, SourcingIdea, SourcingOption, sourcingIdeas } from "./ideas";

// The Sourcing tab: for each product, the countries that pay less duty than its origin and
// already ship it to the US (Census imports), and the countries that could supply the most of the
// catalog for less. A row opens the product, whose Analysis has every origin.

const OPTIONS_SHOWN = 3;
const COUNTRIES_SHOWN = 8;

const Trend = ({ value, prior }: { value: number; prior: number }) => {
  if (prior <= 0) return <span className="text-base-content/60">new</span>;
  const trend = (value - prior) / prior;
  const Icon = trend >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  return (
    <span className={`inline-flex items-center gap-0.5 ${trend >= 0 ? "text-success" : "text-base-content/60"}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {Math.abs(Math.round(trend * 100))}%
    </span>
  );
};

const Option = ({ option }: { option: SourcingOption }) => (
  <li className="flex flex-wrap items-baseline gap-x-2 text-sm">
    <span className="font-medium text-base-content">
      <span aria-hidden className="mr-1">
        {option.country.flag}
      </span>
      {option.country.name}
    </span>
    <span className="font-semibold text-success">{formatRate(option.pct)}</span>
    <span className="text-xs text-base-content/60">
      {option.agreement ? `with ${option.agreement} · ` : ""}
      ships {formatImportValue(option.value)} · <Trend value={option.value} prior={option.prior} />
    </span>
  </li>
);

const COUNTRY_COLUMNS: ColumnDef<CountryIdea, any>[] = [
  {
    id: "country",
    accessorFn: (c) => c.country.name,
    header: "Country",
    meta: { rowHeader: true },
    cell: ({ row: { original: c } }) => (
      <span className="font-semibold text-base-content">
        <span aria-hidden className="mr-2">
          {c.country.flag}
        </span>
        {c.country.name}
      </span>
    ),
  },
  {
    id: "products",
    accessorFn: (c) => c.products,
    header: "Your products it ships for less",
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ getValue }) => getValue().toLocaleString("en-US"),
  },
  {
    id: "usd",
    accessorFn: (c) => c.usd,
    header: "Up to, one shipment of each",
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ getValue }) => <span className="font-semibold text-success">{wholeDollars(getValue())}</span>,
  },
];

const CountriesTable = ({ countries }: { countries: CountryIdea[] }) => {
  const table = useDataTable<CountryIdea>({ data: countries, columns: COUNTRY_COLUMNS, getRowId: (c) => c.country.code });
  return <DataTable table={table} label="Countries that already make your products for less" />;
};

const ideaColumns = (year?: number): ColumnDef<SourcingIdea, any>[] => [
  {
    id: "product",
    accessorFn: (i) => i.product.entry.element.htsno,
    header: "Product",
    meta: { rowHeader: true, width: "w-[26%]" },
    cell: ({ row: { original: { product } } }) => (
      <span className="flex min-w-0 flex-col text-left">
        <span className={`${mono.className} text-sm font-semibold text-base-content`}>{product.entry.element.htsno}</span>
        <span className="truncate text-xs text-base-content/60" title={product.description}>
          {product.description}
        </span>
        <span className="text-xs text-base-content/60">
          From {product.entry.country.flag} {product.entry.country.name}
        </span>
      </span>
    ),
  },
  {
    id: "country",
    accessorFn: (i) => i.product.entry.country.code,
    header: "Origin",
    filterFn: "facet",
    meta: { facet: countryFacet("Current origin") },
  },
  {
    id: "rate",
    accessorFn: (i) => i.product.totalPct,
    header: "Rate now",
    sortDescFirst: true,
    meta: { align: "right", width: "w-28" },
    cell: ({ getValue }) => formatRate(getValue()),
  },
  {
    id: "options",
    // Each cheaper country on its own in the filter
    accessorFn: (i) => i.options.map((o) => o.country.code),
    getUniqueValues: (i) => i.options.map((o) => o.country.code),
    header: `Cheaper origins that ship it to the US${year ? `, ${year}` : ""}`,
    enableSorting: false,
    filterFn: "facet",
    meta: { facet: countryFacet("Cheaper origin") },
    cell: ({ row: { original: { options } } }) => (
      <span className="flex flex-col gap-1">
        <ul className="flex flex-col gap-1">
          {options.slice(0, OPTIONS_SHOWN).map((o) => (
            <Option key={o.country.code} option={o} />
          ))}
        </ul>
        {options.length > OPTIONS_SHOWN && (
          <span className="text-xs text-base-content/60">+{options.length - OPTIONS_SHOWN} more in the product&apos;s Analysis</span>
        )}
      </span>
    ),
  },
  {
    id: "usd",
    accessorFn: (i) => i.best.usd,
    header: "Up to, per shipment",
    sortDescFirst: true,
    meta: { align: "right", width: "w-40" },
    cell: ({ row: { original: { best } } }) => (
      <span className="flex flex-col items-end">
        <span className={`${tt.display} text-base font-semibold text-base-content`}>{wholeDollars(best.usd)}</span>
        <span className="text-xs text-base-content/60">
          −{formatRate(best.pts)} from {best.country.name}
        </span>
      </span>
    ),
  },
  openColumn<SourcingIdea>(),
];

const IdeasTable = ({ ideas, year, onOpen }: { ideas: SourcingIdea[]; year?: number; onOpen: (key: string) => void }) => {
  const columns = useMemo(() => ideaColumns(year), [year]);
  const table = useDataTable<SourcingIdea>({
    data: ideas,
    columns,
    getRowId: (i) => i.product.key,
    searchText: (i) => `${i.product.entry.element.htsno} ${i.product.description} ${i.product.entry.country.name} ${i.options.map((o) => o.country.name).join(" ")}`,
    hidden: ["country"],
  });
  return (
    <DataTable
      table={table}
      label="Cheaper origins for your products"
      onRowClick={(i) => onOpen(i.product.key)}
      toolbar={<TableToolbar table={table} placeholder="Search code, product or country" facets={["country", "options"]} noun={["product", "products"]} />}
      empty={<p className="text-sm text-base-content/70">No products match.</p>}
    />
  );
};

const SourcingReport = () => {
  const insights = useInsights();
  const nav = useTrackerNav();
  const codes = useMemo(() => insights.products.map((p) => p.entry.element.htsno), [insights.products]);
  const imports = useUsImportsFor(codes);
  const sourcing = useMemo(
    () => sourcingIdeas(insights.products, insights.origins, imports.byCode),
    [insights.products, insights.origins, imports.byCode]
  );
  const year = Array.from(imports.byCode.values()).find(Boolean)?.year;
  const top = sourcing.countries[0];

  return (
    <div className="flex flex-col gap-4">
      <InsightsProgress label="Checking origins" />
      <StatRow
        stats={[
          {
            label: "Potential savings",
            value: wholeDollars(sourcing.usd),
            note: "Up to, per shipment, moving each product",
            tone: "success",
          },
          {
            label: "Products with a cheaper proven origin",
            value: sourcing.ideas.length.toLocaleString("en-US"),
            note: `Of ${insights.products.length.toLocaleString("en-US")} covered by your plan`,
          },
          {
            label: "Top country",
            value: top ? `${top.country.flag} ${top.country.name}` : "—",
            note: top ? `Ships ${top.products.toLocaleString("en-US")} of your products for less` : "None yet",
          },
          {
            label: "Without import figures",
            value: sourcing.withoutFigures.toLocaleString("en-US"),
            note: "Codes Census has no figures for",
          },
        ]}
      />
      <BeyondPlanTeaser />

      {sourcing.countries.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="tt-sourcing-countries">
          <div className="flex flex-col gap-0.5 px-1">
            <h2 id="tt-sourcing-countries" className={tt.title}>
              Countries that already make your products for less
            </h2>
            <p className={ui.caption}>
              Each already ships these products to the US and pays less duty on them than your current origins. One
              country covering several products can mean fewer suppliers to qualify.
            </p>
          </div>
          <CountriesTable countries={sourcing.countries.slice(0, COUNTRIES_SHOWN)} />
        </section>
      )}

      {sourcing.ideas.length ? (
        <IdeasTable ideas={sourcing.ideas} year={year} onOpen={(key) => nav.openProduct(key)} />
      ) : (
        <div className={`${tt.panel} p-6`}>
          <p className={ui.bodySm}>
            {insights.savingsReady && imports.ready
              ? "None of the countries that ship your products to the US pays less duty than your current origins."
              : "Looking for cheaper origins…"}
          </p>
        </div>
      )}

      <p className={ui.caption}>
        Rates include the trade agreement each country could claim, where one lowers it; the goods must meet its rules of
        origin. A new country of origin needs the goods to be made there (substantial transformation), not only shipped
        from there. US imports are general imports by HTS code from the U.S. Census Bureau. {CENSUS_NOTICE}
      </p>
    </div>
  );
};

export const Sourcing = () => {
  const { items, loading } = useTracker();
  const insights = useInsights();
  const section = sectionBySlug("sourcing")!;
  if (loading) return <div className={`${ui.skeleton} h-80 w-full`} />;
  if (!items.length) {
    return (
      <NeedsProducts
        title="Add products to find cheaper origins"
        body="Sourcing finds the countries that pay less duty on each of your products and already ship them to the US."
      />
    );
  }
  return (
    <AccountGate
      feature="sourcing"
      page="tracker"
      title="Find cheaper countries that already make your products"
      teaser={sourcingTeaser(insights) ?? "Checking every origin for your products…"}
      points={section.planned}
      preview={<TableStandIn />}
      minHeight="min-h-[28rem]"
    >
      <SourcingReport />
    </AccountGate>
  );
};
