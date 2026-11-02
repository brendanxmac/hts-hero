import { describe, it, expect } from "./test-runner"
import {
  auditUnlocked,
  canSpendCheck,
  checksLeft,
  freeCheck,
  isSellablePlan,
  isTrackerPlan,
  NO_USAGE,
  planFitting,
  savingsUnlocked,
  trackerAccessFrom,
  trialDaysLeft,
  trialEndsAt,
  previewAccess,
  trialNotStarted,
} from "../libs/tariff-tracker/plan"
import { priceQuote, REVERSE_TRIAL } from "../components/pricing-calculator/lib/pricing"
import { PricingPlan } from "../types"

// Duty Guard's plan rules (PRICING.md): a 14-day reverse trial (everything, 200 imports)
// from the first real imports, then the free plan (no alerts on its own imports; Tariff News alerts only); paid by tier
const usage = (savings: number, audits: number) => ({
  savingsChecked: Array.from({ length: savings }, (_, i) => `610${i}-CN`),
  auditsChecked: Array.from({ length: audits }, (_, i) => `entry-${i}`),
})
const DAY = 86_400_000
// Added their first imports well after the fresh start for existing accounts
const signedUp = "2027-01-10T15:00:00Z"
const inTrial = Date.parse(signedUp) + 3 * DAY
const afterTrial = Date.parse(signedUp) + 15 * DAY

