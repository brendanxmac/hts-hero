import type { ComponentType } from "react"
import type { EmailFooter } from "./Layout"

// Marketing emails: one-off campaigns written as files under emails/marketing/<campaign>/ and sent
// from the Content Studio's Marketing Emails tab. Each file:
//
//   export const subject = "…"        the subject the studio starts from (you can change it there)
//   export const preview = "…"        the inbox preview line it starts from
//   export default function MyEmail({ footer, preview }: MarketingEmailProps) { … }
//   MyEmail.PreviewProps = { footer: MARKETING_PREVIEW_FOOTER, preview } satisfies MarketingEmailProps
//
// Pass `preview` to EmailLayout so the studio's preview line is the one inboxes show. Folders
// starting with "_" (emails/marketing/_starter) are left out of the studio: copy from them.

export interface MarketingEmailProps {
  footer: EmailFooter
  preview: string
}

export interface MarketingModule {
  default: ComponentType<MarketingEmailProps>
  subject?: string
  preview?: string
  // Outbox template names it was sent under before it moved here: their recipients count as having it
  alsoSentAs?: string[]
}

// Outbox template names for marketing emails: "marketing:<campaign>/<File>"
export const MARKETING_PREFIX = "marketing:"

// For PreviewProps (the React Email dev server) and test sends
export const MARKETING_PREVIEW_FOOTER: EmailFooter = {
  reason: "You're getting this because you have an HTS Hero account.",
  manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
  unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
}
