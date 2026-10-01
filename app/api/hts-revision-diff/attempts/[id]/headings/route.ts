import { NextRequest, NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { headingPagesInfo, loadHeadingRows } from "@/libs/hts-revision-diff/headings"
import { loadAttempt } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { signedUrl } from "@/libs/hts-revision-diff/storage"
import { normalizeHtsCode } from "@/libs/hts-revision-diff/text"

export const dynamic = "force-dynamic"

// The attempt's heading pages: document state, rows, Claude check, and the
// headings the change record cites
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { attempt, documents } = await loadAttempt(db, params.id)
    const document = documents.find((d) => d.kind === "ch99_headings_pdf") ?? null
    const cited = Array.from(
      new Set((attempt.change_record_items ?? []).filter((i) => i.in_chapter_99).flatMap((i) => i.hts_codes.map(normalizeHtsCode)))
    ).sort()
    return NextResponse.json({
      document,
      pdfUrl: document ? await signedUrl(db, document.storage_path) : null,
      info: headingPagesInfo(attempt),
      rows: await loadHeadingRows(db, params.id),
      cited,
      changeRecordRead: !!attempt.change_record_items,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

// Adds a heading by hand (counts as reviewed: you entered it)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const body = await req.json()
    if (typeof body.htsno !== "string" || (!body.htsno.trim() && !String(body.description ?? "").trim())) {
      return errorResponse(new Error("Enter a heading number or a description"), 400)
    }
    const rows = await loadHeadingRows(db, params.id)
    const { data, error } = await db
      .from(T.HEADING_ROWS)
      .insert({
        attempt_id: params.id,
        sort_order: rows.length,
        htsno: body.htsno.trim() ? normalizeHtsCode(body.htsno) : "",
        stat_suffix: String(body.stat_suffix ?? "").trim(),
        indent: Number(body.indent) || 0,
        description: String(body.description ?? "").trim(),
        general: String(body.general ?? "").trim(),
        special: String(body.special ?? "").trim(),
        other: String(body.other ?? "").trim(),
        units: String(body.units ?? "").trim(),
        footnotes: Array.isArray(body.footnotes) ? body.footnotes.map(String).filter(Boolean) : [],
        page: body.page ? Number(body.page) : null,
        source: "manual",
        reviewed: true,
        reviewed_at: new Date().toISOString(),
      })
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ row: data })
  } catch (error) {
    return errorResponse(error)
  }
}
