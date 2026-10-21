// Moves attempts and comparisons through their steps. Everything is driven by
// the page: it calls the status routes while open, and each call advances
// whatever is ready, so closing the page and coming back picks up where it was.

import type { RevisionDb } from "./access"
import { headingCoverage as headingCoverageFor, headingOf, isSubchapterIII } from "./archive"
import { buildChanges, normalizeCitation } from "./build-changes"
import { extractChangeRecord } from "./claude"
import {
  CHANGE_RECORD_PROMPT_VERSION,
  CLAUDE_MODEL,
  DIFF_VERSION,
  PARSER_VERSION,
  RevisionDiffTables as T,
} from "./constants"
import { pollConversion, submitConversion } from "./datalab"
import { diffCodes, diffNotes, diffSharedCodes } from "./diff"
import { parseCh99Json } from "./parse-ch99-json"
import { groupSlugForNoteType, parseCh99NotesMarkdown, type ExpectedCitation } from "./parse-ch99-notes"
import {
  extractHeadingRows,
  headingRowsAsHtsRows,
  headingRowsFingerprint,
  loadHeadingRows,
  saveHeadingPagesInfo,
} from "./headings"
import { detectRevision, ownEditionRows } from "./text"
import { attemptFolder, downloadBlob, downloadJson, downloadText, markdownPath, sourcePath, uploadFile } from "./storage"
import { fetchCh99Export, getCurrentReleaseName } from "./usitc"
import { HtsRevisions } from "../../tariffs/engine-v2/revisions"
import type {
  AttemptRow,
  ChangeRecordItem,
  ChangeRow,
  ComparisonRow,
  ComparisonStats,
  DocumentRow,
  HtsRow,
  ParsedNotes,
  ParseStats,
  RevisionRow,
} from "./types"

const must = <D>(result: { data: D | null; error: { message: string } | null }, what: string): D => {
  if (result.error) throw new Error(`${what}: ${result.error.message}`)
  if (result.data === null) throw new Error(`${what}: not found`)
  return result.data
}

export const loadAttempt = async (db: RevisionDb, attemptId: string) => {
  const attempt = must<AttemptRow>(
    await db.from(T.ATTEMPTS).select("*").eq("id", attemptId).single(),
    "Load attempt"
  )
  const revision = must<RevisionRow>(
    await db.from(T.REVISIONS).select("*").eq("id", attempt.revision_id).single(),
    "Load revision"
  )
  const documents = must<DocumentRow[]>(
    await db.from(T.DOCUMENTS).select("*").eq("attempt_id", attemptId),
    "Load documents"
  )
  return { attempt, revision, documents }
}

const updateAttempt = async (db: RevisionDb, id: string, values: Partial<AttemptRow>) => {
  const { error } = await db.from(T.ATTEMPTS).update(values).eq("id", id)
  if (error) throw new Error(`Update attempt: ${error.message}`)
}

const updateDocument = async (db: RevisionDb, id: string, values: Partial<DocumentRow>) => {
  const { error } = await db.from(T.DOCUMENTS).update(values).eq("id", id)
  if (error) throw new Error(`Update document: ${error.message}`)
}

// ---------- Conversion ----------

// Sends one PDF to datalab; records a failure on the document instead of throwing
export const submitDocument = async (db: RevisionDb, doc: DocumentRow) => {
  try {
    const file = await downloadBlob(db, doc.storage_path)
    const { requestId, checkUrl } = await submitConversion(file, doc.original_filename, {
      keepPageFooters: doc.kind === "ch99_pdf",
    })
    await updateDocument(db, doc.id, {
      conversion_status: "processing",
      datalab_request_id: requestId,
      datalab_check_url: checkUrl,
      error: null,
      submitted_at: new Date().toISOString(),
      completed_at: null,
    })
  } catch (error) {
    await updateDocument(db, doc.id, { conversion_status: "failed", error: (error as Error).message })
  }
}

// Sends the PDFs that haven't converted yet (or failed) to datalab
export const submitConversions = async (db: RevisionDb, attemptId: string) => {
  const { attempt, documents } = await loadAttempt(db, attemptId)
  if (attempt.status === "parsing") throw new Error("This attempt is being parsed")

  const toSubmit = documents.filter(
    (d) => d.kind !== "ch99_json" && (d.conversion_status === "pending" || d.conversion_status === "failed")
  )
  for (const doc of toSubmit) await submitDocument(db, doc)
  await updateAttempt(db, attemptId, { status: "converting", error: null })
  return advanceAttempt(db, attemptId)
}

