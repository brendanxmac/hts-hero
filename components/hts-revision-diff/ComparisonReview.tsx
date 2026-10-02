"use client"

import { useRouter } from "next/navigation"
import { forwardRef, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import type {
  Category,
  ChangeRow,
  ChangeSource,
  ClaudeUsage,
  CodeDiff,
  ComparisonRow,
  Decision,
  NoteDiff,
  RevisionRow,
} from "@/libs/hts-revision-diff/types"
import { api, BUSY_STATUSES, StatusBadge, TextBlock, WordDiffView } from "./shared"
import {
  btn,
  Callout,
  CopyCommand,
  DefList,
  Dot,
  EmptyState,
  inputCls,
  Kbd,
  PageHeader,
  PageSpinner,
  Pill,
  ProgressBar,
  SectionLabel,
  selectCls,
  Spinner,
  Stat,
  StatGrid,
  StatusDot,
  type Tone,
} from "./ui"

interface ComparisonData {
  comparison: ComparisonRow
  changes: ChangeRow[]
  from: { revision: RevisionRow; attemptNumber: number }
  to: { revision: RevisionRow; attemptNumber: number; changeRecordModel: string | null; changeRecordUsage: ClaudeUsage | null }
}

const SOURCE_LABELS: Record<ChangeSource, string> = {
  change_record: "In change record",
  not_in_change_record: "Not in change record",
  change_record_no_diff: "Change record, no difference found",
}
const SHORT_SOURCE_LABELS: Record<ChangeSource, string> = {
  change_record: "Change record",
  not_in_change_record: "Not in change record",
  change_record_no_diff: "No difference found",
}
const DECISIONS: { value: Decision; label: string; key: string; active: string }[] = [
  { value: "approve", label: "Approve", key: "a", active: "btn-success" },
  { value: "defer", label: "Defer", key: "d", active: "btn-warning" },
  { value: "skip", label: "Skip", key: "s", active: "border-base-content/20 bg-base-content/15 hover:bg-base-content/20" },
]
const SUMMARY_CONCURRENCY = 3

const formatUsd = (usd: number) => (usd < 0.01 ? "<$0.01" : `$${usd.toFixed(2)}`)
const formatTokens = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))

