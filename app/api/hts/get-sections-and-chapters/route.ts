import { NextResponse } from "next/server";
import { createClient } from "../../../../libs/supabase/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const supabaseUserResponse = await supabase.auth.getUser();
    const user = supabaseUserResponse.data.user;

    // Users who are not logged in can't make a gpt requests
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action" },
        { status: 401 }
      );
    }

    const filePath = path.join(process.cwd(), "sections-and-chapters.json");
    const sectionData = await readFile(filePath, "utf8");

    return NextResponse.json(JSON.parse(sectionData));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
