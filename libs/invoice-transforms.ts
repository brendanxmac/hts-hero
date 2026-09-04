import { format, isValid, parse } from "date-fns";
import { Countries } from "../constants/countries";
import { htsCodeDigitsOnly } from "./hts-code";
import {
  ROW_ID_FIELD,
  type DocumentCellValue,
  type DocumentRow,
} from "./trade-documents";

export type InvoiceTransformId =
  | "htsSanitize"
  | "htsPad10"
  | "uppercase"
  | "countryIso"
  | "currencyIso"
  | "round2"
  | "round4"
  | "isoDates"
  | "trimWhitespace"
  | "stripCurrency"
  | "normalizeUom";

export interface InvoiceTransform {
  id: InvoiceTransformId;
  label: string;
  example: string;
}

export const INVOICE_TRANSFORMS: InvoiceTransform[] = [
  {
    id: "htsSanitize",
    label: "HTS: strip punctuation",
    example: "8507.60.00 → 85076000",
  },
  {
    id: "htsPad10",
    label: "HTS: pad to 10 digits",
    example: "85076000 → 8507600000",
  },
  {
    id: "uppercase",
    label: "Uppercase text",
    example: "china → CHINA",
  },
  {
    id: "countryIso",
    label: "Countries → ISO codes",
    example: "China → CN",
  },
  {
    id: "currencyIso",
    label: "Currency → ISO codes",
    example: "US Dollar → USD",
  },
  {
    id: "round2",
    label: "Round amounts to 2 decimals",
    example: "12.456 → 12.46",
  },
  {
    id: "round4",
    label: "Round amounts to 4 decimals",
    example: "12.45678 → 12.4568",
  },
  {
    id: "isoDates",
    label: "Dates → YYYY-MM-DD",
    example: "15/03/2024 → 2024-03-15",
  },
  {
    id: "trimWhitespace",
    label: "Trim extra spaces",
    example: "foo   bar → foo bar",
  },
  {
    id: "stripCurrency",
    label: "Strip currency symbols",
    example: "$1,234.50 → 1234.5",
  },
  {
    id: "normalizeUom",
    label: "Standardize UOM",
    example: "pieces → PCS",
  },
];

const EXCLUSIVE_TRANSFORM_GROUPS: InvoiceTransformId[][] = [
  ["round2", "round4"],
];

function isHtsField(field: string): boolean {
  return field === "hs_code" || field === "hts_code";
}

function isDateField(field: string): boolean {
  return field.endsWith("_date");
}

function isCountryField(field: string): boolean {
  return field.endsWith("_country") || field.startsWith("country_of_");
}

function isCurrencyField(field: string): boolean {
  return field === "currency";
}

function isUomField(field: string): boolean {
  return (
    field === "unit_of_measure" ||
    field === "weight_unit" ||
    field === "volume_unit" ||
    field === "package_type"
  );
}

function isRoundableField(field: string): boolean {
  return (
    /_(?:weight|amount|volume|price)$/.test(field) ||
    field === "subtotal" ||
    field === "volume"
  );
}

function isNumericField(field: string): boolean {
  return (
    isRoundableField(field) ||
    field === "quantity" ||
    field === "packages_count" ||
    field === "total_packages" ||
    field === "total_cartons"
  );
}

const COUNTRY_ALIASES: Record<string, string> = {
  usa: "US",
  "u s a": "US",
  "u s": "US",
  america: "US",
  "united states of america": "US",
  uk: "GB",
  "u k": "GB",
  "great britain": "GB",
  britain: "GB",
  england: "GB",
  prc: "CN",
  "p r c": "CN",
  "p r china": "CN",
  "mainland china": "CN",
  "viet nam": "VN",
  korea: "KR",
  "republic of korea": "KR",
  "korea republic of": "KR",
  "korea south": "KR",
  holland: "NL",
  "the netherlands": "NL",
  russia: "RU",
  "russian federation": "RU",
  "ivory coast": "CI",
  "cote d ivoire": "CI",
  "cote divoire": "CI",
  burma: "MM",
  "czech republic": "CZ",
  "hong kong sar": "HK",
  "hong kong china": "HK",
  macau: "MO",
  macao: "MO",
};

