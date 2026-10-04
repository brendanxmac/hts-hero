import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { suggestForHeadings } from "@/libs/hts-coverage/claude"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Claude suggestions for a few headings: { htsnos } (at most SUGGEST_CHUNK)
export async function POST(request: Request) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { htsnos } = await request.json()
    return NextResponse.json(await suggestForHeadings(db, Array.isArray(htsnos) ? htsnos : []))
  } catch (error) {
    return errorResponse(error)
  }
}
