import { createHash } from "crypto"
import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { loadAttempt } from "@/libs/hts-revision-diff/pipeline"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { downloadText, uploadFile } from "@/libs/hts-revision-diff/storage"
import type { RevisionDb } from "@/libs/hts-revision-diff/access"

export const dynamic = "force-dynamic"

const PAGE_SEPARATOR = /^\{(\d+)\}-{6,}\s*$/

// Identifies a version of the file, so a save can't overwrite edits it
// didn't start from
const versionOf = (text: string) => createHash("sha1").update(text).digest("hex")

// datalab's "{n}----" page separators in order. The parser takes page
// numbers from them, so an edit must keep them as they are.
const separators = (text: string): string[] =>
  text.split("\n").flatMap((l): string[] => {
    const m = l.trim().match(PAGE_SEPARATOR)
    return m ? [m[1]] : []
  })

const chapter99Markdown = async (db: RevisionDb, attemptId: string) => {
  const { documents } = await loadAttempt(db, attemptId)
  const path = documents.find((d) => d.kind === "ch99_pdf")?.markdown_path
  if (!path) throw new Error("The Chapter 99 PDF hasn't been converted yet")
  const original = path.replace(/\.md$/, ".datalab.md")
  return { path, original, text: await downloadText(db, path) }
}

const exists = (db: RevisionDb, path: string) => downloadText(db, path).then(() => true, () => false)

// The whole Chapter 99 markdown, with its version and whether it's been edited
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { original, text } = await chapter99Markdown(db, params.id)
    return NextResponse.json({ text, version: versionOf(text), edited: await exists(db, original) })
  } catch (error) {
    return errorResponse(error)
  }
}

// Replaces the Chapter 99 markdown, to fix what the conversion got wrong.
// `baseVersion` is the version the edit started from; the save is refused if
// the file changed since. The first save keeps datalab's original next to it.
// Re-parse to use the change.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const { text, baseVersion } = (await req.json()) as { text: string; baseVersion: string }
    const current = await chapter99Markdown(db, params.id)
    if (versionOf(current.text) !== baseVersion) {
      return NextResponse.json(
        { error: "The markdown changed since you opened it (another tab?). Reload it and make your edit again." },
        { status: 409 }
      )
    }
    if (separators(text).join(",") !== separators(current.text).join(",")) {
      throw new Error("Page separators like {366}------ were changed or removed. Keep them as they are so page numbers stay right.")
    }

    if (!(await exists(db, current.original))) {
      await uploadFile(db, current.original, current.text, "text/markdown; charset=utf-8")
    }
    await uploadFile(db, current.path, text, "text/markdown; charset=utf-8")
    return NextResponse.json({ version: versionOf(text), edited: true })
  } catch (error) {
    return errorResponse(error)
  }
}
