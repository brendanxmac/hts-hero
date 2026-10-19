import { callJson } from "../hts-revision-diff/claude"
import { AUTHORITIES, KINDS, type Category, type Extraction } from "./types"

// The three Claude calls behind tariff updates, each on the model its job needs (through the
// revision checker's callJson: structured JSON output, refusal fallbacks where offered):
// - sorting items by title and summary: a label, high volume, mistakes fixable in review → Haiku
// - reading a tariff action's full text: writes the public headline and summary and pulls the
//   dates and codes alerts depend on → Opus
// - grouping an action into an update: a pick from a short list, low-confidence picks are
//   flagged for review → Sonnet
// Sorting and grouping are choices from a list, so a classifier (such as TypeSafe's Jev) could
// take them over later; reading writes text, so it stays on Claude.

export const MODELS = {
  sort: "claude-haiku-5-5",
  read: "claude-opus-5-5",
  group: "claude-sonnet-5-5",
} as const

// ---------- Sorting ----------

export interface TriageInput {
  index: number
  source: string
  doc_type: string | null
  agencies: string[]
  title: string
  summary: string | null
}

const TRIAGE_SYSTEM = `You sort US government publications for importers who track US import tariffs. For each item, pick one category:

- tariff_action: creates, raises, lowers, extends, pauses, ends or changes the coverage of US import duties or tariffs (Section 232, 301, 122, 338, 201, IEEPA, "reciprocal" tariffs, tariff terms of trade agreements, tariff-rate quota quantities or rates set or changed by a proclamation, statute, trade agreement or Federal Register notice, de minimis), including product exclusions and inclusions, CBP guidance on how to apply such a change, and announced or proposed actions and investigations that could lead to new tariffs (a Section 232 investigation, a proposed Section 301 action).
- ad_cvd: antidumping or countervailing duty proceedings (Commerce or ITC initiations, determinations, reviews, orders, scope rulings, sunset reviews).
- trade_related: about trade or imports but changes no tariff (routine quota administration: CBP quota bulletins on quota periods, openings, allocations, fill levels, restraint limits or proration results; ACE systems and outages, withhold release orders, labor mechanism cases, export controls, section 337 patent investigations, meetings, speeches).
- not_relevant: anything else.

Judge from the title and summary. When an item is plausibly a tariff_action, choose tariff_action: a later step reads the full text.`

const TRIAGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["index", "category", "reason"],
        properties: {
          index: { type: "integer" },
          category: { type: "string", enum: ["tariff_action", "ad_cvd", "trade_related", "not_relevant"] },
          reason: { type: "string", description: "A few words on why" },
        },
      },
    },
  },
}

export const triageItems = async (items: TriageInput[]) => {
  const { data, usage } = await callJson<{ items: { index: number; category: Exclude<Category, "hts_revision">; reason: string }[] }>({
    system: TRIAGE_SYSTEM,
    user: `Sort these ${items.length} items. Return one entry per index.\n\n${JSON.stringify(items, null, 1)}`,
    schema: TRIAGE_SCHEMA,
    maxTokens: 16000,
    effort: "low",
    model: MODELS.sort,
  })
  return { answers: data.items, usage }
}

// ---------- Reading a tariff action ----------

const EXTRACT_SYSTEM = `You read a US government publication about a tariff action and describe it for importers on a public tariff updates page. Be exact and plain: say what changes, for which goods and countries, from when. No speculation, no hype, no advice. Use only what the text says.

- headline: under 100 characters, factual, present tense, naming the action ("US sets 25% Section 232 tariff on heavy trucks and parts").
- summary: 2 to 4 sentences for an importer: what changes, who and what it covers, the rate, when it applies, and anything notable (exclusions, stacking, refunds). Name the legal instrument (proclamation number, executive order, notice).
- kind and authority: the closest fit. A CBP message implementing an action takes the action's authority with kind "guidance".
- countries: ISO 3166 alpha-2 codes of the countries whose goods are affected, or ["ALL"] when it applies to all countries (list countries carved out in the summary instead). Empty if none apply.
- hts_codes: HTS chapters, headings or codes the text names as covered (e.g. "Chapter 73", "8703", "9903.81.90"), as written, at most 200; list the Chapter 99 headings first.
- effective_on: the date the change takes effect for goods entered, YYYY-MM-DD, or null.
- confidence: 0 to 1, how sure you are that this is a real tariff action and that the fields are right. Lower it for vague announcements, unclear dates, or text that was cut off.
- notes: anything uncertain or worth a reviewer's eye, or null.`

