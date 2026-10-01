import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { runComparison } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"

// Runs the comparison again as a new comparison (e.g. after re-parsing or
// re-reading the change record). Reviews of unchanged changes carry over.
// Uses each revision's active attempt.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const old = await db.from(T.COMPARISONS).select("*").eq("id", params.id).single()
    if (old.error) throw new Error(old.error.message)

    const activeAttempt = async (attemptId: string) => {
      const attempt = await db.from(T.ATTEMPTS).select("revision_id").eq("id", attemptId).single()
      if (attempt.error) throw new Error(attempt.error.message)
      const revision = await db
        .from(T.REVISIONS)
        .select("active_attempt_id")
        .eq("id", attempt.data.revision_id)
        .single()
      return revision.data?.active_attempt_id ?? attemptId
    }

    const created = await db
      .from(T.COMPARISONS)
      .insert({
        from_attempt_id: await activeAttempt(old.data.from_attempt_id),
        to_attempt_id: await activeAttempt(old.data.to_attempt_id),
        status: "pending",
      })
      .select("*")
      .single()
    if (created.error) throw new Error(created.error.message)

    void runComparison(db, created.data.id)
    return NextResponse.json({ comparisonId: created.data.id })
  } catch (error) {
    return errorResponse(error)
  }
}
