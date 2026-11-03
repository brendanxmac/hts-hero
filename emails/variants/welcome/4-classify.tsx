import WelcomeEmail from "../../account/WelcomeEmail"

// Preview only, never sent: the copy is in emails/account/WelcomeEmail.tsx
export default function Preview() {
  return <WelcomeEmail {...WelcomeEmail.PreviewProps} entry="classify" />
}
