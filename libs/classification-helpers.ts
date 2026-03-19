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

/**
 * Check if user can update classification details.
 * Owner, global admin, or team admin (same team) can update.
 */
export function canUserUpdateDetails(
  userProfile: UserProfile | null,
  classificationRecord: ClassificationRecord | undefined
): boolean {
  if (!userProfile || !classificationRecord) return false;
  if (userProfile.id === classificationRecord.user_id) return true;
  if (userProfile.role === UserRole.SUPER_ADMIN) return true;
  // Team admin: same team and role is ADMIN
  return (
    userProfile.role === UserRole.ADMIN &&
    !!userProfile.team_id &&
    classificationRecord.team_id === userProfile.team_id
  );
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
