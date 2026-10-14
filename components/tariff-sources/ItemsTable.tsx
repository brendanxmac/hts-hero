"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import toast from "react-hot-toast"
import { DataTable, TableToolbar, useDataTable } from "@/components/ui/table"
import { SOURCE_IDS, SOURCES, type SourceId } from "@/libs/tariff-sources/types"
import { CATEGORIES, type Category } from "@/libs/tariff-updates/types"
import { formatTime } from "../hts-revision-diff/shared"
import { Pill, Segmented } from "../hts-revision-diff/ui"
import { adminCall, type SourceItemRow } from "./types"

// Every collected source item, newest first, with how it was sorted. The category can be changed
// here; the item is then read and grouped again on the next run.

type Scope = "terms" | "all"

export const sourceLabel = (source: string) => SOURCES[source as SourceId]?.label ?? source

const CategorySelect = ({ item }: { item: SourceItemRow }) => {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  return (
    <select
      className="select select-ghost select-xs h-6 min-h-6 max-w-[11rem] px-1 text-xs font-medium"
      value={item.category ?? ""}
      disabled={saving}
      title={item.category_reason ?? "Not sorted yet"}
      onChange={async (e) => {
        setSaving(true)
        try {
          await adminCall(`/api/tariff-updates/items/${item.id}`, "POST", { category: e.target.value })
          toast.success("Re-sorted. It's read and grouped on the next run.")
          router.refresh()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Couldn't change the category")
        } finally {
          setSaving(false)
        }
      }}
    >
      {!item.category && <option value="">Not sorted yet</option>}
      {Object.entries(CATEGORIES).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )
}

const columns: ColumnDef<SourceItemRow, any>[] = [
  {
    id: "published",
    accessorFn: (r) => r.published_at,
    header: "Published",
    sortDescFirst: true,
    meta: { width: "w-40" },
    cell: ({ row: { original: r } }) => (
      <span className="flex flex-col text-xs">
        <span className="font-medium text-base-content">{formatTime(r.published_at)}</span>
        <span className="text-base-content/45" title="When we first collected it">
          seen {formatTime(r.collected_at)}
        </span>
      </span>
    ),
  },
  {
    id: "source",
    accessorFn: (r) => r.source,
    header: "Source",
    filterFn: "facet",
    meta: {
      width: "w-44",
      facet: {
        label: "Source",
        describe: (value) => ({ label: sourceLabel(value) }),
        compare: (a, b) => SOURCE_IDS.indexOf(a.value as SourceId) - SOURCE_IDS.indexOf(b.value as SourceId),
      },
    },
    cell: ({ row: { original: r } }) => (
      <span className="flex flex-col text-xs">
        <span className="font-medium text-base-content">{sourceLabel(r.source)}</span>
        {r.doc_type && <span className="text-base-content/55">{r.doc_type}</span>}
      </span>
    ),
  },
  {
    id: "title",
    accessorFn: (r) => r.title,
    header: "Item",
    enableSorting: false,
    meta: { rowHeader: true },
    cell: ({ row: { original: r } }) => (
      <span className="flex max-w-3xl flex-col gap-1 text-left">
        <a href={r.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-base-content hover:underline">
          {r.title} <span className="text-base-content/35">↗</span>
        </a>
        {r.summary && <span className="line-clamp-2 text-xs text-base-content/60">{r.summary}</span>}
        {(r.agencies.length > 0 || r.matched_terms.length > 0) && (
          <span className="flex flex-wrap items-center gap-1">
            {r.matched_terms.map((t) => (
              <Pill key={t} tone="info">
                {t}
              </Pill>
            ))}
            {r.agencies.length > 0 && <span className="text-[11px] text-base-content/45">{r.agencies.join(", ")}</span>}
          </span>
        )}
        {r.process_error && <span className="text-xs text-error">{r.process_error}</span>}
      </span>
    ),
  },
  {
    id: "category",
    accessorFn: (r) => r.category ?? "unsorted",
    header: "Category",
    filterFn: "facet",
    meta: {
      width: "w-48",
      facet: {
        label: "Category",
        describe: (value) => ({ label: CATEGORIES[value as Category] ?? "Not sorted yet" }),
        compare: (a, b) => Object.keys(CATEGORIES).indexOf(a.value) - Object.keys(CATEGORIES).indexOf(b.value),
      },
    },
    cell: ({ row: { original: r } }) => (
      <span className="flex flex-col items-start gap-0.5">
        <CategorySelect item={r} />
        {r.update_id && <span className="px-1 text-[11px] text-base-content/45">In an update</span>}
      </span>
    ),
  },
  {
    id: "type",
    accessorFn: (r) => r.doc_type ?? "",
    header: "Type",
    filterFn: "facet",
    meta: { facet: { label: "Type" } },
  },
  {
    id: "terms",
    accessorFn: (r) => r.matched_terms,
    getUniqueValues: (r) => r.matched_terms,
    header: "Tariff words",
    filterFn: "facet",
    meta: { facet: { label: "Tariff words" } },
  },
]

export default function ItemsTable({ items }: { items: SourceItemRow[] }) {
  const [scope, setScope] = useState<Scope>("terms")
  const rows = useMemo(() => (scope === "terms" ? items.filter((i) => i.matched_terms.length > 0) : items), [items, scope])
  const table = useDataTable<SourceItemRow>({
    data: rows,
    columns,
    getRowId: (r) => r.id,
    searchText: (r) => `${r.title} ${r.summary ?? ""} ${r.external_id} ${r.agencies.join(" ")}`,
    initialSorting: [{ id: "published", desc: true }],
    hidden: ["type", "terms"],
  })
  return (
    // The table only draws the rows in view past 300, measured against its scrolling parent;
    // the admin page scrolls the window, so the list gets its own scroller
    <div className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-lg">
      <DataTable
        table={table}
        label="Collected tariff source items"
        toolbar={
          <TableToolbar
            table={table}
            placeholder="Search titles, summaries, document numbers"
            facets={["source", "category", "type", "terms"]}
            noun={["item", "items"]}
            actions={
              <Segmented
                options={[
                  { value: "terms", label: "With tariff words" },
                  { value: "all", label: "Everything" },
                ]}
                value={scope}
                onChange={setScope}
                size="xs"
              />
            }
          />
        }
        empty={<p className="text-sm text-base-content/60">No items match.</p>}
      />
    </div>
  )
}
