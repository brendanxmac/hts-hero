import { NextResponse, NextRequest } from "next/server";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

const CACHE_TTL_SECONDS = 8 * 60 * 60; // 8 hours

async function fetchRulingDetailFromCbp(rulingNumber: string): Promise<unknown> {
  const url = `https://rulings.cbp.gov/api/ruling/${encodeURIComponent(rulingNumber)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CBP API returned ${response.status}`);
  }

  return response.json();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { rulingNumber: string } }
) {
  const { rulingNumber } = params;

  if (!rulingNumber) {
    return NextResponse.json(
      { error: "Missing ruling number" },
      { status: 400 }
    );
  }

  try {
    const getCachedRuling = unstable_cache(
      () => fetchRulingDetailFromCbp(rulingNumber),
      [`cross-ruling-detail-${rulingNumber}`],
      { revalidate: CACHE_TTL_SECONDS }
    );

    const data = await getCachedRuling();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS / 2}`,
      },
    });
  } catch (error) {
    console.error("Error fetching CROSS ruling detail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