// Polls datalab for documents in progress, then parses once everything is in
export const advanceAttempt = async (db: RevisionDb, attemptId: string) => {
  const before = await loadAttempt(db, attemptId)
  const folder = attemptFolder(before.revision.name, before.attempt.attempt_number)

  for (const doc of before.documents.filter((d) => d.conversion_status === "processing" && d.datalab_check_url)) {
    const result = await pollConversion(doc.datalab_check_url!)
    if (result.state === "complete") {
      const path = markdownPath(folder, doc.kind)
      await uploadFile(db, path, result.markdown, "text/markdown; charset=utf-8")
      await updateDocument(db, doc.id, {
        conversion_status: "complete",
        markdown_path: path,
        page_count: result.pageCount,
        error: null,
        completed_at: new Date().toISOString(),
      })
      if (doc.kind === "ch99_headings_pdf") {
        // Read the table rows. Claude's check against the pages is run by hand from the
        // Headings tab: on the forward revisions it only ever fixed formatting, which
        // the parser now handles, and differences between revisions get reviewed anyway.
        try {
          await extractHeadingRows(db, attemptId)
        } catch (error) {
          await saveHeadingPagesInfo(db, attemptId, { error: (error as Error).message })
        }
      }
    } else if (result.state === "failed") {
      await updateDocument(db, doc.id, { conversion_status: "failed", error: result.error })
    }
  }

  const { attempt, documents } = await loadAttempt(db, attemptId)
  const failed = documents.filter((d) => d.conversion_status === "failed")
  const processing = documents.some((d) => d.conversion_status === "processing")
  const allIn = documents.every((d) => d.conversion_status === "complete" || d.conversion_status === "not_needed")

  if (attempt.status === "converting") {
    if (failed.length && !processing) {
      await updateAttempt(db, attemptId, {
        status: "failed",
        error: failed.map((d) => `${d.original_filename}: ${d.error}`).join("\n"),
      })
    } else if (allIn) {
      await updateAttempt(db, attemptId, { status: "converted" })
      await parseAttempt(db, attemptId)
    }
  }
  return loadAttempt(db, attemptId)
}

// ---------- Parsing ----------

// Note citations from the change record, so the parser can put back note
// numbers the PDF conversion dropped
const expectedCitationsFrom = (items: ChangeRecordItem[] | null): ExpectedCitation[] =>
  (items ?? [])
    .filter((i) => i.in_chapter_99)
    .flatMap((i) =>
      i.note_citations.map((c) => ({
        subchapter: i.subchapter ? i.subchapter.toUpperCase() : null,
        slug: groupSlugForNoteType(i.note_type),
        citation: normalizeCitation(c),
      }))
    )

