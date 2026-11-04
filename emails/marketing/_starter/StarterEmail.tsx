import { EmailLayout } from "../../kit/Layout"
import { Cta, Eyebrow, P, ReplyNote, Signature, Title } from "../../kit/parts"
import { siteLink } from "../../kit/brand"
import { MARKETING_PREVIEW_FOOTER, type MarketingEmailProps } from "../../kit/marketing"

// Copy this file into emails/marketing/<campaign>/ to start a new marketing email. This folder
// starts with "_", so the Content Studio leaves it out. emails/kit/marketing.ts has the rules.

export const subject = "Your subject here"
export const preview = "The line inboxes show after the subject"

const CAMPAIGN = "starter"

export default function StarterEmail({ footer, preview }: MarketingEmailProps) {
  return (
    <EmailLayout preview={preview} footer={footer}>
      <Eyebrow>New in HTS Hero</Eyebrow>
      <Title>Your headline</Title>
      <P>Lead with the value: what changed for them, in a sentence or two.</P>
      <Cta href={siteLink("/duty-guard", CAMPAIGN)} variant="next">
        Try it free &rarr;
      </Cta>
      <ReplyNote />
      <Signature />
    </EmailLayout>
  )
}

StarterEmail.PreviewProps = { footer: MARKETING_PREVIEW_FOOTER, preview } satisfies MarketingEmailProps
