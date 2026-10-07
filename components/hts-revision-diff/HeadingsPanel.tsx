"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import type { DocumentRow, HeadingRow } from "@/libs/hts-revision-diff/types"
import { api, formatBytes, formatTime, StatusBadge } from "./shared"
import { btn, Callout, Dot, EmptyState, Help, PageSpinner, Panel, Pill, Spinner, StatusDot, type Tone } from "./ui"

interface HeadingsData {
  document: DocumentRow | null
  pdfUrl: string | null
  info: {
    parsedAt: string | null
    warnings: { kind: string; message: string }[]
    check: { at: string; issues: string[]; usage: { cost_usd: number; input_tokens: number; output_tokens: number } } | null
    checking: boolean
    progress?: { pagesChecked: number; pages: number } | null
    scopedCheck?: { at: string; rows: number; pages: number[]; issues: string[]; usage: { cost_usd: number } } | null
    error: string | null
  } | null
  rows: HeadingRow[]
  cited: string[]
  uncited: string[] // row ids the change record doesn't cite
  changeRecordRead: boolean
  // Against USITC's archived PDF: complete when every subchapter III heading is here
  coverage: { expected: number; complete: boolean; missingCount: number; missing: string[]; unexpected: string[] } | null
  // Comparisons using this attempt, and the headings their changes need from it
  comparisons: { id: string; side: "from" | "to"; fromRevision: string | null; toRevision: string | null; needed: string[] }[]
}

// The heading each row belongs to: its own number, or the one above it for a
// description-only row (as comparisons group them)
const rowHeadings = (rows: HeadingRow[]) => {
  let last = ""
  return rows.map((r) => {
    if (r.htsno) last = r.htsno.split(".").slice(0, 3).join(".")
    return last
  })
}

type Editable = Pick<HeadingRow, "htsno" | "stat_suffix" | "indent" | "description" | "general" | "special" | "other" | "units" | "page"> & {
  footnotesText: string
}

const EMPTY: Editable = {
  htsno: "",
  stat_suffix: "",
  indent: 0,
  description: "",
  general: "",
  special: "",
  other: "",
  units: "",
  page: null,
  footnotesText: "",
}

const toEditable = (r: HeadingRow): Editable => ({
  htsno: r.htsno,
  stat_suffix: r.stat_suffix,
  indent: r.indent,
  description: r.description,
  general: r.general,
  special: r.special,
  other: r.other,
  units: r.units,
  page: r.page,
  footnotesText: r.footnotes.join("\n"),
})

const fromEditable = ({ footnotesText, ...rest }: Editable) => ({
  ...rest,
  footnotes: footnotesText.split("\n").map((l) => l.trim()).filter(Boolean),
})

const CHECK_TONES: Record<string, Tone> = {
  pending: "neutral",
  ok: "success",
  corrected: "warning",
  added: "warning",
  flagged: "error",
}

