import { describe, it, expect } from "./test-runner"
import { parseCatalog } from "../components/tariff-tracker/parse"

// Known codes stand in for the HTS; the parser only needs to know whether a code exists
const KNOWN = ["8413919015", "8409999190", "84833080", "7326908688"]
const find = (digits: string) => (KNOWN.includes(digits) ? digits : undefined)

describe("Tariff Tracker: reading the list", () => {
  it("reads code,country lines", () => {
    const { entries, errors } = parseCatalog("8413919015,BR\n8409999190,AR", find)
    expect(errors.length).toBe(0)
    expect(entries.map((e) => `${e.element}/${e.country.code}`)).toEqual(["8413919015/BR", "8409999190/AR"])
  })

  it("accepts dotted codes, other separators, names and lower case", () => {
    const { entries, errors } = parseCatalog(
      "8413.91.90.15; br\n8483.30.80\tAustria\n7326 90 86 88 china",
      find
    )
    expect(errors.length).toBe(0)
    expect(entries.map((e) => e.country.code)).toEqual(["BR", "AT", "CN"])
  })

  it("skips blank lines, comments and a header row, and keeps line numbers", () => {
    const { entries, errors } = parseCatalog("HTS Code,Country\n\n# pumps\n8413919015,BR", find)
    expect(errors.length).toBe(0)
    expect(entries[0].line).toBe(4)
  })

  it("explains lines it can't read", () => {
    const { entries, errors } = parseCatalog(
      "841391,BR\n8413919015\n8413919015,XX\n8413919015,US\n9999999999,BR\nhello",
      find
    )
    expect(entries.length).toBe(0)
    expect(errors.map((e) => e.line)).toEqual([1, 2, 3, 4, 5, 6])
    expect(errors[0].message).toBe("HTS codes need 8 or 10 digits (this has 6)")
    expect(errors[1].message).toBe("Add a country of origin after the code")
    expect(errors[3].message).toBe("The country of origin can't be the United States")
    expect(errors[4].message).toBe("9999999999 isn't in the current HTS")
  })

  it("keeps duplicates, in order", () => {
    const { entries } = parseCatalog("8413919015,BR\n8413919015,BR", find)
    expect(entries.length).toBe(2)
  })
})

// ── Exporting ──

import { HtsElement } from "../interfaces/hts"
import { findCountry } from "../components/tariff-tracker/parse"
import { trackProduct } from "../components/tariff-tracker/report"
import { buildTariffSheet, toCsv, toXlsx } from "../components/tariff-tracker/export"
import {
  Adjustments,
  adjustmentTags,
  cleanAdjustments,
  readAdjustments,
  writeAdjustments,
} from "../components/tariff-tracker/adjustments"
import { activeFilters, applyFilters, CATALOG_FILTERS, FilterContext, filterOptions } from "../components/tariff-tracker/filters"

// A top-level HTS line carrying its own base rate (no parents to look up)
const htsLine = (htsno: string, general: string, description: string) =>
  ({ uuid: htsno, htsno, chapter: Number(htsno.slice(0, 2)), indent: "0", description, units: [], general, special: null, other: null, footnotes: [] } as unknown as HtsElement)

const product = (htsno: string, general: string, country: string, adjustments: Adjustments = {}) =>
  trackProduct(
    { line: 1, text: `${htsno},${country}`, element: htsLine(htsno, general, "Test product"), country: findCountry(country)! },
    [],
    "2026-04-10",
    adjustments
  )

