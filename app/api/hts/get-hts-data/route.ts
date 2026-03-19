import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "../../supabase/server";
import { SupabaseBuckets } from "../../../../constants/supabase";
import { getHtsRevisionRecord } from "../../../../libs/supabase/hts-revision";

export const dynamic = "force-dynamic";

const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours

async function fetchRevisionFromSupabase(revisionName: string): Promise<Blob> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(SupabaseBuckets.HTS_REVISIONS)
    .download(`${revisionName}.json.gz`);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function GET(req: NextRequest) {
  try {
    const revision = req.nextUrl.searchParams.get("revision");

    if (!revision) {
      return NextResponse.json(
        { error: "Revision is required" },
        { status: 400 }
      );
    }

    const revisionInstance = await getHtsRevisionRecord(revision);

    if (!revisionInstance) {
      return NextResponse.json(
        { error: `Revision ${revision} not found` },
        { status: 404 }
      );
    }

    const getCachedRevision = unstable_cache(
      () => fetchRevisionFromSupabase(revisionInstance.name),
      [`hts-data-${revisionInstance.name}`],
      { revalidate: CACHE_TTL_SECONDS }
    );

    const revisionData = await getCachedRevision();

    return new NextResponse(revisionData, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${revisionInstance.name}.json.gz"`,
        "X-Revision-Name": revisionInstance.name,
        "Cache-Control": `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS / 2}`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
