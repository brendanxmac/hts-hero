import { htsCodeDigitsOnly } from "../../libs/hts-code";
import { Columns, findColumns, tableFromText } from "./csv";
import { findCountry } from "./parse";

// Reads an uploaded list of imports, CSV or Excel, as rows of text, and finds which columns hold
// the HTS code and the country of origin: by header name when it has one we know (csv.ts), else by
// what the cells look like. Real-world lists are invoices, product masters and broker exports, with
// their own headers, extra columns and title rows, so the user can always pick the columns
// themselves (ColumnPicker).

export interface SheetTable {
  // The sheet's name (Excel), or the file's (CSV)
  name: string;
  rows: string[][];
}

export interface DetectedColumns {
  // The header row (0-based), or -1 when the data starts at the top
  headerIndex: number;
  columns: Columns;
}

// A cell as text. Excel keeps codes typed as numbers without their leading zero (0102.21.0010 is
// 102210010) and dates as Dates; a 7- or 9-digit whole number gets its zero back.
export const cellText = (cell: unknown): string => {
  if (cell === null || cell === undefined) return "";
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  if (typeof cell === "number") {
    const text = String(cell);
    return /^\d{7}$|^\d{9}$/.test(text) ? `0${text}` : text;
  }
  return String(cell).trim();
};

// Code-like enough to be the code column: 6 to 10 digits (a 6-digit HS code is still the code
// column, with rows to fix)
const codeish = (text: string) => /^[\d.\s-]+$/.test(text) && htsCodeDigitsOnly(text).length >= 6 && htsCodeDigitsOnly(text).length <= 10;
const looksLikeCountry = (text: string) => text.length >= 2 && findCountry(text) !== null;

const SAMPLE = 300;

// The header row for a code column: the last filled row above its first code (-1: none)
// The header row for a code column: the last filled row above the first row that holds a code (or
// something like one: a 6-digit HS code or a dropped zero is still data to fix, not a header). -1:
// the data starts at the top.
export const headerAbove = (rows: string[][], code: number) => {
  const first = rows.findIndex((r) => codeish(r[code] ?? ""));
  const above = first > 0 ? rows.slice(0, first).map((r) => r.some(Boolean)) : [];
  return above.lastIndexOf(true);
};

// The columns, from a known header in the first rows, else from the cells: the column where most
// filled cells are HTS codes, and the one where most are countries. Null when neither works.
export const detectColumns = (rows: string[][]): DetectedColumns | null => {
  // A header we know, in the first 10 rows (title rows above it are common)
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const columns = findColumns(rows[i]);
    if (columns.code !== undefined && columns.country !== undefined) return { headerIndex: i, columns };
  }
  const sample = rows.slice(0, SAMPLE);
  const width = Math.max(0, ...sample.map((r) => r.length));
  const score = (test: (t: string) => boolean) =>
    Array.from({ length: width }, (_, col) => {
      const filled = sample.map((r) => r[col] ?? "").filter(Boolean);
      return filled.length ? filled.filter(test).length / filled.length : 0;
    });
  const codes = score(codeish);
  const countries = score(looksLikeCountry);
  // The highest-scoring column, other than `skip`
  const best = (scores: number[], skip = -1) => {
    let at = -1;
    scores.forEach((s, i) => {
      if (i !== skip && (at === -1 || s > scores[at])) at = i;
    });
    return at;
  };
  const code = best(codes);
  const country = best(countries, code);
  if (code === -1 || country === -1 || codes[code] < 0.5 || countries[country] < 0.5) return null;
  const headerIndex = headerAbove(rows, code);
  return {
    headerIndex,
    columns: {
      ...(headerIndex >= 0 ? findColumns(rows[headerIndex]) : {}),
      code,
      country,
    },
  };
};

// A column's letter, as a spreadsheet labels it: A, B, … Z, AA
export const columnLetter = (index: number): string => (index >= 26 ? columnLetter(Math.floor(index / 26) - 1) : "") + String.fromCharCode(65 + (index % 26));

const isExcel = (file: File) => /\.xlsx$/i.test(file.name) || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// An uploaded file's tables: each sheet of an .xlsx, or the CSV. Old .xls files can't be read in
// the browser: the error says to save as .xlsx or CSV.
export const readSpreadsheet = async (file: File): Promise<SheetTable[]> => {
  if (/\.xls$/i.test(file.name))
    throw new Error("Old .xls files can't be read. In Excel, choose File › Save As › Excel Workbook (.xlsx) or CSV, then upload that.");
  if (isExcel(file)) {
    const { default: readXlsxFile } = await import("read-excel-file/browser");
    const sheets = await readXlsxFile(file).catch(() => {
      throw new Error("We couldn't open that file. If it's password-protected, remove the password or save a copy as CSV, then try again.");
    });
    return sheets
      .map((s) => ({
        name: s.sheet,
        rows: s.data.map((row) => row.map(cellText)),
      }))
      .filter((s) => s.rows.some((r) => r.some(Boolean)));
  }
  return [{ name: file.name, rows: tableFromText(await file.text()) }];
};

// The sheet to start on: the first whose columns can be found, else the first
export const pickSheet = (sheets: SheetTable[]) => {
  const found = sheets.findIndex((s) => detectColumns(s.rows));
  return found === -1 ? 0 : found;
};
