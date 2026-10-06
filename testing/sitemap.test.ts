import { describe, it, expect } from "./test-runner"
import { COUNTRY_PAGES } from "../libs/country-pages/countries"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitemap = require("../next-sitemap.config.js") as {
  exclude: string[]
  KEY_PAGES: [string, number][]
  priorityOf: (path: string) => number
}

describe("Sitemap", () => {
  it("lists the calculator and every country calculator page", () => {
    const listed = sitemap.KEY_PAGES.map(([loc]) => loc)
    expect(listed.includes("/duty-calculator")).toBe(true)
    COUNTRY_PAGES.forEach((c) => expect(listed.includes(`/duty-calculator/${c.slug}`)).toBe(true))
  })

  it("ranks the calculator above everything else", () => {
    expect(sitemap.priorityOf("/duty-calculator")).toBe(1)
    expect(sitemap.priorityOf("/hts/6110.20.20.79") < sitemap.priorityOf("/compare/best-us-tariff-calculators")).toBe(true)
  })

  it("leaves out retired and stale pages", () => {
    ;["/about/*", "/tariffs/*", "/chapter/*", "/section/*"].forEach((p) => expect(sitemap.exclude.includes(p)).toBe(true))
  })
})
