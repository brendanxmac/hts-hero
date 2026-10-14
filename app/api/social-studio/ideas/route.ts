import { NextRequest, NextResponse } from "next/server"
import { requireSocialStudio } from "@/libs/social-studio/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { IDEAS_TABLE, runDailyIdeas } from "@/libs/social-studio/ideas"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// The last two weeks of ideas, newest day first
export async function GET() {
  const { db, denied } = await requireSocialStudio()
  if (denied) return denied
  const since = new Date(Date.now() - 14 * 86400e3).toISOString().slice(0, 10)
  const { data, error } = await db.from(IDEAS_TABLE).select("*").gte("run_on", since).order("run_on", { ascending: false }).order("position")
  if (error) return errorResponse(new Error(`${error.message}. Has supabase/migrations/social_ideas.sql been applied?`))
  return NextResponse.json({ ideas: data })
}

// Find today's ideas now, as the cron does
export async function POST() {
  const { db, denied } = await requireSocialStudio()
  if (denied) return denied
  try {
    return NextResponse.json(await runDailyIdeas({ db }))
  } catch (e) {
    return errorResponse(e)
  }
}

// Mark an idea used, skipped or new again, and/or save its edited words and captions
export async function PATCH(req: NextRequest) {
  const { db, denied } = await requireSocialStudio()
  if (denied) return denied
  const { id, status, props, captions } = await req.json()
  const update: Record<string, unknown> = {}
  if (status !== undefined) {
    if (!["new", "used", "skipped"].includes(status)) return errorResponse(new Error("Unknown status"), 400)
    update.status = status
  }
  if (props && typeof props === "object") update.props = props
  if (captions && typeof captions.linkedin === "string" && typeof captions.x === "string") update.captions = { linkedin: captions.linkedin, x: captions.x }
  if (!Object.keys(update).length) return errorResponse(new Error("Nothing to update"), 400)
  const { error } = await db.from(IDEAS_TABLE).update(update).eq("id", id)
  if (error) return errorResponse(new Error(error.message))
  return NextResponse.json({ ok: true })
}
