// Parses the markdown datalab produces from the Chapter 99 PDF into a tree of
// note subdivisions, so each piece of a note can be addressed by its citation
// ("Subchapter III, U.S. note 2(v)(xi)(B)") and diffed on its own.
//
// Hierarchy comes from the numbering alone (datalab flattens indentation).
// It follows hts-data-processing's parse-hts-markdown.ts (same type =
// sibling, an ancestor's later value = back up, a first value = new child),
// adjusted for how Chapter 99 is actually written:
// - Deleted subdivisions and notes leave gaps ("(c)" then "(j)", note 7 then
//   note 13), so any forward step continues a sequence.
// - "(i)", "(v)" and "(x)" can be letters or roman numerals. The tokens that
//   follow decide: "(ii)" next means roman, "(j)" next means a letter.
// - Numbered lists inside a note ("1. Other seats…", "2. …") restart at 1 and
//   are kept inside the note as list items ("20(b)[3]"), not read as notes.
// - "[U.S. note 8 deleted]" lines count as notes 8, so numbering continues.
// - Tokens that fit nowhere are kept as text and reported as warnings, as is
//   a wrapped sentence starting "(a) of this note".
// - "U.S. Notes (con.)" headings don't reset the tree, the tariff table that
//   follows a subchapter's notes is skipped, and PDF pages are tracked from
//   datalab's paginated output.

import { PARSER_VERSION } from "./constants"
import type { NoteNode, ParsedNotes, ParseWarning } from "./types"
import { extractHtsCodes, isRoman, romanToInt, slugify } from "./text"

type TokenType =
  | "number"
  | "list_item"
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
  list_item: "1",
  letter: "a",
  roman: "i",
  numeric: "1",
  upper_letter: "A",
  upper_roman: "I",
  double_lower: "aa",
  double_upper: "AA",
}

const LOWER_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("")
const UPPER_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

// "(ij)" is an older way of writing the letter i
const letterIndex = (value: string) => LOWER_LETTERS.indexOf(value === "ij" ? "i" : value)

// The same letter repeated: "aa", "bbb"
const isLetterRun = (value: string) => /^([a-zA-Z])\1{0,2}$/.test(value)

// Letters continue past z as aa, bb, … zz, then aaa, bbb, …
const letterOrdinal = (value: string, alphabet: string[]) => {
  if (value === "ij") return letterIndex("i") + 1
  if (!isLetterRun(value)) return NaN
  const index = alphabet.indexOf(value[0])
  return index < 0 ? NaN : (value.length - 1) * 26 + index + 1
}

// Position of a value within its sequence (1-based)
const ordinal = (type: TokenType, value: string) => {
  switch (type) {
    case "number":
    case "list_item":
    case "numeric":
      return Number(value)
    case "letter":
      return letterOrdinal(value, LOWER_LETTERS)
    case "upper_letter":
      return letterOrdinal(value, UPPER_LETTERS)
    case "roman":
    case "upper_roman":
      return romanToInt(value)
    case "double_lower":
    case "double_upper": {
      // A deeper level lettered aa, bb, cc… (or aa, ab, ac…)
      const v = value.toLowerCase()
      if (v.length !== 2) return NaN
      if (v[0] === v[1]) return v.charCodeAt(0) - 96
      return 26 + (v.charCodeAt(0) - 97) * 26 + (v.charCodeAt(1) - 96)
    }
  }
}

// Possible readings of a parenthesized token, most likely first
const classifyParenToken = (value: string): TokenType[] => {
  if (/^\d{1,3}$/.test(value)) return ["numeric"]
  const lower = /^[a-z]+$/.test(value)
  if (!lower && !/^[A-Z]+$/.test(value)) return []
  const [letter, roman, double]: TokenType[] = lower
    ? ["letter", "roman", "double_lower"]
    : ["upper_letter", "upper_roman", "double_upper"]
  const romanLike = /^[ivx]+$/i.test(value) && isRoman(value)
  if (value === "ij") return [letter]
  if (value.length === 1) {
    if (romanLike) return [roman, letter]
    return /^[lcdm]$/i.test(value) ? [letter, roman] : [letter]
  }
  if (isLetterRun(value)) {
    // "aa" continues the alphabet after "z", or starts a deeper level;
    // "ii", "xx", "iii" may also be roman numerals
    const readings: TokenType[] = value.length === 2 ? [letter, double] : [letter]
    return romanLike ? [roman, ...readings] : readings
  }
  if (romanLike) return [roman]
  if (value.length === 2) return [double]
  return []
}

