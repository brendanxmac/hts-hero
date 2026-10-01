// Markdown renderings of a change, used both as the material sent to Claude
// for a summary and in the package the pull script writes to the repo

import type { ChangePayload, ChangeRow, ChangeSummary, CodeDiff, NoteDiff } from "./types"
import { renderWordDiff } from "./word-diff"

const fence = (text: string) => `\`\`\`text\n${text.replace(/```/g, "'''")}\n\`\`\``

const renderNoteDiff = (d: NoteDiff, fromName: string, toName: string) => {
  const lines: string[] = []
  const where =
    d.status === "renumbered"
      ? `${d.fromLabel} → ${d.label}`
      : d.label
  lines.push(`#### ${d.status.toUpperCase()}: ${where}`)
  lines.push(
    `Key: \`${d.toKey ?? d.fromKey}\`${d.fromPage ? ` · ${fromName} PDF page ${d.fromPage}` : ""}${d.toPage ? ` · ${toName} PDF page ${d.toPage}` : ""}`
  )
  if (d.status === "modified" && d.words) {
    lines.push("", "Word diff (`[-removed-]` `{+added+}`):", fence(renderWordDiff(d.words)))
  }
  if (d.before !== null && d.status !== "renumbered") {
    lines.push("", `Before (${fromName}):`, fence(d.before || "(no text of its own)"))
  }
  if (d.after !== null) {
    lines.push("", `${d.status === "renumbered" ? "Text (unchanged)" : `After (${toName})`}:`, fence(d.after || "(no text of its own)"))
  }
  for (const r of d.rangeChanges ?? []) {
    lines.push("", `Code range ${r.before ?? "(none)"} → ${r.after ?? "(none)"}: ${r.description}`)
  }
  if (d.codesAdded.length) lines.push("", `HTS codes now mentioned: ${d.codesAdded.join(", ")}`)
  if (d.codesRemoved.length) lines.push("", `HTS codes no longer mentioned: ${d.codesRemoved.join(", ")}`)
  return lines.join("\n")
}

const rowText = (row: CodeDiff["after"]) =>
  row
    ? [
        `Description: ${row.description}`,
        `General: ${row.general || "—"}`,
        `Special: ${row.special || "—"}`,
        `Other: ${row.other || "—"}`,
        row.footnotes.length ? `Footnotes: ${row.footnotes.join(" | ")}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : ""

const renderCodeDiff = (d: CodeDiff, fromName: string, toName: string) => {
  const name = d.htsno || `(row without a code under ${d.after?.parentHtsno ?? d.before?.parentHtsno})`
  const lines = [`#### ${d.status.toUpperCase()}: ${name}`]
  if (d.status === "added") lines.push(fence(rowText(d.after)))
  if (d.status === "removed") lines.push(fence(rowText(d.before)))
  if (d.status === "modified") {
    for (const f of d.fields) {
      lines.push(
        "",
        `Field \`${f.field}\`:`,
        fence(
          f.words
            ? renderWordDiff(f.words)
            : `${fromName}: ${f.before}\n${toName}: ${f.after}`
        )
      )
    }
  }
  return lines.join("\n")
}

