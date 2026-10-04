import type { NoteCitation } from "../../tariffs/engine-v2/citations"
import type { ClaudeUsage } from "../hts-revision-diff/types"
import type { BatchDecision, BatchStatus, Category, CoverageStatus, DatesMode, Priority } from "./constants"

// A row of hts_coverage_items
export interface CoverageItem {
  htsno: string
  subchapter: string
  description: string
  general: string
  special: string
  other: string
  footnotes: string[]
  note_citations: NoteCitation[]
  starts_on: string | null
  in_hts: boolean
  first_seen_revision: string | null
  last_seen_revision: string | null
  engine_modeled: boolean
  engine_active: boolean
  engine_referenced: boolean
  engine_programs: string[]
  category_suggested: Category | null
  claude_suggestion: ClaudeSuggestion | null
  status: CoverageStatus
  status_note: string | null
  category: Category | null
  program: string | null
  priority: Priority | null
  notes: string | null
  refreshed_at: string | null
  created_at: string
  updated_at: string
}

// The fields the UI can change
export type CoveragePatch = Partial<Pick<CoverageItem, "status" | "status_note" | "category" | "program" | "priority" | "notes">>

export interface CoverageCounts {
  total: number // headings in the HTS
  excluded: number // expired, FTZ-suspended, out of scope
  inEffect: number
  modeled: number // in effect and modeled
  missing: number
  bySubchapter: Record<string, { inEffect: number; modeled: number }>
}

// A row of hts_coverage_snapshots
export interface CoverageSnapshot {
  id: string
  revision: string | null
  counts: CoverageCounts
  created_at: string
}

// Claude's read of one heading
export interface ClaudeSuggestion {
  category: Category
  program: string | null // an engine program id
  new_program: string | null // a program to create, when none fits
  summary: string // what the heading does, in plain English
  modeling: string // what the engine needs to model it
  complexity: "low" | "medium" | "high"
  model: string
  prompt_version: string
  usage: ClaudeUsage | null // shared by the headings in one call, split evenly
  created_at: string
}

// A row of hts_coverage_batches
export interface CoverageBatch {
  id: string
  name: string
  title: string
  status: BatchStatus
  instructions: string | null
  dates_mode: DatesMode
  pr_url: string | null
  pulled_at: string | null
  applied_at: string | null
  created_at: string
  updated_at: string
}

// A row of hts_coverage_batch_items
export interface CoverageBatchItem {
  batch_id: string
  htsno: string
  sort_order: number
  decision: BatchDecision
  instructions: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

// Which open batch a heading is in
export interface BatchMembership {
  batch_id: string
  name: string
  title: string
  status: BatchStatus
  decision: BatchDecision
}

export interface BatchSummary extends CoverageBatch {
  counts: { total: number; include: number; skip: number; pending: number; modeled: number }
}
