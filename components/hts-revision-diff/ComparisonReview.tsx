"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import type {
  Category,
  ChangeRow,
  ChangeSource,
  CodeDiff,
  ComparisonRow,
  Decision,
  NoteDiff,
  RevisionRow,
} from "@/libs/hts-revision-diff/types"
import { api, BUSY_STATUSES, StatusBadge, TextBlock, WordDiffView } from "./shared"

interface ComparisonData {
  comparison: ComparisonRow
  changes: ChangeRow[]
  from: { revision: RevisionRow; attemptNumber: number }
  to: { revision: RevisionRow; attemptNumber: number; changeRecordModel: string | null }
}

const SOURCE_LABELS: Record<ChangeSource, string> = {
  change_record: "In change record",
  not_in_change_record: "Not in change record",
  change_record_no_diff: "Change record, no difference found",
}
const SOURCE_STYLES: Record<ChangeSource, string> = {
  change_record: "badge-info",
  not_in_change_record: "badge-warning",
  change_record_no_diff: "badge-error",
}
const DECISIONS: { value: Decision; label: string; style: string }[] = [
  { value: "approve", label: "Approve", style: "btn-success" },
  { value: "defer", label: "Defer", style: "btn-warning" },
  { value: "skip", label: "Skip", style: "btn-neutral" },
]
const SUMMARY_CONCURRENCY = 3

