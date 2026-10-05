import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { headingRowsFingerprint, loadHeadingRows } from "@/libs/hts-revision-diff/headings"
import { loadAttempt } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import type { ComparisonStats } from "@/libs/hts-revision-diff/types"

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

    // Have the newer attempt's reviewed heading rows changed since this was built?
    // Only matters when cited headings come from those rows (no Chapter 99 JSON).
    // Comparisons built before fingerprints were saved fall back to comparing counts.
    const stats = comparison.data.stats as ComparisonStats | null
    let headingRowsChanged = false
    if (comparison.data.status === "ready" && stats && stats.headingSource !== "revision_json") {
      const rows = await loadHeadingRows(db, to.attempt.id)
      headingRowsChanged = stats.headingRowsFingerprint
        ? stats.headingRowsFingerprint !== headingRowsFingerprint(rows)
        : (stats.headingSource === "none" && rows.some((r) => r.reviewed)) ||
          (stats.unreviewedHeadingRows ?? 0) !== rows.filter((r) => !r.reviewed).length
    }

    return NextResponse.json({
      headingRowsChanged,
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
