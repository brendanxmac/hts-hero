import { NextResponse } from "next/server";
import { createClient } from "../../supabase/server";
import { fetchUser, fetchUsersByTeam } from "../../../../libs/supabase/user";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    // User who are not logged in can't do searches
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action." },
        { status: 401 }
      );
    }

    const userProfile = await fetchUser(user.id);
    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const teamId = userProfile.team_id;
    const userIsOnTeam = !!teamId;

    // If user is on a team, fetch all classifications for the team
    // This includes:
    // 1. Classifications with the team_id
    // 2. Classifications created by any user who is currently on the team (including their personal ones from before joining)
    // Otherwise, fetch only the user's own classifications
    // Also fetch the importers name for the classification
    let query = supabase
      .from("classifications")
      .select("*, classifier:users(name, email), importer:importers(name)")
      .order("created_at", { ascending: false });

    if (userIsOnTeam) {
      // Get all user IDs on the team
      const teamMembers = await fetchUsersByTeam(teamId);
      const teamMemberIds = teamMembers.map((member) => member.id);

      // Fetch classifications that either:
      // - Have the team_id, OR
      // - Were created by any current team member
      query = query.or(
        `team_id.eq.${teamId},user_id.in.(${teamMemberIds.join(",")})`
      );
    } else {
      query = query.eq("user_id", user.id);
    }

    const { data: classifications, error } = await query;

    if (error) {
      console.error("Error creating classification:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(classifications, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
