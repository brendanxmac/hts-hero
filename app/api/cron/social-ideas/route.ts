import { NextRequest, NextResponse } from "next/server"
import { runDailyIdeas } from "@/libs/social-studio/ideas"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Every morning (vercel.json): today's social post ideas for /social-studio
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const result = await runDailyIdeas({ db: createAdminClient() })
  return NextResponse.json({ ideas: result.ideas.length, candidates: result.candidates, usage: result.usage, warnings: result.warnings })
}
