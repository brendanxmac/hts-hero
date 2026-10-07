// Shared types for the revision checker (/revision-checker)

export type DocumentKind = "change_record" | "ch99_pdf" | "ch99_json" | "ch99_headings_pdf"

export const DOCUMENT_KINDS: DocumentKind[] = [
  "change_record",
  "ch99_pdf",
  "ch99_headings_pdf",
  "ch99_json",
]

export const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  change_record: "Change record (PDF)",
  ch99_pdf: "Chapter 99 notes (PDF)",
  ch99_headings_pdf: "Chapter 99 heading pages (PDF)",
  ch99_json: "Chapter 99 (JSON)",
}

// The Chapter 99 JSON is optional: USITC only exports the current revision.
// When a revision is uploaded while it's current, a copy is saved
// automatically.
export const REQUIRED_DOCUMENT_KINDS: DocumentKind[] = ["change_record", "ch99_pdf"]

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
  // Optional background from the reviewer, exported as context.md for /apply-revision
  context_notes?: string | null
  context_notes_updated_at?: string | null
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

// A Chapter 99 heading row read from a revision's tariff-table pages (or
// entered by hand), with Claude's check and the reviewer's sign-off
export interface HeadingRow {
  id: string
  attempt_id: string
  sort_order: number
  htsno: string // "" for description-only rows
  stat_suffix: string
  indent: number
  description: string
  general: string
  special: string
  other: string // column 2
  units: string
  footnotes: string[]
  page: number | null
  source: "pdf" | "manual"
  claude_status: "pending" | "ok" | "corrected" | "added" | "flagged" | null
  claude_notes: string | null
  parser_original: Partial<HeadingRow> | null
  reviewed: boolean
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export type HeadingFields = Pick<
  HeadingRow,
  "htsno" | "stat_suffix" | "indent" | "description" | "general" | "special" | "other" | "units" | "footnotes" | "page"
>

export interface ComparisonRow {
  id: string
  from_attempt_id: string
  to_attempt_id: string
  status: ComparisonStatus
  error: string | null
  stats: ComparisonStats | null
  diff_version: string | null
  exported_at: string | null
  // Claude's high-level overview of the change record's changes (Generate revision summary)
  revision_summary?: RevisionSummary | null
  created_at: string
  updated_at: string
}

export interface RevisionSummary {
  headline: string
  overview: string
  programs: string[] // e.g. "Section 232: steel and aluminum"
  countries: string[] // ["All countries"] when not country-specific
  key_changes: string[]
  calculation_impact: string
  effective_dates: { date: string; applies_to: string }[]
  watch_for: string[]
  changes_covered?: number // change record changes it was generated from
  approved_changes?: number // older summaries: generated from approved changes
  generated_at: string
  usage?: ClaudeUsage
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
  // The revision the documents say they are (from their titles), and the one
  // the change record says it follows
  detectedRevision?: { ch99Pdf: string | null; changeRecord: string | null; previous: string | null }
  // What reading the change record with Claude cost (kept across re-parses)
  changeRecordUsage?: ClaudeUsage | null
  // change_record_extracted_at of the reading whose citations the parse used
  changeRecordHintsFrom?: string | null
}

// parse_stats can hold heading-page state (headingPages) before the notes are parsed,
// so only treat it as parse results once the counts are there
export const hasParseResults = (stats: ParseStats | null | undefined): stats is ParseStats =>
  typeof stats?.nodes === "number"

export interface ClaudeUsage {
  model: string
  input_tokens: number
  output_tokens: number // includes thinking
  cache_read_input_tokens: number
  cache_creation_input_tokens: number
  cost_usd: number
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
  // Code ranges whose ends moved ("9903.82.02–9903.82.17" -> "…–9903.82.19"),
  // and ranges that appear or disappear outright (diff-2 and later)
  rangeChanges?: RangeChange[]
  fromPage: number | null
  toPage: number | null
}

export interface RangeChange {
  before: string | null // "9903.82.02–9903.82.17"
  after: string | null
  description: string // "extended at the end: now runs to 9903.82.19"
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

// Subchapter III headings on a revision's heading pages, against the list read from
// USITC's archived Chapter 99 PDF for that revision
export interface HeadingCoverage {
  expected: number
  complete: boolean
  missingCount: number
  missing: string[] // in the archive but not on the pages (first 100)
  unexpected: string[] // on the pages but not in the archive: check the heading number (first 100)
}

// A heading the change record cites, looked up in the newer revision's
// Chapter 99 JSON (when there is one)
export interface CitedHeading {
  code: string
  // The heading in the newer revision
  status: "found" | "not_found" | "unverified"
  row: HtsRow | null
  // The same heading in the older revision (its JSON or reviewed heading pages).
  // Missing on comparisons built before this was added.
  beforeStatus?: "found" | "not_found" | "unverified"
  before?: HtsRow | null
}

export interface ChangePayload {
  hash: string
  changeRecordItems: ChangeRecordItem[]
  noteDiffs: NoteDiff[]
  codeDiffs: CodeDiff[]
  citedHeadings?: CitedHeading[]
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
  // "full": both revisions have Chapter 99 JSON, so every heading is diffed.
  // "heading_pages_full": both revisions have every subchapter III heading (on
  // their heading pages, or in JSON), so every subchapter III heading is diffed,
  // including added and removed ones; other subchapters as for "heading_pages".
  // "heading_pages": headings that appear on both revisions' heading pages are
  // diffed; added and removed headings come from the change record only.
  // "change_record_only": heading changes come from the change record only.
  headingDiff?: "full" | "heading_pages_full" | "heading_pages" | "change_record_only"
  // Each side's heading pages against USITC's archived Chapter 99 PDF (null when
  // the side has JSON, no heading pages, or the archive doesn't cover the revision)
  headingCoverage?: HeadingCoverage | null
  fromHeadingCoverage?: HeadingCoverage | null
  // Where cited headings were looked up: the newer revision's JSON, its
  // reviewed heading pages, or nowhere
  headingSource?: "revision_json" | "revision_pdf" | "none"
  // Heading rows not reviewed when this was built (all of them; the ones that matter
  // are those used by changes, worked out when the comparison is viewed)
  unreviewedHeadingRows?: number
  // headingRowsFingerprint() of the newer attempt's rows when this was built
  headingRowsFingerprint?: string
  // The same, for the older revision (where cited headings' "before" comes from)
  fromHeadingSource?: "revision_json" | "revision_pdf" | "none"
  fromUnreviewedHeadingRows?: number
  fromHeadingRowsFingerprint?: string
  changes: Record<ChangeSource, number>
  carriedOverReviews: number
  // From the newer revision's change record ("after 2026 Revision 5")
  changeRecordFollows?: string | null
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
  // summary-2 and later
  matches_change_record?: { status: "yes" | "partly" | "no" | "not_applicable"; note: string }
  // summary-1 only
  change_record_consistency?: string
  open_questions: string[]
  usage?: ClaudeUsage
}