export default function ComparisonReview({ comparisonId }: { comparisonId: string }) {
  const router = useRouter()
  const [data, setData] = useState<ComparisonData | null>(null)
  const [sourceFilter, setSourceFilter] = useState<ChangeSource | "all">("all")
  const [decisionFilter, setDecisionFilter] = useState<Decision | "all">("all")
  const [search, setSearch] = useState("")
  const [summarizing, setSummarizing] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    try {
      setData(await api<ComparisonData>(`/comparisons/${comparisonId}`))
    } catch (error) {
      toast.error((error as Error).message)
    }
  }, [comparisonId])

  useEffect(() => {
    load()
  }, [load])

  const running = data && (data.comparison.status === "pending" || BUSY_STATUSES.includes(data.comparison.status))
  useEffect(() => {
    if (!running) return
    const timer = setTimeout(load, 3000)
    return () => clearTimeout(timer)
  }, [running, data, load])

  const replaceChange = (change: ChangeRow) =>
    setData((d) => (d ? { ...d, changes: d.changes.map((c) => (c.id === change.id ? change : c)) } : d))

  const save = async (change: ChangeRow, values: Partial<Pick<ChangeRow, "decision" | "category" | "reviewer_notes">>) => {
    try {
      const { change: updated } = await api<{ change: ChangeRow }>(`/changes/${change.id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      })
      replaceChange(updated)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const summarize = async (change: ChangeRow) => {
    setSummarizing((s) => new Set(s).add(change.id))
    try {
      const { change: updated } = await api<{ change: ChangeRow }>(`/changes/${change.id}/summarize`, { method: "POST" })
      replaceChange(updated)
    } catch (error) {
      toast.error(`${change.title.slice(0, 60)}: ${(error as Error).message}`)
      await load()
    } finally {
      setSummarizing((s) => {
        const next = new Set(s)
        next.delete(change.id)
        return next
      })
    }
  }

  const summarizeAll = async () => {
    const queue = (data?.changes ?? []).filter((c) => !c.summary && !summarizing.has(c.id))
    const worker = async () => {
      for (let next = queue.shift(); next; next = queue.shift()) await summarize(next)
    }
    await Promise.all(Array.from({ length: SUMMARY_CONCURRENCY }, worker))
  }

  const rerun = async () => {
    try {
      const { comparisonId: id } = await api<{ comparisonId: string }>(`/comparisons/${comparisonId}/rerun`, { method: "POST" })
      toast.success("Started a new comparison. Reviews of unchanged changes carry over.")
      router.push(`/revision-checker/comparisons/${id}`)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (data?.changes ?? []).filter(
      (c) =>
        (sourceFilter === "all" || c.source === sourceFilter) &&
        (decisionFilter === "all" || c.decision === decisionFilter) &&
        (!term || c.title.toLowerCase().includes(term) || JSON.stringify(c.payload).toLowerCase().includes(term))
    )
  }, [data, sourceFilter, decisionFilter, search])

  if (!data) {
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  const { comparison, changes, from, to } = data
  const stats = comparison.stats
  const decided = changes.filter((c) => c.decision !== "pending").length
  const unsummarized = changes.filter((c) => !c.summary).length
  const allDecided = changes.length > 0 && decided === changes.length

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div>
        <Link href="/revision-checker" className="link text-sm">
          ← Revision checker
        </Link>
        <h1 className="mt-2 font-mono text-2xl font-bold">
          {from.revision.name} → {to.revision.name}
        </h1>
        <p className="text-sm text-base-content/60">
          Attempts #{from.attemptNumber} → #{to.attemptNumber}
          {to.changeRecordModel ? ` · change record read by ${to.changeRecordModel}` : ""}
        </p>
      </div>

      {running && (
        <div className="alert">
          <span className="loading loading-spinner" />
          <span>
            {comparison.status === "extracting_change_record"
              ? "Claude is reading the change record (this can take a few minutes)…"
              : comparison.status === "diffing"
                ? "Diffing notes and headings…"
                : "Starting…"}
          </span>
        </div>
      )}
      {comparison.status === "failed" && (
        <div className="alert alert-error flex flex-col items-start">
          <span className="font-semibold">Comparison failed</span>
          <span className="whitespace-pre-wrap text-sm">{comparison.error}</span>
          <button className="btn btn-sm" onClick={rerun}>
            Try again
          </button>
        </div>
      )}

      {comparison.status === "ready" && stats && (
        <>
          {stats.consecutive === false && (
            <div className="alert alert-warning text-sm">
              These revisions aren&apos;t consecutive, so the change record doesn&apos;t cover everything in between.
            </div>
          )}
          <div className="stats stats-vertical w-full border border-base-300 md:stats-horizontal">
            <div className="stat">
              <div className="stat-title">Reviewed</div>
              <div className="stat-value text-2xl">
                {decided} / {changes.length}
              </div>
              <progress className="progress progress-primary w-full" value={decided} max={changes.length || 1} />
            </div>
            <div className="stat">
              <div className="stat-title">Change record items</div>
              <div className="stat-value text-2xl">{stats.changeRecordItemsInCh99}</div>
              <div className="stat-desc">chapter 99 of {stats.changeRecordItems} read</div>
            </div>
            <div className="stat">
              <div className="stat-title">Note differences</div>
              <div className="stat-value text-2xl">
                {Object.values(stats.noteDiffs).reduce((a, b) => a + b, 0)}
              </div>
              <div className="stat-desc">
                {stats.noteDiffs.modified} changed · {stats.noteDiffs.added} added · {stats.noteDiffs.removed} removed ·{" "}
                {stats.noteDiffs.renumbered} renumbered
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Heading differences</div>
              {stats.headingDiff === "change_record_only" ? (
                <>
                  <div className="stat-value text-lg">From change record</div>
                  <div className="stat-desc whitespace-normal">
                    {stats.headingSource === "revision_json"
                      ? `Cited headings checked against ${to.revision.name}'s JSON`
                      : `No JSON for ${to.revision.name}; check cited headings in the PDF`}
                  </div>
                </>
              ) : (
                <>
                  <div className="stat-value text-2xl">{Object.values(stats.codeDiffs).reduce((a, b) => a + b, 0)}</div>
                  <div className="stat-desc">
                    {stats.codeDiffs.modified} changed · {stats.codeDiffs.added} added · {stats.codeDiffs.removed} removed
                  </div>
                </>
              )}
            </div>
          </div>

          {stats.carriedOverReviews > 0 && (
            <p className="text-sm text-base-content/60">
              {stats.carriedOverReviews} reviews carried over from the previous comparison of these revisions.
            </p>
          )}

          {allDecided ? (
            <div className="alert alert-success flex flex-col items-start gap-1">
              <span className="font-semibold">Every change has a decision.</span>
              <span className="text-sm">Write the review into the repo for Claude Code:</span>
              <code className="rounded bg-base-100 px-2 py-1 text-sm">npm run pull-revision -- {to.revision.name}</code>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <select className="select select-sm select-bordered" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)}>
              <option value="all">All sources ({changes.length})</option>
              {(Object.keys(SOURCE_LABELS) as ChangeSource[]).map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]} ({changes.filter((c) => c.source === s).length})
                </option>
              ))}
            </select>
            <select className="select select-sm select-bordered" value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value as any)}>
              <option value="all">All decisions</option>
              {(["pending", "approve", "defer", "skip"] as Decision[]).map((d) => (
                <option key={d} value={d}>
                  {d} ({changes.filter((c) => c.decision === d).length})
                </option>
              ))}
            </select>
            <input
              className="input input-sm input-bordered w-56"
              placeholder="Search text, notes, codes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="ml-auto flex gap-2">
              <button className="btn btn-sm" onClick={() => setOpen(new Set(open.size ? [] : visible.map((c) => c.id)))}>
                {open.size ? "Collapse all" : "Expand all"}
              </button>
              <button className="btn btn-primary btn-sm" disabled={!unsummarized || summarizing.size > 0} onClick={summarizeAll}>
                {summarizing.size > 0 && <span className="loading loading-spinner loading-xs" />}
                Summarize {unsummarized ? `all ${unsummarized}` : "all"} with Claude
              </button>
              <button className="btn btn-sm" onClick={rerun} title="After re-parsing or re-reading the change record">
                Re-run
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {visible.map((change) => (
              <ChangeCard
                key={change.id}
                change={change}
                fromName={from.revision.name}
                toName={to.revision.name}
                isOpen={open.has(change.id)}
                toggle={() =>
                  setOpen((o) => {
                    const next = new Set(o)
                    if (next.has(change.id)) next.delete(change.id)
                    else next.add(change.id)
                    return next
                  })
                }
                summarizing={summarizing.has(change.id)}
                onSummarize={() => summarize(change)}
                onSave={(values) => save(change, values)}
              />
            ))}
            {!visible.length && <p className="text-base-content/60">No changes match.</p>}
          </div>
        </>
      )}
    </div>
  )
}

