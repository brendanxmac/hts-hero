import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { fetchUser } from "../../../../libs/supabase/user";
import { addOrUpdateMailchimpContact } from "../../../../libs/mailchimp";

export const dynamic = "force-dynamic";

interface LinkAnonymousDto {
  anonymous_token: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to link classifications." },
        { status: 401 }
      );
    }

    const { anonymous_token }: LinkAnonymousDto = await req.json();

    if (!anonymous_token) {
      return NextResponse.json(
        { error: "Missing anonymous_token" },
        { status: 400 }
      );
    }

    const userProfile = await fetchUser(user.id);

    // Link all anonymous classifications to this user
    const { data: linked, error } = await supabase
      .from("classifications")
      .update({
        user_id: user.id,
        team_id: userProfile?.team_id || null,
        anonymous_token: null,
      })
      .eq("anonymous_token", anonymous_token)
      .is("user_id", null)
      .select("id");

    if (error) {
      console.error("Error linking anonymous classifications:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const linkedCount = linked?.length ?? 0;

    // If classifications were linked, this user came through the lead funnel
    if (linkedCount > 0 && user.email) {
      try {
        await addOrUpdateMailchimpContact(user.email, [
          "classification-lead",
        ]);
      } catch (mailchimpError) {
        console.error(
          "Failed to add Mailchimp tag (non-blocking):",
          mailchimpError
        );
      }
    }

    return NextResponse.json(
      { linked_count: linkedCount },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
