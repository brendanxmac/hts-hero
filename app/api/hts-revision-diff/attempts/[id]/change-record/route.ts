import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { ensureChangeRecordItems } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Reads the change record into items with Claude again (replacing the stored
// items). New comparisons use the new items.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const items = await ensureChangeRecordItems(db, params.id, true)
    return NextResponse.json({ items })
  } catch (error) {
    return errorResponse(error)
  }
}
