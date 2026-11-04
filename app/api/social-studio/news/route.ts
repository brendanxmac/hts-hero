import { NextResponse } from "next/server"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { requireSocialStudio } from "@/libs/social-studio/access"
import { newsPhase, newsScore, recentUpdates } from "@/libs/social-studio/news"

export const dynamic = "force-dynamic"

// The last 30 days of published tariff updates, for the studio's News tab: each with whether
// it's announced or in effect, and the ideas' score (null: not one to post)
export async function GET() {
  const { db, denied } = await requireSocialStudio()
  if (denied) return denied
  try {
    const updates = await recentUpdates(db, 30)
    return NextResponse.json({ updates: updates.map((u) => ({ ...u, phase: newsPhase(u), score: newsScore(u) })) })
  } catch (e) {
    return errorResponse(e)
  }
}
