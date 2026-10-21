import { callJson } from "../hts-revision-diff/claude"
import { pollConversion, submitConversion } from "../hts-revision-diff/datalab"
import type { ClaudeUsage } from "../hts-revision-diff/types"
import { MODELS } from "./claude"
import type { Pdf, ReadScope } from "./scope"

// The scope reader's second method (scope.ts has the first, which hands Claude the PDFs): datalab
// turns the PDFs into markdown, the code lists are read out of the markdown's tables by pattern, and
// Claude reads a shortened copy (every list cut to its first rows) to say which lists cover and
// which carve out, plus the countries, the Chapter 99 headings and any codes named in the prose. So
// Claude never reads page images or writes out thousands of codes, which is most of the first
// method's cost. Codes are checked against the HTS; those it doesn't have are listed in the notes.

const MAX_PROMPT_CHARS = 400_000
// Rows of a list Claude sees before the rest are cut
const ROWS_SHOWN = 4
// Rows past those that are shown anyway: ones whose words may limit the codes ("Ex", "for use in
// civil aircraft", "religious purposes only"), so Claude can say which carve-outs are conditional.
// Claude still decides; this only chooses what it sees.
const LIMITING_WORDS = /\bex\b|\bonly\b|\bfor use\b|aircraft|pharma|religious|provided that|\bexcept\b|\bif\b|\bwhen\b|value of/i
// For the whole action, so a long annex can't crowd out the rest
const LIMITING_SHOWN = 200

// A row's own limit, in an exclusion list: the annex marks the rows that are exempt only for a use
// ("Aircraft", "Pharma") or only for what the row describes ("Ex"). Those codes may be exempt, not
// excluded. The mark is in the row of a code-and-columns table, or in a grid's code cell.
const ROW_MARKS: { pattern: RegExp; condition: string }[] = [
  { pattern: /aircraft/i, condition: "for use in civil aircraft (rows marked Aircraft)" },
  { pattern: /pharma/i, condition: "for pharmaceutical use (rows marked Pharma)" },
  { pattern: /religious/i, condition: "for religious purposes only (as the row says)" },
  { pattern: /\bex\b/i, condition: "only the product the row describes (rows marked Ex)" },
  { pattern: /\bonly\b|\bfor use\b/i, condition: "only as the row describes" },
]
const rowMark = (text: string) => ROW_MARKS.find((m) => m.pattern.test(text))?.condition ?? null

// The codes on a list line that carry their own limit, with it
const markedCodes = (line: string, codes: string[]): [string, string][] => {
  const parts = line.trimStart().startsWith("|") && codes.length > 1 ? line.split("|") : [line]
  return parts.flatMap((part) => {
    const mark = rowMark(part.replace(RANGE, " ").replace(new RegExp(CODE.source, "g"), " "))
    return mark ? (parts.length === 1 ? codes : codesIn(part)).map((c): [string, string] => [c, mark]) : []
  })
}
const POLL_MS = 4_000
const CONVERT_TIMEOUT_MS = 20 * 60_000

// ---------- Codes ----------

// "7326.90.86", "8708.10", "7208.10.15.00", "8807.10.0015", "9903.81.90"
const DOTTED = String.raw`\d{4}\.\d{2}(?:\.\d{2}(?:\.?\d{2})?)?`
const RANGE = new RegExp(String.raw`\b(${DOTTED})\s*(?:-|–|—|\bthrough\b|\bto\b)\s*(${DOTTED})\b`, "gi")
const CODE = new RegExp(String.raw`(?<![\d.])(?:${DOTTED}|\d{10}|\d{8})(?![\d.]*\d)`, "g")

const dotted = (digits: string) => [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean).join(".")

// Every code and range on a line, as written (ranges as "8708.10–8708.99"). In a table row, only
// the cells that hold codes count, not descriptions ("Sorbitol other than that of subheading
// 2905.44" names a code it isn't about)
const codesOn = (line: string): string[] => {
  if (line.trimStart().startsWith("|")) {
    return line.split("|").flatMap((cell) => {
      const words = cell.replace(RANGE, " ").replace(new RegExp(CODE.source, "g"), " ").replace(/\bex\b|<[^>]+>|[^a-z]/gi, "")
      return words.length > 2 ? [] : codesIn(cell)
    })
  }
  return codesIn(line)
}

