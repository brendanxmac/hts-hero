import { SupabaseClient } from "@supabase/supabase-js";
import { PricingPlan } from "@/types";
import { TRACKER_PLANS, TrackerAccess, trackerAccessFrom, TrackerUsage } from "./plan";

// A signed-in account's Tariff Tracker access, read with the service role (server only)

// Same grace as the other plans: renewals can land a day or two after a period ends
export const RENEWAL_GRACE_DAYS = 2;

// The checks the account has spent (tracker_checks), oldest first
export const readUsage = async (admin: SupabaseClient, userId: string): Promise<TrackerUsage> => {
  const { data, error } = await admin
    .from("tracker_checks")
    .select("kind, ref")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as { kind: string; ref: string }[];
  return {
    savingsChecked: rows.filter((r) => r.kind === "savings").map((r) => r.ref),
    auditsChecked: rows.filter((r) => r.kind === "audit").map((r) => r.ref),
  };
};

const readActivePlans = async (admin: SupabaseClient, userId: string): Promise<PricingPlan[]> => {
  const since = new Date(Date.now() - RENEWAL_GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await admin
    .from("purchases")
    .select("product_name")
    .eq("user_id", userId)
    .in(
      "product_name",
      TRACKER_PLANS.map((p) => p.plan)
    )
    .gte("expires_at", since);
  if (error) throw error;
  return (data ?? []).map((row: { product_name: PricingPlan }) => row.product_name);
};

// When the account's 14-day trial started: its first real imports (tracker_onboarding, set by a
// trigger on tracker_catalogs); null until then. Until that migration is applied, its sign-up.
export const readTrialStartedAt = async (admin: SupabaseClient, userId: string): Promise<string | null> => {
  const { data, error } = await admin.from("tracker_onboarding").select("trial_started_at").eq("user_id", userId).maybeSingle();
  if (!error) return (data as { trial_started_at: string | null } | null)?.trial_started_at ?? null;
  const { data: user, error: userError } = await admin.from("users").select("created_at").eq("id", userId).maybeSingle();
  if (userError) throw userError;
  return (user as { created_at: string } | null)?.created_at ?? null;
};

export const readTrackerAccess = async (admin: SupabaseClient, userId: string): Promise<TrackerAccess> => {
  const [usage, activePlans, trialStartedAt] = await Promise.all([readUsage(admin, userId), readActivePlans(admin, userId), readTrialStartedAt(admin, userId)]);
  return trackerAccessFrom({ usage, activePlans, trialStartedAt });
};
