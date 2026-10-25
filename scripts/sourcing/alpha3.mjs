// Writes alpha3.json: ISO 3166 alpha-3 → alpha-2, for build_bilateral.py (the Atlas uses three-letter
// codes, the app two). Run once: node scripts/sourcing/alpha3.mjs
import { writeFileSync } from "fs"
import countries from "i18n-iso-countries"

const map = Object.fromEntries(Object.entries(countries.getAlpha3Codes()).map(([a3, a2]) => [a3, a2]))
writeFileSync(new URL("./alpha3.json", import.meta.url), `${JSON.stringify(map)}\n`)
console.log(`Wrote ${Object.keys(map).length} codes`)
