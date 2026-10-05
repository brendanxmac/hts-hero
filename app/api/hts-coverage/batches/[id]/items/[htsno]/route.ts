import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { updateBatchItem } from "@/libs/hts-coverage/batches"

export const dynamic = "force-dynamic"

// { decision?, instructions? } for one heading in a batch
export async function PATCH(request: Request, { params }: { params: { id: string; htsno: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    return NextResponse.json({ batchItem: await updateBatchItem(db, params.id, decodeURIComponent(params.htsno), await request.json()) })
  } catch (error) {
    return errorResponse(error, 400)
  }
}
