import { NextRequest, NextResponse } from "next/server"
import { matchCases, matchPetition, evidenceSentence, nextDates, strongest, HISTORY_DAYS, type AdcvdFlag, type AdcvdLookup, type AdcvdSummary, type FlagCase, type FlagCompany, type FlagEvent, type MatchableCase } from "@/libs/adcvd/match"
import { EVENTS, LIVE_STATUSES, MILESTONE_EVENTS, type CaseRow, type EventRow } from "@/libs/adcvd/types"
import { createAdminClient, createClient } from "../../supabase/server"

export const dynamic = "force-dynamic"
// Supabase reads go through fetch: never from Next's data cache (the lookups set their own HTTP caching)
export const fetchCache = "force-no-store"

// The AD/CVD cases that may cover one import: GET ?code=3203008000&country=IN. The cases are free
// with any account, on every plan (PRICING.md); signed out it's a 401. With &summary=1, anyone gets
// only whether any may (AdcvdSummary), cached for an hour.

// Who may see the cases: the service role (scripts, local previews), or any account
const viewer = async (req: NextRequest): Promise<"full" | "signed-out"> => {
  const token = req.headers.get("authorization")?.split(" ")[1]
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && token === process.env.SUPABASE_SERVICE_ROLE_KEY) return "full"
  const {
    data: { user },
  } = await createClient().auth.getUser()
  return user ? "full" : "signed-out"
}

const MATCH_COLUMNS = "case_number, kind, country, product, status, ended_on, third_countries, hts_main, hts_also, hts_excluded, hts_outdated, hts_successors"

const words = (product: string | null) => (product ?? "").toLowerCase().replace(/^certain\s+/, "").replace(/[^a-z0-9]+/g, " ").trim()

