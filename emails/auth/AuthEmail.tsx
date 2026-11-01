import { EmailLayout } from "../kit/Layout"
import { Cta, Eyebrow, P, Title } from "../kit/parts"
import { C } from "../kit/brand"
import { Link, Text } from "@react-email/components"

// The emails Supabase Auth sends (confirm sign-up, magic link, password reset, email change,
// invite), in the HTS Hero look. Supabase fills the {{ .ConfirmationURL }}-style placeholders, so
// these are exported as HTML (`npm run email:auth`) and pasted into the Supabase dashboard
// (Authentication → Email Templates). Each says what's waiting on the other side of the button.
//
// The sign-in email is code only: the page is waiting for it. Supabase sends new accounts the confirm
// email however they signed up, password or code, so that one leads with the button and keeps the
// code as the backup. Plain HTML, one document per template: nothing here depends on Supabase's
// template conditions.
//
// One follows the app rather than Supabase's default link: the reset email opens /reset-password with a token
// hash, verified only when the person presses the button there, so an email scanner opening the
// link doesn't use it up.

export type AuthKind = "confirm" | "magic_link" | "reset" | "email_change" | "invite"

const CONFIRMATION_URL = "{{ .ConfirmationURL }}"
const RESET_URL = "{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}"

export const AUTH_EMAILS: Record<
  AuthKind,
  { subject: string; eyebrow: string; title: string; body: string; button?: string; preview: string; href?: string; backupCode?: boolean }
> = {
  // Everyone who signs up gets this one, from any page, so it promises nothing about one product:
  // the link brings them back to wherever they were headed
  confirm: {
    subject: "Confirm your HTS Hero email",
    eyebrow: "Almost there!",
    title: "Confirm your email",
    body: "Tap the button below to confirm your email.",
    button: "Confirm my email",
    preview: "Tap the button to confirm your email and get started.",
    backupCode: true,
  },
  magic_link: {
    subject: "Your HTS Hero sign-in code",
    eyebrow: "Sign in",
    title: "Your sign-in code",
    body: "Enter this code on the sign-in page and you're in. It works once and expires in 30 minutes.",
    preview: "Your HTS Hero sign-in code: {{ .Token }}",
  },
  reset: {
    subject: "Reset your HTS Hero password",
    eyebrow: "Password reset",
    title: "Reset your password",
    body: "Here is your password reset link. If you didn't request this, you can safely ignore this email.",
    button: "Choose a new password",
    preview: "Choose a new password for your HTS Hero account.",
    href: RESET_URL,
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
    body: "Accept the invitation to set up your account. Once in, you'll have access to our Tariff Calculator, Duty Guard, and Classificaion Assistant.",
    button: "Accept the invitation",
    preview: "Accept your invitation to HTS Hero.",
  },
}

export default function AuthEmail({ kind = "confirm" }: { kind?: AuthKind }) {
  const e = AUTH_EMAILS[kind]
  const href = e.href ?? CONFIRMATION_URL
  return (
    <EmailLayout preview={e.preview} footer={{ reason: "You're getting this because of a request made with this email address on htshero.com." }}>
      <Eyebrow>{e.eyebrow}</Eyebrow>
      <Title>{e.title}</Title>
      <P>{e.body}</P>
      {!e.button && (
        <Text
          style={{
            margin: "8px 0 20px",
            padding: "14px 0",
            textAlign: "center",
            fontSize: 30,
            lineHeight: "36px",
            fontWeight: 700,
            letterSpacing: "8px",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            color: C.text,
            backgroundColor: C.soft,
            borderRadius: 8,
          }}
        >
          {"{{ .Token }}"}
        </Text>
      )}
      {e.button && (
        <>
          <Cta href={href} variant="next">
            {e.button}
          </Cta>
          <Text style={{ margin: "4px 0 0", fontSize: 12, lineHeight: "18px", color: C.muted }}>
            Button not working?{" "}
            {e.backupCode && (
              <>
                Enter this code where you signed up: <strong style={{ color: C.text }}>{"{{ .Token }}"}</strong>. Or{" "}
              </>
            )}
            {e.backupCode ? "copy" : "Copy"} this link:{" "}
            <Link href={href} style={{ color: C.cobalt, wordBreak: "break-all" }}>
              {href}
            </Link>
          </Text>
        </>
      )}
    </EmailLayout>
  )
}

AuthEmail.PreviewProps = { kind: "confirm" as AuthKind }
