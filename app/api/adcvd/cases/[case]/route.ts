import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { checkCases } from "@/libs/adcvd/checks"
import { refreshItaPages } from "@/libs/adcvd/ita"
import { findScope } from "@/libs/adcvd/scope"
import type { CaseRow } from "@/libs/adcvd/types"
import { budgetTracker, monthOf } from "@/libs/adcvd/usage"

export const dynamic = "force-dynamic"
// Supabase reads go through fetch: never from Next's data cache (the lookups set their own HTTP caching)
export const fetchCache = "force-no-store"
export const maxDuration = 120

// One case on /adcvd: GET it with its events; POST { action: "rescope" } reads its scope again from the
// Federal Register and ITA's case page (charged to this month's budget)
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
  // A fresh read: forget the Federal Register codes, so the chain starts from the case's own
  // notices, and read ITA's case page again (both merged by the checks)
  const blank: CaseRow = { ...(data as CaseRow), fr_main: [], fr_also: [], fr_excluded: [], scope_method: null }
  const budget = await budgetTracker(db, monthOf(new Date()))
  const method = await findScope(db, blank, budget)
  await refreshItaPages(db, { deadline: Date.now() + 60_000, budget, caseNumbers: [params.case] })
  await checkCases(db, [params.case])
  return NextResponse.json({ method })
}
