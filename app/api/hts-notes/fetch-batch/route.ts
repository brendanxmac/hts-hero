import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../supabase/server";
import {
  fetchHtsNotesForSectionsAndChapters,
  GroupedHtsNotes,
} from "../../../../libs/supabase/hts-notes";
import { renderNoteContext, buildNoteTree } from "../../../../libs/hts";
import { NoteRecord } from "../../../../types/hts";

export const dynamic = "force-dynamic";

interface FetchBatchNotesDto {
  sections: number[];
  chapters: number[];
}

export async function POST(request: NextRequest) {
  try {
    const { sections = [], chapters = [] }: FetchBatchNotesDto =
      await request.json();

    if (sections.length === 0 && chapters.length === 0) {
      return NextResponse.json(
        {
          error: "At least one section or chapter is required",
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Fetch all notes in a single query, grouped by section and chapter
    const groupedNotes: GroupedHtsNotes =
      await fetchHtsNotesForSectionsAndChapters(supabase, sections, chapters);

    // Build notes registry by rendering each section and chapter's notes
    const notes: NoteRecord[] = [
      ...Array.from(groupedNotes.sections.entries()).map(
        ([sectionNum, sectionNotes]) =>
          ({
            id: `Section-${sectionNum}`,
            type: "section",
            number: sectionNum,
            text: renderNoteContext(buildNoteTree(sectionNotes)),
          }) as NoteRecord
      ),
      ...Array.from(groupedNotes.chapters.entries()).map(
        ([chapterNum, chapterNotes]) =>
          ({
            id: `Chapter-${chapterNum}`,
            type: "chapter",
            number: chapterNum,
            text: renderNoteContext(buildNoteTree(chapterNotes)),
          }) as NoteRecord
      ),
    ];

    return NextResponse.json(notes, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error)?.message }, { status: 500 });
  }
}

