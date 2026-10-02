import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { loadHeadingRows, uncitedHeadingRowIds } from "@/libs/hts-revision-diff/headings"
import { loadAttempt } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"

// Deletes the heading rows the change record doesn't cite (see uncitedHeadingRowIds).
// Worked out again here rather than trusting the page's list, in case it's stale.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { attempt } = await loadAttempt(db, params.id)
    if (!attempt.change_record_items) {
      return errorResponse(new Error("Read the change record first (on this revision's first comparison)"), 400)
    }
    const ids = uncitedHeadingRowIds(await loadHeadingRows(db, params.id), attempt.change_record_items)
    if (!ids.length) return NextResponse.json({ deleted: 0 })
    const { error, count } = await db
      .from(T.HEADING_ROWS)
      .delete({ count: "exact" })
      .eq("attempt_id", params.id)
      .in("id", ids)
    if (error) throw new Error(error.message)
    return NextResponse.json({ deleted: count ?? 0 })
  } catch (error) {
    return errorResponse(error)
  }
}
