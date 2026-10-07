// Writes a reviewed revision comparison into the repo for Claude Code:
//   npm run pull-revision -- 2026HTSRev6
//   npm run pull-revision -- 2026HTSRev6 --comparison <comparison id>
//   npm run pull-revision -- 2026HTSRev4 --backfill
//
// Forward (the default): uses the newest ready comparison whose newer revision
// is the one named, for /apply-revision.
// Backfill: the named revision is the older side of the comparison, the one
// being backfilled (HowTariffsWork.md §17.13); the newer side is the earliest
// verified revision. For /backfill-revision.
// Refuses to run until every change has a decision in /revision-checker.
// Output: tariffs/revision-diffs/<revision>/ (replaced on each pull)

import { createHash } from "crypto"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs"
import { join } from "path"
import { createClient } from "@supabase/supabase-js"
import type { RevisionDb } from "../../libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "../../libs/hts-revision-diff/constants"
import { renderNotesMarkdown } from "../../libs/hts-revision-diff/parse-ch99-notes"
import { headingsUsedByChanges, unreviewedHeadings } from "../../libs/hts-revision-diff/headings"
import { renderChangeForExport } from "../../libs/hts-revision-diff/render"
import { downloadJson, downloadText } from "../../libs/hts-revision-diff/storage"
import { slugify } from "../../libs/hts-revision-diff/text"
import { HtsRevisions } from "../../tariffs/engine-v2/revisions"
import type {
  AttemptRow,
  ChangeRow,
  ComparisonRow,
  DocumentRow,
  HeadingRow,
  ParsedNotes,
  RevisionRow,
} from "../../libs/hts-revision-diff/types"

const OUTPUT_ROOT = join("tariffs", "revision-diffs")

const fail = (message: string): never => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

