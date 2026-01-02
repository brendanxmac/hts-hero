import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseTables } from "../../constants/supabase";
import { HTSNote } from "../../interfaces/hts";
import apiClient from "../api";

/**
 * Maps each HTS section to the range of chapters it contains.
 * Key: section number, Value: { start: first chapter, end: last chapter }
 */
const SECTION_TO_CHAPTERS: Record<number, { start: number; end: number }> = {
  1: { start: 1, end: 5 },
  2: { start: 6, end: 14 },
  3: { start: 15, end: 15 },
  4: { start: 16, end: 24 },
  5: { start: 25, end: 27 },
  6: { start: 28, end: 38 },
  7: { start: 39, end: 40 },
  8: { start: 41, end: 43 },
  9: { start: 44, end: 46 },
  10: { start: 47, end: 49 },
  11: { start: 50, end: 63 },
  12: { start: 64, end: 67 },
  13: { start: 68, end: 70 },
  14: { start: 71, end: 71 },
  15: { start: 72, end: 83 },
  16: { start: 84, end: 85 },
  17: { start: 86, end: 89 },
  18: { start: 90, end: 92 },
  19: { start: 93, end: 93 },
  20: { start: 94, end: 96 },
  21: { start: 97, end: 97 },
  22: { start: 98, end: 99 },
};

const getSectionForChapter = (chapter: number): number | null => {
  for (const [section, { start, end }] of Object.entries(SECTION_TO_CHAPTERS)) {
    if (chapter >= start && chapter <= end) {
      return parseInt(section, 10);
    }
  }
  return null;
};

export const getSectionAndChapterFromHtsCode = (
  htsCode: string
): { section: number; chapter: number } | null => {
  const cleanCode = htsCode.replace(/\./g, "");

  if (cleanCode.length < 2) {
    return null;
  }

  const chapter = parseInt(cleanCode.slice(0, 2), 10);

  if (isNaN(chapter) || chapter < 1 || chapter > 99) {
    return null;
  }

  const section = getSectionForChapter(chapter);

  if (section === null) {
    return null;
  }

  return { section, chapter };
};

/**
 * Client-side function to fetch HTS notes via the API route.
 * Use this from React components or client-side code.
 */
export const fetchHtsNotesBySectionAndChapter = async (
  section: number,
  chapter: number | null,
  sectionOnly?: boolean
): Promise<HTSNote[]> => {
  if (sectionOnly) {
    return apiClient.get(
      `/hts-notes/fetch?section=${section}&sectionOnly=true`
    );
  }
  return apiClient.get(
    `/hts-notes/fetch?section=${section}&chapter=${chapter}`
  );
};

/**
 * Server-side function to fetch HTS notes directly from Supabase.
 * Use this from API routes or server components to avoid circular HTTP requests.
 *
 * @param supabase - The Supabase client instance (created by the caller)
 * @param section - The section number to filter by (optional)
 * @param chapter - The chapter number to filter by (optional)
 * @param sectionOnly - If true and section is provided, only fetch section-level notes (chapter is null)
 * @returns Array of HTSNote objects
 */
export const fetchHtsNotesFromSupabase = async (
  supabase: SupabaseClient,
  section: number | null,
  chapter: number | null,
  sectionOnly?: boolean
): Promise<HTSNote[]> => {
  if (section === null && chapter === null) {
    throw new Error(
      "At least one of 'section' or 'chapter' parameter is required"
    );
  }

  let query = supabase.from(SupabaseTables.HTS_NOTES).select("*");

  if (section !== null && sectionOnly) {
    // Section only mode: get only section-level notes (chapter is null)
    query = query.eq("section", section).is("chapter", null);
  } else if (section !== null && chapter !== null) {
    // When both section and chapter are provided, get:
    // - Section-level notes (chapter is null)
    // - Chapter-specific notes
    query = query
      .eq("section", section)
      .or(`chapter.is.null,chapter.eq.${chapter}`);
  } else if (section !== null) {
    // Section only: get all notes for this section (including all chapters)
    query = query.eq("section", section);
  } else if (chapter !== null) {
    // Chapter only: get notes for this specific chapter
    query = query.eq("chapter", chapter);
  }

  // Order by sort_order for proper global ordering
  query = query.order("sort_order");

  const { data: notes, error } = await query;

  if (error) {
    console.error("Error fetching HTS notes:", error);
    throw new Error(error.message);
  }

  return notes ?? [];
};
