import { NextRequest, NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { loadAttempt, submitDocument } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { attemptFolder, sourcePath, uploadFile } from "@/libs/hts-revision-diff/storage"
import type { DocumentRow } from "@/libs/hts-revision-diff/types"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Adds (or replaces) an attempt's heading pages and sends them to datalab.
// The attempt's status isn't touched: its notes stay parsed.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const file = (await req.formData()).get("file")
    if (!(file instanceof File) || !file.size || !file.name.toLowerCase().endsWith(".pdf")) {
      return errorResponse(new Error("Choose the trimmed heading pages as a PDF"), 400)
    }
    const { attempt, revision, documents } = await loadAttempt(db, params.id)
    const path = sourcePath(attemptFolder(revision.name, attempt.attempt_number), "ch99_headings_pdf", file.name)
    await uploadFile(db, path, file, "application/pdf")

    const existing = documents.find((d) => d.kind === "ch99_headings_pdf")
    const values: Partial<DocumentRow> = {
      original_filename: file.name,
      storage_path: path,
      size_bytes: file.size,
      conversion_status: "pending",
      datalab_request_id: null,
      datalab_check_url: null,
      markdown_path: null,
      page_count: null,
      error: null,
      submitted_at: null,
      completed_at: null,
    }
    const saved = existing
      ? await db.from(T.DOCUMENTS).update(values).eq("id", existing.id).select("*").single()
      : await db.from(T.DOCUMENTS).insert({ ...values, attempt_id: params.id, kind: "ch99_headings_pdf" }).select("*").single()
    if (saved.error) throw new Error(saved.error.message)

    await submitDocument(db, saved.data as DocumentRow)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}
