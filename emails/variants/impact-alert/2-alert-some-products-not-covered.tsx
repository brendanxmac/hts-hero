import ImpactAlertEmail from "../../tariff-updates/ImpactAlertEmail"

// Preview only, never sent: the copy is in emails/tariff-updates/ImpactAlertEmail.tsx
const sample = ImpactAlertEmail.PreviewProps

export default function Preview() {
  return <ImpactAlertEmail {...sample} paid beyond={3} limit={10} />
}
