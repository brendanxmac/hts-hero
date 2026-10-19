import { mapLimit } from "../tariff-sources/text"
import { frText } from "./parse"

// The Federal Register's API (no key) for AD/CVD: every notice about a case, by case number, and
// a notice's full text. A case's notices go back to 1994.

const API = "https://www.federalregister.gov/api/v1"
const USER_AGENT = "Mozilla/5.0 (compatible; HTSHeroTariffUpdates/1.0; +https://htshero.com/tariff-updates)"

// The Federal Register throttles (429) and then blocks (403) clients that ask too fast. Every
// request here goes through one queue: at most one at a time, about one a second, and a 429, 403
// or 5xx waits and tries again (30s, 60s, 120s, 240s) before giving up.
const MIN_GAP_MS = 1_000
const BACKOFF_MS = [30_000, 60_000, 120_000, 240_000]
let queue: Promise<unknown> = Promise.resolve()
let last = 0

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class FederalRegisterUnavailable extends Error {}

const CHALLENGE = /Request Access|unblock_controller/

const frFetch = (url: string): Promise<string | null> => {
  const run = async (): Promise<string | null> => {
    for (let attempt = 0; ; attempt++) {
      const gap = last + MIN_GAP_MS - Date.now()
      if (gap > 0) await wait(gap)
      last = Date.now()
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, cache: "no-store", signal: AbortSignal.timeout(30_000) }).catch((): Response | null => null)
      if (response?.status === 404) return null
      // A challenge page ("Request Access") comes back as 200: as good as blocked
      const body = response?.ok ? await response.text() : null
      if (body !== null && !CHALLENGE.test(body.slice(0, 3000))) return body
      if (body !== null && attempt >= 1) throw new FederalRegisterUnavailable(`The Federal Register asked for a browser check for ${url}`)
      const retryable = !response || body !== null || response.status === 429 || response.status === 403 || response.status >= 500
      if (!retryable || attempt >= BACKOFF_MS.length) {
        throw new FederalRegisterUnavailable(`The Federal Register answered ${response?.status ?? "nothing"} for ${url}`)
      }
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

// A notice's text (frText), or null when there is none. From the Federal Register, or GovInfo's
// identical copy when the Federal Register won't serve it.
// Once the Federal Register gates its text pages, go straight to GovInfo for a while
const GATED_MS = 15 * 60_000
let gatedUntil = 0

export const noticeText = async (rawTextUrl: string | null | undefined) => {
  if (!rawTextUrl) return null
  const copy = govInfoUrl(rawTextUrl)
  if (copy && Date.now() < gatedUntil) {
    const raw = await frFetch(copy)
    return raw === null ? null : frText(raw)
  }
  try {
    const raw = await frFetch(rawTextUrl)
    return raw === null ? null : frText(raw)
  } catch (e) {
    if (!(e instanceof FederalRegisterUnavailable) || !copy) throw e
    gatedUntil = Date.now() + GATED_MS
    const raw = await frFetch(copy)
    return raw === null ? null : frText(raw)
  }
}

export const noticeTexts = (urls: (string | null | undefined)[]) => mapLimit(urls, 4, (url) => noticeText(url).catch((): string | null => null))
