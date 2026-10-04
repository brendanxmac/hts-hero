import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { deleteBatch, loadBatch, updateBatch } from "@/libs/hts-coverage/batches"

export const dynamic = "force-dynamic"

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    return NextResponse.json(await loadBatch(db, params.id))
  } catch (error) {
    return errorResponse(error)
  }
}

// { title?, instructions?, dates_mode?, status?, pr_url? }
export async function PATCH(request: Request, { params }: Params) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    return NextResponse.json({ batch: await updateBatch(db, params.id, await request.json()) })
  } catch (error) {
    return errorResponse(error, 400)
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    return NextResponse.json(await deleteBatch(db, params.id))
  } catch (error) {
    return errorResponse(error, 400)
  }
}