// For "(i)", "(v)", "(x)" (and upper case): reads the tokens that follow to
// decide between letter and roman numeral. Returns the candidates reordered.
const resolveAmbiguity = (value: string, candidates: TokenType[], upcoming: string[]): TokenType[] => {
  const romanType = candidates.find((t) => t === "roman" || t === "upper_roman")
  const letterType = candidates.find((t) => t === "letter" || t === "upper_letter")
  if (!romanType || !letterType) return candidates
  const others = candidates.filter((t) => t !== romanType && t !== letterType)
  const upper = value === value.toUpperCase()
  for (const next of upcoming) {
    if ((next === next.toUpperCase()) !== upper || /^\d+$/.test(next)) continue // other levels
    // The same value again right away: a roman list starting under this letter
    if (next === value) return [letterType, ...others, romanType]
    if (isRoman(next) && romanToInt(next) === romanToInt(value) + 1) return [romanType, letterType, ...others]
    if (isLetterRun(next) && ordinal(letterType, next) > ordinal(letterType, value)) {
      return [letterType, ...others, romanType]
    }
  }
  return candidates
}

interface Placement {
  type: TokenType
  depth: number // index in the stack the new entry takes
  unexpectedStart?: boolean // a new level that doesn't start at its first value
}

// Where a parenthesized token fits in the current stack, or null if nowhere
const placeParenToken = (stack: StackEntry[], value: string, candidates: TokenType[]): Placement | null => {
  const top = stack[stack.length - 1]
  const step = (entry: StackEntry, type: TokenType) =>
    entry.type === type ? ordinal(type, value) - ordinal(type, entry.value) : NaN
  // 1. The next item of a sequence in the stack (deepest first)
  for (const type of candidates) {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (step(stack[i], type) === 1) return { type, depth: i }
    }
  }
  // 2. First item of a new, deeper level. The same kind of numbering can nest
  //    again further down ("2(v)(iii)(a)", "2(z)(xiv)(aa)(i)").
  for (const type of candidates) {
    if (value === FIRST_VALUE[type] && !(top && top.type === type)) {
      return { type, depth: stack.length }
    }
  }
  // 3. A later item of a sequence in the stack, after deleted ones. When the
  //    same kind of numbering appears at several depths, the closest value
  //    wins: "(x)" after "(v)…(b)" continues "(v)", not "(b)".
  let best: (Placement & { gap: number }) | null = null
  for (const type of candidates) {
    for (let i = stack.length - 1; i >= 0; i--) {
      const gap = step(stack[i], type)
      if (gap > 1 && (!best || gap < best.gap)) best = { type, depth: i, gap }
    }
  }
  if (best) return { type: best.type, depth: best.depth }
  // 4. A new level whose first items were deleted ("(b)" with no "(a)")
  for (const type of candidates) {
    if (!stack.some((e) => e.type === type)) {
      return { type, depth: stack.length, unexpectedStart: true }
    }
  }
  return null
}

const buildCitation = (stack: StackEntry[]) =>
  stack
    .map((e, i) =>
      i === 0 && e.type === "number" ? e.value : e.type === "list_item" ? `[${e.value}]` : `(${e.value})`
    )
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
  /^\d{2}\s*-\s*[IVXLC]+\s*-\s*\d+$/.test(text) || // "99 - III - 2"
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

const DELETED_NOTES =
  /^\[(?:U\.\s?S\.\s+)?notes?\s+(\d{1,3})(?:\s*(?:through|to|and|-|–)\s*(\d{1,3}))?\s+(?:(?:is|are|was|were|have been|has been)\s+)?deleted\.?\]$/i

// How many following tokens to read when deciding "(i)" letter vs roman
const LOOKAHEAD_TOKENS = 12

