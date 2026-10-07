"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DATES_MODE_LABELS, STATUS_LABELS, SUGGEST_CHUNK, type BatchDecision, type DatesMode } from "@/libs/hts-coverage/constants"
import type { CoverageBatch, CoverageBatchItem, CoverageItem } from "@/libs/hts-coverage/types"
import { formatTime } from "../hts-revision-diff/shared"
import {
  Callout,
  CopyCommand,
  Dot,
  EmptyState,
  Field,
  Help,
  Kbd,
  PageHeader,
  PageSpinner,
  Panel,
  Pill,
  ProgressBar,
  Segmented,
  Spinner,
  Stat,
  StatGrid,
  StatusDot,
  btn,
  inputCls,
  selectCls,
} from "../hts-revision-diff/ui"
import { coverageApi } from "./api"
import { BATCH_STATUS_LABELS, BATCH_STATUS_TONES } from "./batch-ui"
import { categoryLabel, displayStatus, resolvedCategory, STATUS_TONES, type DashboardData } from "./derive"
import { EngineSection, HtsSection, NotesSection, SuggestionCard, TrackingFields, useHeadingDetail } from "./sections"

type Row = CoverageBatchItem & { item: CoverageItem }

const DECISIONS: { value: BatchDecision; label: string; key: string; active: string }[] = [
  { value: "include", label: "Include", key: "i", active: "btn-success" },
  { value: "skip", label: "Skip", key: "s", active: "border-base-content/20 bg-base-content/15 hover:bg-base-content/20" },
  { value: "pending", label: "Undecided", key: "u", active: "border-base-content/20 bg-base-content/10" },
]
const DECISION_TONES = { pending: "neutral", include: "success", skip: "neutral" } as const

const formatUsd = (usd: number) => (usd < 0.01 ? "<$0.01" : `$${usd.toFixed(2)}`)

// ---------- Batch settings ----------

