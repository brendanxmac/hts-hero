import { NextResponse, NextRequest } from "next/server"
import { createClient } from "../../supabase/server"
import { fetchUser, fetchUsersByTeam } from "../../../../libs/supabase/user"
import { getAnonymousTokenFromCookieHeader } from "../../../../libs/anonymous-token"
import { ClassificationRecord } from "../../../../interfaces/hts"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient()
    const classificationId = params.id

    if (!classificationId) {
      return NextResponse.json(
        { error: "Classification ID is required" },
        { status: 400 },
      )
    }

    const { data } = await supabase.auth.getUser()
    const user = data.user

    // Fetch the classification record
    const { data: record, error } = await supabase
      .from("classifications")
      .select("*, classifier:users(name, email), importer:importers(name)")
      .eq("id", classificationId)
      .single<ClassificationRecord>()

    if (error || !record) {
      return NextResponse.json(
        { error: "Classification not found" },
        { status: 404 },
      )
    }

    const userProfile = user ? await fetchUser(user.id) : null

    // Authenticated user: must be owner or on the same team (align with fetch route logic)
    if (user && userProfile) {
      const isOwner = record.user_id === user.id
      const isSameTeamViaRecord =
        userProfile.team_id && record.team_id === userProfile.team_id
      // Fetch route also allows when owner is a team member (user_id.in.teamMemberIds)
      let isOwnerOnMyTeam = false
      let isOwnerSameTeam = false
      if (!isSameTeamViaRecord && userProfile.team_id && record.user_id) {
        const teamMembers = await fetchUsersByTeam(userProfile.team_id)
        isOwnerOnMyTeam = teamMembers.some((m) => m.id === record.user_id)
        // Fallback: owner's team_id matches viewer's (handles edge cases)
        if (!isOwnerOnMyTeam) {
          const ownerProfile = await fetchUser(record.user_id)
          isOwnerSameTeam =
            !!ownerProfile?.team_id &&
            ownerProfile.team_id === userProfile.team_id
        }
      }

      if (isOwner || isSameTeamViaRecord || isOwnerOnMyTeam || isOwnerSameTeam) {
        return NextResponse.json(record, { status: 200 })
      }
    }

    // Anonymous classification with matching token
    if (!record.user_id) {
      const anonymousToken = getAnonymousTokenFromCookieHeader(
        req.headers.get("cookie"),
      )
      if (anonymousToken && record.anonymous_token === anonymousToken) {
        // If the requester is now authenticated, link this classification to them
        if (user) {
          const { data: updated } = await supabase
            .from("classifications")
            .update({
              user_id: user.id,
              team_id: userProfile?.team_id || null,
              anonymous_token: null,
            })
            .eq("id", record.id)
            .is("user_id", null)
            .select(
              "*, classifier:users(name, email), importer:importers(name)",
            )
            .single<ClassificationRecord>()

          if (updated) {
            return NextResponse.json(updated, { status: 200 })
          }
        }

        return NextResponse.json(record, { status: 200 })
      }
    }

    // Shared classifications are publicly readable
    if (record.is_shared) {
      return NextResponse.json(record, { status: 200 })
    }

    return NextResponse.json(
      { error: "You don't have access to this classification" },
      { status: 403 },
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
