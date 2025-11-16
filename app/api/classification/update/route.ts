import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import {
  Classification,
  ClassificationRecord,
  ClassificationStatus,
} from "../../../../interfaces/hts";

export const dynamic = "force-dynamic";

interface UpdateClassificationDto {
  id: string;
  classification?: Classification;
  importer_id?: string;
  classifier_id?: string;
  status?: ClassificationStatus;
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

    const {
      id,
      classification,
      importer_id,
      classifier_id,
      status,
    }: UpdateClassificationDto = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          error: "Missing classification id",
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Partial<
      Pick<
        ClassificationRecord,
        "classification" | "importer_id" | "classifier_id" | "status"
      >
    > = {};

    if (classification !== undefined) {
      updateData.classification = classification;
    }
    if (importer_id !== undefined) {
      updateData.importer_id = importer_id;
    }
    if (classifier_id !== undefined) {
      updateData.classifier_id = classifier_id;
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    // Don't proceed if no fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: true,
        },
        { status: 200 }
      );
    }

    const { error } = await supabase
      .from("classifications")
      .update(updateData)
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
