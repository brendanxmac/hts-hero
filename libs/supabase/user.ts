import { createSupabaseClient } from "./client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export const fetchUserProfile = async (userId: string) => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single<UserProfile>();

  if (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }

  return data;
};

export const fetchUserProfileByEmail = async (
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

  const { data, error } = await supabase
    .from("users")
    .update(userProfile)
    .eq("id", userId)
    .select();
};
