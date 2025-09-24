import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { Importer } from "../../../../interfaces/hts";

export const dynamic = "force-dynamic";

interface CreateImporterDto {
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

    const { name }: CreateImporterDto = await req.json();

    if (!name) {
      return NextResponse.json(
        {
          error: "Bad Request",
        },
        { status: 400 }
      );
    }

    const { data: importerRecord, error } = await supabase
      .from("importers")
      .insert([
        {
          user_id: user.id,
          name: name,
        },
      ])
      .select()
      .single<Importer>();

    if (error) {
      console.error("Error creating importer:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(importerRecord, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
