// Chapter 99 heading rows from a revision's trimmed tariff-table pages:
// extracted from datalab's markdown, checked by Claude against the PDF pages,
// corrected or added by hand, and signed off by the reviewer. Only reviewed
// rows are used by comparisons and the pull script.

import type { RevisionDb } from "./access"
import { checkHeadingRows } from "./claude"
import { RevisionDiffTables as T } from "./constants"
import { parseCh99HeadingTables } from "./parse-ch99-tables"
import { downloadBlob, downloadText } from "./storage"
import { normalizeForCompare, normalizeHtsCode } from "./text"
import type { AttemptRow, ClaudeUsage, DocumentRow, HeadingFields, HeadingRow, HtsRow, ParseStats, ParseWarning } from "./types"

export interface HeadingPagesInfo {
  parsedAt: string | null
  warnings: ParseWarning[]
  check: { at: string; issues: string[]; usage: ClaudeUsage } | null
  checking: boolean
  error: string | null
}

const FIELDS: (keyof HeadingFields)[] = [
  "htsno",
  "stat_suffix",
  "indent",
  "description",
  "general",
  "special",
  "other",
  "units",
  "footnotes",
  "page",
]

export const loadHeadingRows = async (db: RevisionDb, attemptId: string) => {
  const { data, error } = await db.from(T.HEADING_ROWS).select("*").eq("attempt_id", attemptId).order("sort_order")
  if (error) throw new Error(`Load heading rows: ${error.message}`)
  return (data ?? []) as HeadingRow[]
}

const loadAttemptRow = async (db: RevisionDb, attemptId: string) => {
  const { data, error } = await db.from(T.ATTEMPTS).select("*").eq("id", attemptId).single()
  if (error) throw new Error(error.message)
  return data as AttemptRow
}

const headingsDocument = async (db: RevisionDb, attemptId: string) => {
  const { data } = await db.from(T.DOCUMENTS).select("*").eq("attempt_id", attemptId).eq("kind", "ch99_headings_pdf").maybeSingle()
  return data as DocumentRow | null
}

// Heading-page state lives in parse_stats.headingPages (kept across re-parses)
export const saveHeadingPagesInfo = async (db: RevisionDb, attemptId: string, info: Partial<HeadingPagesInfo>) => {
  const attempt = await loadAttemptRow(db, attemptId)
  const stats = (attempt.parse_stats ?? {}) as ParseStats & { headingPages?: HeadingPagesInfo }
  const current: HeadingPagesInfo = stats.headingPages ?? { parsedAt: null, warnings: [], check: null, checking: false, error: null }
  const { error } = await db
    .from(T.ATTEMPTS)
    .update({ parse_stats: { ...stats, headingPages: { ...current, ...info } } })
    .eq("id", attemptId)
  if (error) throw new Error(`Save heading pages state: ${error.message}`)
}

export const headingPagesInfo = (attempt: AttemptRow): HeadingPagesInfo | null =>
  ((attempt.parse_stats ?? {}) as { headingPages?: HeadingPagesInfo }).headingPages ?? null

// Reads rows from the converted pages, replacing earlier PDF rows (manual rows
// are kept)
export const extractHeadingRows = async (db: RevisionDb, attemptId: string) => {
  const doc = await headingsDocument(db, attemptId)
  if (!doc?.markdown_path) throw new Error("The heading pages haven't been converted yet")
  const { rows, warnings } = parseCh99HeadingTables(await downloadText(db, doc.markdown_path))

  const del = await db.from(T.HEADING_ROWS).delete().eq("attempt_id", attemptId).eq("source", "pdf")
  if (del.error) throw new Error(del.error.message)
  if (rows.length) {
    const ins = await db.from(T.HEADING_ROWS).insert(
      rows.map((r) => ({ ...r, attempt_id: attemptId, source: "pdf", claude_status: "pending", reviewed: false }))
    )
    if (ins.error) throw new Error(`Save heading rows: ${ins.error.message}`)
  }
  await saveHeadingPagesInfo(db, attemptId, { parsedAt: new Date().toISOString(), warnings, check: null, error: null })
  return rows.length
}

// ---------- Reconciling Claude's reading with the parser's ----------

const rowKey = (r: Pick<HeadingFields, "htsno" | "stat_suffix" | "description">) =>
  r.htsno ? `code:${normalizeHtsCode(r.htsno)}:${r.stat_suffix}` : `text:${normalizeForCompare(r.description).toLowerCase().slice(0, 80)}`

const sameValue = (a: unknown, b: unknown) =>
  Array.isArray(a) || Array.isArray(b)
    ? JSON.stringify((a as string[] | undefined)?.map((x) => normalizeForCompare(x)) ?? []) ===
      JSON.stringify((b as string[] | undefined)?.map((x) => normalizeForCompare(x)) ?? [])
    : normalizeForCompare(String(a ?? "")) === normalizeForCompare(String(b ?? ""))

export interface Reconciled {
  updates: { id: string; values: Partial<HeadingRow> }[]
  inserts: Partial<HeadingRow>[]
}

