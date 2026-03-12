import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { ClassificationRecord } from "../../../../interfaces/hts";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function generateShareToken(): string {
  return crypto.randomBytes(8).toString("base64url");
}

interface ShareClassificationDto {
  id: string;
  enable: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to share classifications." },
        { status: 401 }
      );
    }

    const { id, enable }: ShareClassificationDto = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing classification id" },
        { status: 400 }
      );
    }

    if (enable) {
      // Generate a share token and enable sharing
      const shareToken = generateShareToken();

      const { data: updated, error } = await supabase
        .from("classifications")
        .update({
          share_token: shareToken,
          is_shared: true,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("share_token, is_shared")
        .single();

      if (error) {
        console.error("Error enabling share:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(updated, { status: 200 });
    } else {
      // Disable sharing
      const { error } = await supabase
        .from("classifications")
        .update({
          is_shared: false,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error disabling share:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        { share_token: null, is_shared: false },
        { status: 200 }
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// GET: Fetch a shared classification by share_token (public)
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const shareToken = req.nextUrl.searchParams.get("token");

    if (!shareToken) {
      return NextResponse.json(
        { error: "Missing share token" },
        { status: 400 }
      );
    }

    const { data: classification, error } = await supabase
      .from("classifications")
      .select("*")
      .eq("share_token", shareToken)
      .eq("is_shared", true)
      .single<ClassificationRecord>();

    if (error || !classification) {
      return NextResponse.json(
        { error: "Classification not found or sharing is disabled." },
        { status: 404 }
      );
    }

    return NextResponse.json(classification, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
