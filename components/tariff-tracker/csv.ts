import { TransportMode } from "../../tariffs/engine-v2/types";
import { TRANSPORT_MODES } from "../duty-calculator/lib/format";
import { Adjustments, cleanAdjustments } from "./adjustments";
import { CatalogEntry, CatalogError, parseCatalog, readProduct } from "./parse";

// Reads an uploaded CSV of products. With a header row, columns are found by name (in any
// order, extra columns ignored):
//   hts_code, country_of_origin        required
//   customs_value, quantity, transport optional: become the product's adjustments
// Without a recognizable header, it's read like a pasted list: code, then country.

export interface ImportedEntry<T> extends CatalogEntry<T> {
  adjustments?: Adjustments;
}

export interface ParsedImport<T> {
  entries: ImportedEntry<T>[];
  errors: CatalogError[];
}

type Column = "code" | "country" | "value" | "quantity" | "mode";

// Header names each column answers to, compared without case, spaces or punctuation
const ALIASES: Record<Column, string[]> = {
  code: ["htscode", "hts", "htsnumber", "htsus", "code", "hscode", "tariffcode"],
  country: ["countryoforigin", "country", "coo", "origin", "countrycode", "origincountry"],
  value: ["customsvalue", "value", "enteredvalue", "declaredvalue"],
  quantity: ["quantity", "qty", "units"],
  mode: ["transport", "transportmode", "mode", "modeoftransport", "shipby"],
};

export const CSV_COLUMNS: { name: string; required: boolean; description: string }[] = [
  { name: "hts_code", required: true, description: "8 or 10 digits, with or without dots" },
  { name: "country_of_origin", required: true, description: "Two-letter code (CN) or name (China)" },
  { name: "customs_value", required: false, description: "In US dollars" },
  { name: "quantity", required: false, description: "Units, for per-unit duty" },
  { name: "transport", required: false, description: "Ocean, air, truck or rail" },
];

export const CSV_TEMPLATE = [
  "hts_code,country_of_origin,customs_value,quantity,transport",
  "8413.91.90.15,BR,25000,500,ocean",
  "8409.99.91.90,AR,,,",
  "7326.90.86.88,China,12000,,air",
].join("\n");

const normalize = (header: string) => header.toLowerCase().replace(/[^a-z]/g, "");

// One row's fields, honoring quotes ("Acme, Inc." stays one field; "" is a quote)
export const splitRow = (line: string, delimiter: string): string[] => {
  const fields: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      fields.push(field);
      field = "";
    } else field += ch;
  }
  fields.push(field);
  return fields.map((f) => f.trim());
};

const detectDelimiter = (header: string) =>
  header.includes(",") ? "," : header.includes(";") ? ";" : header.includes("\t") ? "\t" : ",";

const findColumns = (headers: string[]) => {
  const columns: Partial<Record<Column, number>> = {};
  headers.forEach((header, index) => {
    const name = normalize(header);
    (Object.keys(ALIASES) as Column[]).forEach((column) => {
      if (columns[column] === undefined && ALIASES[column].includes(name)) columns[column] = index;
    });
  });
  return columns;
};

const readMoney = (text: string) => {
  const value = parseFloat(text.replace(/[^\d.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
};

const readMode = (text: string): TransportMode | null =>
  TRANSPORT_MODES.find((m) => m.id === text.toLowerCase() || m.label.toLowerCase() === text.toLowerCase())?.id ??
  null;

export const parseCsv = <T>(text: string, findElement: (digits: string) => T | undefined): ParsedImport<T> => {
  // A byte order mark (Excel adds one) would hide the first header
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const headerIndex = lines.findIndex((l) => l.trim());
  if (headerIndex === -1) return { entries: [], errors: [] };

  const delimiter = detectDelimiter(lines[headerIndex]);
  const columns = findColumns(splitRow(lines[headerIndex], delimiter));
  // No header we know: read it like a pasted list
  if (columns.code === undefined || columns.country === undefined) return parseCatalog(text, findElement);

  const entries: ImportedEntry<T>[] = [];
  const errors: CatalogError[] = [];
  lines.forEach((raw, index) => {
    const line = index + 1;
    const trimmed = raw.trim();
    if (index <= headerIndex || !trimmed) return;
    const fields = splitRow(raw, delimiter);
    if (fields.every((f) => !f)) return;
    const field = (column: Column) => (columns[column] === undefined ? "" : fields[columns[column]!] ?? "");
    const fail = (message: string) => errors.push({ line, text: trimmed, message });

    const product = readProduct(field("code"), field("country"), findElement);
    if ("message" in product) return fail(product.message);

    const adjustments: Adjustments = {};
    if (field("value")) {
      const value = readMoney(field("value"));
      if (value === null) return fail(`Customs value “${field("value")}” isn't an amount`);
      adjustments.customsValue = value;
    }
    if (field("quantity")) {
      const quantity = readMoney(field("quantity"));
      if (quantity === null) return fail(`Quantity “${field("quantity")}” isn't a number`);
      adjustments.quantity = quantity;
    }
    if (field("mode")) {
      const mode = readMode(field("mode"));
      if (mode === null) return fail(`Transport “${field("mode")}” isn't ocean, air, truck or rail`);
      adjustments.transportMode = mode;
    }
    const cleaned = cleanAdjustments(adjustments);
    entries.push({ line, text: trimmed, ...product, ...(Object.keys(cleaned).length ? { adjustments: cleaned } : {}) });
  });
  return { entries, errors };
};

// Saves the template, so users start from the right columns
export const downloadCsvTemplate = () => {
  const url = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "tariff-tracker-products.csv";
  link.click();
  URL.revokeObjectURL(url);
};
