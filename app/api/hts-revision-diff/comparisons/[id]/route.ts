import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { loadAttempt } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const comparison = await db.from(T.COMPARISONS).select("*").eq("id", params.id).single()
    if (comparison.error) throw new Error(comparison.error.message)
    const changes = await db
      .from(T.CHANGES)
      .select("*")
      .eq("comparison_id", params.id)
      .order("sort_order", { ascending: true })
    if (changes.error) throw new Error(changes.error.message)

    const from = await loadAttempt(db, comparison.data.from_attempt_id)
    const to = await loadAttempt(db, comparison.data.to_attempt_id)
    return NextResponse.json({
      comparison: comparison.data,
      changes: changes.data,
      from: { revision: from.revision, attemptNumber: from.attempt.attempt_number },
      to: {
        revision: to.revision,
        attemptNumber: to.attempt.attempt_number,
        changeRecordModel: to.attempt.change_record_model,
        changeRecordUsage: to.attempt.parse_stats?.changeRecordUsage ?? null,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
