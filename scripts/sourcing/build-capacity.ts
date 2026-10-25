// Builds public/data/sourcing/capacity/: which countries export each HS6 product to the whole
// world, how much, and whether they specialize in it, for the Tracker's Sourcing tab ("can they
// actually make it?"). One file per HS chapter, fetched only when the tab needs that chapter.
//
// Source: Harvard Growth Lab, Atlas of Economic Complexity, International Trade Data (HS 2022),
// hs22_country_product_year_6.csv (https://doi.org/10.7910/DVN/FTUUJU), licensed CC0 1.0. The
// Atlas asks to be cited, so the tab does wherever it shows these figures. Download the file from
// the Dataverse page, then: `npm run sourcing:capacity -- <path to the csv>`
//
// RCA (revealed comparative advantage) isn't in the 6-digit file, so it's worked out here the
// usual way (Balassa): the product's share of the country's exports over its share of world
// exports. Above 1, the country exports more of it than its "fair share": it specializes in it.
import { createReadStream, mkdirSync, writeFileSync } from "fs"
import { join } from "path"
import { createInterface } from "readline"
import countries from "i18n-iso-countries"

const OUT = join(__dirname, "../../public/data/sourcing/capacity")
// Countries kept per product, largest exporters first
const MAX_PER_CODE = 50

const file = process.argv[2]
if (!file) {
  console.error("Usage: npm run sourcing:capacity -- <hs22_country_product_year_6.csv>")
  process.exit(1)
}

const main = async () => {
  // year → iso2 → hs6 → exports (USD)
  const byYear = new Map<number, Map<string, Map<string, number>>>()
  const lines = createInterface({ input: createReadStream(file) })
  let header: string[] | null = null
  for await (const line of lines) {
    const cols = line.split(",")
    if (!header) {
      header = cols
      continue
    }
    const row = Object.fromEntries(header.map((h, i) => [h, cols[i]]))
    const iso2 = countries.alpha3ToAlpha2(row.country_iso3_code)
    const value = Number(row.export_value)
    // Atlas's own groupings ("ANS", undeclared) have no ISO code
    if (!iso2 || !(value > 0)) continue
    const year = Number(row.year)
    const countriesOf = byYear.get(year) ?? new Map<string, Map<string, number>>()
    const products = countriesOf.get(iso2) ?? new Map<string, number>()
    products.set(row.product_hs22_code, value)
    countriesOf.set(iso2, products)
    byYear.set(year, countriesOf)
  }

  const years = Array.from(byYear.keys()).sort()
  const year = years[years.length - 1]
  const prior = years[0]
  const now = byYear.get(year)!
  const before = byYear.get(prior)!

  // Each country's total exports, and the world's of each product, for RCA
  const countryTotal = new Map<string, number>()
  const productTotal = new Map<string, number>()
  const priorTotal = new Map<string, number>()
  let world = 0
  now.forEach((products, iso) =>
    products.forEach((value, code) => {
      countryTotal.set(iso, (countryTotal.get(iso) ?? 0) + value)
      productTotal.set(code, (productTotal.get(code) ?? 0) + value)
      world += value
    })
  )
  before.forEach((products) => products.forEach((value, code) => priorTotal.set(code, (priorTotal.get(code) ?? 0) + value)))

  // hs6 → [iso2, exports this year (thousands of USD), the prior year, RCA]
  const byCode = new Map<string, [string, number, number, number][]>()
  now.forEach((products, iso) =>
    products.forEach((value, code) => {
      const rca = value / countryTotal.get(iso)! / (productTotal.get(code)! / world)
      const list = byCode.get(code) ?? []
      list.push([iso, Math.round(value / 1000), Math.round((before.get(iso)?.get(code) ?? 0) / 1000), Math.round(rca * 100) / 100])
      byCode.set(code, list)
    })
  )

  // World exports of each product every year, for its trend
  const yearly = new Map<string, number[]>()
  years.forEach((y, i) =>
    byYear.get(y)!.forEach((products) =>
      products.forEach((value, code) => {
        const list = yearly.get(code) ?? years.map(() => 0)
        list[i] += value
        yearly.set(code, list)
      })
    )
  )

  const chapters = new Map<string, Record<string, { w: number; wp: number; wy: number[]; n: number; c: [string, number, number, number][] }>>()
  byCode.forEach((list, code) => {
    const chapter = code.slice(0, 2)
    const entry = chapters.get(chapter) ?? {}
    entry[code] = {
      w: Math.round(productTotal.get(code)! / 1000),
      wp: Math.round((priorTotal.get(code) ?? 0) / 1000),
      // Every year from the first to this one (meta.years)
      wy: (yearly.get(code) ?? []).map((v) => Math.round(v / 1000)),
      // How many countries specialize in it: few means a concentrated supply
      n: list.filter((c) => c[3] >= 1).length,
      c: list.sort((a, b) => b[1] - a[1]).slice(0, MAX_PER_CODE),
    }
    chapters.set(chapter, entry)
  })

  mkdirSync(OUT, { recursive: true })
  const meta = {
    source: "Harvard Growth Lab, Atlas of Economic Complexity (HS 2022)",
    url: "https://doi.org/10.7910/DVN/FTUUJU",
    license: "CC0 1.0",
    year,
    prior,
    years,
    unit: "thousands of USD",
    built: new Date().toISOString().slice(0, 10),
  }
  chapters.forEach((codes, chapter) => writeFileSync(join(OUT, `${chapter}.json`), JSON.stringify({ ...meta, codes })))
  writeFileSync(join(OUT, "meta.json"), `${JSON.stringify({ ...meta, chapters: Array.from(chapters.keys()).sort() }, null, 1)}\n`)
  console.log(`Wrote ${byCode.size.toLocaleString("en-US")} products in ${chapters.size} chapters (${year} vs ${prior}) to ${OUT}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
