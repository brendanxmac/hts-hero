import { describe, it, expect } from "../testing/test-runner"
import {
  canUserUpdateDetails,
  recordIsFromUsersTeam,
  canUserDelete,
  hasPreliminaryLevels,
  shouldSkipSectionChapterDiscovery,
} from "./classification-helpers"
import { UserProfile, UserRole } from "./supabase/user"
import { ClassificationRecord, ClassificationStatus } from "../interfaces/hts"

const baseProfile = (overrides: Partial<UserProfile>): UserProfile =>
  ({
    id: "user-1",
    email: "u1@test.com",
    role: UserRole.USER,
    team_id: "team-a",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    ...overrides,
  }) as UserProfile

const baseRecord = (
  overrides: Partial<ClassificationRecord>,
): ClassificationRecord =>
  ({
    id: "class-1",
    user_id: "user-1",
    team_id: "team-a",
    status: ClassificationStatus.DRAFT,
    ...overrides,
  }) as ClassificationRecord

describe("canUserUpdateDetails", () => {
  it("owner can update their own classification", () => {
    const profile = baseProfile({ id: "user-1" })
    const record = baseRecord({ user_id: "user-1" })
    expect(canUserUpdateDetails(profile, record)).toBe(true)
  })

  it("team member (non-admin) cannot update another team member's classification", () => {
    const profile = baseProfile({
      id: "user-2",
      role: UserRole.USER,
      team_id: "team-a",
    })
    const record = baseRecord({ user_id: "user-1", team_id: "team-a" })
    expect(canUserUpdateDetails(profile, record)).toBe(false)
  })

  it("team admin can update team classification", () => {
    const profile = baseProfile({
      id: "user-2",
      role: UserRole.ADMIN,
      team_id: "team-a",
    })
    const record = baseRecord({ user_id: "user-1", team_id: "team-a" })
    expect(canUserUpdateDetails(profile, record)).toBe(true)
  })

  it("team admin cannot update classification from different team", () => {
    const profile = baseProfile({
      id: "user-2",
      role: UserRole.ADMIN,
      team_id: "team-a",
    })
    const record = baseRecord({ user_id: "user-1", team_id: "team-b" })
    expect(canUserUpdateDetails(profile, record)).toBe(false)
  })

  it("super admin can update any classification", () => {
    const profile = baseProfile({ id: "user-2", role: UserRole.SUPER_ADMIN })
    const record = baseRecord({ user_id: "user-1", team_id: "team-b" })
    expect(canUserUpdateDetails(profile, record)).toBe(true)
  })

  it("returns false when userProfile is null", () => {
    const record = baseRecord({ user_id: "user-1" })
    expect(canUserUpdateDetails(null, record)).toBe(false)
  })

  it("allows anonymous editor when id matches opts and row has no user_id", () => {
    const record = baseRecord({
      id: "anon-class-1",
      user_id: null as unknown as string,
      team_id: null as unknown as string,
    })
    expect(
      canUserUpdateDetails(null, record, {
        anonymousEditorClassificationId: "anon-class-1",
      }),
    ).toBe(true)
  })

  it("denies anonymous editor when id does not match opts", () => {
    const record = baseRecord({
      id: "anon-class-1",
      user_id: null as unknown as string,
    })
    expect(
      canUserUpdateDetails(null, record, {
        anonymousEditorClassificationId: "other-id",
      }),
    ).toBe(false)
  })

  it("denies anonymous editor when row has user_id", () => {
    const record = baseRecord({ id: "owned", user_id: "user-1" })
    expect(
      canUserUpdateDetails(null, record, {
        anonymousEditorClassificationId: "owned",
      }),
    ).toBe(false)
  })

  it("returns false when classificationRecord is undefined", () => {
    const profile = baseProfile({ id: "user-1" })
    expect(canUserUpdateDetails(profile, undefined)).toBe(false)
  })

  it("team admin without team_id cannot update", () => {
    const profile = baseProfile({
      id: "user-2",
      role: UserRole.ADMIN,
      team_id: undefined,
    })
    const record = baseRecord({ user_id: "user-1", team_id: "team-a" })
    expect(canUserUpdateDetails(profile, record)).toBe(false)
  })

  it("team admin cannot update legacy row (null team_id) without owner team info", () => {
    const profile = baseProfile({
      id: "user-2",
      role: UserRole.ADMIN,
      team_id: "team-a",
    })
    const record = baseRecord({ user_id: "user-1", team_id: undefined })
    expect(canUserUpdateDetails(profile, record)).toBe(false)
  })
})

