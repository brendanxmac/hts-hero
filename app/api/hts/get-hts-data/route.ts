import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "../../supabase/server";
import { SupabaseBuckets } from "../../../../constants/supabase";
import { getHtsRevisionRecord } from "../../../../libs/supabase/hts-revision";

export const dynamic = "force-dynamic";

const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours

/**
 * unstable_cache serializes cached values; Blob/ArrayBuffer are not reliably preserved
 * (observed ~15-byte "[object Object]" client body). Base64 string is always cache-safe.
 */
async function fetchRevisionFromSupabase(
  revisionName: string
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(SupabaseBuckets.HTS_REVISIONS)
    .download(`${revisionName}.json.gz`);

  if (error) {
    throw new Error(error.message);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
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
      [`hts-data-b64-${revisionInstance.name}`],
      { revalidate: CACHE_TTL_SECONDS }
    );

    const revisionBase64 = await getCachedRevision();
    const revisionBytes = Buffer.from(revisionBase64, "base64");

    return new NextResponse(revisionBytes, {
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
