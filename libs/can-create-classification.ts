import type { User } from "@supabase/supabase-js";
import {
  MAX_ANONYMOUS_CLASSIFICATIONS_PER_TOKEN,
  NUM_FREE_CLASSIFICATIONS,
} from "../constants/classification";
import { fetchClassifications } from "./classification";
import { Product, userHasActivePurchaseForProduct } from "./supabase/purchase";
import { fetchUser } from "./supabase/user";

export function isAnonymousUser(user: User | null | undefined): boolean {
  return !user;
}

export type CanCreateClassificationBlockReason =
  | "anonymous_limit_reached"
  | "free_limit_reached";

export type CanCreateClassificationSnapshot =
  | {
      mode: "anonymous";
      anonymousClassificationCount: number;
    }
  | {
      mode: "authenticated";
      isPayingUser: boolean;
      classificationCount: number;
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
  return (
    snapshot.isPayingUser ||
    snapshot.classificationCount < NUM_FREE_CLASSIFICATIONS
  );
}

export type CanCreateClassificationOptions = {
  /** Skip fetch; only valid when anonymous. */
  anonymousClassificationCount?: number;
  isPayingUser?: boolean;
  classificationCount?: number;
};

export type CanCreateClassificationResult = {
  allowed: boolean;
  blockReason?: CanCreateClassificationBlockReason;
  /** Set when the user was authenticated (values used for the decision). */
  isPayingUser?: boolean;
  classificationCount?: number;
};

export async function canCreateClassification(
  user: User | null,
  options?: CanCreateClassificationOptions
): Promise<CanCreateClassificationResult> {
  if (!isAnonymousUser(user)) {
    const u = user!;
    const [isPayingUser, classificationCount] = await Promise.all([
      options?.isPayingUser !== undefined
        ? options.isPayingUser
        : userHasActivePurchaseForProduct(u.id, Product.CLASSIFY),
      options?.classificationCount !== undefined
        ? options.classificationCount
        : fetchUser(u.id).then((p) => p?.classification_count ?? 0),
    ]);

    const allowed = canCreateClassificationFromSnapshot({
      mode: "authenticated",
      isPayingUser,
      classificationCount,
    });

    return {
      allowed,
      blockReason: allowed ? undefined : "free_limit_reached",
      isPayingUser,
      classificationCount,
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
