"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PRIORITIES,
  STATUS_LABELS,
  STATUSES,
  subchapterLabel,
  type Category,
  type CoverageStatus,
  type DisplayStatus,
  type Priority,
} from "@/libs/hts-coverage/constants"
import type { CoverageItem, CoveragePatch } from "@/libs/hts-coverage/types"
import { formatTime } from "../hts-revision-diff/shared"
import {
  Callout,
  EmptyState,
  Help,
  PageHeader,
  PageSpinner,
  Panel,
  Pill,
  ProgressBar,
  Segmented,
  Spinner,
  Stat,
  StatGrid,
  btn,
  inputCls,
  selectCls,
} from "../hts-revision-diff/ui"
import { coverageApi } from "./api"
import {
  categoryLabel,
  displayStatus,
  formatDay,
  localToday,
  resolvedCategory,
  resolvedProgram,
  STATUS_TONES,
  upcomingStart,
  type DashboardData,
} from "./derive"
import HeadingDetail from "./HeadingDetail"
import ProgressChart from "./ProgressChart"

// ---------- Filters ----------

type View = "remaining" | "all" | DisplayStatus | "excluded"

const VIEWS: { value: View; label: string; title: string }[] = [
  { value: "remaining", label: "Remaining", title: "Missing and needs review" },
  { value: "missing", label: "Missing", title: "In effect, not modeled" },
  { value: "needs_review", label: "Review", title: "Needs review" },
  { value: "modeled", label: "Modeled", title: "In effect and modeled" },
  { value: "excluded", label: "Excluded", title: "Expired, FTZ-suspended, out of scope" },
  { value: "all", label: "All", title: "Every heading" },
]

interface Filters {
  view: View
  q: string
  subchapter: string
  category: string
  program: string
  priority: string
  referenced: boolean
  upcoming: boolean
}

const DEFAULT_FILTERS: Filters = {
  view: "remaining",
  q: "",
  subchapter: "",
  category: "",
  program: "",
  priority: "",
  referenced: false,
  upcoming: false,
}

type SortKey = "htsno" | "status" | "category" | "program" | "priority" | "rate"
const PAGE = 100
const STORAGE_KEY = "coverage-checker:filters"
const UNMAPPED = "__none__"

const inView = (status: DisplayStatus, view: View) =>
  view === "all"
    ? true
    : view === "remaining"
      ? status === "missing" || status === "needs_review"
      : view === "excluded"
        ? ["expired", "ftz_suspended", "out_of_scope"].includes(status)
        : status === view

// ---------- Small pieces ----------

const SortHeader = ({
  label,
  k,
  sort,
  setSort,
  className = "",
}: {
  label: string
  k: SortKey
  sort: { key: SortKey; dir: 1 | -1 }
  setSort: (s: { key: SortKey; dir: 1 | -1 }) => void
  className?: string
}) => (
  <th className={`px-3 py-2 font-medium ${className}`}>
    <button
      className="inline-flex items-center gap-1 hover:text-base-content"
      onClick={() => setSort({ key: k, dir: sort.key === k ? (-sort.dir as 1 | -1) : 1 })}
    >
      {label}
      <span className="text-base-content/30">{sort.key === k ? (sort.dir === 1 ? "↑" : "↓") : ""}</span>
    </button>
  </th>
)