// Returns false when it didn't parse: the attempt is already being parsed, or
// isn't converted yet
export const parseAttempt = async (db: RevisionDb, attemptId: string) => {
  const { attempt, revision, documents } = await loadAttempt(db, attemptId)
  const notesDoc = documents.find((d) => d.kind === "ch99_pdf")
  const jsonDoc = documents.find((d) => d.kind === "ch99_json")
  if (!notesDoc?.markdown_path) {
    throw new Error("The Chapter 99 PDF must be converted before parsing")
  }

  // Claim the attempt so two polls don't parse it at the same time
  const { data: claimed } = await db
    .from(T.ATTEMPTS)
    .update({ status: "parsing", error: null })
    .eq("id", attemptId)
    .in("status", ["converted", "parsed", "failed"])
    .select("id")
  if (!claimed?.length) return false

  try {
    const folder = attemptFolder(revision.name, attempt.attempt_number)
    const markdown = await downloadText(db, notesDoc.markdown_path)
    const notes = parseCh99NotesMarkdown(markdown, {
      expectedCitations: expectedCitationsFrom(attempt.change_record_items),
    })
    const changeRecordDoc = documents.find((d) => d.kind === "change_record")
    const changeRecordDetected = changeRecordDoc?.markdown_path
      ? detectRevision(await downloadText(db, changeRecordDoc.markdown_path))
      : { name: null, previous: null }
    // The Chapter 99 JSON is optional
    const { rows, warnings: rowWarnings } = jsonDoc
      ? parseCh99Json(JSON.parse(await downloadText(db, jsonDoc.storage_path)))
      : { rows: [] as HtsRow[], warnings: [] }

    const notesPath = `${folder}/parsed/notes.json`
    const rowsPath = jsonDoc ? `${folder}/parsed/hts-rows.json` : null
    await uploadFile(db, notesPath, JSON.stringify(notes), "application/json")
    if (rowsPath) await uploadFile(db, rowsPath, JSON.stringify(rows), "application/json")

    const groups = new Map<string, ParseStats["groups"][number]>()
    for (const node of notes.nodes) {
      const g = groups.get(node.groupKey) ?? {
        groupKey: node.groupKey,
        label: `${node.subchapter ? `Subchapter ${node.subchapter}` : "Chapter 99"}, ${node.group}`,
        topLevelNotes: 0,
        nodes: 0,
      }
      g.nodes++
      if (!node.parentKey && node.citation) g.topLevelNotes++
      groups.set(node.groupKey, g)
    }
    const warnings = [...notes.warnings, ...rowWarnings]
    const stats: ParseStats = {
      nodes: notes.nodes.length,
      topLevelNotes: notes.nodes.filter((n) => !n.parentKey && n.citation).length,
      subchapters: Array.from(new Set(notes.nodes.map((n) => n.subchapter).filter(Boolean))) as string[],
      groups: Array.from(groups.values()),
      htsCodesMentioned: new Set(notes.nodes.flatMap((n) => n.htsCodes)).size,
      pages: notesDoc.page_count,
      htsRows: rows.length,
      htsRowsWithCode: rows.filter((r) => r.htsno).length,
      warnings: warnings.length,
      detectedRevision: {
        ch99Pdf: detectRevision(markdown).name,
        changeRecord: changeRecordDetected.name,
        previous: changeRecordDetected.previous,
      },
      // Reading the change record isn't redone on re-parse, so keep its cost
      changeRecordUsage: attempt.parse_stats?.changeRecordUsage ?? null,
      // Which change record reading the parse used for citations
      changeRecordHintsFrom: attempt.change_record_extracted_at ?? null,
    }
    const headingPages = (attempt.parse_stats as { headingPages?: unknown } | null)?.headingPages
    if (headingPages) Object.assign(stats, { headingPages })

    await updateAttempt(db, attemptId, {
      status: "parsed",
      notes_path: notesPath,
      hts_rows_path: rowsPath,
      parse_stats: stats,
      parse_warnings: warnings,
      parser_version: PARSER_VERSION,
      parsed_at: new Date().toISOString(),
      error: null,
    })

    // The first parsed attempt of a revision becomes its active one
    if (!revision.active_attempt_id) {
      await db.from(T.REVISIONS).update({ active_attempt_id: attemptId }).eq("id", revision.id)
    }
  } catch (error) {
    await updateAttempt(db, attemptId, { status: "failed", error: `Parsing failed: ${(error as Error).message}` })
  }
  return true
}

// ---------- USITC snapshot ----------

// Saves USITC's Chapter 99 export as this attempt's JSON when the attempt's
// revision is the current one (USITC can't export older revisions). Parses
// it right away if the attempt is already parsed.
export const saveCurrentCh99Snapshot = async (
  db: RevisionDb,
  attemptId: string
): Promise<"saved" | "exists" | "not_current"> => {
  const { attempt, revision, documents } = await loadAttempt(db, attemptId)
  if (documents.some((d) => d.kind === "ch99_json")) return "exists"
  if ((await getCurrentReleaseName()) !== revision.name) return "not_current"

  const rows = await fetchCh99Export()
  const folder = attemptFolder(revision.name, attempt.attempt_number)
  const path = sourcePath(folder, "ch99_json", "usitc-export.json")
  const body = JSON.stringify(rows)
  await uploadFile(db, path, body, "application/json")
  const { error } = await db.from(T.DOCUMENTS).insert({
    attempt_id: attemptId,
    kind: "ch99_json",
    original_filename: `USITC export, fetched ${new Date().toISOString().slice(0, 10)}`,
    storage_path: path,
    size_bytes: body.length,
    conversion_status: "not_needed",
  })
  if (error) throw new Error(`Save USITC snapshot: ${error.message}`)

  if (attempt.status === "parsed") await parseAttempt(db, attemptId)
  return "saved"
}

