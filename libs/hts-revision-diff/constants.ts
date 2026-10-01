// Names for everything the revision checker owns in Supabase. All prefixed so
// they stay separate from the app's existing tables and buckets.
export const RevisionDiffTables = {
  REVISIONS: "hts_revision_diff_revisions",
  ATTEMPTS: "hts_revision_diff_attempts",
  DOCUMENTS: "hts_revision_diff_documents",
  COMPARISONS: "hts_revision_diff_comparisons",
  CHANGES: "hts_revision_diff_changes",
} as const

export const REVISION_DIFF_BUCKET = "hts-revision-diff-parsing"

// Only this user can open /revision-checker or call its API routes
export const REVISION_DIFF_ADMIN_EMAIL = "brendan@htshero.com"

// The tool only runs where this is set (local development against the dev
// project). Everywhere else its page and routes return 404.
export const isRevisionToolEnabled = () =>
  process.env.HTS_REVISION_TOOL_ENABLED === "true"

export const CLAUDE_MODEL = "claude-opus-5-5"

// Bump when parsing or diffing output changes shape, so stored results show
// which version produced them
export const PARSER_VERSION = "ch99-notes-1"
export const DIFF_VERSION = "diff-1"
export const SUMMARY_PROMPT_VERSION = "summary-1"
export const CHANGE_RECORD_PROMPT_VERSION = "change-record-1"

// "2026HTSRev5", "2026HTSBasic", "2025HTSRev32"
export const REVISION_NAME_PATTERN = /^\d{4}HTS(Basic|Rev\d+)$/
