import type { SupabaseClient } from "@supabase/supabase-js"
import { callJson } from "../hts-revision-diff/claude"
import type { ClaudeUsage } from "../hts-revision-diff/types"
import { fetchText } from "../tariff-sources/text"
import { MODELS } from "./claude"
import { logUsage } from "../adcvd/usage"

// The scope reader: exactly what a tariff action covers, read from its PDFs. Each source's text
// misses annex tables that are images and stops at 200 codes, so this collects the update's PDFs
// (White House annexes, the public inspection copy, the Federal Register document) and has Claude
// read them whole, images included, for every covered code, every exclusion, the countries and
// the Chapter 99 headings. The result goes on the update (scope_* columns); an admin's correction
// is never overwritten. Matching uses it (match.ts).

type Db = SupabaseClient

// Kinds that change what someone pays: worth knowing exactly what they cover
const SCOPED_KINDS = ["new_tariff", "rate_change", "scope_change", "exclusion", "pause", "end"]

const MAX_DOCUMENTS = 8
const MAX_BYTES = 30_000_000

export interface ReadScope {
  covered_codes: string[]
  excluded_codes: string[]
  countries: string[]
  excluded_countries: string[]
  headings: string[]
  complete: boolean
  notes: string | null
}

const SYSTEM = `You read the official documents of a US tariff action (a proclamation or executive order with its annexes, a Federal Register notice, a CBP message) and list exactly what it covers, for matching it against importers' products. Read every page, including annex tables that are images.

- covered_codes: every HTS code, subheading or heading the action applies to, as written (e.g. "7326.90.86", "8703", "0406.90.99"). For a whole chapter write "Chapter 73". List all of them, however many, from every annex. Don't include Chapter 99 numbers here. When it applies to every product of the countries it names (apart from listed exceptions), write ["ALL"] and put the exceptions in excluded_codes.
- excluded_codes: codes the action explicitly carves out or removes from coverage.
- countries: ISO 3166 alpha-2 codes of the countries whose goods it applies to, or ["ALL"] when it applies to goods of every country.
- excluded_countries: countries explicitly exempted (alpha-2).
- headings: Chapter 99 headings it creates, changes or names as the ones to report (e.g. "9903.81.90").
- complete: false when the documents point to an annex or list that isn't among them, so the codes may be incomplete.
- notes: anything a reviewer should check (how products are defined without codes, conditions, phased dates), or null.`

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["covered_codes", "excluded_codes", "countries", "excluded_countries", "headings", "complete", "notes"],
  properties: {
    covered_codes: { type: "array", items: { type: "string" } },
    excluded_codes: { type: "array", items: { type: "string" } },
    countries: { type: "array", items: { type: "string" } },
    excluded_countries: { type: "array", items: { type: "string" } },
    headings: { type: "array", items: { type: "string" } },
    complete: { type: "boolean" },
    notes: { type: ["string", "null"] },
  },
}

interface ItemForDocuments {
  source: string
  url: string
  title: string
  raw: Record<string, unknown>
}

// The update's PDFs, White House annexes first (the full lists), then public inspection, then
// the Federal Register document
export const documentUrls = async (items: ItemForDocuments[]) => {
  const urls: { url: string; title: string }[] = []
  for (const item of items.filter((i) => i.source === "white_house")) {
    const html = await fetchText(item.url).catch((): null => null)
    for (const [, href] of Array.from((html ?? "").matchAll(/href="([^"]+\.pdf)"/gi))) {
      const url = new URL(href, item.url).toString()
      if (url.includes("/wp-content/uploads/")) urls.push({ url, title: decodeURIComponent(url.split("/").pop() ?? "Annex") })
    }
  }
  for (const source of ["federal_register_pi", "federal_register"]) {
    for (const item of items.filter((i) => i.source === source)) {
      const pdf = typeof item.raw.pdf_url === "string" ? item.raw.pdf_url : null
      if (pdf) urls.push({ url: pdf, title: `${source === "federal_register" ? "Federal Register" : "Public inspection"}: ${item.title}` })
    }
  }
  return Array.from(new Map(urls.map((u) => [u.url, u])).values()).slice(0, MAX_DOCUMENTS)
}

interface Pdf {
  base64: string
  title: string
  url: string
  bytes: number
}

const download = async (urls: { url: string; title: string }[]) => {
  const pdfs: Pdf[] = []
  let total = 0
  for (const u of urls) {
    try {
      const response = await fetch(u.url, { signal: AbortSignal.timeout(60_000), headers: { "User-Agent": "Mozilla/5.0 (compatible; HTSHeroTariffUpdates/1.0)" } })
      if (!response.ok) continue
      const bytes = Buffer.from(await response.arrayBuffer())
      // Only real PDFs (some links answer with an HTML page), within the request's size limit
      if (bytes.subarray(0, 5).toString() !== "%PDF-" || total + bytes.length > MAX_BYTES) continue
      total += bytes.length
      pdfs.push({ base64: bytes.toString("base64"), title: u.title, url: u.url, bytes: bytes.length })
    } catch {
      // A document that won't download is skipped; the rest are still read
    }
  }
  return pdfs
}

