import { NextRequest, NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"

// Saves the reviewer's optional context for a revision: { context_notes: string }.
// An empty string clears it.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const body = await req.json()
    if (typeof body.context_notes !== "string") {
      return errorResponse(new Error("context_notes must be text"), 400)
    }
    const notes = body.context_notes.trim()
    const { data, error } = await db
      .from(T.REVISIONS)
      .update({ context_notes: notes || null, context_notes_updated_at: notes ? new Date().toISOString() : null })
      .eq("id", params.id)
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ revision: data })
  } catch (error) {
    return errorResponse(error)
  }
}
