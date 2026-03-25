import { NextResponse, NextRequest } from "next/server";
import { unstable_cache } from "next/cache";
import { CrossRuling } from "../../../interfaces/cross-rulings";

export const dynamic = "force-dynamic";

const CACHE_TTL_SECONDS = 8 * 60 * 60; // 8 hours

async function fetchRulingsFromCbp(term: string): Promise<CrossRuling[]> {
  const url = `https://rulings.cbp.gov/api/search?term=${encodeURIComponent(term)}&sortBy=RELEVANCE`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CBP API returned ${response.status}`);
  }

  const data = await response.json();
  const results: CrossRuling[] = data?.rulings ?? [];
  return results.filter(
    (item) =>
      item.categories && item.categories.toLowerCase().includes("classification")
  );
}

export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get("term");

  if (!term) {
    return NextResponse.json(
      { error: "Missing required query parameter: term" },
      { status: 400 }
    );
  }

  try {
    const getCachedRulings = unstable_cache(
      () => fetchRulingsFromCbp(term),
      [`cross-rulings-search-${term}`],
      { revalidate: CACHE_TTL_SECONDS }
    );

    const rulings = await getCachedRulings();

    return NextResponse.json(rulings, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS / 2}`,
      },
    });
  } catch (error) {
    console.error("Error fetching CROSS rulings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
