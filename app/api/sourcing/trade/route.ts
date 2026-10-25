import { NextRequest, NextResponse } from "next/server"
import stats from "@/libs/country-pages/import-stats.json"
import { emptyTotals, LEVEL_DIGITS, TradeCountry, TradeData, TradeLevel, TradeTotals } from "@/libs/sourcing/trade"

// What the US imported of one HTS code, by country, straight from the Census Bureau's
// international trade API: GET ?code=8471300100&level=HS10|HS8|HS6. For the Tracker's Sourcing tab
// (libs/sourcing/trade.ts). Every month of the last three years at the level asked for (the code,
// every code under its 8 digits, its 6-digit subheading): value, freight and insurance, by vessel
// and air, quantity; where it entered in the last full year for the largest suppliers; and which
// countries ship the subheading under neighboring codes. Cached for a day: Census publishes once a
// month.
//
// Census answers a wildcard over every country slowly (40s for a big subheading), so the route
// only asks it quick questions, in parallel: one code or one subheading for every country, or a
// wildcard for one country, or for every country together ("-").

const API = "https://api.census.gov/data/timeseries/intltrade/imports/hs"
const MONTHS = 36
const MONTH_FIELDS = ["GEN_VAL_MO", "GEN_CHA_MO", "VES_VAL_MO", "VES_CHA_MO", "AIR_VAL_MO", "AIR_CHA_MO", "CON_VAL_MO", "CON_QY1_MO"]
const DAY = 86_400
// Suppliers whose ports of entry are looked up
const DISTRICT_COUNTRIES = 15
// Countries listed as shipping it under neighboring codes
const ELSEWHERE_COUNTRIES = 6
const LEVELS: TradeLevel[] = ["HS10", "HS8", "HS6"]

// Census country codes → ISO 2-letter codes (groupings like "Pacific Rim" have none and are skipped)
const ISO_OF = new Map(Object.entries(stats.countries as Record<string, { census: string }>).map(([iso, c]) => [c.census, iso]))
const CENSUS_OF = new Map(Array.from(ISO_OF.entries()).map(([cty, iso]) => [iso, cty]))

const census = async (params: Record<string, string>): Promise<string[][] | null> => {
  const query = new URLSearchParams(params)
  if (process.env.CENSUS_API_KEY) query.set("key", process.env.CENSUS_API_KEY)
  // The API wants the "+" in "from+2023-09" and the "*" of a wildcard as they are
  const response = await fetch(`${API}?${query.toString().replace(/%2B/g, "+").replace(/%2A/g, "*")}`, { next: { revalidate: DAY } })
  if (response.status === 204) return null
  if (!response.ok) throw new Error(`Census ${response.status}`)
  return response.json()
}

const monthsBack = (count: number) => {
  const d = new Date()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() - count)
  return d.toISOString().slice(0, 7)
}

const at = (header: string[], row: string[]) => (name: string) => row[header.indexOf(name)]
const rowsOf = (found: string[][] | null) => (found ? found.slice(1).map((r) => at(found[0], r)) : [])

// Every month of one code (HS10) or one subheading (HS6), for every country
const detailOf = (commodity: string) =>
  census({
    get: ["CTY_CODE", ...MONTH_FIELDS, "UNIT_QY1"].join(","),
    I_COMMODITY: commodity,
    COMM_LVL: commodity.length === 6 ? "HS6" : "HS10",
    time: `from+${monthsBack(MONTHS + 3)}`,
  })

