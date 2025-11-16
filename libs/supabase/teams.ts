import { createSupabaseClient } from "./client";

export interface Team {
  id: string;
  name: string;
  logo?: string;
  disclaimer?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export const fetchTeam = async (teamId: string): Promise<Team> => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single<Team>();

  if (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }

  return data as Team;
};

export const updateTeamProfile = async (
  teamId: string,
  teamProfile: Partial<Team>
) => {
  const supabase = createSupabaseClient();

  const { data: updatedTeamProfile, error } = await supabase
    .from("teams")
    .update(teamProfile)
    .eq("id", teamId)
    .select()
    .single<Team>();

  if (error) {
    console.error("Failed to update team profile:", error);
    // TODO: throw error?
    return null;
  }

  return updatedTeamProfile;
};
