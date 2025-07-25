import { NextResponse } from "next/server";
import { createClient, getSignedUrl } from "../server";
import { fetchUser, updateUserProfile } from "../../../../libs/supabase/user";
import { v4 as uuidv4 } from "uuid";

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
export async function POST(req: Request) {
  const supabase = createClient();
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const userId = formData.get("userId") as string;

  if (!file || !userId) {
    return NextResponse.json(
      { error: "Missing file or userId" },
      { status: 400 }
    );
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const fileType = file.type;
  if (!["image/jpeg", "image/png"].includes(fileType)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const ext = fileType === "image/png" ? "png" : "jpg";
  const fileName = `${uuidv4()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.log("uploadError", uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const userProfile = await fetchUser(userId);

  if (userProfile?.company_logo) {
    await supabase.storage
      .from("logos")
      .remove([userProfile.company_logo])
      .catch((error) => {
        console.log("error removing old logo", error);
      });
  }

  // Update user profile with logo url
  await updateUserProfile(userId, {
    company_logo: fileName,
  });

  const { signedUrl, error } = await getSignedUrl("logos", fileName);

  if (error) {
    console.error("error getting signed url", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ signedUrl });
}
