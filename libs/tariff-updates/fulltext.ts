import { fetchText, htmlToText } from "../tariff-sources/text"
import type { SourceId } from "../tariff-sources/types"

// The full text of a source item, for Claude to read: the Federal Register's plain-text copy, the
// public inspection PDF, or the page's article. Annexes can run to thousands of HTS lines, so text
// past MAX_TEXT_CHARS is cut and the extraction is marked truncated (and sent for review).

export const MAX_TEXT_CHARS = 400_000

interface ItemForText {
  source: SourceId
  url: string
  title: string
  summary: string | null
  raw: Record<string, unknown>
}

// The page's <article>, else its <main>, else the whole page
const pageText = (html: string) => {
  const region = html.match(/<article\b[\s\S]*<\/article>/i)?.[0] ?? html.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? html
  return htmlToText(region)
}

const pdfText = async (url: string) => {
  const { extractText, getDocumentProxy } = await import("unpdf")
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) })
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  const pdf = await getDocumentProxy(new Uint8Array(await response.arrayBuffer()))
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}

const rawText = async (item: ItemForText): Promise<string> => {
  if (item.source === "federal_register" && typeof item.raw.raw_text_url === "string") {
    return (await fetchText(item.raw.raw_text_url)) ?? ""
  }
  if (item.source === "federal_register_pi" && typeof item.raw.pdf_url === "string") {
    return pdfText(item.raw.pdf_url)
  }
  const html = await fetchText(item.url)
  return html ? pageText(html) : ""
}

export const fullTextOf = async (item: ItemForText) => {
  const text = (await rawText(item)).trim() || [item.title, item.summary].filter(Boolean).join("\n\n")
  return text.length > MAX_TEXT_CHARS
    ? { text: text.slice(0, MAX_TEXT_CHARS), truncated: true }
    : { text, truncated: false }
}
