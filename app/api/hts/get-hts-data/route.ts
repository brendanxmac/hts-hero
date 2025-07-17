import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../supabase/server";
import { SupabaseBuckets } from "../../../../constants/supabase";
import { getHtsRevisionRecord } from "../../../../libs/supabase/hts-revision";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Get the revision number from the query params
    const revision = req.nextUrl.searchParams.get("revision");

    if (!revision) {
      return NextResponse.json(
        { error: "Revision is required" },
        { status: 400 }
      );
    }

    // find the matching revision in the revisions table in supabase
    const revisionInstance = await getHtsRevisionRecord(revision);

    if (!revisionInstance) {
      return NextResponse.json(
        { error: `Revision ${revision} not found` },
        { status: 404 }
      );
    }

    const supabase = createAdminClient();

    // Fetch the revision from supabase storage
    const { data: revisionData, error: revisionError } = await supabase.storage
      .from(SupabaseBuckets.HTS_REVISIONS)
      .download(`${revisionInstance.name}.json.gz`);

    if (revisionError) {
      console.error("revisionError", revisionError);
      return NextResponse.json(
        { error: revisionError.message },
        { status: 500 }
      );
    }

    // Return the Blob directly with appropriate headers
    return new NextResponse(revisionData, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${revisionInstance.name}.json.gz"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
