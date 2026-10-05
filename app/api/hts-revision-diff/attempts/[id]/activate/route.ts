import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { loadAttempt } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"

// Makes this attempt the one used for its revision in new comparisons
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { attempt, revision } = await loadAttempt(db, params.id)
    if (attempt.status !== "parsed") throw new Error("Only a parsed attempt can be made active")
    const { error } = await db
      .from(T.REVISIONS)
      .update({ active_attempt_id: attempt.id })
      .eq("id", revision.id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}
