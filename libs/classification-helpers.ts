import {
  ClassificationI as ClassificationType,
  ClassificationRecord,
  ClassificationStatus,
} from "../interfaces/hts";

/**
 * True when classification has section/chapter discovery data (preliminaryLevels).
 */
export function hasPreliminaryLevels(
  classification: ClassificationType | null | undefined
): boolean {
  return !!(classification?.preliminaryLevels?.length ?? 0);
}

/**
 * Old classifications were completed before the section/chapter discovery flow.
 * They have levels with selections (the HTS path) but no preliminaryLevels.
 * We should NOT fetch section/chapter candidates for these.
 */
export function shouldSkipSectionChapterDiscovery(
  classification: ClassificationType | null | undefined
): boolean {
  if (!classification) return true;
  if (hasPreliminaryLevels(classification)) return false;
  return (classification.levels?.some((l) => l.selection) ?? false);
}
import { UserProfile, UserRole } from "./supabase/user";
import { Countries, Country } from "../constants/countries";

/**
 * Get the latest HTS code from classification levels
 */
export function getLatestHtsCode(
  levels: ClassificationType["levels"] | undefined
): string | null {
  if (!levels) return null;

  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i];
    if (level.selection?.htsno) {
      return level.selection.htsno;
    }
  }
  return null;
}

/**
 * Get country of origin from classification record
 */
export function getCountryOfOrigin(
  countryCode: string | undefined
): Country | null {
  if (!countryCode) return null;
  return Countries.find((c) => c.code === countryCode) || null;
}

/** Owner's `users.team_id` when resolving legacy classifications with null `team_id` on the row */
export type ClassificationOwnerTeamInfo = Pick<UserProfile, "team_id">;

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
  ownerTeamInfo?: ClassificationOwnerTeamInfo | null,
): boolean {
  if (!userProfile || !classificationRecord) return false;
  if (userProfile.id === classificationRecord.user_id) return true;
  if (userProfile.role === UserRole.SUPER_ADMIN) return true;
  if (
    userProfile.role === UserRole.ADMIN &&
    !!userProfile.team_id &&
    classificationRecord.team_id === userProfile.team_id
  ) {
    return true;
  }
  if (
    userProfile.role === UserRole.ADMIN &&
    !!userProfile.team_id &&
    !classificationRecord.team_id &&
    classificationRecord.user_id &&
    classificationRecord.user_id !== userProfile.id &&
    ownerTeamInfo != null &&
    ownerTeamInfo.team_id === userProfile.team_id
  ) {
    return true;
  }
  return false;
}

/**
 * True when the signed-in user is in the same workspace as this classification
 * (owner, or same team via row `team_id`, or legacy row + owner's `team_id`).
 * Used for nav/footer chrome; does not imply edit permission.
 */
export function isViewerOnClassificationTeam(
  userProfile: UserProfile | null | undefined,
  classificationRecord: ClassificationRecord | undefined,
  ownerTeamInfo?: ClassificationOwnerTeamInfo | null,
): boolean {
  if (!userProfile || !classificationRecord?.user_id) return false;
  if (classificationRecord.user_id === userProfile.id) return true;
  if (!userProfile.team_id) return false;
  if (
    classificationRecord.team_id &&
    classificationRecord.team_id === userProfile.team_id
  ) {
    return true;
  }
  if (
    !classificationRecord.team_id &&
    ownerTeamInfo != null &&
    ownerTeamInfo.team_id === userProfile.team_id
  ) {
    return true;
  }
  return false;
}

/**
 * Check if user can delete classification
 */
export function canUserDelete(
  userProfile: UserProfile | null,
  classificationRecord: ClassificationRecord | undefined
): boolean {
  return (
    userProfile?.id === classificationRecord?.user_id &&
    classificationRecord?.status === ClassificationStatus.DRAFT
  );
}
