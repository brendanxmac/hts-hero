// Writes a coverage batch from /coverage-checker into the repo for Claude Code:
//   npm run pull-batch -- <batch name>
//
// The batch must be ready (every heading decided) or already pulled. Marks it pulled.
// Output: tariffs/coverage-batches/<name>/ (replaced on each pull). Then run /apply-batch <name>.

import { createHash } from "crypto"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs"
import { join } from "path"
import { createClient } from "@supabase/supabase-js"
import { loadBatch } from "../../libs/hts-coverage/batches"
import { CATEGORY_LABELS, CoverageTables as T, DATES_MODE_LABELS, STATUS_LABELS, subchapterLabel } from "../../libs/hts-coverage/constants"
import { citedNotesFor, examplesFor, latestParsedNotes, recordsFor, referencesTo, type CitedNote } from "../../libs/hts-coverage/server"
import type { CoverageBatch, CoverageBatchItem, CoverageItem } from "../../libs/hts-coverage/types"
import type { RevisionDb } from "../../libs/hts-revision-diff/access"
import { renderNotesMarkdown } from "../../libs/hts-revision-diff/parse-ch99-notes"
import { AllRules } from "../../tariffs/engine-v2/data"
import { describePeriod } from "../../tariffs/engine-v2/dates"
import { getLatestVerifiedRevision, getVerifiedRevisions } from "../../tariffs/engine-v2/revisions"
import type { Tariff } from "../../tariffs/engine-v2/types"

const OUTPUT_ROOT = join("tariffs", "coverage-batches")

