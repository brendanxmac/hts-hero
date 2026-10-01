import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { submitConversions } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Sends the attempt's PDFs to datalab (only those not converted yet, or failed)
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { attempt, documents } = await submitConversions(db, params.id)
    return NextResponse.json({ attempt, documents })
  } catch (error) {
    return errorResponse(error)
  }
}
