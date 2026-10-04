import { noteKeys } from "@/libs/hts-coverage/analyze"
import { CATEGORY_LABELS, EXCLUDED_STATUSES, type Category, type DisplayStatus } from "@/libs/hts-coverage/constants"
import type { BatchMembership, BatchSummary, CoverageItem, CoverageSnapshot } from "@/libs/hts-coverage/types"
import type { Tone } from "../hts-revision-diff/ui"

export interface NotePrograms {
  suggested: Record<string, string>
  overrides: Record<string, string>
}

export interface DashboardData {
  items: CoverageItem[]
  snapshots: CoverageSnapshot[]
  notePrograms: NotePrograms
  programs: { id: string; name: string }[]
  stale: string[]
  batches: BatchSummary[]
  memberships: Record<string, BatchMembership>
  pendingMigration: string | null
}

// A heading in an open batch is queued (draft or ready) or in progress (pulled into the repo),
// unless it's skipped there
export const displayStatus = (item: CoverageItem, membership?: BatchMembership): DisplayStatus => {
  if (EXCLUDED_STATUSES.includes(item.status)) return item.status as DisplayStatus
  if (item.engine_modeled) return "modeled"
  if (membership && membership.decision !== "skip") return membership.status === "pulled" ? "in_progress" : "queued"
  return item.status === "needs_review" ? "needs_review" : "missing"
}

export const STATUS_TONES: Record<DisplayStatus, Tone> = {
  missing: "warning",
  queued: "info",
  in_progress: "info",
  modeled: "success",
  needs_review: "info",
  expired: "neutral",
  ftz_suspended: "neutral",
  out_of_scope: "neutral",
}

// The heading's U.S. notes, as note-program keys ("III:20")
export const noteKeysOf = (item: CoverageItem) => Array.from(new Set(item.note_citations.flatMap(noteKeys)))

// Your mappings first (most specific note first), then the suggestions
export const programFromNotes = (item: CoverageItem, notePrograms: NotePrograms) => {
  const keys = noteKeysOf(item)
  for (const map of [notePrograms.overrides, notePrograms.suggested]) {
    const key = keys.find((k) => map[k])
    if (key) return map[key]
  }
  return null
}

// The program shown: set on the heading, else what the engine models it as, else from its notes,
// else Claude's suggestion
export const resolvedProgram = (item: CoverageItem, notePrograms: NotePrograms) =>
  item.program ?? item.engine_programs[0] ?? programFromNotes(item, notePrograms) ?? item.claude_suggestion?.program ?? null

// Set on the heading, else Claude's suggestion, else the guess from the rate and wording
export const resolvedCategory = (item: CoverageItem): Category | null =>
  item.category ?? item.claude_suggestion?.category ?? item.category_suggested

export const categoryLabel = (category: Category | null) => (category ? CATEGORY_LABELS[category] : "—")

// "Starts Nov 10, 2026" when the heading takes effect after today
export const upcomingStart = (item: CoverageItem, today: string) => (item.starts_on && item.starts_on > today ? item.starts_on : null)

export const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

export const localToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