const fail = (message: string): never => {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

type Row = CoverageBatchItem & { item: CoverageItem }

const programName = (id: string | null | undefined) => (id ? AllRules.programs.find((p) => p.id === id)?.name ?? id : null)

// The user's program, else Claude's suggestion (labeled)
const programOf = (item: CoverageItem) =>
  item.program
    ? programName(item.program)
    : item.claude_suggestion?.program
      ? `${programName(item.claude_suggestion.program)} (Claude's suggestion)`
      : item.claude_suggestion?.new_program
        ? `new: ${item.claude_suggestion.new_program} (Claude's suggestion)`
        : null

const json = (value: unknown) => "```json\n" + JSON.stringify(value, null, 2) + "\n```"

const noteMarkdown = (note: CitedNote) => {
  if (!note.foundKey) return `### ${note.label}\n\n_Not found in the parsed notes. Look it up in the reference notes or ask the user._\n`
  const partial = note.foundKey !== note.key ? `\n_The cited subdivision isn't parsed on its own; this is its parent, ${note.foundKey}._\n` : ""
  const body = note.nodes.map((n) => `${"  ".repeat(n.depth)}- **${n.citation || "(intro)"}** ${n.text.replace(/\n/g, `\n${"  ".repeat(n.depth + 1)}`)}`).join("\n")
  return `### ${note.label}\n${partial}\n${body}\n`
}

const recordLine = (t: Tariff) => `- \`${t.code}\` ${t.name} (${t.program}), ${describePeriod(t.effective)}${t.source?.revision ? `, source ${t.source.revision}` : ""}`

const renderHeading = (row: Row, index: number, notes: CitedNote[], notesRevision: string | null) => {
  const { item } = row
  const s = item.claude_suggestion
  const records = recordsFor(item.htsno)
  const references = referencesTo(item.htsno)
  const examples = records.length ? [] : examplesFor(item)
  const category = item.category ?? s?.category ?? item.category_suggested
  return [
    `<!-- ${item.htsno} · batch item ${index} -->`,
    `# ${index}. ${item.htsno}: ${row.decision === "include" ? "INCLUDE" : "SKIP"}`,
    "",
    `- Decision: **${row.decision}**`,
    `- Subchapter: ${subchapterLabel(item.subchapter)}`,
    `- Status: ${item.status === "open" ? "In effect" : STATUS_LABELS[item.status]}${item.status_note ? ` (${item.status_note})` : ""}`,
    `- Category: ${category ? CATEGORY_LABELS[category] : "—"}${item.category ? "" : " (suggested)"}`,
    `- Program: ${programOf(item) ?? "— (not set)"}`,
    `- Priority: ${item.priority ?? "—"}`,
    "",
    "## Instructions for this heading",
    "",
    row.instructions?.trim() || "_None._",
    "",
    ...(item.notes?.trim() ? ["## The user's notes on this heading", "", item.notes.trim(), ""] : []),
    "## HTS text",
    "",
    `As printed in ${item.last_seen_revision ?? "the current revision"} (USITC Chapter 99 export).`,
    "",
    `> ${item.description || "(no description)"}`,
    "",
    "| General | Special | Column 2 |",
    "|---|---|---|",
    `| ${item.general || "—"} | ${item.special || "—"} | ${item.other || "—"} |`,
    "",
    ...(item.starts_on ? [`Starts: ${item.starts_on} (from the description's "on or after" date)`, ""] : []),
    ...(item.footnotes.length ? [`Footnotes: ${item.footnotes.join(" · ")}`, ""] : []),
    "## Cited notes",
    "",
    item.note_citations.length
      ? `From the revision checker's parsed notes for ${notesRevision ?? "(none found)"}.\n\n${notes.map(noteMarkdown).join("\n")}`
      : "_The description doesn't cite a U.S. note._",
    "",
    "## In the engine now",
    "",
    records.length ? `This heading already has records:\n\n${records.map(recordLine).join("\n")}` : "No tariff record for this heading.",
    "",
    ...(references.length ? ["Named elsewhere in the engine data:", "", ...references.map((r) => `- ${r.kind} \`${r.id}\`: ${r.label}`), ""] : []),
    ...(examples.length
      ? [
          "## Modeled examples nearby",
          "",
          "The closest modeled headings (same heading group, else the same U.S. note). Follow their conventions where they fit.",
          "",
          ...examples.map((e) => `${recordLine(e)}\n\n${json(e)}\n`),
        ]
      : []),
    "## Claude's suggestion (a pointer only)",
    "",
    s
      ? [
          `- Category: ${CATEGORY_LABELS[s.category]}`,
          `- Program: ${programName(s.program) ?? (s.new_program ? `new: ${s.new_program}` : "—")}`,
          `- Complexity: ${s.complexity}`,
          "",
          s.summary,
          "",
          s.modeling,
          "",
          `_${s.model}, ${s.prompt_version}. Not verified; the note and HTS text win._`,
        ].join("\n")
      : "_None._",
    "",
  ].join("\n")
}

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local")
  const db = createClient(url!, key!, { auth: { persistSession: false } }) as unknown as RevisionDb

  const name = process.argv.slice(2).find((a) => !a.startsWith("--"))
  if (!name) fail("Usage: npm run pull-batch -- <batch name>")

  const { data: found, error } = await db.from(T.BATCHES).select("id").eq("name", name!).maybeSingle()
  if (error) fail(`Batch ${name}: ${error.message}`)
  if (!found) fail(`No batch named ${name}. Batch names are on /coverage-checker.`)
  const { batch, items } = await loadBatch(db, (found as { id: string }).id)
  if (!["ready", "pulled"].includes(batch.status)) {
    fail(`“${batch.title}” is ${batch.status}. Decide every heading and mark it ready on /coverage-checker/batches/${batch.id}.`)
  }
  const rows = items as Row[]
  const pending = rows.filter((r) => r.decision === "pending")
  if (pending.length) fail(`${pending.length} headings have no decision: ${pending.map((r) => r.htsno).join(", ")}`)
  const included = rows.filter((r) => r.decision === "include")
  if (!included.length) fail("No heading is included")

  // Cited note text for every heading, from the newest parsed notes
  const notesByCode = new Map<string, CitedNote[]>()
  let notesRevision: string | null = null
  for (const r of rows) {
    const { revision, notes } = await citedNotesFor(db, r.item.note_citations)
    notesRevision = revision ?? notesRevision
    notesByCode.set(r.htsno, notes)
  }
  const parsed = await latestParsedNotes(db)

  // ---------- Write the package ----------
  const outDir = join(OUTPUT_ROOT, batch.name)
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(join(outDir, "headings"), { recursive: true })
  mkdirSync(join(outDir, "reference"), { recursive: true })

  const files = rows.map((row, i) => ({
    index: i + 1,
    file: `headings/${String(i + 1).padStart(2, "0")}-${row.decision}-${row.htsno}.md`,
    row,
  }))
  for (const { index, file, row } of files) {
    writeFileSync(join(outDir, file), renderHeading(row, index, notesByCode.get(row.htsno) ?? [], notesRevision))
  }

  const batchJson = JSON.stringify(
    {
      batch: { name: batch.name, title: batch.title, instructions: batch.instructions, dates_mode: batch.dates_mode },
      headings: rows.map((r) => ({
        htsno: r.htsno,
        decision: r.decision,
        instructions: r.instructions,
        tracking: { status: r.item.status, status_note: r.item.status_note, category: r.item.category, program: r.item.program, priority: r.item.priority, notes: r.item.notes },
        hts: {
          revision: r.item.last_seen_revision,
          description: r.item.description,
          general: r.item.general,
          special: r.item.special,
          other: r.item.other,
          footnotes: r.item.footnotes,
          starts_on: r.item.starts_on,
          note_citations: r.item.note_citations,
        },
        engine: { modeled: recordsFor(r.htsno).length > 0, referenced_by: referencesTo(r.htsno) },
        claude_suggestion: r.item.claude_suggestion,
      })),
    },
    null,
    2
  )
  writeFileSync(join(outDir, "batch.json"), batchJson)

  const verified = getVerifiedRevisions()
  const earliest = verified[0]
  const latest = getLatestVerifiedRevision()
  writeFileSync(
    join(outDir, "instructions.md"),
    [
      `# Instructions: ${batch.title}`,
      "",
      "Written by the user in the coverage checker. These are the user's instructions for the whole batch. They don't override the HTS or note text: if they conflict with it, list the conflict under open questions.",
      "",
      batch.instructions?.trim() || "_No instructions for the whole batch._",
      "",
      "## Effective dates",
      "",
      `**${DATES_MODE_LABELS[batch.dates_mode]}.**`,
      "",
      batch.dates_mode === "earliest_verified"
        ? `Start each heading at the earliest verified revision, ${earliest.name} (${earliest.from}), unless its own text gives a later start ("on or after <date>"), which then wins. Don't research earlier history; the record starts where the engine's verified data starts.`
        : "Research each heading's real legal start date and any later changes (Federal Register notices, proclamations, USTR notices, CSMS messages, change records) and record that history as dated versions (HowTariffsWork.md §17.13). Cite the source of every date. If a date can't be verified, don't guess: list it under open questions.",
      "",
    ].join("\n")
  )
  if (parsed) writeFileSync(join(outDir, "reference", `ch99-notes-${parsed.revision}.md`), renderNotesMarkdown(parsed.notes, parsed.revision))

  const count = (d: CoverageBatchItem["decision"]) => rows.filter((r) => r.decision === d).length
  const manifest = {
    batch: batch.name,
    batchId: batch.id,
    title: batch.title,
    datesMode: batch.dates_mode,
    earliestVerifiedRevision: { name: earliest.name, from: earliest.from },
    latestVerifiedRevision: latest.name,
    htsRevision: rows[0]?.item.last_seen_revision ?? null,
    notesRevision: parsed?.revision ?? null,
    exportedAt: new Date().toISOString(),
    counts: { total: rows.length, include: count("include"), skip: count("skip") },
    allDecided: true,
    contentHash: createHash("sha256").update(batchJson).digest("hex"),
  }
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2))

  const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\s+/g, " ")
  writeFileSync(
    join(outDir, "README.md"),
    [
      `# Coverage batch: ${batch.title}`,
      "",
      `Generated by \`npm run pull-batch -- ${batch.name}\` from the coverage checker. Don't edit by hand; pull again instead.`,
      "",
      `- Headings: ${manifest.counts.include} to add, ${manifest.counts.skip} skipped`,
      `- Effective dates: ${DATES_MODE_LABELS[batch.dates_mode]}`,
      `- HTS text from ${manifest.htsRevision ?? "?"}; note text from ${manifest.notesRevision ?? "(no parsed notes)"}; engine verified through ${latest.name}`,
      "",
      `To plan and implement this batch, run \`/apply-batch ${batch.name}\` in Claude Code. Only **included** headings are to be modeled; skipped ones are listed for the record.`,
      "",
      "## Headings",
      "",
      "| # | Decision | Heading | Category | Program | Priority | Description |",
      "|---|---|---|---|---|---|---|",
      ...files.map(({ index, file, row }) => {
        const category = row.item.category ?? row.item.claude_suggestion?.category ?? row.item.category_suggested
        return `| ${index} | ${row.decision} | [${row.htsno}](${file}) | ${category ? CATEGORY_LABELS[category] : ""} | ${cell(programOf(row.item) ?? "")} | ${row.item.priority ?? ""} | ${cell(row.item.description.slice(0, 120))}${row.item.description.length > 120 ? "…" : ""} |`
      }),
      "",
      "## Files",
      "",
      "- `instructions.md` the user's instructions for the whole batch, and how to date the records",
      "- `headings/` one file per heading: decision, the user's instructions, HTS text and rates, cited note text, what the engine has now, nearby modeled examples, and Claude's suggestion",
      "- `batch.json` the same data, machine-readable",
      ...(parsed ? [`- \`reference/ch99-notes-${parsed.revision}.md\` every parsed Chapter 99 note, for lookups`] : []),
      "- `manifest.json` the batch, revisions, and a hash of `batch.json`",
      "",
    ].join("\n")
  )

  if (batch.status === "ready") {
    const { error: updateError } = await db
      .from(T.BATCHES)
      .update({ status: "pulled", pulled_at: new Date().toISOString(), updated_at: new Date().toISOString() } satisfies Partial<CoverageBatch>)
      .eq("id", batch.id)
    if (updateError) fail(`Wrote the package, but couldn't mark the batch pulled: ${updateError.message}`)
  }

  console.log(`\n✓ Wrote ${outDir}`)
  console.log(`  ${manifest.counts.include} headings to add, ${manifest.counts.skip} skipped`)
  console.log(`  Next: in Claude Code, run /apply-batch ${batch.name}\n`)
}

main().catch((error) => fail((error as Error).message))
