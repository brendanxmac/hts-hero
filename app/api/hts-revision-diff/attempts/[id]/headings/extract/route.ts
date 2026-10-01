import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { extractHeadingRows } from "@/libs/hts-revision-diff/headings"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"

// Reads the heading rows from the converted pages again (after a parser
// change). Replaces the PDF rows and their reviews; manual rows are kept.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const count = await extractHeadingRows(db, params.id)
    return NextResponse.json({ rows: count })
  } catch (error) {
    return errorResponse(error)
  }
}
