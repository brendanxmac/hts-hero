import { NextRequest, NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { REVISION_NAME_PATTERN, RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { getRevision } from "@/tariffs/engine-v2/revisions"

export const dynamic = "force-dynamic"

// Renames a revision (e.g. uploaded as 2025HTSRev6 when its documents say
// 2026 Revision 6). Stored files keep their paths; only the name changes.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { name } = await req.json()
    if (typeof name !== "string" || !REVISION_NAME_PATTERN.test(name)) {
      return errorResponse(new Error('Revision name must look like "2026HTSRev6"'), 400)
    }
    const { data: existing } = await db.from(T.REVISIONS).select("id").eq("name", name)
    if (existing?.some((r) => r.id !== params.id)) {
      return errorResponse(new Error(`${name} already exists`), 400)
    }
    const { data, error } = await db
      .from(T.REVISIONS)
      .update({ name, title: getRevision(name)?.title ?? null })
      .eq("id", params.id)
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ revision: data })
  } catch (error) {
    return errorResponse(error)
  }
}
