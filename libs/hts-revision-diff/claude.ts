// Claude calls for the revision checker: reading the change record into
// structured items, and summarizing each change in plain English

import Anthropic from "@anthropic-ai/sdk"
import type { BetaMessage } from "@anthropic-ai/sdk/resources/beta/messages/messages"
import { CLAUDE_MODEL, CLAUDE_PRICES } from "./constants"
import type { ChangeRecordItem, ChangeSummary, ClaudeUsage, RevisionSummary } from "./types"
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
const usageOf = (message: BetaMessage): ClaudeUsage => {
  const u = message.usage
  const price = CLAUDE_PRICES[message.model] ?? CLAUDE_PRICES[CLAUDE_MODEL]
  const input = u.input_tokens ?? 0
  const output = u.output_tokens ?? 0
  const cacheRead = u.cache_read_input_tokens ?? 0
  const cacheWrite = u.cache_creation_input_tokens ?? 0
  const cost =
    (input * price.input + output * price.output + cacheRead * price.cacheRead + cacheWrite * price.cacheWrite) / 1_000_000
  return {
    model: message.model,
    input_tokens: input,
    output_tokens: output,
    cache_read_input_tokens: cacheRead,
    cache_creation_input_tokens: cacheWrite,
    cost_usd: Math.round(cost * 10_000) / 10_000,
  }
}

const callJson = async <T>(params: {
  system: string
  user: string
  // A PDF to read alongside the text (base64)
  pdfBase64?: string
  schema: Record<string, unknown>
  maxTokens: number
  effort: "low" | "medium" | "high"
}): Promise<{ data: T; model: string; usage: ClaudeUsage }> => {
  const anthropic = client()
  const request = (withFallback: boolean) =>
    anthropic.beta.messages
      .stream({
        model: CLAUDE_MODEL,
        max_tokens: params.maxTokens,
        thinking: { type: "adaptive" },
        output_config: {
          effort: params.effort,
          format: { type: "json_schema", schema: params.schema },
        },
        system: params.system,
        messages: [
          {
            role: "user",
            content: params.pdfBase64
              ? [
                  {
                    type: "document",
                    source: { type: "base64", media_type: "application/pdf", data: params.pdfBase64 },
                  },
                  { type: "text", text: params.user },
                ]
              : params.user,
          },
        ],
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
    return { data: JSON.parse(text) as T, model: message.model, usage: usageOf(message) }
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
  // Everything downstream depends on this reading, so it gets effort "high"
  const { data, model, usage } = await callJson<{ items: ChangeRecordItem[] }>({
    system: CHANGE_RECORD_SYSTEM,
    user: `Change record for HTS ${revisionName}, converted from PDF to markdown:\n\n<change_record>\n${markdown}\n</change_record>`,
    schema: CHANGE_RECORD_SCHEMA,
    maxTokens: 64000,
    effort: "high",
  })
  return { items: data.items, model, usage }
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
    "matches_change_record",
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
    matches_change_record: {
      type: "object",
      additionalProperties: false,
      required: ["status", "note"],
      properties: {
        status: { type: "string", enum: ["yes", "partly", "no", "not_applicable"] },
        note: { type: "string" },
      },
    },
    open_questions: { type: "array", items: { type: "string" } },
  },
}

const MAX_CLAIMS = 5
const MAX_QUESTIONS = 3

const SUMMARY_SYSTEM = `You summarize one change between two revisions of chapter 99 of the U.S. Harmonized Tariff Schedule for the developer of a tariff calculator. Chapter 99 holds temporary and additional duties (Section 232, Section 301, IEEPA and similar); its notes define coverage, exclusions, stacking and effective dates.

You get the change record entry (if any), word diffs of the changed note text ([-removed-] {+added+}), cited headings, and a little surrounding text. The text came from a PDF and may contain extraction errors; if something looks garbled, say so instead of interpreting it.

Be brief. The developer reads many of these.
- headline: one line, under 15 words.
- summary: 2-3 short sentences on what changed and what it means for duties owed.
- what_changed: at most ${MAX_CLAIMS} items, most important first. Each has a statement (one sentence), a citation (the note key or HTS number as given), and a quote: an exact excerpt of under 25 words copied from the material. Never paraphrase inside a quote.
- category: "data" when only lists, codes, rates or dates change; "logic" when how duties apply changes (coverage conditions, stacking or exclusion rules, country carve-outs, content or value rules); "mixed" for both; "none" for formatting or extraction noise. category_reason: one short sentence.
- effective_dates: only dates stated in the text.
- affected_hts_codes: codes whose duty treatment changes; empty if none are stated.
- engine_impact: one sentence on what the calculator likely needs to change.
- matches_change_record: whether the differences match the change record entry ("not_applicable" when there is none), with a one-sentence note.
- open_questions: at most ${MAX_QUESTIONS}, only real ambiguities.

Only state what the material supports. If the differences look like renumbering or extraction noise, say that in the summary and use category "none".`

export const summarizeChange = async (material: string) => {
  const { data, usage } = await callJson<ChangeSummary>({
    system: SUMMARY_SYSTEM,
    user: material,
    schema: SUMMARY_SCHEMA,
    maxTokens: 16000,
    effort: "medium",
  })
  // Mark which quotes actually appear in the material we sent
  const haystack = normalizeForCompare(material).toLowerCase()
  data.what_changed = data.what_changed.slice(0, MAX_CLAIMS).map((claim) => ({
    ...claim,
    verified: haystack.includes(normalizeForCompare(claim.quote).toLowerCase()),
  }))
  data.open_questions = data.open_questions.slice(0, MAX_QUESTIONS)
  data.usage = usage
  return { summary: data, model: usage.model, usage }
}

// ---------- Heading pages check ----------

const HEADING_ROW_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["htsno", "stat_suffix", "indent", "description", "general", "special", "other", "units", "footnotes", "page"],
  properties: {
    htsno: { type: "string" },
    stat_suffix: { type: "string" },
    indent: { type: "integer" },
    description: { type: "string" },
    general: { type: "string" },
    special: { type: "string" },
    other: { type: "string" },
    units: { type: "string" },
    footnotes: { type: "array", items: { type: "string" } },
    page: { type: ["integer", "null"] },
  },
}