const codesIn = (line: string) => {
  const found: string[] = []
  const rest = line.replace(RANGE, (_, lo: string, hi: string) => {
    found.push(`${dotted(lo.replace(/\D/g, ""))}–${dotted(hi.replace(/\D/g, ""))}`)
    return " "
  })
  // Written the same way whatever the annex's style: "8807.10.00.15"
  for (const m of Array.from(rest.matchAll(CODE))) found.push(dotted(m[0].replace(/\D/g, "")))
  // A cell holding just a heading ("8541")
  if (/^\s*(ex\s+)?\d{4}\s*$/i.test(line)) found.push(line.trim().slice(-4))
  return found
}

const isChapter99 = (code: string) => code.startsWith("9903")

// ---------- Blocks ----------

// The markdown in blocks, one per heading (datalab marks titles with #), annex title, lettered
// subdivision ("(b)(1)") and table (a table never shares a block with the text around it, so each
// list gets its own role), each with
// the codes its list lines carry. A list line is a table row, or a line that's mostly codes;
// codes in sentences are left to Claude, who reads those in full (with their conditions).
interface Block {
  id: string
  document: string
  lines: string[]
  codes: string[]
  // Codes whose row limits them, with the limit
  marked: Map<string, string>
}

const BLOCK_START = /^\s*(#{1,6}\s|\**\s*(annex|appendix|attachment|schedule|list)\b|["“]?\(([a-z]{1,2}|[ivx]{1,5}|\d{1,2})\)\s)/i
const isTableLine = (line: string) => line.trimStart().startsWith("|")

const isListLine = (line: string, codes: string[]) =>
  line.trimStart().startsWith("|") ? codes.length > 0 : codes.length >= 3 && codes.join(" ").length > line.trim().length / 2

// Whether the documents name a code Claude gave ("8708", "8708.10", "Chapter 73", a range), exactly:
// Claude sometimes adds codes it knows from similar actions, or shortens a listed code to a broader
// one, neither of which these documents say
const namedIn = (markdown: string) => {
  const digits = markdown.replace(/(\d)\.(?=\d)/g, "$1")
  const has = (code: string) => {
    const chapter = code.match(/^ch(?:apter|\.)?\s*(\d{1,2})$/i)?.[1]
    if (chapter) return new RegExp(String.raw`chapter\s+0?${Number(chapter)}\b`, "i").test(markdown)
    const d = code.replace(/\D/g, "")
    // As given, not as the start of a longer code: "8471.41" isn't named by "8471.41.01"
    return d.length >= 4 && new RegExp(String.raw`(?<!\d)${d}(?!\d)`).test(digits)
  }
  return (code: string) => code.split(/\s*(?:-|–|—|\bthrough\b|\bto\b)\s*/i).every(has)
}

const toBlocks = (docs: { title: string; markdown: string }[]) => {
  const blocks: Block[] = []
  for (const doc of docs) {
    let current: Block | null = null
    let inTable = false
    for (const line of doc.markdown.split("\n")) {
      // Blank lines inside a table don't end it
      const table: boolean = line.trim() ? isTableLine(line) : inTable
      if (!current || (!table && BLOCK_START.test(line)) || table !== inTable) {
        current = { id: `B${blocks.length + 1}`, document: doc.title, lines: [], codes: [], marked: new Map() }
        blocks.push(current)
      }
      inTable = table
      current.lines.push(line)
      const codes = codesOn(line)
      if (isListLine(line, codes)) {
        current.codes.push(...codes)
        for (const [code, mark] of markedCodes(line, codes)) current.marked.set(code, mark)
      }
    }
  }
  return blocks
}

// The shortened markdown Claude reads: every block labelled, each list cut to its first rows
const shortened = (blocks: Block[]) => {
  const parts: string[] = []
  let limiting = 0
  let document = ""
  for (const block of blocks) {
    if (block.document !== document) {
      document = block.document
      parts.push(`\n\n======== Document: ${document} ========\n`)
    }
    const listed = block.codes.length
    parts.push(`\n[${block.id}${listed ? ` · ${listed} codes in its lists` : ""}]`)
    let shown = 0
    let cut = 0
    for (const line of block.lines) {
      const codes = codesOn(line)
      if (!isListLine(line, codes)) {
        parts.push(line)
        continue
      }
      if (shown < ROWS_SHOWN) {
        shown++
        // A long run of codes on one line: the first few
        parts.push(codes.length > 8 ? `${line.slice(0, 300)} … (${codes.length} codes on this line)` : line)
      } else if (limiting < LIMITING_SHOWN && LIMITING_WORDS.test(line.replace(new RegExp(CODE.source, "g"), " "))) {
        limiting++
        parts.push(line.length > 200 ? `${line.slice(0, 200)} …` : line)
      } else cut++
    }
    if (cut) parts.push(`[… ${cut} more list lines with codes in ${block.id}]`)
  }
  return parts.join("\n")
}

// ---------- Claude ----------

const SYSTEM = `You read the official documents of a US tariff action (a proclamation or executive order with its annexes, a Federal Register notice, a CBP message), converted to markdown, to say exactly what it covers, for matching it against importers' products.

The markdown is split into labelled blocks ([B12]). Blocks with code lists say how many codes their lists hold; only their first rows are shown, the rest are cut, and the codes are collected separately. You don't list those codes: you say what each list is for.

- list_roles: for every block that has codes in its lists:
  - role: "covered" (products the action applies to; for an action that grants an exemption, a lower rate or an exclusion, the products that get it), "excluded" (products it carves out for every importer), "conditional" (products carved out only for a use, a certification or a claim, e.g. civil aircraft under General Note 6, pharmaceutical use, "Ex" entries limited to a description), or "other" (lists that aren't about coverage: rate tables of other programs, examples, codes being amended for another reason, Chapter 99 heading tables).
  - quote: the words in the documents that give the list that role, copied exactly (a sentence or clause of at most 300 characters, e.g. "the additional duty shall not apply to the products listed in subdivision (b)"). It must appear in the markdown as written.
  - condition: for "conditional", the condition in a few words (e.g. "for use in civil aircraft"); otherwise null.
- all_products: true when the action applies to every product of the countries it names, apart from listed exceptions.
- named_codes: HTS codes, subheadings or headings named in the prose as covered that aren't in a list (e.g. "articles of heading 8703", "Chapter 73"). Write chapters as "Chapter 73". No Chapter 99 numbers.
- named_excluded_codes: codes named in the prose as carved out for every importer.
- named_conditional: codes carved out only for a use, certification or claim, grouped by condition: named in the prose, or rows of an exclusion list that carry their own limit (an "Ex" entry limited to a description, "for religious purposes only", Chapter 98 provisions where duty still applies to part of the value). These stay matched even when their list is "excluded".
Only give codes that appear in these documents, written as they appear.
- countries: ISO 3166 alpha-2 codes of the countries whose goods it applies to, or ["ALL"] for every country.
- excluded_countries: countries explicitly exempted (alpha-2).
- headings: the Chapter 99 headings it creates, changes or names as the ones to report (e.g. "9903.81.90").
- complete: false when the documents point to an annex or list that isn't among them, or the text was cut off, so the codes may be incomplete.
- notes: anything a reviewer should check (how products are defined without codes, phased dates, a list whose role you weren't sure of), or null.`

const ROLES = ["covered", "excluded", "conditional", "other"] as const
type Role = (typeof ROLES)[number]

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["list_roles", "all_products", "named_codes", "named_excluded_codes", "named_conditional", "countries", "excluded_countries", "headings", "complete", "notes"],
  properties: {
    list_roles: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["block", "role", "quote", "condition"],
        properties: {
          block: { type: "string" },
          role: { type: "string", enum: ROLES },
          quote: { type: "string" },
          condition: { type: ["string", "null"] },
        },
      },
    },
    all_products: { type: "boolean" },
    named_codes: { type: "array", items: { type: "string" } },
    named_excluded_codes: { type: "array", items: { type: "string" } },
    named_conditional: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["condition", "codes"],
        properties: { condition: { type: "string" }, codes: { type: "array", items: { type: "string" } } },
      },
    },
    countries: { type: "array", items: { type: "string" } },
    excluded_countries: { type: "array", items: { type: "string" } },
    headings: { type: "array", items: { type: "string" } },
    complete: { type: "boolean" },
    notes: { type: ["string", "null"] },
  },
}

