import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { summarizeChange } from "@/libs/hts-revision-diff/claude"
import { RevisionDiffTables as T, SUMMARY_PROMPT_VERSION } from "@/libs/hts-revision-diff/constants"
import { loadAttempt } from "@/libs/hts-revision-diff/pipeline"
import { renderChangeMaterial } from "@/libs/hts-revision-diff/render"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import type { ChangeRow } from "@/libs/hts-revision-diff/types"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Asks Claude for a plain-English summary of one change. The category it
// suggests is applied only if the reviewer hasn't set one.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const found = await db.from(T.CHANGES).select("*").eq("id", params.id).single()
    if (found.error) throw new Error(found.error.message)
    const change = found.data as ChangeRow

    const comparison = await db
      .from(T.COMPARISONS)
      .select("from_attempt_id, to_attempt_id")
      .eq("id", change.comparison_id)
      .single()
    if (comparison.error) throw new Error(comparison.error.message)
    const from = await loadAttempt(db, comparison.data.from_attempt_id)
    const to = await loadAttempt(db, comparison.data.to_attempt_id)

    const material = renderChangeMaterial(change.title, change.payload, from.revision.name, to.revision.name)
    try {
      const { summary, model } = await summarizeChange(material)
      const updated = await db
        .from(T.CHANGES)
        .update({
          summary,
          summary_model: model,
          summary_prompt_version: SUMMARY_PROMPT_VERSION,
          summarized_at: new Date().toISOString(),
          summary_error: null,
          category: change.category ?? summary.category,
        })
        .eq("id", change.id)
        .select("*")
        .single()
      if (updated.error) throw new Error(updated.error.message)
      return NextResponse.json({ change: updated.data })
    } catch (error) {
      await db.from(T.CHANGES).update({ summary_error: (error as Error).message }).eq("id", change.id)
      throw error
    }
  } catch (error) {
    return errorResponse(error)
  }
}