const parseArgs = () => {
  const args = process.argv.slice(2)
  const revisionName = args.find((a) => !a.startsWith("--"))
  const i = args.indexOf("--comparison")
  const comparisonId = i >= 0 ? args[i + 1] : null
  const backfill = args.includes("--backfill")
  if (!revisionName) fail("Usage: npm run pull-revision -- <revision name> [--backfill] [--comparison <id>]")
  return { revisionName: revisionName!, comparisonId, backfill }
}

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local")
  const db = createClient(url!, key!, { auth: { persistSession: false } }) as unknown as RevisionDb

  const { revisionName, comparisonId, backfill } = parseArgs()
  // The comparison side the named revision is on
  const side = backfill ? "from_attempt_id" : "to_attempt_id"

  const one = async <R>(query: PromiseLike<{ data: R | null; error: { message: string } | null }>, what: string) => {
    const { data, error } = await query
    if (error || !data) fail(`${what}: ${error?.message ?? "not found"}`)
    return data as R
  }

  const revision = await one<RevisionRow>(
    db.from(T.REVISIONS).select("*").eq("name", revisionName).maybeSingle(),
    `Revision ${revisionName}`
  )
  const attempts = await one<AttemptRow[]>(
    db.from(T.ATTEMPTS).select("*").eq("revision_id", revision.id),
    "Attempts"
  )

  let comparison: ComparisonRow
  if (comparisonId) {
    comparison = await one<ComparisonRow>(db.from(T.COMPARISONS).select("*").eq("id", comparisonId).single(), "Comparison")
    if (!attempts.some((a) => a.id === comparison[side])) {
      fail(`Comparison ${comparisonId} isn't a comparison ${backfill ? "from" : "to"} ${revisionName}`)
    }
  } else {
    const list = await one<ComparisonRow[]>(
      db
        .from(T.COMPARISONS)
        .select("*")
        .in(side, attempts.map((a) => a.id))
        .eq("status", "ready")
        .order("created_at", { ascending: false })
        .limit(1),
      "Comparisons"
    )
    if (!list.length) {
      fail(`No ready comparison ${backfill ? "from" : "to"} ${revisionName}. Run one in /revision-checker first.`)
    }
    comparison = list[0]
  }
  if (comparison.status !== "ready") fail(`Comparison ${comparison.id} is ${comparison.status}, not ready`)

  const changes = await one<ChangeRow[]>(
    db.from(T.CHANGES).select("*").eq("comparison_id", comparison.id).order("sort_order"),
    "Changes"
  )
  const pending = changes.filter((c) => c.decision === "pending")
  if (pending.length) {
    fail(
      `${pending.length} of ${changes.length} changes still need a decision in /revision-checker/comparisons/${comparison.id}:\n` +
        pending.slice(0, 15).map((c) => `  - ${c.title}`).join("\n") +
        (pending.length > 15 ? `\n  …and ${pending.length - 15} more` : "")
    )
  }

  const toAttempt = await one<AttemptRow>(db.from(T.ATTEMPTS).select("*").eq("id", comparison.to_attempt_id).single(), "To attempt")
  const fromAttempt = await one<AttemptRow>(db.from(T.ATTEMPTS).select("*").eq("id", comparison.from_attempt_id).single(), "From attempt")
  const toRevision = await one<RevisionRow>(db.from(T.REVISIONS).select("*").eq("id", toAttempt.revision_id).single(), "To revision")
  const fromRevision = await one<RevisionRow>(db.from(T.REVISIONS).select("*").eq("id", fromAttempt.revision_id).single(), "From revision")

  // Rows for headings the changes rely on must be reviewed; the rest of the heading
  // pages (e.g. every subchapter III page, uploaded for a full diff) needn't be
  const used = headingsUsedByChanges(changes)
  const loadReviewedHeadingRows = async (attempt: AttemptRow, name: string) => {
    const rows = await one<HeadingRow[]>(
      db.from(T.HEADING_ROWS).select("*").eq("attempt_id", attempt.id).order("sort_order"),
      "Heading rows"
    )
    const unreviewed = unreviewedHeadings(rows, used)
    if (unreviewed.length) {
      fail(
        `${unreviewed.length} headings the changes rely on have rows in ${name} that aren't reviewed. Review them on the attempt page's Headings tab:\n` +
          unreviewed.slice(0, 30).map((code) => `  - ${code}`).join("\n") +
          (unreviewed.length > 30 ? `\n  …and ${unreviewed.length - 30} more` : "")
      )
    }
    return rows
  }
  const headingRows = await loadReviewedHeadingRows(toAttempt, toRevision.name)
  // The older revision's rows are the "before" of cited headings. A backfill
  // requires them.
  const fromHeadingRows = await loadReviewedHeadingRows(fromAttempt, fromRevision.name)
  if (backfill) {
    if (!fromHeadingRows.length) {
      fail(`${fromRevision.name} has no heading pages. Upload them on its attempt page: they're the "before" text and rates.`)
    }
    if (comparison.stats && !comparison.stats.fromHeadingRowsFingerprint) {
      fail(`Comparison ${comparison.id} was built before the older revision's heading pages were used. Re-run it in /revision-checker.`)
    }
    const fromIndex = HtsRevisions.findIndex((r) => r.name === fromRevision.name)
    const toIndex = HtsRevisions.findIndex((r) => r.name === toRevision.name)
    if (fromIndex < 0 || toIndex !== fromIndex + 1) {
      fail(`A backfill compares a revision with the one right after it, but this comparison is ${fromRevision.name} → ${toRevision.name}.`)
    }
  }
  const toDocs = await one<DocumentRow[]>(db.from(T.DOCUMENTS).select("*").eq("attempt_id", toAttempt.id), "Documents")
  const fromDocs = backfill
    ? await one<DocumentRow[]>(db.from(T.DOCUMENTS).select("*").eq("attempt_id", fromAttempt.id), "Documents")
    : []
  const changeRecordDoc = toDocs.find((d) => d.kind === "change_record")

  const [toNotes, fromNotes, changeRecordMarkdown] = await Promise.all([
    downloadJson<ParsedNotes>(db, toAttempt.notes_path!),
    downloadJson<ParsedNotes>(db, fromAttempt.notes_path!),
    changeRecordDoc?.markdown_path ? downloadText(db, changeRecordDoc.markdown_path) : Promise.resolve(null),
  ])

  // ---------- Write the package ----------
  const outDir = join(OUTPUT_ROOT, revisionName)
  // Never replace a package for the other direction (e.g. a forward package for
  // this revision) with this one
  const existingManifest = join(outDir, "manifest.json")
  if (existsSync(existingManifest)) {
    const existing = JSON.parse(readFileSync(existingManifest, "utf8")) as { direction?: string }
    const existingDirection = existing.direction ?? "forward"
    if (existingDirection !== (backfill ? "backfill" : "forward")) {
      fail(`${outDir} holds a ${existingDirection} package. Move it before pulling a ${backfill ? "backfill" : "forward"} package here.`)
    }
  }
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(join(outDir, "changes"), { recursive: true })
  mkdirSync(join(outDir, "reference"), { recursive: true })

  const fromName = fromRevision.name
  const toName = toRevision.name
  const files: { index: number; file: string; change: ChangeRow }[] = changes.map((change, i) => ({
    index: i + 1,
    file: `changes/${String(i + 1).padStart(2, "0")}-${change.decision}-${slugify(change.title).slice(0, 60)}.md`,
    change,
  }))
  for (const { index, file, change } of files) {
    writeFileSync(join(outDir, file), renderChangeForExport(change, index, fromName, toName))
  }

  const changesJson = JSON.stringify(
    changes.map((c) => ({
      change_key: c.change_key,
      title: c.title,
      source: c.source,
      decision: c.decision,
      category: c.category,
      reviewer_notes: c.reviewer_notes,
      summary: c.summary,
      payload: c.payload,
    })),
    null,
    2
  )
  writeFileSync(join(outDir, "changes.json"), changesJson)
  if (changeRecordMarkdown) writeFileSync(join(outDir, "change-record.md"), changeRecordMarkdown)
  const writeHeadings = (file: string, rows: HeadingRow[], name: string) => {
    if (!rows.length) return
    const cell = (s: string) => s.replace(/\|/g, "\\|")
    writeFileSync(
      join(outDir, file),
      [
        `# Chapter 99 headings: ${name}`,
        "",
        `Read from ${name}'s own tariff-table pages (or entered by hand). This is the authoritative text and rates for these headings in this revision. Every heading the changes rely on was reviewed by the user; a row marked "no" in Reviewed wasn't, so check it against the PDF before relying on it.`,
        "",
        "| Heading | Stat. | Description | General | Special | Column 2 | Footnotes | Source | Reviewed |",
        "|---|---|---|---|---|---|---|---|---|",
        ...rows.map(
          (r) =>
            `| ${r.htsno} | ${r.stat_suffix} | ${"&nbsp;&nbsp;".repeat(r.indent)}${cell(r.description)} | ${cell(r.general)} | ${cell(r.special)} | ${cell(r.other)} | ${cell(r.footnotes.join(" "))} | ${r.source === "manual" ? "manual" : `PDF p.${r.page ?? "?"}`} | ${r.reviewed ? "yes" : "no"} |`
        ),
        "",
      ].join("\n")
    )
  }
  // headings.md is always the revision the package is for; a backfill also
  // includes the newer revision's, the "after"
  if (backfill) {
    writeHeadings("headings.md", fromHeadingRows, fromName)
    writeHeadings(`headings-${toName}.md`, headingRows, toName)
  } else {
    writeHeadings("headings.md", headingRows, toName)
  }
  const context = revision.context_notes?.trim() ?? ""
  // Cited headings with no row in the older revision: new in the newer one, or
  // missing from the older revision's heading pages
  const noBefore = Array.from(
    new Set(
      changes
        .filter((c) => c.decision === "approve")
        .flatMap((c) => (c.payload.citedHeadings ?? []).filter((h) => h.beforeStatus === "not_found").map((h) => h.code))
    )
  ).sort()
  if (context) {
    writeFileSync(
      join(outDir, "context.md"),
      [
        `# Reviewer context: ${revisionName}`,
        "",
        "Background the reviewer wrote about this revision in the revision checker: what isn't obvious from the HTS text. Use it to understand the changes and to word the changelog. It doesn't override the note text, headings or change record.",
        "",
        context,
        "",
      ].join("\n")
    )
  }
  writeFileSync(join(outDir, "reference", `ch99-notes-${toName}.md`), renderNotesMarkdown(toNotes, toName))
  writeFileSync(join(outDir, "reference", `ch99-notes-${fromName}.md`), renderNotesMarkdown(fromNotes, fromName))

  const count = (d: ChangeRow["decision"]) => changes.filter((c) => c.decision === d).length
  const manifest = {
    direction: backfill ? "backfill" : "forward",
    // The revision this package is for: the newer one going forward, the older
    // one (being backfilled) going backward
    revision: revisionName,
    revisionTitle: revision.title,
    fromRevision: fromName,
    toRevision: toName,
    ...(backfill ? { verifiedRevision: toName, citedHeadingsWithoutBefore: noBefore } : {}),
    comparisonId: comparison.id,
    attempts: { from: fromAttempt.attempt_number, to: toAttempt.attempt_number },
    exportedAt: new Date().toISOString(),
    parserVersion: toAttempt.parser_version,
    diffVersion: comparison.diff_version,
    changeRecordModel: toAttempt.change_record_model,
    consecutive: comparison.stats?.consecutive ?? null,
    // Older comparisons have no stats for these; assume the least
    headingDiff: comparison.stats?.headingDiff ?? "change_record_only",
    headingSource: comparison.stats?.headingSource ?? "none",
    fromHeadingSource: comparison.stats?.fromHeadingSource ?? "none",
    hasContext: !!context,
    counts: { total: changes.length, approve: count("approve"), defer: count("defer"), skip: count("skip") },
    allDecided: true,
    contentHash: createHash("sha256").update(changesJson).digest("hex"),
    sourceFiles: [...fromDocs, ...toDocs].map((d) => ({
      revision: d.attempt_id === fromAttempt.id ? fromName : toName,
      kind: d.kind,
      filename: d.original_filename,
      storagePath: d.storage_path,
    })),
  }
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2))

  const row = ({ index, file, change }: (typeof files)[number]) =>
    `| ${index} | ${change.decision} | ${change.category ?? ""} | ${change.source.replace(/_/g, " ")} | [${change.title.replace(/\|/g, "\\|")}](${file}) |`
  writeFileSync(
    join(outDir, "README.md"),
    [
      backfill ? `# HTS revision ${fromName}: backfill from ${toName}` : `# HTS revision ${toName}: reviewed changes`,
      "",
      `Generated by \`npm run pull-revision -- ${revisionName}${backfill ? " --backfill" : ""}\` from the revision checker. Don't edit by hand; pull again instead.`,
      "",
      ...(backfill
        ? [
            `This is a **backfill** (HowTariffsWork.md §17.13). ${toName} is verified; these are the changes ${toName} made, read from its change record. For each approved change, record how things stood in ${fromName}, before the change, with the change's legal effective date as the boundary.`,
            "",
          ]
        : []),
      `- Compared: **${fromName} → ${toName}**${manifest.consecutive === false ? " (not consecutive revisions)" : ""}`,
      `- Comparison: \`${comparison.id}\``,
      `- Decisions: ${manifest.counts.approve} approved, ${manifest.counts.defer} deferred, ${manifest.counts.skip} skipped`,
      `- Headings: ${
        manifest.headingDiff === "full"
          ? "every Chapter 99 heading diffed between the two revisions"
          : manifest.headingDiff === "heading_pages_full"
            ? "every subchapter III heading diffed between the two revisions (both revisions' heading pages are complete); other subchapters only where both have the heading"
          : manifest.headingDiff === "heading_pages"
            ? "headings on both revisions' heading pages diffed; added and removed headings come from the change record"
            : manifest.headingSource === "revision_json"
              ? `changes come from the change record; cited headings are shown as they read in ${toName}'s Chapter 99 JSON`
              : manifest.headingSource === "revision_pdf"
                ? `changes come from the change record; cited headings are shown as they read in ${toName}'s reviewed heading pages`
                : `changes come from the change record; ${toName} has no Chapter 99 JSON or heading pages, so cited headings' new text isn't included`
      }`,
      ...(backfill && noBefore.length
        ? [
            `- Cited headings with no row in ${fromName}'s heading pages (new in ${toName}, or a page is missing): ${noBefore.join(", ")}`,
          ]
        : []),
      "",
      backfill
        ? "To plan and implement the backfill, run `/backfill-revision " + fromName + "` in Claude Code."
        : "To plan and implement the approved changes, run `/apply-revision " + toName + "` in Claude Code.",
      "",
      "Only **approved** changes are to be implemented. Deferred changes are listed so the plan can say what's waiting; skipped changes are listed for the record.",
      "",
      "## Changes",
      "",
      "| # | Decision | Category | Source | Change |",
      "|---|---|---|---|---|",
      ...files.map(row),
      "",
      "## Files",
      "",
      "- `changes/` one file per change: decision, your notes, the AI summary, change record entry, note and heading diffs, and context",
      "- `changes.json` the same data, machine-readable",
      "- `change-record.md` the full change record (converted from PDF)",
      ...(context ? ["- `context.md` your background on this revision (what isn't obvious from the HTS text)"] : []),
      ...(backfill
        ? [
            `- \`headings.md\` Chapter 99 headings as they read in ${fromName} (the "before"), from its own PDF pages (reviewed)`,
            ...(headingRows.length ? [`- \`headings-${toName}.md\` the same for ${toName} (the "after")`] : []),
          ]
        : headingRows.length
          ? ["- `headings.md` new and changed Chapter 99 headings with their text and rates, from the revision's own PDF pages (reviewed)"]
          : []),
      `- \`reference/ch99-notes-${toName}.md\` and \`reference/ch99-notes-${fromName}.md\` every parsed Chapter 99 note, for lookups`,
      "- `manifest.json` revisions, comparison, versions, and a hash of `changes.json`",
      "",
    ].join("\n")
  )

  await db.from(T.COMPARISONS).update({ exported_at: new Date().toISOString() }).eq("id", comparison.id)

  console.log(`\n✓ Wrote ${outDir}`)
  console.log(`  ${changes.length} changes: ${manifest.counts.approve} approved, ${manifest.counts.defer} deferred, ${manifest.counts.skip} skipped`)
  console.log(`  Next: in Claude Code, run ${backfill ? `/backfill-revision ${fromName}` : `/apply-revision ${toName}`}\n`)
}

main().catch((error) => fail((error as Error).message))
