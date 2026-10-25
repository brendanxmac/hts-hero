import { NextRequest, NextResponse } from "next/server";
import type { CitedVersion, NoteFile } from "@/components/duty-calculator/referenced-notes/noteFiles";

// One cited Chapter 99 note subdivision, in force on a date, from public/data/notes (written by
// `npm run notes:cited`). Some note files are megabytes (every version of a long list), so a
// savings question asks here for the one passage it shows instead of downloading the file.
//   GET /api/general-notes/cited?file=sub-III-41&key=sub-III/us-notes/41(a)&asOf=2026-10-23

const FILE = /^sub-[IVX]+-\d{1,3}$/;

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file") ?? "";
  const key = req.nextUrl.searchParams.get("key") ?? "";
  const asOf = req.nextUrl.searchParams.get("asOf") ?? new Date().toISOString().slice(0, 10);
  if (!FILE.test(file) || !key) return NextResponse.json({ error: "Unknown note" }, { status: 400 });

  // The public file, through the CDN, cached a day
  const response = await fetch(new URL(`/data/notes/${file}.json`, req.nextUrl.origin), { next: { revalidate: 86400 } });
  if (!response.ok) return NextResponse.json({ error: "Note not found" }, { status: 404 });
  const versions = ((await response.json()) as NoteFile)[key];
  if (!versions?.length) return NextResponse.json({ error: "Citation not found" }, { status: 404 });
  const version: CitedVersion = versions.find((v) => v.from <= asOf && (!v.to || asOf < v.to)) ?? versions[versions.length - 1];
  return NextResponse.json({ [key]: [version] } satisfies NoteFile, { headers: { "Cache-Control": "public, max-age=86400" } });
}
