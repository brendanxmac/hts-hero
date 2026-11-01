import ImpactAlertEmail from "../../tariff-updates/ImpactAlertEmail"

// Preview only, never sent: the copy is in emails/tariff-updates/ImpactAlertEmail.tsx
const sample = ImpactAlertEmail.PreviewProps
const confirmed = [{ ...sample.imports[0], nowConfirmed: true }]

export default function Preview() {
  return <ImpactAlertEmail {...sample} paid imports={confirmed} beyond={0} />
}
