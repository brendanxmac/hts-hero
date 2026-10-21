// "Suggest with Claude": reads a few headings with the notes they cite and suggests a category,
// a program, and what the engine needs to model each one. Suggestions only; the UI decides.

import { AllRules } from "../../tariffs/engine-v2/data"
import type { RevisionDb } from "../hts-revision-diff/access"
import { callJson } from "../hts-revision-diff/claude"
import { CATEGORIES, CATEGORY_LABELS, CoverageTables as T, SUGGEST_CHUNK, SUGGESTION_PROMPT_VERSION } from "./constants"
import { must } from "./db"
import { citedNotesFor, examplesFor } from "./server"
import type { ClaudeSuggestion, CoverageItem } from "./types"

// Long code lists make up most of some notes; a few thousand characters per note is plenty here
const NOTE_LIMIT = 6000

const SYSTEM = `You help maintain a US import duty calculator. Its tariff engine models Chapter 99 headings of the
Harmonized Tariff Schedule (HTSUS) as dated records: a program (e.g. "Section 301 – China"), the
countries and HTS codes in scope, conditions, and a rate rule. You are shown Chapter 99 headings the
engine doesn't model yet, with the U.S. notes they cite, and suggest how to classify each one.

For each heading give:
- category: what kind of provision it is (one of the listed categories).
- program: the id of the existing engine program it belongs to, or null if none fits.
- new_program: if no program fits, a short name for the program to create (else null).
- summary: one or two plain sentences on what the heading does (who/what it covers, the duty).
- modeling: two to four sentences on what the engine needs: the scope (countries, code lists, from
  which note), conditions or answers the importer must give, the rate rule, and how it interacts with
  headings it names (exceptions, stacking). Mention anything unusual (quotas, specific rates,
  date windows). Don't invent facts the text doesn't support; say what's unclear.
- complexity: low (a rate and a code list), medium (conditions, exceptions or several headings
  together), high (quotas, new mechanisms, unclear text).

Write plainly. Cite notes as the text does ("U.S. note 20(h)").`

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headings"],
  properties: {
    headings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["htsno", "category", "program", "new_program", "summary", "modeling", "complexity"],
        properties: {
          htsno: { type: "string" },
          category: { type: "string", enum: [...CATEGORIES] },
          program: { type: ["string", "null"] },
          new_program: { type: ["string", "null"] },
          summary: { type: "string" },
          modeling: { type: "string" },
          complexity: { type: "string", enum: ["low", "medium", "high"] },
        },
      },
    },
  },
}

const material = async (db: RevisionDb, items: CoverageItem[]) => {
  const citations = Array.from(new Map(items.flatMap((i) => i.note_citations).map((c) => [c.key, c])).values())
  const { notes } = await citedNotesFor(db, citations)
  const programs = AllRules.programs
    .map((p) => `- ${p.id}: ${p.name} (${p.authority}${p.tradeDeal ? ", trade deal" : ""})`)
    .join("\n")
  const categories = CATEGORIES.map((c) => `- ${c}: ${CATEGORY_LABELS[c]}`).join("\n")

  const headingText = items
    .map((i) => {
      const examples = examplesFor(i)
        .map((e) => `    - ${e.code} (${e.program}): ${e.name}`)
        .join("\n")
      return [
        `## ${i.htsno}`,
        `Description: ${i.description || "(none)"}`,
        `General rate: ${i.general || "(blank)"}`,
        i.special && `Special rate: ${i.special}`,
        i.other && `Column 2 rate: ${i.other}`,
        i.footnotes.length > 0 && `Footnotes: ${i.footnotes.join(" · ")}`,
        i.note_citations.length > 0 && `Cites: ${i.note_citations.map((c) => c.label).join(", ")}`,
        i.engine_referenced && "The engine already names this heading elsewhere (e.g. as an exception).",
        examples && `Modeled headings nearby:\n${examples}`,
      ]
        .filter(Boolean)
        .join("\n")
    })
    .join("\n\n")

  const noteText = notes
    .filter((n) => n.nodes.length)
    .map((n) => {
      const text = n.nodes.map((node) => `${"  ".repeat(node.depth)}${node.citation} ${node.text}`).join("\n")
      return `## ${n.label}${n.foundKey !== n.key ? ` (showing ${n.foundKey})` : ""}\n${text.length > NOTE_LIMIT ? `${text.slice(0, NOTE_LIMIT)}\n[…truncated]` : text}`
    })
    .join("\n\n")

  return `# Engine programs\n${programs}\n\n# Categories\n${categories}\n\n# Headings\n${headingText}\n\n# Cited notes\n${noteText || "(none found)"}`
}

// Suggests for up to SUGGEST_CHUNK headings in one call and saves the suggestions
export const suggestForHeadings = async (db: RevisionDb, htsnos: string[]) => {
  if (!htsnos.length) throw new Error("No headings given")
  if (htsnos.length > SUGGEST_CHUNK) throw new Error(`At most ${SUGGEST_CHUNK} headings per call`)
  const items = must<CoverageItem[]>(await db.from(T.ITEMS).select("*").in("htsno", htsnos), "Load headings")
  const { data, model, usage } = await callJson<{ headings: ({ htsno: string } & Omit<ClaudeSuggestion, "model" | "prompt_version" | "usage" | "created_at">)[] }>({
    system: SYSTEM,
    user: await material(db, items),
    schema: SCHEMA,
    maxTokens: 16000,
    effort: "low",
  })

  const programIds = new Set(AllRules.programs.map((p) => p.id))
  const share = usage
    ? { ...usage, cost_usd: Math.round((usage.cost_usd / items.length) * 10_000) / 10_000 }
    : null
  const created = new Date().toISOString()
  const saved: CoverageItem[] = []
  for (const { htsno, ...s } of data.headings) {
    if (!items.some((i) => i.htsno === htsno)) continue
    const suggestion: ClaudeSuggestion = {
      ...s,
      // Only a real program id counts; anything else becomes a new-program suggestion
      program: s.program && programIds.has(s.program) ? s.program : null,
      new_program: s.program && !programIds.has(s.program) ? s.new_program ?? s.program : s.new_program,
      model,
      prompt_version: SUGGESTION_PROMPT_VERSION,
      usage: share,
      created_at: created,
    }
    saved.push(
      must<CoverageItem>(
        await db.from(T.ITEMS).update({ claude_suggestion: suggestion }).eq("htsno", htsno).select("*").single(),
        `Save suggestion for ${htsno}`
      )
    )
  }
  return { items: saved, usage }
}
