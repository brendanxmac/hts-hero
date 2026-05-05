import { describe, it, expect } from "../testing/test-runner"
import type { User } from "@supabase/supabase-js"
import {
  canCreateClassificationFromSnapshot,
  isAnonymousUser,
} from "./can-create-classification"
import {
  NUM_FREE_CLASSIFICATIONS,
  STARTER_MONTHLY_CLASSIFICATION_LIMIT,
} from "../constants/classification"
import { PricingPlan } from "../types"

describe("isAnonymousUser", () => {
  it("returns true when user is null or undefined", () => {
    expect(isAnonymousUser(null)).toBe(true)
    expect(isAnonymousUser(undefined)).toBe(true)
  })

  it("returns false when user is defined", () => {
    expect(isAnonymousUser({ id: "u1" } as User)).toBe(false)
  })
})

describe("canCreateClassificationFromSnapshot", () => {
  it("allows anonymous when count is below max", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "anonymous",
        anonymousClassificationCount: 0,
      }),
    ).toBe(true)
  })

  it("denies anonymous when at or above max", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "anonymous",
        anonymousClassificationCount: 1,
      }),
    ).toBe(false)
    expect(
      canCreateClassificationFromSnapshot({
        mode: "anonymous",
        anonymousClassificationCount: 2,
      }),
    ).toBe(false)
  })

  it("allows authenticated Pro user regardless of count", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "authenticated",
        isPayingUser: true,
        classifyPlan: PricingPlan.CLASSIFY_PRO,
        isOnTeam: false,
        classificationCount: 99,
      }),
    ).toBe(true)
  })

  it("allows authenticated team user regardless of count or payment", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "authenticated",
        isPayingUser: false,
        isOnTeam: true,
        classificationCount: 99,
      }),
    ).toBe(true)
  })

  it("allows authenticated non-paying solo user under free limit", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "authenticated",
        isPayingUser: false,
        isOnTeam: false,
        classificationCount: 0,
      }),
    ).toBe(true)
  })

  it("denies authenticated non-paying solo user at or over free limit", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "authenticated",
        isPayingUser: false,
        isOnTeam: false,
        classificationCount: NUM_FREE_CLASSIFICATIONS,
      }),
    ).toBe(false)
  })

  it("allows Starter user under monthly limit", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "authenticated",
        isPayingUser: true,
        classifyPlan: PricingPlan.CLASSIFY_STARTER,
        isOnTeam: false,
        classificationCount: 50,
        monthlyUsed: STARTER_MONTHLY_CLASSIFICATION_LIMIT - 1,
      }),
    ).toBe(true)
  })

  it("denies Starter user at monthly limit", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "authenticated",
        isPayingUser: true,
        classifyPlan: PricingPlan.CLASSIFY_STARTER,
        isOnTeam: false,
        classificationCount: 50,
        monthlyUsed: STARTER_MONTHLY_CLASSIFICATION_LIMIT,
      }),
    ).toBe(false)
  })

  it("allows Starter user on a team even if at monthly limit", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "authenticated",
        isPayingUser: true,
        classifyPlan: PricingPlan.CLASSIFY_STARTER,
        isOnTeam: true,
        classificationCount: 50,
        monthlyUsed: STARTER_MONTHLY_CLASSIFICATION_LIMIT,
      }),
    ).toBe(true)
  })
})
