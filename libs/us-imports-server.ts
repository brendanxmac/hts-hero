import { readFileSync } from "fs";
import { join } from "path";
import { htsCodeDigitsOnly } from "./hts-code";
import { ChapterFile, importsFrom, UsImports } from "../components/duty-calculator/lib/usImportsData";

// The US imports for an HTS code, read on the server from the Census chapter files
// (public/data/us-imports; next.config.js includes them in the HTS pages' bundle). Null when the
// code's chapter has no figures for it or its 8- or 6-digit family.

const cache = new Map<string, ChapterFile | null>();

const readChapter = (chapter: string): ChapterFile | null => {
  if (!cache.has(chapter)) {
    try {
      cache.set(chapter, JSON.parse(readFileSync(join(process.cwd(), "public/data/us-imports", `${chapter}.json`), "utf8")) as ChapterFile);
    } catch {
      cache.set(chapter, null);
    }
  }
  return cache.get(chapter)!;
};

export const getUsImports = (htsno: string): UsImports | null => {
  const digits = htsCodeDigitsOnly(htsno);
  if (digits.length < 6 || digits.startsWith("99")) return null;
  const file = readChapter(digits.slice(0, 2));
  return file ? importsFrom(file, digits) : null;
};
