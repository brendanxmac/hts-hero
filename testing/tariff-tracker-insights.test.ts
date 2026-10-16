import { describe, it, expect } from "./test-runner"
import { findCountry } from "../components/tariff-tracker/parse"
import { TrackedProduct } from "../components/tariff-tracker/report"
import { ProductHistory } from "../components/tariff-tracker/insights/catalogHistory"
import {
  breakdown,
  catalogScale,
  concentration,
  importSeries,
  InsightsInput,
  takeaway,
  METRICS,
  topTenthShare,
  trendSeries,
} from "../components/tariff-tracker/insights-tab/lib/data"

// Imports with set rates and parts stand in for worked-out ones: the sums only read these
const TODAY = "2026-10-16"
const item = (htsno: string, country: string, parts: { key: string; pct: number }[], customsValue = 10_000) =>
  ({
    key: `${htsno}|${country}`,
    entry: { line: 1, text: "", element: { htsno, chapter: Number(htsno.slice(0, 2)) }, country: findCountry(country)! },
    adjustments: {},
    customsValue,
    totalPct: parts.reduce((s, p) => s + p.pct, 0),
    parts,
  }) as unknown as TrackedProduct

const seg = (from: string, to: string, parts: { key: string; pct: number }[]) => ({
  from,
  to,
  pct: parts.reduce((s, p) => s + p.pct, 0),
  usd: 0,
  parts,
  changes: [] as never[],
})

const A = item("8413919015", "CN", [
  { key: "Base duty", pct: 5 },
  { key: "Section 301 – China", pct: 25 },
])
const B = item("8409999190", "CN", [{ key: "Base duty", pct: 10 }], 30_000)
const C = item("7326908688", "VN", [{ key: "Base duty", pct: 0 }])

// A went from base duty alone to base duty and Section 301 on 2026-03-01
const histories = new Map<string, ProductHistory>([
  [A.key, [seg("2025-01-01", "2026-03-01", [{ key: "Base duty", pct: 5 }]), seg("2026-03-01", "2026-12-31", A.parts)]],
  [B.key, [seg("2025-01-01", "2026-12-31", B.parts)]],
])

const input: InsightsInput = { products: [A, B, C], histories, sections: [], trackedKeys: new Set([A.key]), today: TODAY }

describe("Tariff Tracker insights: sums", () => {
  it("sizes the catalog", () => {
    expect([catalogScale(1), catalogScale(4), catalogScale(5), catalogScale(49), catalogScale(50)]).toEqual(["few", "few", "some", "some", "many"])
  })

  it("groups by country with averages, shares and 12-month change", () => {
    const rows = breakdown(input, "country")
    const cn = rows.find((r) => r.key === "CN")!
    expect(cn.imports).toBe(2)
    expect(cn.avgRate).toBe(20)
    expect(cn.maxRate).toBe(30)
    // A rose 25%, B stayed: 12.5% on average
    expect(cn.change).toBe(12.5)
    expect(cn.up).toBe(1)
    // Duty: A 30% of $10k = 3,000, B 10% of $30k = 3,000, C nothing
    expect(Math.round(cn.dutyShare * 100)).toBe(100)
    expect(Math.round(cn.importShare * 100)).toBe(67)
  })

  it("counts only what a tariff adds when grouping by tariff", () => {
    const rows = breakdown(input, "program")
    const s301 = rows.find((r) => r.key === "Section 301 – China")!
    expect(s301.label).toBe("Section 301")
    expect(s301.imports).toBe(1)
    expect(s301.avgRate).toBe(25)
    expect(s301.change).toBe(25)
    // 2,500 of 6,000 in duty
    expect(Math.round(s301.dutyShare * 1000)).toBe(417)
  })

  it("finds how concentrated origins and duty are", () => {
    const c = concentration(breakdown(input, "country"))
    expect(c.top!.key).toBe("CN")
    expect(c.forEighty).toBe(2)
    const tenth = topTenthShare(input)
    expect(tenth.count).toBe(1)
    expect(Math.round(tenth.share * 100)).toBe(50)
  })

  it("follows a group's rate over time", () => {
    const groups = breakdown(input, "all")
    const [series] = trendSeries(input, "all", "avgRate", "2025-10-16", groups)
    expect(series.points.map((p) => p.date)).toEqual(["2025-10-16", "2026-03-01"])
    expect(series.points.map((p) => Math.round(p.value * 100) / 100)).toEqual([5, 13.33])
    const [a] = importSeries(input, [A], "2025-10-16")
    expect(a.points.map((p) => p.value)).toEqual([5, 30])
  })

  it("says what a breakdown shows", () => {
    const rows = breakdown(input, "country")
    expect(takeaway(rows, METRICS.avgRate, "country")).toBe("🇨🇳 China has the highest average rate, 20%; 🇻🇳 Vietnam the lowest, 0%.")
  })
})
