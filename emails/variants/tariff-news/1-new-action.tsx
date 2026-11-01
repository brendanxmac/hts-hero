import TariffNewsEmail from "../../tariff-updates/TariffNewsEmail"

// Preview only, never sent: the copy is in emails/tariff-updates/TariffNewsEmail.tsx
export default function Preview() {
  return <TariffNewsEmail {...TariffNewsEmail.PreviewProps} step={null} />
}
