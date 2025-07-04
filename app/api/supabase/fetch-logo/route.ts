import { NextResponse } from "next/server";
import { createClient, getSignedUrl } from "../server";
import { fetchUser } from "../../../../libs/supabase/user";

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
export async function GET() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Users who are not logged in can't fetch logo
  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to complete this action" },
      { status: 401 }
    );
  }

  const userProfile = await fetchUser(user.id);

  if (!userProfile?.logo_url) {
    return NextResponse.json({ signedUrl: null });
  }

  const { signedUrl, error } = await getSignedUrl(
    "logos",
    userProfile.logo_url
  );

  if (error) {
    console.log("error", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  console.log("signedUrl", signedUrl);

  return NextResponse.json({ signedUrl });
}
