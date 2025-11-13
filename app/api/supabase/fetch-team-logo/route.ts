import { NextRequest, NextResponse } from "next/server";
import { createClient, getSignedUrl } from "../server";
import { fetchUser } from "../../../../libs/supabase/user";
import { fetchTeam } from "../../../../libs/supabase/teams";

// Specifies that this API route should run on Edge Runtime
// This means the API route will run on Edge servers (CDN nodes) closer to users
// for better performance, but with some limitations compared to Node.js runtime
export const runtime = "edge";

// This API route handles the upload of a logo file to Supabase Storage
// It expects a form data with a file and a userId
// The file is uploaded to the logos bucket with a unique path based on the userId and timestamp
// A signed URL is generated for the file and returned to the client
// The signed URL is valid for 7 days and can be used to access the file from the client
// The file is cached for 1 hour to improve performance
export async function GET(req: NextRequest) {
  // Get Team Id from request query parameters
  const searchParams = req.nextUrl.searchParams;
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

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

  if (!userProfile.team_id || userProfile.team_id !== teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const team = await fetchTeam(teamId);

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  if (!team.logo) {
    return NextResponse.json({ signedUrl: null });
  }

  const { signedUrl, error } = await getSignedUrl("logos", team.logo);

  if (error) {
    console.error("error", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ signedUrl });
}
