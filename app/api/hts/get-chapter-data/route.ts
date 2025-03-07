import { NextResponse, NextRequest } from "next/server";
import { requesterIsAuthenticated } from "../../supabase/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const chapterIsValid = (chapter: string) => {
  const chapterAsNumber = Number(chapter);

  if (Number.isNaN(chapterAsNumber)) return false;
  if (chapterAsNumber < 1 || chapterAsNumber > 99) return false;

  return true;
};

export async function GET(req: NextRequest) {
  try {
    const requesterIsAllowed = await requesterIsAuthenticated(req);

    // Users who are not logged in can't make a gpt requests
    if (!requesterIsAllowed) {
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

    const chapterFilePath = path.join(
      process.cwd(),
      "hts-chapters",
      `${Number(chapter)}.json`
    );

    const chapterData = await readFile(chapterFilePath, "utf8");

    return NextResponse.json(JSON.parse(chapterData));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
