// Loads HTS lines (with the base rates that apply to them) from the USITC export API,
// cached in the OS temp folder so repeated runs don't re-download ~10 MB.

import { existsSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { HtsLine } from "./legacy-adapter"

const EXPORT_URL =
  "https://hts.usitc.gov/reststop/exportList?from=0101&to=9799&format=JSON&styles=false"
const CACHE = join(tmpdir(), "hts-hero-usitc-export.json")

interface UsitcRow {
  htsno: string
  indent: string
  general: string | null
  special: string | null
  other: string | null
}

// Every 8- and 10-digit line, paired with the rates of the nearest line (itself or an
// ancestor) that carries rates, the same way the Tariff Finder picks its tariff element.
export const loadHtsLines = async (): Promise<{ htsno: string; rates: HtsLine }[]> => {
  if (!existsSync(CACHE)) {
    const response = await fetch(EXPORT_URL)
    if (!response.ok) throw new Error(`USITC export failed: ${response.status}`)
    writeFileSync(CACHE, await response.text())
  }
  const rows: UsitcRow[] = JSON.parse(readFileSync(CACHE, "utf8"))

  const lines: { htsno: string; rates: HtsLine }[] = []
  const ratesAtIndent: (HtsLine | null)[] = []
  for (const row of rows) {
    const indent = Number(row.indent)
    const hasRates = Boolean(row.general || row.special || row.other)
    ratesAtIndent[indent] = hasRates
      ? { htsno: row.htsno, general: row.general, special: row.special, other: row.other }
      : null
    ratesAtIndent.length = indent + 1

    const digits = row.htsno.replace(/\D/g, "").length
    if (digits !== 8 && digits !== 10) continue
    const rates = [...ratesAtIndent].reverse().find(Boolean)
    if (rates) lines.push({ htsno: row.htsno, rates })
  }
  return lines
}