describe("isViewerOnClassificationTeam", () => {
  it("returns true for owner", () => {
    const profile = baseProfile({ id: "user-1", team_id: "team-a" })
    const record = baseRecord({ user_id: "user-1", team_id: "team-b" })
    expect(recordIsFromUsersTeam(profile, record)).toBe(true)
  })

  it("returns true for owner without team_id", () => {
    const profile = baseProfile({ id: "user-1", team_id: undefined })
    const record = baseRecord({ user_id: "user-1" })
    expect(recordIsFromUsersTeam(profile, record)).toBe(true)
  })

  it("returns true for teammate (non-admin) when row has matching team_id", () => {
    const profile = baseProfile({
      id: "user-2",
      role: UserRole.USER,
      team_id: "team-a",
    })
    const record = baseRecord({ user_id: "user-1", team_id: "team-a" })
    expect(recordIsFromUsersTeam(profile, record)).toBe(true)
  })

  it("returns false for user on different team", () => {
    const profile = baseProfile({ id: "user-2", team_id: "team-a" })
    const record = baseRecord({ user_id: "user-1", team_id: "team-b" })
    expect(recordIsFromUsersTeam(profile, record)).toBe(false)
  })

  it("returns false when user has no team_id and is not owner", () => {
    const profile = baseProfile({ id: "user-2", team_id: undefined })
    const record = baseRecord({ user_id: "user-1", team_id: "team-a" })
    expect(recordIsFromUsersTeam(profile, record)).toBe(false)
  })

  it("returns false for legacy row without owner team info", () => {
    const profile = baseProfile({ id: "user-2", team_id: "team-a" })
    const record = baseRecord({ user_id: "user-1", team_id: undefined })
    expect(recordIsFromUsersTeam(profile, record)).toBe(false)
  })

  it("returns false when userProfile is null", () => {
    const record = baseRecord({ user_id: "user-1" })
    expect(recordIsFromUsersTeam(null, record)).toBe(false)
  })

  it("returns false when classificationRecord is undefined", () => {
    const profile = baseProfile({ id: "user-1" })
    expect(recordIsFromUsersTeam(profile, undefined)).toBe(false)
  })
})

describe("canUserDelete", () => {
  it("owner can delete their own draft", () => {
    const profile = baseProfile({ id: "user-1" })
    const record = baseRecord({
      user_id: "user-1",
      status: ClassificationStatus.DRAFT,
    })
    expect(canUserDelete(profile, record)).toBe(true)
  })

  it("owner cannot delete completed classification", () => {
    const profile = baseProfile({ id: "user-1" })
    const record = baseRecord({
      user_id: "user-1",
      status: ClassificationStatus.FINAL,
    })
    expect(canUserDelete(profile, record)).toBe(false)
  })

  it("team admin cannot delete team member's classification", () => {
    const profile = baseProfile({
      id: "user-2",
      role: UserRole.ADMIN,
      team_id: "team-a",
    })
    const record = baseRecord({
      user_id: "user-1",
      team_id: "team-a",
      status: ClassificationStatus.DRAFT,
    })
    expect(canUserDelete(profile, record)).toBe(false)
  })

  it("returns false when userProfile is null", () => {
    const record = baseRecord({
      user_id: "user-1",
      status: ClassificationStatus.DRAFT,
    })
    expect(canUserDelete(null, record)).toBe(false)
  })
})

describe("hasPreliminaryLevels", () => {
  it("returns true when preliminaryLevels has items", () => {
    const classification = {
      preliminaryLevels: [
        { level: "section" as const, candidates: [], analysis: "" },
      ],
    }
    expect(hasPreliminaryLevels(classification)).toBe(true)
  })

  it("returns false when preliminaryLevels is empty", () => {
    const classification = { preliminaryLevels: [] }
    expect(hasPreliminaryLevels(classification)).toBe(false)
  })

  it("returns false when preliminaryLevels is undefined", () => {
    const classification = {}
    expect(hasPreliminaryLevels(classification)).toBe(false)
  })

  it("returns false when classification is null", () => {
    expect(hasPreliminaryLevels(null)).toBe(false)
  })
})

describe("shouldSkipSectionChapterDiscovery", () => {
  it("returns true for old classification (levels with selections, no preliminaryLevels)", () => {
    const classification = {
      preliminaryLevels: [],
      levels: [
        { selection: { htsno: "1234", description: "x" }, candidates: [] },
      ],
    }
    expect(shouldSkipSectionChapterDiscovery(classification)).toBe(true)
  })

  it("returns false when classification has preliminaryLevels", () => {
    const classification = {
      preliminaryLevels: [
        { level: "section" as const, candidates: [], analysis: "" },
      ],
      levels: [
        { selection: { htsno: "1234", description: "x" }, candidates: [] },
      ],
    }
    expect(shouldSkipSectionChapterDiscovery(classification)).toBe(false)
  })

  it("returns false for new classification (no levels with selections)", () => {
    const classification = {
      preliminaryLevels: [],
      levels: [{ candidates: [] }],
    }
    expect(shouldSkipSectionChapterDiscovery(classification)).toBe(false)
  })

  it("returns true when classification is null", () => {
    expect(shouldSkipSectionChapterDiscovery(null)).toBe(true)
  })
})
