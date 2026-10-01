import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { RevisionDiffTables as T } from "@/libs/hts-revision-diff/constants"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"

export const dynamic = "force-dynamic"

// Everything the main /revision-checker page lists
export async function GET() {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  try {
    const [revisions, attempts, documents, comparisons] = await Promise.all([
      db.from(T.REVISIONS).select("*").order("name", { ascending: false }),
      db
        .from(T.ATTEMPTS)
        .select(
          "id, revision_id, attempt_number, status, error, parse_stats, parser_version, parsed_at, change_record_extracted_at, created_at, updated_at"
        )
        .order("attempt_number", { ascending: false }),
      db
        .from(T.DOCUMENTS)
        .select("id, attempt_id, kind, original_filename, size_bytes, conversion_status, page_count, error, submitted_at, completed_at"),
      db.from(T.COMPARISONS).select("*").order("created_at", { ascending: false }),
    ])
    for (const r of [revisions, attempts, documents, comparisons]) {
      if (r.error) throw new Error(r.error.message)
    }

    // Review progress per comparison
    const { data: changes, error } = await db.from(T.CHANGES).select("comparison_id, decision")
    if (error) throw new Error(error.message)
    const progress: Record<string, { total: number; decided: number }> = {}
    for (const c of changes ?? []) {
      const p = (progress[c.comparison_id] ??= { total: 0, decided: 0 })
      p.total++
      if (c.decision !== "pending") p.decided++
    }

    return NextResponse.json({
      revisions: revisions.data,
      attempts: attempts.data,
      documents: documents.data,
      comparisons: comparisons.data,
      progress,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
