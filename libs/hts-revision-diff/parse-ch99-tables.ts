// Reads Chapter 99 heading rows from the markdown datalab produces for a
// revision's tariff-table pages (trimmed from its Chapter 99 PDF). Columns:
// Heading/Subheading | Stat. Suffix | Article Description | Unit of Quantity |
// Rates of Duty: 1 General | Special | 2
//
// Table conversion loses the description indentation and can split or merge
// cells, so every result goes through a Claude check against the PDF pages
// and the reviewer's sign-off before it's used.

import { htmlTableToText } from "./parse-ch99-notes"
import { normalizeForCompare } from "./text"
import type { HeadingFields, ParseWarning } from "./types"

type Column = "heading" | "stat" | "description" | "units" | "general" | "special" | "other"

const PAGE_SEPARATOR = /^\{(\d+)\}-{6,}\s*$/
const HEADING_CODE = /\b(\d{4}\.\d{2}(?:\.\d{2})?)\b/
const FOOTNOTE_LINE = /^(?:<sup>)?(\d{1,2})\/(?:<\/sup>)?\s+(.+)$/

const clean = (text: string) =>
  normalizeForCompare(
    text
      .replace(/\.{4,}|(?:\.\s){3,}\.?/g, " ") // dot leaders
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/\[(\d{1,2}\/)\]\([^)]*\)/g, "$1") // footnote markers as links: [1/](#)
      .replace(/<\/?[a-z][^>]*>/gi, "")
      .replace(/\*\*|__/g, "")
      .replace(/\\([\\`*_{}[\]()#+\-.!$|>~])/g, "$1")
  )

const splitRow = (line: string) => {
  const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|")
  return cells.map((c) => clean(c))
}

const isSeparatorRow = (line: string) => /^\|?[\s:|-]+\|?$/.test(line.trim())

const looksLikeHeader = (cells: string[]) =>
  cells.some((c) => /article\s+description|heading\s*\/?\s*sub|stat\.?\s*suf|rates\s+of\s+duty|unit\s+of\s+quantity/i.test(c)) ||
  (cells.some((c) => /^general$|^1\s*general$/i.test(c)) && cells.some((c) => /^special$/i.test(c)))

// Column positions from header cells (possibly two header rows merged)
const columnsFromHeader = (header: string[]): Partial<Record<Column, number>> => {
  const map: Partial<Record<Column, number>> = {}
  header.forEach((cell, i) => {
    const c = cell.toLowerCase()
    if (map.heading === undefined && /heading|subheading/.test(c)) map.heading = i
    else if (map.stat === undefined && /stat/.test(c)) map.stat = i
    else if (map.description === undefined && /description/.test(c)) map.description = i
    else if (map.units === undefined && /unit|quantity/.test(c)) map.units = i
    else if (map.general === undefined && /general|^1$/.test(c)) map.general = i
    else if (map.special === undefined && /special/.test(c)) map.special = i
    else if (map.other === undefined && (/^2$|column\s*2/.test(c) || (map.special !== undefined && i > map.special))) map.other = i
  })
  return map
}

// Without a usable header, assume the standard order by cell count
const defaultColumns = (count: number): Partial<Record<Column, number>> => {
  if (count >= 7) return { heading: 0, stat: 1, description: 2, units: 3, general: 4, special: 5, other: 6 }
  if (count === 6) return { heading: 0, stat: 1, description: 2, general: 3, special: 4, other: 5 }
  if (count === 5) return { heading: 0, description: 1, general: 2, special: 3, other: 4 }
  return { heading: 0, description: 1 }
}

// Footnote markers at the end of a cell ("… subchapter 1/", "<sup>1/</sup>", "1/ 2/"),
// removed from the text
const TRAILING_MARKER = /(?:^|\s+)(?:<sup>)?(\d{1,2})\/(?:<\/sup>)?\s*$/
export const takeTrailingMarkers = (cell: string) => {
  const markers: string[] = []
  let text = cell
  for (let m = text.match(TRAILING_MARKER); m; m = text.match(TRAILING_MARKER)) {
    markers.unshift(m[1])
    text = text.slice(0, m.index).trimEnd()
  }
  return { text, markers }
}

export interface ParsedHeadings {
  rows: (HeadingFields & { sort_order: number })[]
  warnings: ParseWarning[]
}

export const parseCh99HeadingTables = (markdown: string): ParsedHeadings => {
  const rows: ParsedHeadings["rows"] = []
  const warnings: ParseWarning[] = []
  // Footnote readings per page: marker → texts. Markers are numbered per page ("2/" can
  // mean different things on different pages), and a page can have stray "1/ …" lines
  // (a rate cell the conversion split off), so a row takes the reading on its own page
  // that's most common across the document.
  const footnoteReadings: { page: number | null; marker: string; text: string }[] = []
  let page: number | null = null
  let columns: Partial<Record<Column, number>> | null = null
  let header: string[] | null = null
  let tablesSeen = 0

  // Normalize: HTML tables become pipe rows, one line each
  const lines: string[] = []
  let html: string[] | null = null
  for (const raw of markdown.split("\n")) {
    if (html) {
      html.push(raw)
      if (/<\/table>/i.test(raw)) {
        lines.push(...htmlTableToText(html.join("\n")).split("\n"))
        html = null
      }
      continue
    }
    if (/^\s*<table\b/i.test(raw)) {
      html = [raw]
      if (/<\/table>/i.test(raw)) {
        lines.push(...htmlTableToText(raw).split("\n"))
        html = null
      }
      continue
    }
    lines.push(raw)
  }

  let inTable = false
  for (const line of lines) {
    const trimmed = line.trim()
    const pageMatch = trimmed.match(PAGE_SEPARATOR)
    if (pageMatch) {
      page = Number(pageMatch[1]) + 1
      continue
    }
    if (!trimmed.startsWith("|")) {
      if (inTable) {
        inTable = false
        header = null
      }
      // Footnotes printed below the table: "1/ See subchapter III statistical note 1."
      const fn = clean(trimmed.replace(/^[-*]\s+/, "")).match(FOOTNOTE_LINE)
      if (fn) {
        const text = fn[2].replace(/\s*\**\s*Note:\s*The shaded areas indicate the provision has expired\.?\**\s*$/i, "").trim()
        if (text) footnoteReadings.push({ page, marker: fn[1], text })
      }
      continue
    }
    if (isSeparatorRow(trimmed)) continue
    const cells = splitRow(trimmed)
    if (!inTable) {
      inTable = true
      tablesSeen++
    }

    // Header rows (a table may repeat them on every page, sometimes in two rows)
    if (looksLikeHeader(cells)) {
      header = header ? header.map((h, i) => `${h} ${cells[i] ?? ""}`.trim()) : cells
      const fromHeader = columnsFromHeader(header)
      if (fromHeader.heading !== undefined && fromHeader.description !== undefined) columns = fromHeader
      continue
    }

    const cols = columns ?? defaultColumns(cells.length)
    const cell = (c: Column) => (cols[c] !== undefined ? (cells[cols[c]!] ?? "") : "")
    const headingCell = cell("heading")
    const code = headingCell.match(HEADING_CODE)?.[1] ?? ""
    const description = cell("description") || (code ? "" : cells.filter(Boolean).join(" "))
    if (!code && !description) continue

    // A row with no code and only a description right after a coded row with
    // an empty description is a wrapped cell, not a new row
    const previous = rows[rows.length - 1]
    if (!code && previous && previous.htsno && !previous.description && !cell("general")) {
      previous.description = description
      continue
    }

    rows.push({
      sort_order: rows.length,
      htsno: code,
      stat_suffix: (cell("stat").match(/\b\d{2}\b/) ?? [""])[0],
      indent: 0, // not recoverable from the converted table; set by the Claude check, if it's run
      description,
      general: cell("general"),
      special: cell("special"),
      other: cell("other"),
      units: cell("units"),
      footnotes: [],
      page,
    })
  }

  const frequency = new Map<string, number>()
  for (const r of footnoteReadings) frequency.set(`${r.marker}|${r.text}`, (frequency.get(`${r.marker}|${r.text}`) ?? 0) + 1)
  const mostCommon = (readings: typeof footnoteReadings) =>
    readings.sort((a, b) => (frequency.get(`${b.marker}|${b.text}`) ?? 0) - (frequency.get(`${a.marker}|${a.text}`) ?? 0))[0]?.text
  // The reading on the row's page; failing that, the next page that has one (a table can
  // continue onto a page before its footnotes); failing that, the marker's text only if
  // it reads the same everywhere (a marker that means different things on different
  // pages is left off rather than guessed)
  const footnoteFor = (rowPage: number | null, marker: string) => {
    const ofMarker = footnoteReadings.filter((r) => r.marker === marker)
    const onPage = ofMarker.filter((r) => r.page === rowPage)
    if (onPage.length) return mostCommon(onPage)
    const later = ofMarker.filter((r) => rowPage !== null && r.page !== null && r.page > rowPage)
    const nextPage = later.length ? Math.min(...later.map((r) => r.page!)) : null
    if (nextPage !== null) return mostCommon(later.filter((r) => r.page === nextPage))
    return new Set(ofMarker.map((r) => r.text)).size === 1 ? ofMarker[0].text : undefined
  }

  // Attach footnotes by their markers ("1/") in any cell. The conversion often leaves the
  // marker printed after the dot leaders at the end of the description, or puts it in the
  // units column: it's moved out of those cells into the footnotes.
  for (const row of rows) {
    const description = takeTrailingMarkers(row.description)
    const units = takeTrailingMarkers(row.units)
    row.description = description.text.replace(/\s*\.{2,}$/, "") // what's left of the dot leaders
    row.units = units.text
    const text = [row.general, row.special, row.other].join(" ")
    const inRates = Array.from(text.matchAll(/(?:^|\s|\D)(\d{1,2})\//g)).map((m) => m[1])
    const markers = Array.from(new Set([...description.markers, ...units.markers, ...inRates]))
    row.footnotes = markers.flatMap((m) => {
      const text = footnoteFor(row.page, m)
      return text ? [`${m}/ ${text}`] : []
    })
  }

  if (!tablesSeen) {
    warnings.push({ kind: "no_tables", message: "No tables were found in the converted heading pages", page: null })
  } else if (!rows.some((r) => r.htsno)) {
    warnings.push({ kind: "no_headings", message: "Tables were found, but no rows with a heading number", page: null })
  }
  if (!columns && tablesSeen) {
    warnings.push({
      kind: "no_header",
      message: "No table header was recognized; columns were assumed to be in the standard order",
      page: null,
    })
  }
  return { rows, warnings }
}
