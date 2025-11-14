import { NextResponse } from "next/server";
import { createClient } from "../../supabase/server";
import { fetchUser } from "../../../../libs/supabase/user";

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

    const userIsOnTeam = userProfile.team_id;

    // If user is on a team, fetch all classifications for the team
    // Otherwise, fetch only the user's own classifications
    // Also fetch the importers name for the classification
    let query = supabase
      .from("classifications")
      .select("*, classifier:users(name, email), importer:importers(name)")
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (userIsOnTeam) {
      query = query.eq("team_id", userIsOnTeam);
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