describe("Tariff Tracker: exporting the report", () => {
  const steel = product("7326.90.86.88", "2.9%", "CN")
  const watch = product("9103.10.40", "24¢ each + 4.5% on the case + 3.5% on the battery", "CL")
  const sheet = buildTariffSheet([steel, watch], "2026-04-10")
  const headers = sheet.columns.map((c) => c.header)
  const cell = (row: number, header: string) => sheet.rows[row][headers.indexOf(header)]

  it("starts with the HTS code and country code, without the description", () => {
    expect(headers.slice(0, 3)).toEqual(["HTS code", "Country code", "Country of origin"])
    expect(headers.includes("Description")).toBe(false)
    expect(sheet.rows[0].slice(0, 2)).toEqual(["7326.90.86.88", "CN"])
  })

  it("has a rate and a tariffs column for each type of tariff that applies, and no others", () => {
    expect(headers.includes("Section 122 Rate")).toBe(true)
    expect(headers.includes("Section 232 Tariffs")).toBe(true)
    expect(headers.includes("Section 301 Rate")).toBe(true)
    expect(headers.includes("IEEPA Rate")).toBe(false)
    expect(headers.includes("Trade agreements Rate")).toBe(false)
  })

  it("puts each tariff's rate in its column, and leaves types that don't apply empty", () => {
    expect(cell(0, "Base duty")).toBe(2.9)
    expect(cell(0, "Section 232 Rate")).toBe(50)
    expect(cell(0, "Section 301 Rate")).toBe(25)
    expect(cell(0, "Total duty rate")).toBe(77.9)
    expect(cell(1, "Section 232 Rate")).toBe(null)
    expect(cell(1, "Section 122 Rate")).toBe(10)
  })

  it("lists the heading and rate behind each tariff, without its description", () => {
    expect(cell(0, "Section 232 Tariffs")).toBe("9903.82.02 (50%)")
    expect(cell(1, "Section 122 Tariffs")).toBe("9903.03.01 (10%)")
  })

  it("explains per-unit rates in the notes", () => {
    expect(String(cell(1, "Notes")).includes("per-unit")).toBe(true)
  })

  it("marks percentage columns in the CSV header", () => {
    const header = toCsv(sheet).split("\r\n")[0]
    expect(header.includes("Section 232 Rate (%)")).toBe(true)
    expect(header.includes("Section 232 Tariffs,")).toBe(true)
  })

  it("writes an Excel file (a zip starting with PK)", () => {
    const bytes = toXlsx(sheet, "2026-04-10")
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK")
  })
})

describe("Tariff Tracker: product adjustments", () => {
  const PER_UNIT = "24¢ each + 4.5% on the case + 3.5% on the battery"

  it("works rates out for the product's own shipment", () => {
    const standard = product("9103.10.40", PER_UNIT, "CL")
    const bigger = product("9103.10.40", PER_UNIT, "CL", { customsValue: 20000 })
    expect(bigger.customsValue).toBe(20000)
    expect(bigger.key).toBe(standard.key)
    // The same per-unit charge is a smaller share of a bigger shipment
    expect(standard.totalPct).toBeGreaterThan(bigger.totalPct)
  })

  it("applies answers, by what each answer was measured to change", () => {
    const steel = product("7326.90.86.88", "2.9%", "CN")
    const id = Object.keys(steel.impacts).find((k) => Math.abs(steel.impacts[k]) >= 0.005)
    if (!id) return
    const answered = product("7326.90.86.88", "2.9%", "CN", { answers: { [id]: true } })
    const expected = steel.totalPct + (steel.impacts[id] / steel.customsValue) * 100
    // Impacts include fees; rates don't, so compare within a fee's worth
    expect(Math.abs(answered.totalPct - expected) < 1).toBe(true)
    expect(adjustmentTags(answered.adjustments, answered.result).some((t) => t.id === "answers")).toBe(true)
  })

  it("stores nothing for values left at their defaults or emptied", () => {
    expect(cleanAdjustments({ transportMode: "ocean", claimedPreference: "", answers: { a: undefined }, customsValue: 0 })).toEqual({})
    expect(cleanAdjustments({ transportMode: "air", quantity: 5 })).toEqual({ quantity: 5, transportMode: "air" })
  })

  it("tags the key adjustments for the summary line", () => {
    const p = product("7326.90.86.88", "2.9%", "CN", { customsValue: 25000, transportMode: "air" })
    expect(adjustmentTags(p.adjustments, p.result).map((t) => t.label)).toEqual(["$25,000", "Air"])
    expect(adjustmentTags({}, p.result).length).toBe(0)
  })

  it("reads back what it stored, and ignores anything else", () => {
    const stored = { "7326908688-CN": { customsValue: 5 } }
    expect(readAdjustments(writeAdjustments(stored))).toEqual(stored)
    expect(readAdjustments("not json")).toEqual({})
    expect(readAdjustments(JSON.stringify({ version: 99, products: stored }))).toEqual({})
    expect(readAdjustments(null)).toEqual({})
  })
})

