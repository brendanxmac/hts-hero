import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { Importer } from "../../../../interfaces/hts";
import { fetchUser, UserRole } from "../../../../libs/supabase/user";

export const dynamic = "force-dynamic";

interface CreateImporterDto {
  name: string;
  teamId: string;
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

    const { name, teamId }: CreateImporterDto = await req.json();

    if (!name) {
      return NextResponse.json(
        {
          error: "Bad Request",
        },
        { status: 400 }
      );
    }

    const userProfile = await fetchUser(user.id);

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user is not a team admin, then they cannot add an importer
    const userIsTeamAdmin =
      userProfile.team_id === teamId && userProfile.role === UserRole.ADMIN;

    const newImporter: Partial<Importer> = {
      name: name,
    };

    if (teamId) {
      if (!userIsTeamAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      } else {
        newImporter.team_id = teamId;
      }
    } else {
      newImporter.user_id = user.id;
    }

    const { data: importerRecord, error } = await supabase
      .from("importers")
      .insert([newImporter])
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