const clean = (codes: string[]) => Array.from(new Set(codes.map((c) => c.trim()).filter(Boolean)))
const isoList = (codes: string[]) => clean(codes.map((c) => c.toUpperCase())).filter((c) => c === "ALL" || /^[A-Z]{2}$/.test(c))

// Reads one update's scope and saves it, unless an admin has set it. Returns what happened.
export const readUpdateScope = async (db: Db, updateId: string, { force = false }: { force?: boolean } = {}) => {
  const { data: update, error } = await db.from("tariff_updates").select("id, title, scope_source").eq("id", updateId).single()
  if (error || !update) throw new Error(`Loading the update: ${error?.message ?? "not found"}`)
  if (update.scope_source === "admin" && !force) return { status: "kept" as const }
  const { data: items } = await db.from("tariff_source_items").select("source, url, title, raw").eq("update_id", updateId)
  const pdfs = await download(await documentUrls((items ?? []) as ItemForDocuments[]))
  if (!pdfs.length) {
    await db.from("tariff_updates").update({ scope_read_at: new Date().toISOString(), scope_notes: "No PDFs to read for this update." }).eq("id", updateId)
    return { status: "no_documents" as const }
  }
  // Too long for one request (some annexes run to thousands of pages): try again without the
  // biggest document, a few times
  let docs = pdfs
  let left: Pdf[] = []
  let answer: { data: ReadScope; usage: ClaudeUsage } | null = null
  for (let attempt = 0; attempt < 4 && docs.length; attempt++) {
    try {
      answer = await callJson<ReadScope>({
        system: SYSTEM,
        user: `The tariff action: ${update.title}\n\nThe documents above are its official sources. List exactly what it covers.`,
        pdfs: docs.map(({ base64, title }) => ({ base64, title })),
        schema: SCHEMA,
        maxTokens: 64000,
        effort: "medium",
        model: MODELS.read,
      })
      break
    } catch (e) {
      if (!/prompt is too long|too large|exceeds/i.test(e instanceof Error ? e.message : String(e)) || docs.length === 1) throw e
      const biggest = docs.reduce((a, b) => (b.bytes > a.bytes ? b : a))
      left = [...left, biggest]
      docs = docs.filter((d) => d !== biggest)
    }
  }
  if (!answer) throw new Error("The documents were too long to read")
  const { data, usage } = answer
  await logUsage(db, usage, { pipeline: "tariff_updates", step: "scope_read", ref: updateId })
  const notes = [
    data.complete ? null : "The documents point to a list that isn't among them: codes may be incomplete.",
    left.length ? `Too long to read with the rest, so left out: ${left.map((d) => d.title).join(", ")}.` : null,
    data.notes,
  ]
    .filter(Boolean)
    .join(" ")
  const { error: saveError } = await db
    .from("tariff_updates")
    .update({
      scope_codes: clean(data.covered_codes),
      scope_excluded_codes: clean(data.excluded_codes),
      scope_countries: isoList(data.countries),
      scope_excluded_countries: isoList(data.excluded_countries).filter((c) => c !== "ALL"),
      scope_headings: clean(data.headings),
      scope_source: "reader",
      scope_read_at: new Date().toISOString(),
      scope_notes: notes || null,
      scope_documents: docs.map((p) => p.url),
    })
    .eq("id", updateId)
  if (saveError) throw new Error(`Saving the scope: ${saveError.message}`)
  return { status: "read" as const, codes: data.covered_codes.length, documents: docs.length, usage }
}

// The updates whose scope is due: actions that change what someone pays, never read, or with
// sources added since the last read (and not set by an admin)
export const pendingScopes = async (db: Db, limit: number) => {
  const { data, error } = await db
    .from("tariff_updates")
    .select("id, last_activity_at, scope_read_at, scope_source")
    .eq("status", "published")
    .in("kind", SCOPED_KINDS)
    .or("scope_source.is.null,scope_source.eq.reader")
    .order("last_activity_at", { ascending: false })
    .limit(200)
  if (error) throw new Error(`Loading updates to scope: ${error.message}`)
  return (data ?? []).filter((u) => !u.scope_read_at || u.last_activity_at > u.scope_read_at).slice(0, limit)
}

// Reads the due scopes, newest first, until `deadline` or `limit`
export const processScopes = async (db: Db, { deadline, limit = 3 }: { deadline: number; limit?: number }) => {
  const due = await pendingScopes(db, limit)
  const read: string[] = []
  let cost = 0
  let failed = 0
  for (const u of due) {
    if (Date.now() > deadline) break
    try {
      const result = await readUpdateScope(db, u.id)
      if (result.status === "read") {
        read.push(u.id)
        cost += (result.usage as ClaudeUsage).cost_usd
      }
    } catch (e) {
      failed++
      const message = e instanceof Error ? e.message : String(e)
      console.error(`Reading the scope of ${u.id}:`, message)
      // Recorded, so it isn't tried again (and paid for) every run; a new source, or the review's
      // "Read scope", tries again
      await db.from("tariff_updates").update({ scope_read_at: new Date().toISOString(), scope_notes: `The reader failed: ${message.slice(0, 300)}` }).eq("id", u.id)
    }
  }
  return { read, cost, failed, remaining: Math.max(0, due.length - read.length - failed) }
}