interface ListRole {
  block: string
  role: Role
  quote: string
  condition: string | null
}

interface Answer {
  list_roles: ListRole[]
  all_products: boolean
  named_codes: string[]
  named_excluded_codes: string[]
  named_conditional: { condition: string; codes: string[] }[]
  countries: string[]
  excluded_countries: string[]
  headings: string[]
  complete: boolean
  notes: string | null
}

// Two readings of the same documents, made into one. Where they disagree, the answer that misses
// fewer imports wins (a list covered rather than not, not excluded rather than excluded), and the
// disagreement is listed for review: better an import flagged than one missed.
const SAFETY: Record<Role, number> = { covered: 3, conditional: 2, other: 1, excluded: 0 }

const combine = (a: Answer, b: Answer) => {
  const disagreements: string[] = []
  // Lists read two ways, grouped by the two roles: "B12, B14: read as conditional and as excluded"
  const split = new Map<string, string[]>()
  const byBlock = (x: Answer) => new Map(x.list_roles.map((r) => [r.block, r]))
  const [ra, rb] = [byBlock(a), byBlock(b)]
  const roles = new Map<string, ListRole>()
  for (const block of Array.from(new Set([...Array.from(ra.keys()), ...Array.from(rb.keys())]))) {
    const x = ra.get(block)
    const y = rb.get(block)
    const pair = x && y ? (x.role !== y.role ? `read as ${[x.role, y.role].sort().join(" and as ")}` : null) : `given a role (${(x ?? y)!.role}) in one reading only`
    if (pair) split.set(pair, [...(split.get(pair) ?? []), block])
    roles.set(block, !x ? y! : !y ? x : SAFETY[y.role] > SAFETY[x.role] ? y : x)
  }
  for (const [pair, blocks] of Array.from(split)) disagreements.push(`${blocks.length} list${blocks.length === 1 ? "" : "s"} ${pair} (${blocks.slice(0, 8).join(", ")}${blocks.length > 8 ? "…" : ""})`)
  const same = (p: string[], q: string[]) => {
    const n = (v: string[]) => Array.from(new Set(v.map((s) => s.trim().toUpperCase()))).sort().join(",")
    return n(p) === n(q)
  }
  if (a.all_products !== b.all_products) disagreements.push("Read once as every product and once as listed products")
  if (!same(a.countries, b.countries)) disagreements.push(`Countries read differently: ${a.countries.join(" ")} / ${b.countries.join(" ")}`)
  if (!same(a.excluded_countries, b.excluded_countries)) disagreements.push(`Excluded countries read differently: ${a.excluded_countries.join(" ")} / ${b.excluded_countries.join(" ")}`)
  if (!same(a.headings, b.headings)) disagreements.push(`Headings read differently: ${a.headings.join(" ")} / ${b.headings.join(" ")}`)
  const both = (p: string[], q: string[]) => p.filter((c) => q.map((x) => x.trim()).includes(c.trim()))
  const onlyOne = (p: string[], q: string[]) => [...p, ...q].filter((c) => !both(p, q).includes(c))
  if (onlyOne(a.named_excluded_codes, b.named_excluded_codes).length)
    disagreements.push(`Exclusions named in one reading only (not applied): ${Array.from(new Set(onlyOne(a.named_excluded_codes, b.named_excluded_codes))).join(", ")}`)
  const answer: Answer = {
    list_roles: Array.from(roles.values()),
    // Every product flags more imports than a list does
    all_products: a.all_products || b.all_products,
    named_codes: Array.from(new Set([...a.named_codes, ...b.named_codes])),
    // Excluded only when both readings say so
    named_excluded_codes: both(a.named_excluded_codes, b.named_excluded_codes),
    named_conditional: [...a.named_conditional, ...b.named_conditional],
    countries: Array.from(new Set([...a.countries, ...b.countries])),
    excluded_countries: both(a.excluded_countries, b.excluded_countries),
    headings: Array.from(new Set([...a.headings, ...b.headings])),
    complete: a.complete && b.complete,
    notes: Array.from(new Set([a.notes, b.notes].filter(Boolean))).join(" ") || null,
  }
  return { answer, disagreements }
}

