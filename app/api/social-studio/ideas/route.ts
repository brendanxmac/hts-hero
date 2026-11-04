import { NextResponse } from "next/server"
import { requireSocialStudio } from "@/libs/social-studio/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { findIdeas } from "@/libs/social-studio/ideas"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Find post ideas now (the studio's "Find ideas" button). Nothing is stored: the ideas live in
// the page until it's closed.
export async function POST() {
  const { db, denied } = await requireSocialStudio()
  if (denied) return denied
  try {
    return NextResponse.json(await findIdeas({ db }))
  } catch (e) {
    return errorResponse(e)
  }
}
