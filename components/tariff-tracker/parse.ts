import { Countries, Country } from "../../constants/countries";
import { htsCodeDigitsOnly } from "../../libs/hts-code";

// Reads a product catalog: one product per line, "HTS code, country of origin".
//   8413919015,BR
//   8409.99.91.90, Argentina
// Commas, tabs, semicolons or spaces separate the two; blank lines, "#" comments and a
// header row are skipped. The code can be 8 or 10 digits, dotted or not; the country is its
// two-letter code or its name.

export interface CatalogEntry<T> {
  line: number; // 1-based, as the user sees it
  text: string;
  element: T;
  country: Country;
}

export interface CatalogError {
  line: number;
  text: string;
  message: string;
}

export interface ParsedCatalog<T> {
  entries: CatalogEntry<T>[];
  errors: CatalogError[];
}

const ORIGINS = Countries.filter((c) => c.code !== "US");

export const findCountry = (raw: string): Country | null => {
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  return (
    ORIGINS.find((c) => c.code.toLowerCase() === value) ??
    ORIGINS.find((c) => c.name.toLowerCase() === value) ??
    null
  );
};

// "hts,country", "HTS Code, Country of Origin" and the like
const isHeader = (text: string) => /^[^\d]*\b(hts|code|tariff)\b/i.test(text) && !/\d{6,}/.test(text);

export const parseCatalog = <T>(
  text: string,
  // Finds the HTS line for 8 or 10 digits, or nothing if the code doesn't exist
  findElement: (digits: string) => T | undefined
): ParsedCatalog<T> => {
  const entries: CatalogEntry<T>[] = [];
  const errors: CatalogError[] = [];

  text.split(/\r?\n/).forEach((rawLine, index) => {
    const line = index + 1;
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    if (entries.length === 0 && errors.length === 0 && isHeader(trimmed)) return;

    const fail = (message: string) => errors.push({ line, text: trimmed, message });

    // The code is the first run of digits and dots; the rest of the line is the country
    const match = trimmed.match(/^([\d.\s]*\d)\s*[,;\t|]?\s*(.*)$/);
    if (!match) return fail("Start the line with an HTS code");
    const product = readProduct(match[1], match[2].replace(/^[,;\t|\s]+|[,;\t|\s]+$/g, ""), findElement);
    if ("message" in product) return fail(product.message);
    entries.push({ line, text: trimmed, ...product });
  });

  return { entries, errors };
};

// One product from its code and country as written, or why it can't be read. Shared by the
// pasted list and CSV uploads.
export const readProduct = <T>(
  codeText: string,
  countryText: string,
  findElement: (digits: string) => T | undefined
): { element: T; country: Country } | { message: string } => {
  const digits = htsCodeDigitsOnly(codeText);
  const country = countryText.trim();
  if (!digits) return { message: "Add an HTS code" };
  if (digits.length !== 8 && digits.length !== 10) {
    return { message: `HTS codes need 8 or 10 digits (this has ${digits.length})` };
  }
  if (!country) return { message: "Add a country of origin after the code" };
  const found = findCountry(country);
  if (!found) {
    return {
      message:
        country.toUpperCase() === "US"
          ? "The country of origin can't be the United States"
          : `“${country}” isn't a country code or name we know`,
    };
  }
  const element = findElement(digits);
  if (!element) return { message: `${codeText.trim()} isn't in the current HTS` };
  return { element, country: found };
};
