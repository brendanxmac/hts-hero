import { NextRequest, NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { loadAttempt, revisionNameProblem, runComparison } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"

// Starts a comparison between two parsed attempts. Returns right away; the
// page polls the comparison until it's ready.
export async function POST(req: NextRequest) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { fromAttemptId, toAttemptId } = await req.json()
    if (!fromAttemptId || !toAttemptId || fromAttemptId === toAttemptId) {
      return errorResponse(new Error("Pick two different revisions"), 400)
    }
    const from = await loadAttempt(db, fromAttemptId)
    const to = await loadAttempt(db, toAttemptId)
    if (from.revision.id === to.revision.id) {
      return errorResponse(new Error("Pick two different revisions"), 400)
    }
    if (from.attempt.status !== "parsed" || to.attempt.status !== "parsed") {
      return errorResponse(new Error("Both revisions must be parsed first"), 400)
    }
    for (const side of [from, to]) {
      const problem = revisionNameProblem(side.attempt, side.revision.name)
      if (problem) return errorResponse(new Error(problem), 400)
    }

    const created = await db
      .from(T.COMPARISONS)
      .insert({ from_attempt_id: fromAttemptId, to_attempt_id: toAttemptId, status: "pending" })
      .select("*")
      .single()
    if (created.error) throw new Error(created.error.message)

    // Runs in the background of the local dev server; status is saved as it goes
    void runComparison(db, created.data.id)
    return NextResponse.json({ comparisonId: created.data.id })
  } catch (error) {
    return errorResponse(error)
  }
}
