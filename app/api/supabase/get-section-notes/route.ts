import { NextResponse, NextRequest } from "next/server";
import { createClient, requesterIsAuthenticated } from "../server";
import { toRoman } from "@javascript-packages/roman-numerals";

export const dynamic = "force-dynamic";

interface GetTopLevelSectionNotesDto {
  section: number;
}

export async function POST(req: NextRequest) {
  try {
    const requesterIsAllowed = await requesterIsAuthenticated(req);

    // Users who are not logged in can't make a gpt requests
    if (!requesterIsAllowed) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action" },
        { status: 401 }
      );
    }

    const { section }: GetTopLevelSectionNotesDto = await req.json();

    if (!section) {
      return NextResponse.json(
        {
          error: "Missing section",
        },
        { status: 400 }
      );
    }

    console.log("Section:", Number(section));
    const romanSection = toRoman(section);
    console.log("Roman Section:", romanSection);

    const { data: sectionNotes, error } = await supabase
      .from("section_notes")
      .select("*")
      .eq("section", romanSection)
      .eq("type", "note")
      .not("listPosition", "like", "%/%"); // listPosition NOT LIKE '%/%'

    if (error) {
      console.error("Error fetching data:", error);
    }

    console.log("Fetched records:", sectionNotes?.length);

    return NextResponse.json(sectionNotes);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
