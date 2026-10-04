import type { NoteCitation } from "../../tariffs/engine-v2/citations"
import type { Category, CoverageStatus, Priority } from "./constants"

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