describe("Duty Guard: plans", () => {
  it("a new account is on the 7-day trial: 500 imports, every check", () => {
    const access = trackerAccessFrom({ usage: usage(9, 30), activePlans: [], trialStartedAt: signedUp, now: inTrial })
    expect(access.kind).toBe("trial")
    expect(access.pairLimit).toBe(500)
    expect(access.trialEndsAt).toBe("2027-01-17T15:00:00.000Z")
    expect(trialDaysLeft(access, inTrial)).toBe(4)
    expect(checksLeft(access, "savings")).toBe(Infinity)
    expect(auditUnlocked(access, "never-checked")).toBe(true)
    expect(savingsUnlocked(access, new Set(["7000-MX"])).has("7000-MX")).toBe(true)
  })

  it("after the trial the account is on the free plan: no alerts on its imports", () => {
    const access = trackerAccessFrom({ usage: NO_USAGE, activePlans: [], trialStartedAt: signedUp, now: afterTrial })
    expect(access.kind).toBe("free")
    expect(access.pairLimit).toBe(0)
    expect(access.entitlements.audits).toBe(false)
    expect(access.entitlements.chat).toBe(false)
    expect(trialDaysLeft(access, afterTrial)! < 0).toBe(true)
  })

  it("the admin's trial previews: mid-trial, its last days, just ended", () => {
    const paid = trackerAccessFrom({ usage: NO_USAGE, activePlans: [PricingPlan.TARIFF_TRACKER_30], trialStartedAt: signedUp, now: afterTrial })
    const now = Date.parse(signedUp)
    expect(trialDaysLeft(previewAccess(paid, "trial", now), now)).toBe(10)
    expect(previewAccess(paid, "ending", now).kind).toBe("trial")
    expect(trialDaysLeft(previewAccess(paid, "ending", now), now)).toBe(2)
    const ended = previewAccess(paid, "ended", now)
    expect(ended.kind).toBe("free")
    expect(ended.pairLimit).toBe(0)
    expect(ended.preview).toBe("ended")
  })

  it("before the first imports the trial hasn't started: full access, no end date", () => {
    const access = trackerAccessFrom({ usage: NO_USAGE, activePlans: [], trialStartedAt: null, now: afterTrial })
    expect(access.kind).toBe("trial")
    expect(access.pairLimit).toBe(500)
    expect(access.trialEndsAt).toBe(null)
    expect(trialNotStarted(access)).toBe(true)
    expect(trialDaysLeft(access, afterTrial)).toBe(null)
    expect(trialEndsAt(null)).toBe(null)
  })

  it("trials started before the week-long trial (REVERSE_TRIAL.shortFrom) keep their 14 days", () => {
    const before = new Date(Date.parse(`${REVERSE_TRIAL.shortFrom}T00:00:00Z`) - DAY).toISOString()
    expect(trialEndsAt(before)).toBe(new Date(Date.parse(before) + 14 * DAY).toISOString())
  })

  it("trials started before the fresh start get 14 days from it", () => {
    expect(trialEndsAt("2025-03-01T00:00:00Z")).toBe(new Date(Date.parse(`${REVERSE_TRIAL.freshStartOn}T00:00:00Z`) + 14 * DAY).toISOString())
  })

  it("free accounts get no savings or audit checks after the trial (PRICING.md, 2026-10-22)", () => {
    const access = trackerAccessFrom({ usage: usage(5, 3), activePlans: [], trialStartedAt: signedUp, now: afterTrial })
    expect(checksLeft(access, "savings")).toBe(0)
    expect(checksLeft(access, "audit")).toBe(0)
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

  it("classification plans don't unlock Duty Guard", () => {
    const access = trackerAccessFrom({ usage: NO_USAGE, activePlans: [PricingPlan.CLASSIFY_PRO], trialStartedAt: signedUp, now: afterTrial })
    expect(access.kind).toBe("free")
  })

})

// Which imports are tracked (snapshot.ts coveredKeys, the same rule as TrackerContext's trackedKeys)
import { coveredKeys } from "../libs/tariff-tracker/snapshot"

describe("Duty Guard: tracked imports", () => {
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
import { pickTrialEmail, pickUpsell } from "../libs/email/lifecycle"

describe("Duty Guard: trial emails", () => {
  const created = "2027-01-02T15:00:00Z"
  const started = "2027-01-10T15:00:00Z"
  const at = (days: number) => new Date(Date.parse(started) + days * DAY)
  const none = new Set<string>()

  it("nothing on the first days of the trial", () => {
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: none, now: at(1.5) })).toBe(null)
  })

  it("the lessons: alerts on day 2, savings on day 3, audits on day 5", () => {
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: none, now: at(2.2) })?.key).toBe("trial_lesson_alerts")
    const alerts = new Set(["trial_lesson_alerts"])
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: alerts, now: at(3.2) })?.key).toBe("trial_lesson_savings")
    const both = new Set(["trial_lesson_alerts", "trial_lesson_savings", "trial_ending_3"])
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: both, now: at(5.2) })?.key).toBe("trial_lesson_audits")
  })

  it("a 14-day trial from before shortFrom gets no lessons", () => {
    const old = "2026-10-25T15:00:00Z"
    expect(pickTrialEmail({ startedAt: old, createdAt: old, sent: none, now: new Date(Date.parse(old) + 2.2 * DAY) })).toBe(null)
  })

  it("win-backs 7 and 14 days after it ended", () => {
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: none, now: at(14.2) })?.key).toBe("trial_winback_7")
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: new Set(["trial_winback_7"]), now: at(14.2) })).toBe(null)
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: none, now: at(21.2) })?.key).toBe("trial_winback_14")
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: none, now: at(30) })).toBe(null)
  })

  it("3 days before, then the last day, then the day after", () => {
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: none, now: at(4.2) })?.key).toBe("trial_ending_3")
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: new Set(["trial_ending_3", "trial_lesson_audits"]), now: at(5.5) })).toBe(null)
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: new Set(["trial_ending_3"]), now: at(6.2) })?.key).toBe("trial_ending_1")
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: new Set(["trial_ending_3", "trial_ending_1"]), now: at(7.5) })?.key).toBe("trial_ended")
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: none, now: at(13) })).toBe(null)
  })

  it("a missed 3-day email isn't sent once the last day is due", () => {
    expect(pickTrialEmail({ startedAt: started, createdAt: created, sent: none, now: at(6.5) })?.key).toBe("trial_ending_1")
  })

  it("nothing before the trial starts", () => {
    expect(pickTrialEmail({ startedAt: null, createdAt: created, sent: none, now: at(20) })).toBe(null)
  })

  it("existing accounts with imports hear their trial is unlocked in its first days", () => {
    const fresh = Date.parse(`${REVERSE_TRIAL.freshStartOn}T00:00:00Z`)
    const freshIso = new Date(fresh).toISOString()
    expect(pickTrialEmail({ startedAt: freshIso, createdAt: "2025-05-01T00:00:00Z", sent: none, now: new Date(fresh + 0.5 * DAY) })?.key).toBe("trial_unlocked")
    expect(pickTrialEmail({ startedAt: freshIso, createdAt: "2025-05-01T00:00:00Z", sent: new Set(["trial_unlocked"]), now: new Date(fresh + 0.5 * DAY) })).toBe(null)
    // New accounts don't, nor old ones whose first imports come later
    expect(pickTrialEmail({ startedAt: new Date(fresh + DAY).toISOString(), createdAt: new Date(fresh + DAY).toISOString(), sent: none, now: new Date(fresh + 1.5 * DAY) })).toBe(null)
    expect(pickTrialEmail({ startedAt: new Date(fresh + 2 * DAY).toISOString(), createdAt: "2025-05-01T00:00:00Z", sent: none, now: new Date(fresh + 2.5 * DAY) })).toBe(null)
  })
})

