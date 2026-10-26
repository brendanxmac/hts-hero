import { AsyncLocalStorage } from "node:async_hooks"
import type { SupabaseClient } from "@supabase/supabase-js"
import { mapLimit } from "../tariff-sources/text"
import { frText } from "./parse"

// The Federal Register's API (no key) for AD/CVD: every notice about a case, by case number. A
// case's notices go back to 1994. A notice's full text comes from GovInfo (the Government
// Publishing Office's identical copy): the Federal Register's own text pages are its website,
// which asks automated clients for a browser check, and the API is what it asks them to use.

const API = "https://www.federalregister.gov/api/v1"
const USER_AGENT = "Mozilla/5.0 (compatible; HTSHeroTariffUpdates/1.0; +https://htshero.com/tariff-updates)"

// The Federal Register throttles (429) and then blocks (403) clients that ask too fast. Every
// request here goes through one queue: at most one at a time, about one a second. A 429 or 5xx
// waits and tries again (30s, 60s, 120s, 240s) before giving up; a 403 or a browser check is
// tried once more after 30s, then counted as a block.
const MIN_GAP_MS = 1_000
const BACKOFF_MS = [30_000, 60_000, 120_000, 240_000]
let queue: Promise<unknown> = Promise.resolve()
let last = 0

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class FederalRegisterUnavailable extends Error {}
// A run's deadline came before the Federal Register answered: stop, and leave the work for the next run
export class FederalRegisterOutOfTime extends FederalRegisterUnavailable {}

// The deadline of the run these requests belong to (runMonth, runNew). Without it, a throttled
// request's backoff (up to ~10 minutes) outlasts the function and Vercel kills the run.
const runDeadline = new AsyncLocalStorage<number>()

// ---------- Blocks ----------

// Once the Federal Register blocks us, its API or its website, nothing more is asked of that part
// for an hour. Saved in adcvd_settings.fr_blocked, so the next run (a new function) knows too.
type Kind = "api" | "site" | "govinfo"
type Blocked = Partial<Record<Exclude<Kind, "govinfo">, string>>
const BLOCK_MS = 60 * 60_000
const blocked: Blocked = {}
let blockedChanged = false

const kindOf = (url: string): Kind => (url.startsWith(API) ? "api" : new URL(url).hostname.endsWith("govinfo.gov") ? "govinfo" : "site")
const blockedUntil = (kind: Kind) => (kind === "govinfo" ? null : blocked[kind] && Date.now() < Date.parse(blocked[kind]) ? blocked[kind] : null)
const markBlocked = (kind: Kind, why: string, url: string) => {
  if (kind === "govinfo") return
  blocked[kind] = new Date(Date.now() + BLOCK_MS).toISOString()
  blockedChanged = true
  console.warn(`[federal-register] ${kind} blocked until ${blocked[kind]}: ${why} for ${url}`)
}

// Runs fn with the run's deadline on every request, and the blocks loaded before and saved after
export const withFederalRegister = async <T>(db: SupabaseClient, deadline: number, fn: () => Promise<T>): Promise<T> => {
  const { data, error } = await db.from("adcvd_settings").select("fr_blocked").eq("id", true).maybeSingle()
  if (error) console.warn(`[federal-register] Loading blocks: ${error.message}`)
  else {
    // The later of the saved block and one this function already found (a run inside a run)
    const saved = (data?.fr_blocked as Blocked | null) ?? {}
    for (const kind of ["api", "site"] as const) {
      if (saved[kind] && (!blocked[kind] || saved[kind] > blocked[kind])) blocked[kind] = saved[kind]
    }
  }
  try {
    return await runDeadline.run(Math.min(deadline, runDeadline.getStore() ?? Infinity), fn)
  } finally {
    if (blockedChanged) {
      blockedChanged = false
      const { error: saveError } = await db.from("adcvd_settings").update({ fr_blocked: blocked }).eq("id", true)
      if (saveError) console.warn(`[federal-register] Saving blocks: ${saveError.message}`)
    }
  }
}

const CHALLENGE = /Request Access|unblock_controller/

