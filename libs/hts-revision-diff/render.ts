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
  out.push("", `Change record consistency: ${summary.change_record_consistency}`)
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
