// Claude calls for the revision checker: reading the change record into
// structured items, and summarizing each change in plain English

import Anthropic from "@anthropic-ai/sdk"
import type { BetaMessage } from "@anthropic-ai/sdk/resources/beta/messages/messages"
import { CLAUDE_MODEL } from "./constants"
import type { ChangeRecordItem, ChangeSummary } from "./types"
import { normalizeForCompare } from "./text"

const client = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set in .env.local")
  }
  return new Anthropic()
}

// Structured JSON output with adaptive thinking. Server-side fallbacks are on
// so a safety-classifier decline is retried on a fallback model instead of
// failing; if the API rejects the fallback option, the call is retried once
// without it.
const callJson = async <T>(params: {
  system: string
  user: string
  schema: Record<string, unknown>
  maxTokens: number
}): Promise<{ data: T; model: string }> => {
  const anthropic = client()
  const request = (withFallback: boolean) =>
    anthropic.beta.messages
      .stream({
        model: CLAUDE_MODEL,
        max_tokens: params.maxTokens,
        thinking: { type: "adaptive" },
        output_config: {
          effort: "high",
          format: { type: "json_schema", schema: params.schema },
        },
        system: params.system,
        messages: [{ role: "user", content: params.user }],
        ...(withFallback
          ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
          : {}),
      })
      .finalMessage()

  let message: BetaMessage
  try {
    message = await request(true)
  } catch (error) {
    if (error instanceof Anthropic.BadRequestError && /fallback/i.test(error.message)) {
      message = await request(false)
    } else {
      throw error
    }
  }

  if (message.stop_reason === "refusal") {
    throw new Error(
      `Claude declined this request${message.stop_details?.category ? ` (${message.stop_details.category})` : ""}`
    )
  }
  if (message.stop_reason === "max_tokens") {
    throw new Error("Claude's answer was cut off (max_tokens). The input may be too large.")
  }
  const text = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
  try {
    return { data: JSON.parse(text) as T, model: message.model }
  } catch {
    throw new Error("Claude returned output that isn't valid JSON")
  }
}

const nullable = (type: string) => ({ type: [type, "null"] })

// ---------- Change record ----------

const CHANGE_RECORD_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "in_chapter_99",
          "kind",
          "action",
          "subchapter",
          "note_type",
          "note_citations",
          "hts_codes",
          "hts_code_ranges",
          "description",
          "effective_date",
          "authority",
          "source_text",
        ],
        properties: {
          id: { type: "string" },
          in_chapter_99: { type: "boolean" },
          kind: { type: "string", enum: ["note", "hts_code", "other"] },
          action: {
            type: "string",
            enum: ["added", "modified", "deleted", "redesignated", "other"],
          },
          subchapter: nullable("string"),
          note_type: {
            anyOf: [
              { type: "string", enum: ["us_note", "statistical_note", "chapter_note", "other"] },
              { type: "null" },
            ],
          },
          note_citations: { type: "array", items: { type: "string" } },
          hts_codes: { type: "array", items: { type: "string" } },
          hts_code_ranges: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["from", "to"],
              properties: { from: { type: "string" }, to: { type: "string" } },
            },
          },
          description: { type: "string" },
          effective_date: nullable("string"),
          authority: nullable("string"),
          source_text: { type: "string" },
        },
      },
    },
  },
}

const CHANGE_RECORD_SYSTEM = `You read the change record that the U.S. International Trade Commission publishes with each revision of the Harmonized Tariff Schedule (HTS), and turn it into a list of structured items.

Rules:
- One item per distinct change. If one entry changes several notes or headings in different ways, split it; if it makes the same change to a list of headings, keep it as one item with all the codes.
- Include every change to chapter 99 (its notes, subchapter U.S. notes, statistical notes, and headings 9901-9908). Set in_chapter_99 to true for these.
- Include a change outside chapter 99 only if its text mentions chapter 99 or a 99xx heading. Set in_chapter_99 to false for these. Skip all other changes outside chapter 99.
- id: "CR-1", "CR-2", ... in the order the items appear in the change record.
- subchapter: roman numeral only ("III"), or null for chapter-level notes or when not stated.
- note_type: "us_note" for subchapter U.S. notes, "statistical_note", "chapter_note" for chapter 99's own notes, "other", or null when the item isn't about a note.
- note_citations: just the citation with no spaces or words, like "2(v)(xi)" or "20" or "16(a)(iii)". List each note cited separately. Empty when no note is cited.
- hts_codes: dotted HTS numbers exactly as cited ("9903.01.25", "8471.30.0100"). Expand lists, but don't expand ranges: put "9903.01.25 through 9903.01.30" in hts_code_ranges instead.
- description: one plain sentence on what the change does.
- effective_date: ISO date (YYYY-MM-DD) if stated, else null. authority: the cited proclamation, executive order, Federal Register notice or statute, else null.
- source_text: the entry's text copied exactly from the change record, so it can be checked against the source.
- Never invent items, citations, codes or dates that aren't in the change record.`

