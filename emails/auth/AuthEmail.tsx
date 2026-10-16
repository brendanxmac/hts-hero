import { EmailLayout } from "../kit/Layout"
import { Cta, Eyebrow, P, Title } from "../kit/parts"
import { C } from "../kit/brand"
import { Link, Text } from "@react-email/components"
import { SAVINGS_ENABLED } from "../../libs/tariff-tracker/features"

// The emails Supabase Auth sends (confirm sign-up, magic link, password reset, email change,
// invite), in the HTS Hero look. Supabase fills the {{ .ConfirmationURL }}-style placeholders, so
// these are exported as HTML (`npm run email:auth`) and pasted into the Supabase dashboard
// (Authentication → Email Templates). Each says what's waiting on the other side of the button.

export type AuthKind = "confirm" | "magic_link" | "reset" | "email_change" | "invite"

const URL = "{{ .ConfirmationURL }}"

export const AUTH_EMAILS: Record<AuthKind, { subject: string; eyebrow: string; title: string; body: string; button: string; preview: string }> = {
  confirm: {
    subject: "Confirm your email to open your Tariff Tracker",
    eyebrow: "One step left",
    title: "Confirm your email",
    // The Tracker MVP (features.ts): no savings line while savings are off
    body: SAVINGS_ENABLED
      ? "Confirm this address to access Tariff Tracker. Then, add your HTS codes and countries, and see every duty, change, and possible saving on each import."
      : "Confirm this address to access Tariff Tracker. Then, add your HTS codes and countries, see every duty on each import, and get an alert when a tariff change hits one.",
    button: "Confirm and open Tariff Tracker",
    preview: "Confirm your email to access Tariff Tracker.",
  },
  magic_link: {
    subject: "Your HTS Hero sign-in link",
    eyebrow: "Sign in",
    title: "Your sign-in link",
    body: "Use this button to sign in to HTS Hero. It works once and expires soon.",
    button: "Sign in to HTS Hero",
    preview: "Your one-time sign-in link for HTS Hero.",
  },
  reset: {
    subject: "Reset your HTS Hero password",
    eyebrow: "Password reset",
    title: "Reset your password",
    body: "Someone asked to reset the password for this HTS Hero account. If it was you, choose a new one here. If not, you can ignore this email: nothing changes.",
    button: "Choose a new password",
    preview: "Choose a new password for your HTS Hero account.",
  },
  email_change: {
    subject: "Confirm your new email for HTS Hero",
    eyebrow: "Email change",
    title: "Confirm your new email",
    body: "Confirm that {{ .NewEmail }} should be the email for your HTS Hero account. Until you do, sign in with {{ .Email }}.",
    button: "Confirm my new email",
    preview: "Confirm the new email address for your HTS Hero account.",
  },
  invite: {
    subject: "You're invited to HTS Hero",
    eyebrow: "Invitation",
    title: "You've been invited to HTS Hero",
    body: SAVINGS_ENABLED
      ? "Accept to set up your account. The Tariff Tracker shows every duty on the imports you add, alerts you when tariffs change, and finds where you could pay less."
      : "Accept to set up your account. The Tariff Tracker shows every duty on the imports you add, alerts you when tariffs change, and shows exactly how any tariff action affects each one.",
    button: "Accept the invitation",
    preview: "Accept your invitation to HTS Hero.",
  },
}

export default function AuthEmail({ kind = "confirm" }: { kind?: AuthKind }) {
  const e = AUTH_EMAILS[kind]
  return (
    <EmailLayout preview={e.preview} footer={{ reason: "You're getting this because of a request made with this email address on htshero.com." }}>
      <Eyebrow>{e.eyebrow}</Eyebrow>
      <Title>{e.title}</Title>
      <P>{e.body}</P>
      <Cta href={URL} variant="next">
        {e.button}
      </Cta>
      <Text style={{ margin: "4px 0 0", fontSize: 12, lineHeight: "18px", color: C.muted }}>
        Button not working? Copy this link: <Link href={URL} style={{ color: C.cobalt, wordBreak: "break-all" }}>{URL}</Link>
      </Text>
    </EmailLayout>
  )
}

AuthEmail.PreviewProps = { kind: "confirm" as AuthKind }
