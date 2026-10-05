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
import { hasParseResults } from "@/libs/hts-revision-diff/types"
import { api, BUSY_STATUSES, formatBytes, formatTime, StatusBadge, statusTone } from "./shared"
import {
  btn,
  Callout,
  Dot,
  EmptyState,
  Field,
  Help,
  inputCls,
  Modal,
  PageHeader,
  PageSpinner,
  Panel,
  Pill,
  ProgressBar,
  selectCls,
  Spinner,
  StatusDot,
} from "./ui"

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

// Newest first: by the known revision order, then by name with numbers
// compared as numbers ("Rev11" after "Rev9"). Unknown names count as newest.
const newestRevisionFirst = (a: { name: string }, b: { name: string }) =>
  revisionOrder(b.name) - revisionOrder(a.name) ||
  b.name.localeCompare(a.name, undefined, { numeric: true })

export default function RevisionCheckerHome() {
  const router = useRouter()
  const [data, setData] = useState<Overview | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [modal, setModal] = useState<"upload" | "compare" | null>(null)

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
      await Promise.all(activeAttempts.map((a) => api(`/attempts/${a.id}`).catch((): null => null)))
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

  if (!data) return <PageSpinner />

  const attemptsByRevision = (revisionId: string) =>
    data.attempts.filter((a) => a.revision_id === revisionId)
  const docsByAttempt = (attemptId: string) =>
    DOCUMENT_KINDS.map((kind) => data.documents.find((d) => d.attempt_id === attemptId && d.kind === kind)).filter(
      Boolean
    ) as DocumentRow[]
  const revisionName = (attemptId: string) => {
    const attempt = data.attempts.find((a) => a.id === attemptId)
    const revision = data.revisions.find((r) => r.id === attempt?.revision_id)
    return revision ? { name: revision.name, attempt: attempt?.attempt_number } : null
  }
  const comparable = parsedRevisions(data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        meta="Upload HTS revisions, compare them, and review what changed in Chapter 99."
        actions={
          <>
            <button
              className={btn.secondary}
              disabled={comparable.length < 2}
              title={comparable.length < 2 ? "Parse at least two revisions to compare them" : undefined}
              onClick={() => setModal("compare")}
            >
              New comparison
            </button>
            <button className={btn.primary} onClick={() => setModal("upload")}>
              Upload revision
            </button>
          </>
        }
      >
        <Help>
          <ol className="ml-4 list-decimal space-y-1">
            <li>Upload a revision&apos;s change record and Chapter 99 PDFs.</li>
            <li>Convert them with datalab, then they&apos;re parsed into notes and headings automatically.</li>
            <li>Compare it to an earlier revision. Claude reads the newer revision&apos;s change record first (once per attempt).</li>
            <li>Review every change: approve, defer or skip, with notes for Claude Code.</li>
            <li>
              When every change has a decision, write the review into the repo:{" "}
              <code className="rounded bg-base-content/[0.06] px-1 font-mono text-xs">npm run pull-revision -- &lt;revision&gt;</code>
            </li>
          </ol>
        </Help>
      </PageHeader>

      <Panel title="Comparisons" count={data.comparisons.length}>
        {data.comparisons.length === 0 ? (
          <EmptyState title="No comparisons yet">
            {comparable.length < 2 ? "Upload and parse two revisions, then compare them." : "Start one with “New comparison”."}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-content/10 text-left text-xs font-medium text-base-content/50">
                  <th className="px-4 py-2 font-medium">Comparison</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="w-56 px-4 py-2 font-medium">Reviewed</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-base-content/[0.07]">
                {data.comparisons.map((c) => {
                  const p = data.progress[c.id]
                  const from = revisionName(c.from_attempt_id)
                  const to = revisionName(c.to_attempt_id)
                  const href = `/revision-checker/comparisons/${c.id}`
                  return (
                    <tr
                      key={c.id}
                      className="group cursor-pointer transition-colors hover:bg-base-content/[0.025]"
                      onClick={() => router.push(href)}
                    >
                      <td className="px-4 py-3">
                        <Link href={href} className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="font-mono text-[13px] font-medium">
                            {from?.name ?? "?"} <span className="text-base-content/35">→</span> {to?.name ?? "?"}
                          </span>
                          {c.stats?.consecutive === false && <Pill tone="warning">Not consecutive</Pill>}
                        </Link>
                        <div className="mt-0.5 text-xs text-base-content/45">
                          Attempts #{from?.attempt ?? "?"} → #{to?.attempt ?? "?"}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="pt-0.5">
                          <StatusBadge status={c.status} />
                        </div>
                        {c.error && <div className="mt-1 max-w-xs truncate text-xs text-error" title={c.error}>{c.error}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {p ? (
                          <div className="flex items-center gap-3">
                            <ProgressBar value={p.decided} max={p.total} className="flex-1" />
                            <span className="w-16 text-right text-xs tabular-nums text-base-content/60">
                              {p.decided} / {p.total}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base-content/30">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-base-content/55">{formatTime(c.created_at)}</td>
                      <td className="pr-4 text-base-content/30 group-hover:text-base-content/70">→</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Revisions" count={data.revisions.length}>
        {data.revisions.length === 0 && <EmptyState title="No revisions uploaded yet">Start with “Upload revision”.</EmptyState>}
        <div className="divide-y divide-base-content/10">
          {[...data.revisions].sort(newestRevisionFirst).map((revision) => {
            // The documents' titles name a different revision than this one
            const active = data.attempts.find((a) => a.id === revision.active_attempt_id) ?? attemptsByRevision(revision.id)[0]
            const detected = active?.parse_stats?.detectedRevision
            const named = detected?.ch99Pdf ?? detected?.changeRecord
            const misnamed = named && named !== revision.name ? named : null
            const attempts = attemptsByRevision(revision.id)
            return (
              <div key={revision.id} className="px-4 py-4">
                <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-mono text-sm font-semibold">{revision.name}</h3>
                  {revision.title && <span className="text-sm text-base-content/55">{revision.title}</span>}
                  <span className="ml-auto text-xs text-base-content/40">
                    {attempts.length} attempt{attempts.length === 1 ? "" : "s"}
                  </span>
                </div>
                {misnamed && (
                  <div className="mb-3">
                    <Callout
                      tone="error"
                      title="Revision name doesn't match its documents"
                      action={
                        <button
                          className={btn.xsSecondary}
                          disabled={!!busy}
                          onClick={() =>
                            run(
                              `rename-${revision.id}`,
                              () => api(`/revisions/${revision.id}/rename`, { method: "POST", body: JSON.stringify({ name: misnamed }) }),
                              `Renamed to ${misnamed}. Re-run any comparisons that used the old name.`
                            )
                          }
                        >
                          {busy === `rename-${revision.id}` && <Spinner />}
                          Rename to {misnamed}
                        </button>
                      }
                    >
                      Named <b className="font-mono">{revision.name}</b>, but its documents say{" "}
                      <b className="font-mono">{misnamed}</b>. Comparisons are blocked until it&apos;s renamed.
                    </Callout>
                  </div>
                )}
                <div className="overflow-hidden rounded-md border border-base-content/10">
                  {attempts.map((attempt, i) => (
                    <AttemptRowView
                      key={attempt.id}
                      attempt={attempt}
                      docs={docsByAttempt(attempt.id)}
                      isActive={revision.active_attempt_id === attempt.id}
                      first={i === 0}
                      busy={busy}
                      run={run}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      <UploadModal open={modal === "upload"} onClose={() => setModal(null)} busy={busy} run={run} />
      <CompareModal
        open={modal === "compare"}
        onClose={() => setModal(null)}
        ready={comparable}
        busy={busy}
        run={run}
        onStarted={(id) => router.push(`/revision-checker/comparisons/${id}`)}
      />
    </div>
  )
}

const SHORT_DOC_LABELS: Record<DocumentKind, string> = {
  change_record: "Change record",
  ch99_pdf: "Ch. 99 notes",
  ch99_headings_pdf: "Heading pages",
  ch99_json: "Ch. 99 JSON",
}

type StepState = "done" | "busy" | "todo" | "failed"

// Where an attempt is in upload → convert → parse
const pipeline = (attempt: AttemptRow, docs: DocumentRow[]): { label: string; state: StepState }[] => {
  const conversionFailed = docs.some((d) => d.conversion_status === "failed")
  const s = attempt.status
  const convert: StepState =
    s === "converting" ? "busy" : ["converted", "parsing", "parsed"].includes(s) ? "done" : s === "failed" && conversionFailed ? "failed" : s === "failed" ? "done" : "todo"
  const parse: StepState = s === "parsing" ? "busy" : s === "parsed" ? "done" : s === "failed" && !conversionFailed ? "failed" : "todo"
  return [
    { label: "Uploaded", state: "done" },
    { label: stepLabel(convert, { busy: "Converting", failed: "Conversion failed", other: "Converted" }), state: convert },
    { label: stepLabel(parse, { busy: "Parsing", failed: "Parse failed", other: "Parsed" }), state: parse },
  ]
}

// "Converting" while it runs, "Converted" when done (and, greyed out, before it starts)
const stepLabel = (state: StepState, labels: { busy: string; failed: string; other: string }) =>
  state === "busy" ? labels.busy : state === "failed" ? labels.failed : labels.other

const StepIcon = ({ state }: { state: StepState }) =>
  state === "busy" ? (
    <span className="loading loading-spinner h-3.5 w-3.5 text-info" />
  ) : (
    <span
      className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold leading-none ${
        state === "done"
          ? "bg-success text-success-content"
          : state === "failed"
            ? "bg-error text-error-content"
            : "border border-base-content/25"
      }`}
    >
      {state === "done" ? "✓" : state === "failed" ? "!" : ""}
    </span>
  )

function AttemptRowView({
  attempt,
  docs,
  isActive,
  first,
  busy,
  run,
}: {
  attempt: AttemptRow
  docs: DocumentRow[]
  isActive: boolean
  first: boolean
  busy: string | null
  run: (label: string, fn: () => Promise<unknown>, success?: string) => Promise<void>
}) {
  const canConvert =
    ["uploaded", "failed", "converting"].includes(attempt.status) &&
    docs.some((d) => d.conversion_status === "pending" || d.conversion_status === "failed")
  const canParse =
    ["parsed", "failed", "converted"].includes(attempt.status) &&
    docs.every((d) => d.conversion_status === "complete" || d.conversion_status === "not_needed")
  const stats = hasParseResults(attempt.parse_stats) ? attempt.parse_stats : null
  const docErrors = docs.filter((d) => d.error)

  return (
    <div className={`flex flex-col gap-2.5 px-3.5 py-3 ${first ? "" : "border-t border-base-content/10"} ${isActive ? "bg-base-100" : "bg-base-content/[0.015]"}`}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex w-40 items-center gap-2">
          <span className={`text-sm font-medium ${isActive ? "" : "text-base-content/60"}`}>Attempt {attempt.attempt_number}</span>
          {isActive && <Pill tone="info">Active</Pill>}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {pipeline(attempt, docs).map((step, i) => (
            <span key={step.label} className="flex items-center gap-1.5">
              {i > 0 && <span className="h-px w-4 bg-base-content/15" />}
              <StepIcon state={step.state} />
              <span className={step.state === "todo" ? "text-base-content/40" : step.state === "failed" ? "text-error" : "text-base-content/75"}>
                {step.label}
              </span>
            </span>
          ))}
        </div>
        <span className="text-xs text-base-content/40">{formatTime(attempt.created_at)}</span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {canConvert && (
            <button
              className={btn.xsPrimary}
              disabled={!!busy}
              onClick={() => run(`convert-${attempt.id}`, () => api(`/attempts/${attempt.id}/convert`, { method: "POST" }), "Sent to datalab")}
            >
              {busy === `convert-${attempt.id}` && <Spinner />}
              {docs.some((d) => d.conversion_status === "failed") ? "Retry conversion" : "Convert with datalab"}
            </button>
          )}
          {attempt.status === "parsed" && !isActive && (
            <button
              className={btn.xsSecondary}
              disabled={!!busy}
              onClick={() => run(`activate-${attempt.id}`, () => api(`/attempts/${attempt.id}/activate`, { method: "POST" }))}
            >
              {busy === `activate-${attempt.id}` && <Spinner />}
              Make active
            </button>
          )}
          {canParse && (
            <button
              className={btn.xsGhost}
              disabled={!!busy}
              onClick={() => run(`parse-${attempt.id}`, () => api(`/attempts/${attempt.id}/parse`, { method: "POST" }), "Parsed")}
            >
              {busy === `parse-${attempt.id}` && <Spinner />}
              Re-parse
            </button>
          )}
          <Link className={btn.xsSecondary} href={`/revision-checker/attempts/${attempt.id}`}>
            Inspect →
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pl-0 text-xs sm:pl-[11.25rem]">
        {docs.map((doc) => (
          <span
            key={doc.id}
            title={[doc.original_filename, formatBytes(doc.size_bytes), doc.page_count ? `${doc.page_count} pages` : ""].filter(Boolean).join(" · ")}
          >
            <StatusDot
              tone={statusTone(doc.conversion_status)}
              busy={doc.conversion_status === "processing"}
              label={<span className="font-normal text-base-content/60">{SHORT_DOC_LABELS[doc.kind]}</span>}
            />
          </span>
        ))}
        {stats && (
          <span className="flex flex-wrap items-center gap-x-1.5 text-base-content/45">
            <span className="mx-1 hidden h-3 w-px bg-base-content/15 sm:inline-block" />
            {stats.topLevelNotes} notes <Dot /> {stats.nodes.toLocaleString()} subdivisions <Dot /> {stats.subchapters.length} subchapters <Dot />{" "}
            {stats.htsRows ? `${stats.htsRowsWithCode} JSON headings` : "no JSON"} <Dot />
            <span className={stats.warnings ? "font-medium text-warning" : ""}>
              {stats.warnings} warning{stats.warnings === 1 ? "" : "s"}
            </span>
          </span>
        )}
      </div>

      {(docErrors.length > 0 || attempt.error) && (
        <Callout tone="error">
          {docErrors.map((d) => (
            <div key={d.id}>
              <span className="font-medium">{d.original_filename}:</span> {d.error}
            </div>
          ))}
          {attempt.error && !docErrors.length && <div className="whitespace-pre-wrap">{attempt.error}</div>}
        </Callout>
      )}
    </div>
  )
}

// "2026htsrev5", "2026 HTS Rev 5" -> "2026HTSRev5"; null if it isn't a revision name
const normalizeRevisionName = (input: string) => {
  const m = input.replace(/\s+/g, "").match(/^(\d{4})hts(basic|rev(\d+))$/i)
  if (!m) return null
  return `${m[1]}HTS${m[3] ? `Rev${Number(m[3])}` : "Basic"}`
}

type Run = (label: string, fn: () => Promise<unknown>, success?: string) => Promise<void>

function UploadModal({ open, onClose, busy, run }: { open: boolean; onClose: () => void; busy: string | null; run: Run }) {
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
      setRawName("")
      setFormKey((k) => k + 1)
      onClose()
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

  const hints: Partial<Record<DocumentKind, string>> = {
    ch99_headings_pdf:
      "The tariff-table pages for the headings the change record cites, trimmed from the Chapter 99 PDF. Can also be added later on the attempt page.",
    ch99_json: "Leave empty: if this is the current revision, USITC's export is saved automatically. Older revisions can't be exported.",
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload a revision"
      description="Uploading a revision that already exists creates a new attempt."
      footer={
        <>
          {!ready && <span className="mr-auto text-xs text-base-content/50">{problems.join(". ")}.</span>}
          <button className={btn.ghost} onClick={onClose}>
            Cancel
          </button>
          <button className={btn.primary} disabled={!ready || !!busy} onClick={upload}>
            {busy === "upload" && <Spinner />}
            Upload{name ? ` ${name}` : ""}
          </button>
        </>
      }
    >
      <div key={formKey} className="flex flex-col gap-4">
        <Field
          label="Revision name"
          hint={
            known
              ? `${known.title}, in effect from ${known.from}. Check the year: the documents' titles are compared with this name after conversion.`
              : "USITC name, e.g. 2026HTSRev5."
          }
        >
          <input
            className={`${inputCls} font-mono`}
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
        </Field>
        <div className="flex flex-col gap-4 border-t border-base-content/10 pt-4">
          {DOCUMENT_KINDS.map((kind) => (
            <Field
              key={kind}
              label={
                <>
                  {DOCUMENT_LABELS[kind]}
                  {!REQUIRED_DOCUMENT_KINDS.includes(kind) && <span className="ml-1 font-normal text-base-content/40">optional</span>}
                </>
              }
              hint={hints[kind]}
            >
              <input
                type="file"
                accept={kind === "ch99_json" ? ".json,application/json" : ".pdf,application/pdf"}
                className="file-input file:normal-case file:font-medium file-input-sm file-input-bordered w-full border-base-content/15"
                onChange={(e) => setFiles((f) => ({ ...f, [kind]: e.target.files?.[0] }))}
              />
            </Field>
          ))}
        </div>
      </div>
    </Modal>
  )
}

// Revisions whose active attempt is parsed, oldest first
const parsedRevisions = (data: Overview) =>
  data.revisions
    .filter((r) => data.attempts.find((a) => a.id === r.active_attempt_id)?.status === "parsed")
    .sort((a, b) => revisionOrder(a.name) - revisionOrder(b.name) || a.name.localeCompare(b.name))

function CompareModal({
  open,
  onClose,
  ready,
  busy,
  run,
  onStarted,
}: {
  open: boolean
  onClose: () => void
  ready: RevisionRow[]
  busy: string | null
  run: Run
  onStarted: (comparisonId: string) => void
}) {
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

  const select = (value: string, onChange: (id: string) => void) => (
    <select className={`${selectCls} w-full font-mono`} value={value} onChange={(e) => onChange(e.target.value)}>
      {ready.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New comparison"
      description="Uses each revision's active attempt."
      footer={
        <>
          <button className={btn.ghost} onClick={onClose}>
            Cancel
          </button>
          <button className={btn.primary} disabled={!from || !to || from.id === to.id || backwards || !!busy} onClick={start}>
            {busy === "compare" && <Spinner />}
            Compare
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <Field label="From (older)">{select(fromId, setFromId)}</Field>
          <span className="pb-1.5 text-base-content/40">→</span>
          <Field label="To (newer)">{select(toId, setToId)}</Field>
        </div>
        {from && to && backwards && <Callout tone="error">“To” should be the newer revision.</Callout>}
        {from && to && known && !consecutive && !backwards && (
          <Callout tone="warning" title="These revisions aren't consecutive">
            {to.name}&apos;s change record only covers changes since the revision just before it, so differences from the
            revisions in between will show as “not in the change record”.
          </Callout>
        )}
        <Help>
          Claude reads the newer revision&apos;s change record first (once per attempt, which can take a few minutes), then the
          notes and headings are diffed.
        </Help>
      </div>
    </Modal>
  )
}
