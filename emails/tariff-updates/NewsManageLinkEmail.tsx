import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Eyebrow, P, Title } from "../kit/parts"

// When an address that's already subscribed is entered again: a link to change its choices
// (the form itself never changes a confirmed subscription).

export interface NewsManageLinkEmailProps {
  manageUrl: string
  footer: EmailFooter
}

export const newsManageLinkSubject = () => "Change your US tariff updates"

export default function NewsManageLinkEmail({ manageUrl, footer }: NewsManageLinkEmailProps) {
  return (
    <EmailLayout preview="You're already subscribed. Change what you get here." footer={footer}>
      <Eyebrow>You&apos;re already subscribed</Eyebrow>
      <Title>Change your tariff updates</Title>
      <P>This address already gets US tariff updates from HTS Hero. Choose how often, and which laws and countries, here:</P>
      <Cta href={manageUrl}>Change my updates</Cta>
    </EmailLayout>
  )
}

NewsManageLinkEmail.PreviewProps = {
  manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
  footer: { reason: "You're getting this because someone asked to change the tariff updates sent to this address." },
} satisfies NewsManageLinkEmailProps
