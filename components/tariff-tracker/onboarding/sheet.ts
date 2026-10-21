import { htsCodeDigitsOnly } from "../../../libs/hts-code";
import { Columns, ParsedImport } from "../csv";
import { CatalogEntry, CatalogError, findCountry, readProduct } from "../parse";

// An uploaded sheet as the review grid sees it (SheetReview): every row of the file with how it
// reads, after the user's edits. Only the code and country columns are read; rows that are plainly
// not imports (title rows, the header, a header repeated on a later page, totals, notes) are set
// aside on their own, never shown as errors, and can be brought back in.

export type RowKind =
  // Above the header: a title, a date, a note
  | "above"
  | "header"
  | "blank"
  // Not an import, by the look of it (a repeated header, a total, a note)
  | "ignored"
  // Left out by the user
  | "skipped"
  | "ok"
  | "error";

export interface SheetRow<T> {
  // 0-based in the file; the user sees index + 1
  index: number;
  kind: RowKind;
  // ignored: why; error: what's wrong
  reason?: string;
  entry?: CatalogEntry<T>;
  code: string;
  country: string;
}

export interface SheetEdits {
  // `${row}:${column}` → the cell's new text
  cells: Record<string, string>;
  skipped: number[];
  // Rows set aside as not imports that the user says are
  included: number[];
}

export const NO_EDITS: SheetEdits = { cells: {}, skipped: [], included: [] };

export const cellAt = (rows: string[][], edits: SheetEdits, row: number, column: number | undefined) =>
  column === undefined ? "" : (edits.cells[`${row}:${column}`] ?? rows[row]?.[column] ?? "");

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

// Why a row isn't an import, or null when it may be one: no digits where the code goes (a repeated
// header, "Total", a note) and no country where the country goes. A row with a country, or with
// digits in the code column, is someone's import, wrong or not, so it's read (and maybe shown as an
// error to fix).
export const notAnImport = (code: string, country: string, header: string[] | null, row: string[]): string | null => {
  if (htsCodeDigitsOnly(code).length >= 4 || findCountry(country)) return null;
  if (header && row.length && row.every((cell, i) => normalize(cell) === normalize(header[i] ?? ""))) return "A repeat of the header row";
  if (/\b(sub)?totals?\b|\bgrand total\b/i.test(row.join(" "))) return "Looks like a totals row";
  if (!code.trim() && !country.trim()) return "No HTS code or country";
  return "Looks like a header or a note, not an import";
};

export const readSheet = <T>(
  rows: string[][],
  headerIndex: number,
  columns: Columns,
  edits: SheetEdits,
  findElement: (digits: string) => T | undefined
): SheetRow<T>[] => {
  const header = headerIndex >= 0 ? rows[headerIndex] : null;
  const skipped = new Set(edits.skipped);
  const included = new Set(edits.included);
  return rows.map((raw, index) => {
    const code = cellAt(rows, edits, index, columns.code);
    const country = cellAt(rows, edits, index, columns.country);
    const base = { index, code, country };
    if (index !== headerIndex && raw.every((c) => !c?.trim()) && !code.trim() && !country.trim()) return { ...base, kind: "blank" };
    // Removed by the user, whatever it was
    if (index !== headerIndex && skipped.has(index)) return { ...base, kind: "skipped" };
    if (index < headerIndex) return { ...base, kind: "above" };
    if (index === headerIndex) return { ...base, kind: "header" };
    const aside = included.has(index) ? null : notAnImport(code, country, header, raw);
    if (aside) return { ...base, kind: "ignored", reason: aside };
    const product = readProduct(code, country, findElement);
    // (In a sheet the country has its own column: no "after the code")
    if ("message" in product) return { ...base, kind: "error", reason: product.message.replace(" after the code", "") };
    return { ...base, kind: "ok", entry: { line: index + 1, text: raw.filter(Boolean).join(", "), ...product } };
  });
};

// The sheet's imports and problems, as the review panel counts them
export const sheetParsed = <T>(sheet: SheetRow<T>[]): ParsedImport<T> => ({
  entries: sheet.filter((r) => r.kind === "ok").map((r) => r.entry!),
  errors: sheet
    .filter((r) => r.kind === "error")
    .map((r): CatalogError => ({ line: r.index + 1, text: [r.code, r.country].filter(Boolean).join(", "), message: r.reason!, code: r.code, country: r.country })),
});

export const countKinds = <T>(sheet: SheetRow<T>[]) => {
  const counts: Record<RowKind, number> = { above: 0, header: 0, blank: 0, ignored: 0, skipped: 0, ok: 0, error: 0 };
  sheet.forEach((r) => counts[r.kind]++);
  return counts;
};