// ---------- Change record ----------

export const ensureChangeRecordItems = async (db: RevisionDb, attemptId: string, force = false) => {
  const { attempt, revision, documents } = await loadAttempt(db, attemptId)
  if (attempt.change_record_items && !force) return attempt.change_record_items
  const doc = documents.find((d) => d.kind === "change_record")
  if (!doc?.markdown_path) throw new Error("The change record hasn't been converted")
  // A Basic edition's change record is cumulative: only its own rows are changes from the
  // revision before it, and reading the whole record overruns the model's output
  const own = ownEditionRows(await downloadText(db, doc.markdown_path), revision.name)
  const { items, model, usage } = await extractChangeRecord(own.markdown, revision.name)
  await updateAttempt(db, attemptId, {
    change_record_items: items,
    change_record_model: `${model} (${CHANGE_RECORD_PROMPT_VERSION})`,
    change_record_extracted_at: new Date().toISOString(),
    ...(attempt.parse_stats ? { parse_stats: { ...attempt.parse_stats, changeRecordUsage: usage } } : {}),
  })
  return items
}

// ---------- Revision names ----------

// A message when the documents' titles name a different revision than the
// one they were uploaded as (e.g. uploaded as 2025HTSRev6, PDF says 2026 Revision 6)
export const revisionNameProblem = (attempt: AttemptRow, revisionName: string) => {
  const detected = attempt.parse_stats?.detectedRevision
  const named = detected?.ch99Pdf ?? detected?.changeRecord
  if (!named || named === revisionName) return null
  return `This revision is named ${revisionName}, but its documents say ${named}. Rename it before comparing.`
}

// ---------- Comparisons ----------

const revisionIndex = (name: string) => HtsRevisions.findIndex((r) => r.name === name)

// Whether "to" directly follows "from" in USITC's list (null if unknown)
export const areConsecutive = (fromName: string, toName: string) => {
  const a = revisionIndex(fromName)
  const b = revisionIndex(toName)
  if (a < 0 || b < 0) return null
  return b === a + 1
}

const updateComparison = async (db: RevisionDb, id: string, values: Partial<ComparisonRow>) => {
  const { error } = await db.from(T.COMPARISONS).update(values).eq("id", id)
  if (error) throw new Error(`Update comparison: ${error.message}`)
}

