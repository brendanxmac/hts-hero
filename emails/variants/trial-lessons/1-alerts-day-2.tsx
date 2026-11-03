import TrialEducationEmail from "../../onboarding/TrialEducationEmail"

// Preview only, never sent: the copy is in emails/onboarding/TrialEducationEmail.tsx
export default function Preview() {
  return <TrialEducationEmail {...TrialEducationEmail.PreviewProps} lesson="alerts" daysLeft={5} />
}
