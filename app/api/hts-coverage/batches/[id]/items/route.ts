import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { addBatchItems, removeBatchItems } from "@/libs/hts-coverage/batches"

export const dynamic = "force-dynamic"

type Params = { params: { id: string } }

const codes = (body: { htsnos?: unknown }) => {
  const list = Array.isArray(body.htsnos) ? body.htsnos.filter((h): h is string => typeof h === "string") : []
  if (!list.length) throw new Error("No headings given")
  return list
}

// Adds headings: { htsnos }. Headings in another open batch are skipped and listed.
export async function POST(request: Request, { params }: Params) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    return NextResponse.json(await addBatchItems(db, params.id, codes(await request.json())))
  } catch (error) {
    return errorResponse(error, 400)
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    return NextResponse.json(await removeBatchItems(db, params.id, codes(await request.json())))
  } catch (error) {
    return errorResponse(error, 400)
  }
}
