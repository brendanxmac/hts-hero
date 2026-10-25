// Builds libs/sourcing/governance.json: each country's World Bank governance scores and its
// logistics score, for the Tracker's Sourcing tab ("can I rely on sourcing there?").
//
// Sources, both from the World Bank's API and licensed CC BY 4.0 (credited wherever shown):
// - Worldwide Governance Indicators: scores 0–100 (higher is better) for rule of law, control of
//   corruption, political stability, government effectiveness and regulatory quality
//   https://www.worldbank.org/en/publication/worldwide-governance-indicators
// - Logistics Performance Index, overall score 1–5 (its last ranked edition, 2023)
//   https://lpi.worldbank.org/
// Run once a year, after the WGI's autumn update: `npm run sourcing:countries`
import { writeFileSync } from "fs"
import { join } from "path"

const OUT = join(__dirname, "../../libs/sourcing/governance.json")
const API = "https://api.worldbank.org/v2/country/all/indicator"

const WGI = {
  rl: "GOV_WGI_RL.SC",
  cc: "GOV_WGI_CC.SC",
  pv: "GOV_WGI_PV.SC",
  ge: "GOV_WGI_GE.SC",
  rq: "GOV_WGI_RQ.SC",
} as const
const LPI = "LP.LPI.OVRL.XQ"

type Row = { country: { id: string }; countryiso3code: string; date: string; value: number | null }

// Each country's latest value: ISO2 → [value, year]
const latest = async (indicator: string) => {
  const response = await fetch(`${API}/${indicator}?format=json&mrnev=1&per_page=500`)
  if (!response.ok) throw new Error(`${indicator}: ${response.status}`)
  const [, rows] = (await response.json()) as [unknown, Row[] | null]
  const out = new Map<string, [number, number]>()
  // Regions and income groups have no ISO3 code of their own in the API's rows
  ;(rows ?? []).forEach((r) => {
    if (r.value !== null && /^[A-Z]{2}$/.test(r.country.id) && r.countryiso3code) out.set(r.country.id, [r.value, Number(r.date)])
  })
  return out
}

const main = async () => {
  const countries: Record<string, Partial<Record<keyof typeof WGI | "lpi", number>>> = {}
  let wgiYear = 0
  for (const [key, indicator] of Object.entries(WGI)) {
    ;(await latest(indicator)).forEach(([value, year], iso) => {
      ;(countries[iso] ??= {})[key as keyof typeof WGI] = Math.round(value)
      wgiYear = Math.max(wgiYear, year)
    })
  }
  let lpiYear = 0
  ;(await latest(LPI)).forEach(([value, year], iso) => {
    ;(countries[iso] ??= {}).lpi = Math.round(value * 100) / 100
    lpiYear = Math.max(lpiYear, year)
  })
  writeFileSync(
    OUT,
    `${JSON.stringify(
      {
        wgi: { source: "World Bank, Worldwide Governance Indicators", url: "https://www.worldbank.org/en/publication/worldwide-governance-indicators", license: "CC BY 4.0", year: wgiYear },
        // The API dates the 2023 edition by its survey year (2022)
        lpi: { source: "World Bank, Logistics Performance Index", url: "https://lpi.worldbank.org/", license: "CC BY 4.0", edition: lpiYear + 1 },
        built: new Date().toISOString().slice(0, 10),
        countries,
      },
      null,
      0
    )}\n`
  )
  console.log(`Wrote ${Object.keys(countries).length} countries (WGI ${wgiYear}, LPI ${lpiYear + 1}) to ${OUT}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
