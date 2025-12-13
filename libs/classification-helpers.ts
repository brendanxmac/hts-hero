import {
  Classification as ClassificationType,
  ClassificationRecord,
  ClassificationStatus,
} from "../interfaces/hts";
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
 * Check if user can update classification details
 */
export function canUserUpdateDetails(
  userProfile: UserProfile | null,
  classificationRecord: ClassificationRecord | undefined
): boolean {
  return (
    userProfile?.role === UserRole.ADMIN ||
    userProfile?.id === classificationRecord?.user_id
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
