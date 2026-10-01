// Parses the markdown datalab produces from the Chapter 99 PDF into a tree of
// note subdivisions, so each piece of a note can be addressed by its citation
// ("Subchapter III, U.S. note 2(v)(xi)(B)") and diffed on its own.
//
// Hierarchy detection follows hts-data-processing's parse-hts-markdown.ts
// (type-based: same type = sibling, an ancestor's next value = back up,
// otherwise a new child), with changes for Chapter 99:
// - roman/letter ambiguity ("(v)", "(C)") is resolved by which reading
//   continues a sequence, instead of fixed exclusions
// - tokens out of sequence are kept as text and reported as warnings, so a
//   sentence that wraps onto a line starting "(a) of this note" doesn't
//   become a subdivision
// - "U.S. Notes (con.)" style continuation headings don't reset the tree
// - the tariff table that follows each subchapter's notes is skipped (the
//   headings themselves come from the Chapter 99 JSON)
// - PDF page numbers are tracked from datalab's paginated output

import { PARSER_VERSION } from "./constants"
import type { NoteNode, ParsedNotes, ParseWarning } from "./types"
import { extractHtsCodes, isRoman, romanToInt, slugify } from "./text"

type TokenType =
  | "number"
  | "letter"
  | "roman"
  | "numeric"
  | "upper_letter"
  | "upper_roman"
  | "double_lower"
  | "double_upper"

interface StackEntry {
  type: TokenType
  value: string
  key: string
}

const FIRST_VALUE: Record<TokenType, string> = {
  number: "1",
  letter: "a",
  roman: "i",
  numeric: "1",
  upper_letter: "A",
  upper_roman: "I",
  double_lower: "aa",
  double_upper: "AA",
}

// HTS writes the letter i as "(ij)" so that "(i)" is always a roman numeral
const LOWER_LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h", "ij", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
const UPPER_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

const isNextInSequence = (type: TokenType, prev: string, next: string) => {
  switch (type) {
    case "number":
    case "numeric":
      return Number(next) === Number(prev) + 1
    case "letter": {
      const p = LOWER_LETTERS.indexOf(prev)
      return p >= 0 && LOWER_LETTERS.indexOf(next) === p + 1
    }
    case "upper_letter": {
      const p = UPPER_LETTERS.indexOf(prev)
      return p >= 0 && UPPER_LETTERS.indexOf(next) === p + 1
    }
    case "roman":
    case "upper_roman":
      return romanToInt(next) === romanToInt(prev) + 1
    case "double_lower":
    case "double_upper": {
      if (prev.length !== 2 || next.length !== 2) return false
      const a = prev.toLowerCase()
      const b = next.toLowerCase()
      // aa -> ab
      if (a[0] === b[0] && b.charCodeAt(1) === a.charCodeAt(1) + 1) return true
      // aa -> bb
      return a[0] === a[1] && b[0] === b[1] && b.charCodeAt(0) === a.charCodeAt(0) + 1
    }
  }
}

// Possible readings of a parenthesized token, most likely first
const classifyParenToken = (value: string): TokenType[] => {
  if (/^\d{1,3}$/.test(value)) return ["numeric"]
  if (/^[a-z]+$/.test(value)) {
    if (value === "ij") return ["letter"]
    if (value.length === 1) {
      if ("ivx".includes(value)) {
        return value === "i" ? ["roman"] : ["roman", "letter"]
      }
      return "lcdm".includes(value) ? ["letter", "roman"] : ["letter"]
    }
    if (/^[ivx]+$/.test(value) && isRoman(value)) return ["roman"]
    if (value.length === 2) return ["double_lower"]
    return []
  }
  if (/^[A-Z]+$/.test(value)) {
    if (value.length === 1) {
      if ("IVX".includes(value)) return ["upper_roman", "upper_letter"]
      return "LCDM".includes(value)
        ? ["upper_letter", "upper_roman"]
        : ["upper_letter"]
    }
    if (/^[IVX]+$/.test(value) && isRoman(value)) return ["upper_roman"]
    if (value.length === 2) return ["double_upper"]
    return []
  }
  return []
}

interface Placement {
  type: TokenType
  depth: number // index in the stack the new entry takes
  skipped?: boolean // continues a sequence but skips values
}

