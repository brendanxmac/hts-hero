import { NextRequest, NextResponse } from "next/server"
import stats from "@/libs/country-pages/import-stats.json"
import type { RelatedCode } from "@/libs/sourcing/trade"

// US imports of the other codes a product's AD/CVD cases cover (R-125's orders name its blends
// under 3827.xx too), for the Tracker's Sourcing tab: GET ?codes=382763,3827640000 (6 to 10
// digits, at most 8). Each code's last 12 months, all countries and the largest suppliers, from
// the Census Bureau's international trade API. Cached for a day.

const API = "https://api.census.gov/data/timeseries/intltrade/imports/hs"
const DAY = 86_400
const MAX_CODES = 8
const TOP = 4

const ISO_OF = new Map(Object.entries(stats.countries as Record<string, { census: string }>).map(([iso, c]) => [c.census, iso]))

const monthsBack = (count: number) => {
  const d = new Date()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() - count)
  return d.toISOString().slice(0, 7)
}

const lastYear = async (code: string): Promise<RelatedCode | null> => {
  const query = new URLSearchParams({
    get: "CTY_CODE,GEN_VAL_MO",
    // A 6-digit subheading as itself; longer codes as every 10-digit code under them
    I_COMMODITY: code.length === 6 ? code : `${code}*`,
    COMM_LVL: code.length === 6 ? "HS6" : "HS10",
    time: `from+${monthsBack(16)}`,
  })
  if (process.env.CENSUS_API_KEY) query.set("key", process.env.CENSUS_API_KEY)
  const response = await fetch(`${API}?${query.toString().replace(/%2B/g, "+").replace(/%2A/g, "*")}`, { next: { revalidate: DAY } })
  if (response.status === 204) return { code, total: 0, top: [] }
  if (!response.ok) return null
  const [header, ...rows] = (await response.json()) as string[][]
  const col = (name: string) => header.indexOf(name)
  const months = Array.from(new Set(rows.map((r) => r[col("time")]))).sort().slice(-12)
  const inYear = new Set(months)
  let total = 0
  const byCountry = new Map<string, number>()
  rows.forEach((r) => {
    if (!inYear.has(r[col("time")])) return
    const value = Number(r[col("GEN_VAL_MO")]) || 0
    const cty = r[col("CTY_CODE")]
    if (cty === "-") total += value
    const iso = ISO_OF.get(cty)
    if (iso) byCountry.set(iso, (byCountry.get(iso) ?? 0) + value)
  })
  const top = Array.from(byCountry.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP)
  return { code, total, top, through: months[months.length - 1] }
}

export async function GET(req: NextRequest) {
  const codes = Array.from(
    new Set(
      (req.nextUrl.searchParams.get("codes") ?? "")
        .split(",")
        .map((c) => c.replace(/\D/g, ""))
        .filter((c) => c.length >= 6 && c.length <= 10)
    )
  ).slice(0, MAX_CODES)
  if (!codes.length) return NextResponse.json({ codes: [] })
  try {
    const found = (await Promise.all(codes.map(lastYear))).filter((c): c is RelatedCode => Boolean(c))
    return NextResponse.json({ codes: found }, { headers: { "Cache-Control": `public, s-maxage=${DAY}, stale-while-revalidate=${DAY * 7}` } })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 })
  }
}
