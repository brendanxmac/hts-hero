import NewsConfirmEmail from "../../tariff-updates/NewsConfirmEmail"

// Preview only, never sent: the copy is in emails/tariff-updates/NewsConfirmEmail.tsx
export default function Preview() {
  return <NewsConfirmEmail {...NewsConfirmEmail.PreviewProps} frequency="instant" />
}
