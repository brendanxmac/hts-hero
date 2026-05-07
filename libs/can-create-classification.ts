import type { User } from "@supabase/supabase-js";
import {
  MAX_ANONYMOUS_CLASSIFICATIONS_PER_TOKEN,
  NUM_FREE_CLASSIFICATIONS,
  STARTER_MONTHLY_CLASSIFICATION_LIMIT,
} from "../constants/classification";
import { PricingPlan } from "../types";
import { fetchClassifications } from "./classification";
import { getActiveClassifyPurchase } from "./supabase/purchase";
import {
  countClassificationsForUserId,
  countClassificationsForUserSince,
} from "./supabase/count-user-classifications";
import { fetchUser } from "./supabase/user";

export function isAnonymousUser(user: User | null | undefined): boolean {
  return !user;
}

export type CanCreateClassificationBlockReason =
  | "anonymous_limit_reached"
  | "free_limit_reached"
  | "starter_limit_reached";

export type CanCreateClassificationSnapshot =
  | {
      mode: "anonymous";
      anonymousClassificationCount: number;
    }
  | {
      mode: "authenticated";
      isPayingUser: boolean;
      classifyPlan?: PricingPlan | null;
      /** Users with a team are not limited by the solo free tier. */
      isOnTeam: boolean;
      classificationCount: number;
      /** Classifications used in the current billing cycle (Starter only). */
      monthlyUsed?: number;
    };

export function canCreateClassificationFromSnapshot(
  snapshot: CanCreateClassificationSnapshot
): boolean {
  if (snapshot.mode === "anonymous") {
    return (
      snapshot.anonymousClassificationCount <
      MAX_ANONYMOUS_CLASSIFICATIONS_PER_TOKEN
    );
  }

  if (snapshot.isOnTeam) return true;

  if (snapshot.isPayingUser) {
    if (snapshot.classifyPlan === PricingPlan.CLASSIFY_STARTER) {
      return (snapshot.monthlyUsed ?? 0) < STARTER_MONTHLY_CLASSIFICATION_LIMIT;
    }
    // Pro and Team: unlimited
    return true;
  }

  return snapshot.classificationCount < NUM_FREE_CLASSIFICATIONS;
}

export type CanCreateClassificationOptions = {
  /** Skip fetch; only valid when anonymous. */
  anonymousClassificationCount?: number;
  isPayingUser?: boolean;
  /** When set, skips loading the user profile to read `team_id`. */
  isOnTeam?: boolean;
  classificationCount?: number;
};

export type CanCreateClassificationResult = {
  allowed: boolean;
  blockReason?: CanCreateClassificationBlockReason;
  /** Set when the user was authenticated (values used for the decision). */
  isPayingUser?: boolean;
  isOnTeam?: boolean;
  classificationCount?: number;
  /** The active classify plan (STARTER / PRO), or null if none. */
  classifyPlan?: PricingPlan | null;
  /** Classifications used in the current billing cycle (Starter only). */
  monthlyUsed?: number;
  /** Monthly classification limit for the plan (Starter only). */
  monthlyLimit?: number;
};

export async function canCreateClassification(
  user: User | null,
  options?: CanCreateClassificationOptions
): Promise<CanCreateClassificationResult> {
  if (!isAnonymousUser(user)) {
    const u = user!;
    const [activePurchase, classificationCount, profile] = await Promise.all([
      getActiveClassifyPurchase(u.id),
      options?.classificationCount !== undefined
        ? Promise.resolve(options.classificationCount)
        : countClassificationsForUserId(u.id),
      options?.isOnTeam !== undefined
        ? Promise.resolve(null)
        : fetchUser(u.id),
    ]);

    const isPayingUser =
      options?.isPayingUser !== undefined
        ? options.isPayingUser
        : !!activePurchase;

    const classifyPlan = activePurchase?.product_name ?? null;

    const isOnTeam =
      options?.isOnTeam !== undefined
        ? options.isOnTeam
        : !!profile?.team_id;

    let monthlyUsed: number | undefined;
    let monthlyLimit: number | undefined;

    if (classifyPlan === PricingPlan.CLASSIFY_STARTER && activePurchase) {
      monthlyUsed = await countClassificationsForUserSince(
        u.id,
        activePurchase.created_at
      );
      monthlyLimit = STARTER_MONTHLY_CLASSIFICATION_LIMIT;
    }

    const allowed = canCreateClassificationFromSnapshot({
      mode: "authenticated",
      isPayingUser,
      classifyPlan,
      isOnTeam,
      classificationCount,
      monthlyUsed,
    });

    let blockReason: CanCreateClassificationBlockReason | undefined;
    if (!allowed) {
      blockReason =
        classifyPlan === PricingPlan.CLASSIFY_STARTER
          ? "starter_limit_reached"
          : "free_limit_reached";
    }

    return {
      allowed,
      blockReason,
      isPayingUser,
      isOnTeam,
      classificationCount,
      classifyPlan,
      monthlyUsed,
      monthlyLimit,
    };
  }

  const anonymousCount =
    options?.anonymousClassificationCount ??
    (await fetchClassifications()).length;

  const allowed = canCreateClassificationFromSnapshot({
    mode: "anonymous",
    anonymousClassificationCount: anonymousCount,
  });

  return {
    allowed,
    blockReason: allowed ? undefined : "anonymous_limit_reached",
  };
}
