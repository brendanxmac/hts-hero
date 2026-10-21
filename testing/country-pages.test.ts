import { describe, it, expect } from "./test-runner"
import { Countries } from "../constants/countries"
import { COUNTRY_PAGES } from "../libs/country-pages/countries"
import { formatImports, importFacts, largestOrdinal } from "../libs/country-pages/importStats"
import { compareExamples, importSentence } from "../components/duty-calculator/country/countryCopy"
import type { ExampleDuty } from "../libs/country-pages/countryTariffs"

describe("Country pages: the list", () => {
  it("uses each country once, with a lower-case slug", () => {
    expect(new Set(COUNTRY_PAGES.map((c) => c.slug)).size).toBe(COUNTRY_PAGES.length)
    expect(new Set(COUNTRY_PAGES.map((c) => c.code)).size).toBe(COUNTRY_PAGES.length)
    COUNTRY_PAGES.forEach((c) => expect(/^[a-z-]+$/.test(c.slug)).toBe(true))
  })

  it("only lists origins the calculator knows, each with Census import figures", () => {
    COUNTRY_PAGES.forEach((c) => {
      expect(Countries.some((x) => x.code === c.code)).toBe(true)
      expect(importFacts(c.code) !== null).toBe(true)
    })
  })

  it("lists them largest source first", () => {
    const ranks = COUNTRY_PAGES.map((c) => importFacts(c.code)!.rank2025)
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
  })
})

describe("Country pages: wording", () => {
  it("writes import values and ranks", () => {
    expect(formatImports(438947.2)).toBe("$439 billion")
    expect(formatImports(41250)).toBe("$41.3 billion")
    expect(formatImports(812.4)).toBe("$812 million")
    expect(largestOrdinal(1)).toBe("largest")
    expect(largestOrdinal(2)).toBe("2nd-largest")
    expect(largestOrdinal(13)).toBe("13th-largest")
    expect(largestOrdinal(23)).toBe("23rd-largest")
  })

  it("states imports with their rank and the year so far", () => {
    const facts = { imports2025: 150000, imports2024: 140000, rank2025: 6, sharePct: 4.6, ytd: { year: 2026, months: 8, through: "August 2026", imports: 110000, changePct: 12.5 } }
    expect(importSentence({ slug: "vietnam", code: "VN", name: "Vietnam" }, facts)).toBe(
      "The US imported $150 billion of goods from Vietnam in 2025, making it the 6th-largest source of US imports (4.6% of the total). Imports from January to August 2026 were $110 billion, up 12.5% on the same months of 2025."
    )
  })

  it("counts products that cost less, the same or more than from another country", () => {
    const ex = (htsno: string, totalPct: number): ExampleDuty => ({ label: htsno, htsno, totalPct, totalDuty: totalPct * 100, tariffs: [] })
    const result = compareExamples([ex("a", 10), ex("b", 20), ex("c", 30)], { name: "China", examples: [ex("a", 35), ex("b", 20), ex("c", 5)] })
    expect([result.lower, result.same, result.higher]).toEqual([1, 1, 1])
  })
})
