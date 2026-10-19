"use client";

import { useMemo, useState } from "react";
import type { TableColumnDef } from "@/components/ui/table/features";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { DataTable, TableToolbar, useDataTable } from "@/components/ui/table";
import { todayIso } from "../../duty-calculator/lib/format";
import { IsoDate } from "../../../tariffs/engine-v2/types";
import { formatRate } from "../formatRate";
import { ProductHistory, segmentOn } from "../insights/catalogHistory";
import { TrackedProduct } from "../report";
import { countryFacet } from "../tableColumns";

// Every tracked product's rate on a past date beside its rate today, biggest moves first: any
// two points in time side by side, on the shared table (search, a filter by origin, sorting by
// any figure)

interface Row {
  p: TrackedProduct;
  then: number;
  now: number;
  delta: number;
  changes: number;
}

const COLUMNS: TableColumnDef<Row, any>[] = [
  {
    id: "product",
    accessorFn: (r) => r.p.entry.element.htsno,
    header: "Product",
    meta: { rowHeader: true },
    cell: ({ row: { original: { p } } }) => (
      <span className="text-left">
        <span className={`${mono.className} font-semibold text-base-content`}>{p.entry.element.htsno}</span>{" "}
        <span className="text-base-content/70">
          {p.entry.country.flag} {p.entry.country.name}
        </span>
      </span>
    ),
  },
  {
    id: "country",
    accessorFn: (r) => r.p.entry.country.code,
    header: "Origin",
    filterFn: "facet",
    meta: { facet: countryFacet() },
  },
  {
    id: "then",
    accessorFn: (r) => r.then,
    header: "Then",
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ getValue }) => <span className="text-base-content/70">{formatRate(getValue())}</span>,
  },
  {
    id: "now",
    accessorFn: (r) => r.now,
    header: "Today",
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ getValue }) => <span className="font-semibold text-base-content">{formatRate(getValue())}</span>,
  },
  {
    id: "delta",
    accessorFn: (r) => r.delta,
    header: "Change",
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ getValue }) => {
      const delta = getValue() as number;
      const none = Math.abs(delta) < 0.005;
      return (
        <span className={`font-semibold ${none ? "text-base-content/60" : delta > 0 ? "text-error" : "text-success"}`}>
          {none ? "No change" : `${delta > 0 ? "+" : "−"}${formatRate(Math.abs(delta))}`}
        </span>
      );
    },
  },
  {
    id: "changes",
    accessorFn: (r) => r.changes,
    header: "Times changed",
    sortDescFirst: true,
    meta: { align: "right" },
  },
];

export const RatesSince = ({
  products,
  histories,
  from,
  onOpen,
}: {
  products: TrackedProduct[];
  histories: Map<string, ProductHistory>;
  from: IsoDate;
  onOpen: (key: string) => void;
}) => {
  const today = todayIso();
  const [since, setSince] = useState(from);
  const rows = useMemo(
    () =>
      products
        .flatMap((p): Row[] => {
          const h = histories.get(p.key);
          if (!h?.length) return [];
          const then = segmentOn(h, since).pct;
          const now = segmentOn(h, today).pct;
          const changes = h.filter((s) => s.from > since && s.changes.length > 0).length;
          return [{ p, then, now, delta: now - then, changes }];
        })
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
    [products, histories, since, today]
  );
  const table = useDataTable<Row>({
    data: rows,
    columns: COLUMNS,
    getRowId: (r) => r.p.key,
    searchText: (r) => `${r.p.entry.element.htsno} ${r.p.description} ${r.p.entry.country.name}`,
    hidden: ["country"],
  });

  return (
    <section aria-labelledby="tt-rates-since" className="flex flex-col *:flex-1">
      <DataTable
        table={table}
        label="Then and Now"
        onRowClick={(r) => onOpen(r.p.key)}
        toolbar={
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 id="tt-rates-since" className={ui.cardTitle}>
                  Then and Now
                </h3>
                <p className={`${ui.caption} mt-0.5`}>Each product&apos;s rate on a past date, and today</p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="tt-since" className={`${ui.label} whitespace-nowrap`}>
                  Compare from
                </label>
                <div className="w-40">
                  <input
                    id="tt-since"
                    type="date"
                    className={`${ui.inputSm} tabular-nums`}
                    value={since}
                    min={from}
                    max={today}
                    onChange={(e) => e.target.value && setSince(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <TableToolbar table={table} placeholder="Search code, product or country" facets={["country"]} noun={["product", "products"]} />
          </>
        }
        empty={<p className="text-sm text-base-content/70">No products match.</p>}
      />
    </section>
  );
};
