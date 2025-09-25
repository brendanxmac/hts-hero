import { createSupabaseClient } from "./client";

export interface UserProfile {
  id: string;
  name?: string;
  email: string;
  image?: string;
  stripe_customer_id?: string;
  company_logo?: string;
  company_disclaimer?: string;
  company_address?: string;
  tariff_impact_trial_started_at?: string;
  created_at: string;
  updated_at: string;
}

export const fetchUsers = async (userIds: string[]): Promise<UserProfile[]> => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .in("id", userIds);

  if (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }

  return data as UserProfile[];
};

export const fetchUserByStripeCustomerId = async (stripeCustomerId: string) => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .single<UserProfile>();

  if (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }

  return data;
};

export const fetchUser = async (userId: string) => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single<UserProfile>();

  if (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }

  return data;
};

export const fetchUserByEmail = async (
  email: string
): Promise<UserProfile | null> => {
  const supabase = createSupabaseClient();

  const { data: userProfile, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Failed to fetch user profile by email:", error);
    // TODO: throw error?
    return null;
  }

  return userProfile;
};

export const updateUserProfile = async (
  userId: string,
  userProfile: Partial<UserProfile>
) => {
  const supabase = createSupabaseClient();

  const { data: updatedUserProfile, error } = await supabase
    .from("users")
    .update(userProfile)
    .eq("id", userId)
    .select()
    .single<UserProfile>();

  if (error) {
    console.error("Failed to update user profile:", error);
    // TODO: throw error?
    return null;
  }

  return updatedUserProfile;
};