export default function ComparisonReview({ comparisonId }: { comparisonId: string }) {
  const router = useRouter()
  const [data, setData] = useState<ComparisonData | null>(null)
  const [sourceFilter, setSourceFilter] = useState<ChangeSource | "all">("all")
  const [decisionFilter, setDecisionFilter] = useState<Decision | "all">("all")
  const [search, setSearch] = useState("")
  const [summarizing, setSummarizing] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState<Record<string, number>>({}) // change id → saves in flight
  const [rerunning, setRerunning] = useState(false)
  const saveSeq = useRef<Record<string, number>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)

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

  // Shows the new values right away, then saves. Only the latest save for a change applies
  // its response, so quick a/d/s presses can't land out of order; a failed save puts the
  // change back as it was.
  const save = async (change: ChangeRow, values: Partial<Pick<ChangeRow, "decision" | "category" | "reviewer_notes">>) => {
    const seq = (saveSeq.current[change.id] ?? 0) + 1
    saveSeq.current[change.id] = seq
    const bump = (by: number) => setSaving((s) => ({ ...s, [change.id]: Math.max(0, (s[change.id] ?? 0) + by) }))
    replaceChange({ ...change, ...values })
    bump(1)
    try {
      const { change: updated } = await api<{ change: ChangeRow }>(`/changes/${change.id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      })
      if (saveSeq.current[change.id] === seq) replaceChange(updated)
    } catch (error) {
      if (saveSeq.current[change.id] === seq) replaceChange(change)
      toast.error(`Couldn't save: ${(error as Error).message}`)
    } finally {
      bump(-1)
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
    setRerunning(true)
    try {
      const { comparisonId: id } = await api<{ comparisonId: string }>(`/comparisons/${comparisonId}/rerun`, { method: "POST" })
      toast.success("Started a new comparison. Reviews of unchanged changes carry over.")
      router.push(`/revision-checker/comparisons/${id}`)
      // Stays "Starting…" until the new comparison's page replaces this one
    } catch (error) {
      toast.error((error as Error).message)
      setRerunning(false)
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

  // The selected change. When it drops out of the list (e.g. decided while
  // showing only pending ones), the one now at its position takes over.
  const lastIndex = useRef(0)
  let selectedIndex = visible.findIndex((c) => c.id === selectedId)
  if (selectedIndex < 0 && visible.length) selectedIndex = Math.min(lastIndex.current, visible.length - 1)
  if (selectedIndex >= 0) lastIndex.current = selectedIndex
  const selected = selectedIndex >= 0 ? visible[selectedIndex] : null

  const listRefs = useRef(new Map<string, HTMLButtonElement>())
  const select = useCallback((change: ChangeRow | undefined) => {
    if (!change) return
    setSelectedId(change.id)
    listRefs.current.get(change.id)?.scrollIntoView({ block: "nearest" })
    window.scrollTo({ top: Math.min(window.scrollY, detailTop.current), behavior: "smooth" })
  }, [])
  const detailTop = useRef(0)
  const detailRef = useCallback((el: HTMLElement | null) => {
    if (el) detailTop.current = el.getBoundingClientRect().top + window.scrollY - 64
  }, [])

  // j/k (or arrows) move between changes; a/d/s decide
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault()
        select(visible[selectedIndex + 1])
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault()
        select(visible[selectedIndex - 1])
      } else if (selected) {
        const decision = DECISIONS.find((d) => d.key === e.key)?.value
        if (decision) save(selected, { decision: selected.decision === decision ? "pending" : decision })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  if (!data) return <PageSpinner />

  const { comparison, changes, from, to } = data
  const stats = comparison.stats
  const decided = changes.filter((c) => c.decision !== "pending").length
  const unsummarized = changes.filter((c) => !c.summary).length
  const allDecided = changes.length > 0 && decided === changes.length
  // Claude cost so far: the change record reading plus every summary
  const usages = [to.changeRecordUsage, ...changes.map((c) => c.summary?.usage)].filter(Boolean) as ClaudeUsage[]
  const claudeCost = usages.reduce((sum, u) => sum + u.cost_usd, 0)
  const claudeIn = usages.reduce((sum, u) => sum + u.input_tokens, 0)
  const claudeOut = usages.reduce((sum, u) => sum + u.output_tokens, 0)
  const untracked = changes.filter((c) => c.summary && !c.summary.usage).length
  const count = (decision: Decision) => changes.filter((c) => c.decision === decision).length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        crumbs={[{ label: "Overview", href: "/revision-checker" }, { label: "Comparison" }]}
        title={
          <>
            <span className="font-mono">
              {from.revision.name} <span className="text-base-content/35">→</span> {to.revision.name}
            </span>
            <StatusBadge status={comparison.status} />
          </>
        }
        meta={
          <>
            <span>
              Attempts #{from.attemptNumber} → #{to.attemptNumber}
            </span>
            {to.changeRecordModel && (
              <>
                <Dot />
                <span>Change record read by {to.changeRecordModel}</span>
              </>
            )}
            {(stats?.carriedOverReviews ?? 0) > 0 && (
              <>
                <Dot />
                <span>{stats!.carriedOverReviews} reviews carried over</span>
              </>
            )}
          </>
        }
        actions={
          comparison.status === "ready" && (
            <>
              <button className={btn.secondary} disabled={rerunning} onClick={rerun} title="After re-parsing or re-reading the change record">
                {rerunning && <Spinner />}
                {rerunning ? "Starting…" : "Re-run"}
              </button>
              <button className={btn.primary} disabled={!unsummarized || summarizing.size > 0} onClick={summarizeAll}>
                {summarizing.size > 0 && <Spinner />}
                {summarizing.size > 0 ? "Summarizing…" : unsummarized ? `Summarize ${unsummarized} with Claude` : "All summarized"}
              </button>
            </>
          )
        }
      />

      {running && (
        <Callout tone="info" busy title={comparison.status === "extracting_change_record" ? "Reading the change record" : comparison.status === "diffing" ? "Diffing notes and headings" : "Starting"}>
          {comparison.status === "extracting_change_record"
            ? "Claude is reading the change record. This can take a few minutes; the page updates on its own."
            : "This page updates on its own."}
        </Callout>
      )}
      {comparison.status === "failed" && (
        <Callout
          tone="error"
          title="Comparison failed"
          action={
            <button className={btn.xsSecondary} disabled={rerunning} onClick={rerun}>
              {rerunning && <Spinner />}
              Try again
            </button>
          }
        >
          <span className="whitespace-pre-wrap">{comparison.error}</span>
        </Callout>
      )}

      {comparison.status === "ready" && stats && (
        <>
          {stats.consecutive === false && (
            <Callout tone="warning" title="These revisions aren't consecutive">
              The change record doesn&apos;t cover the revisions in between, so some differences show as “not in change record”.
            </Callout>
          )}
          {allDecided && (
            <Callout tone="success" title="Every change has a decision" action={<CopyCommand command={`npm run pull-revision -- ${to.revision.name}`} />}>
              Write the review into the repo for Claude Code.
            </Callout>
          )}

          <StatGrid>
            <Stat label="Reviewed" value={<>{decided}<span className="text-base font-normal text-base-content/40"> / {changes.length}</span></>}>
              <ProgressBar value={decided} max={changes.length} className="mt-1" />
            </Stat>
            <Stat label="Change record items" value={stats.changeRecordItemsInCh99} hint={`Chapter 99, of ${stats.changeRecordItems} read`} />
            <Stat
              label="Note differences"
              value={Object.values(stats.noteDiffs).reduce((a, b) => a + b, 0)}
              hint={`${stats.noteDiffs.modified} changed · ${stats.noteDiffs.added} added · ${stats.noteDiffs.removed} removed · ${stats.noteDiffs.renumbered} renumbered`}
            />
            {stats.headingDiff === "change_record_only" ? (
              <Stat
                label="Heading differences"
                value={<span className="text-sm font-medium">From change record</span>}
                hint={
                  <>
                    {stats.headingSource === "revision_json"
                      ? `Checked against ${to.revision.name}'s JSON`
                      : stats.headingSource === "revision_pdf"
                        ? `From ${to.revision.name}'s reviewed heading pages`
                        : `No heading data for ${to.revision.name}; add heading pages on its attempt page`}
                    {(stats.unreviewedHeadingRows ?? 0) > 0 && (
                      <span className="text-warning"> · {stats.unreviewedHeadingRows} rows not reviewed</span>
                    )}
                  </>
                }
              />
            ) : (
              <Stat
                label="Heading differences"
                value={Object.values(stats.codeDiffs).reduce((a, b) => a + b, 0)}
                hint={`${stats.codeDiffs.modified} changed · ${stats.codeDiffs.added} added · ${stats.codeDiffs.removed} removed`}
              />
            )}
            <Stat
              label="Claude cost"
              value={usages.length ? formatUsd(claudeCost) : "—"}
              hint={
                usages.length ? (
                  <span title="Including thinking tokens">
                    {formatTokens(claudeIn)} in · {formatTokens(claudeOut)} out
                    {to.changeRecordUsage ? ` · change record ${formatUsd(to.changeRecordUsage.cost_usd)}` : ""}
                    {untracked > 0 && ` · ${untracked} untracked`}
                  </span>
                ) : (
                  "Nothing yet"
                )
              }
            />
          </StatGrid>

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
            {/* Change list */}
            <aside className="flex flex-col overflow-hidden rounded-lg border border-base-content/10 bg-base-100 shadow-sm lg:sticky lg:top-[4.25rem] lg:max-h-[calc(100vh-5.5rem)]">
              <div className="flex flex-col gap-2 border-b border-base-content/10 p-3">
                <input
                  className={`${inputCls} w-full`}
                  placeholder="Search text, notes, codes"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select className={`${selectCls} select-xs h-8 min-h-8`} value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value as any)}>
                    <option value="all">Any decision</option>
                    <option value="pending">Pending ({count("pending")})</option>
                    <option value="approve">Approved ({count("approve")})</option>
                    <option value="defer">Deferred ({count("defer")})</option>
                    <option value="skip">Skipped ({count("skip")})</option>
                  </select>
                  <select className={`${selectCls} select-xs h-8 min-h-8`} value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)}>
                    <option value="all">Any source</option>
                    {(Object.keys(SOURCE_LABELS) as ChangeSource[]).map((s) => (
                      <option key={s} value={s}>
                        {SOURCE_LABELS[s]} ({changes.filter((c) => c.source === s).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-base-content/45">
                <span>
                  {visible.length === changes.length ? `${changes.length} changes` : `${visible.length} of ${changes.length} changes`}
                </span>
                {(search || decisionFilter !== "all" || sourceFilter !== "all") && (
                  <button
                    className="hover:text-base-content"
                    onClick={() => {
                      setSearch("")
                      setDecisionFilter("all")
                      setSourceFilter("all")
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
              <div className="max-h-[60vh] flex-1 overflow-y-auto border-t border-base-content/[0.07] lg:max-h-none">
                {visible.map((change) => (
                  <ChangeListItem
                    key={change.id}
                    ref={(el) => {
                      if (el) listRefs.current.set(change.id, el)
                      else listRefs.current.delete(change.id)
                    }}
                    change={change}
                    selected={change.id === selected?.id}
                    summarizing={summarizing.has(change.id)}
                    onClick={() => setSelectedId(change.id)}
                  />
                ))}
                {!visible.length && <EmptyState title="No changes match" />}
              </div>
              <div className="hidden items-center gap-3 border-t border-base-content/10 px-3 py-2 text-[11px] text-base-content/45 lg:flex">
                <span className="flex items-center gap-1">
                  <Kbd>j</Kbd>
                  <Kbd>k</Kbd> move
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>a</Kbd>
                  <Kbd>d</Kbd>
                  <Kbd>s</Kbd> decide
                </span>
              </div>
            </aside>

            {/* Selected change */}
            <div ref={detailRef} className="min-w-0">
              {selected ? (
                <ChangeDetail
                  key={selected.id}
                  change={selected}
                  position={selectedIndex + 1}
                  total={visible.length}
                  onPrev={selectedIndex > 0 ? () => select(visible[selectedIndex - 1]) : undefined}
                  onNext={selectedIndex < visible.length - 1 ? () => select(visible[selectedIndex + 1]) : undefined}
                  fromName={from.revision.name}
                  toName={to.revision.name}
                  summarizing={summarizing.has(selected.id)}
                  saving={(saving[selected.id] ?? 0) > 0}
                  onSummarize={() => summarize(selected)}
                  onSave={(values) => save(selected, values)}
                />
              ) : (
                <div className="rounded-lg border border-dashed border-base-content/15">
                  <EmptyState title={changes.length ? "No change selected" : "No changes found"}>
                    {changes.length ? "Pick a change from the list, or clear the filters." : "These revisions have no Chapter 99 differences."}
                  </EmptyState>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const DecisionIcon = ({ decision }: { decision: Decision }) => {
  if (decision === "pending") return <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-[1.5px] border-base-content/25" />
  const style =
    decision === "approve" ? "bg-success text-success-content" : decision === "defer" ? "bg-warning text-warning-content" : "bg-base-content/25 text-base-100"
  return (
    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${style}`}>
      {decision === "approve" ? "✓" : decision === "defer" ? "…" : "–"}
    </span>
  )
}

const ChangeListItem = forwardRef<
  HTMLButtonElement,
  { change: ChangeRow; selected: boolean; summarizing: boolean; onClick: () => void }
>(function ChangeListItem({ change, selected, summarizing, onClick }, ref) {
  const { payload } = change
  const headings = payload.codeDiffs.length || payload.citedHeadings?.length || 0
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex w-full gap-2.5 border-b border-l-2 border-b-base-content/[0.06] px-3 py-2.5 text-left transition-colors ${
        selected ? "border-l-base-content bg-base-content/[0.06]" : "border-l-transparent hover:bg-base-content/[0.03]"
      }`}
    >
      <DecisionIcon decision={change.decision} />
      <div className="min-w-0 flex-1">
        <div className={`line-clamp-2 text-[13px] leading-snug ${change.decision === "pending" ? "font-medium" : "text-base-content/60"}`}>
          {change.title}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] text-base-content/45">
          <span className={change.source === "change_record" ? "" : "text-warning"}>{SHORT_SOURCE_LABELS[change.source]}</span>
          {payload.noteDiffs.length > 0 && (
            <>
              <Dot />
              <span>
                {payload.noteDiffs.length} note{payload.noteDiffs.length === 1 ? "" : "s"}
              </span>
            </>
          )}
          {headings > 0 && (
            <>
              <Dot />
              <span>
                {headings} heading{headings === 1 ? "" : "s"}
              </span>
            </>
          )}
          {change.category && (
            <>
              <Dot />
              <span>{change.category}</span>
            </>
          )}
          {summarizing ? (
            <span className="loading loading-spinner ml-auto h-3 w-3" />
          ) : change.summary_error ? (
            <span className="ml-auto text-error" title={change.summary_error}>
              summary failed
            </span>
          ) : change.summary ? (
            <span className="ml-auto text-base-content/35" title="Summarized by Claude">
              ✦
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
})

const DIFF_TONES: Record<string, Tone> = { added: "success", removed: "error", modified: "neutral", renumbered: "neutral" }
const DiffPill = ({ status }: { status: string }) => (
  <Pill tone={DIFF_TONES[status] ?? "neutral"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Pill>
)

function ChangeDetail({
  change,
  position,
  total,
  onPrev,
  onNext,
  fromName,
  toName,
  summarizing,
  saving,
  onSummarize,
  onSave,
}: {
  change: ChangeRow
  position: number
  total: number
  onPrev?: () => void
  onNext?: () => void
  fromName: string
  toName: string
  summarizing: boolean
  saving: boolean
  onSummarize: () => void
  onSave: (values: Partial<Pick<ChangeRow, "decision" | "category" | "reviewer_notes">>) => void
}) {
  const [notes, setNotes] = useState(change.reviewer_notes ?? "")
  useEffect(() => setNotes(change.reviewer_notes ?? ""), [change.reviewer_notes])
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const { payload } = change
  const citedHeadings = payload.citedHeadings ?? []

  return (
    <article className="rounded-lg border border-base-content/10 bg-base-100 shadow-sm">
      {/* Decision bar */}
      <div className="sticky top-12 z-20 rounded-t-lg border-b border-base-content/10 bg-base-100/95 px-5 py-3.5 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-base-content/45">
              <span>
                Change {position} of {total}
              </span>
              <Pill tone={change.source === "change_record" ? "neutral" : "warning"}>{SOURCE_LABELS[change.source]}</Pill>
            </div>
            <h2 className="mt-1 font-semibold leading-snug">{change.title}</h2>
          </div>
          <div className="flex shrink-0 gap-1">
            <button className={btn.xsSecondary} disabled={!onPrev} onClick={onPrev} title="Previous (k)">
              ↑
            </button>
            <button className={btn.xsSecondary} disabled={!onNext} onClick={onNext} title="Next (j)">
              ↓
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex gap-1.5">
            {DECISIONS.map((d) => {
              const active = change.decision === d.value
              return (
                <button
                  key={d.value}
                  className={`btn btn-sm h-8 min-h-8 gap-2 px-3 font-medium ${active ? d.active : "border-base-content/15 bg-base-100 hover:bg-base-200"}`}
                  onClick={() => onSave({ decision: active ? "pending" : d.value })}
                  title={`${active ? "Undo" : d.label} (${d.key})`}
                >
                  {active && "✓ "}
                  {d.label}
                  <span className={`font-mono text-[10px] ${active ? "opacity-60" : "text-base-content/35"}`}>{d.key.toUpperCase()}</span>
                </button>
              )
            })}
          </div>
          <label className="flex items-center gap-2 text-xs text-base-content/55">
            Category
            <select
              className={`${selectCls} select-xs h-8 min-h-8`}
              value={change.category ?? ""}
              onChange={(e) => onSave({ category: (e.target.value || null) as Category | null })}
            >
              <option value="">Not set</option>
              <option value="data">Data</option>
              <option value="logic">Logic</option>
              <option value="mixed">Mixed</option>
              <option value="none">None (noise)</option>
            </select>
          </label>
          {saving && (
            <span className="flex items-center gap-1.5 text-xs text-base-content/50" role="status">
              <Spinner /> Saving…
            </span>
          )}
          <button
            className="ml-auto text-xs text-base-content/50 hover:text-base-content"
            onClick={() => {
              notesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
              notesRef.current?.focus({ preventScroll: true })
            }}
          >
            {change.reviewer_notes ? "✎ Notes added ↓" : "Add notes ↓"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-7 px-5 py-5">
        {payload.warnings.length > 0 && (
          <div className="flex flex-col gap-2">
            {payload.warnings.map((w, i) => (
              <Callout key={i} tone="warning">
                {w}
              </Callout>
            ))}
          </div>
        )}

        <section className="flex flex-col gap-3">
          <SectionLabel
            right={
              <button className={btn.xsGhost} disabled={summarizing} onClick={onSummarize}>
                {summarizing && <Spinner />}
                {change.summary ? "Re-summarize" : "Summarize with Claude"}
              </button>
            }
          >
            Claude summary
          </SectionLabel>
          <SummaryBlock change={change} summarizing={summarizing} />
        </section>

        {payload.changeRecordItems.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionLabel>Change record</SectionLabel>
            {payload.changeRecordItems.map((item) => (
              <div key={item.id} className="rounded-md border border-base-content/10 px-3.5 py-3 text-sm">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold">Item {item.id}</span>
                  <Pill>{item.action}</Pill>
                  {item.effective_date && <span className="text-xs text-base-content/50">Effective {item.effective_date}</span>}
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-base-content/85">{item.source_text}</p>
                {item.authority && <p className="mt-1.5 text-xs text-base-content/50">Authority: {item.authority}</p>}
              </div>
            ))}
          </section>
        )}

        {payload.noteDiffs.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionLabel>Note differences · {payload.noteDiffs.length}</SectionLabel>
            {payload.noteDiffs.map((d) => (
              <NoteDiffView key={`${d.fromKey}-${d.toKey}`} diff={d} fromName={fromName} toName={toName} />
            ))}
          </section>
        )}

        {citedHeadings.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionLabel>Headings cited by the change record · {toName}</SectionLabel>
            <div className="divide-y divide-base-content/[0.07] rounded-md border border-base-content/10">
              {citedHeadings.map((c) => (
                <div key={c.code} className="px-3.5 py-2.5 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold">{c.code}</span>
                    <StatusDot
                      tone={c.status === "found" ? "success" : c.status === "not_found" ? "error" : "neutral"}
                      label={c.status === "found" ? "Found" : c.status === "not_found" ? "Not in JSON" : "Not checked"}
                    />
                  </div>
                  {c.row && (
                    <>
                      <p className="mt-1 text-base-content/80">{c.row.description}</p>
                      <p className="mt-1 text-xs text-base-content/55">
                        General: {c.row.general || "—"} <Dot /> Special: {c.row.special || "—"} <Dot /> Other: {c.row.other || "—"}
                        {c.row.footnotes.length > 0 && (
                          <>
                            {" "}
                            <Dot /> Footnotes: {c.row.footnotes.join(" | ")}
                          </>
                        )}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {payload.codeDiffs.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionLabel>Heading differences · Chapter 99 JSON</SectionLabel>
            {payload.codeDiffs.map((d) => (
              <CodeDiffView key={d.key} diff={d} />
            ))}
          </section>
        )}

        {payload.context.length > 0 && (
          <details className="group rounded-md border border-base-content/10">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/50 hover:text-base-content/80 [&::-webkit-details-marker]:hidden">
              <span className="transition-transform group-open:rotate-90">›</span>
              Context · {payload.context.length}
            </summary>
            <div className="flex flex-col gap-4 border-t border-base-content/10 px-3.5 py-3">
              {payload.context.map((c) => (
                <div key={`${c.revision}-${c.key}`}>
                  <p className="mb-1.5 text-xs text-base-content/55">
                    <span className="font-medium text-base-content/80">{c.label}</span> <Dot /> {c.revision === "to" ? toName : fromName}{" "}
                    <Dot /> {c.reason}
                  </p>
                  <TextBlock text={c.text} />
                </div>
              ))}
            </div>
          </details>
        )}

        <section className="flex flex-col gap-2 border-t border-base-content/10 pt-5">
          <SectionLabel>Notes for Claude Code</SectionLabel>
          <textarea
            ref={notesRef}
            className="textarea textarea-bordered border-base-content/15 text-sm leading-relaxed"
            rows={4}
            placeholder="Your interpretation and instructions. Saved when you click away."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== (change.reviewer_notes ?? "") && onSave({ reviewer_notes: notes })}
          />
        </section>
      </div>
    </article>
  )
}

function SummaryBlock({ change, summarizing }: { change: ChangeRow; summarizing: boolean }) {
  const { summary } = change
  if (!summary) {
    return (
      <div className="rounded-md border border-dashed border-base-content/15 px-3.5 py-3 text-sm text-base-content/50">
        {summarizing ? (
          <span className="flex items-center gap-2">
            <Spinner /> Claude is summarizing this change…
          </span>
        ) : change.summary_error ? (
          <span className="text-error">{change.summary_error}</span>
        ) : (
          "Not summarized yet."
        )}
      </div>
    )
  }
  const unverified = summary.what_changed.filter((c) => c.verified === false).length
  const facts = [
    {
      label: "Suggested category",
      value: (
        <>
          <span className="font-medium capitalize">{summary.category}</span>
          <span className="text-base-content/60"> — {summary.category_reason}</span>
        </>
      ),
    },
    summary.matches_change_record && {
      label: "Matches change record",
      value: (
        <>
          <span className="font-medium capitalize">{summary.matches_change_record.status.replace("_", " ")}</span>
          {summary.matches_change_record.note && <span className="text-base-content/60"> — {summary.matches_change_record.note}</span>}
        </>
      ),
    },
    summary.effective_dates.length > 0 && {
      label: "Effective",
      value: summary.effective_dates.map((e) => `${e.date} (${e.applies_to})`).join("; "),
    },
    summary.affected_hts_codes.length > 0 && {
      label: "Codes",
      value: <span className="font-mono text-xs leading-relaxed">{summary.affected_hts_codes.join(", ")}</span>,
    },
    { label: "Engine impact", value: summary.engine_impact },
    summary.change_record_consistency && { label: "Change record", value: summary.change_record_consistency },
  ].filter(Boolean) as { label: string; value: ReactNode }[]

  return (
    <div className="flex flex-col gap-4 rounded-md border border-base-content/10 bg-base-content/[0.02] px-4 py-3.5 text-sm">
      <div>
        <p className="font-semibold leading-snug">{summary.headline}</p>
        <p className="mt-1.5 leading-relaxed text-base-content/80">{summary.summary}</p>
      </div>
      <DefList items={facts} />
      {summary.what_changed.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-base-content/10 pt-3.5">
          <div className="text-xs font-medium text-base-content/50">What changed</div>
          <ul className="flex flex-col gap-3">
            {summary.what_changed.map((c, i) => (
              <li key={i}>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span>{c.statement}</span>
                  <span className="font-mono text-[11px] text-base-content/45">{c.citation}</span>
                  {c.verified === false && <Pill tone="warning">Quote not found in source</Pill>}
                </div>
                <blockquote className="mt-1 border-l-2 border-base-content/15 pl-2.5 text-xs leading-relaxed text-base-content/60">
                  {c.quote}
                </blockquote>
              </li>
            ))}
          </ul>
          {unverified > 0 && (
            <p className="text-xs text-warning">
              {unverified} quote{unverified === 1 ? "" : "s"} couldn&apos;t be found in the text sent to Claude. Check those claims
              against the note text below.
            </p>
          )}
        </div>
      )}
      {summary.open_questions.length > 0 && (
        <Callout tone="warning" title="Open questions">
          <ul className="ml-4 list-disc space-y-0.5">
            {summary.open_questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </Callout>
      )}
      <p className="text-[11px] text-base-content/40">
        {change.summary_model} <Dot /> {change.summary_prompt_version}
        {summary.usage && (
          <>
            {" "}
            <Dot /> {formatTokens(summary.usage.input_tokens)} in / {formatTokens(summary.usage.output_tokens)} out <Dot />{" "}
            {formatUsd(summary.usage.cost_usd)}
          </>
        )}
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
    <div className="rounded-md border border-base-content/10">
      <div className="flex flex-wrap items-center gap-2 border-b border-base-content/[0.07] bg-base-content/[0.02] px-3.5 py-2 text-sm">
        <DiffPill status={diff.status} />
        <span className="font-medium">{diff.status === "renumbered" ? `${diff.fromLabel} → ${diff.label}` : diff.label}</span>
        <span className="font-mono text-[11px] text-base-content/40">{diff.toKey ?? diff.fromKey}</span>
        {pages && <span className="ml-auto text-[11px] text-base-content/40">{pages}</span>}
      </div>
      <div className="px-3.5 py-3">
      {diff.status === "modified" && diff.words && (
        <>
          <WordDiffView ops={diff.words} />
          <button className="mt-2 text-xs font-medium text-base-content/50 hover:text-base-content" onClick={() => setShowFull(!showFull)}>
            {showFull ? "Hide" : "Show"} before and after
          </button>
          {showFull && (
            <div className="mt-2 grid gap-2 xl:grid-cols-2">
              <TextBlock text={diff.before ?? ""} tone="del" />
              <TextBlock text={diff.after ?? ""} tone="add" />
            </div>
          )}
        </>
      )}
      {diff.status === "added" && <TextBlock text={diff.after ?? ""} tone="add" />}
      {diff.status === "removed" && <TextBlock text={diff.before ?? ""} tone="del" />}
      {diff.status === "renumbered" && <TextBlock text={diff.after ?? ""} />}
      {(diff.codesAdded.length > 0 || diff.codesRemoved.length > 0 || (diff.rangeChanges?.length ?? 0) > 0) && (
        <div className="mt-3 flex flex-col gap-1 border-t border-base-content/[0.07] pt-2.5 text-xs">
          {diff.rangeChanges?.map((r, i) => (
            <p key={i} className="break-words">
              <span className="font-semibold">Range:</span>{" "}
              <span className="font-mono">
                {r.before ?? "(none)"} → {r.after ?? "(none)"}
              </span>{" "}
              <span className="text-base-content/70">({r.description})</span>
            </p>
          ))}
          {diff.codesAdded.length > 0 && (
            <p className="break-words">
              <span className="font-semibold text-success">+ {diff.codesAdded.length} codes:</span>{" "}
              <span className="font-mono text-base-content/70">{diff.codesAdded.join(", ")}</span>
            </p>
          )}
          {diff.codesRemoved.length > 0 && (
            <p className="break-words">
              <span className="font-semibold text-error">− {diff.codesRemoved.length} codes:</span>{" "}
              <span className="font-mono text-base-content/70">{diff.codesRemoved.join(", ")}</span>
            </p>
          )}
        </div>
      )}
      </div>
    </div>
  )
}

function CodeDiffView({ diff }: { diff: CodeDiff }) {
  const row = diff.after ?? diff.before
  return (
    <div className="rounded-md border border-base-content/10 text-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-base-content/[0.07] bg-base-content/[0.02] px-3.5 py-2">
        <DiffPill status={diff.status} />
        <span className="font-mono text-[13px] font-semibold">{diff.htsno || `(text row under ${row?.parentHtsno})`}</span>
        <span className="min-w-0 truncate text-base-content/60">{diff.description}</span>
      </div>
      <div className="px-3.5 py-3">
      {diff.status === "modified" ? (
        <div className="flex flex-col gap-2">
          {diff.fields.map((f) => (
            <div key={f.field}>
              <span className="text-[11px] font-medium uppercase tracking-wider text-base-content/45">{f.field}</span>
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
    </div>
  )
}
