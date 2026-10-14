import { NextResponse } from "next/server"
import { requireRevisionTool } from "@/libs/hts-revision-diff/access"
import { collectSources } from "@/libs/tariff-sources/collect"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// "Collect now" in /tariff-sources: the cron's collection, run on demand by the admin
export async function POST() {
  const { db, denied } = await requireRevisionTool()
  if (denied) return denied
  const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  const results = await collectSources(db, { since, trigger: "manual" })
  return NextResponse.json({ results })
}