// Values of the parenthesized tokens at the start of a line: "(v) (i) Except" -> ["v", "i"]
const leadingParenTokens = (text: string) => {
  const values: string[] = []
  let rest = text.replace(NUMBER_TOKEN, "")
  for (let m = rest.match(PAREN_TOKEN); m; m = rest.match(PAREN_TOKEN)) {
    values.push(m[1])
    rest = rest.slice(m[0].length)
  }
  return values
}

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

  // Handles the citation tokens at the start of a line; returns leftover
  // text. `upcoming` lists the parenthesized tokens on the lines that follow.
  const handleTokens = (text: string, upcomingAfterLine: string[]): string => {
    let rest = text
    for (;;) {
      const numberMatch = rest.match(NUMBER_TOKEN)
      if (numberMatch) {
        const n = Number(numberMatch[1])
        const after = rest.slice(numberMatch[0].length)
        if (!group) {
          warn("note_without_group", `Note ${n} appears before any "Notes" heading; filed under Notes`)
          group = { slug: "notes", label: "Notes" }
        }
        // A numbered list inside a note continues before anything else
        const listDepth = stack.map((e) => e.type).lastIndexOf("list_item")
        if (listDepth >= 0 && n === Number(stack[listDepth].value) + 1) {
          pushEntry("list_item", String(n), listDepth)
        } else if (lastTopNumber === null || n > lastTopNumber) {
          if (lastTopNumber === null && n !== 1) {
            warn("numbering_gap", `First note in ${groupLabel()} is ${n}, not 1`)
          }
          lastTopNumber = n
          pushEntry("number", String(n), 0)
        } else if (n === 1 && stack.length) {
          // "1." inside a note starts a numbered list
          pushEntry("list_item", "1", stack.length)
        } else {
          warn("number_out_of_sequence", `"${n}." after note ${lastTopNumber} was kept as text`, current?.key)
          return rest
        }
        rest = after
        continue
      }

      const parenMatch = rest.match(PAREN_TOKEN)
      if (parenMatch) {
        const value = parenMatch[1]
        let candidates = classifyParenToken(value)
        if (!candidates.length) return rest
        const after = rest.slice(parenMatch[0].length)
        if (CONTINUATION_AFTER_TOKEN.test(after)) return rest
        if (!group) return rest
        candidates = resolveAmbiguity(value, candidates, [...leadingParenTokens(after), ...upcomingAfterLine])
        const placement = placeParenToken(stack, value, candidates)
        if (!placement) {
          warn(
            "token_out_of_sequence",
            `"(${value})" doesn't fit under ${buildCitation(stack) || groupLabel()}; kept as text`,
            current?.key
          )
          return rest
        }
        if (placement.unexpectedStart) {
          warn(
            "unexpected_start",
            `"(${value})" starts a new level under ${buildCitation(stack) || groupLabel()} without "(${FIRST_VALUE[placement.type]})"`,
            current?.key
          )
        }
        pushEntry(placement.type, value, placement.depth)
        rest = after
        continue
      }
      return rest
    }
  }

  // Puts a new entry at `depth` in the stack and starts its node
  const pushEntry = (type: TokenType, value: string, depth: number) => {
    const entry: StackEntry = { type, value, key: "" }
    stack = [...stack.slice(0, depth), entry]
    const citation = buildCitation(stack)
    const parentKey = depth > 0 ? stack[depth - 1].key : null
    entry.key = startNode(citation, parentKey, depth, stack[0].type === "number" ? stack[0].value : null)
  }

  // "[U.S. note 8 deleted]", "[U.S. notes 8 through 12 deleted]"
  const handleDeletedNotes = (text: string) => {
    const m = text.match(DELETED_NOTES)
    if (!m || !group) return false
    const from = Number(m[1])
    const to = m[2] ? Number(m[2]) : from
    if (lastTopNumber !== null && from <= lastTopNumber) return false
    for (let n = from; n <= Math.min(to, from + 50); n++) {
      lastTopNumber = n
      pushEntry("number", String(n), 0)
      currentParts.push("[Deleted]")
    }
    return true
  }

  const lines = markdown.split("\n")
  const cleanedLines = lines.map((l) => stripStructure(stripMarkdown(l)))
  const lineTokens = cleanedLines.map((l) => leadingParenTokens(l.text))
  const upcomingFrom = (index: number) => {
    const out: string[] = []
    for (let j = index + 1; j < lines.length && out.length < LOOKAHEAD_TOKENS; j++) out.push(...lineTokens[j])
    return out
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex]
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

    const { text, isHeading } = cleanedLines[lineIndex]
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

    if (handleDeletedNotes(text)) continue
    const rest = handleTokens(text, upcomingFrom(lineIndex))
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
