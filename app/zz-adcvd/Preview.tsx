"use client"

import { ModuleSections } from "@/components/ui/Card"
import type { AdcvdLookup } from "@/libs/adcvd/match"
import { AdcvdResults } from "@/components/adcvd/AdcvdTab"

// Temporary, local only (see page.tsx): the AD/CVD tab's results in the module layout, as the
// calculator and an import's page show them
export default function Preview({ data, code, country }: { data: AdcvdLookup; code: string; country: string }) {
  return (
    <div className="hts-tracker hts-theme">
      <ModuleSections>
        <AdcvdResults data={data} code={code} country={country} customsValue={10000} dutyUsd={1250} />
      </ModuleSections>
    </div>
  )
}
