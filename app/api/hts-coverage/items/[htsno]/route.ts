import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { loadHeadingDetail } from "@/libs/hts-coverage/server"

export const dynamic = "force-dynamic"

// One heading: its HTS text, the notes it cites, and what the engine has for it
export async function GET(_req: Request, { params }: { params: { htsno: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    return NextResponse.json(await loadHeadingDetail(db, decodeURIComponent(params.htsno)))
  } catch (error) {
    return errorResponse(error)
  }
}
