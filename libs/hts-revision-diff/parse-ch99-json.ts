// Parses the USITC HTS JSON export (an array of rows like
// { htsno, indent, description, general, special, other, units, footnotes })
// into rows keyed for diffing.

import type { HtsRow, ParseWarning } from "./types"
import { normalizeForCompare, slugify } from "./text"

interface UsitcRow {
  htsno?: string | null
  indent?: string | number | null
  description?: string | null
  general?: string | null
  special?: string | null
  other?: string | null
  units?: unknown
  footnotes?: unknown
}

const asText = (value: unknown) =>
  typeof value === "string" ? normalizeForCompare(value) : ""

const footnoteText = (footnotes: unknown): string[] => {
  if (!Array.isArray(footnotes)) return []
  return footnotes
    .map((f) => {
      if (typeof f === "string") return normalizeForCompare(f)
      if (f && typeof f === "object") {
        const { marker, value, columns } = f as {
          marker?: string
          value?: string
          columns?: string[]
        }
        const cols = Array.isArray(columns) && columns.length ? ` [${columns.join(", ")}]` : ""
        return normalizeForCompare(`${marker ? `${marker}/ ` : ""}${value ?? ""}${cols}`)
      }
      return ""
    })
    .filter(Boolean)
}

const unitsText = (units: unknown): string[] =>
  Array.isArray(units) ? units.map((u) => (typeof u === "string" ? u.trim() : "")).filter(Boolean) : []

// Validates the file shape; throws a readable error if it isn't an HTS export
export const assertHtsJson = (data: unknown): UsitcRow[] => {
  if (!Array.isArray(data)) {
    throw new Error("Chapter 99 JSON must be an array of HTS rows (the USITC JSON export)")
  }
  if (!data.length) throw new Error("Chapter 99 JSON is empty")
  const sample = data.slice(0, 50)
  const looksRight = sample.every(
    (row) => row && typeof row === "object" && "description" in row && "htsno" in row
  )
  if (!looksRight) {
    throw new Error('Chapter 99 JSON rows need "htsno" and "description" fields (the USITC JSON export)')
  }
  return data as UsitcRow[]
}

export const parseCh99Json = (data: unknown) => {
  const rows = assertHtsJson(data)
  const warnings: ParseWarning[] = []
  const parsed: HtsRow[] = []
  const seen = new Map<string, number>()
  let lastHtsno: string | null = null

  rows.forEach((row, order) => {
    const htsno = (row.htsno ?? "").trim()
    const description = asText(row.description)
    // Rows without an htsno (superior text lines) are keyed by the code above
    // them plus their description, so they line up across revisions
    const baseKey = htsno || `${lastHtsno ?? "start"}~${slugify(description).slice(0, 80) || "blank"}`
    const count = (seen.get(baseKey) ?? 0) + 1
    seen.set(baseKey, count)
    const key = count === 1 ? baseKey : `${baseKey}#${count}`
    if (htsno && count > 1) {
      warnings.push({ kind: "duplicate_htsno", message: `${htsno} appears ${count} times`, key })
    }

    parsed.push({
      key,
      htsno,
      indent: Number(row.indent ?? 0) || 0,
      description,
      general: asText(row.general),
      special: asText(row.special),
      other: asText(row.other),
      units: unitsText(row.units),
      footnotes: footnoteText(row.footnotes),
      parentHtsno: htsno ? null : lastHtsno,
      order,
    })
    if (htsno) lastHtsno = htsno
  })

  const outsideCh99 = parsed.filter((r) => r.htsno && !r.htsno.startsWith("99")).length
  if (outsideCh99) {
    warnings.push({
      kind: "outside_ch99",
      message: `${outsideCh99} rows have codes outside chapter 99. Expected a Chapter 99 export.`,
    })
  }

  return { rows: parsed, warnings }
}
