import { callJson } from "../hts-revision-diff/claude"
import type { Rates } from "./types"

// The Claude calls behind AD/CVD cases. Most of the work is regex (parse.ts); Claude does what
// regex can't do safely, each on the model its job needs:
// - a one-sentence summary of each notice, and the rates it sets → Haiku (high volume, short)
// - checking how a scope's HTS codes are sorted (covered, may also enter, excluded) → Sonnet
// - linking an ITC notice to Commerce cases when its numbers aren't known yet → Sonnet
// - reading a case's notices for its scope when nothing else found it → Opus (rare)

export const MODELS = {
  summary: "claude-haiku-5-5",
  scope: "claude-sonnet-5-5",
  link: "claude-sonnet-5-5",
  history: "claude-opus-5-5",
} as const

// Long notices are cut here: the summary and rates are near the top, the scope is read separately
const SUMMARY_CHARS = 60_000

// ---------- Summary and rates ----------

const SUMMARY_SYSTEM = `You read US Commerce Department and US International Trade Commission notices about antidumping (AD) and countervailing duty (CVD) cases, for importers who want a plain heads-up.

- summary: one or two short sentences saying what this notice did, in plain words, for the product and countries named. Facts only, from the text: no advice, no speculation, no "you". Write rates as percentages. Don't call anything final, guaranteed or certain unless the notice itself says it is final. Example: "Commerce issued antidumping and countervailing duty orders on oleoresin paprika from India, so CBP will collect cash deposits on entries."
- companies: every producer or exporter the notice gives a rate for, per case number, with its rate in percent (the cash deposit rate when the notice gives one that differs from the margin, else the margin or subsidy rate) and basis. Also list companies the notice says are excluded from the order itself (excluded: true, rate null), which only happens in a final determination or the order. A company whose administrative review is rescinded, or that had no shipments, is NOT excluded: leave it out. Use each company's name as written. Leave empty when the notice names no company rates.
- rates: for each case number the notice sets rates for, the lowest and highest company rate in percent, the rate for all other producers or exporters ("all others", or the country-wide rate) when given, and the basis: dumping_margin (weighted-average dumping margins), subsidy_rate (net countervailable subsidy rates) or cash_deposit (when the notice gives cash deposit rates that differ from the margins). Leave rates empty when the notice sets none (scheduling, initiations, rescissions, most ITC notices).`

const SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "rates", "companies"],
  properties: {
    summary: { type: "string" },
    companies: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["case_number", "company", "rate", "basis", "excluded"],
        properties: {
          case_number: { type: "string" },
          company: { type: "string" },
          rate: { type: ["number", "null"] },
          basis: { type: "string", enum: ["dumping_margin", "subsidy_rate", "cash_deposit"] },
          excluded: { type: "boolean" },
        },
      },
    },
    rates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["case_number", "low", "high", "all_others", "basis"],
        properties: {
          case_number: { type: "string" },
          low: { type: ["number", "null"] },
          high: { type: ["number", "null"] },
          all_others: { type: ["number", "null"] },
          basis: { type: "string", enum: ["dumping_margin", "subsidy_rate", "cash_deposit"] },
        },
      },
    },
  },
}

export interface SummaryResult {
  summary: string
  companies: { case_number: string; company: string; rate: number | null; basis: Rates["basis"]; excluded: boolean }[]
  rates: (Omit<Rates, "as_of" | "doc"> & { case_number: string })[]
}

export const summarizeNotice = async (input: { title: string; event: string; cases: string[]; text: string }) => {
  const { data, usage } = await callJson<SummaryResult>({
    system: SUMMARY_SYSTEM,
    user: `Notice: ${input.title}\nKind of notice: ${input.event}\nCases: ${input.cases.join(", ") || "none named"}\n\nFull text:\n${input.text.slice(0, SUMMARY_CHARS)}`,
    schema: SUMMARY_SCHEMA,
    // Room for a long table of company rates
    maxTokens: 16000,
    effort: "low",
    model: MODELS.summary,
  })
  return { ...data, usage }
}

// ---------- Scope codes ----------

const SCOPE_SYSTEM = `You sort the HTS codes in the scope of a US antidumping or countervailing duty order or investigation. Importers use the result to see whether their product's HTS code is listed, so be exact and use only codes written in the text.

- main: the codes the scope says the covered merchandise is classified (or "currently classifiable") under.
- also: codes the covered merchandise "may also enter under" or "may also be classified under".
- excluded: codes named only to describe products that are excluded from the scope.
Return codes as digits only (3203.00.8000 → 3203008000). A regex already made a first sort; correct it where it's wrong.`

