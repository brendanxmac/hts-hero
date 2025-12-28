import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../supabase/server";
import { SupabaseTables } from "../../../../constants/supabase";

export const dynamic = "force-dynamic";

export interface HtsNote {
  id: string;
  section: number | null;
  chapter: number | null;
  subchapter: string | null;
  note_type: string | null;
  note_number: string | null;
  note_path: string | null;
  text: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionParam = searchParams.get("section");
    const chapterParam = searchParams.get("chapter");

    const section = sectionParam ? parseInt(sectionParam, 10) : null;
    const chapter = chapterParam ? parseInt(chapterParam, 10) : null;

    if (section === null && chapter === null) {
      return NextResponse.json(
        {
          error:
            "At least one of 'section' or 'chapter' query parameter is required",
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    let query = supabase.from(SupabaseTables.HTS_NOTES).select("*");

    if (section !== null) {
      query = query.eq("section", section);
    }

    if (chapter !== null) {
      query = query.eq("chapter", chapter);
    }

    const { data: notes, error } = await query;

    if (error) {
      console.error("Error fetching HTS notes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(notes ?? [], { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error)?.message }, { status: 500 });
  }
}
