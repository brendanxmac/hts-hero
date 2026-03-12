import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { fetchUser, fetchUsersByTeam } from "../../../../libs/supabase/user";
import { getAnonymousTokenFromCookieHeader } from "../../../../libs/anonymous-token";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    // Authenticated user flow
    if (user) {
      const userProfile = await fetchUser(user.id);
      if (!userProfile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const teamId = userProfile.team_id;
      const userIsOnTeam = !!teamId;

      let query = supabase
        .from("classifications")
        .select("*, classifier:users(name, email), importer:importers(name)")
        .order("created_at", { ascending: false });

      if (userIsOnTeam) {
        const teamMembers = await fetchUsersByTeam(teamId);
        const teamMemberIds = teamMembers.map((member) => member.id);

        query = query.or(
          `team_id.eq.${teamId},user_id.in.(${teamMemberIds.join(",")})`
        );
      } else {
        query = query.eq("user_id", user.id);
      }

      const { data: classifications, error } = await query;

      if (error) {
        console.error("Error fetching classifications:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(classifications, { status: 200 });
    }

    // Anonymous user flow
    const anonymousToken = getAnonymousTokenFromCookieHeader(
      req.headers.get("cookie")
    );

    if (!anonymousToken) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action." },
        { status: 401 }
      );
    }

    const { data: classifications, error } = await supabase
      .from("classifications")
      .select("*")
      .eq("anonymous_token", anonymousToken)
      .is("user_id", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching anonymous classifications:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(classifications, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