const CURRENCY_ALIASES: Record<string, string> = {
  $: "USD",
  usd: "USD",
  "us dollar": "USD",
  "us dollars": "USD",
  dollar: "USD",
  dollars: "USD",
  "€": "EUR",
  eur: "EUR",
  euro: "EUR",
  euros: "EUR",
  "£": "GBP",
  gbp: "GBP",
  "pound sterling": "GBP",
  pounds: "GBP",
  cny: "CNY",
  rmb: "CNY",
  yuan: "CNY",
  jpy: "JPY",
  yen: "JPY",
  cad: "CAD",
  "canadian dollar": "CAD",
  mxn: "MXN",
  krw: "KRW",
  won: "KRW",
  inr: "INR",
  rupee: "INR",
  aud: "AUD",
  chf: "CHF",
  hkd: "HKD",
  sgd: "SGD",
};

const UOM_ALIASES: Record<string, string> = {
  pc: "PCS",
  pcs: "PCS",
  pce: "PCS",
  piece: "PCS",
  pieces: "PCS",
  ea: "PCS",
  each: "PCS",
  unit: "PCS",
  units: "PCS",
  kg: "KG",
  kgs: "KG",
  kilo: "KG",
  kilos: "KG",
  kilogram: "KG",
  kilograms: "KG",
  lb: "LB",
  lbs: "LB",
  pound: "LB",
  pounds: "LB",
  ctn: "CTN",
  carton: "CTN",
  cartons: "CTN",
  set: "SET",
  sets: "SET",
  m: "M",
  meter: "M",
  meters: "M",
  metre: "M",
  metres: "M",
  doz: "DOZ",
  dozen: "DOZ",
  pr: "PR",
  pair: "PR",
  pairs: "PR",
  g: "G",
  gram: "G",
  grams: "G",
  mt: "MT",
  tonne: "MT",
  tonnes: "MT",
  "metric ton": "MT",
  "metric tons": "MT",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const NAMED_DATE_FORMATS = [
  "d MMM yyyy",
  "dd MMM yyyy",
  "d MMMM yyyy",
  "dd MMMM yyyy",
  "MMM d, yyyy",
  "MMMM d, yyyy",
  "MMM d yyyy",
  "dd-MMM-yyyy",
  "yyyy/MM/dd",
  "yyyy.MM.dd",
];

function foldKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function lookupMap(
  entries: Iterable<[string, string]>
): Map<string, string> {
  const map = new Map<string, string>();
  for (const [key, code] of entries) {
    map.set(foldKey(key), code);
  }
  return map;
}

const COUNTRY_LOOKUP = lookupMap([
  ...Countries.flatMap((country) => [
    [country.name, country.code],
    [country.code, country.code],
  ] as [string, string][]),
  ...Object.entries(COUNTRY_ALIASES),
]);

const CURRENCY_LOOKUP = lookupMap(Object.entries(CURRENCY_ALIASES));
const UOM_LOOKUP = lookupMap(Object.entries(UOM_ALIASES));

export function toggleInvoiceTransform(
  enabled: InvoiceTransformId[],
  id: InvoiceTransformId
): InvoiceTransformId[] {
  if (enabled.includes(id)) {
    return enabled.filter((current) => current !== id);
  }

  const group = EXCLUSIVE_TRANSFORM_GROUPS.find((ids) => ids.includes(id));
  const withoutExclusive = group
    ? enabled.filter((current) => !group.includes(current))
    : enabled;

  return [...withoutExclusive, id];
}

function trimWhitespace(value: DocumentCellValue): DocumentCellValue {
  if (typeof value !== "string") {
    return value;
  }
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeHts(value: DocumentCellValue): DocumentCellValue {
  const digits = htsCodeDigitsOnly(String(value ?? ""));
  return digits || value;
}

function padHtsTo10(value: DocumentCellValue): DocumentCellValue {
  const digits = htsCodeDigitsOnly(String(value ?? ""));
  if (digits.length === 4 || digits.length === 6 || digits.length === 8) {
    return digits.padEnd(10, "0");
  }
  if (digits.length === 10) {
    return digits;
  }
  return value;
}

function countryToIso(value: DocumentCellValue): DocumentCellValue {
  if (value == null || value === "") {
    return value;
  }
  const code = COUNTRY_LOOKUP.get(foldKey(String(value)));
  return code ?? value;
}

function currencyToIso(value: DocumentCellValue): DocumentCellValue {
  if (value == null || value === "") {
    return value;
  }
  const raw = String(value).trim();
  if (/^[A-Za-z]{3}$/.test(raw)) {
    return raw.toUpperCase();
  }
  const code = CURRENCY_LOOKUP.get(foldKey(raw));
  return code ?? value;
}

function normalizeUom(value: DocumentCellValue): DocumentCellValue {
  if (value == null || value === "") {
    return value;
  }
  const code = UOM_LOOKUP.get(foldKey(String(value)));
  return code ?? value;
}

export function parseNumericValue(value: DocumentCellValue): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (value == null || value === "") {
    return null;
  }

  let raw = String(value).trim();
  if (!raw) {
    return null;
  }

  const negative = /^\(.*\)$/.test(raw);
  raw = raw.replace(/[()]/g, "");
  raw = raw.replace(/[$€£¥₹₩]/g, "");
  raw = raw.replace(/,/g, "");
  raw = raw.replace(/\s/g, "");
  raw = raw.replace(/^[A-Za-z]+/, "");
  raw = raw.replace(/[A-Za-z]+$/, "");

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return negative ? -parsed : parsed;
}

function roundTo(value: number, places: number): string {
  const factor = 10 ** places;
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor;
  return rounded.toFixed(places);
}

function toIsoDate(value: DocumentCellValue): DocumentCellValue {
  if (value == null || value === "") {
    return value;
  }

  const raw = String(value).trim();
  if (!raw) {
    return value;
  }
  if (ISO_DATE.test(raw)) {
    return raw;
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
    return raw.slice(0, 10);
  }

  const numericDate = raw.match(
    /^(\d{1,2})[/.\\-](\d{1,2})[/.\\-](\d{4})$/
  );
  if (numericDate) {
    const first = Number(numericDate[1]);
    const second = Number(numericDate[2]);
    const year = numericDate[3];
    let day: number;
    let month: number;
    if (first > 12) {
      day = first;
      month = second;
    } else if (second > 12) {
      month = first;
      day = second;
    } else {
      day = first;
      month = second;
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  const reference = new Date(2000, 0, 1);
  for (const dateFormat of NAMED_DATE_FORMATS) {
    const parsed = parse(raw, dateFormat, reference);
    if (isValid(parsed)) {
      return format(parsed, "yyyy-MM-dd");
    }
  }

  return value;
}

function uppercaseText(
  field: string,
  value: DocumentCellValue
): DocumentCellValue {
  if (typeof value !== "string" || value === "") {
    return value;
  }
  if (isDateField(field) && ISO_DATE.test(value)) {
    return value;
  }
  return value.toUpperCase();
}

function transformCell(
  field: string,
  value: DocumentCellValue,
  enabled: Set<InvoiceTransformId>
): DocumentCellValue {
  let next = value;

  if (enabled.has("trimWhitespace")) {
    next = trimWhitespace(next);
  }

  if (isHtsField(field)) {
    if (enabled.has("htsSanitize")) {
      next = sanitizeHts(next);
    }
    if (enabled.has("htsPad10")) {
      next = padHtsTo10(next);
    }
  }

  if (isCountryField(field) && enabled.has("countryIso")) {
    next = countryToIso(next);
  }

  if (isCurrencyField(field) && enabled.has("currencyIso")) {
    next = currencyToIso(next);
  }

  if (isUomField(field) && enabled.has("normalizeUom")) {
    next = normalizeUom(next);
  }

  if (isDateField(field) && enabled.has("isoDates")) {
    next = toIsoDate(next);
  }

  if (isNumericField(field)) {
    const shouldParse =
      enabled.has("stripCurrency") ||
      enabled.has("round2") ||
      enabled.has("round4");
    if (shouldParse) {
      const parsed = parseNumericValue(next);
      if (parsed != null) {
        if (enabled.has("round2") && isRoundableField(field)) {
          next = roundTo(parsed, 2);
        } else if (enabled.has("round4") && isRoundableField(field)) {
          next = roundTo(parsed, 4);
        } else if (enabled.has("stripCurrency")) {
          next = parsed;
        }
      }
    }
  }

  if (enabled.has("uppercase")) {
    next = uppercaseText(field, next);
  }

  return next;
}

export function editedCellKey(rowId: string, field: string): string {
  return `${rowId}:${field}`;
}

export function applyInvoiceTransforms(
  rows: DocumentRow[],
  enabledIds: InvoiceTransformId[],
  editedCells: Record<string, true> = {}
): DocumentRow[] {
  if (enabledIds.length === 0) {
    return rows.map((row) => ({ ...row }));
  }

  const enabled = new Set(enabledIds);
  return rows.map((row) => {
    const next: DocumentRow = { ...row };
    const rowId = String(row[ROW_ID_FIELD] ?? "");
    for (const field of Object.keys(next)) {
      if (field === ROW_ID_FIELD) {
        continue;
      }
      if (editedCells[editedCellKey(rowId, field)]) {
        continue;
      }
      next[field] = transformCell(field, next[field], enabled);
    }
    return next;
  });
}