describe("Duty Guard: Duty Guard plans", () => {
  const on = (...activePlans: PricingPlan[]) => trackerAccessFrom({ usage: NO_USAGE, activePlans, trialStartedAt: signedUp, now: afterTrial })

  it("an alerts plan covers its products, without Savings or Audits", () => {
    const access = on(PricingPlan.DUTY_GUARD_ESSENTIALS_25)
    expect(access.kind).toBe("paid")
    expect(access.pairLimit).toBe(25)
    expect(access.entitlements).toEqual({ audits: false, chat: false, alertEmails: 3 })
    expect(canSpendCheck(access, "audit", "entry-1")).toBe(false)
    expect(auditUnlocked(access, "entry-1")).toBe(false)
    expect(savingsUnlocked(access, new Set(["7000-MX"])).has("7000-MX")).toBe(false)
  })

  it("Slack and Teams start at Pro", () => {
    expect(on(PricingPlan.DUTY_GUARD_ESSENTIALS_100).entitlements.chat).toBe(true)
    expect(on(PricingPlan.DUTY_GUARD_PRO_25).entitlements.chat).toBe(false)
    expect(on(PricingPlan.DUTY_GUARD_PRO_500).entitlements).toEqual({ audits: true, chat: true, alertEmails: 20 })
  })

  it("a Duty Guard Pro plan unlocks Savings and Audits and records audits, not savings", () => {
    const access = on(PricingPlan.DUTY_GUARD_PRO_10)
    expect(canSpendCheck(access, "audit", "entry-1")).toBe(true)
    expect(auditUnlocked(access, "entry-1")).toBe(true)
    expect(freeCheck(access, "audit", "entry-1")).toBe(false)
    expect(freeCheck(access, "savings", "7000-MX")).toBe(true)
  })

  it("holding two plans, Duty Guard Pro wins, then the most products", () => {
    expect(on(PricingPlan.DUTY_GUARD_ESSENTIALS_500, PricingPlan.DUTY_GUARD_PRO_10).paidPlan).toBe(PricingPlan.DUTY_GUARD_PRO_10)
    expect(on(PricingPlan.DUTY_GUARD_ESSENTIALS_25, PricingPlan.DUTY_GUARD_ESSENTIALS_100).paidPlan).toBe(PricingPlan.DUTY_GUARD_ESSENTIALS_100)
  })

  it("an old Duty Guard plan keeps its products and everything else", () => {
    const access = on(PricingPlan.TARIFF_TRACKER_30)
    expect(access.pairLimit).toBe(30)
    expect(access.entitlements.audits).toBe(true)
    expect(isTrackerPlan(PricingPlan.TARIFF_TRACKER_30)).toBe(true)
    expect(isSellablePlan(PricingPlan.TARIFF_TRACKER_30)).toBe(false)
  })

  it("the trial has everything", () => {
    const access = trackerAccessFrom({ usage: NO_USAGE, activePlans: [], trialStartedAt: signedUp, now: inTrial })
    expect(access.entitlements).toEqual({ audits: true, chat: true, alertEmails: 20 })
  })

  it("the plan that fits a product count, per offer", () => {
    expect(planFitting("alerts", 11)?.plan).toBe(PricingPlan.DUTY_GUARD_ESSENTIALS_25)
    expect(planFitting("audits", 500)?.plan).toBe(PricingPlan.DUTY_GUARD_PRO_500)
    expect(planFitting("audits", 501)).toBe(null)
  })
})

describe("Pricing page calculator", () => {
  it("adds a tariff plan and a classification plan, monthly", () => {
    const q = priceQuote({ offer: "audits", products: 25, classify: "pro", seats: 1 }, "monthly")
    expect(q.lines.map((l) => l.label)).toEqual(["Duty Guard Pro 25", "Classify Pro"])
    expect(q.monthly).toBe(79 + 89)
  })

  it("annual takes 15% off the tariff plan, rounded down; classification stays monthly", () => {
    const q = priceQuote({ offer: "alerts", products: 100, classify: "starter", seats: 1 }, "annual")
    expect(q.monthly).toBe(33 + 39)
    expect(q.annualSavings).toBe((39 - 33) * 12)
  })

  it("licenses are per person, monthly", () => {
    const q = priceQuote({ offer: "none", products: 1, classify: "licenses", seats: 3 }, "annual")
    expect(q.monthly).toBe(60 * 3)
    expect(q.annualSavings).toBe(0)
  })

  it("past the largest plan the tariff line is a quote, and free is $0", () => {
    const q = priceQuote({ offer: "alerts", products: 501, classify: "none", seats: 1 }, "monthly")
    expect(q.hasQuote).toBe(true)
    expect(q.monthly).toBe(0)
    expect(priceQuote({ offer: "none", products: 1, classify: "none", seats: 1 }, "monthly").lines.length).toBe(0)
  })
})

describe("Duty Guard Pro upsell emails", () => {
  const bought = "2027-01-01T00:00:00Z"
  const at = (days: number) => new Date(Date.parse(bought) + days * DAY)
  it("10 days in, then 20 days in, each once", () => {
    expect(pickUpsell(bought, new Set(), at(9))).toBe(null)
    expect(pickUpsell(bought, new Set(), at(10))?.key).toBe("audits_upsell_1")
    expect(pickUpsell(bought, new Set(["audits_upsell_1"]), at(19))).toBe(null)
    expect(pickUpsell(bought, new Set(["audits_upsell_1"]), at(20))?.key).toBe("audits_upsell_2")
  })
})
