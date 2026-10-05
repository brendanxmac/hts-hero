"use client"

import type { WordOp } from "@/libs/hts-revision-diff/types"
import { StatusDot, type Tone } from "./ui"

export const api = async <T = any,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/hts-revision-diff${path}`, {
    cache: "no-store",
    ...init,
    headers: init?.body && !(init.body instanceof FormData)
      ? { "Content-Type": "application/json", ...init?.headers }
      : init?.headers,
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`)
  return body as T
}

// Every status maps to one tone, so a color always means the same thing
const STATUS_TONES: Record<string, Tone> = {
  uploaded: "neutral",
  pending: "neutral",
  not_needed: "neutral",
  converting: "info",
  processing: "info",
  parsing: "info",
  extracting_change_record: "info",
  diffing: "info",
  converted: "success",
  complete: "success",
  parsed: "success",
  ready: "success",
  approve: "success",
  failed: "error",
  skip: "neutral",
  defer: "warning",
}

const STATUS_LABELS: Record<string, string> = {
  extracting_change_record: "reading change record",
  approve: "approved",
  defer: "deferred",
  skip: "skipped",
  not_needed: "no conversion needed",
}

export const BUSY_STATUSES = ["converting", "processing", "parsing", "extracting_change_record", "diffing"]

export const statusTone = (status: string): Tone => STATUS_TONES[status] ?? "neutral"

export const StatusBadge = ({ status, label }: { status: string; label?: string }) => {
  const text = label ?? STATUS_LABELS[status] ?? status.replace(/_/g, " ")
  return (
    <StatusDot
      tone={statusTone(status)}
      busy={BUSY_STATUSES.includes(status)}
      label={text.charAt(0).toUpperCase() + text.slice(1)}
    />
  )
}

// Word diff with removed words struck through in red and added words in green
export const WordDiffView = ({ ops }: { ops: WordOp[] }) => (
  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-base-content/85">
    {ops.map((op, i) =>
      op.op === "eq" ? (
        <span key={i}>{op.text} </span>
      ) : op.op === "add" ? (
        <ins key={i} className="rounded-sm bg-success/20 px-0.5 text-base-content no-underline">
          {op.text}{" "}
        </ins>
      ) : (
        <del key={i} className="rounded-sm bg-error/15 px-0.5 text-base-content/60 decoration-error/60">
          {op.text}{" "}
        </del>
      )
    )}
  </p>
)

export const TextBlock = ({ text, tone }: { text: string; tone?: "add" | "del" }) => (
  <pre
    className={`max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md border-l-2 px-3 py-2.5 font-sans text-sm leading-relaxed ${
      tone === "add"
        ? "border-success/60 bg-success/[0.06]"
        : tone === "del"
          ? "border-error/60 bg-error/[0.06]"
          : "border-base-content/15 bg-base-content/[0.03]"
    }`}
  >
    {text || "(no text of its own)"}
  </pre>
)

export const formatBytes = (bytes: number | null) => {
  if (!bytes) return ""
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${Math.round(bytes / 1000)} KB`
}

export const formatTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : ""
