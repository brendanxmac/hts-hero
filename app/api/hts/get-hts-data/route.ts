import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // const requesterIsAllowed = await requesterIsAuthenticated(req);

    // // Users who are not logged in can't make a gpt requests
    // if (!requesterIsAllowed) {
    //   return NextResponse.json(
    //     { error: "You must be logged in to complete this action" },
    //     { status: 401 }
    //   );
    // }

    // TODO: Add some logic to grab the latest and get it from S3?

    const htsData = await readFile(
      path.join(process.cwd(), "hts-elements", "2025-14.json"),
      "utf8"
    );

    return NextResponse.json(JSON.parse(htsData));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
