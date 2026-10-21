import { NextResponse } from "next/server"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { requireSocialStudio } from "@/libs/social-studio/access"
import { IDEAS_TABLE, type Idea } from "@/libs/social-studio/ideas"
import { newsKey, newsPhase, newsScore, recentUpdates } from "@/libs/social-studio/news"

export const dynamic = "force-dynamic"

// The last 30 days of published tariff updates, for the studio's News tab: each with whether
// it's announced or in effect, the daily ideas' score (null: not one to post), and the post
// already saved for it, if any
export async function GET() {
  const { db, denied } = await requireSocialStudio()
  if (denied) return denied
  try {
    const updates = await recentUpdates(db, 30)
    const keys = updates.map(newsKey)
    const saved = await db.from(IDEAS_TABLE).select("*").in("dedupe_key", keys).order("created_at", { ascending: false })
    const byKey = new Map<string, Idea>()
    ;((saved.data ?? []) as Idea[]).forEach((idea) => byKey.has(idea.dedupe_key) || byKey.set(idea.dedupe_key, idea))
    return NextResponse.json({
      updates: updates.map((u) => ({ ...u, phase: newsPhase(u), score: newsScore(u), idea: byKey.get(newsKey(u)) ?? null })),
      warning: saved.error ? `${saved.error.message}. Has supabase/migrations/social_ideas.sql been applied?` : null,
    })
  } catch (e) {
    return errorResponse(e)
  }
}
