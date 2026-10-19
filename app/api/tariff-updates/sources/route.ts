import { NextRequest, NextResponse } from "next/server"
import { getPublishedUpdate } from "@/libs/tariff-updates/public"

// One published tariff update's official sources, oldest first: the stage each moved it to, its
// date, title and link. The same public facts its /tariff-updates page shows, for the Tracker's
// timeline of where an action stands.
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 })
  const found = await getPublishedUpdate(slug)
  if (!found) return NextResponse.json({ sources: [] }, { status: 404 })
  const sources = found.sources.map(({ stage, published_at, title, url, source }) => ({ stage, published_at, title, url, source }))
  return NextResponse.json({ sources }, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } })
}
