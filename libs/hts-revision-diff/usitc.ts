// USITC HTS REST API. Only the current revision's data can be exported as
// JSON; older revisions are available as PDFs only.

const BASE = "https://hts.usitc.gov/reststop"

export const getCurrentReleaseName = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${BASE}/currentRelease`, { cache: "no-store" })
    if (!response.ok) return null
    const body = await response.json()
    return typeof body?.name === "string" ? body.name : null
  } catch {
    return null
  }
}

// All of chapter 99, in the same format as the website's JSON export
export const fetchCh99Export = async (): Promise<unknown[]> => {
  const response = await fetch(`${BASE}/exportList?from=9901&to=9999&format=JSON&styles=false`, {
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`USITC export failed (${response.status})`)
  const body = await response.json()
  if (!Array.isArray(body)) throw new Error("USITC export didn't return a list of rows")
  return body
}