const BulkBar = ({
  count,
  programs,
  onApply,
  onClear,
  busy,
}: {
  count: number
  programs: { id: string; name: string }[]
  onApply: (patch: CoveragePatch) => void
  onClear: () => void
  busy: boolean
}) => (
  <div className="sticky top-12 z-30 flex flex-wrap items-center gap-2 border-b border-base-content/10 bg-base-200/95 px-4 py-2 backdrop-blur">
    <span className="text-sm font-medium tabular-nums">{count} selected</span>
    <select className={`${selectCls} select-xs`} value="" onChange={(e) => e.target.value && onApply({ status: e.target.value as CoverageStatus })}>
      <option value="">Set status…</option>
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s === "open" ? "In effect" : STATUS_LABELS[s]}
        </option>
      ))}
    </select>
    <select
      className={`${selectCls} select-xs`}
      value=""
      onChange={(e) => e.target.value && onApply({ category: e.target.value === "-" ? null : (e.target.value as Category) })}
    >
      <option value="">Set category…</option>
      <option value="-">Use suggestion</option>
      {CATEGORIES.map((c) => (
        <option key={c} value={c}>
          {CATEGORY_LABELS[c]}
        </option>
      ))}
    </select>
    <select
      className={`${selectCls} select-xs`}
      value=""
      onChange={(e) => e.target.value && onApply({ priority: e.target.value === "-" ? null : (e.target.value as Priority) })}
    >
      <option value="">Set priority…</option>
      <option value="-">None</option>
      {PRIORITIES.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
    <select
      className={`${selectCls} select-xs`}
      value=""
      onChange={(e) => e.target.value && onApply({ program: e.target.value === "-" ? null : e.target.value })}
    >
      <option value="">Set program…</option>
      <option value="-">Automatic</option>
      {programs.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
    {busy && <Spinner />}
    <button className={`${btn.xsGhost} ml-auto`} onClick={onClear}>
      Clear selection
    </button>
  </div>
)

// ---------- Page ----------

export default function CoverageDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshResult, setRefreshResult] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "htsno", dir: 1 })
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const today = useMemo(localToday, [])

  const load = useCallback(async () => {
    try {
      setData(await coverageApi<DashboardData>(""))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    load()
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setFilters({ ...DEFAULT_FILTERS, ...JSON.parse(saved) })
    } catch {
      // Storage can be unavailable; the defaults are fine
    }
  }, [load])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
    } catch {
      // ignore
    }
    setPage(0)
  }, [filters])

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((f) => ({ ...f, [key]: value }))

  const refresh = async () => {
    setRefreshing(true)
    setRefreshResult(null)
    try {
      const r = await coverageApi<{ revision: string | null; inserted: number; updated: number; removed: number }>("/refresh", { method: "POST" })
      setRefreshResult(
        `Refreshed from ${r.revision ?? "the current revision"}: ${r.inserted} new, ${r.updated} updated${r.removed ? `, ${r.removed} no longer in the HTS` : ""}.`
      )
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setRefreshing(false)
    }
  }

  const programName = useCallback((id: string | null) => (id ? data?.programs.find((p) => p.id === id)?.name ?? id : "Unmapped"), [data])

  // Every item with what the table shows, computed once per data change
  const rows = useMemo(() => {
    if (!data) return []
    return data.items
      .filter((i) => i.in_hts)
      .map((item) => ({
        item,
        status: displayStatus(item),
        category: resolvedCategory(item),
        program: resolvedProgram(item, data.notePrograms),
        starts: upcomingStart(item, today),
      }))
  }, [data, today])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const list = rows.filter(
      (r) =>
        inView(r.status, filters.view) &&
        (!filters.subchapter || r.item.subchapter === filters.subchapter) &&
        (!filters.category || r.category === filters.category) &&
        (!filters.program || (filters.program === UNMAPPED ? !r.program : r.program === filters.program)) &&
        (!filters.priority || (filters.priority === UNMAPPED ? !r.item.priority : r.item.priority === filters.priority)) &&
        (!filters.referenced || r.item.engine_referenced) &&
        (!filters.upcoming || !!r.starts) &&
        (!q ||
          [r.item.htsno, r.item.description, r.item.general, r.item.notes ?? "", r.item.status_note ?? "", ...r.item.note_citations.map((c) => c.label)]
            .join(" ")
            .toLowerCase()
            .includes(q))
    )
    const value = (r: (typeof list)[number]): string => {
      switch (sort.key) {
        case "status":
          return STATUS_LABELS[r.status]
        case "category":
          return r.category ? CATEGORY_LABELS[r.category] : "~"
        case "program":
          return r.program ? programName(r.program) : "~"
        case "priority":
          return r.item.priority ?? "~"
        case "rate":
          return r.item.general || "~"
        default:
          return r.item.htsno
      }
    }
    return list.sort((a, b) => value(a).localeCompare(value(b)) * sort.dir || a.item.htsno.localeCompare(b.item.htsno))
  }, [rows, filters, sort, programName])

  const counts = useMemo(() => {
    const c = { total: rows.length, inEffect: 0, modeled: 0, missing: 0, review: 0, excluded: 0, referencedMissing: 0, upcoming: 0 }
    for (const r of rows) {
      if (["expired", "ftz_suspended", "out_of_scope"].includes(r.status)) {
        c.excluded++
        continue
      }
      c.inEffect++
      if (r.status === "modeled") c.modeled++
      else {
        c.missing++
        if (r.status === "needs_review") c.review++
        if (r.item.engine_referenced) c.referencedMissing++
        if (r.starts) c.upcoming++
      }
    }
    return c
  }, [rows])

  // In-effect headings grouped by subchapter and by program
  const breakdown = useMemo(() => {
    const bySub = new Map<string, { inEffect: number; modeled: number }>()
    const byProgram = new Map<string, { inEffect: number; modeled: number }>()
    for (const r of rows) {
      if (["expired", "ftz_suspended", "out_of_scope"].includes(r.status)) continue
      for (const [map, key] of [
        [bySub, r.item.subchapter],
        [byProgram, r.program ?? UNMAPPED],
      ] as const) {
        const e = map.get(key) ?? { inEffect: 0, modeled: 0 }
        e.inEffect++
        if (r.status === "modeled") e.modeled++
        map.set(key, e)
      }
    }
    const sorted = (m: Map<string, { inEffect: number; modeled: number }>) =>
      Array.from(m).sort((a, b) => b[1].inEffect - b[1].modeled - (a[1].inEffect - a[1].modeled) || a[0].localeCompare(b[0]))
    return { bySub: Array.from(bySub).sort((a, b) => a[0].localeCompare(b[0])), byProgram: sorted(byProgram) }
  }, [rows])

  const subchapters = useMemo(() => Array.from(new Set(rows.map((r) => r.item.subchapter))).sort(), [rows])
  const shown = filtered.slice(page * PAGE, (page + 1) * PAGE)
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))

  const applyItems = (updated: CoverageItem[]) =>
    setData((d) => {
      if (!d) return d
      const byCode = new Map(updated.map((i) => [i.htsno, i]))
      return { ...d, items: d.items.map((i) => byCode.get(i.htsno) ?? i) }
    })

  const bulkApply = async (patch: CoveragePatch) => {
    setBulkBusy(true)
    try {
      const { items } = await coverageApi<{ items: CoverageItem[] }>("/items", {
        method: "PATCH",
        body: JSON.stringify({ htsnos: Array.from(selected), patch }),
      })
      applyItems(items)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBulkBusy(false)
    }
  }

  const setNoteProgram = async (noteKey: string, program: string | null) => {
    try {
      await coverageApi("/note-programs", { method: "PUT", body: JSON.stringify({ note_key: noteKey, program }) })
      setData((d) => {
        if (!d) return d
        const overrides = { ...d.notePrograms.overrides }
        if (program) overrides[noteKey] = program
        else delete overrides[noteKey]
        return { ...d, notePrograms: { ...d.notePrograms, overrides } }
      })
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const openIndex = open ? filtered.findIndex((r) => r.item.htsno === open) : -1
  const move = useCallback(
    (delta: number) => {
      if (openIndex < 0) return
      const next = filtered[openIndex + delta]
      if (next) {
        setOpen(next.item.htsno)
        setPage(Math.floor((openIndex + delta) / PAGE))
      }
    },
    [filtered, openIndex]
  )

  const allShownSelected = shown.length > 0 && shown.every((r) => selected.has(r.item.htsno))
  const toggle = (htsno: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(htsno)) next.delete(htsno)
      else next.add(htsno)
      return next
    })

  if (!data && !error) return <PageSpinner />

  const lastSnapshot = data?.snapshots[data.snapshots.length - 1]
  const missingTable = error && /hts_coverage_\w+/.test(error) && /does not exist|schema cache/i.test(error)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Coverage checker"
        meta={
          lastSnapshot ? (
            <>
              Last refreshed {formatTime(lastSnapshot.created_at)}
              {lastSnapshot.revision && <> from {lastSnapshot.revision}</>}
            </>
          ) : (
            "Chapter 99 headings vs. what the duty calculator models"
          )
        }
        actions={
          <button className={btn.primary} onClick={refresh} disabled={refreshing || !!missingTable}>
            {refreshing && <Spinner />}
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        }
      >
        <Help>
          <p>
            Refresh reads every Chapter 99 heading from the current USITC export and checks it against the engine data in this
            build (<code>tariffs/engine-v2</code>). A heading is <b>modeled</b> when a tariff record has its code, for any date.
          </p>
          <p>
            Statuses, categories, programs, priorities and notes are yours: a refresh never changes them. New headings start with the
            status from <code>libs/hts-coverage/initial-status.ts</code>. Coverage is modeled ÷ in effect, where in effect excludes
            expired, FTZ-suspended and out-of-scope headings.
          </p>
          <p>
            Programs come from the heading, then its engine records, then the U.S. notes it cites (each note&apos;s program is
            suggested from the modeled headings citing it, and can be set in a heading&apos;s detail).
          </p>
        </Help>
      </PageHeader>

      {missingTable && (
        <Callout tone="warning" title="The coverage tables don't exist yet">
          Paste <code>supabase/migrations/hts_coverage_001.sql</code> into the dev project&apos;s SQL editor, then reload.
        </Callout>
      )}
      {error && !missingTable && <Callout tone="error">{error}</Callout>}
      {refreshResult && <Callout tone="success">{refreshResult}</Callout>}

      {data && !data.items.length && !missingTable && (
        <Panel>
          <EmptyState title="No headings yet">Refresh to load every Chapter 99 heading from USITC.</EmptyState>
        </Panel>
      )}

      {data && data.items.length > 0 && (
        <>
          <StatGrid>
            <Stat label="In the HTS" value={counts.total} hint={`${counts.excluded} expired / suspended / out of scope`} />
            <Stat label="In effect" value={counts.inEffect} />
            <Stat
              label="Modeled"
              value={
                <>
                  {counts.modeled}
                  <span className="ml-1.5 text-sm font-normal text-base-content/50">
                    {counts.inEffect ? ((100 * counts.modeled) / counts.inEffect).toFixed(1) : 0}%
                  </span>
                </>
              }
            >
              <ProgressBar value={counts.modeled} max={counts.inEffect} />
            </Stat>
            <Stat label="Missing" value={counts.missing} hint={`${counts.referencedMissing} already referenced in the engine`} />
            <Stat label="Needs review" value={counts.review} hint={counts.upcoming ? `${counts.upcoming} start after today` : undefined} />
          </StatGrid>

          {data.stale.length > 0 && (
            <Callout tone="warning" title={`${data.stale.length} engine heading${data.stale.length === 1 ? "" : "s"} not in the current HTS`}>
              <span className="font-mono text-xs">{data.stale.join(", ")}</span>
            </Callout>
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            <Panel title="Coverage over time" className="lg:col-span-1">
              <ProgressChart snapshots={data.snapshots} />
            </Panel>
            <Panel title="By subchapter" bodyClassName="max-h-72 overflow-y-auto">
              <ul className="divide-y divide-base-content/5">
                {breakdown.bySub.map(([sub, c]) => (
                  <li key={sub}>
                    <button
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-base-content/[0.03] ${
                        filters.subchapter === sub ? "bg-base-content/[0.05]" : ""
                      }`}
                      onClick={() => setFilter("subchapter", filters.subchapter === sub ? "" : sub)}
                      title={subchapterLabel(sub)}
                    >
                      <span className="w-10 font-mono text-xs">{sub}</span>
                      <ProgressBar value={c.modeled} max={c.inEffect} className="flex-1" />
                      <span className="w-24 text-right text-xs tabular-nums text-base-content/60">
                        {c.modeled}/{c.inEffect} · {c.inEffect - c.modeled} left
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="By program" bodyClassName="max-h-72 overflow-y-auto">
              <ul className="divide-y divide-base-content/5">
                {breakdown.byProgram.map(([program, c]) => (
                  <li key={program}>
                    <button
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-base-content/[0.03] ${
                        filters.program === program ? "bg-base-content/[0.05]" : ""
                      }`}
                      onClick={() => setFilter("program", filters.program === program ? "" : program)}
                    >
                      <span className="min-w-0 flex-1 truncate">{programName(program === UNMAPPED ? null : program)}</span>
                      <span className="text-xs tabular-nums text-base-content/60">
                        {c.modeled}/{c.inEffect} · {c.inEffect - c.modeled} left
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <Panel
            title="Headings"
            count={filtered.length}
            actions={
              <>
                <Segmented options={VIEWS} value={filters.view} onChange={(v) => setFilter("view", v)} size="xs" />
                <button className={btn.xsGhost} onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Reset
                </button>
              </>
            }
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-base-content/10 px-4 py-2.5">
              <input
                className={`${inputCls} input-xs h-7 w-64`}
                placeholder="Search code, text, notes…"
                value={filters.q}
                onChange={(e) => setFilter("q", e.target.value)}
              />
              <select className={`${selectCls} select-xs`} value={filters.subchapter} onChange={(e) => setFilter("subchapter", e.target.value)}>
                <option value="">All subchapters</option>
                {subchapters.map((s) => (
                  <option key={s} value={s}>
                    {s} · {subchapterLabel(s)}
                  </option>
                ))}
              </select>
              <select className={`${selectCls} select-xs`} value={filters.category} onChange={(e) => setFilter("category", e.target.value)}>
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <select className={`${selectCls} select-xs`} value={filters.program} onChange={(e) => setFilter("program", e.target.value)}>
                <option value="">All programs</option>
                <option value={UNMAPPED}>Unmapped</option>
                {data.programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select className={`${selectCls} select-xs`} value={filters.priority} onChange={(e) => setFilter("priority", e.target.value)}>
                <option value="">Any priority</option>
                <option value={UNMAPPED}>No priority</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-base-content/70">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs"
                  checked={filters.referenced}
                  onChange={(e) => setFilter("referenced", e.target.checked)}
                />
                Referenced in engine
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-base-content/70">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs"
                  checked={filters.upcoming}
                  onChange={(e) => setFilter("upcoming", e.target.checked)}
                />
                Starts after today
              </label>
            </div>

            {selected.size > 0 && (
              <BulkBar count={selected.size} programs={data.programs} onApply={bulkApply} onClear={() => setSelected(new Set())} busy={bulkBusy} />
            )}

            {filtered.length === 0 ? (
              <EmptyState title="No headings match">Try another view or clear the filters.</EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-base-content/10 text-left text-xs text-base-content/55">
                    <tr>
                      <th className="w-8 px-3 py-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs"
                          checked={allShownSelected}
                          onChange={() =>
                            setSelected((s) => {
                              const next = new Set(s)
                              shown.forEach((r) => (allShownSelected ? next.delete(r.item.htsno) : next.add(r.item.htsno)))
                              return next
                            })
                          }
                          title="Select this page"
                        />
                      </th>
                      <SortHeader label="Heading" k="htsno" sort={sort} setSort={setSort} />
                      <th className="px-3 py-2 font-medium">Description</th>
                      <SortHeader label="Rate" k="rate" sort={sort} setSort={setSort} />
                      <SortHeader label="Status" k="status" sort={sort} setSort={setSort} />
                      <SortHeader label="Category" k="category" sort={sort} setSort={setSort} />
                      <SortHeader label="Program" k="program" sort={sort} setSort={setSort} />
                      <SortHeader label="Priority" k="priority" sort={sort} setSort={setSort} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-content/5">
                    {shown.map((r) => (
                      <tr
                        key={r.item.htsno}
                        className={`cursor-pointer align-top hover:bg-base-content/[0.03] ${open === r.item.htsno ? "bg-base-content/[0.05]" : ""}`}
                        onClick={() => setOpen(r.item.htsno)}
                      >
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs"
                            checked={selected.has(r.item.htsno)}
                            onChange={() => toggle(r.item.htsno)}
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{r.item.htsno}</td>
                        <td className="max-w-md px-3 py-2">
                          <p className="line-clamp-2 text-[13px] leading-snug text-base-content/85">{r.item.description}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {r.starts && <Pill tone="warning">Starts {formatDay(r.starts)}</Pill>}
                            {r.item.engine_referenced && !r.item.engine_modeled && <Pill tone="info">referenced</Pill>}
                            {r.item.note_citations.slice(0, 2).map((c) => (
                              <Pill key={c.key}>{c.label}</Pill>
                            ))}
                            {r.item.note_citations.length > 2 && <Pill>+{r.item.note_citations.length - 2}</Pill>}
                            {r.item.notes && <Pill title={r.item.notes}>note</Pill>}
                          </div>
                        </td>
                        <td className="max-w-[12rem] px-3 py-2 text-xs text-base-content/70">
                          <span className="line-clamp-2">{r.item.general || "—"}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <Pill tone={STATUS_TONES[r.status]} title={r.item.status_note ?? undefined}>
                            {STATUS_LABELS[r.status]}
                          </Pill>
                        </td>
                        <td className={`whitespace-nowrap px-3 py-2 text-xs ${r.item.category ? "" : "italic text-base-content/50"}`}>
                          {categoryLabel(r.category)}
                        </td>
                        <td className="max-w-[11rem] truncate px-3 py-2 text-xs text-base-content/70">{r.program ? programName(r.program) : "—"}</td>
                        <td className="px-3 py-2 text-xs font-medium">{r.item.priority ?? <span className="text-base-content/30">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pages > 1 && (
              <div className="flex items-center justify-end gap-2 border-t border-base-content/10 px-4 py-2 text-xs text-base-content/60">
                <span className="tabular-nums">
                  {page * PAGE + 1}–{Math.min(filtered.length, (page + 1) * PAGE)} of {filtered.length}
                </span>
                <button className={btn.xsSecondary} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <button className={btn.xsSecondary} disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            )}
          </Panel>
        </>
      )}

      {open && data && (
        <>
          <div className="fixed inset-0 z-40 bg-base-content/20" onClick={() => setOpen(null)} />
          <HeadingDetail
            htsno={open}
            data={data}
            position={{ index: Math.max(0, openIndex), total: filtered.length }}
            onClose={() => setOpen(null)}
            onMove={move}
            onPatched={applyItems}
            onNoteProgram={setNoteProgram}
          />
        </>
      )}
    </div>
  )
}
