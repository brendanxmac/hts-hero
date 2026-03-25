import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import {
  ClassificationI,
  ClassificationRecord,
} from "../../../../interfaces/hts";
import { getHtsRevisionRecord } from "../../../../libs/supabase/hts-revision";
import { fetchUser } from "../../../../libs/supabase/user";
import { getAnonymousTokenFromCookieHeader } from "../../../../libs/anonymous-token";
import { MAX_ANONYMOUS_CLASSIFICATIONS_PER_TOKEN } from "../../../../constants/classification";

export const dynamic = "force-dynamic";

interface CreateClassificationDto {
  classification: ClassificationI;
  anonymous_token?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    const { classification, anonymous_token: bodyToken }: CreateClassificationDto =
      await req.json();

    if (!classification) {
      return NextResponse.json(
        { error: "Missing classification" },
        { status: 400 }
      );
    }

    const revision = await getHtsRevisionRecord("latest");

    // Authenticated user flow
    if (user) {
      const userProfile = await fetchUser(user.id);
      if (!userProfile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const { data: classificationRecord, error } = await supabase
        .from("classifications")
        .insert([
          {
            user_id: user.id,
            team_id: userProfile.team_id,
            classification: classification,
            revision: revision.name,
          },
        ])
        .select()
        .single<ClassificationRecord>();

      if (error) {
        console.error("Error creating classification:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await supabase
        .rpc("increment_classification_count", {
          user_id_input: user.id,
        })
        .then(({ error: rpcError }) => {
          if (rpcError) {
            console.error("Error incrementing classification count:", rpcError);
          }
        });

      return NextResponse.json(classificationRecord, { status: 200 });
    }

    // Anonymous user flow
    const anonymousToken =
      bodyToken ||
      getAnonymousTokenFromCookieHeader(req.headers.get("cookie"));

    if (!anonymousToken) {
      return NextResponse.json(
        { error: "Authentication or anonymous token required." },
        { status: 401 }
      );
    }

    // Rate limit: max active anonymous classifications per token
    const { count, error: countError } = await supabase
      .from("classifications")
      .select("id", { count: "exact", head: true })
      .eq("anonymous_token", anonymousToken)
      .is("user_id", null);

    if (countError) {
      console.error("Error checking anonymous classification count:", countError);
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if ((count ?? 0) >= MAX_ANONYMOUS_CLASSIFICATIONS_PER_TOKEN) {
      return NextResponse.json(
        {
          error:
            "You've reached the maximum number of anonymous classifications. Create a free account to continue.",
        },
        { status: 429 }
      );
    }

    const { data: classificationRecord, error } = await supabase
      .from("classifications")
      .insert([
        {
          user_id: null,
          team_id: null,
          classification: classification,
          revision: revision.name,
          anonymous_token: anonymousToken,
        },
      ])
      .select()
      .single<ClassificationRecord>();

    if (error) {
      console.error("Error creating anonymous classification:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(classificationRecord, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