describe("Tariff Tracker: filters", () => {
  const steelCN = product("7326.90.86.88", "2.9%", "CN")
  const steelVN = product("7326.90.86.88", "2.9%", "VN")
  const watchCN = product("9103.10.40", "24¢ each", "CN")
  const all = [steelCN, steelVN, watchCN]
  const context: FilterContext = { sections: [] }
  const byId = (id: string) => CATALOG_FILTERS.find((f) => f.id === id)!

  it("lets everything through with nothing picked", () => {
    expect(applyFilters(all, {}).length).toBe(3)
    expect(applyFilters(all, { country: [] }).length).toBe(3)
  })

  it("matches any picked value within a filter, and every filter across them", () => {
    expect(applyFilters(all, { country: ["CN", "VN"] }).length).toBe(3)
    expect(applyFilters(all, { country: ["CN"] }).length).toBe(2)
    expect(applyFilters(all, { country: ["CN"], chapter: ["91"] })).toEqual([watchCN])
  })

  it("ignores picked values no product has any more", () => {
    expect(applyFilters(all, { country: ["MX"] }).length).toBe(3)
    expect(activeFilters(all, { country: ["MX", "VN"] })[0].picked).toEqual(["VN"])
  })

  it("lists every value with its count against the other filters", () => {
    const countries = filterOptions(byId("country"), all, { chapter: ["73"] }, context)
    expect(countries.map((o) => `${o.value}:${o.count}`)).toEqual(["CN:1", "VN:1"])
    expect(countries[0].label).toBe("China")
    const chapters = filterOptions(byId("chapter"), all, { country: ["VN"] }, context)
    expect(chapters.map((o) => `${o.value}:${o.count}`)).toEqual(["73:1", "91:0"])
  })
})

// ── Catalog, CSV and generated products ──

import { itemsFromText, mergeItems, readCatalog, writeCatalog } from "../components/tariff-tracker/catalog"
import { parseCsv, splitRow } from "../components/tariff-tracker/csv"
import { generateProducts } from "../components/tariff-tracker/generate"

describe("Tariff Tracker: the stored catalog", () => {
  it("adds products once, counting the ones already there or repeated", () => {
    const { items, added, duplicates } = mergeItems(
      [{ code: "8413919015", country: "BR" }],
      [
        { code: "8413919015", country: "BR" },
        { code: "8409999190", country: "AR" },
        { code: "8409999190", country: "AR" },
      ]
    )
    expect(items.length).toBe(2)
    expect(added).toBe(1)
    expect(duplicates).toBe(2)
  })

  it("converts a catalog kept as text, without needing the HTS", () => {
    expect(itemsFromText("HTS,Country\n8413.91.90.15, Brazil\n8413919015,BR\nnonsense")).toEqual([
      { code: "8413919015", country: "BR" },
    ])
  })

  it("reads back what it stored, and nothing else", () => {
    const items = [{ code: "8413919015", country: "BR" }]
    expect(readCatalog(writeCatalog(items))).toEqual(items)
    expect(readCatalog("8413919015,BR")).toBe(null)
    expect(readCatalog(JSON.stringify({ version: 1, items: [{ code: 1 }, ...items] }))).toEqual(items)
  })
})

