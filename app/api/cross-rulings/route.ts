import { NextResponse, NextRequest } from "next/server";
import { CROSS_CACHE_TTL_SECONDS, getCachedRulings } from "@/libs/cross-rulings-server";

export const dynamic = "force-dynamic";

const CACHE_TTL_SECONDS = CROSS_CACHE_TTL_SECONDS;

export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get("term");

  if (!term) {
    return NextResponse.json(
      { error: "Missing required query parameter: term" },
      { status: 400 }
    );
  }

  try {
    const rulings = await getCachedRulings(term);

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
