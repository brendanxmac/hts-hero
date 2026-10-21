import type { SupabaseClient } from "@supabase/supabase-js"
import { linkItcNotice, summarizeNotice } from "./claude"
import { saveCompanyRates } from "./companies"
import { noticeText } from "./fr"
import { monthRange } from "./notices"
import { EVENTS, LIVE_STATUSES, ratesSet, type CaseRow, type EventRow, type Rates } from "./types"
import type { Budget } from "./usage"

type Db = SupabaseClient

// ---------- Summaries ----------

// One Haiku call per notice: a plain sentence for every case it names, and the rates it sets.
// List notices already have fixed sentences (notices.ts).
export const summarizeMonth = async (db: Db, month: string, { deadline, budget }: { deadline: number; budget: Budget }) => {
  const { start, end } = monthRange(month)
  const { data, error } = await db
    .from("adcvd_events")
    .select("document_number, case_number, event, title, item_id, published_on")
    .is("summarized_at", null)
    .gte("published_on", start.toISOString().slice(0, 10))
    .lte("published_on", end.toISOString().slice(0, 10))
    .limit(2000)
  if (error) throw new Error(`Loading events: ${error.message}`)
  const byDoc = new Map<string, { title: string; event: string; item_id: string | null; published_on: string; cases: string[] }>()
  for (const e of (data ?? []) as Pick<EventRow, "document_number" | "case_number" | "event" | "title" | "item_id" | "published_on">[]) {
    const doc = byDoc.get(e.document_number) ?? { title: e.title, event: EVENTS[e.event], item_id: e.item_id, published_on: e.published_on, cases: [] }
    if (e.case_number) doc.cases.push(e.case_number)
    byDoc.set(e.document_number, doc)
  }
  let summarized = 0
  const errors: string[] = []
  for (const [documentNumber, doc] of Array.from(byDoc)) {
    if (Date.now() > deadline || budget.reached) return { summarized, errors, remaining: true }
    try {
      const { data: item } = doc.item_id
        ? await db.from("tariff_source_items").select("raw").eq("id", doc.item_id).maybeSingle()
        : { data: null }
      const text = await noticeText((item?.raw as { raw_text_url?: string } | undefined)?.raw_text_url)
      const result = await summarizeNotice({ title: doc.title, event: doc.event, cases: doc.cases, text: text ?? doc.title })
      await budget.record(result.usage, "summary", documentNumber)
      if (doc.cases.length) await saveCompanyRates(db, { documentNumber, publishedOn: doc.published_on, title: doc.title, cases: doc.cases, companies: result.companies ?? [] })
      const ratesFor = (caseNumber: string | null): Rates | null => {
        const r = result.rates.find((x) => x.case_number === caseNumber) ?? (result.rates.length === 1 && doc.cases.length <= 1 ? result.rates[0] : null)
        if (!r || !ratesSet(r)) return null
        return { low: r.low, high: r.high, all_others: r.all_others, basis: r.basis, as_of: doc.published_on, doc: documentNumber }
      }
      const now = new Date().toISOString()
      const cases = doc.cases.length ? doc.cases : [null]
      for (const caseNumber of cases) {
        const rates = ratesFor(caseNumber)
        let query = db.from("adcvd_events").update({ summary: result.summary, rates, summarized_at: now }).eq("document_number", documentNumber)
        query = caseNumber ? query.eq("case_number", caseNumber) : query.is("case_number", null)
        await query
        // The newest rates become the case's
        if (caseNumber && rates) {
          const { data: c } = await db.from("adcvd_cases").select("rates").eq("case_number", caseNumber).maybeSingle()
          const current = (c?.rates as Rates | null) ?? null
          if (!current || current.as_of <= rates.as_of) await db.from("adcvd_cases").update({ rates }).eq("case_number", caseNumber)
        }
      }
      summarized++
    } catch (e) {
      errors.push(`${documentNumber}: ${e instanceof Error ? e.message : String(e)}`)
      // Leave a plain line so the notice isn't asked about forever; the title says what it is
      await db.from("adcvd_events").update({ summarized_at: new Date().toISOString() }).eq("document_number", documentNumber)
    }
  }
  return { summarized, errors, remaining: false }
}

// ---------- Linking ITC notices ----------

const WORDS_DROPPED = new Set(["certain", "and", "of", "the", "parts", "thereof", "or", "for", "from", "with", "in", "not", "whether"])
const words = (product: string | null) =>
  new Set(
    (product ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .map((w) => w.replace(/(?:ies)$/, "y").replace(/(?<!s)s$/, ""))
      .filter((w) => w.length > 1 && !WORDS_DROPPED.has(w))
  )
const similarity = (a: string | null, b: string | null) => {
  const x = words(a)
  const y = words(b)
  if (!x.size || !y.size) return 0
  const shared = Array.from(x).filter((w) => y.has(w)).length
  return shared / Math.max(x.size, y.size)
}

// ITC notices whose investigation numbers no case carried when they were read: a new petition
// (Commerce's cases follow a few weeks later) or an investigation we hadn't linked. Matched by
// product and country; Sonnet decides when it isn't clear-cut.
export const linkItcEvents = async (db: Db, { deadline, budget, limit = 40 }: { deadline: number; budget: Budget; limit?: number }) => {
  const { data, error } = await db.from("adcvd_events").select("*").is("case_number", null).order("published_on", { ascending: false }).limit(limit)
  if (error) throw new Error(`Loading unlinked notices: ${error.message}`)
  let linked = 0
  for (const e of (data ?? []) as EventRow[]) {
    if (Date.now() > deadline) break
    if (!e.countries.length) continue
    const { data: rows } = await db.from("adcvd_cases").select("*").in("country", e.countries)
    const candidates = ((rows ?? []) as CaseRow[]).filter((c) => LIVE_STATUSES.includes(c.status) || c.status === "unknown" || (c.ended_on ?? "") >= e.published_on)
    const scored = candidates.map((c) => ({ c, score: similarity(e.product, c.product) })).filter((x) => x.score > 0)
    let chosen = scored.filter((x) => x.score >= 0.75).map((x) => x.c)
    const unclear = !chosen.length && scored.some((x) => x.score >= 0.34)
    if (unclear && !budget.reached) {
      const pool = scored.sort((a, b) => b.score - a.score).slice(0, 20).map((x) => x.c)
      const result = await linkItcNotice({
        title: e.title,
        countries: e.countries,
        candidates: pool.map((c) => ({ case_number: c.case_number, product: c.product, country: c.country, status: c.status })),
      })
      await budget.record(result.usage, "link", e.document_number)
      chosen = pool.filter((c) => result.caseNumbers.includes(c.case_number))
    }
    if (!chosen.length) continue
    const { id, ...fields } = e
    const { error: insertError } = await db.from("adcvd_events").insert(chosen.map((c) => ({ ...fields, case_number: c.case_number })))
    if (insertError) continue
    await db.from("adcvd_events").delete().eq("id", id!)
    for (const c of chosen) {
      await db
        .from("adcvd_cases")
        .update({ itc_numbers: Array.from(new Set([...c.itc_numbers, ...e.itc_numbers])), updated_at: new Date().toISOString() })
        .eq("case_number", c.case_number)
    }
    linked++
  }
  return { linked }
}
