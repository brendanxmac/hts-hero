import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { refreshCoverage } from "@/libs/hts-coverage/server"

export const dynamic = "force-dynamic"
export const maxDuration = 120

// Re-reads Chapter 99 from USITC and compares it with the engine
export async function POST() {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    return NextResponse.json(await refreshCoverage(db))
  } catch (error) {
    return errorResponse(error)
  }
}