// Position of a value within its sequence (1-based), for gap checks
const ordinal = (type: TokenType, value: string) => {
  switch (type) {
    case "number":
    case "numeric":
      return Number(value)
    case "letter":
      return LOWER_LETTERS.indexOf(value) + 1
    case "upper_letter":
      return UPPER_LETTERS.indexOf(value) + 1
    case "roman":
    case "upper_roman":
      return romanToInt(value)
    default:
      return NaN
  }
}

// Subdivisions the PDF extraction may have dropped: allow skipping up to
// this many values, with a warning
const MAX_SKIPPED_VALUES = 2

const continuesWithGap = (type: TokenType, prev: string, next: string) => {
  const step = ordinal(type, next) - ordinal(type, prev)
  return step > 1 && step <= MAX_SKIPPED_VALUES + 1
}

// Where a parenthesized token fits in the current stack, or null if it
// doesn't continue any sequence or start a new level
const placeParenToken = (
  stack: StackEntry[],
  value: string,
  candidates: TokenType[]
): Placement | null => {
  const top = stack[stack.length - 1]
  // 1. Next sibling of the deepest entry
  for (const type of candidates) {
    if (top && top.type === type && isNextInSequence(type, top.value, value)) {
      return { type, depth: stack.length - 1 }
    }
  }
  // 2. Next item of an ancestor's sequence (going back up)
  for (let i = stack.length - 2; i >= 0; i--) {
    for (const type of candidates) {
      if (stack[i].type === type && isNextInSequence(type, stack[i].value, value)) {
        return { type, depth: i }
      }
    }
  }
  // 3. First item of a new, deeper level
  for (const type of candidates) {
    if (value === FIRST_VALUE[type] && !stack.some((e) => e.type === type)) {
      return { type, depth: stack.length }
    }
  }
  // 4. Same as 1 and 2, allowing a small gap
  for (let i = stack.length - 1; i >= 0; i--) {
    for (const type of candidates) {
      if (stack[i].type === type && continuesWithGap(type, stack[i].value, value)) {
        return { type, depth: i, skipped: true }
      }
    }
  }
  return null
}

const buildCitation = (stack: StackEntry[]) =>
  stack
    .map((e, i) => (i === 0 && e.type === "number" ? e.value : `(${e.value})`))
    .join("")

// ---------- Line cleanup ----------

const PAGE_SEPARATOR = /^\{(\d+)\}-{6,}\s*$/