const EXTRACT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "summary", "kind", "authority", "countries", "hts_codes", "products", "effective_on", "confidence", "notes"],
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    // HTS revisions and AD/CVD cases get their updates elsewhere (libs/adcvd), never from this reader
    kind: { type: "string", enum: Object.keys(KINDS).filter((k) => k !== "hts_revision" && k !== "ad_cvd") },
    authority: { type: "string", enum: Object.keys(AUTHORITIES).filter((a) => a !== "hts" && a !== "ad_cvd") },
    countries: { type: "array", items: { type: "string" } },
    hts_codes: { type: "array", items: { type: "string" } },
    products: { type: ["string", "null"], description: "What's covered, in a few words" },
    effective_on: { type: ["string", "null"] },
    confidence: { type: "number" },
    notes: { type: ["string", "null"] },
  },
}

export const extractAction = async (item: { source: string; doc_type: string | null; title: string; published_at: string }, text: string) => {
  const { data, usage } = await callJson<Extraction>({
    system: EXTRACT_SYSTEM,
    user: `Source: ${item.source}${item.doc_type ? ` (${item.doc_type})` : ""}\nPublished: ${item.published_at.slice(0, 10)}\nTitle: ${item.title}\n\nFull text:\n${text}`,
    schema: EXTRACT_SCHEMA,
    maxTokens: 16000,
    effort: "medium",
    model: MODELS.read,
  })
  return { extraction: data, usage }
}

// ---------- Grouping ----------

export interface GroupCandidate {
  id: string
  title: string
  authority: string
  countries: string[]
  products: string | null
  effective_on: string | null
  stage: string
  first_seen: string
  summary: string
}

const GROUP_SYSTEM = `You keep a list of US tariff updates, one per real-world tariff action. A single action shows up in several publications over days or weeks: a USTR announcement, the signed proclamation or executive order, its Federal Register filing and publication, CBP's implementing guidance (CSMS). Decide whether a new publication is another step of an action already on the list, or a new action.

An update is one proceeding, so join it when the publication is a step of the same proceeding: the investigation's start, requests for comments, public hearings, a proposed action, the determination, the action that comes out of it (the proclamation, order or notice), and that action's filing, publication and CBP guidance. A later, separate action that modifies an earlier one after it took effect (raises its rate, adds products, adds an exclusion, delays it) is a new update, even under the same authority. When unsure, start a new update and give a low confidence.`

const GROUP_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["update_id", "confidence", "reason"],
  properties: {
    update_id: { type: ["string", "null"], description: "The id of the update this belongs to, or null for a new update" },
    confidence: { type: "number" },
    reason: { type: "string" },
  },
}

export const chooseUpdate = async (
  item: { source: string; doc_type: string | null; title: string; published_at: string; extraction: Extraction },
  candidates: GroupCandidate[]
) => {
  const { data, usage } = await callJson<{ update_id: string | null; confidence: number; reason: string }>({
    system: GROUP_SYSTEM,
    user: `New publication:\n${JSON.stringify({ source: item.source, doc_type: item.doc_type, published: item.published_at.slice(0, 10), title: item.title, ...item.extraction }, null, 1)}\n\nUpdates on the list (most recent first):\n${JSON.stringify(candidates, null, 1)}`,
    schema: GROUP_SCHEMA,
    maxTokens: 8000,
    effort: "low",
    model: MODELS.group,
  })
  // An id Claude made up counts as a new update
  return { ...data, update_id: candidates.some((c) => c.id === data.update_id) ? data.update_id : null, usage }
}
