import { NextResponse, NextRequest } from "next/server";
import { getSignedUrl } from "../server";

// Specifies that this API route should run on Edge Runtime
export const runtime = "edge";

// This API route handles fetching PDF files from Supabase Storage
// It expects a query parameter with the file path
// A signed URL is generated for the file and returned to the client
// The signed URL is valid for 1 hour and can be used to access the file from the client
export async function GET(req: NextRequest) {
  try {
    const requestUrl = new URL(req.url);
    const bucket = requestUrl.searchParams.get("bucket");
    const filePath = requestUrl.searchParams.get("path");

    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: "Missing bucket or file path" },
        { status: 400 }
      );
    }

    // Remove leading slash if present to match Supabase storage path format
    // const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

    console.log("bucket", bucket);
    console.log("filePath", filePath);

    const { signedUrl, error } = await getSignedUrl(bucket, filePath);

    if (error) {
      console.error("Failed to fetch PDF URL:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 });
  }
}
