import { NextResponse } from "next/server";
import { lookupProgramCode } from "@/libs/tariff-programs/lookup";

// The /tariffs pages' "Is my code on a list?" box: which tariff programs list an HTS code today
// (libs/tariff-programs/lookup.ts). Public, from the engine's data; cached for an hour per code.
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  const result = await lookupProgramCode(code);
  if (!result) return NextResponse.json({ error: "Enter a 4-, 6-, 8- or 10-digit HTS code" }, { status: 400 });
  return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
