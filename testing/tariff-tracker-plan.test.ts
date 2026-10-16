import { describe, it, expect } from "./test-runner"
import {
  auditUnlocked,
  canSpendCheck,
  checksLeft,
  NO_USAGE,
  savingsUnlocked,
  trackerAccessFrom,
} from "../libs/tariff-tracker/plan"
import { trackerTierFor } from "../components/pricing-calculator/lib/pricing"
import { PricingPlan } from "../types"

// The Tariff Tracker's plan rules (PRICING.md): every account is on the usage-based trial (5
// savings checks, 10 audit checks, alerts on 10 imports, never reset); paid by tier
const usage = (savings: number, audits: number) => ({
  savingsChecked: Array.from({ length: savings }, (_, i) => `610${i}-CN`),
  auditsChecked: Array.from({ length: audits }, (_, i) => `entry-${i}`),
})

describe("Tariff Tracker: plans", () => {
  it("a new account is on the trial, with every check left", () => {
    const access = trackerAccessFrom({ usage: NO_USAGE, activePlans: [] })
    expect(access.kind).toBe("trial")
    expect(access.pairLimit).toBe(5)
    expect(checksLeft(access, "savings")).toBe(5)
    expect(checksLeft(access, "audit")).toBe(10)
  })

  it("spent checks count down and stop at the allowance", () => {
    const access = trackerAccessFrom({ usage: usage(5, 3), activePlans: [] })
    expect(checksLeft(access, "savings")).toBe(0)
    expect(checksLeft(access, "audit")).toBe(7)
    expect(canSpendCheck(access, "savings", "9999-VN")).toBe(false)
    // One checked before costs nothing again
    expect(canSpendCheck(access, "savings", "6100-CN")).toBe(true)
  })

  it("savings show on checked imports only, on the trial", () => {
    const access = trackerAccessFrom({ usage: usage(2, 0), activePlans: [] })
    const unlocked = savingsUnlocked(access, new Set(["7000-MX"]))
    expect(unlocked.has("6100-CN")).toBe(true)
    expect(unlocked.has("7000-MX")).toBe(false)
  })

  it("the largest paid plan wins, with unlimited audits and savings on covered imports", () => {
    const access = trackerAccessFrom({
      usage: usage(1, 12),
      activePlans: [PricingPlan.TARIFF_TRACKER_10, PricingPlan.TARIFF_TRACKER_500, PricingPlan.CLASSIFY_PRO],
    })
    expect(access.kind).toBe("paid")
    expect(access.paidPlan).toBe(PricingPlan.TARIFF_TRACKER_500)
    expect(access.pairLimit).toBe(500)
    expect(checksLeft(access, "audit")).toBe(Infinity)
    expect(auditUnlocked(access, "never-checked")).toBe(true)
    const unlocked = savingsUnlocked(access, new Set(["7000-MX"]))
    expect(unlocked.has("7000-MX")).toBe(true)
    expect(unlocked.has("6100-CN")).toBe(true)
  })

  it("classification plans don't unlock the Tracker", () => {
    const access = trackerAccessFrom({ usage: NO_USAGE, activePlans: [PricingPlan.CLASSIFY_PRO] })
    expect(access.kind).toBe("trial")
  })

  it("tiers: $12 to 10, $29 to 30, $89 to 100, $149 to 500, then quoted", () => {
    expect(trackerTierFor(3)?.price).toBe(12)
    expect(trackerTierFor(10)?.price).toBe(12)
    expect(trackerTierFor(11)?.price).toBe(29)
    expect(trackerTierFor(100)?.price).toBe(89)
    expect(trackerTierFor(500)?.price).toBe(149)
    expect(trackerTierFor(501)).toBe(null)
  })
})
