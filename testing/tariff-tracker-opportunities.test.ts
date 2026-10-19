import { describe, it, expect } from "./test-runner"
import { Opportunity } from "../components/tariff-tracker/opportunities/OpportunitiesContext"
import { tallyOpportunities } from "../components/tariff-tracker/opportunities/tallies"
import { isOpen } from "../components/tariff-tracker/opportunities/statuses"
import { supplyOf } from "../components/tariff-tracker/insights/savings"
import { reviewOf, reviewStats } from "../components/tariff-tracker/opportunities/review"

// Tallies of savings found and secured (product Savings tab, catalog Savings tab)
const opp = (productKey: string, status: Opportunity["status"], usd: number): Opportunity => ({
  id: `${productKey}-${status}-${usd}`,
  productKey,
  kind: "program",
  optionRef: "S",
  title: "Claim it",
  status,
  rateBefore: 10,
  rateAfter: 5,
  usdPerShipment: usd,
  note: null,
  securedAt: null,
  createdAt: "2026-10-13T00:00:00Z",
  updatedAt: "2026-10-13T00:00:00Z",
})

describe("Tariff Tracker: savings tallies", () => {
  it("secured savings add up, per shipment and per year", () => {
    const t = tallyOpportunities([opp("A", "secured", 100), opp("B", "secured", 50)], (k) => (k === "A" ? 12 : 1))
    expect(t.secured.count).toBe(2)
    expect(t.secured.perShipment).toBe(150)
    expect(t.secured.perYear).toBe(1250)
  })

  it("the pipeline counts the best open saving on each product once", () => {
    const t = tallyOpportunities(
      [opp("A", "researching", 100), opp("A", "found", 300), opp("B", "in_progress", 40), opp("C", "not_eligible", 999)],
      () => 2
    )
    expect(t.pipeline.count).toBe(3)
    expect(t.pipeline.perShipment).toBe(340)
    expect(t.pipeline.perYear).toBe(680)
    expect(t.notEligible).toBe(1)
  })

  it("secured and ruled-out savings aren't open", () => {
    expect(isOpen("found")).toBe(true)
    expect(isOpen("in_progress")).toBe(true)
    expect(isOpen("secured")).toBe(false)
    expect(isOpen("not_eligible")).toBe(false)
  })
})

describe("Tariff Tracker: origin supply (Census)", () => {
  const imports = { year: 2025, prior: 2024, level: 10 as const, totalValue: 5_000_000, byCountry: new Map([["VN", { value: 5_000_000, prior: 4_000_000 }], ["MX", { value: 0, prior: 10 }]]) }

  it("a country the US imported the product from is proven", () => {
    expect(supplyOf(imports, "VN")).toBe("proven")
  })

  it("one with no imports on record is unproven, even with an earlier year's", () => {
    expect(supplyOf(imports, "MX")).toBe("unproven")
    expect(supplyOf(imports, "KH")).toBe("unproven")
  })

  it("with no Census figures for the code, capacity is unknown", () => {
    expect(supplyOf(null, "VN")).toBe("unknown")
  })
})

describe("Tariff Tracker: savings review", () => {
  const savings = [
    { kind: "program" as const, ref: "S" },
    { kind: "exemption" as const, ref: "confirm:donation" },
    { kind: "origin" as const, ref: "MX:S" },
  ]
  const o = (kind: "program" | "exemption" | "origin", optionRef: string, status: Opportunity["status"]) => ({ kind, optionRef, status })

  it("isn't reviewed before a savings check", () => {
    expect(reviewOf(false, savings, [])).toBe("unchecked")
  })

  it("is to review once checked, with nothing decided", () => {
    expect(reviewOf(true, savings, [])).toBe("to_review")
  })

  it("is reviewed once every quick win is secured or ruled out, whatever sourcing's status", () => {
    expect(reviewOf(true, savings, [o("program", "S", "secured"), o("exemption", "confirm:donation", "not_eligible")])).toBe("reviewed")
    expect(
      reviewOf(true, savings, [o("program", "S", "not_eligible"), o("exemption", "confirm:donation", "not_eligible"), o("origin", "MX:S", "researching")])
    ).toBe("reviewed")
  })

  it("is being reviewed while some quick wins are still open", () => {
    expect(reviewOf(true, savings, [o("program", "S", "not_eligible")])).toBe("in_progress")
    expect(reviewOf(true, savings, [o("origin", "MX:S", "researching")])).toBe("in_progress")
  })

  it("an import with no quick wins is reviewed as soon as it's checked", () => {
    expect(reviewOf(true, [{ kind: "origin", ref: "VN" }], [])).toBe("reviewed")
  })

  it("counts the share of the catalog reviewed", () => {
    const stats = reviewStats(["reviewed", "reviewed", "in_progress", "to_review", "unchecked"])
    expect(stats.total).toBe(5)
    expect(stats.checked).toBe(4)
    expect(stats.reviewed).toBe(2)
    expect(stats.inProgress).toBe(1)
  })
})
