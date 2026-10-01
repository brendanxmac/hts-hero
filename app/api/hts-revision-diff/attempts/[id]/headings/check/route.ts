import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { checkHeadingRowsWithClaude } from "@/libs/hts-revision-diff/headings"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Has Claude check the PDF rows against the heading pages. Corrections reset
// those rows' reviews.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    await checkHeadingRowsWithClaude(db, params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}
