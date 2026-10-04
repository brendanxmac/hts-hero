import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { createBatch, listBatches } from "@/libs/hts-coverage/batches"

export const dynamic = "force-dynamic"

export async function GET() {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    return NextResponse.json(await listBatches(db))
  } catch (error) {
    return errorResponse(error)
  }
}

// { title, name?, instructions?, htsnos? }
export async function POST(request: Request) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    return NextResponse.json(await createBatch(db, await request.json()))
  } catch (error) {
    return errorResponse(error, 400)
  }
}
