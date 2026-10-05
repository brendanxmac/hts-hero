"use client"

export const coverageApi = async <T = any,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/hts-coverage${path}`, {
    cache: "no-store",
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...init?.headers } : init?.headers,
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`)
  return body as T
}
