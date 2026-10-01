// Shared types for the revision checker (/revision-checker)

export type DocumentKind = "change_record" | "ch99_pdf" | "ch99_json"

export const DOCUMENT_KINDS: DocumentKind[] = [
  "change_record",
  "ch99_pdf",
  "ch99_json",
]

export const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  change_record: "Change record (PDF)",
  ch99_pdf: "Chapter 99 (PDF)",
  ch99_json: "Chapter 99 (JSON)",
}

export type ConversionStatus =
  | "not_needed"
  | "pending"
  | "processing"
  | "complete"
  | "failed"

export type AttemptStatus =
  | "uploaded"
  | "converting"
  | "converted"
  | "parsing"
  | "parsed"
  | "failed"

export type ComparisonStatus =
  | "pending"
  | "extracting_change_record"
  | "diffing"
  | "ready"
  | "failed"

export type Decision = "pending" | "approve" | "skip" | "defer"
export type Category = "data" | "logic" | "mixed" | "none"
export type ChangeSource =
  | "change_record"
  | "not_in_change_record"
  | "change_record_no_diff"

// ---------- Database rows ----------

export interface RevisionRow {
  id: string
  name: string
  title: string | null
  active_attempt_id: string | null
  created_at: string
  updated_at: string
}

export interface AttemptRow {
  id: string
  revision_id: string
  attempt_number: number
  status: AttemptStatus
  error: string | null
  notes_path: string | null
  hts_rows_path: string | null
  parse_stats: ParseStats | null
  parse_warnings: ParseWarning[] | null
  parser_version: string | null
  parsed_at: string | null
  change_record_items: ChangeRecordItem[] | null
  change_record_model: string | null
  change_record_extracted_at: string | null
  created_at: string
  updated_at: string
}

export interface DocumentRow {
  id: string
  attempt_id: string
  kind: DocumentKind
  original_filename: string
  storage_path: string
  size_bytes: number | null
  conversion_status: ConversionStatus
  datalab_request_id: string | null
  datalab_check_url: string | null
  markdown_path: string | null
  page_count: number | null
  error: string | null
  submitted_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface ComparisonRow {
  id: string
  from_attempt_id: string
  to_attempt_id: string
  status: ComparisonStatus
  error: string | null
  stats: ComparisonStats | null
  diff_version: string | null
  exported_at: string | null
  created_at: string
  updated_at: string
}

export interface ChangeRow {
  id: string
  comparison_id: string
  sort_order: number
  change_key: string
  source: ChangeSource
  title: string
  payload: ChangePayload
  summary: ChangeSummary | null
  summary_model: string | null
  summary_prompt_version: string | null
  summarized_at: string | null
  summary_error: string | null
  category: Category | null
  decision: Decision
  reviewer_notes: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

// ---------- Parsed Chapter 99 notes ----------

export interface NoteNode {
  key: string // "sub-III/us-notes/2(v)(xi)"
  groupKey: string // "sub-III/us-notes"
  subchapter: string | null // "III", null for chapter-level notes
  group: string // "U.S. Notes"
  citation: string // "2(v)(xi)", "" for text before the first note
  topNote: string | null // "2"
  parentKey: string | null
  depth: number
  label: string // "Subchapter III, U.S. note 2(v)(xi)"
  text: string // this node's own text (children excluded)
  htsCodes: string[] // codes mentioned in this node's own text
  page: number | null // PDF page the node starts on
  order: number
}

export interface ParseWarning {
  kind: string
  message: string
  key?: string
  page?: number | null
}

export interface ParseStats {
  nodes: number
  topLevelNotes: number
  subchapters: string[]
  groups: { groupKey: string; label: string; topLevelNotes: number; nodes: number }[]
  htsCodesMentioned: number
  pages: number | null
  htsRows: number
  htsRowsWithCode: number
  warnings: number
}

export interface ParsedNotes {
  parserVersion: string
  nodes: NoteNode[]
  subchapterTitles: Record<string, string>
  warnings: ParseWarning[]
}

// ---------- Parsed Chapter 99 JSON rows ----------

export interface HtsRow {
  key: string // htsno, or a stable key for rows without one
  htsno: string
  indent: number
  description: string
  general: string
  special: string
  other: string
  units: string[]
  footnotes: string[]
  parentHtsno: string | null // nearest row above with an htsno
  order: number
}

// ---------- Change record ----------

export interface ChangeRecordItem {
  id: string // "CR-1"
  in_chapter_99: boolean
  kind: "note" | "hts_code" | "other"
  action: "added" | "modified" | "deleted" | "redesignated" | "other"
  subchapter: string | null // "III"
  note_type: "us_note" | "statistical_note" | "chapter_note" | "other" | null
  note_citations: string[] // ["2(v)(xi)", "20(a)"]
  hts_codes: string[] // ["9903.01.25"]
  hts_code_ranges: { from: string; to: string }[]
  description: string
  effective_date: string | null
  authority: string | null
  source_text: string // verbatim from the change record
}

// ---------- Diffs ----------

export type WordOp = { op: "eq" | "add" | "del"; text: string }

export interface NoteDiff {
  status: "added" | "removed" | "modified" | "renumbered"
  key: string // key in the newer revision (older for removed)
  fromKey: string | null
  toKey: string | null
  label: string
  fromLabel: string | null
  topNoteKey: string // "sub-III/us-notes/2"
  before: string | null
  after: string | null
  words: WordOp[] | null
  codesAdded: string[]
  codesRemoved: string[]
  fromPage: number | null
  toPage: number | null
}

export interface CodeFieldChange {
  field: string
  before: string
  after: string
  words: WordOp[] | null
}

export interface CodeDiff {
  status: "added" | "removed" | "modified"
  key: string
  htsno: string
  description: string
  fields: CodeFieldChange[]
  before: HtsRow | null
  after: HtsRow | null
}

export interface ContextBlock {
  key: string
  label: string
  revision: "from" | "to"
  reason: string
  text: string
}

export interface ChangePayload {
  hash: string
  changeRecordItems: ChangeRecordItem[]
  noteDiffs: NoteDiff[]
  codeDiffs: CodeDiff[]
  context: ContextBlock[]
  warnings: string[]
}

export interface ComparisonStats {
  fromRevision: string
  toRevision: string
  consecutive: boolean | null
  changeRecordItems: number
  changeRecordItemsInCh99: number
  noteDiffs: Record<NoteDiff["status"], number>
  codeDiffs: Record<CodeDiff["status"], number>
  changes: Record<ChangeSource, number>
  carriedOverReviews: number
}

// ---------- AI summary ----------

export interface SummaryClaim {
  statement: string
  citation: string
  quote: string
  verified?: boolean // set by us: the quote appears in the material sent
}

export interface ChangeSummary {
  headline: string
  summary: string
  what_changed: SummaryClaim[]
  category: Category
  category_reason: string
  effective_dates: { date: string; applies_to: string }[]
  affected_hts_codes: string[]
  engine_impact: string
  change_record_consistency: string
  open_questions: string[]
}