describe("Tariff Tracker: CSV uploads", () => {
  it("splits rows, keeping quoted commas and quotes", () => {
    expect(splitRow('8413919015,"Acme, ""Inc.""",BR', ",")).toEqual(["8413919015", 'Acme, "Inc."', "BR"])
  })

  it("finds columns by name, in any order, and turns optional ones into adjustments", () => {
    const { entries, errors } = parseCsv(
      "﻿SKU,Country of Origin,HTS Code,Customs Value,Transport\nA1,BR,8413.91.90.15,\"$25,000.00\",Air\nA2,Argentina,8409999190,,",
      find
    )
    expect(errors.length).toBe(0)
    expect(entries.map((e) => `${e.element}/${e.country.code}`)).toEqual(["8413919015/BR", "8409999190/AR"])
    expect(entries[0].adjustments).toEqual({ customsValue: 25000, transportMode: "air" })
    expect(entries[1].adjustments).toBe(undefined)
  })

  it("explains rows it can't read, by line", () => {
    const { entries, errors } = parseCsv(
      "hts_code,country_of_origin,quantity,transport\n8413919015,BR,lots,\n8409999190,AR,,boat\n123,BR,,",
      find
    )
    expect(entries.length).toBe(0)
    expect(errors.map((e) => e.line)).toEqual([2, 3, 4])
    expect(errors[1].message.includes("boat")).toBe(true)
  })

  it("reads a file without a header like a pasted list", () => {
    expect(parseCsv("8413919015,BR\n8409999190,AR", find).entries.length).toBe(2)
  })
})

describe("Tariff Tracker: generated products", () => {
  const elements = ["0101.21.00.10", "0101.21.00.20", "8413.91.90.15", "8413.91.90"].map((code) => htsLine(code, "Free", "x"))
  let seed = 1
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

  it("makes distinct pairs of real 10-digit codes and countries", () => {
    const lines = generateProducts(elements, 20, "common", random).split("\n")
    expect(lines.length).toBe(20)
    expect(new Set(lines).size).toBe(20)
    expect(lines.every((l) => /^\d{4}\.\d{2}\.\d{2}\.\d{2},[A-Z]{2}$/.test(l))).toBe(true)
  })

  it("stops at the pairs that exist", () => {
    // 3 codes × 20 top partners
    expect(generateProducts(elements, 500, "common", random).split("\n").length).toBeGreaterThanOrEqual(55)
    expect(generateProducts(elements, 500, "common", random).split("\n").length <= 60).toBe(true)
  })
})

// ── The shared catalog store (no browser storage here, so it's kept in memory) ──

import * as catalogStore from "../components/tariff-tracker/catalogStore"

describe("Tariff Tracker: the shared catalog", () => {
  const BR = "8413919015-BR"

  it("adds a product once, with the adjustments it brings", () => {
    catalogStore.clearCatalog()
    expect(
      catalogStore.addToCatalog([{ code: "8413919015", country: "BR", adjustments: { customsValue: 25000, transportMode: "ocean" } }])
    ).toEqual({ added: 1, duplicates: 0, withAdjustments: 1 })
    // Defaults aren't stored
    expect(catalogStore.getCatalog().adjustments[BR]).toEqual({ customsValue: 25000 })
    expect(catalogStore.addToCatalog([{ code: "8413919015", country: "BR" }]).added).toBe(0)
  })

  it("leaves a product already in the catalog with the adjustments it has", () => {
    catalogStore.setProductAdjustments(BR, { quantity: 5 })
    catalogStore.addToCatalog([{ code: "8413919015", country: "BR", adjustments: { customsValue: 1 } }])
    expect(catalogStore.getCatalog().adjustments[BR]).toEqual({ customsValue: 25000, quantity: 5 })
  })

  it("remembers a removed product's adjustments for when it's added back", () => {
    catalogStore.removeFromCatalog([BR])
    expect(catalogStore.getCatalog().items.length).toBe(0)
    catalogStore.addToCatalog([{ code: "8413919015", country: "BR" }])
    expect(catalogStore.getCatalog().adjustments[BR]).toEqual({ customsValue: 25000, quantity: 5 })
    catalogStore.resetProductAdjustments(BR)
    expect(catalogStore.getCatalog().adjustments[BR]).toBe(undefined)
  })

  it("keeps other products' adjustments as the same objects, so their rates aren't worked out again", () => {
    catalogStore.clearCatalog()
    catalogStore.addToCatalog([
      { code: "8413919015", country: "BR", adjustments: { customsValue: 25000 } },
      { code: "8409999190", country: "AR", adjustments: { customsValue: 5000 } },
    ])
    const before = catalogStore.getCatalog().adjustments["8409999190-AR"]
    catalogStore.setProductAdjustments(BR, { quantity: 9 })
    expect(catalogStore.getCatalog().adjustments["8409999190-AR"] === before).toBe(true)
    catalogStore.clearCatalog()
  })
})