export const runComparison = async (db: RevisionDb, comparisonId: string) => {
  const comparison = must<ComparisonRow>(
    await db.from(T.COMPARISONS).select("*").eq("id", comparisonId).single(),
    "Load comparison"
  )
  try {
    const from = await loadAttempt(db, comparison.from_attempt_id)
    const to = await loadAttempt(db, comparison.to_attempt_id)
    if (from.attempt.status !== "parsed" || to.attempt.status !== "parsed") {
      throw new Error("Both revisions must be parsed before comparing")
    }
    for (const side of [from, to]) {
      const problem = revisionNameProblem(side.attempt, side.revision.name)
      if (problem) throw new Error(problem)
    }

    await updateComparison(db, comparisonId, { status: "extracting_change_record", error: null })
    const items = await ensureChangeRecordItems(db, to.attempt.id)
    // Re-parse if the change record was read after the last parse, so its
    // citations can recover note numbers the conversion dropped
    const extracted = (await loadAttempt(db, to.attempt.id)).attempt
    if (extracted.change_record_extracted_at && extracted.parse_stats?.changeRecordHintsFrom !== extracted.change_record_extracted_at) {
      await parseAttempt(db, to.attempt.id)
      const reparsed = (await loadAttempt(db, to.attempt.id)).attempt
      if (reparsed.status !== "parsed") throw new Error(reparsed.error ?? "Re-parsing the newer revision failed")
    }

    await updateComparison(db, comparisonId, { status: "diffing" })
    // If the newer revision is current and has no JSON yet, save USITC's
    if (!to.attempt.hts_rows_path) {
      await saveCurrentCh99Snapshot(db, to.attempt.id).catch((): null => null)
    }
    const toAttempt = (await loadAttempt(db, to.attempt.id)).attempt
    const rowsOf = (path: string | null) =>
      path ? downloadJson<HtsRow[]>(db, path) : Promise.resolve(null)
    const [fromNotes, toNotes, fromRows, toRows] = await Promise.all([
      downloadJson<ParsedNotes>(db, from.attempt.notes_path!),
      downloadJson<ParsedNotes>(db, toAttempt.notes_path!),
      rowsOf(from.attempt.hts_rows_path),
      rowsOf(toAttempt.hts_rows_path),
    ])
    const noteDiffs = diffNotes(fromNotes.nodes, toNotes.nodes)
    // Without JSON, cited headings are looked up in the reviewed rows from each
    // revision's own heading pages: the newer revision's for the "after", the
    // older revision's for the "before"
    const [headingRows, fromHeadingRows] = await Promise.all([
      loadHeadingRows(db, toAttempt.id),
      loadHeadingRows(db, from.attempt.id),
    ])
    const unreviewedHeadingRows = headingRows.filter((r) => !r.reviewed).length
    const pdfRows = headingRowsAsHtsRows(headingRows)
    const fromPdfRows = headingRowsAsHtsRows(fromHeadingRows)
    const lookupRows = toRows ?? (pdfRows.length ? pdfRows : null)
    const fromLookupRows = fromRows ?? (fromPdfRows.length ? fromPdfRows : null)
    const headingSource = toRows ? "revision_json" : pdfRows.length ? "revision_pdf" : "none"
    const fromHeadingSource = fromRows ? "revision_json" : fromPdfRows.length ? "revision_pdf" : "none"
    // Every heading is diffed when both revisions have Chapter 99 JSON. Heading pages
    // may be trimmed: subchapter III is diffed in full when both sides have all of its
    // headings (checked against USITC's archived PDF), and otherwise only headings on
    // both sides are diffed, with added and removed headings from the change record.
    const fullHeadingDiff = !!fromRows && !!toRows
    const headingCoverage = !toRows && pdfRows.length ? headingCoverageFor(to.revision.name, pdfRows) : null
    const fromHeadingCoverage = !fromRows && fromPdfRows.length ? headingCoverageFor(from.revision.name, fromPdfRows) : null
    const fullSubchapterIII =
      !fullHeadingDiff &&
      !!lookupRows &&
      !!fromLookupRows &&
      (!!toRows || !!headingCoverage?.complete) &&
      (!!fromRows || !!fromHeadingCoverage?.complete)
    const pageHeadingDiff = !fullHeadingDiff && !!lookupRows && !!fromLookupRows
    const inSubchapterIII = (r: HtsRow) => isSubchapterIII(headingOf(r))
    const codeDiffs = fullHeadingDiff
      ? diffCodes(fromRows, toRows)
      : fullSubchapterIII
        ? [
            ...diffCodes(fromLookupRows!.filter(inSubchapterIII), lookupRows!.filter(inSubchapterIII)),
            ...diffSharedCodes(
              fromLookupRows!.filter((r: HtsRow) => !inSubchapterIII(r)),
              lookupRows!.filter((r: HtsRow) => !inSubchapterIII(r))
            ),
          ]
        : pageHeadingDiff
          ? diffSharedCodes(fromLookupRows!, lookupRows!)
          : []
    const changes = buildChanges({
      changeRecordItems: items,
      noteDiffs,
      codeDiffs,
      fromNodes: fromNotes.nodes,
      toNodes: toNotes.nodes,
      toRows: lookupRows,
      fromRows: fromLookupRows,
      fullHeadingDiff,
      // With complete subchapter III pages, a cited 9903 heading with no difference
      // really didn't change
      headingDiffed: fullSubchapterIII ? (code: string) => isSubchapterIII(headingOf({ htsno: code, parentHtsno: null })) : undefined,
      toRevisionName: to.revision.name,
      headingSource,
    })

    // Carry reviews over from the latest earlier comparison of the same two
    // revisions when a change is identical (same key and content hash)
    const previous = await previousReviews(db, comparison, from.revision.id, to.revision.id)
    let carried = 0
    const rows = changes.map((c) => {
      const prior = previous.get(c.change_key)
      const same = prior && prior.payload.hash === c.payload.hash
      if (same) carried++
      // Every row gets every review column: in a batch insert, a column some
      // rows leave out is stored as null for them, not as its default
      return {
        comparison_id: comparisonId,
        ...c,
        summary: same ? prior.summary : null,
        summary_model: same ? prior.summary_model : null,
        summary_prompt_version: same ? prior.summary_prompt_version : null,
        summarized_at: same ? prior.summarized_at : null,
        category: same ? prior.category : null,
        decision: same ? prior.decision : "pending",
        reviewer_notes: same ? prior.reviewer_notes : null,
        reviewed_at: same ? prior.reviewed_at : null,
      }
    })

    await db.from(T.CHANGES).delete().eq("comparison_id", comparisonId)
    for (let i = 0; i < rows.length; i += 50) {
      const { error } = await db.from(T.CHANGES).insert(rows.slice(i, i + 50))
      if (error) throw new Error(`Save changes: ${error.message}`)
    }

    const changeRecordFollows = toAttempt.parse_stats?.detectedRevision?.previous ?? null
    const count = <K extends string>(keys: K[], values: K[]) =>
      Object.fromEntries(keys.map((k) => [k, values.filter((v) => v === k).length])) as Record<K, number>
    const stats: ComparisonStats = {
      fromRevision: from.revision.name,
      toRevision: to.revision.name,
      // The change record says which revision it follows; USITC's list is the fallback
      consecutive: changeRecordFollows
        ? changeRecordFollows === from.revision.name
        : areConsecutive(from.revision.name, to.revision.name),
      changeRecordFollows,
      changeRecordItems: items.length,
      changeRecordItemsInCh99: items.filter((i) => i.in_chapter_99).length,
      noteDiffs: count(["added", "removed", "modified", "renumbered"], noteDiffs.map((d) => d.status)),
      codeDiffs: count(["added", "removed", "modified"], codeDiffs.map((d) => d.status)),
      changes: count(
        ["change_record", "not_in_change_record", "change_record_no_diff"],
        changes.map((c) => c.source)
      ),
      carriedOverReviews: carried,
      headingDiff: fullHeadingDiff
        ? "full"
        : fullSubchapterIII
          ? "heading_pages_full"
          : pageHeadingDiff
            ? "heading_pages"
            : "change_record_only",
      headingCoverage,
      fromHeadingCoverage,
      headingSource,
      unreviewedHeadingRows,
      headingRowsFingerprint: headingRowsFingerprint(headingRows),
      fromHeadingSource,
      fromUnreviewedHeadingRows: fromHeadingRows.filter((r) => !r.reviewed).length,
      fromHeadingRowsFingerprint: headingRowsFingerprint(fromHeadingRows),
    }
    await updateComparison(db, comparisonId, { status: "ready", stats, diff_version: DIFF_VERSION })
  } catch (error) {
    await updateComparison(db, comparisonId, { status: "failed", error: (error as Error).message })
  }
}

const previousReviews = async (
  db: RevisionDb,
  comparison: ComparisonRow,
  fromRevisionId: string,
  toRevisionId: string
) => {
  const result = new Map<string, ChangeRow>()
  const { data: attempts } = await db
    .from(T.ATTEMPTS)
    .select("id, revision_id")
    .in("revision_id", [fromRevisionId, toRevisionId])
  const fromIds = (attempts ?? []).filter((a) => a.revision_id === fromRevisionId).map((a) => a.id)
  const toIds = (attempts ?? []).filter((a) => a.revision_id === toRevisionId).map((a) => a.id)
  if (!fromIds.length || !toIds.length) return result

  const { data: earlier } = await db
    .from(T.COMPARISONS)
    .select("id")
    .in("from_attempt_id", fromIds)
    .in("to_attempt_id", toIds)
    .eq("status", "ready")
    .neq("id", comparison.id)
    .order("created_at", { ascending: false })
    .limit(1)
  if (!earlier?.length) return result

  const { data: changes } = await db.from(T.CHANGES).select("*").eq("comparison_id", earlier[0].id)
  for (const change of (changes ?? []) as ChangeRow[]) result.set(change.change_key, change)
  return result
}

export { CLAUDE_MODEL }
