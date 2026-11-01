import TrialEmail from "../../onboarding/TrialEmail"

// Preview only, never sent: the copy is in emails/onboarding/TrialEmail.tsx
export default function Preview() {
  return <TrialEmail {...TrialEmail.PreviewProps} variant="winback" daysLeft={-7} actionsThisMonth={14} />
}
