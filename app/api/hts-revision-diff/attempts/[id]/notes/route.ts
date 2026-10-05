import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { loadAttempt } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { downloadJson, downloadText, signedUrl } from "@/libs/hts-revision-diff/storage"
import type { ParsedNotes } from "@/libs/hts-revision-diff/types"

export const dynamic = "force-dynamic"

// Parse output for inspection: the note tree, warnings, the change record
// markdown and its extracted items, and links to every stored file
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { attempt, revision, documents } = await loadAttempt(db, params.id)
    const notes = attempt.notes_path ? await downloadJson<ParsedNotes>(db, attempt.notes_path) : null
    const changeRecordDoc = documents.find((d) => d.kind === "change_record")
    const changeRecordMarkdown = changeRecordDoc?.markdown_path
      ? await downloadText(db, changeRecordDoc.markdown_path)
      : null

    const links: { label: string; url: string }[] = []
    for (const doc of documents) {
      links.push({ label: `${doc.original_filename} (original)`, url: await signedUrl(db, doc.storage_path) })
      if (doc.markdown_path) {
        links.push({ label: `${doc.kind} markdown`, url: await signedUrl(db, doc.markdown_path) })
      }
    }

    return NextResponse.json({ attempt, revision, documents, notes, changeRecordMarkdown, links })
  } catch (error) {
    return errorResponse(error)
  }
}
