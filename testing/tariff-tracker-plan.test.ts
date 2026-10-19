import { describe, it, expect } from "./test-runner"
import {
  auditUnlocked,
  canSpendCheck,
  checksLeft,
  NO_USAGE,
  savingsUnlocked,
  trackerAccessFrom,
  trialDaysLeft,
  trialEndsAt,
  previewAccess,
} from "../libs/tariff-tracker/plan"
import { REVERSE_TRIAL, trackerTierFor } from "../components/pricing-calculator/lib/pricing"
import { PricingPlan } from "../types"

// The Tariff Tracker's plan rules (PRICING.md): a 14-day reverse trial (everything, 200 imports)
// from sign-up, then the free plan (no alerts on its own imports; Tariff News alerts only); paid by tier
const usage = (savings: number, audits: number) => ({
  savingsChecked: Array.from({ length: savings }, (_, i) => `610${i}-CN`),
  auditsChecked: Array.from({ length: audits }, (_, i) => `entry-${i}`),
})
const DAY = 86_400_000
// Signed up well after the fresh start for existing accounts
const signedUp = "2027-01-10T15:00:00Z"
const inTrial = Date.parse(signedUp) + 3 * DAY
const afterTrial = Date.parse(signedUp) + 15 * DAY

describe("Tariff Tracker: plans", () => {
  it("a new account is on the 14-day trial: 200 imports, every check", () => {
    const access = trackerAccessFrom({ usage: usage(9, 30), activePlans: [], createdAt: signedUp, now: inTrial })
    expect(access.kind).toBe("trial")
    expect(access.pairLimit).toBe(200)
    expect(access.trialEndsAt).toBe("2027-01-24T15:00:00.000Z")
    expect(trialDaysLeft(access, inTrial)).toBe(11)
    expect(checksLeft(access, "savings")).toBe(Infinity)
    expect(auditUnlocked(access, "never-checked")).toBe(true)
    expect(savingsUnlocked(access, new Set(["7000-MX"])).has("7000-MX")).toBe(true)
  })

  it("after 14 days the account is on the free plan: no alerts on its imports", () => {
    const access = trackerAccessFrom({ usage: NO_USAGE, activePlans: [], createdAt: signedUp, now: afterTrial })
    expect(access.kind).toBe("free")
    expect(access.pairLimit).toBe(0)
    expect(trialDaysLeft(access, afterTrial)! < 0).toBe(true)
  })

  it("the admin's trial previews: mid-trial, its last days, just ended", () => {
    const paid = trackerAccessFrom({ usage: NO_USAGE, activePlans: [PricingPlan.TARIFF_TRACKER_30], createdAt: signedUp, now: afterTrial })
    const now = Date.parse(signedUp)
    expect(trialDaysLeft(previewAccess(paid, "trial", now), now)).toBe(10)
    expect(previewAccess(paid, "ending", now).kind).toBe("trial")
    expect(trialDaysLeft(previewAccess(paid, "ending", now), now)).toBe(2)
    const ended = previewAccess(paid, "ended", now)
    expect(ended.kind).toBe("free")
    expect(ended.pairLimit).toBe(0)
    expect(ended.preview).toBe("ended")
  })

  it("accounts made before the fresh start get 14 days from it", () => {
    expect(trialEndsAt("2025-03-01T00:00:00Z")).toBe(new Date(Date.parse(`${REVERSE_TRIAL.freshStartOn}T00:00:00Z`) + 14 * DAY).toISOString())
  })

  it("free accounts' checks count down and stop at the allowance", () => {
    const access = trackerAccessFrom({ usage: usage(5, 3), activePlans: [], createdAt: signedUp, now: afterTrial })
    expect(checksLeft(access, "savings")).toBe(0)
    expect(checksLeft(access, "audit")).toBe(7)
    expect(canSpendCheck(access, "savings", "9999-VN")).toBe(false)
    // One checked before costs nothing again
    expect(canSpendCheck(access, "savings", "6100-CN")).toBe(true)
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
    const access = trackerAccessFrom({ usage: NO_USAGE, activePlans: [PricingPlan.CLASSIFY_PRO], createdAt: signedUp, now: afterTrial })
    expect(access.kind).toBe("free")
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

// Which imports are tracked (snapshot.ts coveredKeys, the same rule as TrackerContext's trackedKeys)
import { coveredKeys } from "../libs/tariff-tracker/snapshot"

describe("Tariff Tracker: tracked imports", () => {
  const item = (code: string, covered?: boolean) => ({ code, country: "CN", ...(covered === undefined ? {} : { covered }) }) as any
  const product = (code: string, duty: number) => ({ key: `${code}-CN`, result: { totalDuty: duty } }) as any
  const products = [product("1", 10), product("2", 50), product("3", 30), product("4", 40)]

  it("before any choice, the highest-duty imports up to the limit", () => {
    const keys = coveredKeys(["1", "2", "3", "4"].map((c) => item(c)), products, 2)
    expect([...Array.from(keys)].sort().join()).toBe("2-CN,4-CN")
  })

  it("once the user chooses, exactly their picks: untracking frees a slot", () => {
    const keys = coveredKeys([item("1"), item("2", false), item("3"), item("4", true)], products, 2)
    expect(Array.from(keys).join()).toBe("4-CN")
  })

  it("picks never go past the limit", () => {
    const keys = coveredKeys([item("1", true), item("2", true), item("3", true)], products, 2)
    expect(keys.size).toBe(2)
  })
})

// The trial's emails (libs/email/lifecycle.ts pickTrialEmail): 3 days before, the last day, the
// day after; existing accounts get "unlocked" as their fresh trial starts
import { pickTrialEmail } from "../libs/email/lifecycle"

describe("Tariff Tracker: trial emails", () => {
  const created = "2027-01-10T15:00:00Z"
  const at = (days: number) => new Date(Date.parse(created) + days * DAY)
  const none = new Set<string>()

  it("nothing mid-trial", () => {
    expect(pickTrialEmail({ createdAt: created, sent: none, now: at(5) })).toBe(null)
  })

  it("3 days before, then the last day, then the day after", () => {
    expect(pickTrialEmail({ createdAt: created, sent: none, now: at(11.2) })?.key).toBe("trial_ending_3")
    expect(pickTrialEmail({ createdAt: created, sent: new Set(["trial_ending_3"]), now: at(12.5) })).toBe(null)
    expect(pickTrialEmail({ createdAt: created, sent: new Set(["trial_ending_3"]), now: at(13.2) })?.key).toBe("trial_ending_1")
    expect(pickTrialEmail({ createdAt: created, sent: new Set(["trial_ending_3", "trial_ending_1"]), now: at(14.5) })?.key).toBe("trial_ended")
    expect(pickTrialEmail({ createdAt: created, sent: none, now: at(20) })).toBe(null)
  })

  it("a missed 3-day email isn't sent once the last day is due", () => {
    expect(pickTrialEmail({ createdAt: created, sent: none, now: at(13.5) })?.key).toBe("trial_ending_1")
  })

  it("existing accounts hear their trial is unlocked in its first days", () => {
    const fresh = Date.parse(`${REVERSE_TRIAL.freshStartOn}T00:00:00Z`)
    expect(pickTrialEmail({ createdAt: "2025-05-01T00:00:00Z", sent: none, now: new Date(fresh + 0.5 * DAY) })?.key).toBe("trial_unlocked")
    expect(pickTrialEmail({ createdAt: "2025-05-01T00:00:00Z", sent: new Set(["trial_unlocked"]), now: new Date(fresh + 0.5 * DAY) })).toBe(null)
    // New accounts don't
    expect(pickTrialEmail({ createdAt: new Date(fresh + DAY).toISOString(), sent: none, now: new Date(fresh + 1.5 * DAY) })).toBe(null)
  })
})
