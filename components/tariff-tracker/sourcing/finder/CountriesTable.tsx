"use client";

import { useMemo } from "react";
import type { TableColumnDef } from "@/components/ui/table/features";
import { DataTable, TableToolbar, useDataTable } from "@/components/ui/table";
import { CountryName, FlagChips, focus, FocusInfo, Growth, rate, share, transitDays, transitOf, usd, usdThousands } from "./bits";
import { SourcingRow } from "./model";

// Every country, one row each, sortable and filterable (largest US supplier first): landed cost and what
// it's made of, US imports of it and their trend, its exports of it, Export Focus, transit time
// and flags. A row opens its profile.

type Tag = "us" | "producer" | "agreement" | "clear" | "candidate";
const TAG_LABELS: Record<Tag, string> = {
  candidate: "Realistic options",
  us: "Already ship it to the US",
  producer: "Export Focus above 1×",
  agreement: "With a trade agreement",
  clear: "No flags",
};
const TAG_ORDER: Tag[] = ["candidate", "us", "producer", "agreement", "clear"];

const tagsOf = (r: SourcingRow): Tag[] => [
  ...(r.candidate ? (["candidate"] as Tag[]) : []),
  ...((r.us?.value ?? 0) > 0 ? (["us"] as Tag[]) : []),
  ...((r.world?.rca ?? 0) >= 1 ? (["producer"] as Tag[]) : []),
  ...(r.agreement ? (["agreement"] as Tag[]) : []),
  ...(r.flags.length ? [] : (["clear"] as Tag[])),
];

const dash = <span className="text-base-content/40">—</span>;

export const CountriesTable = ({ rows, onSelect, selected }: { rows: SourcingRow[]; onSelect: (code: string) => void; selected: string | null }) => {
  const columns = useMemo<TableColumnDef<SourcingRow, any>[]>(
    () => [
      {
        id: "country",
        accessorFn: (r) => r.country.name,
        header: "Country",
        meta: { rowHeader: true, width: "w-[17%]" },
        cell: ({ row: { original: r } }) => <CountryName row={r} />,
      },
      {
        id: "show",
        accessorFn: (r) => tagsOf(r),
        getUniqueValues: (r) => tagsOf(r),
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
        id: "landed",
        accessorFn: (r) => r.landedPct,
        header: "Landed cost",
        meta: { align: "right", width: "w-28" },
        cell: ({ row: { original: r } }) => (
          <span className="flex flex-col items-end">
            <span className="font-semibold tabular-nums">{rate(r.landedPct)}</span>
            <span className="text-xs text-base-content/60">
              {rate(r.dutyPct)} duty{r.agreement ? "*" : ""} + {r.byLand ? "land" : `${rate(r.freightUsed)}${r.freightEstimated ? "~" : ""}`}
            </span>
            {r.dutyIncomplete && <span className="text-xs text-warning" title={r.dutyNote ?? undefined}>base duty not calculated</span>}
          </span>
        ),
      },
      {
        id: "us",
        accessorFn: (r) => r.us?.value ?? 0,
        header: "US imports of it, 12 mo",
        sortDescFirst: true,
        meta: { align: "right", width: "w-32" },
        cell: ({ row: { original: r } }) =>
          r.us && r.us.value > 0 ? (
            <span className="flex flex-col items-end">
              <span className="tabular-nums">{usd(r.us.value)}</span>
              <span className="inline-flex gap-1.5 text-xs text-base-content/60">
                {share(r.us.share)} · <Growth value={r.us.growth} />
                {r.thinUs && <span title="Its US figures rest on very little (under $250K, or fewer than 3 months with shipments, in the last 12), so its US share, freight and unit value say less.">· thin</span>}
              </span>
            </span>
          ) : (
            dash
          ),
      },
      {
        id: "world",
        accessorFn: (r) => r.world?.exports ?? 0,
        header: "Exports of 6-digit group",
        sortDescFirst: true,
        meta: { align: "right", width: "w-32" },
        cell: ({ row: { original: r } }) =>
          r.world ? (
            <span className="flex flex-col items-end">
              <span className="tabular-nums">{usdThousands(r.world.exports)}</span>
              <span className="text-xs text-base-content/60">
                #{r.world.rank} · {share(r.world.share)}
              </span>
            </span>
          ) : (
            dash
          ),
      },
      {
        id: "rca",
        accessorFn: (r) => r.world?.rca ?? 0,
        // Its (i) is in the toolbar: a button can't sit inside the header's sort button
        header: "Export Focus",
        sortDescFirst: true,
        meta: { align: "right", width: "w-28" },
        cell: ({ row: { original: r } }) => (r.world ? <span className={`tabular-nums ${r.world.rca >= 1 ? "font-semibold text-primary" : ""}`}>{focus(r.world.rca)}</span> : dash),
      },
      {
        id: "days",
        accessorFn: (r) => transitOf(r).days ?? 99,
        header: "Transit to the US",
        meta: { align: "right", width: "w-24" },
        cell: ({ row: { original: r } }) =>
          transitOf(r).days === null ? (
            dash
          ) : (
            <span className="flex flex-col items-end">
              <span className="tabular-nums">{transitDays(r)}</span>
              <span className="text-xs text-base-content/60">{transitOf(r).mode.split(" (")[0].split(",")[0]}</span>
            </span>
          ),
      },
      {
        id: "flags",
        accessorFn: (r) => r.flags.length,
        header: "Flags",
        enableSorting: false,
        meta: { width: "w-[15%]" },
        cell: ({ row: { original: r } }) => <FlagChips flags={r.flags} max={1} />,
      },
    ],
    []
  );

  const table = useDataTable<SourcingRow>({
    data: rows,
    columns,
    getRowId: (r) => r.country.code,
    searchText: (r) => `${r.country.name} ${r.country.code}`,
    hidden: ["show"],
    initialSorting: [{ id: "us", desc: true }],
  });

  return (
    <DataTable
      table={table}
      label="Every Country"
      estimateRowHeight={56}
      onRowClick={(r) => onSelect(r.country.code)}
      rowClassName={(r) => (r.country.code === selected ? "!bg-primary/10" : "")}
      toolbar={
        <>
          <TableToolbar table={table} placeholder="Find a country" facets={["show"]} noun={["country", "countries"]} />
          <span className="inline-flex items-center gap-1 text-xs text-base-content/60">
            What&apos;s Export Focus?
            <FocusInfo />
          </span>
        </>
      }
      empty={<p className="text-sm text-base-content/70">No country matches.</p>}
    />
  );
};
