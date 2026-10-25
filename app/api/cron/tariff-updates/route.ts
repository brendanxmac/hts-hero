import { NextRequest, NextResponse } from "next/server"
import { getHtsElementsServer } from "@/libs/hts-server"
import { refreshImpacts } from "@/libs/tariff-updates/impacts"
import { processTariffUpdates } from "@/libs/tariff-updates/process"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"
import { processScopes } from "@/libs/tariff-updates/scope"
import { createAdminClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Every hour (vercel.json), after the sources are collected: sort new items, read tariff
// actions and group them into updates; then read the full scope of up to two actions from their
// PDFs (libs/tariff-updates/scope.ts) and work out which users' imports they affect. Stops
// starting new work 40 seconds before the limit; whatever is left is picked up by the next run.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const db = createAdminClient()
  const end = Date.now() + (maxDuration - 40) * 1000
  const result = await processTariffUpdates(db, { deadline: end - 90_000 })
  const scopes = await processScopes(db, { deadline: end - 30_000, limit: 2 })
  const impacts = scopes.read.length ? await refreshImpacts(db, await getHtsElementsServer(), { deadline: end, updateIds: scopes.read }) : null
  if (result.grouped || scopes.read.length) revalidateTariffUpdates()
  return NextResponse.json({ ...result, scopes, impacts })
}
