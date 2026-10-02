import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { summarizeRevision } from "@/libs/hts-revision-diff/claude"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { loadAttempt } from "@/libs/hts-revision-diff/pipeline"
import { renderRevisionSummaryMaterial } from "@/libs/hts-revision-diff/render"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import type { ChangeRow } from "@/libs/hts-revision-diff/types"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Asks Claude for a high-level overview of the changes listed in the change record
// (whatever their review decision; differences outside the change record are left
// out) and saves it on the comparison. Replaces any earlier one.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    // Naming revision_summary fails here, before paying for a Claude call, if the
    // column's migration hasn't been run
    const comparison = await db.from(T.COMPARISONS).select("*, revision_summary").eq("id", params.id).single()
    if (comparison.error) {
      throw new Error(
        /revision_summary/.test(comparison.error.message)
          ? "The revision_summary column is missing. Run supabase/migrations/hts_revision_diff_parsing_004_revision_summary.sql on the dev-hts-hero project."
          : comparison.error.message
      )
    }
    const changes = await db
      .from(T.CHANGES)
      .select("*")
      .eq("comparison_id", params.id)
      .in("source", ["change_record", "change_record_no_diff"])
      .order("sort_order", { ascending: true })
    if (changes.error) throw new Error(changes.error.message)
    const listed = (changes.data ?? []) as ChangeRow[]
    if (!listed.length) return errorResponse(new Error("The change record doesn't list any Chapter 99 changes"), 400)

    const from = await loadAttempt(db, comparison.data.from_attempt_id)
    const to = await loadAttempt(db, comparison.data.to_attempt_id)
    const material = renderRevisionSummaryMaterial(listed, from.revision.name, to.revision.name)
    const summary = await summarizeRevision(material, listed.length)

    const updated = await db
      .from(T.COMPARISONS)
      .update({ revision_summary: summary })
      .eq("id", params.id)
      .select("*")
      .single()
    if (updated.error) throw new Error(updated.error.message)
    return NextResponse.json({ comparison: updated.data })
  } catch (error) {
    return errorResponse(error)
  }
}
