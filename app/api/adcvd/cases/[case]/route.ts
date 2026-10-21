import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { checkCases } from "@/libs/adcvd/checks"
import { findScope } from "@/libs/adcvd/scope"
import type { CaseRow } from "@/libs/adcvd/types"
import { budgetTracker, monthOf } from "@/libs/adcvd/usage"

export const dynamic = "force-dynamic"
// Supabase reads go through fetch: never from Next's data cache (the lookups set their own HTTP caching)
export const fetchCache = "force-no-store"
export const maxDuration = 120

// One case on /adcvd: GET it with its events; POST { action: "rescope" } reads its scope again from the
// Federal Register (charged to this month's budget)
export async function GET(_req: NextRequest, props: { params: Promise<{ case: string }> }) {
  const params = await props.params;
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const [{ data: found }, { data, error }] = await Promise.all([
    db.from("adcvd_cases").select("*").eq("case_number", params.case).maybeSingle(),
    db.from("adcvd_events").select("*").eq("case_number", params.case).order("published_on", { ascending: false }),
  ])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ case: found, events: data })
}

export async function POST(req: NextRequest, props: { params: Promise<{ case: string }> }) {
  const params = await props.params;
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { action } = (await req.json().catch(() => ({}))) as { action?: string }
  if (action !== "rescope") return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  const { data, error } = await db.from("adcvd_cases").select("*").eq("case_number", params.case).single()
  if (error || !data) return NextResponse.json({ error: "Case not found" }, { status: 404 })
  // A fresh read: forget the codes, so the chain starts from the case's own notices
  const blank: CaseRow = { ...(data as CaseRow), hts_main: [], hts_also: [], hts_excluded: [], scope_method: null }
  const method = await findScope(db, blank, await budgetTracker(db, monthOf(new Date())))
  await checkCases(db, [params.case])
  return NextResponse.json({ method })
}
