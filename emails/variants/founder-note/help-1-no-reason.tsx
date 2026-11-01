import FounderNoteEmail from "../../onboarding/FounderNoteEmail"

// Preview only, never sent: the copy is in emails/onboarding/FounderNoteEmail.tsx
export default function Preview() {
  return <FounderNoteEmail {...FounderNoteEmail.PreviewProps} variant="help" skipReason={null} />
}
