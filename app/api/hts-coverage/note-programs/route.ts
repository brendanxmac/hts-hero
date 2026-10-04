import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { CoverageTables as T } from "@/libs/hts-coverage/constants"

export const dynamic = "force-dynamic"

// Sets which program a U.S. note or subdivision belongs to ({ note_key: "III:20", program: "301-china" }),
// or clears the override (program: null) so the suggestion applies again
export async function PUT(request: Request) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { note_key, program } = await request.json()
    if (typeof note_key !== "string" || !/^[IVXL]+:\d+(\([A-Za-z0-9]+\))?$/.test(note_key)) throw new Error("note_key must look like III:20 or III:20(h)")
    const result =
      typeof program === "string" && program.trim()
        ? await db.from(T.NOTE_PROGRAMS).upsert({ note_key, program: program.trim(), updated_at: new Date().toISOString() })
        : await db.from(T.NOTE_PROGRAMS).delete().eq("note_key", note_key)
    if (result.error) throw new Error(result.error.message)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error, 400)
  }
}
