import { describe, it, expect } from "../testing/test-runner"
import type { User } from "@supabase/supabase-js"
import {
  canCreateClassificationFromSnapshot,
  isAnonymousUser,
} from "./can-create-classification"
import { NUM_FREE_CLASSIFICATIONS } from "../constants/classification"

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

  it("allows authenticated paying user regardless of count", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "authenticated",
        isPayingUser: true,
        classificationCount: 99,
      }),
    ).toBe(true)
  })

  it("allows authenticated non-paying user under free limit", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "authenticated",
        isPayingUser: false,
        classificationCount: 0,
      }),
    ).toBe(true)
  })

  it("denies authenticated non-paying user at or over free limit", () => {
    expect(
      canCreateClassificationFromSnapshot({
        mode: "authenticated",
        isPayingUser: false,
        classificationCount: NUM_FREE_CLASSIFICATIONS,
      }),
    ).toBe(false)
  })
})