const frFetch = (url: string): Promise<string | null> => {
  const run = async (): Promise<string | null> => {
    const kind = kindOf(url)
    const until = blockedUntil(kind)
    if (until) throw new FederalRegisterUnavailable(`Skipped: the Federal Register (${kind}) blocked us until ${until}, for ${url}`)
    const deadline = runDeadline.getStore() ?? Infinity
    const outOfTime = () => new FederalRegisterOutOfTime(`Out of time waiting on the Federal Register for ${url}`)
    for (let attempt = 0; ; attempt++) {
      const gap = last + MIN_GAP_MS - Date.now()
      if (gap > 0) await wait(gap)
      if (Date.now() + 1_000 > deadline) throw outOfTime()
      last = Date.now()
      const timeout = Math.min(30_000, deadline - Date.now())
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, cache: "no-store", signal: AbortSignal.timeout(timeout) }).catch((): Response | null => null)
      if (response?.status === 404) return null
      // A challenge page ("Request Access") comes back as 200: as good as blocked
      const body = response?.ok ? await response.text() : null
      if (body !== null && !CHALLENGE.test(body.slice(0, 3000))) return body
      const answer = body !== null ? "a browser check" : response ? `${response.status}` : "nothing (timed out or unreachable)"
      console.warn(`[federal-register] ${kind} answered ${answer} (try ${attempt + 1}) for ${url}`)
      const gated = body !== null || response?.status === 403
      if (gated && attempt >= 1) {
        markBlocked(kind, answer, url)
        throw new FederalRegisterUnavailable(`The Federal Register answered ${answer} for ${url}`)
      }
      const retryable = !response || gated || response.status === 429 || response.status >= 500
      if (!retryable || attempt >= BACKOFF_MS.length) {
        throw new FederalRegisterUnavailable(`The Federal Register answered ${answer} for ${url}`)
      }
      if (Date.now() + BACKOFF_MS[attempt] > deadline) throw outOfTime()
      await wait(BACKOFF_MS[attempt])
    }
  }
  const result = queue.then(run, run)
  queue = result.catch((): undefined => undefined)
  return result
}

export interface CaseDocument {
  document_number: string
  title: string
  publication_date: string
  raw_text_url: string | null
  html_url: string
  docket_ids: string[]
}

// Every notice whose docket is this case, newest first
export const caseDocuments = async (caseNumber: string): Promise<CaseDocument[]> => {
  const params = new URLSearchParams([
    ["conditions[docket_id]", caseNumber],
    ["per_page", "200"],
    ["order", "newest"],
  ])
  for (const field of ["document_number", "title", "publication_date", "raw_text_url", "html_url", "docket_ids"]) params.append("fields[]", field)
  const text = await frFetch(`${API}/documents.json?${params}`)
  return text ? ((JSON.parse(text) as { results?: CaseDocument[] }).results ?? []) : []
}

// The same notice at GovInfo (the Government Publishing Office's copy of the Federal Register),
// from the Federal Register's text address: .../full_text/text/2026/10/08/2026-20690.txt
export const govInfoUrl = (rawTextUrl: string) => {
  const m = rawTextUrl.match(/\/(\d{4})\/(\d{2})\/(\d{2})\/([\w-]+)\.txt$/)
  return m ? `https://www.govinfo.gov/content/pkg/FR-${m[1]}-${m[2]}-${m[3]}/html/${m[4]}.htm` : null
}

// One notice's text address and date, by document number
export const documentMeta = async (documentNumber: string) => {
  const text = await frFetch(`${API}/documents/${encodeURIComponent(documentNumber)}.json?fields[]=raw_text_url&fields[]=publication_date&fields[]=title`)
  return text ? (JSON.parse(text) as { raw_text_url: string | null; publication_date: string; title: string }) : null
}

// A notice's text (frText), or null when there is none. From GovInfo, or the Federal Register's
// own text page when GovInfo has no copy (or couldn't be reached).
export const noticeText = async (rawTextUrl: string | null | undefined) => {
  if (!rawTextUrl) return null
  const copy = govInfoUrl(rawTextUrl)
  if (copy) {
    const raw = await frFetch(copy).catch((e: unknown) => {
      if (e instanceof FederalRegisterOutOfTime) throw e
      return null
    })
    if (raw !== null) return frText(raw)
  }
  const raw = await frFetch(rawTextUrl)
  return raw === null ? null : frText(raw)
}

export const noticeTexts = (urls: (string | null | undefined)[]) => mapLimit(urls, 4, (url) => noticeText(url).catch((): string | null => null))
