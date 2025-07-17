import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import {
  Classification,
  ClassificationRecord,
} from "../../../../interfaces/hts";

export const dynamic = "force-dynamic";

interface UpdateClassificationDto {
  id: string;
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

    const { id, classification }: UpdateClassificationDto = await req.json();

    if (!classification) {
      return NextResponse.json(
        {
          error: "Missing classification",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("classifications")
      .update({
        classification,
      })
      .eq("id", id)
      .select()
      .single<ClassificationRecord>();

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
