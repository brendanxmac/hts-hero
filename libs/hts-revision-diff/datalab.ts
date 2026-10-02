// datalab.to Convert API: submit a PDF, then poll until the markdown is ready.
// https://documentation.datalab.to/api-reference/convert-document

const CONVERT_URL = "https://www.datalab.to/api/v1/convert"

const apiKey = () => {
  const key = process.env.DATALAB_API_KEY
  if (!key) throw new Error("DATALAB_API_KEY is not set in .env.local")
  return key
}

export interface DatalabSubmission {
  requestId: string
  checkUrl: string
}

export const submitConversion = async (
  file: Blob,
  filename: string,
  options: { keepPageFooters?: boolean } = {}
): Promise<DatalabSubmission> => {
  const form = new FormData()
  form.append("file", file, filename)
  form.append("output_format", "markdown")
  form.append("mode", "accurate")
  // Page separators let the parser record which PDF page each note is on
  form.append("paginate", "true")
  form.append("disable_image_extraction", "true")
  // datalab tags short lines near the bottom of a page as page footers and
  // drops them. Chapter 99 has no real footers, so all that loses is body
  // text, like a note's "50." and "(a)" alone at the bottom of a page.
  if (options.keepPageFooters) {
    form.append("additional_config", JSON.stringify({ keep_pagefooter_in_output: true }))
  }

  const response = await fetch(CONVERT_URL, {
    method: "POST",
    headers: { "X-API-Key": apiKey() },
    body: form,
  })
  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.request_check_url) {
    const detail = body?.error ?? body?.detail ?? response.statusText
    throw new Error(`datalab rejected ${filename} (${response.status}): ${JSON.stringify(detail)}`)
  }
  return { requestId: body.request_id, checkUrl: body.request_check_url }
}

export type DatalabPoll =
  | { state: "processing" }
  | { state: "complete"; markdown: string; pageCount: number | null }
  | { state: "failed"; error: string }

export const pollConversion = async (checkUrl: string): Promise<DatalabPoll> => {
  const response = await fetch(checkUrl, { headers: { "X-API-Key": apiKey() } })
  if (response.status === 404) {
    return { state: "failed", error: "datalab no longer has this result (404). Convert again." }
  }
  const body = await response.json().catch(() => null)
  if (!response.ok || !body) {
    // Transient: try again on the next poll
    return { state: "processing" }
  }
  if (body.status !== "complete") return { state: "processing" }
  if (body.success === false) {
    return { state: "failed", error: body.error ?? "datalab reported a failed conversion" }
  }

  let markdown: string | null = body.markdown ?? null
  // Large results come back as a link to the full result JSON
  if (!markdown && body.result_url) {
    const full = await fetch(body.result_url).then((r) => r.json())
    markdown = full?.markdown ?? null
  }
  if (!markdown) return { state: "failed", error: "datalab finished but returned no markdown" }
  return { state: "complete", markdown, pageCount: body.page_count ?? null }
}
