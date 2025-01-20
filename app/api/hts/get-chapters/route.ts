import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../libs/supabase/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const chaptersFilePath = path.join(process.cwd(), "chapters.json");
    const chaptersData = await readFile(chaptersFilePath, "utf8");

    return NextResponse.json(JSON.parse(chaptersData));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
