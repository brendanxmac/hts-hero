import ImpactAlertEmail from "../../tariff-updates/ImpactAlertEmail"
import { AUTHORITIES } from "../../../libs/tariff-updates/types"

// Preview only, never sent: the copy is in emails/tariff-updates/ImpactAlertEmail.tsx
const sample = ImpactAlertEmail.PreviewProps
const adcvd = { ...sample.update, title: "Antidumping duty order on steel threaded rod from India", authorityLabel: AUTHORITIES.ad_cvd }
const likely = sample.imports.map((i) => ({ ...i, level: "likely" as const, beforePct: null as number | null, afterPct: null as number | null }))

export default function Preview() {
  return <ImpactAlertEmail {...sample} paid update={adcvd} imports={likely} beyond={0} />
}
