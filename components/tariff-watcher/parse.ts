import { Countries, Country } from "../../constants/countries";
import { htsCodeDigitsOnly } from "../../libs/hts-code";

// Reads a watch list: one product per line, "HTS code, country of origin".
//   8413919015,BR
//   8409.99.91.90, Argentina
// Commas, tabs, semicolons or spaces separate the two; blank lines, "#" comments and a
// header row are skipped. The code can be 8 or 10 digits, dotted or not; the country is its
// two-letter code or its name.

export interface WatchEntry<T> {
  line: number; // 1-based, as the user sees it
  text: string;
  element: T;
  country: Country;
}

export interface WatchError {
  line: number;
  text: string;
  message: string;
}

export interface ParsedWatchList<T> {
  entries: WatchEntry<T>[];
  errors: WatchError[];
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

export const parseWatchList = <T>(
  text: string,
  // Finds the HTS line for 8 or 10 digits, or nothing if the code doesn't exist
  findElement: (digits: string) => T | undefined
): ParsedWatchList<T> => {
  const entries: WatchEntry<T>[] = [];
  const errors: WatchError[] = [];

  text.split(/\r?\n/).forEach((rawLine, index) => {
    const line = index + 1;
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    if (entries.length === 0 && errors.length === 0 && isHeader(trimmed)) return;

    const fail = (message: string) => errors.push({ line, text: trimmed, message });

    // The code is the first run of digits and dots; the rest of the line is the country
    const match = trimmed.match(/^([\d.\s]*\d)\s*[,;\t|]?\s*(.*)$/);
    if (!match) return fail("Start the line with an HTS code");
    const digits = htsCodeDigitsOnly(match[1]);
    const countryText = match[2].replace(/^[,;\t|\s]+|[,;\t|\s]+$/g, "");

    if (digits.length !== 8 && digits.length !== 10) {
      return fail(`HTS codes need 8 or 10 digits (this has ${digits.length})`);
    }
    if (!countryText) return fail("Add a country of origin after the code");

    const country = findCountry(countryText);
    if (!country) {
      return fail(
        countryText.toUpperCase() === "US"
          ? "The country of origin can't be the United States"
          : `“${countryText}” isn't a country code or name we know`
      );
    }

    const element = findElement(digits);
    if (!element) return fail(`${match[1].trim()} isn't in the current HTS`);

    entries.push({ line, text: trimmed, element, country });
  });

  return { entries, errors };
};
