// Writes a reviewed revision comparison into the repo for Claude Code:
//   npm run pull-revision -- 2026HTSRev6
//   npm run pull-revision -- 2026HTSRev6 --comparison <comparison id>
//
// Uses the newest ready comparison whose newer revision is the one named.
// Refuses to run until every change has a decision in /revision-checker.
// Output: tariffs/revision-diffs/<revision>/ (replaced on each pull)

import { createHash } from "crypto"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs"
import { join } from "path"
import { createClient } from "@supabase/supabase-js"
import type { RevisionDb } from "../../libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "../../libs/hts-revision-diff/constants"
import { renderNotesMarkdown } from "../../libs/hts-revision-diff/parse-ch99-notes"
import { renderChangeForExport } from "../../libs/hts-revision-diff/render"
import { downloadJson, downloadText } from "../../libs/hts-revision-diff/storage"
import { slugify } from "../../libs/hts-revision-diff/text"
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
  if (!revisionName) fail("Usage: npm run pull-revision -- <revision name> [--comparison <id>]")
  return { revisionName: revisionName!, comparisonId }
}

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local")
  const db = createClient(url!, key!, { auth: { persistSession: false } }) as unknown as RevisionDb

  const { revisionName, comparisonId } = parseArgs()

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
    if (!attempts.some((a) => a.id === comparison.to_attempt_id)) {
      fail(`Comparison ${comparisonId} isn't a comparison to ${revisionName}`)
    }
  } else {
    const list = await one<ComparisonRow[]>(
      db
        .from(T.COMPARISONS)
        .select("*")
        .in("to_attempt_id", attempts.map((a) => a.id))
        .eq("status", "ready")
        .order("created_at", { ascending: false })
        .limit(1),
      "Comparisons"
    )
    if (!list.length) fail(`No ready comparison to ${revisionName}. Run one in /revision-checker first.`)
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

  const toAttempt = attempts.find((a) => a.id === comparison.to_attempt_id)!
  const headingRows = await one<HeadingRow[]>(
    db.from(T.HEADING_ROWS).select("*").eq("attempt_id", toAttempt.id).order("sort_order"),
    "Heading rows"
  )
  const unreviewed = headingRows.filter((r) => !r.reviewed)
  if (unreviewed.length) {
    fail(
      `${unreviewed.length} heading rows for ${revisionName} aren't reviewed. Review them on the attempt page's Headings tab:\n` +
        unreviewed.slice(0, 10).map((r) => `  - ${r.htsno || r.description.slice(0, 60)}`).join("\n")
    )
  }
  const fromAttempt = await one<AttemptRow>(db.from(T.ATTEMPTS).select("*").eq("id", comparison.from_attempt_id).single(), "From attempt")
  const fromRevision = await one<RevisionRow>(db.from(T.REVISIONS).select("*").eq("id", fromAttempt.revision_id).single(), "From revision")
  const toDocs = await one<DocumentRow[]>(db.from(T.DOCUMENTS).select("*").eq("attempt_id", toAttempt.id), "Documents")
  const changeRecordDoc = toDocs.find((d) => d.kind === "change_record")

  const [toNotes, fromNotes, changeRecordMarkdown] = await Promise.all([
    downloadJson<ParsedNotes>(db, toAttempt.notes_path!),
    downloadJson<ParsedNotes>(db, fromAttempt.notes_path!),
    changeRecordDoc?.markdown_path ? downloadText(db, changeRecordDoc.markdown_path) : Promise.resolve(null),
  ])

  // ---------- Write the package ----------
  const outDir = join(OUTPUT_ROOT, revisionName)
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(join(outDir, "changes"), { recursive: true })
  mkdirSync(join(outDir, "reference"), { recursive: true })

  const fromName = fromRevision.name
  const toName = revision.name
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
  if (headingRows.length) {
    const cell = (s: string) => s.replace(/\|/g, "\\|")
    writeFileSync(
      join(outDir, "headings.md"),
      [
        `# Chapter 99 headings: ${revision.name}`,
        "",
        `Read from ${revision.name}'s own tariff-table pages (or entered by hand) and reviewed. This is the authoritative text and rates for these headings in this revision.`,
        "",
        "| Heading | Stat. | Description | General | Special | Column 2 | Footnotes | Source |",
        "|---|---|---|---|---|---|---|---|",
        ...headingRows.map(
          (r) =>
            `| ${r.htsno} | ${r.stat_suffix} | ${"&nbsp;&nbsp;".repeat(r.indent)}${cell(r.description)} | ${cell(r.general)} | ${cell(r.special)} | ${cell(r.other)} | ${cell(r.footnotes.join(" "))} | ${r.source === "manual" ? "manual" : `PDF p.${r.page ?? "?"}`} |`
        ),
        "",
      ].join("\n")
    )
  }
  const context = revision.context_notes?.trim() ?? ""
  if (context) {
    writeFileSync(
      join(outDir, "context.md"),
      [
        `# Reviewer context: ${revision.name}`,
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
    revision: toName,
    revisionTitle: revision.title,
    fromRevision: fromName,
    comparisonId: comparison.id,
    attempts: { from: fromAttempt.attempt_number, to: toAttempt.attempt_number },
    exportedAt: new Date().toISOString(),
    parserVersion: toAttempt.parser_version,
    diffVersion: comparison.diff_version,
    changeRecordModel: toAttempt.change_record_model,
    consecutive: comparison.stats?.consecutive ?? null,
    headingDiff: comparison.stats?.headingDiff ?? "full",
    headingSource: comparison.stats?.headingSource ?? "revision_json",
    hasContext: !!context,
    counts: { total: changes.length, approve: count("approve"), defer: count("defer"), skip: count("skip") },
    allDecided: true,
    contentHash: createHash("sha256").update(changesJson).digest("hex"),
    sourceFiles: toDocs.map((d) => ({ kind: d.kind, filename: d.original_filename, storagePath: d.storage_path })),
  }
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2))

  const row = ({ index, file, change }: (typeof files)[number]) =>
    `| ${index} | ${change.decision} | ${change.category ?? ""} | ${change.source.replace(/_/g, " ")} | [${change.title.replace(/\|/g, "\\|")}](${file}) |`
  writeFileSync(
    join(outDir, "README.md"),
    [
      `# HTS revision ${toName}: reviewed changes`,
      "",
      `Generated by \`npm run pull-revision -- ${toName}\` from the revision checker. Don't edit by hand; pull again instead.`,
      "",
      `- Compared: **${fromName} → ${toName}**${manifest.consecutive === false ? " (not consecutive revisions)" : ""}`,
      `- Comparison: \`${comparison.id}\``,
      `- Decisions: ${manifest.counts.approve} approved, ${manifest.counts.defer} deferred, ${manifest.counts.skip} skipped`,
      `- Headings: ${
        manifest.headingDiff === "full"
          ? "every Chapter 99 heading diffed between the two revisions"
          : manifest.headingSource === "revision_json"
            ? `changes come from the change record; cited headings are shown as they read in ${toName}'s Chapter 99 JSON`
            : `changes come from the change record; ${toName} has no Chapter 99 JSON, so cited headings' new text isn't included`
      }`,
      "",
      "To plan and implement the approved changes, run `/apply-revision " + toName + "` in Claude Code.",
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
      ...(headingRows.length ? ["- `headings.md` new and changed Chapter 99 headings with their text and rates, from the revision's own PDF pages (reviewed)"] : []),
      `- \`reference/ch99-notes-${toName}.md\` and \`reference/ch99-notes-${fromName}.md\` every parsed Chapter 99 note, for lookups`,
      "- `manifest.json` revisions, comparison, versions, and a hash of `changes.json`",
      "",
    ].join("\n")
  )

  await db.from(T.COMPARISONS).update({ exported_at: new Date().toISOString() }).eq("id", comparison.id)

  console.log(`\n✓ Wrote ${outDir}`)
  console.log(`  ${changes.length} changes: ${manifest.counts.approve} approved, ${manifest.counts.defer} deferred, ${manifest.counts.skip} skipped`)
  console.log(`  Next: in Claude Code, run /apply-revision ${toName}\n`)
}

main().catch((error) => fail((error as Error).message))
