"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/contexts/UserContext"
import type { AdcvdLookup, AdcvdSummary } from "@/libs/adcvd/match"

// The AD/CVD cases that may cover one import (/api/adcvd/match), fetched once per code and
// country. The cases take the Tariff Tracker's trial or a paid plan ("locked" on the free plan);
// anyone gets the summary (whether any may, not which). A failed lookup is "error", never an empty
// answer: "none found" is only said when we checked.
type Kind = "full" | "summary"
// Bumped when the lookup's shape changes, so a browser's cached copy (an hour) isn't used
const SHAPE = 2
const cache = new Map<string, Promise<unknown>>()
const LOCKED = "locked" as const

const lookup = <T,>(kind: Kind, code: string, country: string): Promise<T> => {
  const key = `${kind}-${code}-${country}`
  if (!cache.has(key)) {
    const p = fetch(`/api/adcvd/match?code=${encodeURIComponent(code)}&country=${encodeURIComponent(country)}${kind === "summary" ? "&summary=1" : ""}&v=${SHAPE}`).then((r) => {
      // The free plan: the cases take a plan
      if (r.status === 402) return LOCKED as T
      if (!r.ok) throw new Error(`AD/CVD lookup failed (${r.status})`)
      return r.json() as Promise<T>
    })
    // Asked again next time
    p.catch(() => cache.delete(key))
    cache.set(key, p)
  }
  return cache.get(key) as Promise<T>
}

export type AdcvdState<T> = T | "loading" | "error" | "locked" | null

const useLookup = <T,>(kind: Kind, code: string | null | undefined, country: string | null | undefined, enabled: boolean): AdcvdState<T> => {
  const digits = (code ?? "").replace(/\D/g, "")
  const ready = enabled && digits.length >= 6 && Boolean(country)
  const [state, setState] = useState<AdcvdState<T>>(ready ? "loading" : null)
  useEffect(() => {
    if (!ready) return setState(null)
    setState("loading")
    let live = true
    lookup<T>(kind, digits, country!)
      .then((d) => live && setState(d))
      .catch(() => live && setState("error"))
    return () => {
      live = false
    }
  }, [kind, digits, country, ready])
  return state
}

// Signed in only (null otherwise, and while the session loads); "locked" on the free plan
export const useAdcvdLookup = (code: string | null | undefined, country: string | null | undefined) => {
  const { user } = useUser()
  return useLookup<AdcvdLookup>("full", code, country, Boolean(user))
}

export const useAdcvdSummary = (code: string | null | undefined, country: string | null | undefined, enabled = true) =>
  useLookup<AdcvdSummary>("summary", code, country, enabled)

// The lookup when it's in, null otherwise (loading, failed or signed out)
export const useAdcvd = (code: string | null | undefined, country: string | null | undefined) => {
  const state = useAdcvdLookup(code, country)
  return typeof state === "object" ? state : null
}

export const lookupOf = <T,>(state: AdcvdState<T>): T | null => (state && typeof state === "object" ? state : null)
