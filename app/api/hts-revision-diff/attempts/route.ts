import { NextRequest, NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { REVISION_NAME_PATTERN, RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { assertHtsJson } from "@/libs/hts-revision-diff/parse-ch99-json"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { attemptFolder, sourcePath, uploadFile } from "@/libs/hts-revision-diff/storage"
import { saveCurrentCh99Snapshot } from "@/libs/hts-revision-diff/pipeline"
import { DOCUMENT_KINDS, DocumentKind, REQUIRED_DOCUMENT_KINDS } from "@/libs/hts-revision-diff/types"
import { getRevision } from "@/tariffs/engine-v2/revisions"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Uploads a revision's files as a new attempt. Multipart fields:
// revisionName, change_record (PDF), ch99_pdf (PDF), and optionally
// ch99_json (JSON). Without a JSON file, a copy of USITC's Chapter 99 export
// is saved if the revision is the current one.
export async function POST(req: NextRequest) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied

  try {
    const form = await req.formData()
    const revisionName = String(form.get("revisionName") ?? "").trim()
    if (!REVISION_NAME_PATTERN.test(revisionName)) {
      return errorResponse(new Error('Revision name must look like "2026HTSRev5" or "2026HTSBasic"'), 400)
    }

    const files: Partial<Record<DocumentKind, File>> = {}
    for (const kind of DOCUMENT_KINDS) {
      const file = form.get(kind)
      if (!(file instanceof File) || !file.size) {
        if (REQUIRED_DOCUMENT_KINDS.includes(kind)) {
          return errorResponse(new Error(`Missing file: ${kind}`), 400)
        }
        continue
      }
      const isJson = kind === "ch99_json"
      if (isJson ? !file.name.toLowerCase().endsWith(".json") : !file.name.toLowerCase().endsWith(".pdf")) {
        return errorResponse(new Error(`${kind} must be a ${isJson ? ".json" : ".pdf"} file`), 400)
      }
      files[kind] = file
    }

    // Reject a JSON file that isn't an HTS export before storing anything
    if (files.ch99_json) {
      try {
        assertHtsJson(JSON.parse(await files.ch99_json.text()))
      } catch (error) {
        return errorResponse(error, 400)
      }
    }

    // Revision row (created on first upload)
    let { data: revision } = await db.from(T.REVISIONS).select("*").eq("name", revisionName).maybeSingle()
    if (!revision) {
      const created = await db
        .from(T.REVISIONS)
        .insert({ name: revisionName, title: getRevision(revisionName)?.title ?? null })
        .select("*")
        .single()
      if (created.error) throw new Error(created.error.message)
      revision = created.data
    }

    const { data: last } = await db
      .from(T.ATTEMPTS)
      .select("attempt_number")
      .eq("revision_id", revision.id)
      .order("attempt_number", { ascending: false })
      .limit(1)
    const attemptNumber = (last?.[0]?.attempt_number ?? 0) + 1
    const folder = attemptFolder(revisionName, attemptNumber)

    // Store the files first so an attempt row never points at missing files
    const stored: { kind: DocumentKind; path: string; file: File }[] = []
    for (const kind of DOCUMENT_KINDS) {
      const file = files[kind]
      if (!file) continue
      const path = sourcePath(folder, kind, file.name)
      await uploadFile(db, path, file, kind === "ch99_json" ? "application/json" : "application/pdf")
      stored.push({ kind, path, file })
    }

    const attempt = await db
      .from(T.ATTEMPTS)
      .insert({ revision_id: revision.id, attempt_number: attemptNumber, status: "uploaded" })
      .select("*")
      .single()
    if (attempt.error) throw new Error(attempt.error.message)

    const docs = await db.from(T.DOCUMENTS).insert(
      stored.map(({ kind, path, file }) => ({
        attempt_id: attempt.data.id,
        kind,
        original_filename: file.name,
        storage_path: path,
        size_bytes: file.size,
        conversion_status: kind === "ch99_json" ? "not_needed" : "pending",
      }))
    )
    if (docs.error) throw new Error(docs.error.message)

    // Best effort: a failed USITC fetch doesn't fail the upload
    const snapshot = files.ch99_json
      ? "uploaded"
      : await saveCurrentCh99Snapshot(db, attempt.data.id).catch(() => "failed" as const)

    return NextResponse.json({ attemptId: attempt.data.id, ch99Json: snapshot })
  } catch (error) {
    return errorResponse(error)
  }
}
