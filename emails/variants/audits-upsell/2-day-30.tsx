import AuditsUpsellEmail from "../../onboarding/AuditsUpsellEmail"

// Preview only, never sent: the copy is in emails/onboarding/AuditsUpsellEmail.tsx
export default function Preview() {
  return <AuditsUpsellEmail {...AuditsUpsellEmail.PreviewProps} step={2} />
}
