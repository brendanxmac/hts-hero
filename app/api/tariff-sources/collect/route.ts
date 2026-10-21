import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { collectSources } from "@/libs/tariff-sources/collect"
import { SOURCE_IDS, type SourceId } from "@/libs/tariff-sources/types"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const DATE = /^\d{4}-\d{2}-\d{2}$/

// "Collect now" in /tariff-sources: the cron's collection, run on demand by the admin. With
// { source, since, until } (YYYY-MM-DD) it's one piece of a backfill instead: the dashboard sends
// each source on its own, and the Federal Register a month at a time, so no request runs long.
// Stored items are skipped either way, and the 15-minute cron processes what's added; updates from
// before NEWS_ALERTS_FROM are history, never alerted.
export async function POST(req: NextRequest) {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const body = (await req.json().catch(() => ({}))) as { source?: SourceId; since?: string; until?: string }
  if (!body.since) {
    const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const results = await collectSources(db, { since, trigger: "manual" })
    return NextResponse.json({ results })
  }
  if (!DATE.test(body.since) || (body.until && !DATE.test(body.until))) {
    return NextResponse.json({ error: "since and until must be YYYY-MM-DD" }, { status: 400 })
  }
  if (body.source && !SOURCE_IDS.includes(body.source)) return NextResponse.json({ error: `Unknown source ${body.source}` }, { status: 400 })
  const results = await collectSources(db, {
    since: new Date(`${body.since}T00:00:00Z`),
    until: body.until ? new Date(`${body.until}T23:59:59Z`) : undefined,
    backfill: true,
    trigger: "backfill",
    sources: body.source ? [body.source] : undefined,
  })
  return NextResponse.json({ results })
}
