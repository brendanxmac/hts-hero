import { describe, it, expect } from "./test-runner"
import { Countries } from "../constants/countries"
import { countryRows, hubSummary, noCountryTariffs } from "../libs/country-pages/allCountries"
import { hubFaqs, hubGroups, hubKeyFacts, hubLead } from "../components/duty-calculator/countries/hubCopy"
import { GET as csv } from "../app/duty-calculator/countries.csv/route"
import { preferenceName } from "../libs/hts-duty-summary"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitemap = require("../next-sitemap.config.js") as { KEY_PAGES: [string, number][] }

const ASOF = "2026-10-10"
const rows = countryRows(ASOF)
const summary = hubSummary(rows)

describe("Tariffs by country hub", () => {
  it("has a row for every origin the calculator covers", () => {
    expect(rows.length).toBe(Countries.filter((c) => c.code !== "US").length)
    expect(summary.total).toBe(rows.length)
  })

  it("adds up: every country is in exactly the groups its row says", () => {
    expect(summary.forcedLabor.count).toBe(rows.filter((r) => r.forcedLabor).length)
    expect(summary.forcedLabor.byRate.reduce((n, g) => n + g.names.length, 0)).toBe(summary.forcedLabor.count)
    expect(summary.none.length).toBe(rows.filter(noCountryTariffs).length)
    expect(summary.withPreferences).toBe(rows.filter((r) => r.preferences.length).length)
  })

  it("names every forced-labor country and every country with no added tariff in its FAQs", () => {
    const faqs = hubFaqs(rows, summary, "October 10, 2026", "2026 HTS Revision 20")
    const forced = faqs.find((f) => f.question.includes("forced-labor"))!.answer
    rows.filter((r) => r.forcedLabor).forEach((r) => expect(forced.includes(r.name)).toBe(true))
    const none = faqs.find((f) => f.question.includes("no additional"))!.answer
    summary.none.forEach((name) => expect(none.includes(name)).toBe(true))
  })

  it("leads with the counts", () => {
    const lead = hubLead(summary, "October 10, 2026")
    expect(lead.includes(`${summary.forcedLabor.count} of the ${summary.total} countries`)).toBe(true)
  })

  it("puts every country in a group, and groups have unique anchors", () => {
    const groups = hubGroups(summary)
    expect(new Set(groups.map((g) => g.id)).size).toBe(groups.length)
    const grouped = new Set(groups.flatMap((g) => g.names))
    rows.forEach((r) => expect(grouped.has(r.name)).toBe(true))
  })

  it("states the key facts with the counts", () => {
    const facts = hubKeyFacts(rows, summary)
    expect(facts[0].text.startsWith(`Section 301 forced-labor tariff: ${summary.forcedLabor.count} countries`)).toBe(true)
    expect(facts.some((f) => f.text.startsWith(`No added tariff: ${summary.none.length} countries`))).toBe(true)
  })

  it("serves the table as CSV, one line per country", async () => {
    const text = await csv().text()
    const lines = text.trim().split("\n")
    expect(lines.length).toBe(rows.length + 1)
    expect(lines[0].startsWith("Country,ISO code,US imports 2025")).toBe(true)
  })

  it("is in the sitemap", () => {
    expect(sitemap.KEY_PAGES.some(([loc]) => loc === "/duty-calculator/countries")).toBe(true)
  })

  it("shortens trade agreement names", () => {
    expect(preferenceName("United States-Israel Free Trade Area Implementation Act of 1985")).toBe("US-Israel FTA")
    expect(preferenceName("United States-Peru Trade Promotion Agreement")).toBe("US-Peru TPA")
    expect(preferenceName("Trade Agreement between the United States and Japan")).toBe("US-Japan Trade Agreement")
    expect(preferenceName("United States-Korea Free Trade Agreement")).toBe("US-Korea FTA")
    expect(preferenceName("United States-Mexico-Canada Agreement")).toBe("USMCA")
  })
})
