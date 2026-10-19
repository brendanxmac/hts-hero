"use client"

import * as tt from "@/components/ui/styles/tracker"
import type { AdcvdLevel } from "@/libs/adcvd/match"
import { useAdcvd } from "./useAdcvd"
import { useAdcvdAnswers, useOpenFlags } from "./useAdcvdAnswers"

// The chip for an import an AD/CVD case may cover (DESIGN_SYSTEM §15: amber, a heads-up), red once
// the user has said a case covers their product. Cases they ruled out don't count.
export const AdcvdChipFor = ({ level, applies = false }: { level: Exclude<AdcvdLevel, "history"> | null | undefined; applies?: boolean }) =>
  level ? (
    <span
      className={tt.chip(applies ? "error" : "warning")}
      title={
        applies
          ? "You said an AD/CVD case covers this import: a deposit is due at entry"
          : level === "likely"
            ? "An AD/CVD case's scope lists this code for this country"
            : "An AD/CVD case on this country may cover this code"
      }
    >
      {applies ? "AD/CVD applies" : "AD/CVD"}
    </span>
  ) : null

// The chip for one import, looked up on its own (the import's header)
export const AdcvdChip = ({ code, country }: { code: string; country: string }) => {
  const data = useAdcvd(code, country)
  const { of } = useAdcvdAnswers(code, country)
  const flags = useOpenFlags(code, country, data?.flags.filter((f) => f.level !== "history")) ?? []
  const level = flags.find((f) => f.level === "likely")?.level ?? flags.find((f) => f.level === "possible")?.level ?? null
  return <AdcvdChipFor level={level as Exclude<AdcvdLevel, "history"> | null} applies={flags.some((f) => of(f).answer === "yes")} />
}