// ── Product analysis: every origin ──

import {
  analysisFacts,
  layoutSwarm,
  originRates,
  presetCountries,
  rateOf,
  rateTiers,
  swarmNodes,
  visibleOrigins,
} from "../components/tariff-tracker/product/analysis/analysis"

describe("Tariff Tracker: product analysis", () => {
  const steel = product("7326.90.86.88", "2.9%", "CN", { customsValue: 20000 })
  const rates = originRates(steel)

  it("works out every origin but the US, with the product's own origin marked", () => {
    expect(rates.length).toBeGreaterThan(150)
    expect(rates.some((r) => r.country.code === "US")).toBe(false)
    expect(rates.filter((r) => r.isOrigin).map((r) => r.country.code)).toEqual(["CN"])
    // On the product's own shipment: the same rate the catalog shows
    expect(Math.abs(rates.find((r) => r.isOrigin)!.pct - steel.totalPct) < 0.001).toBe(true)
  })

  it("ranks the origin among the rates, ties sharing a rank", () => {
    const facts = analysisFacts(rates, "standard")
    expect(facts.total).toBe(rates.length)
    expect(facts.lowest.pct <= facts.originPct).toBe(true)
    expect(facts.cheaper.every((r) => r.pct < facts.originPct)).toBe(true)
    expect(facts.bestSaving).toBe(facts.originPct - facts.lowest.pct)
    expect(facts.rank).toBe(new Set(facts.cheaper.map((r) => Math.round(r.pct * 100))).size + 1)
  })

  it("groups origins into tiers, lowest first, with every origin in one", () => {
    const tiers = rateTiers(rates, "standard")
    expect(tiers.reduce((n, t) => n + t.origins.length, 0)).toBe(rates.length)
    expect(tiers.every((t, i) => i === 0 || t.pct > tiers[i - 1].pct)).toBe(true)
  })

  it("never lets a trade agreement raise a rate", () => {
    expect(rates.every((r) => rateOf(r, "agreements") <= rateOf(r, "standard"))).toBe(true)
  })

  it("piles big ties, but keeps the product's own origin as a flag", () => {
    const nodes = swarmNodes(rates, "standard", 7)
    const piled = nodes.filter((n) => n.kind === "pile")
    expect(piled.length).toBeGreaterThan(0)
    expect(nodes.some((n) => n.kind === "flag" && n.origin.isOrigin)).toBe(true)
    expect(piled.every((n) => n.kind === "pile" && n.origins.every((o) => !o.isOrigin))).toBe(true)
    const shown = nodes.reduce((n, node) => n + (node.kind === "pile" ? node.origins.length : 1), 0)
    expect(shown).toBe(rates.length)
  })

  it("stacks marks that would overlap, and leaves apart ones on the axis", () => {
    const flag = (code: string, pct: number) => ({ kind: "flag" as const, key: code, pct, origin: rates[0] })
    const placed = layoutSwarm([flag("A", 10), flag("B", 10), flag("C", 10.1), flag("D", 50)], (p) => p * 10, () => 28)
    const y = (key: string) => placed.find((p) => p.node.key === key)!.y
    // 28 across with a 2px gap: each sits on the one below
    expect([y("A"), y("B"), y("C")].sort((a, b) => a - b)).toEqual([0, 30, 60])
    expect(y("D")).toBe(0)
  })

  it("stacks a flag on a bigger pile by the pile's height", () => {
    const pile = { kind: "pile" as const, key: "pile-10", pct: 10, origins: rates.slice(0, 50) }
    const flag = { kind: "flag" as const, key: "X", pct: 10, origin: rates[0] }
    const placed = layoutSwarm([flag, pile], (p) => p * 10, (n) => (n.kind === "pile" ? 70 : 28))
    expect(placed.find((p) => p.node.key === "pile-10")!.y).toBe(0)
    expect(placed.find((p) => p.node.key === "X")!.y).toBe(72)
  })
})

