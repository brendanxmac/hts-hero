import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { CATEGORIES, CoverageTables as T, PRIORITIES, STATUSES } from "@/libs/hts-coverage/constants"
import type { CoveragePatch } from "@/libs/hts-coverage/types"

export const dynamic = "force-dynamic"

const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null)

// Validates a patch from the UI; only tracking fields can be changed
const parsePatch = (body: Record<string, unknown>): CoveragePatch => {
  const patch: CoveragePatch = {}
  if ("status" in body) {
    if (!STATUSES.includes(body.status as never)) throw new Error(`Unknown status ${body.status}`)
    patch.status = body.status as CoveragePatch["status"]
  }
  if ("category" in body) {
    if (body.category !== null && !CATEGORIES.includes(body.category as never)) throw new Error(`Unknown category ${body.category}`)
    patch.category = body.category as CoveragePatch["category"]
  }
  if ("priority" in body) {
    if (body.priority !== null && !PRIORITIES.includes(body.priority as never)) throw new Error(`Unknown priority ${body.priority}`)
    patch.priority = body.priority as CoveragePatch["priority"]
  }
  if ("program" in body) patch.program = text(body.program)
  if ("status_note" in body) patch.status_note = text(body.status_note)
  if ("notes" in body) patch.notes = text(body.notes)
  if (!Object.keys(patch).length) throw new Error("Nothing to change")
  return patch
}

// Changes tracking fields on one or more headings: { htsnos: [...], patch: {...} }
export async function PATCH(request: Request) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const body = await request.json()
    const htsnos: string[] = Array.isArray(body.htsnos) ? body.htsnos.filter((h: unknown) => typeof h === "string") : []
    if (!htsnos.length) throw new Error("No headings given")
    const patch = parsePatch(body.patch ?? {})
    const { data, error } = await db
      .from(T.ITEMS)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .in("htsno", htsnos)
      .select("*")
    if (error) throw new Error(error.message)
    return NextResponse.json({ items: data })
  } catch (error) {
    return errorResponse(error, 400)
  }
}