function ChangeCard({
  change,
  fromName,
  toName,
  isOpen,
  toggle,
  summarizing,
  onSummarize,
  onSave,
}: {
  change: ChangeRow
  fromName: string
  toName: string
  isOpen: boolean
  toggle: () => void
  summarizing: boolean
  onSummarize: () => void
  onSave: (values: Partial<Pick<ChangeRow, "decision" | "category" | "reviewer_notes">>) => void
}) {
  const [notes, setNotes] = useState(change.reviewer_notes ?? "")
  useEffect(() => setNotes(change.reviewer_notes ?? ""), [change.reviewer_notes])
  const { payload, summary } = change

  return (
    <div className={`rounded-lg border ${change.decision === "pending" ? "border-base-300" : "border-base-200 opacity-90"}`}>
      <button className="flex w-full flex-wrap items-center gap-2 p-3 text-left" onClick={toggle}>
        <span className="text-base-content/50">{isOpen ? "▾" : "▸"}</span>
        <span className="min-w-0 flex-1 font-medium">{change.title}</span>
        <span className={`badge badge-sm ${SOURCE_STYLES[change.source]}`}>{SOURCE_LABELS[change.source]}</span>
        {change.category && <span className="badge badge-outline badge-sm">{change.category}</span>}
        <span className="text-xs text-base-content/60">
          {payload.noteDiffs.length} note · {payload.codeDiffs.length || payload.citedHeadings?.length || 0} heading
        </span>
        <StatusBadge status={change.decision} />
      </button>
      {summary && !isOpen && <p className="px-9 pb-3 text-sm text-base-content/70">{summary.headline}</p>}

      {isOpen && (
        <div className="flex flex-col gap-4 border-t border-base-300 p-4">
          {payload.warnings.map((w, i) => (
            <div key={i} className="alert alert-warning py-2 text-sm">
              {w}
            </div>
          ))}

          {payload.changeRecordItems.map((item) => (
            <div key={item.id} className="rounded-md bg-info/10 p-3 text-sm">
              <div className="mb-1 font-semibold">
                Change record {item.id} · {item.action}
                {item.effective_date ? ` · effective ${item.effective_date}` : ""}
              </div>
              <p className="whitespace-pre-wrap">{item.source_text}</p>
              {item.authority && <p className="mt-1 text-xs text-base-content/60">Authority: {item.authority}</p>}
            </div>
          ))}

          <SummaryBlock change={change} summarizing={summarizing} onSummarize={onSummarize} />

          {payload.noteDiffs.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold">Note differences</h4>
              {payload.noteDiffs.map((d) => (
                <NoteDiffView key={`${d.fromKey}-${d.toKey}`} diff={d} fromName={fromName} toName={toName} />
              ))}
            </div>
          )}

          {(payload.citedHeadings?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Headings cited by the change record ({toName})</h4>
              {payload.citedHeadings!.map((c) => (
                <div key={c.code} className="rounded-md border border-base-300 p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold">{c.code}</span>
                    <StatusBadge
                      status={c.status === "found" ? "complete" : c.status === "not_found" ? "failed" : "pending"}
                      label={c.status === "found" ? "found" : c.status === "not_found" ? "not in JSON" : "not checked"}
                    />
                    {c.row && <span className="text-base-content/70">{c.row.description}</span>}
                  </div>
                  {c.row && (
                    <p className="mt-1 text-xs text-base-content/70">
                      General: {c.row.general || "—"} · Special: {c.row.special || "—"} · Other: {c.row.other || "—"}
                      {c.row.footnotes.length > 0 && ` · Footnotes: ${c.row.footnotes.join(" | ")}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {payload.codeDiffs.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold">Heading differences (Chapter 99 JSON)</h4>
              {payload.codeDiffs.map((d) => (
                <CodeDiffView key={d.key} diff={d} />
              ))}
            </div>
          )}

          {payload.context.length > 0 && (
            <details className="rounded-md bg-base-200 p-3">
              <summary className="cursor-pointer text-sm font-semibold">Context ({payload.context.length})</summary>
              <div className="mt-3 flex flex-col gap-3">
                {payload.context.map((c) => (
                  <div key={`${c.revision}-${c.key}`}>
                    <p className="mb-1 text-xs text-base-content/70">
                      <span className="font-semibold">{c.label}</span> · {c.revision === "to" ? toName : fromName} · {c.reason}
                    </p>
                    <TextBlock text={c.text} />
                  </div>
                ))}
              </div>
            </details>
          )}

          <div className="flex flex-col gap-3 rounded-md border border-base-300 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">Decision</span>
              {DECISIONS.map((d) => (
                <button
                  key={d.value}
                  className={`btn btn-xs ${change.decision === d.value ? d.style : "btn-outline"}`}
                  onClick={() => onSave({ decision: change.decision === d.value ? "pending" : d.value })}
                >
                  {d.label}
                </button>
              ))}
              <span className="ml-4 text-sm font-semibold">Category</span>
              <select
                className="select select-bordered select-xs"
                value={change.category ?? ""}
                onChange={(e) => onSave({ category: (e.target.value || null) as Category | null })}
              >
                <option value="">not set</option>
                <option value="data">data</option>
                <option value="logic">logic</option>
                <option value="mixed">mixed</option>
                <option value="none">none (noise)</option>
              </select>
            </div>
            <textarea
              className="textarea textarea-bordered text-sm"
              rows={3}
              placeholder="Your interpretation and instructions for Claude Code (saved when you click away)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => notes !== (change.reviewer_notes ?? "") && onSave({ reviewer_notes: notes })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryBlock({
  change,
  summarizing,
  onSummarize,
}: {
  change: ChangeRow
  summarizing: boolean
  onSummarize: () => void
}) {
  const { summary } = change
  const button = (
    <button className="btn btn-xs" disabled={summarizing} onClick={onSummarize}>
      {summarizing && <span className="loading loading-spinner loading-xs" />}
      {summary ? "Re-summarize" : "Summarize with Claude"}
    </button>
  )
  if (!summary) {
    return (
      <div className="flex items-center gap-3">
        {button}
        {change.summary_error && <span className="text-sm text-error">{change.summary_error}</span>}
      </div>
    )
  }
  const unverified = summary.what_changed.filter((c) => c.verified === false).length
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
      <div className="mb-2 flex items-start gap-2">
        <p className="flex-1 font-semibold">{summary.headline}</p>
        {button}
      </div>
      <p className="mb-2">{summary.summary}</p>
      <p className="mb-2 text-base-content/70">
        Suggested category: <span className="font-semibold">{summary.category}</span>. {summary.category_reason}
      </p>
      {summary.what_changed.length > 0 && (
        <ul className="mb-2 flex flex-col gap-2">
          {summary.what_changed.map((c, i) => (
            <li key={i}>
              <span>{c.statement}</span> <span className="font-mono text-xs text-base-content/60">{c.citation}</span>
              {c.verified === false && <span className="badge badge-warning badge-xs ml-1">quote not found in source</span>}
              <blockquote className="mt-1 border-l-2 border-base-300 pl-2 text-xs text-base-content/70">{c.quote}</blockquote>
            </li>
          ))}
        </ul>
      )}
      {unverified > 0 && (
        <p className="mb-2 text-xs text-warning">
          {unverified} quote{unverified === 1 ? "" : "s"} couldn&apos;t be found in the text sent to Claude. Check those claims
          against the note text below.
        </p>
      )}
      {summary.effective_dates.length > 0 && (
        <p className="mb-1">
          <span className="font-semibold">Effective:</span>{" "}
          {summary.effective_dates.map((e) => `${e.date} (${e.applies_to})`).join("; ")}
        </p>
      )}
      {summary.affected_hts_codes.length > 0 && (
        <p className="mb-1 break-words">
          <span className="font-semibold">Codes:</span> {summary.affected_hts_codes.join(", ")}
        </p>
      )}
      <p className="mb-1">
        <span className="font-semibold">Engine impact:</span> {summary.engine_impact}
      </p>
      <p className="mb-1">
        <span className="font-semibold">Change record:</span> {summary.change_record_consistency}
      </p>
      {summary.open_questions.length > 0 && (
        <div>
          <span className="font-semibold">Open questions:</span>
          <ul className="ml-5 list-disc">
            {summary.open_questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-2 text-xs text-base-content/50">
        {change.summary_model} · {change.summary_prompt_version}
      </p>
    </div>
  )
}

function NoteDiffView({ diff, fromName, toName }: { diff: NoteDiff; fromName: string; toName: string }) {
  const [showFull, setShowFull] = useState(false)
  const pages = [diff.fromPage && `${fromName} p.${diff.fromPage}`, diff.toPage && `${toName} p.${diff.toPage}`]
    .filter(Boolean)
    .join(" · ")
  return (
    <div className="rounded-md border border-base-300 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
        <StatusBadge
          status={diff.status === "added" ? "approve" : diff.status === "removed" ? "failed" : diff.status === "renumbered" ? "pending" : "defer"}
          label={diff.status}
        />
        <span className="font-semibold">
          {diff.status === "renumbered" ? `${diff.fromLabel} → ${diff.label}` : diff.label}
        </span>
        <span className="font-mono text-xs text-base-content/50">{diff.toKey ?? diff.fromKey}</span>
        {pages && <span className="text-xs text-base-content/50">{pages}</span>}
      </div>
      {diff.status === "modified" && diff.words && (
        <>
          <WordDiffView ops={diff.words} />
          <button className="link mt-1 text-xs" onClick={() => setShowFull(!showFull)}>
            {showFull ? "Hide" : "Show"} before and after
          </button>
          {showFull && (
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <TextBlock text={diff.before ?? ""} tone="del" />
              <TextBlock text={diff.after ?? ""} tone="add" />
            </div>
          )}
        </>
      )}
      {diff.status === "added" && <TextBlock text={diff.after ?? ""} tone="add" />}
      {diff.status === "removed" && <TextBlock text={diff.before ?? ""} tone="del" />}
      {diff.status === "renumbered" && <TextBlock text={diff.after ?? ""} />}
      {(diff.codesAdded.length > 0 || diff.codesRemoved.length > 0) && (
        <div className="mt-2 flex flex-col gap-1 text-xs">
          {diff.codesAdded.length > 0 && (
            <p className="break-words">
              <span className="font-semibold text-success">+ {diff.codesAdded.length} codes:</span> {diff.codesAdded.join(", ")}
            </p>
          )}
          {diff.codesRemoved.length > 0 && (
            <p className="break-words">
              <span className="font-semibold text-error">− {diff.codesRemoved.length} codes:</span> {diff.codesRemoved.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function CodeDiffView({ diff }: { diff: CodeDiff }) {
  const row = diff.after ?? diff.before
  return (
    <div className="rounded-md border border-base-300 p-3 text-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge status={diff.status === "added" ? "approve" : diff.status === "removed" ? "failed" : "defer"} label={diff.status} />
        <span className="font-mono font-semibold">{diff.htsno || `(text row under ${row?.parentHtsno})`}</span>
        <span className="text-base-content/70">{diff.description}</span>
      </div>
      {diff.status === "modified" ? (
        <div className="flex flex-col gap-2">
          {diff.fields.map((f) => (
            <div key={f.field}>
              <span className="text-xs font-semibold uppercase text-base-content/60">{f.field}</span>
              {f.words ? <WordDiffView ops={f.words} /> : <p>{f.before} → {f.after}</p>}
            </div>
          ))}
        </div>
      ) : (
        row && (
          <TextBlock
            tone={diff.status === "added" ? "add" : "del"}
            text={[
              `General: ${row.general || "—"}`,
              `Special: ${row.special || "—"}`,
              `Other: ${row.other || "—"}`,
              row.footnotes.length ? `Footnotes: ${row.footnotes.join(" | ")}` : "",
            ]
              .filter(Boolean)
              .join("\n")}
          />
        )
      )}
    </div>
  )
}
