import ImpactAlertEmail from "../../tariff-updates/ImpactAlertEmail"

// Preview only, never sent: the copy is in emails/tariff-updates/ImpactAlertEmail.tsx
const sample = ImpactAlertEmail.PreviewProps
const removed = [{ code: "8413.91.90.15", country: "Brazil", description: "Parts of pumps" }]

export default function Preview() {
  return <ImpactAlertEmail {...sample} paid imports={[]} removed={removed} beyond={0} />
}
