import OnboardingEmail from "../../onboarding/OnboardingEmail"

// Preview only, never sent: the copy is in emails/onboarding/OnboardingEmail.tsx
export default function Preview() {
  return <OnboardingEmail {...OnboardingEmail.PreviewProps} step={3} />
}
