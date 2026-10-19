"use client"

import { useEffect, useMemo, useState } from "react"
import { matchCases, strongest, type AdcvdLevel, type MatchableCase } from "@/libs/adcvd/match"
import { confirmedCases, ruledOutCases, useAllAdcvdAnswers } from "./useAdcvdAnswers"

// How an import is flagged: the strongest match among the cases the user hasn't ruled out, and
// whether they said one of them covers their product
export interface AdcvdMark {
  level: Exclude<AdcvdLevel, "history">
  applies: boolean
}

// Which of a catalog's imports may be covered by AD/CVD cases, for the Tracker's chips: the live
// cases of the catalog's countries (/api/adcvd/index), matched in the browser. Key "code-country"
// → its mark (history isn't chipped; cases the user ruled out don't count).
export const useCatalogAdcvd = (items: { key: string; code: string; country: string }[]) => {
  const countries = useMemo(() => Array.from(new Set(items.map((i) => i.country))).sort().join(","), [items])
  const [cases, setCases] = useState<MatchableCase[] | null>(null)
  useEffect(() => {
    if (!countries) return
    let live = true
    fetch(`/api/adcvd/index?countries=${countries}`)
      .then((r): Promise<{ cases: MatchableCase[] }> | null => (r.ok ? r.json() : null))
      .then((d) => live && setCases(d?.cases ?? []))
      .catch(() => live && setCases([]))
    return () => {
      live = false
    }
  }, [countries])
  const answersOf = useAllAdcvdAnswers()
  return useMemo(() => {
    const out = new Map<string, AdcvdMark>()
    if (!cases?.length) return out
    for (const item of items) {
      const answers = answersOf(item.code, item.country)
      const ruledOut = ruledOutCases(answers)
      const confirmed = confirmedCases(answers)
      const matches = matchCases(cases, { code: item.code, country: item.country }).filter((m) => m.level !== "history" && !ruledOut.has(m.case_number))
      const level = strongest(matches.map((m) => m.level))
      if (level && level !== "history") out.set(item.key, { level, applies: matches.some((m) => confirmed.has(m.case_number)) })
    }
    return out
  }, [cases, items, answersOf])
}
