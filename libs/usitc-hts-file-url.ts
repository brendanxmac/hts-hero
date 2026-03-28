import { getFirstChapterOfSection } from "./hts";

const USITC_HTS_FILE_BASE =
  "https://hts.usitc.gov/reststop/file?release=currentRelease";

/**
 * Normalizes stored note file keys to the USITC `filename` query value
 * (e.g. "Chapter 1", "General Note 4").
 */
export function normalizeUsitcHtsFileName(stored: string): string | null {
  let s = stored.trim();
  if (!s) return null;

  if (s.startsWith("/sections/")) {
    s = s.slice("/sections/".length);
  } else if (s.startsWith("/chapters/")) {
    s = s.slice("/chapters/".length);
  }

  s = s.trim();
  if (s.toLowerCase().endsWith(".pdf")) {
    s = s.slice(0, -".pdf".length).trim();
  }

  return s || null;
}

export function usitcHtsFileRestStopUrl(fileName: string): string {
  return `${USITC_HTS_FILE_BASE}&filename=${encodeURIComponent(fileName)}`;
}

/** Same in-browser PDF behavior as SectionChapterNotesSection (Google Docs viewer). */
export function usitcHtsFileViewerTabUrl(fileName: string): string {
  const restStop = usitcHtsFileRestStopUrl(fileName);
  return `https://docs.google.com/gview?url=${encodeURIComponent(restStop)}&embedded=true`;
}

export function openUsitcHtsFileInNewTab(fileName: string): void {
  window.open(
    usitcHtsFileViewerTabUrl(fileName),
    "_blank",
    "noopener,noreferrer"
  );
}

/**
 * Section notes on USITC are served under the first chapter PDF for that section.
 */
export function sectionNotesUsitcFileName(
  sectionNumber: number
): string | null {
  const first = getFirstChapterOfSection(sectionNumber);
  return first != null ? `Chapter ${first}` : null;
}