const stripMarkdown = (line: string) =>
  line
    .replace(/<span[^>]*>\s*<\/span>/gi, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(sup|sub|span|b|i|u|em|strong|mark|small)\b[^>]*>/gi, "")
    .replace(/\*\*|__/g, "")
    .replace(/(^|[\s(])\*(\S(?:[^*]*\S)?)\*(?=$|[\s.,;:)])/g, "$1$2")
    .replace(/(^|[\s(])_(\S(?:[^_]*\S)?)_(?=$|[\s.,;:)])/g, "$1$2")
    .replace(/\\([\\`*_{}[\]()#+\-.!$|>~])/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")

// Removes heading marks, blockquotes and bullets; returns whether it was a heading
const stripStructure = (line: string) => {
  let text = line.trim()
  const isHeading = /^#{1,6}\s/.test(text)
  text = text.replace(/^#{1,6}\s+/, "")
  text = text.replace(/^>\s*/, "")
  text = text.replace(/^[-*+•]\s+/, "")
  return { text: text.trim(), isHeading }
}

// Running page headers/footers that can survive conversion
const isPageFurniture = (text: string) =>
  /^Harmonized Tariff Schedule of the United States/i.test(text) ||
  /^Annotated for Statistical Reporting Purposes/i.test(text) ||
  /^\d{2}-[IVXLC]+-\d+$/.test(text) ||
  /^XXII$/.test(text) ||
  /^!\[.*\]\(.*\)$/.test(text)

const SUBCHAPTER_HEADING = /^\[?SUBCHAPTER\s+([IVXLC]+)\b(.*)$/
const CHAPTER_HEADING = /^CHAPTER\s+99\b/

interface GroupHeading {
  slug: string
  label: string
}

const parseGroupHeading = (text: string): GroupHeading | null => {
  const cleaned = text
    .replace(/\(con\.?\)|\(continued\)/i, "")
    .replace(/[:.]\s*$/, "")
    .trim()
  if (/^Additional\s+U\.\s?S\.\s+Notes?$/i.test(cleaned)) {
    return { slug: "additional-us-notes", label: "Additional U.S. Notes" }
  }
  if (/^U\.\s?S\.\s+Notes?$/i.test(cleaned)) {
    return { slug: "us-notes", label: "U.S. Notes" }
  }
  if (/^Statistical\s+Notes?$/i.test(cleaned)) {
    return { slug: "statistical-notes", label: "Statistical Notes" }
  }
  if (/^Notes?$/i.test(cleaned)) return { slug: "notes", label: "Notes" }
  return null
}

const TARIFF_TABLE_HEADER =
  /heading\s*\/?\s*subheading|stat\.?\s*suf|article\s+description|rates\s+of\s+duty|unit\s+of\s+quantity/i

// "2. (a) The ..." -> number token
const NUMBER_TOKEN = /^(\d{1,3})\.(?=\s|\(|$)\s*/
const PAREN_TOKEN = /^\(([A-Za-z]{1,6}|\d{1,3})\)\s*:?\s*/

// A line that starts with a citation but is really a wrapped sentence:
// "(a) of this note", "(ii) above". Lowercase only: subdivisions start with
// a capital or with a term ("the rates of duty...") that isn't in this list.
const CONTINUATION_AFTER_TOKEN =
  /^(of|to|and|or|above|below|in|for|through|thereof|hereof|herein|as|is|are|shall|which|that)\b/

// ---------- Parser ----------

export const parseCh99NotesMarkdown = (markdown: string): ParsedNotes => {
  const nodes: NoteNode[] = []
  const warnings: ParseWarning[] = []
  const subchapterTitles: Record<string, string> = {}
  const keyCounts = new Map<string, number>()

  let page: number | null = null
  let subchapter: string | null = null
  let group: GroupHeading | null = null
  let stack: StackEntry[] = []
  let lastTopNumber: number | null = null
  let current: NoteNode | null = null
  let currentParts: string[] = []
  let inTariffTable = false
  let htmlTable: string[] | null = null
  let seenChapter = false

  const warn = (kind: string, message: string, key?: string) =>
    warnings.push({ kind, message, key, page })

  const groupKey = () =>
    `${subchapter ? `sub-${subchapter}` : "ch99"}/${group?.slug ?? "notes"}`

  const groupLabel = () =>
    `${subchapter ? `Subchapter ${subchapter}` : "Chapter 99"}, ${group?.label ?? "Notes"}`

  const nodeLabel = (citation: string) => {
    if (!citation) return `${groupLabel()} (introductory text)`
    const kind =
      group?.slug === "statistical-notes"
        ? "statistical note"
        : group?.slug === "us-notes"
          ? "U.S. note"
          : group?.slug === "additional-us-notes"
            ? "additional U.S. note"
            : "note"
    return `${subchapter ? `Subchapter ${subchapter}` : "Chapter 99"}, ${kind} ${citation}`
  }

  const flush = () => {
    if (current) {
      current.text = joinParts(currentParts)
      current.htsCodes = extractHtsCodes(current.text)
      nodes.push(current)
    }
    current = null
    currentParts = []
  }

  const uniqueKey = (base: string) => {
    const count = (keyCounts.get(base) ?? 0) + 1
    keyCounts.set(base, count)
    if (count === 1) return base
    warn("duplicate_citation", `Citation appears more than once; kept as "${base}#${count}"`, base)
    return `${base}#${count}`
  }

  const startNode = (citation: string, parentKey: string | null, depth: number, topNote: string | null) => {
    flush()
    const key = uniqueKey(`${groupKey()}/${citation || "_intro"}`)
    current = {
      key,
      groupKey: groupKey(),
      subchapter,
      group: group?.label ?? "Notes",
      citation,
      topNote,
      parentKey,
      depth,
      label: nodeLabel(citation),
      text: "",
      htsCodes: [],
      page,
      order: nodes.length,
    }
    return key
  }

  const resetGroup = () => {
    flush()
    stack = []
    lastTopNumber = null
  }

  const appendText = (text: string, isTable = false) => {
    if (!text) return
    if (inTariffTable) return
    if (!current) {
      if (!group) {
        // Titles and other text before any note group
        if (subchapter && !subchapterTitles[subchapter] && /[A-Z]/.test(text) && text === text.toUpperCase()) {
          subchapterTitles[subchapter] = text
        }
        return
      }
      startNode("", null, 0, null)
    }
    currentParts.push(isTable ? `\n${text}\n` : text)
  }

  // Handles the citation tokens at the start of a line; returns leftover text
  const handleTokens = (text: string): string => {
    let rest = text
    for (;;) {
      const numberMatch = rest.match(NUMBER_TOKEN)
      if (numberMatch) {
        const n = Number(numberMatch[1])
        const after = rest.slice(numberMatch[0].length)
        const fits =
          lastTopNumber === null ? true : n > lastTopNumber && n <= lastTopNumber + 5
        if (!fits) {
          warn("number_out_of_sequence", `"${n}." after note ${lastTopNumber} was kept as text`, current?.key)
          return rest
        }
        if (lastTopNumber === null && n !== 1) {
          warn("numbering_gap", `First note in ${groupLabel()} is ${n}, not 1`)
        } else if (lastTopNumber !== null && n !== lastTopNumber + 1) {
          warn("numbering_gap", `Note ${n} follows note ${lastTopNumber} in ${groupLabel()}`)
        }
        if (!group) {
          warn("note_without_group", `Note ${n} appears before any "Notes" heading; filed under Notes`)
          group = { slug: "notes", label: "Notes" }
        }
        lastTopNumber = n
        const key = startNode(String(n), null, 0, String(n))
        stack = [{ type: "number", value: String(n), key }]
        rest = after
        continue
      }

      const parenMatch = rest.match(PAREN_TOKEN)
      if (parenMatch) {
        const value = parenMatch[1]
        const candidates = classifyParenToken(value)
        if (!candidates.length) return rest
        const after = rest.slice(parenMatch[0].length)
        if (CONTINUATION_AFTER_TOKEN.test(after)) return rest
        if (!group) return rest
        const placement = placeParenToken(stack, value, candidates)
        if (!placement) {
          if (stack.length) {
            warn(
              "token_out_of_sequence",
              `"(${value})" doesn't continue the numbering under ${buildCitation(stack)}; kept as text`,
              current?.key
            )
            return rest
          }
          // Lettered items with no numbered note above them
          warn("token_out_of_sequence", `"(${value})" starts ${groupLabel()} without a numbered note`)
        }
        if (placement?.skipped) {
          warn(
            "numbering_gap",
            `"(${value})" skips values after ${buildCitation(stack.slice(0, placement.depth + 1))}; a subdivision may be missing`,
            current?.key
          )
        }
        const type = placement?.type ?? candidates[0]
        const depth = placement?.depth ?? 0
        const entry = { type, value, key: "" }
        stack = [...stack.slice(0, depth), entry]
        const citation = buildCitation(stack)
        const parentKey = depth > 0 ? stack[depth - 1].key : null
        entry.key = startNode(citation, parentKey, depth, stack[0].type === "number" ? stack[0].value : null)
        rest = after
        continue
      }
      return rest
    }
  }

  const lines = markdown.split("\n")
  for (const rawLine of lines) {
    // Page separators from datalab's paginate option
    const pageMatch = rawLine.trim().match(PAGE_SEPARATOR)
    if (pageMatch) {
      page = Number(pageMatch[1]) + 1
      continue
    }

    // HTML tables: collect the whole table, then treat it as one block
    if (htmlTable) {
      htmlTable.push(rawLine)
      if (/<\/table>/i.test(rawLine)) {
        const block = htmlTable.join("\n")
        htmlTable = null
        handleTable(htmlTableToText(block))
      }
      continue
    }
    if (/^\s*<table\b/i.test(rawLine)) {
      htmlTable = [rawLine]
      if (/<\/table>/i.test(rawLine)) {
        const block = htmlTable.join("\n")
        htmlTable = null
        handleTable(htmlTableToText(block))
      }
      continue
    }

    const cleaned = stripMarkdown(rawLine)
    const { text, isHeading } = stripStructure(cleaned)
    if (!text) continue
    if (isPageFurniture(text)) continue

    // Markdown tables
    if (text.startsWith("|")) {
      if (/^\|[\s:|-]+\|?$/.test(text)) continue // separator row
      handleTable(text)
      continue
    }

    if (CHAPTER_HEADING.test(text) && !subchapter) {
      seenChapter = true
      continue
    }

    const subMatch = text.match(SUBCHAPTER_HEADING)
    if (subMatch) {
      const numeral = subMatch[1]
      if (numeral !== subchapter) {
        resetGroup()
        subchapter = numeral
        group = null
        inTariffTable = false
        const remainder = subMatch[2].replace(/\]$/, "").trim()
        if (/deleted/i.test(remainder)) subchapterTitles[numeral] = "[Deleted]"
        else if (remainder.replace(/^[-–—:]\s*/, "")) {
          subchapterTitles[numeral] = remainder.replace(/^[-–—:]\s*/, "")
        }
      }
      continue
    }

    const groupHeading = parseGroupHeading(text)
    if (groupHeading && (isHeading || text.length < 40)) {
      inTariffTable = false
      if (group?.slug !== groupHeading.slug) {
        resetGroup()
        group = groupHeading
      }
      continue
    }

    if (inTariffTable) continue

    const rest = handleTokens(text)
    appendText(rest.trim())
  }
  flush()

  function handleTable(tableText: string) {
    if (TARIFF_TABLE_HEADER.test(tableText)) {
      // The tariff table starts; notes for this subchapter are over
      flush()
      inTariffTable = true
      return
    }
    if (inTariffTable) return
    if (!group) return
    appendText(tableText, true)
  }

  if (!seenChapter && !nodes.some((n) => n.subchapter)) {
    warnings.push({
      kind: "no_structure",
      message: "No chapter or subchapter headings were found. Is this the Chapter 99 PDF?",
      page: null,
    })
  }

  // Notes whose own text mentions tariff table content may have swallowed it
  for (const node of nodes) {
    if (/^\s*99\d{2}\.\d{2}\.\d{2}\s+\S/.test(node.text) && node.text.length > 2000) {
      warnings.push({
        kind: "possible_table_text",
        message: "Long text starting with a 99xx heading number; the tariff table may have been read as note text",
        key: node.key,
        page: node.page,
      })
    }
    if (!node.text && !nodes.some((n) => n.parentKey === node.key)) {
      warnings.push({
        kind: "empty_node",
        message: "Subdivision has no text and no children",
        key: node.key,
        page: node.page,
      })
    }
  }

  return { parserVersion: PARSER_VERSION, nodes, subchapterTitles, warnings }
}

