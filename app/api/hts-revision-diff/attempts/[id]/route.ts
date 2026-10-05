import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { advanceAttempt } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Current state of an attempt. Also advances it: checks datalab for finished
// conversions and parses once everything has converted.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { attempt, revision, documents } = await advanceAttempt(db, params.id)
    return NextResponse.json({ attempt, revision, documents })
  } catch (error) {
    return errorResponse(error)
  }
}