// Claude's rows win; the parser's values are kept as parser_original when
// they differ (indentation isn't counted, since the parser can't read it)
export const reconcileHeadingRows = (parsed: HeadingRow[], checked: HeadingFields[]): Reconciled => {
  const unused = new Map<string, HeadingRow[]>()
  for (const row of parsed) unused.set(rowKey(row), [...(unused.get(rowKey(row)) ?? []), row])
  const updates: Reconciled["updates"] = []
  const inserts: Reconciled["inserts"] = []

  checked.forEach((c, index) => {
    const fields: Partial<HeadingRow> = { ...c, htsno: c.htsno ? normalizeHtsCode(c.htsno) : "", sort_order: index }
    const match = unused.get(rowKey(c))?.shift()
    if (!match) {
      inserts.push({ ...fields, source: "pdf", claude_status: "added", claude_notes: "Missed by the table parser; added from the PDF page", reviewed: false })
      return
    }
    const differing = FIELDS.filter((f) => f !== "indent" && !sameValue(match[f], c[f]))
    updates.push({
      id: match.id,
      values: {
        ...fields,
        claude_status: differing.length ? "corrected" : "ok",
        claude_notes: differing.length ? `Corrected from the PDF: ${differing.join(", ")}` : null,
        parser_original: differing.length ? Object.fromEntries(differing.map((f) => [f, match[f]])) : null,
        reviewed: false,
      },
    })
  })

  // Parser rows Claude didn't find on the pages
  let next = checked.length
  for (const rows of Array.from(unused.values())) {
    for (const row of rows) {
      updates.push({
        id: row.id,
        values: {
          sort_order: next++,
          claude_status: "flagged",
          claude_notes: "Not found on the PDF pages; likely a parsing error",
          reviewed: false,
        },
      })
    }
  }
  return { updates, inserts }
}

// Runs the Claude check on the attempt's PDF rows
export const checkHeadingRowsWithClaude = async (db: RevisionDb, attemptId: string) => {
  await saveHeadingPagesInfo(db, attemptId, { checking: true, error: null })
  try {
    const doc = await headingsDocument(db, attemptId)
    if (!doc) throw new Error("No heading pages uploaded")
    const attempt = await loadAttemptRow(db, attemptId)
    const parsed = (await loadHeadingRows(db, attemptId)).filter((r) => r.source === "pdf")
    const cited = Array.from(
      new Set((attempt.change_record_items ?? []).filter((i) => i.in_chapter_99).flatMap((i) => i.hts_codes.map(normalizeHtsCode)))
    )
    const pdf = Buffer.from(await (await downloadBlob(db, doc.storage_path)).arrayBuffer())
    const forClaude = parsed.map((r) => Object.fromEntries(FIELDS.map((f) => [f, r[f]])))
    const { rows, issues, usage } = await checkHeadingRows(pdf, forClaude, cited)

    const { updates, inserts } = reconcileHeadingRows(parsed, rows)
    for (const u of updates) {
      const { error } = await db.from(T.HEADING_ROWS).update(u.values).eq("id", u.id)
      if (error) throw new Error(`Update heading row: ${error.message}`)
    }
    if (inserts.length) {
      const { error } = await db.from(T.HEADING_ROWS).insert(inserts.map((r) => ({ ...r, attempt_id: attemptId })))
      if (error) throw new Error(`Add heading rows: ${error.message}`)
    }
    // Manual rows go after the PDF rows
    const manual = (await loadHeadingRows(db, attemptId)).filter((r) => r.source === "manual")
    let order = rows.length + updates.length
    for (const m of manual) await db.from(T.HEADING_ROWS).update({ sort_order: order++ }).eq("id", m.id)

    await saveHeadingPagesInfo(db, attemptId, { checking: false, check: { at: new Date().toISOString(), issues, usage } })
  } catch (error) {
    await saveHeadingPagesInfo(db, attemptId, { checking: false, error: (error as Error).message })
    throw error
  }
}

// Reviewed rows in the shape comparisons use
export const headingRowsAsHtsRows = (rows: HeadingRow[]): HtsRow[] => {
  let lastCode: string | null = null
  return rows
    .filter((r) => r.reviewed)
    .map((r, order) => {
      const htsno = r.htsno ? normalizeHtsCode(r.htsno) + (r.stat_suffix ? `.${r.stat_suffix}` : "") : ""
      const row: HtsRow = {
        key: htsno || `${lastCode ?? "start"}~${normalizeForCompare(r.description).slice(0, 60)}`,
        htsno,
        indent: r.indent,
        description: normalizeForCompare(r.description),
        general: normalizeForCompare(r.general),
        special: normalizeForCompare(r.special),
        other: normalizeForCompare(r.other),
        units: r.units ? [r.units] : [],
        footnotes: r.footnotes,
        parentHtsno: htsno ? null : lastCode,
        order,
      }
      if (htsno) lastCode = htsno
      return row
    })
}
