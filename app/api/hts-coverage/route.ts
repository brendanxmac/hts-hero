import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { loadDashboard } from "@/libs/hts-coverage/server"

export const dynamic = "force-dynamic"

// Everything the /coverage-checker dashboard shows
export async function GET() {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    return NextResponse.json(await loadDashboard(db))
  } catch (error) {
    return errorResponse(error)
  }
}
