import { NextResponse, NextRequest } from "next/server";
import { unstable_cache } from "next/cache";
import { normalizeRulingNumber } from "@/libs/cross-rulings";

export const dynamic = "force-dynamic";

// One CBP ruling by its number, for a user who named it (pasted it, or opened one they saved).
// CBP's own CROSS site reads rulings this way without a reCAPTCHA token. We only ever ask for the
// number the user gave (plus the "W" form CBP's help suggests for older numbers), never step through
// numbers, and keep what CBP returns for 8 hours so repeat views don't ask again.

const CACHE_TTL_SECONDS = 8 * 60 * 60; // 8 hours, as CBP's rulings rarely change

class RulingNotFound extends Error {}

async function fetchRulingFromCbp(rulingNumber: string): Promise<unknown> {
  const response = await fetch(`https://rulings.cbp.gov/api/ruling/${encodeURIComponent(rulingNumber)}`);
  if (response.status === 404) throw new RulingNotFound(rulingNumber);
  if (!response.ok) throw new Error(`CBP API returned ${response.status}`);
  return response.json();
}

// Errors aren't cached: a ruling that isn't found, or a CBP hiccup, is asked again next time
const getCachedRuling = (rulingNumber: string) =>
  unstable_cache(() => fetchRulingFromCbp(rulingNumber), [`cross-ruling-detail-${rulingNumber}`], {
    revalidate: CACHE_TTL_SECONDS,
  })();

export async function GET(_req: NextRequest, props: { params: Promise<{ rulingNumber: string }> }) {
  const { rulingNumber: raw } = await props.params;
  const rulingNumber = normalizeRulingNumber(decodeURIComponent(raw ?? ""));

  if (!rulingNumber) {
    return NextResponse.json({ error: "Not a CBP ruling number" }, { status: 400 });
  }

  // CBP's help: an older number that isn't found may need a "W" in front
  const attempts = /^\d+$/.test(rulingNumber) ? [rulingNumber, `W${rulingNumber}`] : [rulingNumber];

  try {
    for (const attempt of attempts) {
      try {
        const data = await getCachedRuling(attempt);
        return NextResponse.json(data, {
          headers: {
            "Cache-Control": `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS / 2}`,
          },
        });
      } catch (error) {
        if (!(error instanceof RulingNotFound)) throw error;
      }
    }
    return NextResponse.json({ error: "No ruling with that number" }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching CROSS ruling ${rulingNumber}:`, error);
    return NextResponse.json({ error: "CBP couldn't return this ruling right now" }, { status: 502 });
  }
}
