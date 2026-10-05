import { NextRequest, NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"

const DECISIONS = ["pending", "approve", "skip", "defer"]
const CATEGORIES = ["data", "logic", "mixed", "none", null]

// Saves the review of one change: decision, category and notes
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const body = await req.json()
    const values: Record<string, unknown> = {}
    if ("decision" in body) {
      if (!DECISIONS.includes(body.decision)) return errorResponse(new Error("Invalid decision"), 400)
      values.decision = body.decision
      values.reviewed_at = body.decision === "pending" ? null : new Date().toISOString()
    }
    if ("category" in body) {
      if (!CATEGORIES.includes(body.category)) return errorResponse(new Error("Invalid category"), 400)
      values.category = body.category
    }
    if ("reviewer_notes" in body) {
      values.reviewer_notes = typeof body.reviewer_notes === "string" ? body.reviewer_notes : null
    }
    const { data, error } = await db.from(T.CHANGES).update(values).eq("id", params.id).select("*").single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ change: data })
  } catch (error) {
    return errorResponse(error)
  }
}
