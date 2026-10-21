import { Countries, Country } from "../../../constants/countries";
import { HtsElement } from "../../../interfaces/hts";
import { htsCodeDigitsOnly } from "../../../libs/hts-code";
import { ParsedImport } from "../csv";
import { CatalogError, findCountry, isPaddedHs6, readProduct } from "../parse";

// Fixing rows that couldn't be read, in place (FixEditor), instead of editing the spreadsheet and
// uploading it again. A fix replaces a row's code and country (or skips the row); the rows are then
// read again exactly as an upload would. Suggestions make the common fixes one click: the full US
// codes under a 6-digit HS code, a leading zero Excel dropped, a country written another way.

export interface Fix {
  code: string;
  country: string;
  // Not one of theirs: left out
  skipped?: boolean;
}

export type Fixes = Record<number, Fix>;

// The upload with its fixes applied: fixed rows become entries, skipped rows drop out, and rows
// still wrong keep their (new) reason
export const applyFixes = <T>(
  parsed: ParsedImport<T>,
  fixes: Fixes,
  findElement: (digits: string) => T | undefined
): { parsed: ParsedImport<T>; skipped: number } => {
  const entries = [...parsed.entries];
  const errors: CatalogError[] = [];
  let skipped = 0;
  parsed.errors.forEach((e) => {
    const fix = fixes[e.line];
    if (!fix) return errors.push(e);
    if (fix.skipped) return skipped++;
    const product = readProduct(fix.code, fix.country, findElement);
    if ("message" in product) errors.push({ ...e, message: product.message, code: fix.code, country: fix.country });
    else entries.push({ line: e.line, text: e.text, ...product });
  });
  return { parsed: { entries, errors }, skipped };
};

// ── Code suggestions ──

// A code that only says the 6-digit HS heading: 6 digits, or 6 and zeros. It stands for every US
// line under it, so each product needs its own pick.
export const isHs6Like = (code: string) => {
  const digits = htsCodeDigitsOnly(code);
  return digits.length === 6 || isPaddedHs6(digits);
};

export interface CodeSuggestion {
  htsno: string;
  digits: string;
  description: string;
}

export const MAX_SUGGESTIONS = 12;
const digitsOf = (el: HtsElement) => htsCodeDigitsOnly(el.htsno);

// The US codes a written code may have meant: under a 6-digit HS code, every 10-digit line (8-digit
// where a line has none); a 7- or 9-digit code with its leading zero back; a code the HTS doesn't have,
// the lines under its first 6 digits. `describe` names a line (report.ts).
export const codeSuggestions = (raw: string, htsElements: HtsElement[], describe: (el: HtsElement) => string): CodeSuggestion[] => {
  const digits = htsCodeDigitsOnly(raw);
  if (digits.length < 4 || !htsElements.length) return [];
  const lines = (prefix: string) => {
    const under = htsElements.filter((el) => digitsOf(el).startsWith(prefix));
    const tens = under.filter((el) => digitsOf(el).length === 10);
    return (tens.length ? tens : under.filter((el) => digitsOf(el).length === 8)).slice(0, MAX_SUGGESTIONS);
  };
  let found: HtsElement[] = [];
  // A dropped leading zero (0102210010 kept as the number 102210010)
  if (digits.length === 7 || digits.length === 9) {
    const padded = htsElements.find((el) => digitsOf(el) === `0${digits}`);
    if (padded) found = [padded];
  }
  if (!found.length && digits.length >= 6) found = lines(digits.slice(0, 6));
  // Only a heading (4 digits) or a typo before the 6th digit: nothing reliable to offer
  return found.map((el) => ({ htsno: el.htsno, digits: digitsOf(el), description: describe(el) }));
};

// Which of a suggestion's digits match what was written (by position in its digits)
export const matchedDigits = (written: string, suggestion: string): Set<number> => {
  // A 6-digit code filled out with zeros only really says its first 6 (the zeros are filler)
  const all = htsCodeDigitsOnly(written);
  const typed = isPaddedHs6(all) ? all.slice(0, 6) : all;
  const matched = new Set<number>();
  // A dropped leading zero: all of what was written, one place along
  if (suggestion === `0${typed}`) {
    for (let i = 1; i < suggestion.length; i++) matched.add(i);
    return matched;
  }
  for (let i = 0; i < Math.min(typed.length, suggestion.length) && typed[i] === suggestion[i]; i++) matched.add(i);
  return matched;
};

// ── Country suggestions ──

const ORIGINS = Countries.filter((c) => c.code !== "US");

// Other ways people write a country, as the HTS's country list names it
const ALIASES: Record<string, string> = {
  prc: "CN",
  "peoples republic of china": "CN",
  "mainland china": "CN",
  "viet nam": "VN",
  "south korea": "KR",
  korea: "KR",
  "republic of korea": "KR",
  uk: "GB",
  "great britain": "GB",
  england: "GB",
  "united kingdom": "GB",
  holland: "NL",
  "the netherlands": "NL",
  czechia: "CZ",
  turkiye: "TR",
  türkiye: "TR",
  uae: "AE",
  "republic of china": "TW",
  "russian federation": "RU",
  usa: "US",
  "united states of america": "US",
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Edit distance, for a misspelled name ("Veitnam")
const distance = (a: string, b: string) => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return row[b.length];
};

// The country a written one most likely means, or null. Never the US (not an origin here).
export const countrySuggestion = (raw: string): Country | null => {
  if (!raw.trim() || findCountry(raw)) return null;
  const text = normalize(raw);
  const alias = ALIASES[text];
  if (alias) return alias === "US" ? null : (ORIGINS.find((c) => c.code === alias) ?? null);
  // A three-letter code, or a name inside a longer text ("Made in China", "China (PRC)")
  const within = ORIGINS.find((c) => text.split(" ").includes(c.name.toLowerCase()) || (c.name.length > 4 && text.includes(c.name.toLowerCase())));
  if (within) return within;
  const best = ORIGINS.map((c) => ({ c, d: distance(text, c.name.toLowerCase()) })).sort((a, b) => a.d - b.d)[0];
  return best && best.d <= Math.max(1, Math.floor(best.c.name.length / 3)) ? best.c : null;
};
