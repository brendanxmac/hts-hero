import { SupabaseClient } from "@supabase/supabase-js";
import { PricingPlan } from "@/types";
import { TRACKER_PLANS, TrackerAccess, trackerAccessFrom, TrackerTrial } from "./plan";

// A signed-in account's Tariff Tracker access, read with the service role (server only)

// Same grace as the other plans: renewals can land a day or two after a period ends
const RENEWAL_GRACE_DAYS = 2;

export const readTrial = async (admin: SupabaseClient, userId: string): Promise<TrackerTrial | null> => {
  const { data, error } = await admin
    .from("tracker_trials")
    .select("started_at, ends_at")
    .eq("user_id", userId)
    .maybeSingle<{ started_at: string; ends_at: string }>();
  if (error) throw error;
  return data ? { startedAt: data.started_at, endsAt: data.ends_at } : null;
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

export const readTrackerAccess = async (admin: SupabaseClient, userId: string): Promise<TrackerAccess> => {
  const [trial, activePlans] = await Promise.all([readTrial(admin, userId), readActivePlans(admin, userId)]);
  return trackerAccessFrom({ trial, activePlans });
};