export default function HeadingsPanel({ attemptId, comparisonId }: { attemptId: string; comparisonId?: string | null }) {
  const [data, setData] = useState<HeadingsData | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [savingRows, setSavingRows] = useState<Record<string, number>>({}) // row id → review saves in flight
  const reviewSeq = useRef<Record<string, number>>({})
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Editable>(EMPTY)
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState<Editable>(EMPTY)
  const [file, setFile] = useState<File | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [anchor, setAnchor] = useState<number | null>(null) // last row clicked, for shift-click ranges
  // Which rows to show: those a comparison needs (one, or all of them), or every row
  const [view, setView] = useState<string>(comparisonId ? `needed:${comparisonId}` : "needed")

  const load = useCallback(async () => {
    try {
      setData(await api<HeadingsData>(`/attempts/${attemptId}/headings`))
    } catch (error) {
      toast.error((error as Error).message)
    }
  }, [attemptId])

  useEffect(() => {
    load()
  }, [load])

  // While converting or checking, keep advancing the attempt and refreshing
  const working = data?.document?.conversion_status === "processing" || data?.info?.checking
  useEffect(() => {
    if (!working) return
    const timer = setTimeout(async () => {
      await api(`/attempts/${attemptId}`).catch((): null => null)
      await load()
    }, 5000)
    return () => clearTimeout(timer)
  }, [working, data, attemptId, load])

  const run = async (label: string, fn: () => Promise<unknown>, success?: string) => {
    setBusy(label)
    try {
      await fn()
      if (success) toast.success(success)
      await load()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const upload = () =>
    run(
      "upload",
      async () => {
        const form = new FormData()
        form.append("file", file!)
        await api(`/attempts/${attemptId}/headings/upload`, { method: "POST", body: form })
        setFile(null)
      },
      "Sent to datalab. Rows are read and checked by Claude when it finishes."
    )

  // Click selects one row; shift-click selects every row from the last one clicked
  const toggleSelected = (index: number, shiftKey: boolean) => {
    const ids = data!.rows.map((r) => r.id)
    const next = new Set(selected)
    const on = !selected.has(ids[index])
    const [from, to] = shiftKey && anchor !== null ? [Math.min(anchor, index), Math.max(anchor, index)] : [index, index]
    for (let i = from; i <= to; i++) on ? next.add(ids[i]) : next.delete(ids[i])
    setSelected(next)
    setAnchor(index)
  }

  const deleteRows = (ids: string[], label: string) =>
    run(
      label,
      async () => {
        const { deleted } = await api<{ deleted: number }>(`/attempts/${attemptId}/headings`, {
          method: "DELETE",
          body: JSON.stringify({ ids }),
        })
        setSelected(new Set())
        setAnchor(null)
        toast.success(`Deleted ${deleted} row${deleted === 1 ? "" : "s"}`)
      }
    )

  const removeUncited = () =>
    run("uncited", async () => {
      const { deleted } = await api<{ deleted: number }>(`/attempts/${attemptId}/headings/remove-uncited`, { method: "POST" })
      setSelected(new Set())
      setAnchor(null)
      toast.success(`Removed ${deleted} uncited row${deleted === 1 ? "" : "s"}`)
    })

  const patch = (row: HeadingRow, values: Record<string, unknown>) =>
    run(`row-${row.id}`, () => api(`/heading-rows/${row.id}`, { method: "PATCH", body: JSON.stringify(values) }))

  // Ticking "reviewed" doesn't block anything else: the row updates at once and saves
  // in the background. Only the latest save for a row applies its response; a failed
  // save puts the row back.
  const setRow = (row: HeadingRow) =>
    setData((d) => (d ? { ...d, rows: d.rows.map((r) => (r.id === row.id ? row : r)) } : d))
  const toggleReviewed = async (row: HeadingRow, reviewed: boolean) => {
    const seq = (reviewSeq.current[row.id] ?? 0) + 1
    reviewSeq.current[row.id] = seq
    const bump = (by: number) => setSavingRows((s) => ({ ...s, [row.id]: Math.max(0, (s[row.id] ?? 0) + by) }))
    setRow({ ...row, reviewed })
    bump(1)
    try {
      const { row: saved } = await api<{ row: HeadingRow }>(`/heading-rows/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ reviewed }),
      })
      if (reviewSeq.current[row.id] === seq) setRow(saved)
    } catch (error) {
      if (reviewSeq.current[row.id] === seq) setRow(row)
      toast.error(`${row.htsno || "Row"}: ${(error as Error).message}`)
    } finally {
      bump(-1)
    }
  }

  if (!data) return <PageSpinner />

  const { document, info, cited } = data
  const allRows = data.rows
  const uncited = new Set(data.uncited)
  // Rows comparisons need reviewed: those of headings their changes rely on
  const headingOfRow = rowHeadings(allRows)
  const neededBy = (c: HeadingsData["comparisons"][number]) => new Set(c.needed)
  const viewComparison = view.startsWith("needed:") ? data.comparisons.find((c) => c.id === view.slice(7)) : null
  const needed = new Set(
    (viewComparison ? [viewComparison] : data.comparisons).flatMap((c) => Array.from(neededBy(c)))
  )
  const isNeeded = (index: number) => needed.has(headingOfRow[index])
  const showNeeded = view !== "all" && needed.size > 0
  const rows = showNeeded ? allRows.filter((_, i) => isNeeded(i)) : allRows
  const neededRows = allRows.filter((_, i) => isNeeded(i))
  const neededReviewed = neededRows.filter((r) => r.reviewed).length
  const selectedRows = rows.filter((r) => selected.has(r.id))
  const allSelected = rows.length > 0 && selectedRows.length === rows.length
  const reviewed = allRows.filter((r) => r.reviewed).length
  const okUnreviewed = rows.filter((r) => r.claude_status === "ok" && !r.reviewed)
  const markReviewed = (ids: string[], label: string) =>
    run(
      label,
      async () => {
        await api(`/attempts/${attemptId}/headings/review`, { method: "POST", body: JSON.stringify({ ids, reviewed: true }) })
        setSelected(new Set())
      },
      `${ids.length} row${ids.length === 1 ? "" : "s"} marked reviewed`
    )
  // Claude checks only the pages these rows are on
  const checkRows = (ids: string[], label: string) =>
    run(
      label,
      async () => {
        const { rows: n, pages } = await api<{ rows: number; pages: number }>(`/attempts/${attemptId}/headings/check`, {
          method: "POST",
          body: JSON.stringify({ rowIds: ids }),
        })
        setSelected(new Set())
        toast.success(`Claude checked ${n} row${n === 1 ? "" : "s"} on ${pages} page${pages === 1 ? "" : "s"}`)
      }
    )
  const pdfIds = (list: HeadingRow[]) => list.filter((r) => r.source === "pdf").map((r) => r.id)
  const coverage = cited.map((code) => {
    const matches = rows.filter((r) => r.htsno === code)
    return { code, state: matches.some((r) => r.reviewed) ? "reviewed" : matches.length ? "unreviewed" : "missing" }
  })
  const th = "whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-base-content/50"
  const td = "px-3 py-2.5 align-top"

  return (
    <div className="flex flex-col gap-5">
      <Help>
        Chapter 99 headings, read from this revision&apos;s own tariff-table pages. Upload every subchapter III heading page:
        comparisons then diff every heading, including added and removed ones. You only review the rows a comparison&apos;s
        changes rely on, listed below; the rest are used as they were read. &ldquo;Check with Claude&rdquo; compares every row with
        the pages; &ldquo;Check … with Claude&rdquo; on a comparison, or on selected rows, reads only the pages those rows are on.
      </Help>

      {/* What comparisons need from this revision */}
      <Panel title="To review for comparisons">
        <div className="flex flex-col gap-2.5 px-4 py-3 text-sm">
          {data.coverage &&
            (data.coverage.complete ? (
              <StatusDot
                tone="success"
                label={
                  <span className="font-normal text-base-content/70">
                    All {data.coverage.expected} subchapter III headings are here (checked against USITC&apos;s archived PDF)
                  </span>
                }
              />
            ) : (
              <StatusDot
                tone="warning"
                label={
                  <span className="font-normal text-base-content/70">
                    {data.coverage.missingCount} of {data.coverage.expected} subchapter III headings aren&apos;t on these pages, so
                    comparisons can&apos;t diff every heading
                  </span>
                }
              />
            ))}
          {data.comparisons.length === 0 ? (
            <p className="text-base-content/50">
              No comparison uses this revision yet. Once one does, the rows its changes rely on are listed here: those are the
              only ones to review.
            </p>
          ) : (
            data.comparisons.map((c) => {
              const codes = neededBy(c)
              const cRows = allRows.filter((_, i) => codes.has(headingOfRow[i]))
              const cReviewed = cRows.filter((r) => r.reviewed).length
              const done = cRows.length === cReviewed
              return (
                <div key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <StatusDot
                    tone={done ? "success" : "warning"}
                    label={
                      <span className="font-normal text-base-content/80">
                        <span className="font-medium">
                          {c.fromRevision} → {c.toRevision}
                        </span>{" "}
                        (this revision is the {c.side === "from" ? "before" : "after"}): {codes.size} heading
                        {codes.size === 1 ? "" : "s"}, {cReviewed} of {cRows.length} rows reviewed
                      </span>
                    }
                  />
                  <div className="ml-auto flex gap-1.5">
                    {!done && pdfIds(cRows.filter((r) => !r.reviewed)).length > 0 && (
                      <button
                        className={btn.xsSecondary}
                        disabled={!!busy || !!info?.checking}
                        title="Claude reads only the pages these rows are on and corrects them, like the full check"
                        onClick={() => checkRows(pdfIds(cRows.filter((r) => !r.reviewed)), `check:${c.id}`)}
                      >
                        {busy === `check:${c.id}` && <Spinner />}
                        Check {cRows.length - cReviewed} with Claude
                      </button>
                    )}
                    {!done && view !== `needed:${c.id}` && (
                      <button className={btn.xsSecondary} onClick={() => setView(`needed:${c.id}`)}>
                        Show these rows
                      </button>
                    )}
                    <a className={btn.xsGhost} href={`/revision-checker/comparisons/${c.id}`}>
                      Open comparison
                    </a>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Panel>

      {/* Source document and Claude's check */}
      <Panel
        title="Heading pages"
        actions={
          <>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="file-input file:normal-case file:font-medium file-input-bordered file-input-xs h-7 max-w-[14rem] border-base-content/15"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button className={btn.xsPrimary} disabled={!file || !!busy} onClick={upload}>
              {busy === "upload" && <Spinner />}
              {document ? "Replace" : "Upload"}
            </button>
          </>
        }
      >
        <div className="flex flex-col divide-y divide-base-content/[0.07]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
            {document ? (
              <>
                <span className="font-medium">{document.original_filename}</span>
                <StatusBadge status={document.conversion_status} />
                <span className="text-xs text-base-content/45">
                  {formatBytes(document.size_bytes)}
                  {document.page_count ? ` · ${document.page_count} pages` : ""}
                </span>
                {data.pdfUrl && (
                  <a className="ml-auto text-xs font-medium text-base-content/60 hover:text-base-content" href={data.pdfUrl} target="_blank" rel="noreferrer">
                    Open PDF ↗
                  </a>
                )}
              </>
            ) : (
              <span className="text-base-content/50">No heading pages uploaded.</span>
            )}
          </div>
          {document?.error && (
            <div className="px-4 py-3">
              <Callout tone="error">{document.error}</Callout>
            </div>
          )}
          {info && (
            <div className="flex flex-col gap-3 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {info.checking ? (
                  <StatusDot tone="info" busy label="Claude is checking the rows against the pages…" />
                ) : info.progress && !info.check ? (
                  <StatusDot
                    tone="warning"
                    label={
                      <span className="font-normal text-base-content/70">
                        Claude has checked {info.progress.pagesChecked} of {info.progress.pages} pages: continue to check the rest
                      </span>
                    }
                  />
                ) : info.check ? (
                  <StatusDot
                    tone={info.check.issues.length ? "warning" : "success"}
                    label={
                      <span className="font-normal text-base-content/70">
                        Checked by Claude {formatTime(info.check.at)} <Dot /> ${info.check.usage.cost_usd.toFixed(2)}
                      </span>
                    }
                  />
                ) : (
                  <StatusDot tone="neutral" label={<span className="font-normal text-base-content/60">Not checked by Claude yet</span>} />
                )}
                <div className="ml-auto flex gap-1.5">
                  <button
                    className={btn.xsGhost}
                    disabled={!!busy || document?.conversion_status !== "complete"}
                    title="Read the rows from the conversion again. Replaces the PDF rows and their reviews."
                    onClick={() =>
                      confirm("Read the rows again? This replaces the rows from the PDF and their reviews (manual rows are kept).") &&
                      run("extract", () => api(`/attempts/${attemptId}/headings/extract`, { method: "POST" }), "Rows read again")
                    }
                  >
                    {busy === "extract" && <Spinner />}
                    Re-read rows
                  </button>
                  <button
                    className={btn.xsSecondary}
                    disabled={!!busy || !!info.checking || !rows.some((r) => r.source === "pdf")}
                    onClick={() =>
                      run(
                        "check",
                        async () => {
                          const { done } = await api<{ done: boolean }>(`/attempts/${attemptId}/headings/check`, { method: "POST" })
                          if (done) toast.success("Checked")
                          else toast("Checked part of the pages; continue to check the rest")
                        }
                      )
                    }
                  >
                    {busy === "check" && <Spinner />}
                    {info.progress && !info.check ? "Continue checking" : info.check ? "Check again with Claude" : "Check with Claude"}
                  </button>
                </div>
              </div>
              {info.scopedCheck && (
                <StatusDot
                  tone={info.scopedCheck.issues.length ? "warning" : "success"}
                  label={
                    <span className="font-normal text-base-content/70">
                      Claude checked {info.scopedCheck.rows} row{info.scopedCheck.rows === 1 ? "" : "s"} on{" "}
                      {info.scopedCheck.pages.length === 1 ? "page" : "pages"} {info.scopedCheck.pages.join(", ")}{" "}
                      {formatTime(info.scopedCheck.at)} <Dot /> ${info.scopedCheck.usage.cost_usd.toFixed(2)}
                    </span>
                  }
                />
              )}
              {info.scopedCheck && info.scopedCheck.issues.length > 0 && (
                <details className="group rounded-md border border-warning/30 bg-warning/[0.05]">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    <span className="transition-transform group-open:rotate-90">›</span>
                    Claude found {info.scopedCheck.issues.length} difference{info.scopedCheck.issues.length === 1 ? "" : "s"} on those pages
                  </summary>
                  <ul className="ml-8 list-disc space-y-1 px-3 pb-3 text-base-content/75">
                    {info.scopedCheck.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </details>
              )}
              {info.warnings.map((w, i) => (
                <Callout key={i} tone="warning">
                  {w.message}
                </Callout>
              ))}
              {info.error && <Callout tone="error">{info.error}</Callout>}
              {info.check && info.check.issues.length > 0 && (
                <details className="group rounded-md border border-warning/30 bg-warning/[0.05]">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    <span className="transition-transform group-open:rotate-90">›</span>
                    Claude found {info.check.issues.length} difference{info.check.issues.length === 1 ? "" : "s"} from the pages
                  </summary>
                  <ul className="ml-8 list-disc space-y-1 px-3 pb-3 text-base-content/75">
                    {info.check.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </Panel>

      {/* Coverage of the change record's citations */}
      <Panel
        title="Cited by the change record"
        count={data.changeRecordRead ? cited.length : undefined}
        actions={
          data.changeRecordRead &&
          cited.length > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <StatusDot tone="success" label={<span className="font-normal text-base-content/55">Reviewed</span>} />
              <StatusDot tone="warning" label={<span className="font-normal text-base-content/55">Not reviewed</span>} />
              <StatusDot tone="error" label={<span className="font-normal text-base-content/55">No row</span>} />
            </div>
          )
        }
      >
        <div className="px-4 py-3">
          {!data.changeRecordRead ? (
            <p className="text-sm text-base-content/50">
              Shows once the change record has been read (on this revision&apos;s first comparison).
            </p>
          ) : cited.length === 0 ? (
            <p className="text-sm text-base-content/50">The change record doesn&apos;t cite any headings.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {coverage.map((c) => (
                <Pill
                  key={c.code}
                  mono
                  tone={c.state === "reviewed" ? "success" : c.state === "unreviewed" ? "warning" : "error"}
                  title={c.state === "missing" ? "No row for this heading" : c.state}
                >
                  {c.code}
                </Pill>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Rows */}
      <Panel
        title={
          showNeeded
            ? viewComparison
              ? `Rows ${viewComparison.fromRevision} → ${viewComparison.toRevision} needs reviewed`
              : "Rows comparisons need reviewed"
            : "Heading rows"
        }
        count={rows.length}
        actions={
          selectedRows.length > 0 ? (
            <>
              <span className="mr-1 text-xs font-medium text-base-content/70">{selectedRows.length} selected</span>
              <button className={btn.xsGhost} disabled={!!busy} onClick={() => setSelected(new Set())}>
                Clear
              </button>
              <button
                className={btn.xsSecondary}
                disabled={!!busy || selectedRows.every((r) => r.reviewed)}
                onClick={() => markReviewed(selectedRows.filter((r) => !r.reviewed).map((r) => r.id), "bulk-review")}
              >
                {busy === "bulk-review" && <Spinner />}
                Mark selected reviewed
              </button>
              <button
                className={btn.xsSecondary}
                disabled={!!busy || !!info?.checking || pdfIds(selectedRows).length === 0}
                title="Claude reads only the pages these rows are on and corrects them, like the full check"
                onClick={() => checkRows(pdfIds(selectedRows), "check-selected")}
              >
                {busy === "check-selected" && <Spinner />}
                Check selected with Claude
              </button>
              <button
                className={`${btn.xsSecondary} text-error`}
                disabled={!!busy}
                onClick={() =>
                  confirm(`Delete ${selectedRows.length} selected row${selectedRows.length === 1 ? "" : "s"}? This can't be undone.`) &&
                  deleteRows(selectedRows.map((r) => r.id), "bulk-delete")
                }
              >
                {busy === "bulk-delete" && <Spinner />}
                Delete selected
              </button>
            </>
          ) : (
          <>
            {/* Only for trimmed uploads: with every subchapter III page, removing rows would stop full diffs */}
            {uncited.size > 0 && !data.coverage?.complete && (
              <button
                className={btn.xsSecondary}
                disabled={!!busy}
                title="Deletes rows whose headings the change record doesn't cite, by code or range. Keeps parent rows of cited headings and rows you added by hand."
                onClick={() =>
                  confirm(
                    `Remove ${uncited.size} row${uncited.size === 1 ? "" : "s"} this revision's change record doesn't cite? They're tagged "Not cited" in the table. Keep them if comparisons should diff every heading, or if this revision is being backfilled: the next revision's changes need them as the "before". This can't be undone (Re-read rows brings them back).`
                  ) && removeUncited()
                }
              >
                {busy === "uncited" && <Spinner />}
                Remove {uncited.size} uncited row{uncited.size === 1 ? "" : "s"}
              </button>
            )}
            {needed.size > 0 && (
              <button className={btn.xsGhost} onClick={() => setView(showNeeded ? "all" : "needed")}>
                {showNeeded ? `Show all ${allRows.length} rows` : "Show only rows to review"}
              </button>
            )}
            {allRows.length > 0 && (
              <span className="mr-1 text-xs tabular-nums text-base-content/50">
                {needed.size > 0 ? (
                  <>
                    <span className={neededReviewed < neededRows.length ? "text-warning" : ""}>
                      {neededReviewed} of {neededRows.length} rows to review done
                    </span>
                    {" "}
                    · {reviewed} of {allRows.length} reviewed in all
                  </>
                ) : (
                  <>
                    {reviewed} of {allRows.length} reviewed
                  </>
                )}
              </span>
            )}
            {/* Stays mounted once there are Claude-confirmed rows, so the header doesn't reflow as you tick */}
            {rows.some((r) => r.claude_status === "ok") && (
              <button
                className={`${btn.xsSecondary} tabular-nums`}
                disabled={!!busy || okUnreviewed.length === 0}
                onClick={() =>
                  run(
                    "bulk",
                    async () => {
                      await api(`/attempts/${attemptId}/headings/review`, {
                        method: "POST",
                        body: JSON.stringify({ ids: okUnreviewed.map((r) => r.id), reviewed: true }),
                      })
                    },
                    `${okUnreviewed.length} rows marked reviewed`
                  )
                }
              >
                {busy === "bulk" && <Spinner />}
                {okUnreviewed.length ? `Mark ${okUnreviewed.length} confirmed by Claude as reviewed` : "Claude-confirmed rows reviewed"}
              </button>
            )}
            <button className={btn.xsSecondary} onClick={() => setAdding(!adding)}>
              {adding ? "Cancel" : "+ Add by hand"}
            </button>
          </>
          )
        }
      >
        {adding && (
          <div className="border-b border-base-content/10 bg-base-content/[0.02] px-4 py-4">
            <RowForm value={newRow} onChange={setNewRow} />
            <div className="mt-3 flex justify-end gap-2">
              <button className={btn.xsGhost} onClick={() => setAdding(false)}>
                Cancel
              </button>
              <button
                className={btn.xsPrimary}
                disabled={!!busy}
                onClick={() =>
                  run(
                    "add",
                    async () => {
                      await api(`/attempts/${attemptId}/headings`, { method: "POST", body: JSON.stringify(fromEditable(newRow)) })
                      setNewRow(EMPTY)
                      setAdding(false)
                    },
                    "Heading added"
                  )
                }
              >
                {busy === "add" && <Spinner />}
                Add heading
              </button>
            </div>
          </div>
        )}

        {rows.length === 0 ? (
          <EmptyState title="No heading rows">Upload the heading pages, or add a heading by hand.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-content/10">
                  <th className={`${th} w-8 pr-0`}>
                    <input
                      type="checkbox"
                      aria-label="Select all rows"
                      className="checkbox checkbox-xs rounded"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = selectedRows.length > 0 && !allSelected
                      }}
                      onChange={() => {
                        setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
                        setAnchor(null)
                      }}
                    />
                  </th>
                  <th className={`${th} w-16`} title="Reviewed">
                    ✓
                  </th>
                  <th className={th}>Heading</th>
                  <th className={`${th} min-w-[18rem]`}>Description</th>
                  <th className={th}>General</th>
                  <th className={th}>Special</th>
                  <th className={th}>Col. 2</th>
                  <th className={th}>Footnotes</th>
                  <th className={`${th} text-right`}>Page</th>
                  <th className={th}>Check</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody className="divide-y divide-base-content/[0.07]">
                {rows.map((row, index) =>
                  editing === row.id ? (
                    <tr key={row.id} className="bg-base-content/[0.02]">
                      <td colSpan={11} className="px-4 py-4">
                        <RowForm value={draft} onChange={setDraft} />
                        <div className="mt-3 flex justify-end gap-2">
                          <button className={btn.xsGhost} onClick={() => setEditing(null)}>
                            Cancel
                          </button>
                          <button
                            className={btn.xsPrimary}
                            disabled={!!busy}
                            onClick={async () => {
                              await patch(row, fromEditable(draft))
                              setEditing(null)
                            }}
                          >
                            {busy === `row-${row.id}` && <Spinner />}
                            Save and mark reviewed
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={row.id}
                      className={`group transition-colors duration-150 ${
                        selected.has(row.id)
                          ? "bg-info/[0.07]"
                          : row.claude_status === "flagged"
                            ? "bg-error/[0.05]"
                            : row.reviewed
                              ? ""
                              : "bg-warning/[0.03]"
                      }`}
                    >
                      <td className={`${td} pr-0`}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${row.htsno || "row"}`}
                          className="checkbox checkbox-xs mt-0.5 rounded"
                          checked={selected.has(row.id)}
                          onChange={(e) => toggleSelected(index, (e.nativeEvent as MouseEvent).shiftKey)}
                        />
                      </td>
                      <td className={td}>
                        <span className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs mt-0.5 rounded"
                            checked={row.reviewed}
                            // Only operations that replace or delete rows lock the checkboxes
                            disabled={!!busy && !busy.startsWith("row-")}
                            onChange={(e) => toggleReviewed(row, e.target.checked)}
                          />
                          {/* Fixed slot: the spinner never changes the column's width */}
                          <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center" aria-hidden>
                            {((savingRows[row.id] ?? 0) > 0 || busy === `row-${row.id}`) && (
                              <span className="loading loading-spinner h-3 w-3 text-base-content/40" />
                            )}
                          </span>
                        </span>
                      </td>
                      <td className={`${td} whitespace-nowrap font-mono text-[13px]`}>
                        {row.htsno || <span className="text-base-content/30">—</span>}
                        {row.stat_suffix && <span className="text-base-content/45"> {row.stat_suffix}</span>}
                        {uncited.has(row.id) && !data.coverage?.complete && (
                          <span className="mt-1 block font-sans">
                            <Pill title="The change record doesn't cite this heading">Not cited</Pill>
                          </span>
                        )}
                      </td>
                      <td className={td}>
                        <span style={{ paddingLeft: `${row.indent * 1}rem` }} className="block leading-snug">
                          {row.description}
                        </span>
                        {row.parser_original && (
                          <span className="mt-1 block text-xs text-base-content/45">
                            Parser read:{" "}
                            {Object.entries(row.parser_original)
                              .map(([k, v]) => `${k} "${Array.isArray(v) ? v.join("; ") : v}"`)
                              .join(", ")}
                          </span>
                        )}
                      </td>
                      <td className={td}>{row.general}</td>
                      <td className={`${td} max-w-[12rem] break-words`}>{row.special}</td>
                      <td className={td}>{row.other}</td>
                      <td className={`${td} max-w-[12rem] text-xs text-base-content/70`}>{row.footnotes.join(" ")}</td>
                      <td className={`${td} text-right text-xs tabular-nums text-base-content/55`}>{row.page ?? ""}</td>
                      <td className={`${td} text-xs`}>
                        {row.source === "manual" ? (
                          <Pill>Manual</Pill>
                        ) : (
                          row.claude_status && (
                            <Pill tone={CHECK_TONES[row.claude_status]} title={row.claude_notes ?? ""}>
                              {row.claude_status.charAt(0).toUpperCase() + row.claude_status.slice(1)}
                            </Pill>
                          )
                        )}
                        {row.claude_notes && row.claude_status !== "ok" && (
                          <span className="mt-1 block max-w-[12rem] leading-snug text-base-content/55">{row.claude_notes}</span>
                        )}
                      </td>
                      <td className={`${td} whitespace-nowrap text-right`}>
                        <button
                          className={btn.xsGhost}
                          onClick={() => {
                            setDraft(toEditable(row))
                            setEditing(row.id)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className={`${btn.xsGhost} text-base-content/40 hover:text-error`}
                          disabled={!!busy}
                          onClick={() =>
                            confirm(`Delete ${row.htsno || "this row"}?`) &&
                            run(`del-${row.id}`, () => api(`/heading-rows/${row.id}`, { method: "DELETE" }))
                          }
                        >
                          {busy === `del-${row.id}` && <Spinner />}
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}

function RowForm({ value, onChange }: { value: Editable; onChange: (v: Editable) => void }) {
  const field = (key: keyof Editable, label: string, className = "") => (
    <label className={`form-control ${className}`}>
      <span className="mb-1 text-xs font-medium text-base-content/60">{label}</span>
      <input
        className="input input-bordered input-sm border-base-content/15 bg-base-100"
        value={value[key] === null ? "" : String(value[key])}
        onChange={(e) =>
          onChange({ ...value, [key]: key === "indent" || key === "page" ? (e.target.value ? Number(e.target.value) : key === "page" ? null : 0) : e.target.value })
        }
      />
    </label>
  )
  return (
    <div className="grid gap-3 md:grid-cols-6">
      {field("htsno", "Heading (e.g. 9903.82.18)", "md:col-span-2")}
      {field("stat_suffix", "Stat. suffix")}
      {field("indent", "Indent (0 = left)")}
      {field("units", "Units")}
      {field("page", "Page")}
      <label className="form-control md:col-span-6">
        <span className="mb-1 text-xs font-medium text-base-content/60">Description</span>
        <textarea
          className="textarea textarea-bordered textarea-sm border-base-content/15 bg-base-100"
          rows={2}
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </label>
      {field("general", "General (column 1)", "md:col-span-2")}
      {field("special", "Special", "md:col-span-2")}
      {field("other", "Column 2", "md:col-span-2")}
      <label className="form-control md:col-span-6">
        <span className="mb-1 text-xs font-medium text-base-content/60">Footnotes, one per line (e.g. &quot;1/ See chapter 99 statistical note 1.&quot;)</span>
        <textarea
          className="textarea textarea-bordered textarea-sm border-base-content/15 bg-base-100"
          rows={2}
          value={value.footnotesText}
          onChange={(e) => onChange({ ...value, footnotesText: e.target.value })}
        />
      </label>
    </div>
  )
}
