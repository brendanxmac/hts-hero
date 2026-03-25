import { ClassificationRecord } from "../interfaces/hts";
import { fetchUser, UserProfile, UserRole } from "./supabase/user";

export type ClassificationAccessRow = Pick<
  ClassificationRecord,
  "user_id" | "team_id"
>;

export type ClassificationWriteScope =
  | "owner"
  | "team_admin_team_id"
  | "team_admin_owner_user"
  | "super_admin";

/**
 * Resolves whether an authenticated user may update/share a classification row
 * (aligned with GET visibility: team admin may act on legacy rows where team_id
 * was never set but the owner belongs to the admin's team).
 */
export async function resolveClassificationWriteAccess(
  actorUserId: string,
  userProfile: UserProfile | null,
  existingRecord: ClassificationAccessRow | null | undefined,
): Promise<
  { allowed: false } | { allowed: true; scope: ClassificationWriteScope }
> {
  if (!userProfile || !existingRecord?.user_id) {
    return { allowed: false };
  }

  if (userProfile.role === UserRole.SUPER_ADMIN) {
    return { allowed: true, scope: "super_admin" };
  }

  if (existingRecord.user_id === actorUserId) {
    return { allowed: true, scope: "owner" };
  }

  const isTeamAdmin =
    userProfile.role === UserRole.ADMIN && !!userProfile.team_id;

  if (!isTeamAdmin || !userProfile.team_id) {
    return { allowed: false };
  }

  if (
    existingRecord.team_id &&
    existingRecord.team_id === userProfile.team_id
  ) {
    return { allowed: true, scope: "team_admin_team_id" };
  }

  if (!existingRecord.team_id) {
    const ownerProfile = await fetchUser(existingRecord.user_id);
    if (
      ownerProfile?.team_id &&
      ownerProfile.team_id === userProfile.team_id
    ) {
      return { allowed: true, scope: "team_admin_owner_user" };
    }
  }

  return { allowed: false };
}