describe("Tariff Tracker: choosing countries to analyze", () => {
  const rates = originRates(product("7326.90.86.88", "2.9%", "CN"))

  it("shows every origin with no choice, and only the chosen ones (plus yours) with one", () => {
    expect(visibleOrigins(rates, null).length).toBe(rates.length)
    expect(visibleOrigins(rates, ["MX", "VN"]).map((r) => r.country.code).sort()).toEqual(["CN", "MX", "VN"])
    // Choosing none still leaves the product's own origin to look at
    expect(visibleOrigins(rates, []).map((r) => r.country.code)).toEqual(["CN"])
  })

  it("counts facts among the chosen countries only", () => {
    const shown = visibleOrigins(rates, ["MX", "VN"])
    expect(analysisFacts(shown, "standard").total).toBe(3)
  })

  it("picks presets from the rates, never including the product's own origin", () => {
    const sources = presetCountries("sources", rates, "standard", ["CN", "MX", "DE", "XX"])
    expect(sources.sort()).toEqual(["DE", "MX"])
    const yours = rateOf(rates.find((r) => r.isOrigin)!, "standard")
    const cheaper = presetCountries("cheaper", rates, "standard", [])
    expect(cheaper.length).toBeGreaterThan(0)
    expect(cheaper.every((c) => rateOf(rates.find((r) => r.country.code === c)!, "standard") < yours)).toBe(true)
    expect(presetCountries("agreements", rates, "standard", []).every((c) => rates.find((r) => r.country.code === c)!.agreement)).toBe(true)
  })
})

// ── Rate history across origins: the time-lapse and stability ──

import { addDays } from "../tariffs/engine-v2/history"
import {
  changeEvents,
  daysBetween,
  historyRange,
  originHistory,
  rateAt,
  ratesOn,
  volatility,
} from "../components/tariff-tracker/product/analysis/history"

describe("Tariff Tracker: rate history across origins", () => {
  const steel = product("7326.90.86.88", "2.9%", "CN")
  const rates = originRates(steel)
  const range = historyRange()
  const histories = new Map(rates.map((o) => [o.country.code, originHistory(steel, o, range)]))
  // The window ends the day after today
  const today = addDays(range.to, -1)

  it("covers the verified window, segment after segment", () => {
    const h = histories.get("CN")!
    expect(h.standard[0].from).toBe(range.from)
    expect(h.standard.every((s, i) => i === 0 || s.from === h.standard[i - 1].to)).toBe(true)
  })

  it("gives the rate on any date, and today's matches the analysis", () => {
    const cn = rates.find((r) => r.country.code === "CN")!
    expect(Math.abs(rateAt(histories.get("CN")!, today, "standard").pct - cn.pct) < 0.001).toBe(true)
    // Before the window: its first segment
    expect(rateAt(histories.get("CN")!, "2000-01-01", "standard")).toEqual(histories.get("CN")!.standard[0])
  })

  it("measures a swing as the highest rate minus the lowest", () => {
    const v = volatility(histories.get("CN")!, "standard")
    expect(v.swing).toBe(v.max - v.min)
    expect(v.changes).toBe(histories.get("CN")!.standard.length - 1)
  })

  it("lists each change date once, with the origins it moved", () => {
    const events = changeEvents(Array.from(histories.values()), "standard")
    expect(new Set(events.map((e) => e.date)).size).toBe(events.length)
    expect(events.every((e) => e.date > range.from && e.changes.length > 0)).toBe(true)
    expect(events.every((e, i) => i === 0 || e.date > events[i - 1].date)).toBe(true)
  })

  it("rebuilds every origin's rate as of a date", () => {
    const then = ratesOn(rates, histories, range.from)
    expect(then.length).toBe(rates.length)
    expect(then.every((o) => o.pct === rateAt(histories.get(o.country.code)!, range.from, "standard").pct)).toBe(true)
  })

  it("counts days between dates", () => {
    expect(daysBetween("2026-04-08", "2026-04-10")).toBe(2)
  })
})
