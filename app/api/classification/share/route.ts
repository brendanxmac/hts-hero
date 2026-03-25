import { NextResponse, NextRequest } from "next/server"
import { createClient } from "../../supabase/server"
import { ClassificationRecord } from "../../../../interfaces/hts"
import { resolveClassificationWriteAccess } from "../../../../libs/classification-access"
import { fetchUser } from "../../../../libs/supabase/user"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function generateShareToken(): string {
  return crypto.randomBytes(8).toString("base64url")
}

interface ShareClassificationDto {
  id: string
  enable: boolean
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to share classifications." },
        { status: 401 },
      )
    }

    const { id, enable }: ShareClassificationDto = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: "Missing classification id" },
        { status: 400 },
      )
    }

    const userProfile = await fetchUser(user.id)
    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: existingRecord, error: fetchError } = await supabase
      .from("classifications")
      .select("user_id, team_id")
      .eq("id", id)
      .single<Pick<ClassificationRecord, "user_id" | "team_id">>()

    if (fetchError || !existingRecord) {
      return NextResponse.json(
        { error: "Classification not found" },
        { status: 404 },
      )
    }

    const access = await resolveClassificationWriteAccess(
      user.id,
      userProfile,
      existingRecord,
    )

    if (!access.allowed) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to change sharing for this classification.",
        },
        { status: 403 },
      )
    }

    const applyWriteScopeToQuery = <
      T extends { eq: (...args: unknown[]) => T },
    >(
      q: T,
    ): T => {
      switch (access.scope) {
        case "owner":
          return q.eq("user_id", user.id)
        case "team_admin_team_id":
          return q.eq("team_id", userProfile.team_id!)
        case "team_admin_owner_user":
          return q.eq("user_id", existingRecord.user_id!)
        case "super_admin":
          return q
      }
    }

    if (enable) {
      const shareToken = generateShareToken()

      const query = applyWriteScopeToQuery(
        supabase
          .from("classifications")
          .update({
            share_token: shareToken,
            is_shared: true,
          })
          .eq("id", id),
      )

      const { data: updated, error } = await query
        .select("share_token, is_shared")
        .single()

      if (error) {
        console.error("Error enabling share:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(updated, { status: 200 })
    }

    const disableQuery = applyWriteScopeToQuery(
      supabase
        .from("classifications")
        .update({
          is_shared: false,
        })
        .eq("id", id),
    )

    const { error: disableError } = await disableQuery

    if (disableError) {
      console.error("Error disabling share:", disableError)
      return NextResponse.json({ error: disableError.message }, { status: 500 })
    }

    return NextResponse.json(
      { share_token: null, is_shared: false },
      { status: 200 },
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

// GET: Fetch a shared classification by share_token (public)
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const shareToken = req.nextUrl.searchParams.get("token")

    if (!shareToken) {
      return NextResponse.json(
        { error: "Missing share token" },
        { status: 400 },
      )
    }

    const { data: classification, error } = await supabase
      .from("classifications")
      .select("*")
      .eq("share_token", shareToken)
      .eq("is_shared", true)
      .single<ClassificationRecord>()

    if (error || !classification) {
      return NextResponse.json(
        { error: "Classification not found or sharing is disabled." },
        { status: 404 },
      )
    }

    return NextResponse.json(classification, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
