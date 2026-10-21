// Regenerates libs/country-pages/import-stats.json: what the US imports from each country, from
// the Census Bureau's "U.S. Trade in Goods by Country" pages (one per country, monthly figures).
// Run after Census publishes a month (early each month): `npm run sync-country-imports`
import { writeFileSync } from "fs"
import { join } from "path"

const BASE = "https://www.census.gov/foreign-trade"
const CODES_URL = `${BASE}/schedules/c/countrycode.html`
const countryUrl = (census: string) => `${BASE}/balance/c${census}.html`
// The all-countries total
const WORLD = "0004"

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const get = async (url: string) => {
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (HTS Hero import stats)" } })
  if (!response.ok) throw new Error(`${url}: ${response.status}`)
  return response.text()
}

// The page as "|"-separated text cells
const cells = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, "|")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\|\s*\|+/g, "|")
    .replace(/\s+/g, " ")

const num = (s: string) => Number(s.replace(/,/g, ""))

// Imports by month for a year, in millions of USD: [January, February, …] for the months published
const monthlyImports = (text: string, year: number) =>
  MONTHS.flatMap((month) => {
    const m = text.match(new RegExp(`\\| ${month} ${year} \\| ([\\d,.]+) \\| ([\\d,.]+) \\|`))
    return m ? [num(m[2])] : []
  })

const sum = (values: number[]) => Math.round(values.reduce((a, b) => a + b, 0) * 10) / 10

interface YearStats {
  imports2024: number | null
  imports2025: number | null
  // This year so far, and the same months of last year
  importsYtd: number | null
  importsYtdPriorYear: number | null
}

const yearStats = (text: string, ytdYear: number, ytdMonths: number): YearStats => {
  const y24 = monthlyImports(text, 2024)
  const y25 = monthlyImports(text, 2025)
  const ytd = monthlyImports(text, ytdYear)
  return {
    imports2024: y24.length === 12 ? sum(y24) : null,
    imports2025: y25.length === 12 ? sum(y25) : null,
    importsYtd: ytd.length ? sum(ytd) : null,
    importsYtdPriorYear: y25.length >= ytdMonths ? sum(y25.slice(0, ytdMonths)) : null,
  }
}

const main = async () => {
  const codes = Array.from(
    cells(await get(CODES_URL)).matchAll(/\|\s*([A-Z][^|]{1,80}?)\s*\|\s*(\d{4})\s*\|\s*([A-Z]{2})\s*\|/g)
  )
    .map(([, name, census, iso]) => ({ name: name.trim(), census, iso }))
    .filter((c, i, all) => c.iso !== "US" && all.findIndex((x) => x.iso === c.iso) === i)

  // How far this year's figures go, from the all-countries page
  const ytdYear = new Date().getFullYear()
  const worldText = cells(await get(countryUrl(WORLD)))
  const ytdMonths = monthlyImports(worldText, ytdYear).length
  const world = yearStats(worldText, ytdYear, ytdMonths)

  const countries: Record<string, YearStats & { name: string; census: string }> = {}
  for (const c of codes) {
    try {
      countries[c.iso] = { name: c.name, census: c.census, ...yearStats(cells(await get(countryUrl(c.census))), ytdYear, ytdMonths) }
    } catch {
      // Not every code has a page (territories, retired codes)
    }
    await new Promise((r) => setTimeout(r, 250))
  }

  // Rank by last full year's imports
  Object.entries(countries)
    .filter(([, c]) => c.imports2025)
    .sort(([, a], [, b]) => (b.imports2025 ?? 0) - (a.imports2025 ?? 0))
    .forEach(([iso], i) => Object.assign(countries[iso], { rank2025: i + 1 }))

  const out = {
    source: {
      name: "U.S. Census Bureau, U.S. Trade in Goods by Country",
      url: `${BASE}/balance/index.html`,
      retrieved: new Date().toISOString().slice(0, 10),
    },
    unit: "millions of USD, general imports, not seasonally adjusted",
    ytd: { year: ytdYear, months: ytdMonths, through: `${MONTHS[ytdMonths - 1]} ${ytdYear}` },
    world,
    countries,
  }
  const path = join(__dirname, "../libs/country-pages/import-stats.json")
  writeFileSync(path, `${JSON.stringify(out, null, 1)}\n`)
  console.log(`Wrote ${Object.keys(countries).length} countries, ${ytdYear} through ${out.ytd.through}, to ${path}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