export const renderChangeMaterial = (
  title: string,
  payload: ChangePayload,
  fromName: string,
  toName: string
) => {
  const out: string[] = [`# ${title}`, ""]
  out.push(`Comparing ${fromName} (older) to ${toName} (newer).`, "")

  out.push("## Change record entries")
  if (payload.changeRecordItems.length) {
    for (const item of payload.changeRecordItems) {
      out.push(
        "",
        `### ${item.id} (${item.action})`,
        fence(item.source_text),
        `- Effective date: ${item.effective_date ?? "not stated"}`,
        `- Authority: ${item.authority ?? "not stated"}`,
        item.note_citations.length
          ? `- Notes cited: ${item.note_citations.join(", ")}${item.subchapter ? ` (subchapter ${item.subchapter})` : ""}`
          : "",
        item.hts_codes.length ? `- Codes cited: ${item.hts_codes.join(", ")}` : "",
        item.hts_code_ranges.length
          ? `- Code ranges cited: ${item.hts_code_ranges.map((r) => `${r.from}–${r.to}`).join(", ")}`
          : ""
      )
    }
  } else {
    out.push("", "None. These differences were found by the diff but the change record doesn't mention them.")
  }

  if (payload.warnings.length) {
    out.push("", "## Warnings", ...payload.warnings.map((w) => `- ${w}`))
  }

  if (payload.noteDiffs.length) {
    out.push("", "## Note differences")
    for (const d of payload.noteDiffs) out.push("", renderNoteDiff(d, fromName, toName))
  }
  if (payload.citedHeadings?.length) {
    out.push("", `## Headings cited by the change record, as they read in ${toName}`)
    for (const c of payload.citedHeadings) {
      if (c.status === "found" && c.row) out.push("", `#### ${c.code}`, fence(rowText(c.row)))
      else if (c.status === "not_found") out.push("", `#### ${c.code}`, `Not in ${toName}'s Chapter 99 data.`)
      else out.push("", `#### ${c.code}`, `Not checked: no Chapter 99 JSON for ${toName}.`)
    }
  }
  if (payload.codeDiffs.length) {
    out.push("", "## Chapter 99 heading differences (from the JSON)")
    for (const d of payload.codeDiffs) out.push("", renderCodeDiff(d, fromName, toName))
  }
  if (payload.context.length) {
    out.push("", "## Context")
    for (const c of payload.context) {
      out.push(
        "",
        `### ${c.label} (${c.revision === "to" ? toName : fromName})`,
        `${c.reason}. Key: \`${c.key}\``,
        fence(c.text)
      )
    }
  }
  return out.join("\n")
}

export const renderSummary = (summary: ChangeSummary) => {
  const out = [
    `**${summary.headline}**`,
    "",
    summary.summary,
    "",
    `Category: **${summary.category}**. ${summary.category_reason}`,
  ]
  if (summary.what_changed.length) {
    out.push("", "What changed:")
    for (const c of summary.what_changed) {
      out.push(
        `- ${c.statement} (${c.citation})${c.verified === false ? " ⚠️ quote not found in the source text" : ""}`,
        `  > ${c.quote}`
      )
    }
  }
  if (summary.effective_dates.length) {
    out.push("", "Effective dates:", ...summary.effective_dates.map((e) => `- ${e.date}: ${e.applies_to}`))
  }
  if (summary.affected_hts_codes.length) {
    out.push("", `Affected codes: ${summary.affected_hts_codes.join(", ")}`)
  }
  out.push("", `Engine impact: ${summary.engine_impact}`)
  if (summary.matches_change_record) {
    out.push("", `Matches change record: ${summary.matches_change_record.status}. ${summary.matches_change_record.note}`)
  } else if (summary.change_record_consistency) {
    out.push("", `Change record consistency: ${summary.change_record_consistency}`)
  }
  if (summary.open_questions.length) {
    out.push("", "Open questions:", ...summary.open_questions.map((q) => `- ${q}`))
  }
  return out.join("\n")
}

