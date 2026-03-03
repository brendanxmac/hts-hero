import { NextResponse, NextRequest } from "next/server";
import { getSignedUrl } from "../supabase/server";

const PLAYBOOK_BUCKET = "premium-content";
const PLAYBOOK_FILE = "The Audit Ready Classifications Playbook.pdf";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email?.trim() ?? "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { signedUrl, error } = await getSignedUrl(
      PLAYBOOK_BUCKET,
      PLAYBOOK_FILE
    );

    if (error) {
      console.error("Failed to create playbook signed URL:", error);
      return NextResponse.json(
        { error: "Failed to prepare download. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ signedUrl });
  } catch (err) {
    console.error("Audit playbook download error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