// ---------- Datalab ----------

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Pages in the PDF itself, to check datalab converted them all (null if it can't be read)
const pageCount = async (pdf: Pdf) => {
  try {
    const { PDFDocument } = await import("pdf-lib")
    return (await PDFDocument.load(Buffer.from(pdf.base64, "base64"), { ignoreEncryption: true, updateMetadata: false })).getPageCount()
  } catch {
    return null
  }
}

const convertOnce = async (pdf: Pdf) => {
  const { checkUrl } = await submitConversion(new Blob([Buffer.from(pdf.base64, "base64")], { type: "application/pdf" }), pdf.url.split("/").pop() || "document.pdf")
  const until = Date.now() + CONVERT_TIMEOUT_MS
  while (Date.now() < until) {
    await sleep(POLL_MS)
    const result = await pollConversion(checkUrl)
    if (result.state === "complete") return { markdown: result.markdown, pages: result.pageCount ?? 0 }
    if (result.state === "failed") throw new Error(`datalab couldn't convert ${pdf.title}: ${result.error}`)
  }
  throw new Error(`datalab took too long to convert ${pdf.title}`)
}

// The 8- and 10-digit codes in the PDF's own text layer (none for a scanned PDF), to check the
// conversion against: a code the text has and the markdown doesn't is a row datalab dropped
const textLayerCodes = async (pdf: Pdf) => {
  try {
    const { extractText, getDocumentProxy } = await import("unpdf")
    const doc = await getDocumentProxy(new Uint8Array(Buffer.from(pdf.base64, "base64")))
    const { text } = await extractText(doc, { mergePages: true })
    return new Set(codesIn(text).map((c) => c.replace(/\D/g, "")).filter((d) => d.length >= 8))
  } catch {
    return new Set<string>()
  }
}

const lostCodes = (expected: Set<string>, markdown: string) => {
  const found = new Set(markdown.split("\n").flatMap(codesIn).map((c) => c.replace(/\D/g, "")))
  return Array.from(expected).filter((d) => !found.has(d))
}

// datalab now and then returns fewer pages than the PDF has, or drops rows: converted again (twice
// at most), and the fullest result kept, with what's still missing noted
const CONVERT_TRIES = 3
const convert = async (pdf: Pdf) => {
  const [expected, textCodes] = await Promise.all([pageCount(pdf), textLayerCodes(pdf)])
  let best: { markdown: string; pages: number; lost: string[] } | null = null
  const worse = (a: { pages: number; lost: string[] }, b: { pages: number; lost: string[] }) => a.pages < b.pages || (a.pages === b.pages && a.lost.length > b.lost.length)
  for (let attempt = 0; attempt < CONVERT_TRIES; attempt++) {
    const result = await convertOnce(pdf)
    const tried = { ...result, lost: lostCodes(textCodes, result.markdown) }
    if (!best || worse(best, tried)) best = tried
    if ((expected === null || best.pages >= expected) && !best.lost.length) break
  }
  return { title: pdf.title, url: pdf.url, markdown: best!.markdown, pages: best!.pages, expected, short: expected !== null && best!.pages < expected, lost: best!.lost }
}

// ---------- The reader ----------

export interface DatalabRead {
  data: ReadScope
  usage: ClaudeUsage
  pages: number
  // Documents read, and ones datalab couldn't convert
  documents: string[]
  failed: string[]
  // Codes the HTS doesn't have (misread, or retired since)
  unknownCodes: string[]
}

const addUsage = (a: ClaudeUsage, b: ClaudeUsage): ClaudeUsage => ({
  model: a.model,
  input_tokens: a.input_tokens + b.input_tokens,
  output_tokens: a.output_tokens + b.output_tokens,
  cache_read_input_tokens: a.cache_read_input_tokens + b.cache_read_input_tokens,
  cache_creation_input_tokens: a.cache_creation_input_tokens + b.cache_creation_input_tokens,
  cost_usd: Math.round((a.cost_usd + b.cost_usd) * 10_000) / 10_000,
})

// Text compared loosely: quotes, dashes, spacing and markdown marks aside
const loose = (text: string) =>
  text
    .toLowerCase()
    .replace(/[“”‘’"'`*_]/g, "")
    .replace(/[–—-]/g, "-")
    .replace(/<[^>]+>/g, " ")
    .replace(/[|\s]+/g, " ")
    .trim()

// `knownCode` says whether the HTS has a code (its digits); without it, codes aren't checked
// The public inspection copy and the published Federal Register document are the same text (same
// document number, "2026-14654.pdf"): only the published one is read, so the lists aren't read twice
const withoutDuplicates = (pdfs: Pdf[]) => {
  const name = (p: Pdf) => p.url.split("/").pop() ?? p.url
  const published = new Set(pdfs.filter((p) => !p.url.includes("public-inspection")).map(name))
  return pdfs.filter((p) => !p.url.includes("public-inspection") || !published.has(name(p)))
}

export const readWithDatalab = async (title: string, all: Pdf[], { knownCode }: { knownCode?: (digits: string) => boolean } = {}): Promise<DatalabRead> => {
  const pdfs = withoutDuplicates(all)
  const settled = await Promise.allSettled(pdfs.map(convert))
  const docs = settled.flatMap((s) => (s.status === "fulfilled" ? [s.value] : []))
  const failed = pdfs.filter((_, i) => settled[i].status === "rejected").map((p) => p.title)
  if (!docs.length) throw new Error(`datalab couldn't convert any document: ${settled.map((s) => (s.status === "rejected" ? String(s.reason) : "")).join("; ").slice(0, 300)}`)
  const short = docs.filter((d) => d.short)
  const lost = docs.filter((d) => d.lost.length)

  const blocks = toBlocks(docs)
  let text = shortened(blocks)
  const cutOff = text.length > MAX_PROMPT_CHARS
  if (cutOff) text = text.slice(0, MAX_PROMPT_CHARS)
  const ask = () =>
    callJson<Answer>({
      system: SYSTEM,
      user: `The tariff action: ${title}\n\nIts official documents, as markdown:\n${text}${cutOff ? "\n\n[The text was cut off here.]" : ""}\n\nSay exactly what it covers.`,
      schema: SCHEMA,
      maxTokens: 32000,
      effort: "high",
      model: MODELS.group,
    })
  // Read twice, independently
  const [first, second] = await Promise.all([ask(), ask()])
  const { answer, disagreements } = combine(first.data, second.data)
  const usage = addUsage(first.usage, second.usage)

  // Each role must rest on words the documents contain
  const fullText = loose(docs.map((d) => d.markdown).join("\n"))
  const unquoted = answer.list_roles.filter((r) => r.role !== "other" && !fullText.includes(loose(r.quote))).map((r) => r.block)

  const role = new Map(answer.list_roles.map((r) => [r.block, r]))
  const named = namedIn(docs.map((d) => d.markdown).join("\n"))
  const notInDocuments = [
    ...answer.named_codes,
    ...answer.named_excluded_codes,
    ...answer.named_conditional.flatMap((c) => c.codes),
  ].filter((c) => !named(c))
  answer.named_codes = answer.named_codes.filter(named)
  answer.named_excluded_codes = answer.named_excluded_codes.filter(named)
  const listed = (which: Role) => blocks.filter((b) => role.get(b.id)?.role === which).flatMap((b) => b.codes)
  const covered = listed("covered")
  // A code in both a covered and an excluded list (the same annex labelled two ways, in two copies
  // of a document) stays covered: better an import flagged than one missed
  const inCovered = new Set(covered)
  const conflicting = Array.from(new Set(listed("excluded").filter((c) => inCovered.has(c))))
  // Rows of exclusion lists that carry their own limit
  const markedRows = blocks.filter((b) => role.get(b.id)?.role === "excluded").flatMap((b) => Array.from(b.marked))
  // A carve-out that's conditional anywhere (its own row, or the prose) never excludes the import
  const conditionalDigits = new Set([
    ...answer.named_conditional.flatMap((c) => c.codes.map((x) => x.replace(/\D/g, ""))),
    ...markedRows.map(([code]) => code.replace(/\D/g, "")),
  ])
  const excluded = listed("excluded").filter((c) => !inCovered.has(c) && !conditionalDigits.has(c.replace(/\D/g, "")))
  const uniq = (codes: string[]) => Array.from(new Set(codes.map((c) => c.trim()).filter(Boolean)))
  const productCodes = (codes: string[]) => uniq(codes.filter((c) => !isChapter99(c)))

  const coveredCodes = answer.all_products ? ["ALL"] : productCodes([...covered, ...answer.named_codes])
  const excludedCodes = productCodes([...excluded, ...answer.named_excluded_codes.filter((c) => !conditionalDigits.has(c.replace(/\D/g, "")))])
  // Carve-outs for a use or a claim, by condition: they never stop an import being matched
  const conditional = new Map<string, string[]>()
  const addConditional = (condition: string, codes: string[]) => conditional.set(condition, [...(conditional.get(condition) ?? []), ...codes])
  for (const b of blocks) {
    const r = role.get(b.id)
    if (r?.role === "conditional" && b.codes.length) addConditional(r.condition?.trim() || "under a condition", b.codes)
  }
  for (const c of answer.named_conditional) addConditional(c.condition.trim(), c.codes.filter(named))
  for (const [code, mark] of markedRows) addConditional(mark, [code])
  const conditionalExclusions = Array.from(conditional, ([condition, codes]) => ({ condition, codes: productCodes(codes) })).filter((c) => c.codes.length)
  // Chapter 99 headings: Claude's, and those in the covered lists
  const headings = uniq([...answer.headings, ...covered.filter(isChapter99)])
  const unknownCodes = knownCode
    ? [...coveredCodes, ...excludedCodes].filter((c) => /^\d{4}(\.\d{2}){0,3}$/.test(c) && !knownCode(c.replace(/\D/g, "")))
    : []
  const unsure = blocks.filter((b) => b.codes.length && !role.has(b.id)).map((b) => b.id)

  // What a person should check before the scope is trusted
  const review = [
    ...short.map((d) => `datalab converted ${d.pages} of ${d.expected} pages of ${d.title}.`),
    ...lost.map((d) => `${d.lost.length} codes in the PDF's text are missing from its conversion (${d.title}): ${d.lost.slice(0, 12).map(dotted).join(", ")}${d.lost.length > 12 ? "…" : ""}.`),
    failed.length ? `datalab couldn't convert: ${failed.join(", ")}.` : null,
    cutOff ? "The documents were too long to read whole: codes may be incomplete." : null,
    ...disagreements.map((d) => `The two readings disagree: ${d}.`),
    unquoted.length ? `Roles not backed by a quote found in the documents: ${unquoted.join(", ")}.` : null,
    unsure.length ? `Lists with no role (left out): ${unsure.join(", ")}.` : null,
    notInDocuments.length ? `Codes Claude named that the documents don't (left out): ${notInDocuments.join(", ")}.` : null,
  ].filter((r): r is string => !!r)

  const notes = [
    ...review,
    unknownCodes.length ? `Codes the current HTS doesn't have (misread or retired): ${unknownCodes.slice(0, 30).join(", ")}${unknownCodes.length > 30 ? ` and ${unknownCodes.length - 30} more` : ""}.` : null,
    conflicting.length ? `In both a covered and an excluded list, kept as covered: ${conflicting.length} codes (${conflicting.slice(0, 10).join(", ")}).` : null,
    answer.notes,
  ].filter(Boolean)

  return {
    data: {
      covered_codes: coveredCodes,
      excluded_codes: excludedCodes,
      conditional_exclusions: conditionalExclusions,
      countries: answer.countries,
      excluded_countries: answer.excluded_countries,
      headings,
      complete: answer.complete && !cutOff && !failed.length && !short.length && !lost.length,
      notes: notes.length ? notes.join(" ") : null,
      review,
    },
    usage,
    pages: docs.reduce((n, d) => n + d.pages, 0),
    documents: docs.map((d) => d.url),
    failed,
    unknownCodes,
  }
}

// Whether the HTS has a code: any element whose digits start with it
export const knownCodes = (htsnos: string[]) => {
  const prefixes = new Set<string>()
  for (const htsno of htsnos) {
    const digits = htsno.replace(/\D/g, "")
    for (const n of [4, 6, 8, 10]) if (digits.length >= n) prefixes.add(digits.slice(0, n))
  }
  return (digits: string) => prefixes.has(digits)
}