export const extractChangeRecord = async (markdown: string, revisionName: string) => {
  const { data, model } = await callJson<{ items: ChangeRecordItem[] }>({
    system: CHANGE_RECORD_SYSTEM,
    user: `Change record for HTS ${revisionName}, converted from PDF to markdown:\n\n<change_record>\n${markdown}\n</change_record>`,
    schema: CHANGE_RECORD_SCHEMA,
    maxTokens: 64000,
  })
  return { items: data.items, model }
}

// ---------- Change summaries ----------

const SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "headline",
    "summary",
    "what_changed",
    "category",
    "category_reason",
    "effective_dates",
    "affected_hts_codes",
    "engine_impact",
    "change_record_consistency",
    "open_questions",
  ],
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    what_changed: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["statement", "citation", "quote"],
        properties: {
          statement: { type: "string" },
          citation: { type: "string" },
          quote: { type: "string" },
        },
      },
    },
    category: { type: "string", enum: ["data", "logic", "mixed", "none"] },
    category_reason: { type: "string" },
    effective_dates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["date", "applies_to"],
        properties: { date: { type: "string" }, applies_to: { type: "string" } },
      },
    },
    affected_hts_codes: { type: "array", items: { type: "string" } },
    engine_impact: { type: "string" },
    change_record_consistency: { type: "string" },
    open_questions: { type: "array", items: { type: "string" } },
  },
}

const SUMMARY_SYSTEM = `You explain changes between two revisions of chapter 99 of the U.S. Harmonized Tariff Schedule to the developer of a tariff calculator. Chapter 99 holds temporary and additional duties (Section 232, Section 301, IEEPA and similar programs). Its notes define which goods are covered, exclusions, how duties stack, and effective dates.

You get the change record entries (if any), the differences in the parsed note text and headings, and surrounding context. The text was extracted from PDF, so it can contain extraction errors; say so if something looks garbled rather than interpreting it.

Write for someone who will update the calculator's data and logic:
- headline: one line.
- summary: 2-6 plain-English sentences on what changed and what it means for duties owed.
- what_changed: each specific change as a statement, with citation (note key or HTS number as given in the material) and quote, an exact excerpt of the new (or removed) text that supports it. Copy quotes exactly; never paraphrase inside a quote.
- category: "data" when only lists, codes, rates or dates change; "logic" when how duties apply changes (scope conditions, stacking or exclusion rules, country carve-outs, content or value rules); "mixed" for both; "none" when the difference is only formatting or extraction noise.
- effective_dates: dates stated in the text and what they apply to.
- affected_hts_codes: codes whose duty treatment changes.
- engine_impact: what the calculator likely needs to change.
- change_record_consistency: whether the differences match what the change record says, and anything the change record mentions that the differences don't show (or the reverse).
- open_questions: anything ambiguous that the developer should check.

Only state what the material supports. If the differences look like renumbering or extraction noise rather than a real change, say that.`

export const summarizeChange = async (material: string) => {
  const { data, model } = await callJson<ChangeSummary>({
    system: SUMMARY_SYSTEM,
    user: material,
    schema: SUMMARY_SCHEMA,
    maxTokens: 32000,
  })
  // Mark which quotes actually appear in the material we sent
  const haystack = normalizeForCompare(material).toLowerCase()
  data.what_changed = data.what_changed.map((claim) => ({
    ...claim,
    verified: haystack.includes(normalizeForCompare(claim.quote).toLowerCase()),
  }))
  return { summary: data, model }
}
