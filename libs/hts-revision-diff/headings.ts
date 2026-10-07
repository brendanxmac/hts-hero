// Chapter 99 heading rows from a revision's tariff-table pages (trimmed, or every
// subchapter III page): extracted from datalab's markdown, checked by Claude against
// the PDF pages, corrected or added by hand, and signed off by the reviewer.
// Comparisons use every row. Rows that end up in a change (cited by the change record,
// or with a difference) must be reviewed before the comparison is pulled.

import { createHash } from "crypto"
import { PDFDocument } from "pdf-lib"
import type { RevisionDb } from "./access"
import { headingOf } from "./archive"
import { codeMatches } from "./build-changes"
import { checkHeadingRows } from "./claude"
import { RevisionDiffTables as T } from "./constants"
import { parseCh99HeadingTables } from "./parse-ch99-tables"
import { downloadBlob, downloadJson, downloadText, uploadFile } from "./storage"
import { normalizeForCompare, normalizeHtsCode } from "./text"
import type { AttemptRow, ChangeRecordItem, ChangeRow, ClaudeUsage, DocumentRow, HeadingFields, HeadingRow, HtsRow, ParseStats, ParseWarning } from "./types"

export interface HeadingPagesInfo {
  parsedAt: string | null
  warnings: ParseWarning[]
  check: { at: string; issues: string[]; usage: ClaudeUsage } | null
  checking: boolean
  error: string | null
  // A chunked check that hasn't covered every page yet (checking again continues it)
  progress?: { pagesChecked: number; pages: number } | null
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

// Rows the change record doesn't cite, for "Remove uncited rows". A row is kept if a
// Chapter 99 change record item cites it (by code or range), if it's the parent of a cited
// row (a shallower row above it), or if it's a description-only row under a cited row. Rows
// entered by hand are always kept.
export const uncitedHeadingRowIds = (rows: HeadingRow[], items: ChangeRecordItem[]): string[] => {
  const ch99 = items.filter((i) => i.in_chapter_99)
  const cited = rows.map((r) => ch99.some((item) => codeMatches(item, r.htsno)))
  const keep = rows.map((r, i) => cited[i] || r.source === "manual")
  rows.forEach((row, i) => {
    if (!cited[i]) return
    // Parents: walk back to each shallower row above
    let indent = row.indent
    for (let j = i - 1; j >= 0 && indent > 0; j--) {
      if (rows[j].indent < indent) {
        keep[j] = true
        indent = rows[j].indent
      }
    }
    // Description-only rows under it (a nested row with its own heading number stands alone)
    for (let j = i + 1; j < rows.length && rows[j].indent > row.indent; j++) if (!rows[j].htsno) keep[j] = true
  })
  return rows.filter((_, i) => !keep[i]).map((r) => r.id)
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
  await saveHeadingPagesInfo(db, attemptId, { parsedAt: new Date().toISOString(), warnings, check: null, progress: null, error: null })
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

// The Claude check reads at most this many pages per call. Larger uploads (every
// subchapter III page) are checked in chunks, a few at a time, saving each chunk's
// result as it finishes; a request stops starting chunks after CHECK_START_BUDGET_MS,
// so it ends within the route's time limit, and checking again continues.
const CHECK_CHUNK_PAGES = 10
const CHECK_CONCURRENCY = 8
const CHECK_START_BUDGET_MS = 150_000

interface ChunkResult {
  from: number // first page, 1-based
  to: number // last page
  rows: HeadingFields[] // pages are the whole PDF's
  issues: string[]
  usage: ClaudeUsage
}
interface CheckProgress {
  key: string // the rows' parse time: re-reading rows starts the check over
  chunks: ChunkResult[]
}

const progressPath = (doc: DocumentRow) => `${doc.storage_path.split("/source/")[0]}/parsed/heading-check-progress.json`

const sumUsage = (usages: ClaudeUsage[]): ClaudeUsage => ({
  model: usages[0]?.model ?? "",
  input_tokens: usages.reduce((n, u) => n + u.input_tokens, 0),
  output_tokens: usages.reduce((n, u) => n + u.output_tokens, 0),
  cache_read_input_tokens: usages.reduce((n, u) => n + u.cache_read_input_tokens, 0),
  cache_creation_input_tokens: usages.reduce((n, u) => n + u.cache_creation_input_tokens, 0),
  cost_usd: usages.reduce((n, u) => n + u.cost_usd, 0),
})

// The pages each row is on (rows without a page are on the page of the row above)
const rowPages = (rows: HeadingRow[]) => {
  let page = 1
  return rows.map((r) => (page = r.page ?? page))
}

// Has Claude check the attempt's PDF rows against the heading pages. Returns whether
// every page has been checked; if not, run it again to continue.
export const checkHeadingRowsWithClaude = async (db: RevisionDb, attemptId: string): Promise<{ done: boolean }> => {
  await saveHeadingPagesInfo(db, attemptId, { checking: true, error: null })
  try {
    const doc = await headingsDocument(db, attemptId)
    if (!doc) throw new Error("No heading pages uploaded")
    const attempt = await loadAttemptRow(db, attemptId)
    const parsed = (await loadHeadingRows(db, attemptId)).filter((r) => r.source === "pdf")
    const cited = Array.from(
      new Set((attempt.change_record_items ?? []).filter((i) => i.in_chapter_99).flatMap((i) => i.hts_codes.map(normalizeHtsCode)))
    )
    const pdfBytes = Buffer.from(await (await downloadBlob(db, doc.storage_path)).arrayBuffer())
    const forClaude = (rows: HeadingRow[]) => rows.map((r) => Object.fromEntries(FIELDS.map((f) => [f, r[f]])))

    const source = await PDFDocument.load(pdfBytes)
    const pageCount = source.getPageCount()
    if (pageCount <= CHECK_CHUNK_PAGES) {
      const { rows, issues, usage } = await checkHeadingRows(pdfBytes, forClaude(parsed), cited)
      await applyCheck(db, attemptId, parsed, rows, issues, usage)
      return { done: true }
    }

    // Chunks, resuming from saved progress unless the rows were re-read since
    const key = headingPagesInfo(attempt)?.parsedAt ?? ""
    const saved = await downloadJson<CheckProgress>(db, progressPath(doc)).catch((): null => null)
    const progress: CheckProgress = saved?.key === key ? saved : { key, chunks: [] }
    const ranges: { from: number; to: number }[] = []
    for (let from = 1; from <= pageCount; from += CHECK_CHUNK_PAGES) {
      ranges.push({ from, to: Math.min(pageCount, from + CHECK_CHUNK_PAGES - 1) })
    }
    const pending = ranges.filter((r) => !progress.chunks.some((c) => c.from === r.from && c.to === r.to))
    const pages = rowPages(parsed)

    const started = Date.now()
    let saving = Promise.resolve()
    const checkChunk = async ({ from, to }: { from: number; to: number }) => {
      const chunk = await PDFDocument.create()
      const copied = await chunk.copyPages(source, Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i))
      copied.forEach((page) => chunk.addPage(page))
      const inChunk = parsed.filter((_, i) => pages[i] >= from && pages[i] <= to)
      const result = await checkHeadingRows(
        Buffer.from(await chunk.save()),
        // Pages as the chunk numbers them
        forClaude(inChunk).map((r) => ({ ...r, page: typeof r.page === "number" ? r.page - from + 1 : r.page })),
        cited
      )
      progress.chunks.push({
        from,
        to,
        rows: result.rows.map((r) => ({ ...r, page: (r.page ?? 1) + from - 1 })),
        issues: result.issues,
        usage: result.usage,
      })
      // One save at a time, so chunks finishing together don't overwrite each other
      saving = saving.then(() =>
        uploadFile(db, progressPath(doc), JSON.stringify(progress), "application/json")
      )
      await saving
    }
    const queue = [...pending]
    await Promise.all(
      Array.from({ length: CHECK_CONCURRENCY }, async () => {
        while (queue.length && Date.now() - started < CHECK_START_BUDGET_MS) await checkChunk(queue.shift()!)
      })
    )

    const done = progress.chunks.length === ranges.length
    if (!done) {
      await saveHeadingPagesInfo(db, attemptId, {
        checking: false,
        progress: { pagesChecked: progress.chunks.reduce((n, c) => n + c.to - c.from + 1, 0), pages: pageCount },
      })
      return { done: false }
    }
    const chunks = [...progress.chunks].sort((a, b) => a.from - b.from)
    await applyCheck(
      db,
      attemptId,
      parsed,
      chunks.flatMap((c) => c.rows),
      chunks.flatMap((c) => c.issues.map((issue) => `Pages ${c.from}–${c.to}: ${issue}`)),
      sumUsage(chunks.map((c) => c.usage))
    )
    return { done: true }
  } catch (error) {
    await saveHeadingPagesInfo(db, attemptId, { checking: false, error: (error as Error).message })
    throw error
  }
}

// Saves Claude's reading over the parser's rows
const applyCheck = async (
  db: RevisionDb,
  attemptId: string,
  parsed: HeadingRow[],
  rows: HeadingFields[],
  issues: string[],
  usage: ClaudeUsage
) => {
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

  await saveHeadingPagesInfo(db, attemptId, {
    checking: false,
    progress: null,
    check: { at: new Date().toISOString(), issues, usage },
  })
}

// Fingerprint of exactly what a comparison reads from the heading rows: their text,
// not whether they're reviewed. Saved with each comparison so the page can tell when
// rows changed afterwards.
export const headingRowsFingerprint = (rows: HeadingRow[]) =>
  createHash("sha256").update(JSON.stringify(headingRowsAsHtsRows(rows))).digest("hex").slice(0, 16)

// Every row, in the shape comparisons use
export const headingRowsAsHtsRows = (rows: HeadingRow[]): HtsRow[] => {
  let lastCode: string | null = null
  return rows
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

// Headings that changes rely on: those cited by the change record (with a row on either
// side) and those with a difference. Skipped changes don't count.
export const headingsUsedByChanges = (changes: Pick<ChangeRow, "decision" | "payload">[]) => {
  const codes = new Set<string>()
  for (const change of changes) {
    if (change.decision === "skip") continue
    for (const c of change.payload.citedHeadings ?? []) {
      if (c.row || c.before) codes.add(headingOf({ htsno: c.code, parentHtsno: null }))
    }
    for (const d of change.payload.codeDiffs) {
      const code = headingOf({ htsno: d.htsno, parentHtsno: d.after?.parentHtsno ?? d.before?.parentHtsno ?? null })
      if (code) codes.add(code)
    }
  }
  return codes
}

// The headings among `codes` with a row (or a description row under it) that isn't reviewed
export const unreviewedHeadings = (rows: HeadingRow[], codes: Set<string>) => {
  const unreviewed = new Set<string>()
  const asRows = headingRowsAsHtsRows(rows)
  asRows.forEach((row, i) => {
    const code = headingOf(row)
    if (codes.has(code) && !rows[i].reviewed) unreviewed.add(code)
  })
  return Array.from(unreviewed).sort()
}
