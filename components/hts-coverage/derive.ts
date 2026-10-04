import { noteKey } from "@/libs/hts-coverage/analyze"
import { CATEGORY_LABELS, EXCLUDED_STATUSES, type Category, type DisplayStatus } from "@/libs/hts-coverage/constants"
import type { CoverageItem, CoverageSnapshot } from "@/libs/hts-coverage/types"
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
}

export const displayStatus = (item: CoverageItem): DisplayStatus => {
  if (EXCLUDED_STATUSES.includes(item.status)) return item.status as DisplayStatus
  if (item.engine_modeled) return "modeled"
  return item.status === "needs_review" ? "needs_review" : "missing"
}

export const STATUS_TONES: Record<DisplayStatus, Tone> = {
  missing: "warning",
  modeled: "success",
  needs_review: "info",
  expired: "neutral",
  ftz_suspended: "neutral",
  out_of_scope: "neutral",
}

// The heading's U.S. notes, as note-program keys ("III:20")
export const noteKeysOf = (item: CoverageItem) =>
  Array.from(new Set(item.note_citations.map(noteKey).filter((k): k is string => !!k)))

export const programFromNotes = (item: CoverageItem, notePrograms: NotePrograms) => {
  for (const key of noteKeysOf(item)) {
    const program = notePrograms.overrides[key] ?? notePrograms.suggested[key]
    if (program) return program
  }
  return null
}

// The program shown: set on the heading, else what the engine models it as, else from its notes
export const resolvedProgram = (item: CoverageItem, notePrograms: NotePrograms) =>
  item.program ?? item.engine_programs[0] ?? programFromNotes(item, notePrograms)

export const resolvedCategory = (item: CoverageItem): Category | null => item.category ?? item.category_suggested

export const categoryLabel = (category: Category | null) => (category ? CATEGORY_LABELS[category] : "—")

// "Starts Nov 10, 2026" when the heading takes effect after today
export const upcomingStart = (item: CoverageItem, today: string) => (item.starts_on && item.starts_on > today ? item.starts_on : null)

export const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

export const localToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
