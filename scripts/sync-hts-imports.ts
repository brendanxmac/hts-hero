// Regenerates public/data/us-imports/: which countries the US imports each HTS code from, and how
// much, from the Census Bureau's international trade API (general imports by HS10 and country).
// One file per HTS chapter, fetched by the calculator only when it needs that chapter (the
// Compare tab's proven suppliers, the HTS code pages), and each country's top products
// (libs/country-pages/top-imports.json, for the country pages). Needs CENSUS_API_KEY in .env.local.
// Run after Census publishes a year's December figures, or monthly: `npm run sync-hts-imports`
// `--from-files` rebuilds top-imports.json from the chapter files already there, without calling
// the API.
//
// Census terms (https://www.census.gov/data/developers/about/terms-of-service.html): show the
// attribution notice wherever this is used, don't alter the figures while crediting Census, and
// never use them to identify a business. These are published country-by-product totals only.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import stats from "../libs/country-pages/import-stats.json"

const API = "https://api.census.gov/data/timeseries/intltrade/imports/hs"
// Countries kept per code, largest first
const MAX_PER_CODE = 60
const OUT = join(__dirname, "../public/data/us-imports")
const TOP_IMPORTS = join(__dirname, "../libs/country-pages/top-imports.json")
// Products kept per country, largest first (the pages filter out fuels and precious metals)
const MAX_PER_COUNTRY = 40

// Each country's largest products by US imports: country → [code, thousands of USD, the year before]
const writeTopImports = (byCode: Map<string, [string, number, number][]>, year: number, prior: number) => {
  const byCountry: Record<string, [string, number, number][]> = {}
  byCode.forEach((list, code) =>
    list.forEach(([iso, value, before]) => (byCountry[iso] ??= []).push([code, value, before]))
  )
  Object.keys(byCountry).forEach((iso) => {
    byCountry[iso] = byCountry[iso].sort((a, b) => b[1] - a[1]).slice(0, MAX_PER_COUNTRY)
  })
  writeFileSync(
    TOP_IMPORTS,
    `${JSON.stringify({ source: "U.S. Census Bureau, general imports by HS10 and country", year, prior, unit: "thousands of USD", countries: byCountry })}\n`
  )
  console.log(`Wrote top products for ${Object.keys(byCountry).length} countries to ${TOP_IMPORTS}`)
}

if (existsSync(".env.local")) process.loadEnvFile(".env.local")
const KEY = process.env.CENSUS_API_KEY
if (!KEY && !process.argv.includes("--from-files")) {
  console.error("CENSUS_API_KEY must be set (.env.local). Get one free at https://api.census.gov/data/key_signup.html")
  process.exit(1)
}

// A country's imports for a whole year, by HS10 code, in USD (December's year-to-date figure)
const yearImports = async (census: string, year: number): Promise<Map<string, number>> => {
  const url = `${API}?get=I_COMMODITY,GEN_VAL_YR&CTY_CODE=${census}&COMM_LVL=HS10&time=${year}-12&key=${KEY}`
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url)
    // No rows for this country and year
    if (response.status === 204) return new Map()
    if (response.ok) {
      const rows = (await response.json()) as string[][]
      return new Map(rows.slice(1).map(([code, value]) => [code, Number(value)]))
    }
    if (attempt >= 3) throw new Error(`${census} ${year}: ${response.status}`)
    await new Promise((r) => setTimeout(r, 2000 * attempt))
  }
}

const main = async () => {
  if (process.argv.includes("--from-files")) {
    // Thousands of USD already, as the chapter files store them
    const byCode = new Map<string, [string, number, number][]>()
    let year = 0
    let prior = 0
    readdirSync(OUT)
      .filter((f) => /^\d\d\.json$/.test(f))
      .forEach((f) => {
        const file = JSON.parse(readFileSync(join(OUT, f), "utf8")) as { year: number; prior: number; codes: Record<string, [string, number, number][]> }
        year = file.year
        prior = file.prior
        Object.entries(file.codes).forEach(([code, list]) => byCode.set(code, list))
      })
    writeTopImports(byCode, year, prior)
    return
  }

  // The last full year Census has published, and the one before it, for the trend
  const year = Number(process.argv[2]) || new Date().getFullYear() - 1
  const prior = year - 1
  const countries = Object.entries(stats.countries as Record<string, { name: string; census: string }>)

  // code → [country, value this year, value the year before]
  const byCode = new Map<string, [string, number, number][]>()
  let done = 0
  for (const [iso, c] of countries) {
    try {
      const [now, before] = await Promise.all([yearImports(c.census, year), yearImports(c.census, prior)])
      now.forEach((value, code) => {
        if (!(value > 0)) return
        const list = byCode.get(code) ?? []
        list.push([iso, value, before.get(code) ?? 0])
        byCode.set(code, list)
      })
    } catch (error) {
      console.warn(`Skipped ${c.name}: ${(error as Error).message}`)
    }
    done++
    if (done % 25 === 0) console.log(`${done}/${countries.length} countries`)
    await new Promise((r) => setTimeout(r, 150))
  }

  // One file per chapter, values in thousands of USD to keep them small
  const chapters = new Map<string, Record<string, [string, number, number][]>>()
  byCode.forEach((list, code) => {
    const chapter = code.slice(0, 2)
    const entry = chapters.get(chapter) ?? {}
    entry[code] = list
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_PER_CODE)
      .map(([iso, value, before]) => [iso, Math.round(value / 1000), Math.round(before / 1000)])
    chapters.set(chapter, entry)
  })

  mkdirSync(OUT, { recursive: true })
  const meta = {
    source: "U.S. Census Bureau, international trade data (general imports by HS10 and country)",
    url: "https://www.census.gov/foreign-trade/data/index.html",
    year,
    prior,
    unit: "thousands of USD",
    retrieved: new Date().toISOString().slice(0, 10),
  }
  chapters.forEach((codes, chapter) => writeFileSync(join(OUT, `${chapter}.json`), JSON.stringify({ ...meta, codes })))
  const inThousands = new Map<string, [string, number, number][]>()
  chapters.forEach((codes) => Object.entries(codes).forEach(([code, list]) => inThousands.set(code, list)))
  writeTopImports(inThousands, year, prior)
  writeFileSync(join(OUT, "meta.json"), `${JSON.stringify({ ...meta, chapters: Array.from(chapters.keys()).sort() }, null, 1)}\n`)
  console.log(`Wrote ${byCode.size.toLocaleString("en-US")} codes in ${chapters.size} chapters (${year} vs ${prior}) to ${OUT}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
