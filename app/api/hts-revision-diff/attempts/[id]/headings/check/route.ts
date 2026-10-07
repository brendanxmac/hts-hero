import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { checkHeadingRowsWithClaude, checkSomeHeadingRowsWithClaude } from "@/libs/hts-revision-diff/headings"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Has Claude check the PDF rows against the heading pages. Corrections reset
// those rows' reviews. Large uploads are checked in chunks; `done: false` means
// some pages are left, and posting again continues. With { rowIds }, only the
// pages those rows are on are checked, in one request.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const body = await req.json().catch(() => ({}))
    const rowIds = Array.isArray(body?.rowIds) ? body.rowIds.filter((id: unknown): id is string => typeof id === "string") : null
    if (rowIds) {
      if (!rowIds.length) return errorResponse(new Error("Choose rows to check"), 400)
      const result = await checkSomeHeadingRowsWithClaude(db, params.id, rowIds)
      return NextResponse.json({ ok: true, done: true, ...result })
    }
    const { done } = await checkHeadingRowsWithClaude(db, params.id)
    return NextResponse.json({ ok: true, done })
  } catch (error) {
    return errorResponse(error)
  }
}
