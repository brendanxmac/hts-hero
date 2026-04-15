import {
  type PreliminaryCandidate,
  ClassificationI as ClassificationType,
  ClassificationRecord,
  ClassificationStatus,
} from "../interfaces/hts"
import { getSectionAndChapterFromHtsCode } from "./hts"

/**
 * True when classification has section/chapter discovery data (preliminaryLevels).
 */
export function hasPreliminaryLevels(
  classification: ClassificationType | null | undefined,
): boolean {
  return !!(classification?.preliminaryLevels?.length ?? 0)
}

/**
 * Old classifications were completed before the section/chapter discovery flow.
 * They have levels with selections (the HTS path) but no preliminaryLevels.
 * We should NOT fetch section/chapter candidates for these.
 */
export function shouldSkipSectionChapterDiscovery(
  classification: ClassificationType | null | undefined,
): boolean {
  if (!classification) return true
  if (hasPreliminaryLevels(classification)) return false
  return classification.levels?.some((l) => l.selection) ?? false
}
import { UserProfile, UserRole } from "./supabase/user"
import { Countries, Country } from "../constants/countries"

/**
 * Get the latest HTS code from classification levels
 */
export function getLatestHtsCode(
  levels: ClassificationType["levels"] | undefined,
): string | null {
  if (!levels) return null

  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i]
    if (level.selection?.htsno) {
      return level.selection.htsno
    }
  }
  return null
}

/**
 * Get country of origin from classification record
 */
export function getCountryOfOrigin(
  countryCode: string | undefined,
): Country | null {
  if (!countryCode) return null
  return Countries.find((c) => c.code === countryCode) || null
}

/**
 * Check if user can update classification details.
 * Owner, super admin, or team admin (same team on row, or legacy row + owner on same team) can update.
 *
 * @param ownerTeamInfo Pass when the row has no `classificationRecord.team_id` but the owner's
 * `users.team_id` is known (e.g. after `fetchUser(record.user_id)`).
 */
export function canUserUpdateDetails(
  userProfile: UserProfile | null,
  classificationRecord: ClassificationRecord | undefined,
  opts?: {
    anonymousEditorClassificationId?: string | null
  },
): boolean {
  if (!classificationRecord) return false

  if (userProfile) {
    if (userProfile.id === classificationRecord.user_id) return true

    const isAdmin = userProfile.role === UserRole.ADMIN
    const isOnTeam = !!userProfile.team_id
    const isOnSameTeamAsClassification =
      classificationRecord.team_id === userProfile.team_id

    if (userProfile.role === UserRole.SUPER_ADMIN) return true

    if (isAdmin && isOnTeam && isOnSameTeamAsClassification) {
      return true
    }

    return false
  }

  if (
    classificationRecord.user_id == null &&
    opts?.anonymousEditorClassificationId != null &&
    opts.anonymousEditorClassificationId === classificationRecord.id
  ) {
    return true
  }

  return false
}

/**
 * True when the signed-in user is in the same workspace as this classification
 * (owner, or same team via row `team_id`).
 * Used for nav/footer chrome; does not imply edit permission.
 */
export function recordIsFromUsersTeam(
  userProfile: UserProfile | null | undefined,
  classificationRecord: ClassificationRecord | undefined,
): boolean {
  if (!userProfile || !classificationRecord?.user_id) return false

  const recordUserId = classificationRecord?.user_id
  const userId = userProfile.id

  if (recordUserId && recordUserId === userId) return true

  const userTeamId = userProfile.team_id

  if (!userTeamId) return false

  const recordTeamId = classificationRecord.team_id

  if (recordTeamId && recordTeamId === userTeamId) {
    return true
  }

  return false
}

/**
 * Check if user can delete classification
 */
export function canUserDelete(
  userProfile: UserProfile | null,
  classificationRecord: ClassificationRecord | undefined,
): boolean {
  return (
    userProfile?.id === classificationRecord?.user_id &&
    classificationRecord?.status === ClassificationStatus.DRAFT
  )
}

/**
 * Section/chapter to show in nav when the user has a first-level HTS selection:
 * derive from that code instead of preliminary candidate list order (candidates[0]).
 */
export function getPreferredPreliminarySectionChapterIds(
  classification: ClassificationType,
): { sectionId: number | null; chapterId: number | null } {
  const level0Selection = classification.levels?.[0]?.selection
  if (!level0Selection) {
    return { sectionId: null, chapterId: null }
  }
  const parsedGeo = level0Selection.htsno
    ? getSectionAndChapterFromHtsCode(level0Selection.htsno)
    : null
  const parsedFromChapterOnly =
    parsedGeo == null && level0Selection.chapter != null
      ? getSectionAndChapterFromHtsCode(
          `${String(level0Selection.chapter).padStart(2, "0")}01`,
        )
      : null
  const geo = parsedGeo ?? parsedFromChapterOnly
  return {
    sectionId: geo?.section ?? null,
    chapterId: geo?.chapter ?? level0Selection.chapter ?? null,
  }
}

export function preliminaryNavDisplay(
  kind: "section" | "chapter",
  candidates: PreliminaryCandidate[] | undefined,
  preferredId: number | null,
  fallback: PreliminaryCandidate | undefined,
): { htsno?: string; selectionDescription?: string } {
  const label = kind === "section" ? "Section" : "Chapter"
  if (preferredId != null) {
    const match = candidates?.find((c) => c.identifier === preferredId)
    if (match) {
      return {
        htsno: `${label} ${match.identifier}`,
        selectionDescription: match.description,
      }
    }
    return {
      htsno: `${label} ${preferredId}`,
      selectionDescription: undefined,
    }
  }
  if (fallback) {
    return {
      htsno: `${label} ${fallback.identifier}`,
      selectionDescription: fallback.description,
    }
  }
  return {}
}
