import { NextRequest, NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { normalizeHtsCode } from "@/libs/hts-revision-diff/text"

export const dynamic = "force-dynamic"

const TEXT_FIELDS = ["stat_suffix", "description", "general", "special", "other", "units"]

// Edits a heading row or marks it reviewed. Saving an edit marks it reviewed.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const body = await req.json()
    const values: Record<string, unknown> = {}
    for (const f of TEXT_FIELDS) if (f in body) values[f] = String(body[f] ?? "").trim()
    if ("htsno" in body) values.htsno = String(body.htsno ?? "").trim() ? normalizeHtsCode(String(body.htsno)) : ""
    if ("indent" in body) values.indent = Number(body.indent) || 0
    if ("page" in body) values.page = body.page ? Number(body.page) : null
    if ("footnotes" in body) values.footnotes = Array.isArray(body.footnotes) ? body.footnotes.map(String).filter(Boolean) : []
    const edited = Object.keys(values).length > 0
    if ("reviewed" in body || edited) {
      const reviewed = "reviewed" in body ? !!body.reviewed : true
      values.reviewed = reviewed
      values.reviewed_at = reviewed ? new Date().toISOString() : null
    }
    const { data, error } = await db.from(T.HEADING_ROWS).update(values).eq("id", params.id).select("*").single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ row: data })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { error } = await db.from(T.HEADING_ROWS).delete().eq("id", params.id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}
