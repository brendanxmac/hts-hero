import { NextRequest, NextResponse } from "next/server"
import { requireSocialStudio } from "@/libs/social-studio/access"
import { chapterFile } from "@/libs/social-studio/data"

export const dynamic = "force-dynamic"

// Verifies a post's import figures against the US Census Bureau, live: US imports of an HTS
// code by country for a year (general imports, customs value, USD), straight from
// api.census.gov. The API needs a key, so the query runs here and the key is never shown.

const API = "https://api.census.gov/data/timeseries/intltrade/imports/hs"

type Row = { cty: string; name: string; value: number }

const fetchCode = async (code: string, year: number): Promise<{ query: string; rows: Row[] }> => {
  const query = `${API}?get=CTY_CODE,CTY_NAME,GEN_VAL_YR&I_COMMODITY=${code}&COMM_LVL=HS${code.length}&time=${year}-12`
  const res = await fetch(`${query}&key=${process.env.CENSUS_API_KEY}`, { cache: "no-store" })
  if (res.status === 204) return { query, rows: [] }
  if (!res.ok) throw new Error(`Census answered ${res.status} for ${code}`)
  const [, ...data] = (await res.json()) as string[][]
  return { query, rows: data.map(([cty, name, value]) => ({ cty, name, value: Number(value) })) }
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)
const usd = (n: number) => `$${n.toLocaleString("en-US")}`
const short = (n: number) => (n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${Math.round(n / 1e6)}M` : `$${Math.max(1, Math.round(n / 1e3))}K`)
// Census country codes below 1000 are totals and regions, not countries
const isAggregate = (cty: string) => cty === "-" || Number(cty) < 1000

export async function GET(req: NextRequest) {
  const { denied } = await requireSocialStudio()
  if (denied) return denied
  const code = (req.nextUrl.searchParams.get("code") ?? "").replace(/\D/g, "")
  const year = Number(req.nextUrl.searchParams.get("year"))
  if (![2, 4, 6, 8, 10].includes(code.length) || !(year >= 2013 && year <= 2100)) {
    return NextResponse.json({ error: "Give an HTS code of 2–10 digits and a year" }, { status: 400 })
  }
  if (!process.env.CENSUS_API_KEY) return NextResponse.json({ error: "CENSUS_API_KEY isn't set" }, { status: 500 })

  // Census has no 8-digit level: an 8-digit family is the sum of its 10-digit lines
  const codes =
    code.length === 8
      ? Object.keys(chapterFile(code.slice(0, 2))?.codes ?? {})
          .filter((c) => c.startsWith(code))
          .slice(0, 20)
      : [code]
  try {
    const results = await Promise.all(codes.map((c) => fetchCode(c, year)))
    const byCountry = new Map<string, Row>()
    results.forEach(({ rows }) =>
      rows.forEach((r) => {
        const sum = byCountry.get(r.cty) ?? { ...r, value: 0 }
        byCountry.set(r.cty, { ...sum, value: sum.value + r.value })
      })
    )
    const rows = Array.from(byCountry.values()).sort((a, b) => b.value - a.value)
    const countries = rows.filter((r) => !isAggregate(r.cty))
    const totals = rows.filter((r) => isAggregate(r.cty))
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Census check · HTS ${code} · ${year}</title>
<style>body{font:14px/1.5 system-ui,sans-serif;max-width:860px;margin:32px auto;padding:0 16px;color:#0e1220;background:#fff}
h1{font-size:20px;margin:0 0 4px}p{color:#5d6475;margin:4px 0}code{font-size:12px;word-break:break-all;background:#f5f6fa;padding:2px 4px;border-radius:4px}
table{border-collapse:collapse;width:100%;margin-top:16px}td,th{padding:6px 8px;border-bottom:1px solid #e3e6ee;text-align:left}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
tr.agg td{color:#5d6475;font-style:italic}.tag{display:inline-block;background:#e8f6ef;color:#138a5b;border-radius:99px;padding:1px 8px;font-size:12px;font-weight:600}</style></head><body>
<span class="tag">Official · US Census Bureau</span>
<h1>US imports of HTS ${code}${codes.length > 1 ? ` (the ${codes.length} lines under it, added up)` : ""}, ${year}</h1>
<p>General imports, customs value, US dollars, January–December ${year}. Fetched live from the Census API just now. Posts round these to $K, $M or $B.</p>
<p>${results.map((r) => `<code>${esc(r.query)}</code>`).join("<br>")}</p>
${countries.length === 0 ? "<p><b>Census has no figures for this code and year.</b> The code may be new in the schedule; posts then use its 8- or 6-digit family.</p>" : ""}
<table><thead><tr><th>#</th><th>Country</th><th class="n">Imports</th><th class="n">Rounded</th></tr></thead><tbody>
${countries.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td class="n">${usd(r.value)}</td><td class="n">${short(r.value)}</td></tr>`).join("")}
${totals.map((r) => `<tr class="agg"><td></td><td>${esc(r.name)}</td><td class="n">${usd(r.value)}</td><td class="n">${short(r.value)}</td></tr>`).join("")}
</tbody></table></body></html>`
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
