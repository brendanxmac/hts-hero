// Names and vocabularies for the coverage checker (/coverage-checker). Tables are prefixed so they
// stay separate from the app's other tables. Access uses the revision checker's admin gate.

export const CoverageTables = {
  ITEMS: "hts_coverage_items",
  BATCHES: "hts_coverage_batches",
  BATCH_ITEMS: "hts_coverage_batch_items",
  NOTE_PROGRAMS: "hts_coverage_note_programs",
  SNAPSHOTS: "hts_coverage_snapshots",
} as const

// Set in the UI. "open" means the heading is in effect; whether it's modeled comes from the engine.
export const STATUSES = ["open", "needs_review", "expired", "ftz_suspended", "out_of_scope"] as const
export type CoverageStatus = (typeof STATUSES)[number]

// What the dashboard shows: the set status, or for open headings, modeled / in a batch / missing
export const DISPLAY_STATUSES = ["missing", "queued", "in_progress", "modeled", "needs_review", "expired", "ftz_suspended", "out_of_scope"] as const
export type DisplayStatus = (typeof DISPLAY_STATUSES)[number]

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  missing: "Missing",
  queued: "Queued",
  in_progress: "In progress",
  modeled: "Modeled",
  needs_review: "Needs review",
  expired: "Expired",
  ftz_suspended: "FTZ-suspended",
  out_of_scope: "Out of scope",
}

// Statuses that take a heading out of what's left to model
export const EXCLUDED_STATUSES: CoverageStatus[] = ["expired", "ftz_suspended", "out_of_scope"]

export const CATEGORIES = [
  "additional_ad_valorem",
  "flat_rate",
  "specific_compound",
  "tariff_rate_quota",
  "quantitative_quota",
  "exclusion",
  "safeguard",
  "fta_tpl",
  "reporting",
  "other",
] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  additional_ad_valorem: "Additional ad valorem",
  flat_rate: "Flat rate (replaces base)",
  specific_compound: "Specific / compound",
  tariff_rate_quota: "Tariff-rate quota",
  quantitative_quota: "Quantitative quota",
  exclusion: "Exclusion / exemption",
  safeguard: "Safeguard",
  fta_tpl: "FTA / TPL",
  reporting: "Reporting only",
  other: "Other",
}

export const PRIORITIES = ["P0", "P1", "P2", "P3"] as const
export type Priority = (typeof PRIORITIES)[number]

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII"]

// Heading 99NN is in subchapter NN of chapter 99: "9904" → "IV"
export const subchapterRoman = (prefix: string) => ROMAN[Number(prefix.slice(2))] ?? prefix.slice(2)

// Only the subchapters the calculator works with are described; the rest are labeled by number
const SUBCHAPTER_NAMES: Record<string, string> = {
  "9902": "Temporary duty reductions (MTB)",
  "9903": "Temporary modifications (232, 301, 122, IEEPA, 201, 338, …)",
  "9904": "Section 22 quantitative limitations",
}

export const subchapterLabel = (prefix: string) => {
  const name = SUBCHAPTER_NAMES[prefix]
  return `Subchapter ${subchapterRoman(prefix)}${name ? ` – ${name}` : ""}`
}

// ---------- Batches ----------

export const BATCH_STATUSES = ["draft", "ready", "pulled", "applied", "archived"] as const
export type BatchStatus = (typeof BATCH_STATUSES)[number]

// A heading can be in only one open batch at a time
export const OPEN_BATCH_STATUSES: BatchStatus[] = ["draft", "ready", "pulled"]

export const BATCH_DECISIONS = ["pending", "include", "skip"] as const
export type BatchDecision = (typeof BATCH_DECISIONS)[number]

export const DATES_MODES = ["earliest_verified", "backfill"] as const
export type DatesMode = (typeof DATES_MODES)[number]

export const DATES_MODE_LABELS: Record<DatesMode, string> = {
  // The stored value predates the change to "no placeholder dates"; the label says what it does now
  earliest_verified: "Start date from the heading text only",
  backfill: "Research and backfill real history",
}

// Batch names become a folder (tariffs/coverage-batches/<name>) and a branch (coverage/<name>)
export const BATCH_NAME_PATTERN = /^[a-z0-9][a-z0-9-]{1,59}$/

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)

export const SUGGESTION_PROMPT_VERSION = "coverage-suggest-1"
// Headings per "Suggest with Claude" call
export const SUGGEST_CHUNK = 8