export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") ?? "").replace(/\D/g, "")
  const country = (req.nextUrl.searchParams.get("country") ?? "").toUpperCase()
  if (code.length < 6 || !/^[A-Z]{2}$/.test(country)) return NextResponse.json({ error: "code (6-10 digits) and country (2 letters) are required" }, { status: 400 })
  const summaryOnly = req.nextUrl.searchParams.get("summary") === "1"
  const db = createAdminClient()
  const today = new Date()
  // Who's asking, read alongside the first query (it's three reads of its own)
  const [who, { data: candidates, error }] = await Promise.all([
    summaryOnly ? Promise.resolve(null) : viewer(req),
    db.from("adcvd_cases").select(MATCH_COLUMNS).or(`country.eq.${country},third_countries.cs.{${country}}`),
  ])
  if (who === "signed-out") return NextResponse.json({ error: "Sign in to see AD/CVD cases" }, { status: 401 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const matches = matchCases((candidates ?? []) as MatchableCase[], { code, country }, today)

  const flags: AdcvdFlag[] = []
  if (matches.length) {
    const numbers = matches.map((m) => m.case_number)
    const [{ data: caseRows }, { data: eventRows }, { data: companyRows }] = await Promise.all([
      db.from("adcvd_cases").select("*").in("case_number", numbers),
      db.from("adcvd_events").select("*").in("case_number", numbers).order("published_on", { ascending: false }),
      db.from("adcvd_company_rates").select("case_number, company, rate, basis, excluded, as_of").in("case_number", numbers).order("company").limit(3000),
    ])
    const companies = new Map<string, FlagCompany[]>()
    for (const r of (companyRows ?? []) as (FlagCompany & { case_number: string })[]) {
      const { case_number, ...rest } = r
      companies.set(case_number, [...(companies.get(case_number) ?? []), { ...rest, rate: rest.rate === null ? null : Number(rest.rate) }])
    }
    const cases = new Map(((caseRows ?? []) as CaseRow[]).map((c) => [c.case_number, c]))
    const events = (eventRows ?? []) as EventRow[]
    // One flag per product and country: an AD case and its CVD twin read as one
    const groups = new Map<string, typeof matches>()
    for (const m of matches) {
      const c = cases.get(m.case_number)
      if (!c) continue
      const key = `${words(c.product)}|${c.country}|${m.reasons.includes("third_country")}`
      groups.set(key, [...(groups.get(key) ?? []), m])
    }
    const recent = new Date(today.getTime() - HISTORY_DAYS * 86_400_000).toISOString().slice(0, 10)
    for (const group of Array.from(groups.values())) {
      const level = strongest(group.map((m) => m.level))!
      const lead = group.find((m) => m.level === level)!
      const leadCase = cases.get(lead.case_number)!
      const own = group.map((m) => cases.get(m.case_number)!).sort((a, b) => a.kind.localeCompare(b.kind))
      const live = own.some((c) => LIVE_STATUSES.includes(c.status))
      const seen = new Set<string>()
      const flagEvents: FlagEvent[] = events
        .filter((e) => own.some((c) => c.case_number === e.case_number))
        .filter((e) => e.published_on >= recent || (live && MILESTONE_EVENTS.includes(e.event)))
        .filter((e) => (seen.has(e.document_number) ? false : (seen.add(e.document_number), true)))
        .slice(0, 24)
        .map((e) => ({
          date: e.published_on,
          event: e.event,
          label: EVENTS[e.event] ?? e.event,
          summary: e.summary ?? e.title,
          url: e.url,
          document_number: e.document_number,
          milestone: MILESTONE_EVENTS.includes(e.event),
        }))
      const quote = leadCase.scope_text && lead.code ? evidenceSentence(leadCase.scope_text, lead.code) : null
      const ad = own.find((c) => c.kind === "AD") ?? own[0]
      flags.push({
        level,
        product: leadCase.product ?? "This product",
        country: leadCase.country,
        via_circumvention: lead.reasons.includes("third_country"),
        cases: own.map(
          (c): FlagCase => ({
            case_number: c.case_number,
            kind: c.kind,
            status: c.status,
            initiated_on: c.initiated_on,
            order_on: c.order_on,
            last_continued_on: c.last_continued_on,
            ended_on: c.ended_on,
            rates: c.rates,
            companies: companies.get(c.case_number) ?? [],
          })
        ),
        reasons: lead.reasons,
        code: lead.code,
        evidence: quote && leadCase.scope_doc ? { quote, document_number: leadCase.scope_doc, published_on: leadCase.scope_published_on } : null,
        events: flagEvents,
        scope_codes: {
          main: leadCase.hts_main.filter((s) => !leadCase.hts_outdated.includes(s)),
          also: leadCase.hts_also.filter((s) => !leadCase.hts_outdated.includes(s)),
        },
        next: nextDates(ad, today),
      })
    }
    flags.sort((a, b) => ["likely", "possible", "history"].indexOf(a.level) - ["likely", "possible", "history"].indexOf(b.level))
  }

  // New petitions: ITC notices no case carries yet
  const since = new Date(today.getTime() - 400 * 86_400_000).toISOString().slice(0, 10)
  const { data: unlinked } = await db.from("adcvd_events").select("*").is("case_number", null).contains("countries", [country]).gte("published_on", since)
  const petitions: FlagEvent[] = ((unlinked ?? []) as EventRow[])
    .filter((e) => matchPetition(e, { code, country }))
    .map((e) => ({ date: e.published_on, event: e.event, label: EVENTS[e.event] ?? e.event, summary: e.summary ?? e.title, url: e.url, document_number: e.document_number, milestone: true }))

  const body: AdcvdLookup = { code, country, checked_at: today.toISOString(), flags, petitions }
  const live = flags.filter((f) => f.level !== "history")
  const summary: AdcvdSummary = { code, country, checked_at: body.checked_at, cases: live.flatMap((f) => f.cases).length, likely: live.some((f) => f.level === "likely"), petitions: petitions.length }
  if (summaryOnly) return NextResponse.json(summary, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } })
  // Per user, so never from a shared cache
  return NextResponse.json(body, { headers: { "Cache-Control": "private, max-age=3600" } })
}
