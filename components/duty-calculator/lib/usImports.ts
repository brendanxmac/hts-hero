"use client";

import { useEffect, useState } from "react";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { ChapterFile, importsFrom, UsImports } from "./usImportsData";

export { formatImportValue } from "./usImportsData";
export type { UsImports } from "./usImportsData";

// Which countries the US imports an HTS code from, and how much: the Census Bureau's general
// imports by HS10 and country (public/data/us-imports, from `npm run sync-hts-imports`), one file
// per chapter, fetched once when first needed. Where Census has no figures for the exact 10-digit
// line, its 8-digit, then 6-digit, family stands in (and says so).
//
// Census terms: show CENSUS_NOTICE (./census) wherever these figures appear, and never alter them while
// crediting Census (shares and trends worked out from them are ours).

export { CENSUS_NOTICE } from "./census";

const chapters = new Map<string, Promise<ChapterFile | null>>();

const loadChapter = (chapter: string) => {
  if (!chapters.has(chapter)) {
    chapters.set(
      chapter,
      fetch(`/data/us-imports/${chapter}.json`)
        .then((r): Promise<ChapterFile> | null => (r.ok ? (r.json() as Promise<ChapterFile>) : null))
        .catch((): null => null)
    );
  }
  return chapters.get(chapter)!;
};

// The US imports for many HTS codes at once (a catalog), by code as given: null when there are
// none. Ready once every chapter they need has loaded.
export const useUsImportsFor = (htsnos: string[]) => {
  const [state, setState] = useState<{ byCode: Map<string, UsImports | null>; ready: boolean }>({ byCode: new Map(), ready: false });
  const key = Array.from(new Set(htsnos)).sort().join(",");
  useEffect(() => {
    const codes = key ? key.split(",") : [];
    const chaptersNeeded = Array.from(new Set(codes.map((c) => htsCodeDigitsOnly(c).slice(0, 2))));
    let cancelled = false;
    Promise.all(chaptersNeeded.map(loadChapter)).then((files) => {
      if (cancelled) return;
      const byChapter = new Map(chaptersNeeded.map((ch, i) => [ch, files[i]]));
      const byCode = new Map<string, UsImports | null>();
      codes.forEach((code) => {
        const digits = htsCodeDigitsOnly(code);
        const file = byChapter.get(digits.slice(0, 2));
        byCode.set(code, file ? importsFrom(file, digits) : null);
      });
      setState({ byCode, ready: true });
    });
    return () => {
      cancelled = true;
    };
  }, [key]);
  return state;
};

// The US imports for an HTS code; null while loading, or when there are none
export const useUsImports = (htsno: string | undefined) => {
  const [imports, setImports] = useState<UsImports | null>(null);
  useEffect(() => {
    setImports(null);
    if (!htsno) return;
    const digits = htsCodeDigitsOnly(htsno);
    let cancelled = false;
    loadChapter(digits.slice(0, 2)).then((file) => {
      if (!cancelled) setImports(file ? importsFrom(file, digits) : null);
    });
    return () => {
      cancelled = true;
    };
  }, [htsno]);
  return imports;
};
