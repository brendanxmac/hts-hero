import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import {
  Classification,
  ClassificationRecord,
} from "../../../../interfaces/hts";
import { getHtsRevisionRecord } from "../../../../libs/supabase/hts-revision";
import { fetchUser } from "../../../../libs/supabase/user";

export const dynamic = "force-dynamic";

interface CreateClassificationDto {
  classification: Classification;
}

export async function POST(req: NextRequest) {
  try {
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
    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { classification }: CreateClassificationDto = await req.json();

    if (!classification) {
      return NextResponse.json(
        {
          error: "Missing classification",
        },
        { status: 400 }
      );
    }

    // Get the latest revision of the HTS data
    const revision = await getHtsRevisionRecord("latest");

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

    return NextResponse.json(classificationRecord, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
