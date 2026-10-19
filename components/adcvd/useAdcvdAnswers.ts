"use client"

import { useCallback } from "react"
import { htsCodeDigitsOnly } from "@/libs/hts-code"
import type { AdcvdFlag } from "@/libs/adcvd/match"
import type { AdcvdAnswer } from "@/components/tariff-tracker/adjustments"
import { getCatalog, setProductAdjustments, useCatalog } from "@/components/tariff-tracker/catalogStore"

// What the user said about each AD/CVD case on one import (is it their product, who made it),
// kept with the product's other adjustments, so it's saved to their account with the catalog
// (catalogSync) and comes back on any device

export const caseKey = (f: AdcvdFlag) => f.cases.map((c) => c.case_number).join(",")

export const useAdcvdAnswers = (code: string, country: string) => {
  const key = `${htsCodeDigitsOnly(code)}-${country}`
  const answers = useCatalog().adjustments[key]?.adcvd ?? {}
  const set = (f: AdcvdFlag, patch: AdcvdAnswer) => {
    const current = getCatalog().adjustments[key]?.adcvd ?? {}
    setProductAdjustments(key, { adcvd: { ...current, [caseKey(f)]: { ...current[caseKey(f)], ...patch } } })
  }
  return { of: (f: AdcvdFlag): AdcvdAnswer => answers[caseKey(f)] ?? {}, set }
}

// ── The answers elsewhere in the Tracker ──
// A case the user ruled out ("No, that's not my product") no longer flags the import anywhere; one
// they said is theirs is marked as applying, with the deposit for the company they picked.

type ProductAnswers = Record<string, AdcvdAnswer>

const caseNumbersWith = (answers: ProductAnswers, test: (a: AdcvdAnswer) => boolean) =>
  new Set(Object.entries(answers).flatMap(([key, a]) => (test(a) ? key.split(",") : [])))

// Case numbers the user ruled out, and ones they said cover their product
export const ruledOutCases = (answers: ProductAnswers) => caseNumbersWith(answers, (a) => a.answer === "no")
export const confirmedCases = (answers: ProductAnswers) => caseNumbersWith(answers, (a) => a.answer === "yes")

// Every product's answers, by product key ("7326908688-CN")
export const useAllAdcvdAnswers = () => {
  const adjustments = useCatalog().adjustments
  return useCallback((code: string, country: string): ProductAnswers => adjustments[`${htsCodeDigitsOnly(code)}-${country}`]?.adcvd ?? {}, [adjustments])
}

// One import's cases, without the ones the user ruled out
export const useOpenFlags = <F extends AdcvdFlag>(code: string, country: string, flags: F[] | undefined) => {
  const { of } = useAdcvdAnswers(code, country)
  return flags?.filter((f) => of(f).answer !== "no")
}
