import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import {
  ClassificationI,
  ClassificationRecord,
  ClassificationStatus,
} from "../../../../interfaces/hts";
import { getAnonymousTokenFromCookieHeader } from "../../../../libs/anonymous-token";
import { fetchUser } from "../../../../libs/supabase/user";
import { UserRole } from "../../../../libs/supabase/user";

export const dynamic = "force-dynamic";

interface UpdateClassificationDto {
  id: string;
  classification?: ClassificationI;
  importer_id?: string;
  classifier_id?: string;
  status?: ClassificationStatus;
  country_of_origin?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    const anonymousToken = getAnonymousTokenFromCookieHeader(
      req.headers.get("cookie")
    );

    // Must be authenticated or have an anonymous token
    if (!user && !anonymousToken) {
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
      country_of_origin,
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
        | "classification"
        | "importer_id"
        | "classifier_id"
        | "status"
        | "country_of_origin"
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
    if (country_of_origin !== undefined) {
      updateData.country_of_origin = country_of_origin;
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

    // Scope the update: owner, anonymous token, or team admin
    let query = supabase
      .from("classifications")
      .update(updateData)
      .eq("id", id);

    if (user) {
      const userProfile = await fetchUser(user.id);
      const isTeamAdmin =
        userProfile?.role === UserRole.ADMIN &&
        userProfile?.team_id &&
        true; // team_id match checked after fetch

      // Fetch record to check ownership/team
      const { data: existingRecord } = await supabase
        .from("classifications")
        .select("user_id, team_id")
        .eq("id", id)
        .single<Pick<ClassificationRecord, "user_id" | "team_id">>();

      const isOwnerMatch = existingRecord?.user_id === user.id;
      const isTeamAdminMatch =
        isTeamAdmin &&
        !!userProfile?.team_id &&
        existingRecord?.team_id === userProfile.team_id;

      if (isOwnerMatch) {
        query = query.eq("user_id", user.id);
      } else if (isTeamAdminMatch) {
        query = query.eq("team_id", userProfile!.team_id!);
      } else {
        return NextResponse.json(
          { error: "You do not have permission to update this classification." },
          { status: 403 }
        );
      }
    } else if (anonymousToken) {
      query = query.eq("anonymous_token", anonymousToken).is("user_id", null);
    }

    const { data: updatedRecord, error } = await query
      .select()
      .single<ClassificationRecord>();

    if (error) {
      console.error("Error updating classification:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Increment classification_count when a classification is completed
    if (
      user &&
      classification?.isComplete &&
      updatedRecord
    ) {
      await supabase.rpc("increment_classification_count", {
        user_id_input: user.id,
      }).then(({ error: rpcError }) => {
        if (rpcError) {
          // Non-blocking: log but don't fail the request
          console.error("Error incrementing classification count:", rpcError);
        }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
