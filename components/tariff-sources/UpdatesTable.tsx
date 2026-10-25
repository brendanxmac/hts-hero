"use client"

import { useMemo } from "react"
import type { TableColumnDef } from "@/components/ui/table/features";
import { DataTable, TableToolbar, useDataTable } from "@/components/ui/table"
import { AUTHORITIES, KINDS, STAGE_ORDER, STAGES, type Authority, type Stage } from "@/libs/tariff-updates/types"
import { Pill } from "../hts-revision-diff/ui"
import { type SourceItemRow, type UpdateRow } from "./types"

// The tariff updates built from the source items, latest activity first; a row opens the update.

const day = (iso: string | null) => (iso ? new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString(undefined, { dateStyle: "medium" }) : "")

const statusOf = (u: UpdateRow) => (u.needs_review ? "review" : u.status)
const STATUS_LABELS: Record<string, string> = { review: "Needs review", published: "Published", hidden: "Hidden" }

const columnsFor = (sourceCounts: Map<string, number>): TableColumnDef<UpdateRow, any>[] => [
  {
    id: "activity",
    accessorFn: (u) => u.last_activity_at,
    header: "Latest",
    sortDescFirst: true,
    meta: { width: "w-32" },
    cell: ({ row: { original: u } }) => (
      <span className="flex flex-col text-xs">
        <span className="font-medium text-base-content">{day(u.last_activity_at)}</span>
        {u.first_seen_at.slice(0, 10) !== u.last_activity_at.slice(0, 10) && <span className="text-base-content/45">from {day(u.first_seen_at)}</span>}
      </span>
    ),
  },
  {
    id: "title",
    accessorFn: (u) => u.title,
    header: "Update",
    enableSorting: false,
    meta: { rowHeader: true },
    cell: ({ row: { original: u } }) => (
      <span className="flex max-w-3xl flex-col gap-1 text-left">
        <span className="text-sm font-medium text-base-content">{u.title}</span>
        <span className="line-clamp-2 text-xs text-base-content/60">{u.summary}</span>
        <span className="flex flex-wrap items-center gap-1">
          <Pill tone="info">{AUTHORITIES[u.authority] ?? u.authority}</Pill>
          <Pill>{KINDS[u.kind] ?? u.kind}</Pill>
          {u.countries.length > 0 && (
            <span className="text-[11px] text-base-content/55">
              {u.countries.slice(0, 8).join(", ")}
              {u.countries.length > 8 ? ` +${u.countries.length - 8}` : ""}
            </span>
          )}
          {u.effective_on && <span className="text-[11px] text-base-content/55">· effective {day(u.effective_on)}</span>}
        </span>
      </span>
    ),
  },
  {
    id: "stage",
    accessorFn: (u) => u.stage,
    header: "Stage",
    filterFn: "facet",
    sortFn: (a, b) => STAGE_ORDER.indexOf(a.original.stage) - STAGE_ORDER.indexOf(b.original.stage),
    meta: {
      width: "w-44",
      facet: {
        label: "Stage",
        describe: (v) => ({ label: STAGES[v as Stage] ?? v }),
        compare: (a, b) => STAGE_ORDER.indexOf(a.value as Stage) - STAGE_ORDER.indexOf(b.value as Stage),
      },
    },
    cell: ({ row: { original: u } }) => (
      <span className="flex flex-col text-xs">
        <span className="font-medium text-base-content">{STAGES[u.stage]}</span>
        <span className="text-base-content/45">
          {sourceCounts.get(u.id) ?? 0} source{sourceCounts.get(u.id) === 1 ? "" : "s"}
        </span>
      </span>
    ),
  },
  {
    id: "status",
    accessorFn: statusOf,
    header: "Status",
    filterFn: "facet",
    meta: { width: "w-32", facet: { label: "Status", describe: (v) => ({ label: STATUS_LABELS[v] ?? v }) } },
    cell: ({ row: { original: u } }) => (
      <span className="flex flex-col items-start gap-1">
        <Pill tone={u.status === "published" ? "success" : "neutral"}>{u.status === "published" ? "Published" : "Hidden"}</Pill>
        {u.needs_review && <Pill tone="warning">Needs review</Pill>}
      </span>
    ),
  },
  {
    id: "authority",
    accessorFn: (u) => u.authority,
    header: "Authority",
    filterFn: "facet",
    meta: { facet: { label: "Authority", describe: (v) => ({ label: AUTHORITIES[v as Authority] ?? v }) } },
  },
]

// Every update, as a table to search and filter; a row opens it for review (UpdateDetail)
export default function UpdatesTable({ updates, items, onOpen }: { updates: UpdateRow[]; items: SourceItemRow[]; onOpen: (id: string) => void }) {
  const sourceCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const i of items) if (i.update_id) counts.set(i.update_id, (counts.get(i.update_id) ?? 0) + 1)
    return counts
  }, [items])
  const columns = useMemo(() => columnsFor(sourceCounts), [sourceCounts])
  const table = useDataTable<UpdateRow>({
    data: updates,
    columns,
    getRowId: (u) => u.id,
    searchText: (u) => `${u.title} ${u.summary} ${u.products ?? ""} ${u.countries.join(" ")} ${u.hts_codes.join(" ")}`,
    initialSorting: [{ id: "activity", desc: true }],
    hidden: ["authority"],
  })
  return (
    // The table only draws the rows in view past 300, measured against its scrolling parent
    <div className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg">
      <DataTable
        table={table}
        label="Tariff updates"
        onRowClick={(u) => onOpen(u.id)}
        toolbar={
          <TableToolbar table={table} placeholder="Search titles, summaries, countries, HTS codes" facets={["authority", "stage", "status"]} noun={["update", "updates"]} />
        }
        empty={<p className="text-sm text-base-content/60">{updates.length ? "No updates match." : "No updates yet. Process the source items to build them."}</p>}
      />
    </div>
  )
}
