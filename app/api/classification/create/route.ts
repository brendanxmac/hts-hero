import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { Classification } from "../../../../interfaces/hts";

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

    const { classification }: CreateClassificationDto = await req.json();

    console.log(classification);

    if (!classification) {
      return NextResponse.json(
        {
          error: "Missing classification",
        },
        { status: 400 }
      );
    }

    const {
      articleDescription,
      articleAnalysis,
      levels,
      progressionDescription,
    } = classification;

    const { error } = await supabase.from("classification").insert([
      {
        user_id: user.id,
        description: articleDescription,
        analysis: articleAnalysis,
        progression_description: progressionDescription,
        decisions: levels,
      },
    ]);

    if (error) {
      console.error("Error creating classification:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
