import { NextRequest, NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"

// Ids per update, to keep the request URL short
const CHUNK = 200

// Marks several of the attempt's rows reviewed (or not) at once: { ids: string[], reviewed: boolean }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const body = await req.json()
    const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string") : []
    if (!ids.length) return errorResponse(new Error("No rows given"), 400)
    const reviewed = body.reviewed !== false
    const values = { reviewed, reviewed_at: reviewed ? new Date().toISOString() : null }
    let updated = 0
    for (let i = 0; i < ids.length; i += CHUNK) {
      const { error, count } = await db
        .from(T.HEADING_ROWS)
        .update(values, { count: "exact" })
        .eq("attempt_id", params.id)
        .in("id", ids.slice(i, i + CHUNK))
      if (error) throw new Error(error.message)
      updated += count ?? 0
    }
    return NextResponse.json({ updated })
  } catch (error) {
    return errorResponse(error)
  }
}
