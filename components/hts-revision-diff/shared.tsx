"use client"

import type { WordOp } from "@/libs/hts-revision-diff/types"

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

const STATUS_STYLES: Record<string, string> = {
  uploaded: "badge-ghost",
  pending: "badge-ghost",
  not_needed: "badge-ghost",
  converting: "badge-info",
  processing: "badge-info",
  parsing: "badge-info",
  extracting_change_record: "badge-info",
  diffing: "badge-info",
  converted: "badge-success",
  complete: "badge-success",
  parsed: "badge-success",
  ready: "badge-success",
  approve: "badge-success",
  failed: "badge-error",
  skip: "badge-neutral",
  defer: "badge-warning",
}

export const BUSY_STATUSES = ["converting", "processing", "parsing", "extracting_change_record", "diffing"]

export const StatusBadge =({ status, label }: { status: string; label?: string }) => (
  <span className={`badge badge-sm whitespace-nowrap ${STATUS_STYLES[status] ?? "badge-ghost"}`}>
    {BUSY_STATUSES.includes(status) && <span className="loading loading-spinner loading-xs mr-1" />}
    {label ?? status.replace(/_/g, " ")}
  </span>
)

// Word diff with removed words struck through in red and added words in green
export const WordDiffView = ({ ops }: { ops: WordOp[] }) => (
  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
    {ops.map((op, i) =>
      op.op === "eq" ? (
        <span key={i}>{op.text} </span>
      ) : op.op === "add" ? (
        <ins key={i} className="rounded bg-success/25 px-0.5 no-underline">
          {op.text}{" "}
        </ins>
      ) : (
        <del key={i} className="rounded bg-error/25 px-0.5">
          {op.text}{" "}
        </del>
      )
    )}
  </p>
)

export const TextBlock = ({ text, tone }: { text: string; tone?: "add" | "del" }) => (
  <pre
    className={`max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md p-3 text-sm ${
      tone === "add" ? "bg-success/15" : tone === "del" ? "bg-error/15" : "bg-base-200"
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
