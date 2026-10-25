import { NextRequest, NextResponse } from "next/server"
import { alpha2ToNumeric } from "i18n-iso-countries"
import stats from "@/libs/country-pages/import-stats.json"
import { bilateralUrl } from "@/libs/sourcing/storage"
import type { Bilateral, CrossSources, YearlyByCountry } from "@/libs/sourcing/trade"

// Other sources on who supplies a product, to set beside the US Census figures for one code
// (the Tracker's Sourcing tab): GET ?code=2903441010. All at the code's 6-digit group, the finest
// level they come at, so each compares like with like:
// - Every country's exports to the US and its other main destinations, each year, from the Harvard
//   Growth Lab's Atlas of Economic Complexity (its country-to-country bulk data, CC0, kept in
//   Supabase Storage). The Atlas reconciles what importers and exporters each report, so a country
//   the US data misses can still show here
// - US imports from every country in the same years from the Census Bureau, at the same 6 digits
// - EU imports from every country, the last two full years, from Eurostat's Comext (free reuse
//   with credit, except data declared by Switzerland and Liechtenstein, which Comext leaves out
//   of EU figures anyway)
// Cached for a day.

const DAY = 86_400
const CENSUS = "https://api.census.gov/data/timeseries/intltrade/imports/hs"
const COMEXT = "https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409"
const ISO_OF = new Map(Object.entries(stats.countries as Record<string, { census: string }>).map(([iso, c]) => [c.census, iso]))
// Comext's country codes that differ from ISO's
const COMEXT_ISO: Record<string, string> = { EL: "GR", UK: "GB" }

// Where each country's exports of the product go, from the Atlas's country-to-country bulk data
// (CC0), prepared per product and kept in Supabase Storage. The Atlas's live API is meant for
// stand-alone analysis, not for powering other applications, so it isn't called.
const bilateralOf = async (hs6: string): Promise<Bilateral | null> => {
  const response = await fetch(bilateralUrl(hs6), { next: { revalidate: DAY } })
  return response.ok ? response.json() : null
}

// Every country's exports of it to the US, by year (USD)
const toUs = (b: Bilateral): YearlyByCountry => ({
  years: b.years,
  byCountry: Object.fromEntries(
    Object.entries(b.e)
      .filter(([, x]) => x.d.US)
      .map(([iso, x]) => [iso, Object.fromEntries(b.years.map((y, i) => [y, x.d.US[i] * 1000]))])
  ),
})

// US imports of the 6-digit group from every country in each of those years, from Census
const censusByYear = async (hs6: string, years: number[]) => {
  const byCountry: Record<string, Record<number, number>> = {}
  await Promise.all(
    years.map(async (year) => {
      const query = new URLSearchParams({ get: "CTY_CODE,GEN_VAL_YR", I_COMMODITY: hs6, COMM_LVL: "HS6", time: `${year}-12` })
      if (process.env.CENSUS_API_KEY) query.set("key", process.env.CENSUS_API_KEY)
      const response = await fetch(`${CENSUS}?${query}`, { next: { revalidate: DAY } })
      if (!response.ok || response.status === 204) return
      const [header, ...rows] = (await response.json()) as string[][]
      rows.forEach((r) => {
        const iso = ISO_OF.get(r[header.indexOf("CTY_CODE")])
        if (iso) (byCountry[iso] ??= {})[year] = Number(r[header.indexOf("GEN_VAL_YR")]) || 0
      })
    })
  )
  return byCountry
}

// EU imports of the product from every country, the last two full years Comext has, in euros
const euImports = async (hs6: string) => {
  const year = new Date().getUTCFullYear()
  const query = new URLSearchParams({ format: "JSON", freq: "A", reporter: "EU27_2020", product: hs6, flow: "1", indicators: "VALUE_IN_EUROS" })
  ;[year - 2, year - 1].forEach((y) => query.append("time", String(y)))
  const response = await fetch(`${COMEXT}?${query}`, { next: { revalidate: DAY } })
  if (!response.ok) return null
  const body = (await response.json()) as {
    id: string[]
    size: number[]
    value: Record<string, number>
    dimension: Record<string, { category: { index: Record<string, number> } }>
  }
  if (!body.value) return null
  const at = (dim: string) => Object.fromEntries(Object.entries(body.dimension[dim].category.index).map(([k, v]) => [v, k]))
  const partners = at("partner")
  const times = at("time")
  const stride = body.size.map((_, i) => body.size.slice(i + 1).reduce((a, b) => a * b, 1))
  const pi = body.id.indexOf("partner")
  const ti = body.id.indexOf("time")
  const byCountry: Record<string, Record<number, number>> = {}
  const years = new Set<number>()
  Object.entries(body.value).forEach(([key, value]) => {
    const k = Number(key)
    const code = partners[Math.floor(k / stride[pi]) % body.size[pi]]
    const iso = COMEXT_ISO[code] ?? code
    // Two-letter countries only: not the EU, extra-EU or world totals
    if (!/^[A-Z]{2}$/.test(iso) || !alpha2ToNumeric(iso)) return
    const y = Number(times[Math.floor(k / stride[ti]) % body.size[ti]])
    years.add(y)
    ;(byCountry[iso] ??= {})[y] = value
  })
  return { years: Array.from(years).sort(), byCountry }
}

export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") ?? "").replace(/\D/g, "")
  if (code.length < 6) return NextResponse.json({ error: "An HTS code is needed" }, { status: 400 })
  const hs6 = code.slice(0, 6)
  const [bilateral, eu] = await Promise.all([bilateralOf(hs6).catch((): null => null), euImports(hs6).catch((): null => null)])
  const atlas = bilateral ? toUs(bilateral) : null
  const census = atlas ? await censusByYear(hs6, atlas.years).catch(() => ({})) : {}
  const body: CrossSources = {
    group: `${hs6.slice(0, 4)}.${hs6.slice(4, 6)}`,
    atlas,
    bilateral,
    census: atlas ? { years: atlas.years, byCountry: census } : null,
    eu,
  }
  return NextResponse.json(body, { headers: { "Cache-Control": `public, s-maxage=${DAY}, stale-while-revalidate=${DAY * 7}` } })
}
