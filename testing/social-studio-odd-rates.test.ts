import { describe, it, expect } from "./test-runner"
import type { HtsElement } from "../interfaces/hts"
import { captionsFor } from "../social/captions"
import { oddRatePost, shortHook } from "../libs/social-studio/build"
import { numbersCheck } from "../libs/social-studio/numbers"
import { describeRate, findOddRates, isCalculable, tidyRate, workedExample } from "../libs/social-studio/unusual"

const element = (htsno: string, indent: number, description: string, general: string | null, other: string | null = null, units: string[] = ["No."]) =>
  ({ htsno, indent: String(indent), description, general, other, special: null, units, uuid: htsno || description }) as unknown as HtsElement

describe("Social studio odd rates: which rates stand out", () => {
  it("leaves plain percentages, Free and ordinary per-unit rates out", () => {
    expect(describeRate("5.3%")).toBe(null)
    expect(describeRate("Free")).toBe(null)
    expect(describeRate("2.2¢/kg + 5%")).toBe(null)
    expect(describeRate("68¢/head") !== null).toBe(true)
  })

  it("says how each odd rate is charged", () => {
    expect(describeRate("43¢ each + 2.8¢/jewel over 7 + 3.7% on the case")!.hook).toBe("per jewel over 7")
    expect(describeRate("33 1/3%")!.hook).toBe("at 33 1/3%")
    expect(describeRate("Free, under bond")!.hook).toBe("nothing, under bond")
    expect(describeRate("16.9¢/kg of total sugars + 5.1%")!.hook).toBe("per kg of total sugars")
    expect(describeRate("86.1¢/m2 of recording surface")!.hook).toBe("per square meter of recording surface")
    expect(
      describeRate("3.6606¢/kg less 0.020668¢/kg for each degree under 100 degrees (and fractions of a degree in proportion) but not less than 3.143854¢/kg")!.hook
    ).toBe("by the degree of the sugar's polarity")
  })

  it("ranks sliding scales above jewels above odd units", () => {
    const sugar = describeRate("3.6606¢/kg less 0.020668¢/kg for each degree under 100 degrees (and fractions of a degree in proportion) but not less than 3.143854¢/kg")!
    const watch = describeRate("17¢ each + 2.5% + 1¢/jewel")!
    const head = describeRate("68¢/head")!
    expect(sugar.rank < watch.rank).toBe(true)
    expect(watch.rank < head.rank).toBe(true)
  })

  it("mends words the HTS broke across lines", () => {
    expect(tidyRate("$2.50/thou- sand + 40%")).toBe("$2.50/thousand + 40%")
    expect(tidyRate("39.9¢/kg of total sugars+ 6%")).toBe("39.9¢/kg of total sugars + 6%")
    expect(tidyRate("86.1¢/m2of recording surface")).toBe("86.1¢/m2 of recording surface")
  })
})

describe("Social studio odd rates: only what HTS Hero calculates", () => {
  it("counts rates the engine reads, and rates that point elsewhere as not calculated", () => {
    expect(isCalculable("17¢ each + 2.5% + 1¢/jewel")).toBe(true)
    expect(isCalculable("33 1/3%")).toBe(true)
    expect(isCalculable("The rate applicable to each garment in the ensemble if separately entered")).toBe(false)
  })

  it("works a rate out part by part on the $10,000 shipment", () => {
    const worked = workedExample("17¢ each + 2.5% + 1¢/jewel")
    expect(worked.steps).toEqual([
      { rate: "17¢ each", detail: "× 1,000", amount: "$170.00" },
      { rate: "2.5%", detail: "of $10,000.00", amount: "$250.00" },
      { rate: "1¢/jewel", detail: "× 1,000 jewels", amount: "$10.00" },
    ])
    expect(worked.total).toBe("$430.00")
  })

  it("shows the question the calculator asks instead of a figure it would have to assume", () => {
    const worked = workedExample("43¢ each + 2.8¢/jewel over 7 + 3.7% on the case")
    expect(worked.total).toBe(undefined)
    expect(worked.steps[0].amount).toBe("$430.00")
    expect(worked.steps[1].asks).toBe("How many jewels over 7 are there across the shipment?")
    expect(worked.steps[2].asks).toBe("What is the value of the case?")
  })
})

describe("Social studio odd rates: the list and the post", () => {
  const elements = [
    element("9105", 0, "Other clocks", null),
    element("", 1, "Other", null),
    element("9105.99.10.00", 2, "Standard marine chronometers", "17¢ each + 2.5% + 1¢/jewel", "$4.50 each + 65% + 25¢/jewel"),
    element("6103.22.00", 1, "Ensembles of cotton", "The rate applicable to each garment in the ensemble if separately entered"),
    element("8471.30.01", 1, "Portable computers", "Free", "35%"),
    element("9804.00.60", 1, "Automobiles rented", "Free, for such temporary periods as the Secretary of the Treasury by regulation may prescribe"),
  ]

  it("finds odd rates in General and Column 2, skipping plain rates and Chapter 98", () => {
    const rates = findOddRates(elements)
    expect(rates.map((r) => `${r.htsno} ${r.column} ${r.calculable}`)).toEqual([
      "6103.22.00 general false",
      "9105.99.10.00 general true",
      "9105.99.10.00 other true",
    ])
  })

  it("quotes the rate word for word and every figure in the post is in its captions", () => {
    const odd = findOddRates(elements).find((r) => r.htsno === "9105.99.10.00" && r.column === "general")!
    const post = oddRatePost(odd, ["No."], "dark", "2026-10-22")
    expect(post.props.rate).toBe("17¢ each + 2.5% + 1¢/jewel")
    expect(post.props.headline).toBe("The US tariff on standard marine chronometers is charged per jewel")
    expect(post.props.total).toBe("$430.00")
    expect(post.sources.length).toBe(2)
    const captions = captionsFor(post.template, post.props)
    expect(captions.linkedin.includes('"17¢ each + 2.5% + 1¢/jewel"')).toBe(true)
    const figures = [post.props.total!, ...post.props.steps.map((s) => s.amount ?? "")].join(" ")
    expect(numbersCheck(figures, captions.linkedin)).toBe(true)
  })

  it("says who Column 2 applies to", () => {
    const odd = findOddRates(elements).find((r) => r.column === "other")!
    const post = oddRatePost(odd, ["No."], "dark", "2026-10-22")
    expect(post.props.column).toBe("Column 2 rate")
    expect(post.props.columnNote!.includes("Cuba")).toBe(true)
  })

  it("shortens hooks for a list", () => {
    expect(shortHook("per jewel over 7")).toBe("per jewel over 7")
    expect(shortHook("by the degree of the sugar's polarity")).toBe("by the degree")
    expect(shortHook("partly on the case and strap, band or bracelet")).toBe("on the case")
  })
})
