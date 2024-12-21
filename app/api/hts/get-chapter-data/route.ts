import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../../../libs/supabase/server";
import { readFile } from "fs/promises";

export const dynamic = "force-dynamic";

const chapterIsValid = (chapter: string) => {
  const chapterAsNumber = Number(chapter);

  if (Number.isNaN(chapterAsNumber)) return false;
  if (chapterAsNumber < 1 || chapterAsNumber > 99) return false;

  return true;
};

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const supabaseUserResponse = await supabase.auth.getUser();
    const user = supabaseUserResponse.data.user;

    // User who are not logged in can't make a gpt requests
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action" },
        { status: 401 }
      );
    }

    const requestUrl = new URL(req.url);
    const chapter = requestUrl.searchParams.get("chapter");

    if (!chapter) {
      return NextResponse.json({ error: "Missing chapter" }, { status: 400 });
    }

    if (!chapterIsValid(chapter)) {
      return NextResponse.json({ error: "Invalid Chapter" }, { status: 400 });
    }

    const chapterData = await readFile(
      `hts-chapters/${Number(chapter)}.json`,
      "utf8"
    );

    return NextResponse.json(JSON.parse(chapterData));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
