import ClassifyOnboardingEmail from "../../onboarding/ClassifyOnboardingEmail"

// Preview only, never sent: the copy is in emails/onboarding/ClassifyOnboardingEmail.tsx
export default function Preview() {
  return <ClassifyOnboardingEmail {...ClassifyOnboardingEmail.PreviewProps} step={1} />
}
