import { NextResponse } from "next/server";
import { headingProfile } from "@/libs/tariff-programs/heading";
import { codeInfoFor } from "@/libs/tariff-programs/codeLinks";

// The search box on a Chapter 99 page's covered codes: every code the heading lists, with its link
// and name. The page itself lists the first COVERED_CODES_SHOWN; this is the rest, fetched only when
// someone searches. Public, from the engine's data; cached for a day per heading.
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  const profile = /^99\d\d\.\d\d\.\d\d$/.test(code) ? headingProfile(code) : null;
  if (!profile) return NextResponse.json({ error: "Not a modeled Chapter 99 heading" }, { status: 404 });
  const info = await codeInfoFor(profile.coverage.codes);
  const codes = profile.coverage.codes.map((c) => ({ code: c, href: info[c]?.href ?? null, name: info[c]?.name }));
  return NextResponse.json({ codes }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
}