const BatchSettings = ({ batch, editable, onSaved }: { batch: CoverageBatch; editable: boolean; onSaved: (b: CoverageBatch) => void }) => {
  const [title, setTitle] = useState(batch.title)
  const [instructions, setInstructions] = useState(batch.instructions ?? "")
  const [datesMode, setDatesMode] = useState<DatesMode>(batch.dates_mode)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    setTitle(batch.title)
    setInstructions(batch.instructions ?? "")
    setDatesMode(batch.dates_mode)
  }, [batch])
  const dirty = title !== batch.title || instructions !== (batch.instructions ?? "") || datesMode !== batch.dates_mode

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      const { batch: saved } = await coverageApi<{ batch: CoverageBatch }>(`/batches/${batch.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, instructions, dates_mode: datesMode }),
      })
      onSaved(saved)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel
      title="Instructions for Claude"
      actions={
        editable && (
          <button className={btn.xsPrimary} onClick={save} disabled={!dirty || busy}>
            {busy && <Spinner />}
            {dirty ? "Save" : "Saved"}
          </button>
        )
      }
      bodyClassName="flex flex-col gap-4 p-4"
    >
      {error && <Callout tone="error">{error}</Callout>}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <Field label="Title">
          <input className={inputCls} value={title} disabled={!editable} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Effective dates" hint={datesMode === "backfill" ? "Claude researches each heading's real start date and history" : "A heading gets a start date only if its text gives one; otherwise it's dated when backfilling reaches it"}>
          <Segmented
            options={(Object.keys(DATES_MODE_LABELS) as DatesMode[]).map((m) => ({ value: m, label: DATES_MODE_LABELS[m] }))}
            value={datesMode}
            onChange={(v) => editable && setDatesMode(v)}
          />
        </Field>
      </div>
      <Field label="For the whole batch" hint="Context, priorities, what to model and what to leave out. Each heading can add its own below.">
        <textarea
          className="textarea textarea-bordered min-h-28 border-base-content/15 bg-base-100 text-sm leading-relaxed"
          value={instructions}
          disabled={!editable}
          placeholder="e.g. Model these as exclusions from 9903.88.15 (U.S. note 20(vvv)); the code lists are in note 20(www)…"
          onChange={(e) => setInstructions(e.target.value)}
        />
      </Field>
    </Panel>
  )
}

// ---------- One heading ----------

const HeadingReview = ({
  row,
  data,
  editable,
  onDecision,
  onInstructions,
  onRemove,
  onPatched,
  onNoteProgram,
}: {
  row: Row
  data: DashboardData
  editable: boolean
  onDecision: (d: BatchDecision) => void
  onInstructions: (text: string) => Promise<void>
  onRemove: () => void
  onPatched: (items: CoverageItem[]) => void
  onNoteProgram: (noteKey: string, program: string | null) => Promise<void>
}) => {
  const { detail, error } = useHeadingDetail(row.htsno)
  const [text, setText] = useState(row.instructions ?? "")
  const [saving, setSaving] = useState(false)
  useEffect(() => setText(row.instructions ?? ""), [row.htsno, row.instructions])
  const status = displayStatus(row.item, data.memberships[row.htsno])

  const saveText = async () => {
    if (text === (row.instructions ?? "")) return
    setSaving(true)
    try {
      await onInstructions(text)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Panel bodyClassName="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-mono text-base font-semibold">{row.htsno}</h2>
          <Pill tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Pill>
          {row.item.engine_referenced && !row.item.engine_modeled && <Pill tone="info">referenced in engine</Pill>}
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {DECISIONS.map((d) => (
              <button
                key={d.value}
                className={`btn btn-sm gap-1.5 font-medium ${row.decision === d.value ? d.active : "border-base-content/15 bg-base-100 hover:bg-base-200"}`}
                disabled={!editable}
                onClick={() => onDecision(d.value)}
                title={`${d.label} (${d.key})`}
              >
                {d.label}
                <Kbd>{d.key}</Kbd>
              </button>
            ))}
            {editable && (
              <button className={btn.ghost} onClick={onRemove} title="Remove from this batch">
                Remove
              </button>
            )}
          </div>
        </div>
        <Field label={<>Instructions for this heading {saving && <Spinner />}</>}>
          <textarea
            className="textarea textarea-bordered min-h-20 border-base-content/15 bg-base-100 text-sm leading-relaxed"
            value={text}
            disabled={!editable}
            placeholder="Anything specific to this heading: how to model it, what to check, what to leave out"
            onChange={(e) => setText(e.target.value)}
            onBlur={saveText}
          />
        </Field>
        <TrackingFields item={row.item} data={data} onPatched={onPatched} compact />
        <SuggestionCard item={row.item} data={data} onPatched={onPatched} />
      </Panel>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Panel title="HTS and notes" bodyClassName="flex flex-col gap-6 p-4">
          {error && <Callout tone="error">{error}</Callout>}
          <HtsSection item={row.item} />
          <NotesSection item={row.item} detail={detail} error={error} data={data} onNoteProgram={onNoteProgram} />
        </Panel>
        <Panel title="Engine" bodyClassName="flex flex-col gap-6 p-4">
          <EngineSection detail={detail} error={error} />
        </Panel>
      </div>
    </div>
  )
}

// ---------- Page ----------

export default function BatchReview({ batchId }: { batchId: string }) {
  const router = useRouter()
  const [batch, setBatch] = useState<CoverageBatch | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [decisionFilter, setDecisionFilter] = useState<BatchDecision | "all">("all")
  const [busy, setBusy] = useState<string | null>(null)
  const [suggesting, setSuggesting] = useState<{ done: number; total: number } | null>(null)
  const [prUrl, setPrUrl] = useState("")

  const load = useCallback(async () => {
    try {
      const [b, d] = await Promise.all([
        coverageApi<{ batch: CoverageBatch; items: Row[] }>(`/batches/${batchId}`),
        coverageApi<DashboardData>(""),
      ])
      setBatch(b.batch)
      setRows(b.items)
      setData(d)
      setPrUrl(b.batch.pr_url ?? "")
      setSelectedCode((c) => c ?? b.items[0]?.htsno ?? null)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [batchId])

  useEffect(() => {
    load()
  }, [load])

  const editable = batch?.status === "draft"

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (decisionFilter === "all" || r.decision === decisionFilter) &&
        (!q || [r.htsno, r.item.description, r.instructions ?? "", r.item.notes ?? ""].join(" ").toLowerCase().includes(q))
    )
  }, [rows, search, decisionFilter])

  const selected = rows.find((r) => r.htsno === selectedCode) ?? null
  const index = selected ? visible.findIndex((r) => r.htsno === selected.htsno) : -1

  const move = useCallback(
    (delta: number) => {
      const next = visible[Math.min(visible.length - 1, Math.max(0, (index < 0 ? 0 : index) + delta))]
      if (next) setSelectedCode(next.htsno)
    },
    [visible, index]
  )

  const applyItems = (items: CoverageItem[]) => {
    const byCode = new Map(items.map((i) => [i.htsno, i]))
    setRows((rs) => rs.map((r) => (byCode.has(r.htsno) ? { ...r, item: byCode.get(r.htsno)! } : r)))
    setData((d) => (d ? { ...d, items: d.items.map((i) => byCode.get(i.htsno) ?? i) } : d))
  }

  const patchRow = async (htsno: string, patch: { decision?: BatchDecision; instructions?: string }) => {
    try {
      const { batchItem } = await coverageApi<{ batchItem: CoverageBatchItem }>(`/batches/${batchId}/items/${encodeURIComponent(htsno)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      })
      setRows((rs) => rs.map((r) => (r.htsno === htsno ? { ...r, ...batchItem } : r)))
      setData((d) =>
        d && d.memberships[htsno] ? { ...d, memberships: { ...d.memberships, [htsno]: { ...d.memberships[htsno], decision: batchItem.decision } } } : d
      )
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const decide = useCallback(
    async (decision: BatchDecision) => {
      if (!selected || !editable) return
      await patchRow(selected.htsno, { decision })
      // Move on after deciding, like the revision checker
      if (decision !== "pending") move(1)
    },
    [selected, editable, move] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || e.metaKey || e.ctrlKey) return
      if (e.key === "j" || e.key === "ArrowDown") (e.preventDefault(), move(1))
      else if (e.key === "k" || e.key === "ArrowUp") (e.preventDefault(), move(-1))
      else {
        const d = DECISIONS.find((x) => x.key === e.key)
        if (d) (e.preventDefault(), decide(d.value))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [move, decide])

  const setStatus = async (status: CoverageBatch["status"], extra: Record<string, unknown> = {}) => {
    setBusy(status)
    setError(null)
    try {
      const { batch: saved } = await coverageApi<{ batch: CoverageBatch }>(`/batches/${batchId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...extra }),
      })
      setBatch(saved)
      setData(await coverageApi<DashboardData>(""))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const remove = async (htsno: string) => {
    try {
      await coverageApi(`/batches/${batchId}/items`, { method: "DELETE", body: JSON.stringify({ htsnos: [htsno] }) })
      const i = visible.findIndex((r) => r.htsno === htsno)
      const next = visible[i + 1] ?? visible[i - 1]
      setRows((rs) => rs.filter((r) => r.htsno !== htsno))
      setSelectedCode(next?.htsno ?? null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const deleteBatch = async () => {
    if (!batch || !confirm(`Delete “${batch.title}”? Its headings and instructions are removed from the batch (the headings themselves stay).`)) return
    try {
      await coverageApi(`/batches/${batchId}`, { method: "DELETE" })
      router.push("/coverage-checker")
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const suggestMissing = async () => {
    const codes = rows.filter((r) => !r.item.claude_suggestion).map((r) => r.htsno)
    const chunks: string[][] = []
    for (let i = 0; i < codes.length; i += SUGGEST_CHUNK) chunks.push(codes.slice(i, i + SUGGEST_CHUNK))
    setSuggesting({ done: 0, total: codes.length })
    let next = 0
    const worker = async () => {
      while (next < chunks.length) {
        const chunk = chunks[next++]
        try {
          const { items } = await coverageApi<{ items: CoverageItem[] }>("/suggest", { method: "POST", body: JSON.stringify({ htsnos: chunk }) })
          applyItems(items)
        } catch (e) {
          setError(`Suggestions for ${chunk[0]}…: ${(e as Error).message}`)
        }
        setSuggesting((p) => (p ? { ...p, done: p.done + chunk.length } : p))
      }
    }
    await Promise.all([worker(), worker()])
    setSuggesting(null)
  }

  const setNoteProgram = async (noteKey: string, program: string | null) => {
    try {
      await coverageApi("/note-programs", { method: "PUT", body: JSON.stringify({ note_key: noteKey, program }) })
      setData(await coverageApi<DashboardData>(""))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  if (!batch || !data) return error ? <Callout tone="error">{error}</Callout> : <PageSpinner />

  const count = (d: BatchDecision) => rows.filter((r) => r.decision === d).length
  const decided = rows.length - count("pending")
  const modeled = rows.filter((r) => r.item.engine_modeled).length
  const unsuggested = rows.filter((r) => !r.item.claude_suggestion).length
  const claudeCost = rows.reduce((sum, r) => sum + (r.item.claude_suggestion?.usage?.cost_usd ?? 0), 0)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        crumbs={[{ label: "Coverage checker", href: "/coverage-checker" }, { label: "Batch" }]}
        title={
          <>
            {batch.title}
            <StatusDot tone={BATCH_STATUS_TONES[batch.status]} label={BATCH_STATUS_LABELS[batch.status]} />
          </>
        }
        meta={
          <>
            <span className="font-mono">{batch.name}</span>
            <Dot />
            <span>Created {formatTime(batch.created_at)}</span>
            {batch.pulled_at && (
              <>
                <Dot />
                <span>Pulled {formatTime(batch.pulled_at)}</span>
              </>
            )}
            {batch.pr_url && (
              <>
                <Dot />
                <a href={batch.pr_url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                  Pull request ↗
                </a>
              </>
            )}
          </>
        }
        actions={
          <>
            {editable && unsuggested > 0 && (
              <button className={btn.secondary} onClick={suggestMissing} disabled={!!suggesting}>
                {suggesting && <Spinner />}
                {suggesting ? `Suggesting ${suggesting.done}/${suggesting.total}…` : `Suggest ${unsuggested} with Claude`}
              </button>
            )}
            {batch.status === "draft" && (
              <>
                <button className={btn.ghost} onClick={deleteBatch}>
                  Delete
                </button>
                <button className={btn.secondary} onClick={() => setStatus("archived")} disabled={!!busy}>
                  Archive
                </button>
                <button
                  className={btn.primary}
                  onClick={() => setStatus("ready")}
                  disabled={!!busy || decided < rows.length || !count("include")}
                  title={decided < rows.length ? "Decide every heading first" : undefined}
                >
                  {busy === "ready" && <Spinner />}
                  Mark ready
                </button>
              </>
            )}
            {(batch.status === "ready" || batch.status === "pulled") && (
              <button className={btn.secondary} onClick={() => setStatus("draft")} disabled={!!busy}>
                Reopen as draft
              </button>
            )}
            {batch.status === "applied" && (
              <button className={btn.secondary} onClick={() => setStatus("archived")} disabled={!!busy}>
                Archive
              </button>
            )}
            {batch.status === "archived" && (
              <>
                <button className={btn.ghost} onClick={deleteBatch}>
                  Delete
                </button>
                <button className={btn.secondary} onClick={() => setStatus("draft")} disabled={!!busy}>
                  Reopen as draft
                </button>
              </>
            )}
          </>
        }
      >
        <Help>
          <p>
            Go through each heading: <b>Include</b> it to have Claude Code model it, or <b>Skip</b> it. Instructions for the whole batch
            and for each heading go to Claude with the HTS text, the cited notes and the engine&apos;s nearby records.
          </p>
          <p>
            When every heading is decided, mark the batch ready and run the pull command. It writes the batch into{" "}
            <code>tariffs/coverage-batches/{batch.name}/</code>, and <code>/apply-batch {batch.name}</code> plans and implements it on
            branch <code>coverage/{batch.name}</code>. Headings show as modeled after the next refresh once the engine has them.
          </p>
        </Help>
      </PageHeader>

      {error && <Callout tone="error">{error}</Callout>}
      {batch.status === "ready" && (
        <Callout tone="success" title="Ready for Claude Code" action={<CopyCommand command={`npm run pull-batch -- ${batch.name}`} />}>
          Write the batch into the repo, then run <code>/apply-batch {batch.name}</code>.
        </Callout>
      )}
      {batch.status === "pulled" && (
        <Callout
          tone="info"
          title="Pulled into the repo"
          action={
            <div className="flex items-center gap-2">
              <input className={`${inputCls} input-xs h-7 w-64`} placeholder="Pull request URL (optional)" value={prUrl} onChange={(e) => setPrUrl(e.target.value)} />
              <button className={btn.xsPrimary} onClick={() => setStatus("applied", { pr_url: prUrl })} disabled={!!busy}>
                Mark applied
              </button>
            </div>
          }
        >
          Run <code>/apply-batch {batch.name}</code>. Mark the batch applied once its pull request is merged.
        </Callout>
      )}

      <StatGrid>
        <Stat label="Decided" value={<>{decided}<span className="text-base font-normal text-base-content/40"> / {rows.length}</span></>}>
          <ProgressBar value={decided} max={rows.length} className="mt-1" />
        </Stat>
        <Stat label="Include" value={count("include")} />
        <Stat label="Skip" value={count("skip")} />
        <Stat label="Modeled now" value={modeled} hint="As of the last refresh" />
        <Stat label="Claude cost" value={claudeCost ? formatUsd(claudeCost) : "—"} hint={`${rows.length - unsuggested} of ${rows.length} suggested`} />
      </StatGrid>

      <BatchSettings batch={batch} editable={!!editable} onSaved={setBatch} />

      {!rows.length ? (
        <Panel>
          <EmptyState title="No headings in this batch">Select headings on the dashboard and choose “Add to batch…”.</EmptyState>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="flex flex-col overflow-hidden rounded-lg border border-base-content/10 bg-base-100 shadow-sm lg:sticky lg:top-[4.25rem] lg:max-h-[calc(100vh-5.5rem)]">
            <div className="flex flex-col gap-2 border-b border-base-content/10 p-3">
              <input className={`${inputCls} w-full`} placeholder="Search code, text, instructions" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className={`${selectCls} select-xs h-8 min-h-8`} value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value as BatchDecision | "all")}>
                <option value="all">Any decision ({rows.length})</option>
                <option value="pending">Undecided ({count("pending")})</option>
                <option value="include">Included ({count("include")})</option>
                <option value="skip">Skipped ({count("skip")})</option>
              </select>
            </div>
            <ul className="flex-1 divide-y divide-base-content/5 overflow-y-auto">
              {visible.map((r) => {
                const category = resolvedCategory(r.item)
                return (
                  <li key={r.htsno}>
                    <button
                      className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-base-content/[0.03] ${
                        r.htsno === selectedCode ? "bg-base-content/[0.06]" : ""
                      }`}
                      onClick={() => setSelectedCode(r.htsno)}
                    >
                      <span className="flex items-center gap-2">
                        <StatusDot tone={DECISION_TONES[r.decision]} label={<span className="font-mono">{r.htsno}</span>} />
                        {r.decision !== "pending" && <span className="text-[11px] text-base-content/45">{r.decision === "include" ? "include" : "skip"}</span>}
                        {r.instructions && <Pill>note</Pill>}
                        {r.item.engine_modeled && <Pill tone="success">modeled</Pill>}
                      </span>
                      <span className="line-clamp-2 text-xs text-base-content/60">{r.item.description}</span>
                      {category && (
                        <span className={`text-[11px] ${r.item.category ? "text-base-content/55" : "italic text-base-content/40"}`}>
                          {categoryLabel(category)}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-base-content/10 px-3 py-1.5 text-[11px] text-base-content/45">
              <Kbd>j</Kbd>/<Kbd>k</Kbd> move · <Kbd>i</Kbd> include · <Kbd>s</Kbd> skip · <Kbd>u</Kbd> undecided
            </div>
          </aside>

          {selected ? (
            <HeadingReview
              key={selected.htsno}
              row={selected}
              data={data}
              editable={!!editable}
              onDecision={(d) => decide(d)}
              onInstructions={(text) => patchRow(selected.htsno, { instructions: text })}
              onRemove={() => remove(selected.htsno)}
              onPatched={applyItems}
              onNoteProgram={setNoteProgram}
            />
          ) : (
            <Panel>
              <EmptyState title="Pick a heading" />
            </Panel>
          )}
        </div>
      )}
    </div>
  )
}
