import type { CaseKind, Rates } from "./types"

// How AD/CVD cases are written for people: dotted HTS codes, rates as percentages, the law's name.

// "3203008000" → "3203.00.8000", "441810" → "4418.10"
export const dottedCode = (digits: string) => {
  const d = digits.replace(/\D/g, "")
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`
  if (d.length <= 8) return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}.${d.slice(8)}`
}

export const lawName = (kind: CaseKind) => (kind === "AD" ? "antidumping" : "countervailing")

const pct = (n: number) => `${Number(n.toFixed(2))}%`

const BASIS: Record<Rates["basis"], string> = {
  dumping_margin: "dumping margins",
  subsidy_rate: "subsidy rates",
  cash_deposit: "cash deposit rates",
}

// "Company rates 4.24% to 5.78%; all others 5.08%"
export const ratesText = (r: Rates) => {
  const parts: string[] = []
  if (r.low !== null && r.high !== null) parts.push(r.low === r.high ? `Company rate ${pct(r.low)}` : `Company rates ${pct(r.low)} to ${pct(r.high)}`)
  else if (r.high !== null) parts.push(`Company rates up to ${pct(r.high)}`)
  if (r.all_others !== null) parts.push(`all others ${pct(r.all_others)}`)
  return parts.join("; ")
}

export const ratesBasis = (r: Rates) => BASIS[r.basis]

// "Oct 8, 2026"
export const shortDate = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
