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

// Asks Claude for a high-level overview of the comparison's approved changes and
// saves it on the comparison. Replaces any earlier one.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const comparison = await db.from(T.COMPARISONS).select("*").eq("id", params.id).single()
    if (comparison.error) throw new Error(comparison.error.message)
    const changes = await db
      .from(T.CHANGES)
      .select("*")
      .eq("comparison_id", params.id)
      .eq("decision", "approve")
      .order("sort_order", { ascending: true })
    if (changes.error) throw new Error(changes.error.message)
    const approved = (changes.data ?? []) as ChangeRow[]
    if (!approved.length) return errorResponse(new Error("Approve at least one change first"), 400)

    const from = await loadAttempt(db, comparison.data.from_attempt_id)
    const to = await loadAttempt(db, comparison.data.to_attempt_id)
    const material = renderRevisionSummaryMaterial(approved, from.revision.name, to.revision.name)
    const summary = await summarizeRevision(material, approved.length)

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