const SCOPE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["main", "also", "excluded", "notes"],
  properties: {
    main: { type: "array", items: { type: "string" } },
    also: { type: "array", items: { type: "string" } },
    excluded: { type: "array", items: { type: "string" } },
    notes: { type: ["string", "null"], description: "Anything unusual about this scope, in a few words" },
  },
}

export interface ScopeCodes {
  main: string[]
  also: string[]
  excluded: string[]
  notes: string | null
}

const digitsOnly = (codes: string[]) => Array.from(new Set(codes.map((c) => c.replace(/\D/g, "")).filter((c) => c.length >= 4)))
const clean = (s: ScopeCodes): ScopeCodes => ({ main: digitsOnly(s.main), also: digitsOnly(s.also), excluded: digitsOnly(s.excluded), notes: s.notes })

export const checkScopeCodes = async (input: { caseNumber: string; scopeText: string; regex: Omit<ScopeCodes, "notes"> }) => {
  const { data, usage } = await callJson<ScopeCodes>({
    system: SCOPE_SYSTEM,
    user: `Case ${input.caseNumber}. The regex's sort: ${JSON.stringify(input.regex)}\n\nScope text:\n${input.scopeText.slice(0, 40_000)}`,
    schema: SCOPE_SCHEMA,
    maxTokens: 8000,
    effort: "low",
    model: MODELS.scope,
  })
  return { scope: clean(data), usage }
}

const HISTORY_SYSTEM = `You find the scope of a US antidumping or countervailing duty case in the notices published about it, and sort the HTS codes it lists. The notices are given newest first. Use the most recent full scope description that lists HTS codes.

- main: codes the covered merchandise is classified under; also: codes it "may also enter under"; excluded: codes named only for excluded products. Digits only.
- document_number: the notice the scope came from.
- scope_text: the scope's own words that list the HTS codes (up to about 1,500 characters), quoted exactly.
Return empty lists if no notice lists HTS codes for this case.`

const HISTORY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["main", "also", "excluded", "notes", "document_number", "scope_text"],
  properties: {
    ...SCOPE_SCHEMA.properties,
    document_number: { type: ["string", "null"] },
    scope_text: { type: ["string", "null"] },
  },
}

export const readCaseHistory = async (input: { caseNumber: string; notices: { document_number: string; title: string; date: string; text: string }[] }) => {
  const body = input.notices.map((n) => `=== ${n.document_number} (${n.date}) ${n.title}\n${n.text}`).join("\n\n")
  const { data, usage } = await callJson<ScopeCodes & { document_number: string | null; scope_text: string | null }>({
    system: HISTORY_SYSTEM,
    user: `Case ${input.caseNumber}.\n\n${body}`,
    schema: HISTORY_SCHEMA,
    maxTokens: 12000,
    effort: "medium",
    model: MODELS.history,
  })
  return { scope: { ...clean(data), document_number: data.document_number, scope_text: data.scope_text }, usage }
}

// ---------- Linking ITC notices ----------

const LINK_SYSTEM = `You match a US International Trade Commission (ITC) antidumping or countervailing duty notice to the Commerce Department cases on the same product and countries. Pick only cases that are clearly the same proceeding: the same product (wording can differ slightly) from one of the countries the notice names. Return no cases when none clearly fit.`

const LINK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["case_numbers", "reason"],
  properties: {
    case_numbers: { type: "array", items: { type: "string" } },
    reason: { type: "string" },
  },
}

export const linkItcNotice = async (input: {
  title: string
  countries: string[]
  candidates: { case_number: string; product: string | null; country: string | null; status: string }[]
}) => {
  const { data, usage } = await callJson<{ case_numbers: string[]; reason: string }>({
    system: LINK_SYSTEM,
    user: `ITC notice: ${input.title}\nCountries named: ${input.countries.join(", ")}\n\nCommerce cases:\n${JSON.stringify(input.candidates, null, 1)}`,
    schema: LINK_SCHEMA,
    maxTokens: 2000,
    effort: "low",
    model: MODELS.link,
  })
  const known = new Set(input.candidates.map((c) => c.case_number))
  return { caseNumbers: data.case_numbers.filter((c) => known.has(c)), reason: data.reason, usage }
}