const HEADING_CHECK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["rows", "issues"],
  properties: {
    rows: { type: "array", items: HEADING_ROW_SCHEMA },
    issues: { type: "array", items: { type: "string" } },
  },
}

const HEADING_CHECK_SYSTEM = `You check Chapter 99 heading rows that a program extracted from tariff-table pages of the U.S. Harmonized Tariff Schedule. You get the PDF pages and the extracted rows. The extraction can drop or merge rows, split cells, misread digits and loses the indentation of descriptions.

Return the complete, correct list of rows as printed on the pages, in page order:
- One row per line of the table, including description-only rows (a heading's parent text such as "Articles of aluminum:"), which have htsno "".
- htsno: the heading or subheading number exactly as printed (e.g. "9903.82.18"); stat_suffix: the two-digit statistical suffix or "".
- indent: 0 for a description at the left edge of the description column, 1 for one indentation step in, and so on.
- description, general (rates of duty column 1 General), special, other (column 2), units: the text exactly as printed, without dot leaders. Use "" for empty cells.
- footnotes: each footnote that applies to the row, written as "1/ See chapter 99 statistical note 1.", taking the text from the footnotes printed on the page.
- page: the 1-based page of the PDF the row is on.
Copy text exactly; never invent rows or values that aren't on the pages.

issues: one short sentence for each difference between the extracted rows and the pages (a wrong rate, a missing or extra row, a split description). Empty if they match.`

// ---------- Revision summary ----------

const REVISION_SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "overview", "programs", "countries", "key_changes", "calculation_impact", "effective_dates", "watch_for"],
  properties: {
    headline: { type: "string" },
    overview: { type: "string" },
    programs: { type: "array", items: { type: "string" } },
    countries: { type: "array", items: { type: "string" } },
    key_changes: { type: "array", items: { type: "string" } },
    calculation_impact: { type: "string" },
    effective_dates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["date", "applies_to"],
        properties: { date: { type: "string" }, applies_to: { type: "string" } },
      },
    },
    watch_for: { type: "array", items: { type: "string" } },
  },
}

const REVISION_SUMMARY_SYSTEM = `You give a trade compliance professional a high-level overview of one revision of chapter 99 of the U.S. Harmonized Tariff Schedule, so they can sanity-check what it's about before it's applied to a tariff calculator. Chapter 99 holds additional duties: Section 232 (steel, aluminum, copper, autos, trucks, wood, semiconductors), Section 301 (China), Section 122, IEEPA, and country deals.

You get a short brief for each change listed in the revision's change record: the change record entry, any reviewer notes, and a summary or an excerpt of the note differences. Cover only what the change record lists. Reviewer notes are the reviewer's instructions; follow them.

Be concise and concrete. Only state what the briefs support.
- headline: one line, under 15 words: what this revision is about.
- overview: 2-3 sentences.
- programs: the programs involved, e.g. "Section 232: steel and aluminum", "Section 301: China". Empty if none.
- countries: countries specifically affected; ["All countries"] when it isn't country-specific.
- key_changes: at most 6, most important first, one sentence each, citing the note or heading.
- calculation_impact: one or two sentences: what changes in how duties are calculated (rates, coverage, stacking, exemptions), or "No change to how duties are calculated."
- effective_dates: legal effective dates and what they apply to, including retroactive ones.
- watch_for: at most 3 things worth double-checking (retroactive dates, new conditions, unclear text). Empty if nothing stands out.`

export const summarizeRevision = async (material: string, changesCovered: number) => {
  const { data, usage } = await callJson<Omit<RevisionSummary, "changes_covered" | "approved_changes" | "generated_at" | "usage">>({
    system: REVISION_SUMMARY_SYSTEM,
    user: material,
    schema: REVISION_SUMMARY_SCHEMA,
    maxTokens: 8000,
    effort: "low",
  })
  const summary: RevisionSummary = {
    ...data,
    key_changes: data.key_changes.slice(0, 6),
    watch_for: data.watch_for.slice(0, 3),
    changes_covered: changesCovered,
    generated_at: new Date().toISOString(),
    usage,
  }
  return summary
}

export const checkHeadingRows = async (
  pdf: Buffer,
  parsedRows: unknown[],
  citedCodes: string[]
) => {
  const { data, usage } = await callJson<{ rows: import("./types").HeadingFields[]; issues: string[] }>({
    system: HEADING_CHECK_SYSTEM,
    pdfBase64: pdf.toString("base64"),
    user: `Extracted rows (JSON):\n${JSON.stringify(parsedRows, null, 1)}${
      citedCodes.length ? `\n\nThe change record for this revision cites these headings: ${citedCodes.join(", ")}` : ""
    }`,
    schema: HEADING_CHECK_SCHEMA,
    maxTokens: 32000,
    effort: "high",
  })
  return { ...data, usage }
}
