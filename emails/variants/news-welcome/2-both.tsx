import NewsWelcomeEmail from "../../tariff-updates/NewsWelcomeEmail"

// Preview only, never sent: the copy is in emails/tariff-updates/NewsWelcomeEmail.tsx
export default function Preview() {
  return <NewsWelcomeEmail {...NewsWelcomeEmail.PreviewProps} frequency="both" />
}
