import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../supabase/server";
import { fetchUser } from "../../../libs/supabase/user";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    // Get teamId from request query params
    const searchParams = req.nextUrl.searchParams;
    const teamId = searchParams.get("teamId");

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

    const userIsOnTeam = userProfile.team_id === teamId;

    if (teamId && !userIsOnTeam) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = supabase
      .from("importers")
      .select("*")
      .order("created_at", { ascending: false });

    if (teamId) {
      query.eq("team_id", teamId);
    } else {
      query.eq("user_id", user.id);
    }

    const { data: importers, error } = await query;

    if (error) {
      console.error("Error fetching importers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(importers, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