export const renderChangeForExport = (
  change: ChangeRow,
  index: number,
  fromName: string,
  toName: string
) => {
  const out = [
    `<!-- change_key: ${change.change_key} · hash: ${change.payload.hash} -->`,
    `# ${String(index).padStart(2, "0")}. ${change.title}`,
    "",
    `- Decision: **${change.decision}**`,
    `- Category: ${change.category ?? "not set"}`,
    `- Source: ${change.source.replace(/_/g, " ")}`,
    "",
    "## Reviewer notes",
    "",
    change.reviewer_notes?.trim() || "_None._",
    "",
    "## AI summary",
    "",
    change.summary
      ? `${renderSummary(change.summary)}\n\n_Generated by ${change.summary_model} (${change.summary_prompt_version}). Treat the note text below as the source of truth._`
      : "_Not summarized._",
    "",
    "---",
    "",
    renderChangeMaterial(change.title, change.payload, fromName, toName).replace(/^# .*\n/, ""),
  ]
  return out.join("\n")
}

// ---------- Compact material for Claude summaries ----------

const SUMMARY_LIMITS = {
  total: 45_000, // characters, roughly 11k tokens
  addedText: 3_000,
  removedText: 1_500,
  afterText: 1_500, // full new text of a modified subdivision, when short enough to quote from
  contextBlock: 1_500,
  contextTotal: 8_000,
  codes: 40,
}

const clip = (text: string, max: number) => (text.length <= max ? text : `${text.slice(0, max)} … [${text.length - max} more characters]`)

const codeList = (codes: string[]) =>
  codes.length <= SUMMARY_LIMITS.codes
    ? codes.join(", ")
    : `${codes.slice(0, SUMMARY_LIMITS.codes).join(", ")} … and ${codes.length - SUMMARY_LIMITS.codes} more`

// What a summary needs and no more: change record entries, word diffs, cited
// headings and a little newer-revision context, capped in size. The full
// before/after text stays in the review screen and the pulled package.
export const renderSummaryMaterial = (
  title: string,
  payload: ChangePayload,
  fromName: string,
  toName: string
) => {
  const out: string[] = [`# ${title}`, `Comparing ${fromName} (older) to ${toName} (newer).`]
  let length = 0
  const push = (...lines: string[]) => {
    for (const line of lines) {
      out.push(line)
      length += line.length + 1
    }
  }

  push("", "## Change record entries")
  if (payload.changeRecordItems.length) {
    for (const item of payload.changeRecordItems) {
      push(
        `- ${item.id} (${item.action}): ${item.source_text}`,
        `  Effective: ${item.effective_date ?? "not stated"}. Authority: ${item.authority ?? "not stated"}.`
      )
    }
  } else {
    push("None: the diff found these differences but the change record doesn't mention them.")
  }
  if (payload.warnings.length) push("", "## Warnings", ...payload.warnings.map((w) => `- ${w}`))

  const diffs = payload.noteDiffs
  if (diffs.length) {
    push("", "## Note differences")
    let shown = 0
    for (const d of diffs) {
      if (length > SUMMARY_LIMITS.total) break
      shown++
      const key = d.toKey ?? d.fromKey
      if (d.status === "renumbered") {
        push("", `### Renumbered: ${d.fromLabel} → ${d.label} (text unchanged)`)
        continue
      }
      push("", `### ${d.status}: ${d.label} [${key}]`)
      if (d.status === "modified" && d.words) {
        push(renderWordDiff(d.words, 25))
        if (d.after && d.after.length <= SUMMARY_LIMITS.afterText) push(`New text: ${d.after}`)
      }
      if (d.status === "added") push(clip(d.after ?? "", SUMMARY_LIMITS.addedText))
      if (d.status === "removed") push(clip(d.before ?? "", SUMMARY_LIMITS.removedText))
      for (const r of d.rangeChanges ?? []) push(`Code range ${r.before ?? "(none)"} → ${r.after ?? "(none)"}: ${r.description}`)
      if (d.codesAdded.length) push(`Codes now listed: ${codeList(d.codesAdded)}`)
      if (d.codesRemoved.length) push(`Codes no longer listed: ${codeList(d.codesRemoved)}`)
    }
    if (shown < diffs.length) push("", `[${diffs.length - shown} more differences not shown here]`)
  }

  if (payload.codeDiffs.length) {
    push("", "## Heading differences (Chapter 99 JSON)")
    for (const d of payload.codeDiffs) {
      if (length > SUMMARY_LIMITS.total) break
      push(`### ${d.status}: ${d.htsno || "(text row)"}`)
      if (d.status === "modified") {
        for (const f of d.fields) push(`${f.field}: ${f.words ? renderWordDiff(f.words, 15) : `${f.before} → ${f.after}`}`)
      } else {
        push(rowText(d.after ?? d.before))
      }
    }
  }

  if (payload.citedHeadings?.length) {
    push("", `## Headings cited by the change record (${toName})`)
    for (const c of payload.citedHeadings) {
      if (c.status === "found" && c.row) push(`- ${c.code}: ${c.row.description} | General: ${c.row.general || "—"}`)
      else push(`- ${c.code}: ${c.status === "not_found" ? `not in ${toName}'s Chapter 99 data` : "not checked (no JSON)"}`)
    }
  }

  const context = payload.context.filter((c) => c.revision === "to")
  if (context.length && length < SUMMARY_LIMITS.total) {
    push("", "## Surrounding text (newer revision, shortened)")
    let used = 0
    for (const c of context) {
      if (used > SUMMARY_LIMITS.contextTotal) break
      const text = clip(c.text, SUMMARY_LIMITS.contextBlock)
      used += text.length
      push(`### ${c.label} (${c.reason})`, text)
    }
  }
  return out.join("\n")
}