const joinParts = (parts: string[]) =>
  parts
    .join(" ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    // Words hyphenated across lines: "sub- chapter" -> "subchapter"
    .replace(/([a-z])- ([a-z])/g, "$1$2")
    .trim()

const htmlTableToText = (html: string) =>
  html
    .replace(/<\/t[dh]>\s*<t[dh][^>]*>/gi, " | ")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `| ${l} |`)
    .join("\n")

// ---------- Helpers for consumers ----------

export const childrenByParent = (nodes: NoteNode[]) => {
  const map = new Map<string | null, NoteNode[]>()
  for (const node of nodes) {
    const list = map.get(node.parentKey) ?? []
    list.push(node)
    map.set(node.parentKey, list)
  }
  return map
}

// A node and everything under it, as indented text
export const renderSubtree = (
  root: NoteNode,
  children: Map<string | null, NoteNode[]>
): string => {
  const lines: string[] = []
  const visit = (node: NoteNode, indent: number) => {
    const marker = node.citation ? node.citation.replace(/^.*?(\([^)]+\)|\d+)$/, "$1") : ""
    const prefix = "  ".repeat(indent) + (marker ? `${/^\d+$/.test(marker) ? `${marker}.` : marker} ` : "")
    lines.push(prefix + node.text)
    for (const child of children.get(node.key) ?? []) visit(child, indent + 1)
  }
  visit(root, 0)
  return lines.join("\n")
}

// Every node rendered as markdown, grouped by subchapter and note group
export const renderNotesMarkdown = (parsed: ParsedNotes, revisionName: string) => {
  const children = childrenByParent(parsed.nodes)
  const out: string[] = [`# Chapter 99 notes: ${revisionName}`, ""]
  let lastGroup = ""
  for (const node of parsed.nodes) {
    if (node.parentKey) continue
    if (node.groupKey !== lastGroup) {
      lastGroup = node.groupKey
      const title = node.subchapter ? parsed.subchapterTitles[node.subchapter] : null
      out.push("", `## ${node.label.split(",")[0]}${title ? `: ${title}` : ""} (${node.group})`, "")
    }
    out.push(`<!-- ${node.key}${node.page ? ` · page ${node.page}` : ""} -->`)
    out.push(renderSubtree(node, children), "")
  }
  return out.join("\n")
}

export const groupSlugForNoteType = (noteType: string | null) => {
  switch (noteType) {
    case "us_note":
      return "us-notes"
    case "statistical_note":
      return "statistical-notes"
    case "chapter_note":
      return "notes"
    default:
      return null
  }
}

export { slugify }
