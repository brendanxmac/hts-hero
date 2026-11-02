import { NextRequest, NextResponse } from "next/server"
import { caseNumberOf, type CaseSearchRow } from "@/libs/adcvd/format"
import { createAdminClient, createClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
// Supabase reads go through fetch: never from Next's data cache
export const fetchCache = "force-no-store"

// AD/CVD cases by case number or product, for the entry audit's "add a case": GET ?q=A-570-137 or
// ?q=steel nails. Any signed-in account (AD/CVD checks are free with one); a 401 signed out.
// Live cases first, then the most recent.

const COLUMNS = "case_number, kind, country, product, status, rates, order_on, initiated_on, ended_on"
const LIMIT = 12

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100)
  if (q.length < 3) return NextResponse.json({ error: "Search for at least 3 characters" }, { status: 400 })
  const {
    data: { user },
  } = await createClient().auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to search AD/CVD cases" }, { status: 401 })

  const db = createAdminClient()
  const number = caseNumberOf(q)
  const words = q.replace(/[%_,()]/g, " ").split(/\s+/).filter((w) => w.length > 1)
  let query = db.from("adcvd_cases").select(COLUMNS)
  if (number) query = query.eq("case_number", number)
  else for (const w of words) query = query.ilike("product", `%${w}%`)
  const { data, error } = await query.limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const ended = (c: CaseSearchRow) => c.status === "revoked" || c.status === "terminated"
  const cases = ((data ?? []) as CaseSearchRow[])
    .sort((a, b) => Number(ended(a)) - Number(ended(b)) || (b.order_on ?? b.initiated_on ?? "").localeCompare(a.order_on ?? a.initiated_on ?? ""))
    .slice(0, LIMIT)
  return NextResponse.json({ query: q, caseNumber: number, cases })
}
