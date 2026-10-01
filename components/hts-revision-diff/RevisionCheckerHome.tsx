"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { HtsRevisions } from "@/tariffs/engine-v2/revisions"
import {
  DOCUMENT_KINDS,
  DOCUMENT_LABELS,
  REQUIRED_DOCUMENT_KINDS,
  type AttemptRow,
  type ComparisonRow,
  type DocumentKind,
  type DocumentRow,
  type RevisionRow,
} from "@/libs/hts-revision-diff/types"
import { api, BUSY_STATUSES, formatBytes, formatTime, StatusBadge } from "./shared"

interface Overview {
  revisions: RevisionRow[]
  attempts: AttemptRow[]
  documents: DocumentRow[]
  comparisons: ComparisonRow[]
  progress: Record<string, { total: number; decided: number }>
}

const POLL_MS = 5000

// Index of a revision in USITC order (unknown names sort last)
const revisionOrder = (name: string) => {
  const i = HtsRevisions.findIndex((r) => r.name === name)
  return i < 0 ? Number.MAX_SAFE_INTEGER : i
}

export default function RevisionCheckerHome() {
  const router = useRouter()
  const [data, setData] = useState<Overview | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await api<Overview>("/overview"))
    } catch (error) {
      toast.error((error as Error).message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // While anything is converting or parsing, poll those attempts (which
  // advances them) and refresh the lists
  const activeAttempts = useMemo(
    () => (data?.attempts ?? []).filter((a) => BUSY_STATUSES.includes(a.status)),
    [data]
  )
  const activeComparisons = useMemo(
    () => (data?.comparisons ?? []).filter((c) => c.status === "pending" || BUSY_STATUSES.includes(c.status)),
    [data]
  )
  useEffect(() => {
    if (!activeAttempts.length && !activeComparisons.length) return
    const timer = setTimeout(async () => {
      await Promise.all(activeAttempts.map((a) => api(`/attempts/${a.id}`).catch(() => null)))
      await load()
    }, POLL_MS)
    return () => clearTimeout(timer)
  }, [activeAttempts, activeComparisons, load])

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

  if (!data) {
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  const attemptsByRevision = (revisionId: string) =>
    data.attempts.filter((a) => a.revision_id === revisionId)
  const docsByAttempt = (attemptId: string) =>
    DOCUMENT_KINDS.map((kind) => data.documents.find((d) => d.attempt_id === attemptId && d.kind === kind)).filter(
      Boolean
    ) as DocumentRow[]
  const revisionName = (attemptId: string) => {
    const attempt = data.attempts.find((a) => a.id === attemptId)
    const revision = data.revisions.find((r) => r.id === attempt?.revision_id)
    return revision ? `${revision.name} #${attempt?.attempt_number}` : "?"
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Revision checker</h1>
        <p className="text-base-content/70">
          Upload an HTS revision, convert it with datalab, compare it to an earlier revision, and review what changed in
          chapter 99. When every change has a decision, run{" "}
          <code className="rounded bg-base-200 px-1">npm run pull-revision -- &lt;revision&gt;</code> to write the review
          into the repo for Claude Code.
        </p>
      </header>

      <UploadCard busy={busy} run={run} />

      <CompareCard data={data} busy={busy} run={run} onStarted={(id) => router.push(`/revision-checker/comparisons/${id}`)} />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Comparisons</h2>
        {data.comparisons.length === 0 ? (
          <p className="text-base-content/60">No comparisons yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-base-300">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>From → To</th>
                  <th>Status</th>
                  <th>Reviewed</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.comparisons.map((c) => {
                  const p = data.progress[c.id]
                  return (
                    <tr key={c.id}>
                      <td className="font-mono text-xs">
                        {revisionName(c.from_attempt_id)} → {revisionName(c.to_attempt_id)}
                        {c.stats?.consecutive === false && (
                          <span className="badge badge-warning badge-sm ml-2">not consecutive</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                        {c.error && <div className="mt-1 max-w-xs text-xs text-error">{c.error}</div>}
                      </td>
                      <td>{p ? `${p.decided} / ${p.total}` : "—"}</td>
                      <td className="text-xs">{formatTime(c.created_at)}</td>
                      <td>
                        <Link className="btn btn-xs" href={`/revision-checker/comparisons/${c.id}`}>
                          Open
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Revisions</h2>
        {data.revisions.length === 0 && <p className="text-base-content/60">No revisions uploaded yet.</p>}
        {data.revisions.map((revision) => (
          <div key={revision.id} className="rounded-lg border border-base-300 p-4">
            <div className="mb-3 flex flex-wrap items-baseline gap-3">
              <h3 className="font-mono text-lg font-semibold">{revision.name}</h3>
              {revision.title && <span className="text-base-content/60">{revision.title}</span>}
            </div>
            {(() => {
              // The documents' titles name a different revision than this one
              const active = data.attempts.find((a) => a.id === revision.active_attempt_id) ?? attemptsByRevision(revision.id)[0]
              const detected = active?.parse_stats?.detectedRevision
              const named = detected?.ch99Pdf ?? detected?.changeRecord
              if (!named || named === revision.name) return null
              return (
                <div className="alert alert-error mb-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex-1">
                    This revision is named <b>{revision.name}</b>, but its documents say <b>{named}</b>. Comparisons are
                    blocked until it&apos;s renamed.
                  </span>
                  <button
                    className="btn btn-sm"
                    disabled={!!busy}
                    onClick={() =>
                      run(
                        `rename-${revision.id}`,
                        () => api(`/revisions/${revision.id}/rename`, { method: "POST", body: JSON.stringify({ name: named }) }),
                        `Renamed to ${named}. Re-run any comparisons that used the old name.`
                      )
                    }
                  >
                    Rename to {named}
                  </button>
                </div>
              )
            })()}
            <div className="flex flex-col gap-3">
              {attemptsByRevision(revision.id).map((attempt) => {
                const docs = docsByAttempt(attempt.id)
                const isActive = revision.active_attempt_id === attempt.id
                const canConvert =
                  ["uploaded", "failed", "converting"].includes(attempt.status) &&
                  docs.some((d) => d.conversion_status === "pending" || d.conversion_status === "failed")
                const canParse =
                  ["parsed", "failed", "converted"].includes(attempt.status) &&
                  docs.every((d) => d.conversion_status === "complete" || d.conversion_status === "not_needed")
                return (
                  <div key={attempt.id} className={`rounded-md bg-base-200 p-3 ${isActive ? "ring-2 ring-primary" : ""}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">Attempt {attempt.attempt_number}</span>
                      <StatusBadge status={attempt.status} />
                      {isActive && <span className="badge badge-primary badge-sm">active</span>}
                      <span className="text-xs text-base-content/60">{formatTime(attempt.created_at)}</span>
                      <div className="ml-auto flex flex-wrap gap-2">
                        {canConvert && (
                          <button
                            className="btn btn-primary btn-xs"
                            disabled={!!busy}
                            onClick={() =>
                              run(`convert-${attempt.id}`, () => api(`/attempts/${attempt.id}/convert`, { method: "POST" }), "Sent to datalab")
                            }
                          >
                            {busy === `convert-${attempt.id}` && <span className="loading loading-spinner loading-xs" />}
                            {docs.some((d) => d.conversion_status === "failed") ? "Retry conversion" : "Convert with datalab"}
                          </button>
                        )}
                        {canParse && (
                          <button
                            className="btn btn-xs"
                            disabled={!!busy}
                            onClick={() =>
                              run(`parse-${attempt.id}`, () => api(`/attempts/${attempt.id}/parse`, { method: "POST" }), "Parsed")
                            }
                          >
                            {busy === `parse-${attempt.id}` && <span className="loading loading-spinner loading-xs" />}
                            Re-parse
                          </button>
                        )}
                        {attempt.status === "parsed" && !isActive && (
                          <button
                            className="btn btn-xs"
                            disabled={!!busy}
                            onClick={() => run(`activate-${attempt.id}`, () => api(`/attempts/${attempt.id}/activate`, { method: "POST" }))}
                          >
                            Make active
                          </button>
                        )}
                        <Link className="btn btn-xs" href={`/revision-checker/attempts/${attempt.id}`}>
                          Inspect
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                      {docs.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-2">
                          <span className="text-base-content/70">{DOCUMENT_LABELS[doc.kind]}</span>
                          <StatusBadge
                            status={doc.conversion_status}
                            label={doc.conversion_status === "not_needed" ? "no conversion needed" : undefined}
                          />
                          <span className="text-xs text-base-content/50">
                            {formatBytes(doc.size_bytes)}
                            {doc.page_count ? ` · ${doc.page_count} pages` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                    {docs.filter((d) => d.error).map((d) => (
                      <p key={d.id} className="mt-1 text-xs text-error">
                        {d.original_filename}: {d.error}
                      </p>
                    ))}
                    {attempt.error && !docs.some((d) => d.error) && (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-error">{attempt.error}</p>
                    )}
                    {attempt.parse_stats && (
                      <p className="mt-2 text-xs text-base-content/70">
                        {attempt.parse_stats.topLevelNotes} notes · {attempt.parse_stats.nodes} subdivisions ·{" "}
                        {attempt.parse_stats.subchapters.length} subchapters ·{" "}
                        {attempt.parse_stats.htsRows ? `${attempt.parse_stats.htsRowsWithCode} headings in JSON` : "no Chapter 99 JSON"} ·{" "}
                        <span className={attempt.parse_stats.warnings ? "text-warning" : ""}>
                          {attempt.parse_stats.warnings} parse warnings
                        </span>
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

// "2026htsrev5", "2026 HTS Rev 5" -> "2026HTSRev5"; null if it isn't a revision name
const normalizeRevisionName = (input: string) => {
  const m = input.replace(/\s+/g, "").match(/^(\d{4})hts(basic|rev(\d+))$/i)
  if (!m) return null
  return `${m[1]}HTS${m[3] ? `Rev${Number(m[3])}` : "Basic"}`
}

function UploadCard({
  busy,
  run,
}: {
  busy: string | null
  run: (label: string, fn: () => Promise<unknown>, success?: string) => Promise<void>
}) {
  const [rawName, setRawName] = useState("")
  const [files, setFiles] = useState<Partial<Record<DocumentKind, File>>>({})
  const [formKey, setFormKey] = useState(0)
  const name = normalizeRevisionName(rawName)
  const known = name ? HtsRevisions.find((r) => r.name === name) : undefined
  const missing = REQUIRED_DOCUMENT_KINDS.filter((k) => !files[k]).map((k) => DOCUMENT_LABELS[k])
  const problems = [
    !rawName.trim() ? "Enter a revision name" : !name ? `"${rawName.trim()}" isn't a revision name like 2026HTSRev5` : null,
    missing.length ? `Choose the ${missing.join(" and ")}` : null,
  ].filter(Boolean)
  const ready = problems.length === 0

  const upload = () =>
    run("upload", async () => {
      const form = new FormData()
      form.append("revisionName", name)
      for (const kind of DOCUMENT_KINDS) if (files[kind]) form.append(kind, files[kind]!)
      const { ch99Json } = await api<{ ch99Json: string }>("/attempts", { method: "POST", body: form })
      setFiles({})
      setFormKey((k) => k + 1)
      toast.success(
        `Uploaded ${name}. ${
          ch99Json === "saved"
            ? "It's the current revision, so USITC's Chapter 99 JSON was saved too. "
            : ch99Json === "failed"
              ? "Saving USITC's Chapter 99 JSON failed; it will be retried when compared. "
              : ""
        }Click "Convert with datalab" to start.`,
        { duration: 8000 }
      )
    })

  return (
    <section className="rounded-lg border border-base-300 p-4">
      <h2 className="mb-3 text-xl font-semibold">Upload a revision</h2>
      <div key={formKey} className="grid gap-4 md:grid-cols-2">
        <label className="form-control">
          <span className="label-text mb-1">Revision name</span>
          <input
            className="input input-sm input-bordered font-mono"
            placeholder="2026HTSRev5"
            list="hts-revision-names"
            value={rawName}
            onChange={(e) => setRawName(e.target.value)}
          />
          <datalist id="hts-revision-names">
            {HtsRevisions.map((r) => (
              <option key={r.name} value={r.name}>
                {r.title}
              </option>
            ))}
          </datalist>
          <span className="label-text-alt mt-1 text-base-content/60">
            {known
              ? `${known.title}, in effect from ${known.from}. Check the year: the documents' titles are compared with this name after conversion.`
              : "USITC name, e.g. 2026HTSRev5. Uploading again creates a new attempt."}
          </span>
        </label>
        {DOCUMENT_KINDS.map((kind) => (
          <label key={kind} className="form-control">
            <span className="label-text mb-1">
              {DOCUMENT_LABELS[kind]}
              {!REQUIRED_DOCUMENT_KINDS.includes(kind) && " (optional)"}
            </span>
            <input
              type="file"
              accept={kind === "ch99_json" ? ".json,application/json" : ".pdf,application/pdf"}
              className="file-input file-input-sm file-input-bordered"
              onChange={(e) => setFiles((f) => ({ ...f, [kind]: e.target.files?.[0] }))}
            />
            {kind === "ch99_headings_pdf" && (
              <span className="label-text-alt mt-1 text-base-content/60">
                The tariff-table pages for the headings the change record cites, trimmed from the Chapter 99 PDF. Can also be
                added later on the attempt page.
              </span>
            )}
            {kind === "ch99_json" && (
              <span className="label-text-alt mt-1 text-base-content/60">
                Leave empty: if this is the current revision, USITC&apos;s export is saved automatically. Older revisions
                can&apos;t be exported.
              </span>
            )}
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="btn btn-primary btn-sm" disabled={!ready || !!busy} onClick={upload}>
          {busy === "upload" && <span className="loading loading-spinner loading-xs" />}
          Upload{name ? ` ${name}` : ""}
        </button>
        {!ready && <span className="text-sm text-base-content/60">{problems.join(". ")}.</span>}
      </div>
    </section>
  )
}

function CompareCard({
  data,
  busy,
  run,
  onStarted,
}: {
  data: Overview
  busy: string | null
  run: (label: string, fn: () => Promise<unknown>, success?: string) => Promise<void>
  onStarted: (comparisonId: string) => void
}) {
  // Revisions whose active attempt is parsed, oldest first
  const ready = data.revisions
    .filter((r) => {
      const attempt = data.attempts.find((a) => a.id === r.active_attempt_id)
      return attempt?.status === "parsed"
    })
    .sort((a, b) => revisionOrder(a.name) - revisionOrder(b.name) || a.name.localeCompare(b.name))

  const [toId, setToId] = useState("")
  const [fromId, setFromId] = useState("")
  useEffect(() => {
    if (ready.length >= 2 && !toId) {
      setToId(ready[ready.length - 1].id)
      setFromId(ready[ready.length - 2].id)
    }
  }, [ready, toId])

  const from = ready.find((r) => r.id === fromId)
  const to = ready.find((r) => r.id === toId)
  const fromIndex = from ? revisionOrder(from.name) : -1
  const toIndex = to ? revisionOrder(to.name) : -1
  const known = fromIndex !== Number.MAX_SAFE_INTEGER && toIndex !== Number.MAX_SAFE_INTEGER
  const consecutive = known && toIndex === fromIndex + 1
  const backwards = known && toIndex <= fromIndex

  const start = () =>
    run("compare", async () => {
      const { comparisonId } = await api<{ comparisonId: string }>("/comparisons", {
        method: "POST",
        body: JSON.stringify({ fromAttemptId: from!.active_attempt_id, toAttemptId: to!.active_attempt_id }),
      })
      onStarted(comparisonId)
    })

  return (
    <section className="rounded-lg border border-base-300 p-4">
      <h2 className="mb-1 text-xl font-semibold">Compare revisions</h2>
      <p className="mb-3 text-sm text-base-content/70">
        Uses each revision&apos;s active attempt. Claude reads the newer revision&apos;s change record first (once per attempt),
        then the notes and headings are diffed.
      </p>
      {ready.length < 2 ? (
        <p className="text-sm text-base-content/60">Parse at least two revisions to compare them.</p>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <label className="form-control">
            <span className="label-text mb-1">From (older)</span>
            <select className="select select-sm select-bordered font-mono" value={fromId} onChange={(e) => setFromId(e.target.value)}>
              {ready.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text mb-1">To (newer)</span>
            <select className="select select-sm select-bordered font-mono" value={toId} onChange={(e) => setToId(e.target.value)}>
              {ready.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-primary btn-sm" disabled={!from || !to || from.id === to.id || !!busy} onClick={start}>
            {busy === "compare" && <span className="loading loading-spinner loading-xs" />}
            Compare
          </button>
          {from && to && backwards && <p className="w-full text-sm text-error">&quot;To&quot; should be the newer revision.</p>}
          {from && to && known && !consecutive && !backwards && (
            <p className="w-full text-sm text-warning">
              These revisions aren&apos;t consecutive. {to.name}&apos;s change record only covers changes since the revision just
              before it, so differences from the revisions in between will show as &quot;not in the change record&quot;.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
