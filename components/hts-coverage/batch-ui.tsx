"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BATCH_NAME_PATTERN, OPEN_BATCH_STATUSES, slugify, type BatchStatus } from "@/libs/hts-coverage/constants"
import type { BatchSummary, CoverageBatch } from "@/libs/hts-coverage/types"
import { Callout, EmptyState, Field, Modal, Panel, Pill, ProgressBar, Spinner, btn, inputCls, type Tone } from "../hts-revision-diff/ui"
import { coverageApi } from "./api"

export const BATCH_STATUS_TONES: Record<BatchStatus, Tone> = {
  draft: "neutral",
  ready: "success",
  pulled: "info",
  applied: "success",
  archived: "neutral",
}

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  draft: "Draft",
  ready: "Ready to pull",
  pulled: "Pulled",
  applied: "Applied",
  archived: "Archived",
}

export const BatchesPanel = ({ batches, disabled, onNew }: { batches: BatchSummary[]; disabled: boolean; onNew: () => void }) => {
  const [showClosed, setShowClosed] = useState(false)
  const open = batches.filter((b) => OPEN_BATCH_STATUSES.includes(b.status))
  const shown = showClosed ? batches : open
  return (
    <Panel
      title="Batches"
      count={open.length}
      actions={
        <>
          {batches.length > open.length && (
            <button className={btn.xsGhost} onClick={() => setShowClosed((s) => !s)}>
              {showClosed ? "Hide applied and archived" : `Show all (${batches.length})`}
            </button>
          )}
          <button className={btn.xsSecondary} onClick={onNew} disabled={disabled}>
            New batch
          </button>
        </>
      }
    >
      {!shown.length ? (
        <EmptyState title="No open batches">Select headings below and choose “Add to batch…”, or start an empty one.</EmptyState>
      ) : (
        <ul className="divide-y divide-base-content/5">
          {shown.map((b) => (
            <li key={b.id}>
              <Link href={`/coverage-checker/batches/${b.id}`} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm hover:bg-base-content/[0.03]">
                <span className="min-w-0 flex-1 truncate font-medium">{b.title}</span>
                <span className="font-mono text-xs text-base-content/45">{b.name}</span>
                <Pill tone={BATCH_STATUS_TONES[b.status]}>{BATCH_STATUS_LABELS[b.status]}</Pill>
                <span className="w-44 text-right text-xs tabular-nums text-base-content/60">
                  {b.counts.total - b.counts.pending}/{b.counts.total} decided · {b.counts.modeled} modeled
                </span>
                <ProgressBar value={b.counts.total - b.counts.pending} max={b.counts.total} className="w-24" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

// Creates a batch (optionally with headings), or adds headings to an existing draft batch
export const BatchModal = ({
  mode,
  htsnos,
  batches,
  onClose,
  onDone,
}: {
  mode: "new" | "add"
  htsnos: string[]
  batches: BatchSummary[]
  onClose: () => void
  onDone: () => Promise<void>
}) => {
  const router = useRouter()
  const [target, setTarget] = useState<string>(mode === "add" && batches.length ? batches[0].id : "new")
  const [title, setTitle] = useState("")
  const [name, setName] = useState("")
  const [nameEdited, setNameEdited] = useState(false)
  const [instructions, setInstructions] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ batchId: string; added: number; conflicts: { htsno: string; batch: string }[] } | null>(null)

  const slug = nameEdited ? name : slugify(title)
  const creating = target === "new"
  const valid = !creating || (title.trim() && BATCH_NAME_PATTERN.test(slug))

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      if (creating) {
        const r = await coverageApi<{ batch: CoverageBatch; added: { added: number; conflicts: { htsno: string; batch: string }[] } | null }>("/batches", {
          method: "POST",
          body: JSON.stringify({ title, name: slug, instructions, htsnos }),
        })
        setResult({ batchId: r.batch.id, added: r.added?.added ?? 0, conflicts: r.added?.conflicts ?? [] })
      } else {
        const r = await coverageApi<{ added: number; conflicts: { htsno: string; batch: string }[] }>(`/batches/${target}/items`, {
          method: "POST",
          body: JSON.stringify({ htsnos }),
        })
        setResult({ batchId: target, ...r })
      }
      await onDone()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={mode === "new" ? "New batch" : `Add ${htsnos.length} heading${htsnos.length === 1 ? "" : "s"} to a batch`}
      description="A batch is a chunk of headings for Claude Code to add to the engine together."
      footer={
        result ? (
          <>
            <button className={btn.ghost} onClick={onClose}>
              Close
            </button>
            <button className={btn.primary} onClick={() => router.push(`/coverage-checker/batches/${result.batchId}`)}>
              Open batch
            </button>
          </>
        ) : (
          <>
            <button className={btn.ghost} onClick={onClose}>
              Cancel
            </button>
            <button className={btn.primary} onClick={submit} disabled={busy || !valid}>
              {busy && <Spinner />}
              {creating ? "Create batch" : "Add"}
            </button>
          </>
        )
      }
    >
      {result ? (
        <div className="flex flex-col gap-3">
          <Callout tone="success">
            Added {result.added} heading{result.added === 1 ? "" : "s"}.
          </Callout>
          {result.conflicts.length > 0 && (
            <Callout tone="warning" title={`${result.conflicts.length} skipped: already in another open batch`}>
              <span className="font-mono text-xs">{result.conflicts.map((c) => `${c.htsno} (${c.batch})`).join(", ")}</span>
            </Callout>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {error && <Callout tone="error">{error}</Callout>}
          {mode === "add" && (
            <div className="flex flex-col gap-1.5">
              {batches.map((b) => (
                <label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" className="radio radio-xs" checked={target === b.id} onChange={() => setTarget(b.id)} />
                  <span className="font-medium">{b.title}</span>
                  <span className="text-xs text-base-content/45">{b.counts.total} headings</span>
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="radio" className="radio radio-xs" checked={creating} onChange={() => setTarget("new")} />
                <span className="font-medium">A new batch</span>
              </label>
            </div>
          )}
          {creating && (
            <>
              <Field label="Title">
                <input className={inputCls} value={title} autoFocus placeholder="e.g. Section 301 China exclusions" onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Name" hint="Used for the folder (tariffs/coverage-batches/<name>) and branch (coverage/<name>)">
                <input
                  className={`${inputCls} font-mono`}
                  value={slug}
                  onChange={(e) => {
                    setNameEdited(true)
                    setName(e.target.value)
                  }}
                />
              </Field>
              <Field label="Instructions for Claude" hint="Optional now; editable on the batch page">
                <textarea
                  className="textarea textarea-bordered textarea-sm min-h-20 border-base-content/15 bg-base-100 text-sm"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </Field>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
