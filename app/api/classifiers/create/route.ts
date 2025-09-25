import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { Classifier } from "../../../../interfaces/hts";

export const dynamic = "force-dynamic";

interface CreateClassifierDto {
  name: string;
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

    const { name }: CreateClassifierDto = await req.json();

    if (!name) {
      return NextResponse.json(
        {
          error: "Bad Request",
        },
        { status: 400 }
      );
    }

    const { data: classifierRecord, error } = await supabase
      .from("classifiers")
      .insert([
        {
          user_id: user.id,
          name: name,
        },
      ])
      .select()
      .single<Classifier>();

    if (error) {
      console.error("Error creating classification:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(classifierRecord, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
