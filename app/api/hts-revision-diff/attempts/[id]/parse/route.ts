import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { loadAttempt, parseAttempt } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Parses the stored markdown and JSON again (after a parser change) without
// converting again
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    await parseAttempt(db, params.id)
    const { attempt } = await loadAttempt(db, params.id)
    return NextResponse.json({ attempt })
  } catch (error) {
    return errorResponse(error)
  }
}
