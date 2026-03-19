import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours (static HTS structure data)

async function loadSectionsAndChapters(): Promise<unknown> {
  const filePath = path.join(process.cwd(), "sections-and-chapters.json");
  const sectionData = await readFile(filePath, "utf8");
  return JSON.parse(sectionData);
}

export async function GET() {
  try {
    const getCachedSections = unstable_cache(
      loadSectionsAndChapters,
      ["hts-sections-and-chapters"],
      { revalidate: CACHE_TTL_SECONDS }
    );

    const data = await getCachedSections();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS / 2}`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
