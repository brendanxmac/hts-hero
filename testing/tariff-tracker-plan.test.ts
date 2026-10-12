import { describe, it, expect } from "./test-runner"
import {
  canStartTrial,
  isPremium,
  trackerAccessFrom,
  trialDaysLeft,
  trialEndFrom,
} from "../libs/tariff-tracker/plan"
import { PricingPlan } from "../types"

// The Tariff Tracker's plan rules (PRICING.md): free tracks 3, one 14-day trial of 100, paid by tier
const NOW = new Date("2026-10-11T12:00:00Z")
const trialFrom = (start: string) => ({ startedAt: start, endsAt: trialEndFrom(new Date(start)).toISOString() })

describe("Tariff Tracker: plans", () => {
  it("a new account is on the free plan, tracks 3 and can start its trial", () => {
    const access = trackerAccessFrom({ trial: null, activePlans: [], now: NOW })
    expect(access.kind).toBe("free")
    expect(access.pairLimit).toBe(3)
    expect(isPremium(access)).toBe(false)
    expect(canStartTrial(access)).toBe(true)
  })

  it("a running trial tracks 100 and unlocks everything for 14 days", () => {
    const access = trackerAccessFrom({ trial: trialFrom("2026-10-05T12:00:00Z"), activePlans: [], now: NOW })
    expect(access.kind).toBe("trial")
    expect(access.pairLimit).toBe(100)
    expect(isPremium(access)).toBe(true)
    expect(trialDaysLeft(access, NOW)).toBe(8)
  })

  it("after the trial the account is back on the free plan and can't start another", () => {
    const access = trackerAccessFrom({ trial: trialFrom("2026-09-01T12:00:00Z"), activePlans: [], now: NOW })
    expect(access.kind).toBe("free")
    expect(access.pairLimit).toBe(3)
    expect(canStartTrial(access)).toBe(false)
  })

  it("a paid plan tracks its tier, and the largest active plan wins", () => {
    const access = trackerAccessFrom({
      trial: null,
      activePlans: [PricingPlan.TARIFF_TRACKER_30, PricingPlan.TARIFF_TRACKER_500, PricingPlan.CLASSIFY_PRO],
      now: NOW,
    })
    expect(access.kind).toBe("paid")
    expect(access.paidPlan).toBe(PricingPlan.TARIFF_TRACKER_500)
    expect(access.pairLimit).toBe(500)
    expect(canStartTrial(access)).toBe(false)
  })

  it("classification plans don't unlock the Tracker", () => {
    const access = trackerAccessFrom({ trial: null, activePlans: [PricingPlan.CLASSIFY_PRO], now: NOW })
    expect(access.kind).toBe("free")
  })
})
