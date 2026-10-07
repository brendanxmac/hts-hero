import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import {
  headingRowsFingerprint,
  headingsUsedByChanges,
  loadHeadingRows,
  unreviewedHeadings,
} from "@/libs/hts-revision-diff/headings"
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
    const [fromRows, toRows] = await Promise.all([loadHeadingRows(db, from.attempt.id), loadHeadingRows(db, to.attempt.id)])

    // Headings the changes rely on whose rows aren't reviewed yet: they must be before pulling
    const used = headingsUsedByChanges(changes.data ?? [])
    const unreviewedInChanges = { from: unreviewedHeadings(fromRows, used), to: unreviewedHeadings(toRows, used) }

    // Have either attempt's heading rows changed since this was built?
    // Only matters when cited headings come from those rows (no Chapter 99 JSON).
    // Comparisons built before fingerprints were saved fall back to comparing counts.
    const stats = comparison.data.stats as ComparisonStats | null
    let headingRowsChanged = false
    if (comparison.data.status === "ready" && stats && stats.headingSource !== "revision_json") {
      headingRowsChanged = stats.headingRowsFingerprint
        ? stats.headingRowsFingerprint !== headingRowsFingerprint(toRows)
        : (stats.headingSource === "none" && toRows.length > 0) ||
          (stats.unreviewedHeadingRows ?? 0) !== toRows.filter((r) => !r.reviewed).length
    }
    // The same for the older attempt's rows (the "before" of cited headings).
    // Comparisons built before these were saved aren't checked.
    if (
      !headingRowsChanged &&
      comparison.data.status === "ready" &&
      stats?.fromHeadingRowsFingerprint &&
      stats.fromHeadingSource !== "revision_json"
    ) {
      headingRowsChanged = stats.fromHeadingRowsFingerprint !== headingRowsFingerprint(fromRows)
    }

    return NextResponse.json({
      headingRowsChanged,
      unreviewedInChanges,
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