export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") ?? "").replace(/\D/g, "")
  if (!/^\d{10}$/.test(code)) return NextResponse.json({ error: "A 10-digit HTS code is needed" }, { status: 400 })
  const asked = req.nextUrl.searchParams.get("level") as TradeLevel | null
  const requested: TradeLevel = asked && LEVELS.includes(asked) ? asked : "HS10"
  const sub = code.slice(0, 6)

  try {
    const recent = `from+${monthsBack(15)}`
    // Quick first: each code under the subheading, every country together; the subheading by
    // country; the code's own value and quantity, every country together
    const [codesFound, subFound, exactFound] = await Promise.all([
      census({ get: "I_COMMODITY,GEN_VAL_MO", I_COMMODITY: `${sub}*`, COMM_LVL: "HS10", CTY_CODE: "-", time: recent }),
      census({ get: "CTY_CODE,GEN_VAL_MO", I_COMMODITY: sub, COMM_LVL: "HS6", time: recent }),
      census({ get: "CON_VAL_MO,CON_QY1_MO,UNIT_QY1", I_COMMODITY: code, COMM_LVL: "HS10", CTY_CODE: "-", time: recent }).catch((): null => null),
    ])
    if (!codesFound) return NextResponse.json({ error: "Census has no figures for this code" }, { status: 404, headers: { "Cache-Control": `public, s-maxage=${DAY}` } })

    // The last 12 months Census has, by the subheading's codes
    const codeRows = rowsOf(codesFound)
    const recentMonths = Array.from(new Set(codeRows.map((g) => g("time")))).sort().slice(-12)
    const inRecent = new Set(recentMonths)
    const codeTotals = new Map<string, number>()
    codeRows.forEach((g) => {
      if (inRecent.has(g("time"))) codeTotals.set(g("I_COMMODITY"), (codeTotals.get(g("I_COMMODITY")) ?? 0) + (Number(g("GEN_VAL_MO")) || 0))
    })
    const codes = Array.from(codeTotals.entries())
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])

    // The level asked for, or the next one up when the code (or its 8 digits) had no imports in
    // the last 12 months
    const inScope = (lvl: TradeLevel) => (c: string) => c.startsWith(code.slice(0, LEVEL_DIGITS[lvl]))
    const level = LEVELS.slice(LEVELS.indexOf(requested)).find((lvl) => codes.some(([c]) => inScope(lvl)(c))) ?? "HS6"
    const scoped = inScope(level)
    const scopeCodes = level === "HS6" ? [sub] : level === "HS10" ? [code] : codes.map(([c]) => c).filter(scoped)

    // Every month at that level: the code, the subheading, or each code under the 8 digits
    const detailRows = (await Promise.all(scopeCodes.map(detailOf))).flatMap(rowsOf)
    const latest = detailRows.map((g) => g("time")).sort().pop() ?? recentMonths[recentMonths.length - 1]
    const months = Array.from({ length: MONTHS }, (_, i) => {
      const d = new Date(`${latest}-01T00:00:00Z`)
      d.setUTCMonth(d.getUTCMonth() - (MONTHS - 1 - i))
      return d.toISOString().slice(0, 7)
    })
    const lastTwelve = new Set(months.slice(-12))
    const priorTwelve = new Set(months.slice(-24, -12))

    // One unit of quantity across the codes shown, or none when they count differently
    const units = new Set(detailRows.map((g) => g("UNIT_QY1")).filter((u) => u && u !== "-" && u !== "X"))
    const unit = units.size === 1 ? Array.from(units)[0] : null

    const blank = (): Omit<TradeCountry, "districts"> => ({ last: emptyTotals(), prior: 0, monthly: months.map(() => 0) })
    const byCountry = new Map<string, Omit<TradeCountry, "districts">>()
    const total = blank()
    detailRows.forEach((get) => {
      const month = get("time")
      const index = months.indexOf(month)
      if (index < 0) return
      const cty = get("CTY_CODE")
      // "-" is every country together; four digits below 1000 are groupings
      const iso = cty === "-" ? null : ISO_OF.get(cty)
      if (cty !== "-" && !iso) return
      const entry = iso ? (byCountry.get(iso) ?? blank()) : total
      const n = (name: string) => Number(get(name)) || 0
      entry.monthly[index] += n("GEN_VAL_MO")
      if (lastTwelve.has(month)) {
        const t: TradeTotals = entry.last
        t.value += n("GEN_VAL_MO")
        t.charges += n("GEN_CHA_MO")
        t.vesVal += n("VES_VAL_MO")
        t.vesCha += n("VES_CHA_MO")
        t.airVal += n("AIR_VAL_MO")
        t.airCha += n("AIR_CHA_MO")
        t.conVal += n("CON_VAL_MO")
        // Quantities only add up in one unit
        if (unit) t.qty += n("CON_QY1_MO")
      }
      if (priorTwelve.has(month)) entry.prior += n("GEN_VAL_MO")
      if (iso) byCountry.set(iso, entry)
    })

    // The code's own average unit value, every country together
    const exact = { unit: null as string | null, conVal: 0, qty: 0 }
    rowsOf(exactFound).forEach((g) => {
      if (!inRecent.has(g("time"))) return
      const u = g("UNIT_QY1")
      if (u && u !== "X" && u !== "-") exact.unit = u
      exact.conVal += Number(g("CON_VAL_MO")) || 0
      exact.qty += Number(g("CON_QY1_MO")) || 0
    })

    // Countries shipping the subheading under codes beyond the level shown, and little or none under
    // it: the subheading's last 12 months by country less the level's, then the codes they used,
    // one wildcard per country
    const elsewhere: Record<string, [string, number][]> = {}
    if (level !== "HS6") {
      const subByCountry = new Map<string, number>()
      rowsOf(subFound).forEach((g) => {
        const iso = ISO_OF.get(g("CTY_CODE"))
        if (iso && inRecent.has(g("time"))) subByCountry.set(iso, (subByCountry.get(iso) ?? 0) + (Number(g("GEN_VAL_MO")) || 0))
      })
      const beyond = Array.from(subByCountry.entries())
        .map(([iso, v]): [string, number] => [iso, v - (byCountry.get(iso)?.last.value ?? 0)])
        // Only countries all but missing from the level shown: the ones the page would otherwise
        // seem not to know about
        .filter(([iso, v]) => v > 1000 && (byCountry.get(iso)?.last.value ?? 0) < v * 0.1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, ELSEWHERE_COUNTRIES)
      await Promise.all(
        beyond.map(async ([iso]) => {
          const found = await census({ get: "I_COMMODITY,GEN_VAL_MO", I_COMMODITY: `${sub}*`, COMM_LVL: "HS10", CTY_CODE: CENSUS_OF.get(iso)!, time: recent }).catch((): null => null)
          const sums = new Map<string, number>()
          rowsOf(found).forEach((g) => {
            if (inRecent.has(g("time")) && !scoped(g("I_COMMODITY"))) sums.set(g("I_COMMODITY"), (sums.get(g("I_COMMODITY")) ?? 0) + (Number(g("GEN_VAL_MO")) || 0))
          })
          const list = Array.from(sums.entries())
            .filter(([, v]) => v > 0)
            .sort((a, b) => b[1] - a[1])
          if (list.length) elsewhere[iso] = list
        })
      )
    }

    // Where it entered, in the last full year: Census breaks it down by district only for one
    // country at a time, so for the largest suppliers (the ones worth comparing)
    const districtYear = Number(latest.slice(0, 4)) - 1
    const largest = Array.from(byCountry.entries())
      .sort((a, b) => b[1].last.value - a[1].last.value)
      .slice(0, DISTRICT_COUNTRIES)
      .map(([iso]) => iso)
    const districtQuery =
      level === "HS6" ? { I_COMMODITY: sub, COMM_LVL: "HS6" } : { I_COMMODITY: level === "HS10" ? code : `${code.slice(0, 8)}*`, COMM_LVL: "HS10" }
    const districts = new Map<string, [string, number][]>()
    await Promise.all(
      largest.map(async (iso) => {
        const found: string[][] | null = await census({
          get: "DISTRICT,DIST_NAME,GEN_VAL_YR",
          ...districtQuery,
          CTY_CODE: CENSUS_OF.get(iso)!,
          time: `${districtYear}-12`,
        }).catch((): null => null)
        // Summed by district (an 8-digit level has several codes); "-" is the total for all districts
        const sums = new Map<string, number>()
        rowsOf(found)
          .filter((get) => get("DISTRICT") !== "-" && Number(get("GEN_VAL_YR")) > 0)
          .forEach((get) => sums.set(get("DIST_NAME"), (sums.get(get("DIST_NAME")) ?? 0) + Number(get("GEN_VAL_YR"))))
        districts.set(iso, Array.from(sums.entries()))
      })
    )

    const countries: Record<string, TradeCountry> = {}
    byCountry.forEach((c, iso) => {
      if (!(c.last.value > 0 || c.prior > 0 || c.monthly.some((v) => v > 0))) return
      const list = (districts.get(iso) ?? []).sort((a, b) => b[1] - a[1])
      const sum = list.reduce((s, [, v]) => s + v, 0)
      countries[iso] = { ...c, districts: list.slice(0, 3).map(([name, v]) => [titleCase(name), Math.round((v / sum) * 1000) / 1000]) }
    })

    const body: TradeData = {
      code,
      level,
      requested,
      exact: exact.conVal > 0 ? exact : null,
      codes,
      elsewhere,
      unit,
      months,
      districtYear,
      total,
      countries,
      retrieved: new Date().toISOString().slice(0, 10),
    }
    return NextResponse.json(body, { headers: { "Cache-Control": `public, s-maxage=${DAY}, stale-while-revalidate=${DAY * 7}` } })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 })
  }
}

// "LOS ANGELES, CA" → "Los Angeles, CA"
const titleCase = (name: string) => {
  const [place, ...state] = name.split(",")
  return [place.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()), ...state].join(",")
}
