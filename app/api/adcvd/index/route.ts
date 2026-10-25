import { NextRequest, NextResponse } from "next/server"
import { HISTORY_DAYS, type MatchableCase } from "@/libs/adcvd/match"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
// Supabase reads go through fetch: never from Next's data cache (the lookups set their own HTTP caching)
export const fetchCache = "force-no-store"

// Every live (or recently ended) AD/CVD case's country and scope codes, for matching a whole
// catalog in the browser (the Tracker's chips): GET ?countries=CN,VN. Cached for an hour.

// The dates too, for the Sourcing tab's charts (when an order began)
const COLUMNS = "case_number, kind, country, product, status, initiated_on, order_on, ended_on, third_countries, hts_main, hts_also, hts_excluded, hts_outdated, hts_successors"

export async function GET(req: NextRequest) {
  const countries = (req.nextUrl.searchParams.get("countries") ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[A-Z]{2}$/.test(c))
    .slice(0, 60)
  if (!countries.length) return NextResponse.json({ cases: [] })
  const db = createAdminClient()
  const since = new Date(Date.now() - HISTORY_DAYS * 86_400_000).toISOString().slice(0, 10)
  const { data, error } = await db
    .from("adcvd_cases")
    .select(COLUMNS)
    .or(`country.in.(${countries.join(",")}),third_countries.ov.{${countries.join(",")}}`)
    .or(`status.in.(investigation,order,suspended,unknown),ended_on.gte.${since}`)
    .limit(5000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cases: (data ?? []) as MatchableCase[] }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } })
}
