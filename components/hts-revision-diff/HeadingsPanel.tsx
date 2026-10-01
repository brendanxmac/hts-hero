"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import type { DocumentRow, HeadingRow } from "@/libs/hts-revision-diff/types"
import { api, formatBytes, formatTime, StatusBadge } from "./shared"

interface HeadingsData {
  document: DocumentRow | null
  pdfUrl: string | null
  info: {
    parsedAt: string | null
    warnings: { kind: string; message: string }[]
    check: { at: string; issues: string[]; usage: { cost_usd: number; input_tokens: number; output_tokens: number } } | null
    checking: boolean
    error: string | null
  } | null
  rows: HeadingRow[]
  cited: string[]
  changeRecordRead: boolean
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

const fromEditable = (e: Editable) => ({
  ...e,
  footnotes: e.footnotesText.split("\n").map((l) => l.trim()).filter(Boolean),
  footnotesText: undefined,
})

const CHECK_STYLES: Record<string, string> = {
  pending: "badge-ghost",
  ok: "badge-success",
  corrected: "badge-warning",
  added: "badge-info",
  flagged: "badge-error",
}

export default function HeadingsPanel({ attemptId }: { attemptId: string }) {
  const [data, setData] = useState<HeadingsData | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Editable>(EMPTY)
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState<Editable>(EMPTY)
  const [file, setFile] = useState<File | null>(null)

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
      await api(`/attempts/${attemptId}`).catch(() => null)
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

  const patch = (row: HeadingRow, values: Record<string, unknown>) =>
    run(`row-${row.id}`, () => api(`/heading-rows/${row.id}`, { method: "PATCH", body: JSON.stringify(values) }))

  if (!data) return <span className="loading loading-spinner" />

  const { document, info, rows, cited } = data
  const reviewed = rows.filter((r) => r.reviewed).length
  const okUnreviewed = rows.filter((r) => r.claude_status === "ok" && !r.reviewed)
  const coverage = cited.map((code) => {
    const matches = rows.filter((r) => r.htsno === code)
    return { code, state: matches.some((r) => r.reviewed) ? "reviewed" : matches.length ? "unreviewed" : "missing" }
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-base-content/70">
        New or changed Chapter 99 headings, read from this revision&apos;s own tariff-table pages. Upload the pages for the
        headings the change record cites (trimmed from the Chapter 99 PDF). Rows are read from datalab&apos;s conversion,
        checked by Claude against the pages, and only used once you mark them reviewed.
      </p>

      {/* Document */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-base-300 p-3 text-sm">
        {document ? (
          <>
            <span className="font-semibold">{document.original_filename}</span>
            <StatusBadge status={document.conversion_status} />
            <span className="text-xs text-base-content/50">
              {formatBytes(document.size_bytes)}
              {document.page_count ? ` · ${document.page_count} pages` : ""}
            </span>
            {data.pdfUrl && (
              <a className="link text-xs" href={data.pdfUrl} target="_blank" rel="noreferrer">
                Open PDF
              </a>
            )}
            {document.error && <span className="text-xs text-error">{document.error}</span>}
          </>
        ) : (
          <span className="text-base-content/60">No heading pages uploaded.</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="file-input file-input-bordered file-input-xs"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button className="btn btn-primary btn-xs" disabled={!file || !!busy} onClick={upload}>
            {busy === "upload" && <span className="loading loading-spinner loading-xs" />}
            {document ? "Replace pages" : "Upload pages"}
          </button>
        </div>
      </div>

      {/* Coverage of the change record's citations */}
      {data.changeRecordRead ? (
        cited.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">Cited by the change record:</span>
            {coverage.map((c) => (
              <span
                key={c.code}
                className={`badge badge-sm font-mono ${
                  c.state === "reviewed" ? "badge-success" : c.state === "unreviewed" ? "badge-warning" : "badge-error"
                }`}
                title={c.state === "missing" ? "No row for this heading" : c.state}
              >
                {c.code}
              </span>
            ))}
          </div>
        )
      ) : (
        <p className="text-xs text-base-content/60">
          The headings the change record cites show here once it has been read (on this revision&apos;s first comparison).
        </p>
      )}

      {/* Parse and check status */}
      {info && (
        <div className="flex flex-col gap-2 text-sm">
          {info.warnings.map((w, i) => (
            <div key={i} className="alert alert-warning py-2 text-sm">
              {w.message}
            </div>
          ))}
          {info.error && <div className="alert alert-error py-2 text-sm">{info.error}</div>}
          <div className="flex flex-wrap items-center gap-2">
            {info.checking ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs" /> Claude is checking the rows against the pages…
              </span>
            ) : info.check ? (
              <span className="text-base-content/70">
                Checked by Claude {formatTime(info.check.at)} · ${info.check.usage.cost_usd.toFixed(2)}
              </span>
            ) : (
              <span className="text-base-content/70">Not checked by Claude yet.</span>
            )}
            <div className="ml-auto flex gap-2">
              <button
                className="btn btn-xs"
                disabled={!!busy || !!info.checking || !rows.some((r) => r.source === "pdf")}
                onClick={() => run("check", () => api(`/attempts/${attemptId}/headings/check`, { method: "POST" }), "Checked")}
              >
                {busy === "check" && <span className="loading loading-spinner loading-xs" />}
                {info.check ? "Check again with Claude" : "Check with Claude"}
              </button>
              <button
                className="btn btn-xs"
                disabled={!!busy || document?.conversion_status !== "complete"}
                title="Read the rows from the conversion again. Replaces the PDF rows and their reviews."
                onClick={() =>
                  confirm("Read the rows again? This replaces the rows from the PDF and their reviews (manual rows are kept).") &&
                  run("extract", () => api(`/attempts/${attemptId}/headings/extract`, { method: "POST" }), "Rows read again")
                }
              >
                Re-read rows
              </button>
            </div>
          </div>
          {info.check && info.check.issues.length > 0 && (
            <details className="rounded-md bg-base-200 p-2">
              <summary className="cursor-pointer">Claude found {info.check.issues.length} differences from the pages</summary>
              <ul className="ml-5 mt-1 list-disc">
                {info.check.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Rows */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">
          {rows.length} rows · {reviewed} reviewed
        </span>
        {rows.length > reviewed && <span className="badge badge-warning badge-sm">{rows.length - reviewed} need review</span>}
        <div className="ml-auto flex gap-2">
          {okUnreviewed.length > 0 && (
            <button
              className="btn btn-xs"
              disabled={!!busy}
              onClick={() =>
                run("bulk", async () => {
                  for (const r of okUnreviewed) await api(`/heading-rows/${r.id}`, { method: "PATCH", body: JSON.stringify({ reviewed: true }) })
                }, `${okUnreviewed.length} rows marked reviewed`)
              }
            >
              Mark the {okUnreviewed.length} rows Claude confirmed as reviewed
            </button>
          )}
          <button className="btn btn-xs" onClick={() => setAdding(!adding)}>
            {adding ? "Cancel" : "Add a heading by hand"}
          </button>
        </div>
      </div>

      {adding && (
        <div className="rounded-lg border border-base-300 p-3">
          <RowForm value={newRow} onChange={setNewRow} />
          <button
            className="btn btn-primary btn-xs mt-2"
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
            Add heading
          </button>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-base-300">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Reviewed</th>
                <th>Heading</th>
                <th className="min-w-[18rem]">Description</th>
                <th>General</th>
                <th>Special</th>
                <th>Col. 2</th>
                <th>Footnotes</th>
                <th>Page</th>
                <th>Check</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) =>
                editing === row.id ? (
                  <tr key={row.id}>
                    <td colSpan={10}>
                      <RowForm value={draft} onChange={setDraft} />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="btn btn-primary btn-xs"
                          disabled={!!busy}
                          onClick={async () => {
                            await patch(row, fromEditable(draft))
                            setEditing(null)
                          }}
                        >
                          Save (marks reviewed)
                        </button>
                        <button className="btn btn-xs" onClick={() => setEditing(null)}>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id} className={row.claude_status === "flagged" ? "bg-error/10" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={row.reviewed}
                        disabled={!!busy}
                        onChange={(e) => patch(row, { reviewed: e.target.checked })}
                      />
                    </td>
                    <td className="whitespace-nowrap font-mono">
                      {row.htsno || "—"}
                      {row.stat_suffix && <span className="text-base-content/50"> {row.stat_suffix}</span>}
                    </td>
                    <td>
                      <span style={{ paddingLeft: `${row.indent * 1}rem` }} className="block">
                        {row.description}
                      </span>
                      {row.parser_original && (
                        <span className="mt-1 block text-xs text-base-content/50">
                          Parser read:{" "}
                          {Object.entries(row.parser_original)
                            .map(([k, v]) => `${k} "${Array.isArray(v) ? v.join("; ") : v}"`)
                            .join(", ")}
                        </span>
                      )}
                    </td>
                    <td>{row.general}</td>
                    <td className="max-w-[12rem] break-words">{row.special}</td>
                    <td>{row.other}</td>
                    <td className="max-w-[12rem] text-xs">{row.footnotes.join(" ")}</td>
                    <td className="text-xs">{row.page ?? ""}</td>
                    <td className="text-xs">
                      {row.source === "manual" ? (
                        <span className="badge badge-outline badge-sm">manual</span>
                      ) : (
                        row.claude_status && (
                          <span className={`badge badge-sm ${CHECK_STYLES[row.claude_status]}`} title={row.claude_notes ?? ""}>
                            {row.claude_status}
                          </span>
                        )
                      )}
                      {row.claude_notes && row.claude_status !== "ok" && (
                        <span className="mt-1 block max-w-[12rem] text-base-content/60">{row.claude_notes}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          setDraft(toEditable(row))
                          setEditing(row.id)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        disabled={!!busy}
                        onClick={() =>
                          confirm(`Delete ${row.htsno || "this row"}?`) &&
                          run(`del-${row.id}`, () => api(`/heading-rows/${row.id}`, { method: "DELETE" }))
                        }
                      >
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
    </div>
  )
}

function RowForm({ value, onChange }: { value: Editable; onChange: (v: Editable) => void }) {
  const field = (key: keyof Editable, label: string, className = "") => (
    <label className={`form-control ${className}`}>
      <span className="label-text text-xs">{label}</span>
      <input
        className="input input-bordered input-xs"
        value={value[key] === null ? "" : String(value[key])}
        onChange={(e) =>
          onChange({ ...value, [key]: key === "indent" || key === "page" ? (e.target.value ? Number(e.target.value) : key === "page" ? null : 0) : e.target.value })
        }
      />
    </label>
  )
  return (
    <div className="grid gap-2 md:grid-cols-6">
      {field("htsno", "Heading (e.g. 9903.82.18)", "md:col-span-2")}
      {field("stat_suffix", "Stat. suffix")}
      {field("indent", "Indent (0 = left)")}
      {field("units", "Units")}
      {field("page", "Page")}
      <label className="form-control md:col-span-6">
        <span className="label-text text-xs">Description</span>
        <textarea
          className="textarea textarea-bordered textarea-xs"
          rows={2}
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </label>
      {field("general", "General (column 1)", "md:col-span-2")}
      {field("special", "Special", "md:col-span-2")}
      {field("other", "Column 2", "md:col-span-2")}
      <label className="form-control md:col-span-6">
        <span className="label-text text-xs">Footnotes, one per line (e.g. &quot;1/ See chapter 99 statistical note 1.&quot;)</span>
        <textarea
          className="textarea textarea-bordered textarea-xs"
          rows={2}
          value={value.footnotesText}
          onChange={(e) => onChange({ ...value, footnotesText: e.target.value })}
        />
      </label>
    </div>
  )
}
