import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import {
  ClassificationRecord,
  ClassificationStatus,
} from "../../../../interfaces/hts";

export const dynamic = "force-dynamic";

interface DeleteClassificationDto {
  id: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    // User who are not logged in can't delete classifications
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action." },
        { status: 401 }
      );
    }

    const { id }: DeleteClassificationDto = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          error: "Missing classification id",
        },
        { status: 400 }
      );
    }

    // First, fetch the classification to verify ownership and status
    const { data: classification, error: fetchError } = await supabase
      .from("classifications")
      .select("*")
      .eq("id", id)
      .single<ClassificationRecord>();

    if (fetchError) {
      console.error("Error fetching classification:", fetchError);
      return NextResponse.json(
        { error: "Classification not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the classification
    if (classification.user_id !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own classifications" },
        { status: 403 }
      );
    }

    // Check if the classification is in draft status
    if (classification.status !== ClassificationStatus.DRAFT) {
      return NextResponse.json(
        { error: "Only draft classifications can be deleted" },
        { status: 403 }
      );
    }

    // Delete the classification
    const { error: deleteError } = await supabase
      .from("classifications")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting classification:", deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

